import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { MOCK_CAMPAIGNS, MOCK_PRODUCTS, INITIAL_USER_PLEDGES, INITIAL_USER } from "./src/data/mockData";
import { MOCK_CUSTOMER_ORDERS } from "./src/data/mockOrders";
import { DEFAULT_PENDING_CAMPAIGNS, DEFAULT_ADMIN_USERS } from "./src/data/adminData";

dotenv.config();

const PORT = 3000;

// Lazy client initialization to avoid crashing on boot if key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required. Please configure it in the Settings > Secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const DEFAULT_SYSTEM_INSTRUCTION = `You are Gemini, an intelligent, articulate, and deeply knowledgeable AI assistant integrated into Craftify — the premier hybrid crowdfunding and curated retail marketplace.

Your responsibilities and domains of expertise:
1. Craftify Platform Guide: Understand the all-or-nothing escrow covenant where backer funds are held as pre-authorizations (charged $0 until 100% threshold is met by deadline). Understand the 5% platform fee, 3% processing fee, and 92% net creator milestone payout.
2. Crowdfunding Strategist: Advise creators on structuring compelling project narratives, crafting reward tiers, setting realistic funding goals, scheduling production runs, and planning shop graduation.
3. Retail & Backer Concierge: Help patrons explore graduated products with verified backer pedigree, explain warranty coverage, and recommend precision tools, heirloom decor, and technical gear.
4. General Gemini Superpowers: Offer full multimodal reasoning, writing, coding, financial calculations, brainstorms, and structured outlines.

Format your responses with clean typography, clear bulleted points, bold highlights, and markdown tables or code blocks where appropriate. Maintain an encouraging, sophisticated, and authentic tone.`;

const DESCRIPTION_SYSTEM_INSTRUCTION = `You are Kaarigar's Master Artisan Storyteller, Cultural Historian, and Expert Copy Editor. Your mission is to help Indian craftspeople and patrons celebrate indigenous artisanal traditions by crafting evocative, culturally authentic, and grammatically flawless product and campaign descriptions.

CORE DIRECTIVES:
1. Storytelling Tone: Write with warmth, cultural reverence, and sensory richness. Highlight generational techniques, indigenous materials, tactile nuances, and geographical provenance. Strictly avoid corporate jargon or cheap hype words.
2. Grammatical Completeness: Every sentence and line must be 100% syntactically complete with correct subject-verb agreement and proper tense consistency. Every thought must finish with a terminal punctuation mark ('.' or '!'). Never produce trailing fragments, dangling phrases, or ellipses.

FEW-SHOT PROMPT EXAMPLES:

--- EXAMPLE 1: Full Storytelling Narrative ---
User Request:
Craft Tradition: Terracotta Pottery
Materials Used: Gangetic alluvial clay, natural ochre slip
Artisan Region: Khurja, Uttar Pradesh
Keywords: traditional potter's wheel, wood-fired kiln, porous cooling texture

Ideal Response:
Born from the alluvial soil of the Gangetic plains, this handcrafted terracotta vessel carries the sun-drenched spirit and ancestral rhythms of Khurja, Uttar Pradesh. Each curve is coaxed into existence on a traditional kick wheel by master artisans whose families have tended the earth and flame across five generations. The surface is brushed with a delicate, mineral-rich ochre slip before undergoing a slow firing in an earthen wood kiln, bestowing a warm, tactile patina that breathes with the natural porosity of raw clay.

Far more than a simple functional object, this piece embodies a quiet reverence for the soil and the slow alchemy of traditional craft. Subtle variations in flame-kissed hues ensure that no two vessels are ever identical, offering your living space a timeless artifact steeped in authentic northern Indian heritage.

--- EXAMPLE 2: Sentence Completion & Artisan Notes Polish ---
User Request:
Artisan Draft Text / Incomplete Lines: "spinning fine wool charkha on loom very warm butter touch"
Craft Tradition: Pashmina Weaving
Materials Used: Changthangi Cashmere Wool
Artisan Region: Srinagar, Jammu & Kashmir

Ideal Response:
Hand-spun from the delicate fleece of Changthangi goats on a traditional charkha and meticulously woven on a wooden handloom in Srinagar, this authentic Pashmina textile offers an exceptionally warm and butter-soft touch against the skin. Every thread carries centuries of Kashmiri heritage, embodying both exquisite artisanship and timeless elegance.`;

// Robust content generation with graceful fallback for transient model demand spikes (e.g. 503 Service Unavailable)
async function getStreamWithFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  contents: any[],
  systemInstruction: string
) {
  // Map any non-standard model aliases to official Google Gemini models
  const officialModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const initialModel = officialModels.includes(primaryModel) ? primaryModel : "gemini-2.5-flash";

  // Reliable fallback chain of active models in Google GenAI SDK
  const fallbackChain = [
    initialModel,
    ...officialModels
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastErr: any = null;
  for (let i = 0; i < fallbackChain.length; i++) {
    const modelCandidate = fallbackChain[i];
    try {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const stream = await ai.models.generateContentStream({
        model: modelCandidate,
        contents,
        config: {
          systemInstruction,
        },
      });
      return { stream, modelUsed: modelCandidate };
    } catch (err: any) {
      lastErr = err;
      const errMsg = err?.message || String(err);
      console.warn(`Model ${modelCandidate} stream error (attempt ${i + 1}/${fallbackChain.length}):`, errMsg);
      continue;
    }
  }
  throw lastErr;
}

async function getContentWithFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  contents: any[],
  systemInstruction: string
) {
  const officialModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const initialModel = officialModels.includes(primaryModel) ? primaryModel : "gemini-2.5-flash";

  const fallbackChain = [
    initialModel,
    ...officialModels
  ].filter((m, idx, arr) => arr.indexOf(m) === idx);

  let lastErr: any = null;
  for (let i = 0; i < fallbackChain.length; i++) {
    const modelCandidate = fallbackChain[i];
    try {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      const response = await ai.models.generateContent({
        model: modelCandidate,
        contents,
        config: {
          systemInstruction,
        },
      });
      return { response, modelUsed: modelCandidate };
    } catch (err: any) {
      lastErr = err;
      const errMsg = err?.message || String(err);
      console.warn(`Model ${modelCandidate} error (attempt ${i + 1}/${fallbackChain.length}):`, errMsg);
      continue;
    }
  }
  throw lastErr;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));

  // Proxy /api requests to Django DRF backend running on port 8000
  app.use("/api", async (req, res, next) => {
    if (req.path.startsWith("/chat") || req.path === "/health") {
      return next();
    }
    const queryString = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    let targetPath = req.path;
    if (!targetPath.endsWith("/")) {
      targetPath += "/";
    }
    const djangoUrl = `http://127.0.0.1:8000/api${targetPath}${queryString}`;

    try {
      const headers: Record<string, string> = {};
      if (req.headers.authorization) headers["Authorization"] = req.headers.authorization as string;
      if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"] as string;

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const djangoRes = await fetch(djangoUrl, fetchOptions);
      if (djangoRes.status < 500) {
        const contentType = djangoRes.headers.get("content-type") || "";
        res.status(djangoRes.status);
        if (contentType.includes("application/json")) {
          const json = await djangoRes.json();
          return res.json(json);
        } else {
          const text = await djangoRes.text();
          return res.send(text);
        }
      }
      next();
    } catch {
      next();
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      platform: "Craftify",
    });
  });

  // Streaming multi-turn chat endpoint
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const {
        messages = [],
        model = "gemini-2.5-flash",
        systemInstruction,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array cannot be empty." });
      }

      // Check API Key
      let ai: GoogleGenAI;
      try {
        ai = getGenAIClient();
      } catch (keyErr: any) {
        return res.status(401).json({
          error: keyErr.message || "GEMINI_API_KEY not configured.",
        });
      }

      // Format conversation contents for @google/genai
      const contents = messages
        .filter((m: any) => m && typeof m.content === "string" && m.content.trim())
        .map((m: any) => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.content.trim() }],
        }));

      if (contents.length === 0) {
        return res.status(400).json({ error: "No valid message contents found." });
      }

      // Setup SSE response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }

      const { stream: responseStream, modelUsed } = await getStreamWithFallback(
        ai,
        model || "gemini-3.8-flash",
        contents,
        systemInstruction || DEFAULT_SYSTEM_INSTRUCTION
      );

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(`data: ${JSON.stringify({ text: chunkText, modelUsed })}\n\n`);
          if (typeof (res as any).flush === "function") {
            (res as any).flush();
          }
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("Gemini streaming error:", err);
      // If headers not sent yet, send standard JSON
      if (!res.headersSent) {
        return res.status(500).json({
          error: err.message || "Internal error communicating with Gemini API.",
        });
      }
      // If already in SSE mode, send error event
      res.write(`data: ${JSON.stringify({ error: err.message || "Error generating response" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // Non-streaming fallback chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages = [],
        model = "gemini-2.5-flash",
        systemInstruction,
      } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array cannot be empty." });
      }

      const ai = getGenAIClient();

      const contents = messages
        .filter((m: any) => m && typeof m.content === "string" && m.content.trim())
        .map((m: any) => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.content.trim() }],
        }));

      const { response, modelUsed } = await getContentWithFallback(
        ai,
        model || "gemini-3.8-flash",
        contents,
        systemInstruction || DEFAULT_SYSTEM_INSTRUCTION
      );

      res.json({
        text: response.text || "",
        modelUsed,
      });
    } catch (err: any) {
      console.error("Gemini chat error:", err);
      res.status(500).json({
        error: err.message || "Internal error communicating with Gemini API.",
      });
    }
  });

  // Direct Gemini AI Handler for Description Writing & Grammatical Sentence Completion
  app.post(["/api/ai/generate-description", "/api/ai/generate-description/"], async (req, res) => {
    try {
      const ai = getGenAIClient();
      const { craft_type, material, region, keywords = "", draft_text = "", mode = "full_story" } = req.body || {};

      if (!craft_type?.trim() || !material?.trim() || !region?.trim()) {
        return res.status(400).json({ detail: "Please provide craft_type, material, and region." });
      }

      const isCompletion = mode === "complete_sentences" || (draft_text && draft_text.trim().length > 0 && mode !== "full_story");
      
      const prompt = isCompletion
        ? `You are an expert copy editor, linguist, and traditional Indian art historian.\n` +
          `An artisan has written draft notes or incomplete lines describing their handcrafted piece. ` +
          `Your task is to write and complete every sentence or line grammatically correctly, ` +
          `fleshing out partial thoughts while preserving the artisan's genuine voice.\n\n` +
          `Artisan's Draft Text / Incomplete Lines:\n"""\n${(draft_text || "").trim()}\n"""\n\n` +
          `Craft Details for Context:\n- Craft Tradition: ${craft_type}\n- Materials: ${material}\n- Region: ${region}\n- Key Elements: ${keywords}\n\n` +
          `STRICT GRAMMATICAL & SENTENCE COMPLETION RULES:\n` +
          `1. Write and complete every single sentence or line grammatically correctly with proper subject-verb agreement and tenses.\n` +
          `2. Complete all unfinished sentences, dangling clauses, or fragmented thoughts into full, articulate, polished sentences.\n` +
          `3. Ensure every single sentence ends with valid terminal punctuation (a period '.' or exclamation mark '!'). Never leave any sentence or line trailing.\n` +
          `4. Return ONLY the polished, grammatically complete paragraphs of text without markdown headings or greetings.`
        : `You are a master storyteller and traditional Indian art historian. Write an evocative, authentic, ` +
          `and grammatically impeccable 2-3 paragraph description for a handcrafted artisan piece:\n\n` +
          `- Craft: ${craft_type}\n- Materials: ${material}\n- Region: ${region}\n- Keywords: ${keywords}\n` +
          (draft_text ? `- Existing notes: ${draft_text}\n` : "") +
          `\nSTRICT GRAMMATICAL & SENTENCE COMPLETION RULES:\n` +
          `1. Write every single sentence and line with complete, flawless English grammar.\n` +
          `2. Every sentence MUST be completely finished — never truncate or leave any sentence or line incomplete. Every paragraph must conclude with a complete, fully formed sentence ending with a period ('.').\n` +
          `3. Return ONLY the 2-3 paragraphs of text without headings or markdown formatting.`;

      const { response } = await getContentWithFallback(
        ai,
        "gemini-3.1-flash-lite",
        [{ role: "user", parts: [{ text: prompt }] }],
        DESCRIPTION_SYSTEM_INSTRUCTION
      );

      if (response.text) {
        let cleaned = response.text.trim();
        if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
          cleaned = cleaned.split("\n").slice(1, -1).join("\n").trim();
        }
        if (!cleaned.endsWith(".") && !cleaned.endsWith("!") && !cleaned.endsWith("?")) {
          cleaned += ".";
        }
        return res.json({ description: cleaned });
      }

      throw new Error("Gemini returned empty text.");
    } catch (err: any) {
      console.error("Direct generate-description error:", err.message || err);
      // Fallback response with complete grammar
      const { craft_type, material, region, draft_text } = req.body || {};
      const fallbackDesc = draft_text && draft_text.trim()
        ? `Handcrafted with meticulous dedication in ${region || "India"}, this ${craft_type || "piece"} is shaped from authentic ${material || "natural materials"}. Every single detail is shaped with ancestral reverence, bringing timeless tradition and enduring grace to your collection.`
        : `Rooted in the storied heritage of ${region || "India"}, this handcrafted ${craft_type || "creation"} is sculpted from premium ${material || "natural materials"}. Every contour honors generational artisan wisdom, celebrating authentic Indian handicraft excellence.`;
      return res.json({ description: fallbackDesc });
    }
  });

  // Deterministic rule-based handler for Fair Price Suggestions (zero Gemini dependency)
  app.post(["/api/ai/suggest-price", "/api/ai/suggest-price/"], async (req, res) => {
    try {
      const { craft_type, material_cost, hours_spent, region = "", complexity_level } = req.body || {};

      if (!craft_type) {
        return res.status(400).json({ craft_type: ["This field is required."] });
      }
      if (material_cost === undefined || material_cost === null || material_cost === "") {
        return res.status(400).json({ material_cost: ["This field is required."] });
      }
      const numMat = Number(material_cost);
      if (isNaN(numMat) || numMat < 0) {
        return res.status(400).json({ material_cost: ["Ensure this value is greater than or equal to 0."] });
      }

      if (hours_spent === undefined || hours_spent === null || hours_spent === "") {
        return res.status(400).json({ hours_spent: ["This field is required."] });
      }
      const numHours = Number(hours_spent);
      if (isNaN(numHours) || numHours < 0) {
        return res.status(400).json({ hours_spent: ["Ensure this value is greater than or equal to 0."] });
      }

      const validComplexities = ["basic", "skilled", "master"];
      const compKey = String(complexity_level || "").toLowerCase().trim();
      if (!complexity_level || !validComplexities.includes(compKey)) {
        return res.status(400).json({ complexity_level: [`"${complexity_level}" is not a valid choice.`] });
      }

      const BASE_HOURLY_WAGE = 150;
      const CRAFT_COMPLEXITY_MULTIPLIERS: Record<string, number> = {
        basic: 1.0,
        skilled: 1.5,
        master: 2.2,
      };
      const REGION_COST_FACTORS: Record<string, number> = {
        "Karnataka": 1.0,
        "Maharashtra": 1.1,
        "Delhi": 1.1,
        "Tamil Nadu": 1.0,
      };

      const regionKey = String(region).trim();
      const regionFactor = REGION_COST_FACTORS[regionKey] || 1.0;
      const effectiveHourlyRate = BASE_HOURLY_WAGE * CRAFT_COMPLEXITY_MULTIPLIERS[compKey] * regionFactor;
      const laborValue = numHours * effectiveHourlyRate;
      const basePrice = numMat + laborValue;

      const priceRangeMin = Math.round((basePrice * 1.3) / 10) * 10;
      const priceRangeMax = Math.round((basePrice * 1.8) / 10) * 10;

      const rateStr = Number.isInteger(effectiveHourlyRate) ? String(effectiveHourlyRate) : effectiveHourlyRate.toFixed(1);
      const reasoning = `Based on ₹${numMat} in materials, ${numHours} hours of ${compKey}-level ${craft_type} work at an estimated ₹${rateStr}/hour, plus a standard markup for handmade goods.`;

      const CRAFT_PRICE_REFERENCE: Record<string, { min: number; max: number }> = {
        "block_printing": { min: 300, max: 1500 },
        "handloom_weaving": { min: 800, max: 5000 },
        "pottery": { min: 150, max: 2000 },
        "madhubani_painting": { min: 500, max: 8000 },
        "bamboo_craft": { min: 200, max: 3000 },
        "brass_jewellery": { min: 250, max: 4000 },
        "leatherwork": { min: 400, max: 3500 },
        "embroidery": { min: 350, max: 6000 },
      };

      const getMarketRef = (cType: string) => {
        const norm = String(cType || "").toLowerCase().trim().replace(/[- &]/g, "_");
        if (CRAFT_PRICE_REFERENCE[norm]) return CRAFT_PRICE_REFERENCE[norm];
        for (const [k, v] of Object.entries(CRAFT_PRICE_REFERENCE)) {
          if (norm.includes(k) || k.includes(norm)) return v;
        }
        if (norm.includes("block") || norm.includes("print")) return CRAFT_PRICE_REFERENCE["block_printing"];
        if (norm.includes("weav") || norm.includes("loom") || norm.includes("saree")) return CRAFT_PRICE_REFERENCE["handloom_weaving"];
        if (norm.includes("potter") || norm.includes("clay") || norm.includes("ceramic")) return CRAFT_PRICE_REFERENCE["pottery"];
        if (norm.includes("paint") || norm.includes("madhubani")) return CRAFT_PRICE_REFERENCE["madhubani_painting"];
        if (norm.includes("bamboo") || norm.includes("cane")) return CRAFT_PRICE_REFERENCE["bamboo_craft"];
        if (norm.includes("brass") || norm.includes("metal") || norm.includes("jewel") || norm.includes("dhokra")) return CRAFT_PRICE_REFERENCE["brass_jewellery"];
        if (norm.includes("leather") || norm.includes("jooti")) return CRAFT_PRICE_REFERENCE["leatherwork"];
        if (norm.includes("embroid") || norm.includes("stitch") || norm.includes("chikan")) return CRAFT_PRICE_REFERENCE["embroidery"];
        return { min: 200, max: 2000 };
      };

      const marketRef = getMarketRef(craft_type);

      return res.json({
        price_range_min: priceRangeMin,
        price_range_max: priceRangeMax,
        reasoning,
        market_reference_min: marketRef.min,
        market_reference_max: marketRef.max,
        market_reference_note: "Typical retail range for similar handmade items in this category",
      });
    } catch (err: any) {
      return res.status(500).json({ detail: "Error calculating price suggestion." });
    }
  });


  // Content-based / Rule-based recommendations endpoint
  app.post(["/api/ai/recommendations", "/api/ai/recommendations/"], async (req, res) => {
    const viewed = req.body?.viewed_categories || [];
    const limit = Math.min(Number(req.body?.limit) || 4, 10);

    // Local rule-based recommendation calculation
    const cleanedViewed = (Array.isArray(viewed) ? viewed : [])
      .map((v: any) => String(v).trim().toLowerCase())
      .filter(Boolean);

    const catalog = [
      { id: "prd-01", type: "product" as const, category: "Handmade Brass & Bronze", craft: "brass metal casting", name: "Brass Pooja Lamp" },
      { id: "prd-02", type: "product" as const, category: "Handloom Silk & Shawls", craft: "handloom silk weaving", name: "Banarasi Silk Saree" },
      { id: "cmp-01", type: "campaign" as const, category: "Textiles & Weaving", craft: "Chanderi handloom weaving", name: "Revive Chanderi Handloom" },
      { id: "cmp-02", type: "campaign" as const, category: "Pottery & Ceramics", craft: "Jaipur blue pottery", name: "Blue Pottery Studio Expansion" },
      { id: "prd-03", type: "product" as const, category: "Woodcraft & Carvings", craft: "sheesham wood carving", name: "Carved Teakwood Box" },
      { id: "cmp-03", type: "campaign" as const, category: "Woodcraft & Carvings", craft: "Saharanpur wood carving", name: "Heritage Wood Carving Workshop" },
    ];

    let scoredItems: Array<{ id: string; type: "product" | "campaign"; reason: string; score: number }> = [];

    if (cleanedViewed.length > 0) {
      for (const item of catalog) {
        const text = `${item.category} ${item.craft} ${item.name}`.toLowerCase();
        let score = 0;
        for (const cat of cleanedViewed) {
          if (text.includes(cat) || cat.includes(item.category.toLowerCase()) || cat.includes(item.craft.toLowerCase())) {
            score += 2;
          }
        }
        if (score > 0) {
          scoredItems.push({
            id: item.id,
            type: item.type,
            reason: `Because you viewed ${item.category} items`,
            score,
          });
        }
      }
    }

    // If fewer than 3 scored items, fallback to trending
    if (scoredItems.length < 3) {
      const trending = [
        { id: "prd-01", type: "product" as const, reason: "Popular in handcrafted brass" },
        { id: "cmp-01", type: "campaign" as const, reason: "Popular in Chanderi handloom" },
        { id: "prd-02", type: "product" as const, reason: "Popular in handloom silk" },
        { id: "cmp-02", type: "campaign" as const, reason: "Popular in blue pottery" },
      ];
      return res.json(trending.slice(0, limit));
    }

    scoredItems.sort((a, b) => b.score - a.score);
    return res.json(scoredItems.slice(0, limit).map(({ id, type, reason }) => ({ id, type, reason })));
  });

  // Helper formatters ensuring 100% schema alignment across frontend and API adapters
  function formatCampaignForApi(c: any) {
    const goal = Number(c.funding_goal || c.goalAmount || 100000);
    const raised = Number(c.amount_raised !== undefined ? c.amount_raised : (c.pledgedAmount !== undefined ? c.pledgedAmount : 0));
    const backers = Number(c.backers_count !== undefined ? c.backers_count : (c.backersCount || 0));
    const days = c.days_left !== undefined ? c.days_left : (c.daysLeft !== undefined ? c.daysLeft : 14);
    const img = c.image || c.imageUrl || "/images/products/jaipur-blue-pottery-tea-set.jpg";
    const craft = c.craft_type || c.craftHeritage || c.category || "Traditional Craft";
    const region = c.region_state || c.artisanRegion || c.creatorLocation || "India";
    const artisanName = typeof c.artisan === "object" ? c.artisan?.full_name : (c.creator || "Master Artisan");

    const rawTiers = c.reward_tiers || c.rewardTiers || [];
    const tiers = rawTiers.map((t: any, idx: number) => ({
      id: String(t.id || `tier-${idx + 1}`),
      title: t.title || `Reward Tier ${idx + 1}`,
      amount: Number(t.amount || t.pledgeAmount || 1000),
      pledgeAmount: Number(t.amount || t.pledgeAmount || 1000),
      description: t.description || "Patron reward supporting artisan guild.",
      estimated_delivery: t.estimated_delivery || t.estimatedDelivery || "Dec 2026",
      estimatedDelivery: t.estimated_delivery || t.estimatedDelivery || "Dec 2026",
      items_included: t.items_included || t.itemsIncluded || ["Handcrafted Artifact"],
      itemsIncluded: t.items_included || t.itemsIncluded || ["Handcrafted Artifact"],
      backers_count: Number(t.backers_count !== undefined ? t.backers_count : (t.backersCount || 0)),
      backersCount: Number(t.backers_count !== undefined ? t.backers_count : (t.backersCount || 0)),
      max_backers: t.max_backers || t.maxBackers,
      maxBackers: t.max_backers || t.maxBackers,
    }));

    return {
      ...c,
      id: String(c.id),
      title: c.title,
      slug: c.slug || String(c.id),
      description: c.description || c.shortDescription || "",
      short_description: c.short_description || c.shortDescription || c.description || "",
      shortDescription: c.shortDescription || c.short_description || c.description || "",
      full_story: c.full_story || c.fullStory || c.description || "",
      fullStory: c.fullStory || c.full_story || c.description || "",
      funding_goal: goal,
      goalAmount: goal,
      amount_raised: raised,
      pledgedAmount: raised,
      backers_count: backers,
      backersCount: backers,
      days_left: days,
      daysLeft: days,
      status: c.status || (raised >= goal ? "funded" : "in_progress"),
      image: img,
      imageUrl: img,
      gallery_images: c.gallery_images || c.galleryImages || [img],
      galleryImages: c.gallery_images || c.galleryImages || [img],
      craft_type: craft,
      craftHeritage: craft,
      region_state: region,
      artisanRegion: region,
      is_approved: c.is_approved !== false && c.isApproved !== false,
      isApproved: c.is_approved !== false && c.isApproved !== false,
      artisan: {
        id: 2,
        username: "artisan_craft",
        full_name: artisanName,
      },
      creator: artisanName,
      reward_tiers: tiers,
      rewardTiers: tiers,
      specs: c.specs || [
        { label: "Craft Origin", value: region },
        { label: "Craft Discipline", value: craft },
        { label: "Escrow Covenant", value: "100% Direct Milestone Settlement" },
      ],
      timeline: c.timeline || [
        { phase: "Raw Material Sourcing", date: "Phase 1", description: "Ethical procurement of raw stock" },
        { phase: "Artisan Production", date: "Phase 2", description: "Handcrafting backer pieces" },
        { phase: "Quality & Packing", date: "Phase 3", description: "GI authenticity inspection" },
        { phase: "Patron Dispatch", date: "Phase 4", description: "Direct delivery to conscious patrons" },
      ],
    };
  }

  function formatProductForApi(p: any) {
    const price = Number(p.price) || 2400;
    const stockCount = p.stock_quantity !== undefined ? p.stock_quantity : (p.stockCount !== undefined ? p.stockCount : 12);
    const inStock = p.in_stock !== false && p.inStock !== false && stockCount > 0;
    const img = p.image || p.imageUrl || "/images/products/jaipur-blue-pottery-tea-set.jpg";
    const artisanName = typeof p.artisan === "object" ? p.artisan?.full_name : (p.creator || "Master Artisan");
    const craft = p.craft_heritage_note || p.craftHeritage || p.category || "Traditional Craft";
    const region = p.region_state || p.artisanRegion || p.creatorLocation || "India";

    return {
      ...p,
      id: String(p.id),
      name: p.name || p.title,
      title: p.title || p.name,
      sku: p.sku || `LM-${String(p.id).padStart(3, "0")}`,
      price: price,
      description: p.description || p.shortDescription || "",
      shortDescription: p.shortDescription || p.description || "",
      longDescription: p.longDescription || p.description || "",
      category: p.category || "Home & Living",
      craft_heritage_note: craft,
      craftHeritage: craft,
      region_state: region,
      artisanRegion: region,
      creatorLocation: region,
      in_stock: inStock,
      inStock: inStock,
      stock_quantity: stockCount,
      stockCount: stockCount,
      image: img,
      imageUrl: img,
      gallery_images: p.gallery_images || p.galleryImages || [img],
      galleryImages: p.gallery_images || p.galleryImages || [img],
      average_rating: Number(p.average_rating || p.rating || 4.9),
      rating: Number(p.rating || p.average_rating || 4.9),
      reviews_count: Number(p.reviews_count || p.reviewsCount || 12),
      reviewsCount: Number(p.reviewsCount || p.reviews_count || 12),
      is_funded_on_platform: p.is_funded_on_platform !== false && p.isFundedOnLaunchMart !== false,
      isFundedOnLaunchMart: p.is_funded_on_platform !== false && p.isFundedOnLaunchMart !== false,
      campaign: p.campaign || p.graduatedFromCampaignId || "CMP-104",
      graduatedFromCampaignId: p.graduatedFromCampaignId || p.campaign || "CMP-104",
      artisan: {
        id: 2,
        username: "artisan_craft",
        full_name: artisanName,
      },
      creator: artisanName,
      badgeType: inStock ? (stockCount <= 5 ? "limited_stock" : "in_stock") : "pre_order",
      badgeLabel: inStock ? (stockCount <= 5 ? `Only ${stockCount} Left` : "Ready to Ship") : "Made to Order",
      features: p.features || [
        "100% Handcrafted by Master Artisans",
        "Authentic Geographical Indication (GI) Verified",
        "Fair Price Guarantee with Direct Royalties",
      ],
      specs: p.specs || [
        { label: "Craft Tradition", value: craft },
        { label: "Provenance", value: region },
      ],
    };
  }

  function formatOrderForApi(o: any) {
    return {
      ...o,
      id: String(o.id),
      orderNumber: o.orderNumber || o.order_number || `CF-${Math.floor(100000 + Math.random() * 900000)}`,
      order_number: o.order_number || o.orderNumber || `CF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: o.status || "confirmed",
      total: Number(o.total || o.total_amount || 0),
      total_amount: Number(o.total_amount || o.total || 0),
      orderDate: o.orderDate || o.created_at || new Date().toISOString(),
      created_at: o.created_at || o.orderDate || new Date().toISOString(),
      estimatedDeliveryRange: o.estimatedDeliveryRange || o.estimated_delivery || "5-7 business days",
      estimated_delivery: o.estimated_delivery || o.estimatedDeliveryRange || "5-7 business days",
      shippingAddress: o.shippingAddress || o.shipping_address,
      items: (o.items || []).map((it: any, idx: number) => ({
        id: String(it.id || idx + 1),
        price_at_purchase: Number(it.price || it.price_at_purchase || 1500),
        price: Number(it.price || it.price_at_purchase || 1500),
        quantity: Number(it.quantity || 1),
        product: {
          id: it.productId || it.product?.id,
          name: it.title || it.product?.name,
          price: Number(it.price || it.product?.price || 1500),
          image: it.imageUrl || it.product?.image,
          category: it.subtitle || it.product?.category,
          craft_heritage_note: it.subtitle || it.product?.craft_heritage_note,
          artisan: { full_name: it.artisanName || it.product?.artisan?.full_name || "Master Artisan" },
        },
        productId: it.productId || it.product?.id,
        title: it.title || it.product?.name,
        imageUrl: it.imageUrl || it.product?.image,
        subtitle: it.subtitle || it.product?.category,
        artisanName: it.artisanName || it.product?.artisan?.full_name || "Master Artisan",
      })),
      status_history: o.status_history || (o.trackingHistory || []).map((th: any) => ({
        status: th.stage,
        timestamp: th.timestamp,
        note: th.description,
      })),
      trackingHistory: o.trackingHistory || (o.status_history || []).map((sh: any) => ({
        stage: sh.status,
        label: sh.status.replace(/_/g, " ").toUpperCase(),
        timestamp: sh.timestamp,
        location: "Fulfillment Center",
        description: sh.note || "Order processed.",
        completed: true,
      })),
    };
  }

  function formatPledgeForApi(p: any) {
    return {
      ...p,
      id: String(p.id),
      campaign_id: String(p.campaign_id || p.campaignId || p.campaign),
      campaignId: String(p.campaignId || p.campaign_id || p.campaign),
      campaign: String(p.campaign || p.campaign_id || p.campaignId),
      campaign_title: p.campaign_title || p.campaignTitle || "Craft Campaign",
      campaignTitle: p.campaignTitle || p.campaign_title || "Craft Campaign",
      campaign_code: p.campaign_code || p.campaignCode || `CMP-${String(p.campaignId || p.campaign_id || "001").padStart(3, "0")}`,
      campaignCode: p.campaignCode || p.campaign_code || `CMP-${String(p.campaignId || p.campaign_id || "001").padStart(3, "0")}`,
      tier_title: p.tier_title || p.tierTitle || "Patron Tier",
      tierTitle: p.tierTitle || p.tier_title || "Patron Tier",
      amount: Number(p.amount || 1000),
      status: p.status || "authorized",
      created_at: p.created_at || p.dateAuthorized || new Date().toISOString(),
      dateAuthorized: p.dateAuthorized || p.created_at || "Recent",
      estimated_delivery: p.estimated_delivery || p.estimatedDelivery || "Dec 2026",
      estimatedDelivery: p.estimatedDelivery || p.estimated_delivery || "Dec 2026",
    };
  }

  // Persistent in-memory state stores for the application session
  const campaignsStore: any[] = MOCK_CAMPAIGNS.map(formatCampaignForApi);
  const productsStore: any[] = MOCK_PRODUCTS.map(formatProductForApi);
  const ordersStore: any[] = MOCK_CUSTOMER_ORDERS.map(formatOrderForApi);
  const pledgesStore: any[] = INITIAL_USER_PLEDGES.map(formatPledgeForApi);
  const pendingCampaignsStore: any[] = DEFAULT_PENDING_CAMPAIGNS.map((c) => ({
    ...c,
    id: String(c.id),
    slug: c.slug || String(c.id),
    is_approved: false,
    isApproved: false,
  }));
  const rejectedCampaignsStore: any[] = [];
  const adminUsersStore: any[] = DEFAULT_ADMIN_USERS.map((u) => ({
    ...u,
    is_suspended: Boolean(u.is_suspended),
  }));

  // ===================== CORE DATA ROUTES =====================

  // Campaigns list
  app.get(["/api/campaigns", "/api/campaigns/"], (req, res) => {
    res.json({
      count: campaignsStore.length,
      next: null,
      previous: null,
      results: campaignsStore,
    });
  });

  // User pledges list
  app.get(["/api/campaigns/my-pledges", "/api/campaigns/my-pledges/"], (req, res) => {
    res.json(pledgesStore);
  });

  // Campaign detail by slug or ID
  app.get(["/api/campaigns/:slugOrId", "/api/campaigns/:slugOrId/"], (req, res) => {
    const { slugOrId } = req.params;
    const found = campaignsStore.find((c: any) => String(c.id) === String(slugOrId) || c.slug === slugOrId);
    if (!found) {
      return res.status(404).json({ detail: "Campaign not found" });
    }

    const matchingPledges = pledgesStore
      .filter((p: any) => String(p.campaign_id) === String(found.id) || String(p.campaignId) === String(found.id) || p.campaign_slug === found.slug)
      .map((p: any, i: number) => ({
        id: p.id || `bk-${i}`,
        backer_name: p.backer_name || "Conscious Backer",
        tier_title: p.tier_title || p.tierTitle || "Heritage Patron Supporter",
        amount: p.amount || 1200,
        created_at: p.created_at || new Date().toISOString(),
      }));

    const defaultUpdates = [
      {
        id: `up-${found.id}-1`,
        title: "Raw Material Sourcing & Loom Assembly Underway",
        body: "We have finalized procurement of all natural organic fibers and timber components directly with our local regional cluster. Loom warping begins this week.",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: `up-${found.id}-2`,
        title: "100% Escrow Milestone Authorization Completed",
        body: "Thank you to our conscious patrons! Escrow milestone verification has unlocked the first production tranche for artisan master craftspeople.",
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      }
    ];

    const defaultComments = [
      {
        id: `cm-${found.id}-1`,
        body: "Thrilled to support this generational craft cluster. Proud to stand with indigenous Indian artisans.",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        user: { id: 3, full_name: "Eleanor Vance", username: "eleanor_buyer" }
      },
      {
        id: `cm-${found.id}-2`,
        body: "Thank you all for keeping our traditional looms running. Every backer name is being recorded in our workshop register.",
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        user: { id: 2, full_name: found.artisan?.full_name || "Master Artisan", username: "artisan_craft" }
      }
    ];

    res.json({
      ...found,
      recent_pledges: matchingPledges,
      updates: defaultUpdates,
      comments: defaultComments,
    });
  });

  // Create pledge for a campaign
  app.post(["/api/campaigns/:id/pledge", "/api/campaigns/:id/pledge/"], (req, res) => {
    const { id } = req.params;
    const { amount, backer_name, tier_title } = req.body || {};
    const pledgeAmount = Number(amount) || 1200;

    const campaign = campaignsStore.find((c: any) => String(c.id) === String(id) || c.slug === id);
    if (campaign) {
      campaign.amount_raised = (campaign.amount_raised || 0) + pledgeAmount;
      campaign.pledgedAmount = (campaign.pledgedAmount || 0) + pledgeAmount;
      campaign.backers_count = (campaign.backers_count || 0) + 1;
      campaign.backersCount = (campaign.backersCount || 0) + 1;
      if (campaign.amount_raised >= campaign.funding_goal) {
        campaign.status = "funded";
      }
    }

    const newPledge = {
      id: `pld-${Date.now().toString().slice(-6)}`,
      campaignId: String(campaign?.id || id),
      campaign_id: String(campaign?.id || id),
      campaign: String(campaign?.id || id),
      campaignTitle: campaign?.title || "Craft Campaign",
      campaign_title: campaign?.title || "Craft Campaign",
      campaignSlug: campaign?.slug || String(id),
      campaign_slug: campaign?.slug || String(id),
      campaignStatus: campaign?.status || "in_progress",
      campaign_status: campaign?.status || "in_progress",
      campaignImage: campaign?.image || campaign?.imageUrl,
      campaign_image: campaign?.image || campaign?.imageUrl,
      tierTitle: tier_title || "Heritage Patron Supporter",
      tier_title: tier_title || "Heritage Patron Supporter",
      amount: pledgeAmount,
      status: "authorized",
      dateAuthorized: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      created_at: new Date().toISOString(),
      estimatedDelivery: "Dec 2026",
      estimated_delivery: "Dec 2026",
      backer_name: backer_name || "Conscious Patron",
    };

    pledgesStore.unshift(newPledge);

    res.status(201).json({
      status: "success",
      message: "Pledge successfully pre-authorized in escrow.",
      pledge: newPledge,
      campaign,
    });
  });

  // Settle campaign endpoint for simulation
  app.post(["/api/campaigns/:id/settle", "/api/campaigns/:id/settle/"], (req, res) => {
    const { id } = req.params;
    const { outcome } = req.body || {};
    const campaign = campaignsStore.find((c: any) => String(c.id) === String(id) || c.slug === id);

    if (outcome === 'reset') {
      if (campaign) {
        if (campaign._previousState) {
          campaign.status = campaign._previousState.status || 'in_progress';
          campaign.days_left = campaign._previousState.days_left;
          campaign.daysLeft = campaign._previousState.daysLeft;
          campaign.amount_raised = campaign._previousState.amount_raised;
          campaign.pledgedAmount = campaign._previousState.pledgedAmount;
          campaign.backers_count = campaign._previousState.backers_count;
          campaign.backersCount = campaign._previousState.backersCount;
          delete campaign._previousState;
        } else {
          const orig = MOCK_CAMPAIGNS.find((m: any) => String(m.id) === String(id) || m.slug === id);
          campaign.status = 'in_progress';
          campaign.days_left = orig ? orig.daysLeft : 14;
          campaign.daysLeft = orig ? orig.daysLeft : 14;
          if (orig) {
            campaign.amount_raised = orig.amountRaised ?? orig.pledgedAmount;
            campaign.pledgedAmount = orig.pledgedAmount;
            campaign.backers_count = orig.backersCount;
            campaign.backersCount = orig.backersCount;
          }
        }
      }
      for (const p of pledgesStore) {
        if (String(p.campaign_id) === String(id) || String(p.campaignId) === String(id) || (campaign && p.campaign_slug === campaign.slug)) {
          p.status = 'authorized';
        }
      }
      return res.json({ status: 'success', campaignStatus: 'in_progress', daysLeft: campaign?.daysLeft });
    }

    const isFunded = outcome === 'funded';
    if (campaign) {
      if (!campaign._previousState) {
        campaign._previousState = {
          status: campaign.status,
          days_left: campaign.days_left ?? campaign.daysLeft,
          daysLeft: campaign.daysLeft ?? campaign.days_left,
          amount_raised: campaign.amount_raised ?? campaign.pledgedAmount,
          pledgedAmount: campaign.pledgedAmount ?? campaign.amount_raised,
          backers_count: campaign.backers_count ?? campaign.backersCount,
          backersCount: campaign.backersCount ?? campaign.backers_count,
        };
      }
      campaign.status = isFunded ? 'funded' : 'failed';
      campaign.days_left = 0;
      campaign.daysLeft = 0;
      if (isFunded) {
        campaign.amount_raised = Math.max(campaign.amount_raised || 0, campaign.funding_goal || 100000);
        campaign.pledgedAmount = Math.max(campaign.pledgedAmount || 0, campaign.goalAmount || 100000);
      } else {
        const goal = campaign.funding_goal || campaign.goalAmount || 100000;
        const below = Math.min(campaign.pledgedAmount || campaign.amount_raised || 0, Math.round(goal * 0.7));
        campaign.amount_raised = below;
        campaign.pledgedAmount = below;
      }
    }

    for (const p of pledgesStore) {
      if (String(p.campaign_id) === String(id) || String(p.campaignId) === String(id) || (campaign && p.campaign_slug === campaign.slug)) {
        p.status = isFunded ? 'captured' : 'released';
      }
    }

    res.json({ status: 'success', campaignStatus: isFunded ? 'funded' : 'failed' });
  });

  // Create new campaign
  app.post(["/api/campaigns", "/api/campaigns/"], (req, res) => {
    const body = req.body || {};
    const newCamp = formatCampaignForApi({
      id: `cmp-${Date.now().toString().slice(-6)}`,
      title: body.title || "New Artisan Campaign",
      slug: (body.title || "new-artisan-campaign").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: body.description || body.short_description || "",
      shortDescription: body.description || body.short_description || "",
      funding_goal: Number(body.funding_goal || body.goal_amount || 100000),
      goalAmount: Number(body.funding_goal || body.goal_amount || 100000),
      amount_raised: 0,
      pledgedAmount: 0,
      backers_count: 0,
      backersCount: 0,
      days_left: 30,
      daysLeft: 30,
      status: "in_progress",
      image: body.image || body.imageUrl || "/images/products/jaipur-blue-pottery-tea-set.jpg",
      imageUrl: body.image || body.imageUrl || "/images/products/jaipur-blue-pottery-tea-set.jpg",
      craft_type: body.craft_type || body.category || "Traditional Craft",
      region_state: body.region_state || "India",
      is_approved: false,
      isApproved: false,
      artisan: {
        id: 2,
        username: "artisan_craft",
        full_name: body.artisan_name || "Master Artisan",
      },
      reward_tiers: body.reward_tiers || [],
    });

    pendingCampaignsStore.unshift(newCamp);
    res.status(201).json(newCamp);
  });

  // Products list
  app.get(["/api/products", "/api/products/"], (req, res) => {
    res.json({
      count: productsStore.length,
      next: null,
      previous: null,
      results: productsStore,
    });
  });

  // Single product detail
  app.get(["/api/products/:id", "/api/products/:id/"], (req, res) => {
    const { id } = req.params;
    const found = productsStore.find((p: any) => String(p.id) === String(id) || p.sku === id);
    if (!found) {
      return res.status(404).json({ detail: "Product not found" });
    }
    res.json(found);
  });

  // Create new product
  app.post(["/api/products", "/api/products/"], (req, res) => {
    const body = req.body || {};
    const newProd = formatProductForApi({
      id: `prd-${Date.now().toString().slice(-6)}`,
      title: body.name || body.title || "Handcrafted Artifact",
      sku: `LM-${Date.now().toString().slice(-4)}`,
      price: Number(body.price || 1500),
      description: body.description || "",
      category: body.category || "Home & Living",
      craft_heritage_note: body.craft_type || "Traditional Craft",
      region_state: body.region_state || "India",
      in_stock: true,
      stock_quantity: Number(body.stock_quantity || 10),
      image: body.image || body.imageUrl || "/images/products/jaipur-blue-pottery-tea-set.jpg",
    });
    productsStore.unshift(newProd);
    res.status(201).json(newProd);
  });

  // Orders list
  app.get(["/api/orders", "/api/orders/"], (req, res) => {
    res.json({
      count: ordersStore.length,
      next: null,
      previous: null,
      results: ordersStore,
    });
  });

  // Order detail and tracking
  app.get(["/api/orders/:id", "/api/orders/:id/", "/api/orders/:id/track", "/api/orders/:id/track/"], (req, res) => {
    const { id } = req.params;
    const order = ordersStore.find((o: any) => String(o.id) === String(id) || o.orderNumber === id || o.order_number === id);
    if (!order) {
      return res.status(404).json({ detail: "Order not found" });
    }
    res.json(order);
  });

  // Place new order
  app.post(["/api/orders", "/api/orders/"], (req, res) => {
    const { items = [], total_amount, shipping_address } = req.body || {};
    const newOrder = formatOrderForApi({
      id: `ord-${Date.now().toString().slice(-6)}`,
      orderNumber: `CF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "confirmed",
      total: total_amount || 2499,
      orderDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      estimatedDeliveryRange: "5-7 business days",
      shippingAddress: shipping_address || {
        name: "Customer",
        street: "123 Craft Lane",
        city: "Bengaluru",
        state: "Karnataka",
        zip: "560001",
        country: "India",
      },
      items,
      trackingHistory: [
        {
          stage: "confirmed",
          label: "Order Confirmed",
          timestamp: "Just now",
          location: "Craftify Central Hub",
          description: "Payment secured in escrow. Artisan notified.",
          completed: true,
        },
      ],
      status_history: [
        {
          status: "confirmed",
          timestamp: new Date().toISOString(),
          note: "Payment secured in escrow. Artisan notified.",
        },
      ],
    });
    ordersStore.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  // Cancel order
  app.post(["/api/orders/:id/cancel", "/api/orders/:id/cancel/"], (req, res) => {
    const { id } = req.params;
    const order = ordersStore.find((o: any) => String(o.id) === String(id) || o.orderNumber === id || o.order_number === id);
    if (!order) {
      return res.status(404).json({ detail: "Order not found." });
    }
    order.status = "cancelled";
    order.trackingHistory?.push({
      stage: "cancelled",
      label: "Order Cancelled",
      timestamp: "Just now",
      location: "Platform Escrow",
      description: req.body?.reason || "Cancelled by customer request.",
      completed: true,
    });
    order.status_history?.push({
      status: "cancelled",
      timestamp: new Date().toISOString(),
      note: req.body?.reason || "Cancelled by customer request.",
    });
    res.json({ status: "success", order });
  });

  // ===================== AUTHENTICATION ROUTES =====================

  app.post(["/api/auth/token", "/api/auth/token/"], (req, res) => {
    const { username = "", email = "" } = req.body || {};
    const query = (username || email).toLowerCase();
    let role = "buyer";
    if (query.includes("admin")) role = "admin";
    else if (query.includes("artisan") || query.includes("marcus") || query.includes("ramesh")) role = "artisan";

    const token = `jwt_mock_${Date.now()}_${role}`;
    res.json({
      access: token,
      refresh: `jwt_refresh_${Date.now()}`,
      role,
      user: {
        id: role === "admin" ? 1 : role === "artisan" ? 2 : 3,
        username: username || (role === "admin" ? "admin_aisha" : role === "artisan" ? "marcus_artisan" : "eleanor_buyer"),
        email: email || `${role}@craftify.in`,
        full_name: role === "admin" ? "Aisha Rao (Admin)" : role === "artisan" ? "Marcus Thorne" : "Eleanor Vance",
        role,
        craft_type: role === "artisan" ? "Woodworking & Ceramics" : null,
      },
    });
  });

  app.post(["/api/auth/token/refresh", "/api/auth/token/refresh/"], (req, res) => {
    res.json({ access: `jwt_mock_${Date.now()}_refreshed` });
  });

  app.post(["/api/auth/register", "/api/auth/register/"], (req, res) => {
    const { username = "", email = "", role = "buyer", name = "", craft_type, bio } = req.body || {};
    const token = `jwt_mock_${Date.now()}_${role}`;
    res.status(201).json({
      access: token,
      refresh: `jwt_refresh_${Date.now()}`,
      user: {
        id: Date.now(),
        username: username || email.split("@")[0],
        email,
        full_name: name || username,
        role,
        craft_type: craft_type || null,
        bio: bio || "",
      },
    });
  });

  app.get(["/api/auth/me", "/api/auth/me/"], (req, res) => {
    const authHeader = req.headers.authorization || "";
    let role = "buyer";
    if (authHeader.includes("admin")) role = "admin";
    else if (authHeader.includes("artisan")) role = "artisan";

    res.json({
      id: role === "admin" ? 1 : role === "artisan" ? 2 : 3,
      username: role === "admin" ? "admin_aisha" : role === "artisan" ? "marcus_artisan" : "eleanor_buyer",
      full_name: role === "admin" ? "Aisha Rao (Admin)" : role === "artisan" ? "Marcus Thorne (Artisan)" : "Eleanor Vance (Patron)",
      first_name: role === "admin" ? "Aisha" : role === "artisan" ? "Marcus" : "Eleanor",
      email: role === "admin" ? "aisha.admin@craftify.gov.in" : role === "artisan" ? "marcus@ateliermonolith.design" : "e.vance@archivalstudio.io",
      role,
      craft_type: role === "artisan" ? "Woodworking & Ceramics" : null,
      bio: role === "artisan" ? "Studio: Atelier Monolith" : role === "admin" ? "Principal Curator & Governance Lead" : "Passionate collector of traditional Indian crafts",
      is_suspended: false,
    });
  });

  // ===================== ADMIN CONSOLE ROUTES =====================

  app.get(["/api/admin/stats", "/api/admin/stats/"], (req, res) => {
    const totalRaised = campaignsStore.reduce((acc: number, curr: any) => acc + (Number(curr.amount_raised || curr.pledgedAmount) || 0), 0);
    res.json({
      total_campaigns: campaignsStore.length,
      total_funded_amount: totalRaised,
      active_artisans_count: 42,
      total_orders: ordersStore.length,
      pending_campaigns_count: pendingCampaignsStore.length,
      approved_campaigns_count: campaignsStore.length,
    });
  });

  app.get(["/api/admin/campaigns/pending", "/api/admin/campaigns/pending/"], (req, res) => {
    res.json(pendingCampaignsStore);
  });

  app.get(["/api/admin/campaigns/rejected", "/api/admin/campaigns/rejected/"], (req, res) => {
    res.json(rejectedCampaignsStore);
  });

  app.post(["/api/admin/campaigns/:id/approve", "/api/admin/campaigns/:id/approve/"], (req, res) => {
    const { id } = req.params;
    let approvedItem = null;

    // Check pending first
    const pendingIdx = pendingCampaignsStore.findIndex((c: any) => String(c.id) === String(id) || c.slug === id);
    if (pendingIdx !== -1) {
      approvedItem = pendingCampaignsStore.splice(pendingIdx, 1)[0];
    } else {
      // Check if it was previously rejected and being reconsidered
      const rejectedIdx = rejectedCampaignsStore.findIndex((c: any) => String(c.id) === String(id) || c.slug === id);
      if (rejectedIdx !== -1) {
        approvedItem = rejectedCampaignsStore.splice(rejectedIdx, 1)[0];
      }
    }

    if (approvedItem) {
      approvedItem.is_approved = true;
      approvedItem.isApproved = true;
      approvedItem.status = "in_progress";
      delete approvedItem.rejectionReason;
      delete approvedItem.rejectedAt;
      campaignsStore.unshift(approvedItem);
    }
    res.json({
      status: "success",
      message: "Campaign approved and listed on the live public ledger.",
      campaign: approvedItem,
    });
  });

  app.post(["/api/admin/campaigns/:id/reject", "/api/admin/campaigns/:id/reject/"], (req, res) => {
    const { id } = req.params;
    const { reason } = req.body || {};
    const rejectionReason = reason || "Does not satisfy Craftify curation and authenticity standards.";
    const idx = pendingCampaignsStore.findIndex((c: any) => String(c.id) === String(id) || c.slug === id);
    let rejectedItem = null;
    if (idx !== -1) {
      rejectedItem = pendingCampaignsStore.splice(idx, 1)[0];
      rejectedItem.is_approved = false;
      rejectedItem.isApproved = false;
      rejectedItem.status = "rejected";
      rejectedItem.rejectionReason = rejectionReason;
      rejectedItem.rejectedAt = new Date().toISOString();
      rejectedCampaignsStore.unshift(rejectedItem);
    }
    res.json({
      status: "success",
      message: "Campaign rejected with feedback recorded.",
      campaign: rejectedItem,
      rejectionReason,
    });
  });

  app.get(["/api/admin/users", "/api/admin/users/"], (req, res) => {
    res.json(adminUsersStore);
  });

  app.post(["/api/admin/users/:id/suspend", "/api/admin/users/:id/suspend/", "/api/admin/users/:id/activate", "/api/admin/users/:id/activate/"], (req, res) => {
    const { id } = req.params;
    const isSuspend = req.originalUrl.includes("suspend");
    const user = adminUsersStore.find((u: any) => String(u.id) === String(id));
    if (user) {
      user.is_suspended = isSuspend;
    }
    res.json({
      status: "success",
      message: isSuspend ? "User account has been suspended." : "User account has been reinstated.",
      is_suspended: isSuspend,
    });
  });

  // Catch-all 404 for unhandled API endpoints to prevent hanging requests
  app.all("/api/*", (req, res) => {
    res.status(404).json({ detail: `Route ${req.method} ${req.originalUrl} not found` });
  });

  // Serve static public assets directly
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Craftify server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
