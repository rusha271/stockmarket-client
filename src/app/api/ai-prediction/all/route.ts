import { isUseMock } from '@/lib/featureFlags';
import { getAiBackendBaseUrl } from '@/lib/resolveAiBackendUrl';
import { mockPredictAllRows } from '@/mocks/apiFixtures';

const QUOTE_BATCH_SIZE = 5;

interface PredictionRow {
  symbol: string;
  currentPrice: number | null;
  predictedPrice: number | null;
}

function normalizeSymbol(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const symbol = value.trim().toUpperCase();
  return symbol ? symbol : null;
}

async function fetchQuote(baseUrl: string, symbol: string): Promise<{ symbol: string; currentPrice: number | null }> {
  try {
    const res = await fetch(`${baseUrl}/api/stock-quote?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) return { symbol, currentPrice: null };
    const data = (await res.json()) as { close?: unknown };
    const close = data?.close;
    return {
      symbol,
      currentPrice: typeof close === 'number' && Number.isFinite(close) ? close : null,
    };
  } catch {
    return { symbol, currentPrice: null };
  }
}

async function fetchQuotesInBatches(baseUrl: string, symbols: string[]): Promise<Map<string, number | null>> {
  const map = new Map<string, number | null>();
  for (let i = 0; i < symbols.length; i += QUOTE_BATCH_SIZE) {
    const batch = symbols.slice(i, i + QUOTE_BATCH_SIZE);
    const results = await Promise.all(batch.map((s) => fetchQuote(baseUrl, s)));
    for (const r of results) map.set(r.symbol, r.currentPrice);
  }
  return map;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawSymbols: unknown[] = Array.isArray(body?.symbols) ? body.symbols : [];
    const symbols = rawSymbols
      .map(normalizeSymbol)
      .filter((s: string | null): s is string => Boolean(s));

    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing symbols array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (isUseMock()) {
      const predictions = mockPredictAllRows(symbols);
      return new Response(JSON.stringify({ predictions }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentTimeSlot = typeof body?.current_time_slot === 'string' ? body.current_time_slot : null;
    const predictionTargetTime = typeof body?.prediction_target_time === 'string' ? body.prediction_target_time : null;
    const payload: Record<string, unknown> = { symbols };
    if (currentTimeSlot) payload.current_time_slot = currentTimeSlot;
    if (predictionTargetTime) payload.prediction_target_time = predictionTargetTime;

    const baseUrl =
      (typeof process.env.NEXTAUTH_URL === 'string' && process.env.NEXTAUTH_URL
        ? new URL(process.env.NEXTAUTH_URL).origin
        : null) ??
      (typeof process.env.VERCEL_URL === 'string'
        ? `https://${process.env.VERCEL_URL}`
        : null) ??
      new URL(request.url).origin;

    const [backendRes, quotesMap] = await Promise.all([
      fetch(`${getAiBackendBaseUrl()}/predict/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }),
      fetchQuotesInBatches(baseUrl, symbols),
    ]);

    const text = await backendRes.text();
    let data: unknown = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON from AI backend' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!backendRes.ok) {
      const message =
        data && typeof data === 'object' && 'error' in data
          ? String((data as { error: unknown }).error)
          : `Backend request failed (${backendRes.status})`;
      return new Response(
        JSON.stringify({ error: message }),
        { status: backendRes.status >= 400 ? backendRes.status : 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && 'predictions' in data && Array.isArray((data as { predictions: unknown }).predictions)
        ? (data as { predictions: unknown[] }).predictions
        : [];

    const response: PredictionRow[] = symbols.map((symbol: string) => {
      const row = rows.find(
        (r) =>
          r &&
          typeof r === 'object' &&
          'symbol' in r &&
          String((r as { symbol: unknown }).symbol).toUpperCase() === symbol
      ) as { predictedPrice?: unknown; predicted_price?: unknown } | undefined;
      const predicted = row?.predictedPrice ?? row?.predicted_price;
      return {
        symbol,
        currentPrice: quotesMap.get(symbol) ?? null,
        predictedPrice: typeof predicted === 'number' && Number.isFinite(predicted) ? predicted : null,
      };
    });

    return new Response(JSON.stringify({ predictions: response }), {
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
