/**
 * Proxies AI prediction requests to the FastAPI (Python) backend.
 * The browser only calls this route (same origin), so there are no CORS issues.
 * POST body: { symbol: string } e.g. { symbol: "ICICIBANK" }
 * Set AI_BACKEND_URL in .env.local to match your Uvicorn server (e.g. http://127.0.0.1:8000).
 */

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

/** Convert FastAPI error detail (string or array of { type, loc, msg, input }) to a single string */
function detailToMessage(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((d) => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : String(d)))
      .filter(Boolean);
    return messages.length ? messages.join('. ') : 'Validation error';
  }
  if (detail && typeof detail === 'object' && 'message' in detail) return String((detail as { message: unknown }).message);
  return 'AI backend error';
}

/** Map FastAPI snake_case response to frontend camelCase */
function toCamelCaseResponse(data: Record<string, unknown>): Record<string, unknown> {
  const factors = data.factors as Record<string, unknown> | undefined;
  return {
    predictedPrice: data.predicted_price ?? data.predictedPrice,
    confidence: data.confidence,
    direction: data.direction,
    timeframe: data.timeframe,
    reasoning: Array.isArray(data.reasoning) ? data.reasoning : [],
    riskLevel: data.risk_level ?? data.riskLevel,
    factors: factors
      ? {
          technical: factors.technical ?? 0,
          fundamental: factors.fundamental ?? 0,
          sentiment: factors.sentiment ?? 0,
        }
      : { technical: 0, fundamental: 0, sentiment: 0 },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbol = typeof body?.symbol === 'string' ? body.symbol.trim().toUpperCase() : null;
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid symbol' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const backendUrl = `${AI_BACKEND_URL.replace(/\/$/, '')}/predict`;
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });

    const text = await res.text();
    let data: Record<string, unknown>;
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON from AI backend' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!res.ok) {
      const message = detailToMessage((data as { detail?: unknown }).detail ?? data?.message);
      return new Response(JSON.stringify({ error: message }), {
        status: res.status >= 400 ? res.status : 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const camel = toCamelCaseResponse(data);
    return new Response(JSON.stringify(camel), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
