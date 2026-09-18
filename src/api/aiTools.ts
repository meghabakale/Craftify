/**
 * Shared API client helper for Kaarigar AI Tools.
 * Handles JWT authentication headers, silent 401 token refresh flow,
 * single-retry logic, and standardized error messaging.
 */

export interface GenerateDescriptionParams {
  craft_type: string;
  material: string;
  region: string;
  keywords?: string;
  draft_text?: string;
  mode?: 'full_story' | 'complete_sentences';
}

export interface GenerateDescriptionResponse {
  description: string;
}

/**
 * Ensures text ends on complete, grammatically punctuated sentences.
 */
export function ensureGrammaticallyComplete(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
    const lines = cleaned.split('\n');
    cleaned = lines.slice(1, -1).join('\n').trim();
  }

  const paragraphs = cleaned.split(/\n\n+/).map((p) => {
    let paragraph = p.trim();
    if (!paragraph) return '';
    const terminalChars = ['.', '!', '?', '"', '”', "'"];
    if (!terminalChars.some((char) => paragraph.endsWith(char))) {
      const lastPeriodIdx = Math.max(
        paragraph.lastIndexOf('. '),
        paragraph.lastIndexOf('.\n'),
        paragraph.lastIndexOf('! '),
        paragraph.lastIndexOf('? ')
      );
      if (lastPeriodIdx > paragraph.length * 0.7) {
        paragraph = paragraph.substring(0, lastPeriodIdx + 1).trim();
      } else {
        paragraph = paragraph.replace(/[,;:-]\s*$/, '') + '.';
      }
    }
    return paragraph;
  }).filter(Boolean);

  return paragraphs.join('\n\n');
}

export type CraftComplexityLevel = 'basic' | 'skilled' | 'master';

export interface SuggestPriceParams {
  craft_type: string;
  material_cost: number;
  hours_spent: number;
  region: string;
  complexity_level: CraftComplexityLevel;
}

export interface SuggestPriceResponse {
  price_range_min: number;
  price_range_max: number;
  reasoning: string;
  market_reference_min?: number;
  market_reference_max?: number;
  market_reference_note?: string;
}

const STORAGE_ACCESS_KEY = 'craftify_access_token';
const STORAGE_REFRESH_KEY = 'craftify_refresh_token';

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_ACCESS_KEY) || sessionStorage.getItem(STORAGE_ACCESS_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_REFRESH_KEY) || sessionStorage.getItem(STORAGE_REFRESH_KEY);
  } catch {
    return null;
  }
};

export const setAuthTokens = (tokens: { access: string; refresh?: string }) => {
  try {
    if (tokens.access) {
      localStorage.setItem(STORAGE_ACCESS_KEY, tokens.access);
      sessionStorage.setItem(STORAGE_ACCESS_KEY, tokens.access);
    }
    if (tokens.refresh) {
      localStorage.setItem(STORAGE_REFRESH_KEY, tokens.refresh);
      sessionStorage.setItem(STORAGE_REFRESH_KEY, tokens.refresh);
    }
  } catch {
    // Ignore storage quota errors
  }
};

export const clearAuthTokens = () => {
  try {
    localStorage.removeItem(STORAGE_ACCESS_KEY);
    localStorage.removeItem(STORAGE_REFRESH_KEY);
    sessionStorage.removeItem(STORAGE_ACCESS_KEY);
    sessionStorage.removeItem(STORAGE_REFRESH_KEY);
  } catch {
    // Ignore
  }
};

/**
 * Obtain a new access token using the stored refresh token.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      clearAuthTokens();
      return null;
    }

    const data = await response.json();
    if (data.access) {
      setAuthTokens({ access: data.access, refresh: data.refresh || refresh });
      return data.access;
    }
    return null;
  } catch (err) {
    console.error('Failed to silently refresh token:', err);
    return null;
  }
}

/**
 * Obtain demo tokens for default artisan user if none exist.
 */
export async function obtainDefaultArtisanToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'artisan_creator',
        password: 'CraftifyPass123!',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access) {
        setAuthTokens({ access: data.access, refresh: data.refresh });
        return data.access;
      }
    }
  } catch (err) {
    console.warn('Could not auto-fetch artisan token:', err);
  }
  return null;
}

/**
 * Wraps fetch calls with JWT authorization headers.
 * If response returns 401, attempts silent refresh and retries ONCE.
 * If refresh fails, triggers auth redirect event and throws.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  const isAiEndpoint = url.startsWith('/api/ai/');

  // If no token exists, attempt to get default token
  if (!token) {
    try {
      token = await obtainDefaultArtisanToken();
    } catch {}
  }

  const buildHeaders = (authToken: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: buildHeaders(token),
    });
  } catch (networkErr: any) {
    console.warn('Network issue calling AI endpoint, retrying:', networkErr?.message || networkErr);
    // If it was an AI endpoint and failed, try plain fetch without auth header
    try {
      return await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string> || {}),
        },
      });
    } catch (secErr) {
      throw new Error("Couldn't generate this right now — try again in a moment.");
    }
  }

  // Handle 401 Unauthorized: Attempt silent refresh and retry once
  if (response.status === 401) {
    if (isAiEndpoint) {
      // For AI endpoints, retry without Authorization header since AI endpoints are public
      try {
        const retryNoAuth = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
          },
        });
        if (retryNoAuth.ok) {
          return retryNoAuth;
        }
      } catch {}
    }

    console.warn('Received 401 from endpoint. Attempting silent token refresh...');
    const newToken = await refreshAccessToken();

    if (newToken) {
      try {
        const retryResponse = await fetch(url, {
          ...options,
          headers: buildHeaders(newToken),
        });
        if (retryResponse.ok) {
          return retryResponse;
        }
        response = retryResponse;
      } catch (retryErr: any) {
        console.error('Network error during retry:', retryErr);
        throw new Error("Couldn't generate this right now — try again in a moment.");
      }
    } else if (!isAiEndpoint) {
      // Refresh failed or no refresh token available: redirect to login only for authenticated flows
      clearAuthTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('craftify:auth-required', { detail: { reason: 'session_expired' } }));
      }
      throw new Error("Couldn't generate this right now — try again in a moment.");
    }
  }

  return response;
}

/**
 * Calls POST /api/ai/generate-description/ with the four craft fields.
 * Returns response.description on success or throws user-friendly message.
 */
export async function generateDescription(params: GenerateDescriptionParams): Promise<string> {
  const { craft_type, material, region, keywords, draft_text, mode } = params;

  if (!craft_type?.trim() || !material?.trim() || !region?.trim()) {
    throw new Error('Please enter craft type, material, and region.');
  }

  const response = await fetchWithAuth('/api/ai/generate-description/', {
    method: 'POST',
    body: JSON.stringify({
      craft_type: craft_type.trim(),
      material: material.trim(),
      region: region.trim(),
      keywords: (keywords || '').trim(),
      draft_text: (draft_text || '').trim(),
      mode: mode || 'full_story',
    }),
  });

  if (!response.ok) {
    throw new Error("Couldn't generate this right now — try again in a moment.");
  }

  const data = (await response.json()) as GenerateDescriptionResponse;
  if (!data || typeof data.description !== 'string' || !data.description.trim()) {
    throw new Error("Couldn't generate this right now — try again in a moment.");
  }

  return ensureGrammaticallyComplete(data.description.trim());
}

/**
 * Deterministic local calculator fallback matching backend pricing formulas.
 */
export function calculateLocalPriceSuggestion(params: SuggestPriceParams): SuggestPriceResponse {
  const { craft_type, material_cost, hours_spent, region = '', complexity_level = 'skilled' } = params;
  const numMat = Math.max(0, Number(material_cost) || 0);
  const numHours = Math.max(0, Number(hours_spent) || 0);
  const compKey = (complexity_level || 'skilled').toLowerCase() as CraftComplexityLevel;
  const multipliers: Record<CraftComplexityLevel, number> = {
    basic: 1.0,
    skilled: 1.5,
    master: 2.2,
  };
  const regionFactors: Record<string, number> = {
    'Karnataka': 1.0,
    'Maharashtra': 1.1,
    'Delhi': 1.1,
    'Tamil Nadu': 1.0,
  };
  const effRate = 150 * (multipliers[compKey] || 1.5) * (regionFactors[region.trim()] || 1.0);
  const basePrice = numMat + numHours * effRate;
  const priceRangeMin = Math.round((basePrice * 1.3) / 10) * 10;
  const priceRangeMax = Math.round((basePrice * 1.8) / 10) * 10;
  const rateStr = Number.isInteger(effRate) ? String(effRate) : effRate.toFixed(1);
  const reasoning = `Based on ₹${numMat} in materials, ${numHours} hours of ${compKey}-level ${craft_type} work at an estimated ₹${rateStr}/hour, plus a standard markup for handmade goods.`;

  const CRAFT_PRICE_REFERENCE: Record<string, { min: number; max: number }> = {
    block_printing: { min: 300, max: 1500 },
    handloom_weaving: { min: 800, max: 5000 },
    pottery: { min: 150, max: 2000 },
    madhubani_painting: { min: 500, max: 8000 },
    bamboo_craft: { min: 200, max: 3000 },
    brass_jewellery: { min: 250, max: 4000 },
    leatherwork: { min: 400, max: 3500 },
    embroidery: { min: 350, max: 6000 },
  };

  const norm = String(craft_type || '').toLowerCase().trim().replace(/[- &]/g, '_');
  let mRef = CRAFT_PRICE_REFERENCE[norm];
  if (!mRef) {
    for (const [k, v] of Object.entries(CRAFT_PRICE_REFERENCE)) {
      if (norm.includes(k) || k.includes(norm)) {
        mRef = v;
        break;
      }
    }
  }
  if (!mRef && (norm.includes('block') || norm.includes('print'))) mRef = CRAFT_PRICE_REFERENCE['block_printing'];
  if (!mRef && (norm.includes('weav') || norm.includes('loom') || norm.includes('saree'))) mRef = CRAFT_PRICE_REFERENCE['handloom_weaving'];
  if (!mRef && (norm.includes('potter') || norm.includes('clay') || norm.includes('ceramic'))) mRef = CRAFT_PRICE_REFERENCE['pottery'];
  if (!mRef && (norm.includes('paint') || norm.includes('madhubani'))) mRef = CRAFT_PRICE_REFERENCE['madhubani_painting'];
  if (!mRef && (norm.includes('bamboo') || norm.includes('cane'))) mRef = CRAFT_PRICE_REFERENCE['bamboo_craft'];
  if (!mRef && (norm.includes('brass') || norm.includes('metal') || norm.includes('jewel') || norm.includes('dhokra'))) mRef = CRAFT_PRICE_REFERENCE['brass_jewellery'];
  if (!mRef && (norm.includes('leather') || norm.includes('jooti'))) mRef = CRAFT_PRICE_REFERENCE['leatherwork'];
  if (!mRef && (norm.includes('embroid') || norm.includes('stitch') || norm.includes('chikan'))) mRef = CRAFT_PRICE_REFERENCE['embroidery'];
  if (!mRef) mRef = { min: 200, max: 2000 };

  return {
    price_range_min: priceRangeMin,
    price_range_max: priceRangeMax,
    reasoning,
    market_reference_min: mRef.min,
    market_reference_max: mRef.max,
    market_reference_note: 'Typical retail range for similar handmade items in this category',
  };
}

/**
 * Calls POST /api/ai/suggest-price/ with craft parameters.
 * Returns { price_range_min, price_range_max, reasoning, market_reference_min, market_reference_max }.
 * Gracefully falls back to local deterministic calculation if network or service is unavailable.
 */
export async function suggestPrice(params: SuggestPriceParams): Promise<SuggestPriceResponse> {
  const { craft_type, material_cost, hours_spent, region, complexity_level } = params;

  if (!craft_type?.trim() || !region?.trim()) {
    throw new Error('Please enter craft type and region.');
  }

  const numMaterialCost = Number(material_cost);
  const numHours = Number(hours_spent);

  if (isNaN(numMaterialCost) || numMaterialCost < 0) {
    throw new Error('Please enter a valid raw material cost.');
  }

  if (isNaN(numHours) || numHours < 0) {
    throw new Error('Please enter valid labor hours spent.');
  }

  const validComplexities: CraftComplexityLevel[] = ['basic', 'skilled', 'master'];
  if (!complexity_level || !validComplexities.includes(complexity_level)) {
    throw new Error('Please select a craft complexity level (Basic, Skilled, or Master-level).');
  }

  try {
    const response = await fetchWithAuth('/api/ai/suggest-price/', {
      method: 'POST',
      body: JSON.stringify({
        craft_type: craft_type.trim(),
        material_cost: numMaterialCost,
        hours_spent: numHours,
        region: region.trim(),
        complexity_level,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as SuggestPriceResponse;
      if (
        typeof data.price_range_min === 'number' &&
        typeof data.price_range_max === 'number' &&
        data.reasoning
      ) {
        return {
          price_range_min: Number(data.price_range_min),
          price_range_max: Number(data.price_range_max),
          reasoning: String(data.reasoning),
          market_reference_min: data.market_reference_min !== undefined ? Number(data.market_reference_min) : undefined,
          market_reference_max: data.market_reference_max !== undefined ? Number(data.market_reference_max) : undefined,
          market_reference_note: data.market_reference_note ? String(data.market_reference_note) : undefined,
        };
      }
    }
  } catch (err: any) {
    console.warn('Backend suggest-price call failed or unreachable, using local calculation fallback:', err?.message || err);
  }

  // Graceful deterministic fallback
  return calculateLocalPriceSuggestion(params);
}

export interface RecommendationItem {
  id: string;
  type: 'product' | 'campaign';
  reason: string;
}

export interface GetRecommendationsParams {
  viewed_categories?: string[];
  limit?: number;
}

/**
 * Calls POST /api/ai/recommendations/ with { viewed_categories }.
 * Returns [{ id, type, reason }] or empty array on silent failure.
 */
export async function fetchRecommendations(
  params: GetRecommendationsParams = {}
): Promise<RecommendationItem[]> {
  try {
    const response = await fetchWithAuth('/api/ai/recommendations/', {
      method: 'POST',
      body: JSON.stringify({
        viewed_categories: params.viewed_categories || [],
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          (item.type === 'product' || item.type === 'campaign') &&
          typeof item.reason === 'string'
      );
    }
    return [];
  } catch {
    // Silent fail to default as requested in requirement 4
    return [];
  }
}

