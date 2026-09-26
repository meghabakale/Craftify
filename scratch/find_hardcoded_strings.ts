import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const srcDir = path.resolve('src');

const IGNORED_ATTRIBUTES = new Set([
  'id', 'className', 'class', 'src', 'href', 'key', 'type', 'name', 'rel',
  'referrerPolicy', 'role', 'tabIndex', 'method', 'step', 'min', 'max',
  'autoComplete', 'htmlFor', 'value', 'color', 'size', 'variant', 'view',
  'tab', 'initialTab', 'status', 'outcome', 'code', 'category', 'sku',
  'target', 'width', 'height', 'fill', 'stroke', 'd', 'viewBox', 'align',
  'valign', 'colSpan', 'rowSpan', 'encType', 'accept', 'autoCapitalize',
  'autoCorrect', 'spellCheck', 'dir', 'lang', 'style'
]);

// UI Attribute names that definitely take user-facing text
const UI_ATTRIBUTES = new Set([
  'placeholder', 'title', 'alt', 'aria-label', 'label', 'header', 'subtitle',
  'heading', 'tooltip', 'errorMessage', 'message', 'warning', 'prompt',
  'confirmText', 'cancelText', 'description', 'badgeText', 'buttonText',
  'toast', 'helperText', 'emptyText'
]);

function getAllFiles(dir: string, ext = '.tsx'): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, ext));
    } else if (filePath.endsWith(ext)) {
      results.push(filePath);
    }
  });
  return results;
}

interface HardcodedMatch {
  file: string;
  line: number;
  type: 'JsxText' | 'Attribute' | 'StringInJsxExpr';
  attrName?: string;
  text: string;
}

function analyzeFile(filePath: string): HardcodedMatch[] {
  const matches: HardcodedMatch[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  function isInsideTranslationCall(node: ts.Node): boolean {
    let parent = node.parent;
    while (parent) {
      if (
        ts.isCallExpression(parent) &&
        (
          (ts.isIdentifier(parent.expression) && parent.expression.text === 't') ||
          (ts.isPropertyAccessExpression(parent.expression) && parent.expression.name.text === 't') ||
          (ts.isIdentifier(parent.expression) && parent.expression.text.startsWith('localize'))
        )
      ) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  function getLineNumber(pos: number): number {
    return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
  }

  function visit(node: ts.Node) {
    // 1. JSX Text
    if (ts.isJsxText(node)) {
      const text = node.getText().trim();
      // Ignore if text is empty, whitespace only, or only punctuation/symbols/numbers
      if (text && /[a-zA-Z]/.test(text) && !/^[0-9\s.,\/\\()\-+:#$&%*!]+$/.test(text)) {
        // Exclude if it looks like code or raw template variable
        if (!text.startsWith('{') && !text.endsWith('}')) {
          matches.push({
            file: filePath,
            line: getLineNumber(node.getStart()),
            type: 'JsxText',
            text: text.replace(/\s+/g, ' '),
          });
        }
      }
    }

    // 2. JSX Attribute (e.g., placeholder="Search", title="Header")
    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText();
      if (UI_ATTRIBUTES.has(attrName) || !IGNORED_ATTRIBUTES.has(attrName)) {
        if (node.initializer && ts.isStringLiteral(node.initializer)) {
          const text = node.initializer.text.trim();
          if (text && /[a-zA-Z]/.test(text) && !isInsideTranslationCall(node)) {
            // Check if it's UI attribute or generic text prop
            if (UI_ATTRIBUTES.has(attrName) || /^[A-Z][a-zA-Z0-9\s.,!?-]+$/.test(text)) {
              matches.push({
                file: filePath,
                line: getLineNumber(node.getStart()),
                type: 'Attribute',
                attrName,
                text,
              });
            }
          }
        }
      }
    }

    // 3. String literals inside JSX Expressions (e.g. {isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'})
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = node.text.trim();
      if (text && /[a-zA-Z]/.test(text)) {
        // Check if inside JSX element or JSX attribute
        let inJsx = false;
        let p: ts.Node | undefined = node.parent;
        while (p) {
          if (ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p) || ts.isJsxAttribute(p)) {
            inJsx = true;
            break;
          }
          p = p.parent;
        }

        if (inJsx && !isInsideTranslationCall(node)) {
          // Check if parent is a ConditionalExpression or BinaryExpression or CallExpression like showToast("...")
          let isUIContext = false;
          let curr: ts.Node | undefined = node.parent;
          while (curr && curr !== p) {
            if (ts.isConditionalExpression(curr) || ts.isBinaryExpression(curr) || ts.isArrayLiteralExpression(curr)) {
              isUIContext = true;
              break;
            }
            if (ts.isCallExpression(curr)) {
              const fnName = curr.expression.getText();
              if (fnName.includes('showToast') || fnName.includes('alert') || fnName.includes('setError') || fnName.includes('setSuccess')) {
                isUIContext = true;
                break;
              }
            }
            curr = curr.parent;
          }

          if (isUIContext && text.length > 1 && !/^[a-z0-9_\-\.\/]+$/i.test(text) === false) {
            // Only if text looks like UI natural language (has space or capitalized or user facing message)
            if (text.includes(' ') || /^[A-Z]/.test(text)) {
              matches.push({
                file: filePath,
                line: getLineNumber(node.getStart()),
                type: 'StringInJsxExpr',
                text,
              });
            }
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return matches;
}

const allFiles = getAllFiles(srcDir, '.tsx');
const fileResults: Record<string, HardcodedMatch[]> = {};
let totalCount = 0;

allFiles.forEach((file) => {
  const matches = analyzeFile(file);
  if (matches.length > 0) {
    const relativePath = path.relative(process.cwd(), file).replace(/\\/g, '/');
    fileResults[relativePath] = matches;
    totalCount += matches.length;
  }
});

console.log(JSON.stringify({ totalCount, fileResults }, null, 2));
