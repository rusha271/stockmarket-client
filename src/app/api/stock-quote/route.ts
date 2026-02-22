const NSE_ORIGIN = 'https://www.nseindia.com';

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: `${NSE_ORIGIN}/`,
};

function toNum(v: number | string | undefined): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') return Number(v.replace(/,/g, '')) || 0;
  return 0;
}

function findInResponse(
  root: Record<string, unknown>,
  keys: string[]
): unknown {
  const queue: Record<string, unknown>[] = [root];
  const seen = new Set<object>();
  while (queue.length) {
    const obj = queue.shift()!;
    if (!obj || typeof obj !== 'object' || seen.has(obj)) continue;
    seen.add(obj);
    for (const k of keys) {
      const v = obj[k];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    const next = [obj.data, obj.priceInfo, obj.metadata, obj.companyInfo, obj.tradeInfo, obj.info].filter(
      (x): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
    );
    queue.push(...next);
  }
  return undefined;
}

function parseVolume(
  priceInfo: Record<string, unknown> | undefined,
  tradeInfo: Record<string, unknown> | undefined,
  data: Record<string, unknown> | undefined,
  root: Record<string, unknown>
): number {
  const raw =
    priceInfo?.totalTradedVolume ??
    priceInfo?.tradedVolume ??
    priceInfo?.volume ??
    priceInfo?.quantityTraded ??
    priceInfo?.totalTradedQuantity ??
    tradeInfo?.totalTradedVolume ??
    tradeInfo?.tradedVolume ??
    tradeInfo?.volume ??
    tradeInfo?.quantityTraded ??
    tradeInfo?.totalTradedQuantity ??
    data?.totalTradedVolume ??
    data?.tradedVolume ??
    data?.volume ??
    data?.quantityTraded ??
    data?.totalTradedQuantity ??
    root?.totalTradedVolume ??
    root?.tradedVolume ??
    root?.volume ??
    root?.quantityTraded ??
    root?.totalTradedQuantity;
  let vol = toNum(raw as number | string | undefined);
  if (vol > 0 && vol < 10000) vol = Math.round(vol * 100000);
  return vol;
}

export interface StockQuoteOHLC {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  time: string;
  marketCap?: string | number;
  pe?: number;
  high52?: number;
  low52?: number;
  dividendYield?: number;
  dividendAmount?: number;
  quarterlyDividendAmount?: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim().toUpperCase();
  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing symbol' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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

    const setCookie =
      typeof (homeRes.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie === 'function'
        ? (homeRes.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
        : homeRes.headers.get('set-cookie');
    if (setCookie) {
      const parts = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
      for (const c of parts) cookieJar.push(c.split(';')[0].trim());
    }
    const cookieHeader = cookieJar.length ? cookieJar.join('; ') : '';

    const quoteUrl = `${NSE_ORIGIN}/api/quote-equity?symbol=${encodeURIComponent(symbol)}`;
    const apiRes = await fetch(quoteUrl, {
      method: 'GET',
      headers: {
        ...BROWSER_HEADERS,
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      cache: 'no-store',
    });

    if (!apiRes.ok) {
      return new Response(JSON.stringify({ error: `NSE ${apiRes.status}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const json = (await apiRes.json()) as Record<string, unknown>;
    const data = json?.data as Record<string, unknown> | undefined;
    const priceInfo = (data?.priceInfo ?? json?.priceInfo) as Record<string, unknown> | undefined;
    const metadata = (data?.metadata ?? json?.metadata) as Record<string, unknown> | undefined;
    const tradeInfo = (data?.tradeInfo ?? json?.tradeInfo) as Record<string, unknown> | undefined;
    const intraDay = priceInfo?.intraDayHighLow as { min?: number; max?: number } | undefined;

    const open = toNum((priceInfo?.open ?? priceInfo?.openPrice) as number | string | undefined);
    const high = toNum((intraDay?.max ?? priceInfo?.dayHigh ?? priceInfo?.highPrice) as number | string | undefined);
    const low = toNum((intraDay?.min ?? priceInfo?.dayLow ?? priceInfo?.lowPrice) as number | string | undefined);
    const close = toNum((priceInfo?.lastPrice ?? priceInfo?.last ?? priceInfo?.close) as number | string | undefined);
    const change = toNum(priceInfo?.change as number | string | undefined);
    const changePercent = toNum((priceInfo?.pChange ?? priceInfo?.percentChange) as number | string | undefined);
    let volume = parseVolume(priceInfo, tradeInfo, data, json);
    if (volume === 0) {
      const volRaw = findInResponse(json, ['totalTradedVolume', 'tradedVolume', 'volume', 'quantityTraded', 'totalTradedQuantity']);
      volume = toNum(volRaw as number | string | undefined);
      if (volume > 0 && volume < 10000) volume = Math.round(volume * 100000);
    }

    const companyInfo = (data?.companyInfo ?? json?.companyInfo) as Record<string, unknown> | undefined;
    const weekHighLow = priceInfo?.weekHighLow as Record<string, unknown> | undefined;
    const yearHighLow = priceInfo?.yearHighLow as Record<string, unknown> | undefined;
    const whlMax = weekHighLow?.max ?? weekHighLow?.maxPrice ?? weekHighLow?.high;
    const whlMin = weekHighLow?.min ?? weekHighLow?.minPrice ?? weekHighLow?.low;
    const yhlMax = yearHighLow?.max ?? yearHighLow?.maxPrice ?? yearHighLow?.high;
    const yhlMin = yearHighLow?.min ?? yearHighLow?.minPrice ?? yearHighLow?.low;

    let high52 = toNum(
      (whlMax ?? yhlMax ?? priceInfo?.high52 ?? priceInfo?.week52High ?? companyInfo?.high52 ?? json?.high52) as number | string | undefined
    );
    let low52 = toNum(
      (whlMin ?? yhlMin ?? priceInfo?.low52 ?? priceInfo?.week52Low ?? companyInfo?.low52 ?? json?.low52) as number | string | undefined
    );
    if (high52 === 0 || low52 === 0) {
      const h = findInResponse(json, ['high52', 'week52High', 'yearHigh', 'high52Week']);
      const l = findInResponse(json, ['low52', 'week52Low', 'yearLow', 'low52Week']);
      if (high52 === 0) high52 = toNum(h as number | string | undefined);
      if (low52 === 0) low52 = toNum(l as number | string | undefined);
    }

    let pe = toNum(
      (metadata?.pdSymbolPe ?? metadata?.pdSectorPe ?? priceInfo?.pe ?? priceInfo?.pegRatio ?? companyInfo?.pe ?? json?.pe) as number | string | undefined
    );
    if (pe === 0) {
      const peVal = findInResponse(json, ['pe', 'pdSymbolPe', 'pdSectorPe', 'pegRatio', 'peRatio']);
      pe = toNum(peVal as number | string | undefined);
    }

    const dividendYield = toNum((priceInfo?.dividendYield ?? companyInfo?.dividendYield ?? json?.dividendYield) as number | string | undefined);
    const dividendAmount = toNum((companyInfo?.dividendAmount ?? priceInfo?.dividendAmount ?? json?.dividendAmount) as number | string | undefined);
    const quarterlyDividendAmount = toNum((companyInfo?.quarterlyDividendAmount ?? companyInfo?.dividend ?? priceInfo?.dividend ?? json?.quarterlyDividendAmount) as number | string | undefined);

    let marketCap: string | number | undefined = (priceInfo?.marketCap ?? priceInfo?.totalMarketCap ?? priceInfo?.marketCapitalisation ?? companyInfo?.marketCap ?? data?.marketCap ?? data?.totalMarketCap ?? json?.marketCap ?? json?.totalMarketCap) as string | number | undefined;
    if (marketCap == null || marketCap === '') {
      const mc = findInResponse(json, ['marketCap', 'totalMarketCap', 'marketCapitalisation', 'marketCapitalization', 'totalMc']);
      marketCap = mc as string | number | undefined;
    }
    if (typeof marketCap === 'number' && Number.isFinite(marketCap)) {
      if (marketCap >= 1e12) marketCap = `${(marketCap / 1e12).toFixed(2)}T`;
      else if (marketCap >= 1e7) marketCap = `${(marketCap / 1e7).toFixed(2)} Cr`;
      else if (marketCap >= 1e5) marketCap = `${(marketCap / 1e5).toFixed(2)} L`;
    } else if (typeof marketCap === 'string' && /^\d+(\.\d+)?$/.test(marketCap.replace(/,/g, ''))) {
      const n = Number(marketCap.replace(/,/g, ''));
      if (n >= 1e12) marketCap = `${(n / 1e12).toFixed(2)}T`;
      else if (n >= 1e7) marketCap = `${(n / 1e7).toFixed(2)} Cr`;
      else if (n >= 1e5) marketCap = `${(n / 1e5).toFixed(2)} L`;
    }

    const lastUpdateTime =
      (metadata?.lastUpdateTime as string) ??
      (priceInfo?.lastUpdateTime as string) ??
      new Date().toISOString();

    const result: StockQuoteOHLC = {
      symbol,
      open,
      high,
      low,
      close,
      volume,
      change,
      changePercent,
      time: lastUpdateTime,
      marketCap: marketCap ?? '',
      pe: pe || 0,
      high52: high52 || 0,
      low52: low52 || 0,
      dividendYield: dividendYield >= 0 ? dividendYield : 0,
      dividendAmount: dividendAmount || 0,
      quarterlyDividendAmount: quarterlyDividendAmount || 0,
    };

    return Response.json(result);
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch quote' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
