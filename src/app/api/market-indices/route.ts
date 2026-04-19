import { isUseMock } from '@/lib/featureFlags';
import { mockMarketIndicesJson } from '@/mocks/apiFixtures';

const NSE_ORIGIN = 'https://www.nseindia.com';
const NSE_ALL_INDICES_URL = `${NSE_ORIGIN}/api/allIndices`;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: `${NSE_ORIGIN}/`,
};

const NSE_INDEX_TO_SYMBOL: Record<string, string> = {
  'NIFTY 50': '^NSEI',
  'NIFTY MIDCAP 50': '^NIFTYMIDCAP50',
  'NIFTY BANK': '^NSEBANK',
  'NIFTY IT': '^CNXIT',
  'NIFTY PHARMA': '^CNXPHARMA',
  'NIFTY AUTO': '^CNXAUTO',
  'NIFTY FMCG': '^CNXFMCG',
  'NIFTY METAL': '^CNXMETAL',
};

interface NSEIndexRow {
  name?: string;
  index?: string;
  last?: number | string;
  variation?: number | string;
  percentChange?: number | string;
  change?: number | string;
  [key: string]: unknown;
}

function toNum(v: number | string | undefined): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') return Number(v.replace(/,/g, '')) || 0;
  return 0;
}

function parseNseIndices(body: unknown): { symbol: string; regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number }[] {
  const raw = body as { data?: NSEIndexRow[] } | NSEIndexRow[];
  const arr = Array.isArray(raw) ? raw : raw?.data;
  if (!Array.isArray(arr)) return [];

  const result: { symbol: string; regularMarketPrice: number; regularMarketChange: number; regularMarketChangePercent: number }[] = [];

  for (const row of arr) {
    const name = String(row?.name ?? row?.index ?? '').trim();
    const symbol = NSE_INDEX_TO_SYMBOL[name];
    if (!symbol) continue;

    const last = toNum(row?.last);
    const variation = toNum(row?.variation ?? row?.change);
    const percentChange = toNum(row?.percentChange);

    if (Number.isFinite(last) && last > 0) {
      result.push({
        symbol,
        regularMarketPrice: last,
        regularMarketChange: variation,
        regularMarketChangePercent: percentChange,
      });
    }
  }

  return result;
}

export async function GET() {
  if (isUseMock()) {
    return Response.json(mockMarketIndicesJson());
  }

  const cookieJar: string[] = [];

  try {
    const homeRes = await fetch(NSE_ORIGIN, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      cache: 'no-store',
    });

    const setCookie = typeof (homeRes.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
      ? (homeRes.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : homeRes.headers.get('set-cookie');
    if (setCookie) {
      const parts = Array.isArray(setCookie) ? setCookie : (setCookie ? [setCookie] : []);
      for (const c of parts) cookieJar.push(c.split(';')[0].trim());
    }
    const cookieHeader = cookieJar.length ? cookieJar.join('; ') : '';

    const apiRes = await fetch(NSE_ALL_INDICES_URL, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: 'no-store',
    });

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: `NSE ${apiRes.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const json = await apiRes.json();
    const result = parseNseIndices(json);

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No index data' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return Response.json({
      quoteResponse: { result },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch indices' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
