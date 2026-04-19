import type { StockQuoteOHLC } from '@/app/api/stock-quote/route';
import type { HistoryPoint } from '@/app/api/stock-history/route';

function hashSymbol(symbol: string): number {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) {
    h ^= symbol.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) || 1;
}

/** Deterministic "random" 0..1 from symbol (stable across requests). */
function fracFromSymbol(symbol: string, salt: number): number {
  return ((hashSymbol(symbol) + salt) % 10000) / 10000;
}

export function mockStockQuote(symbol: string): StockQuoteOHLC {
  const upper = symbol.trim().toUpperCase();
  const base = 100 + (hashSymbol(upper) % 5000) / 10;
  const jitter = fracFromSymbol(upper, 1) * 4 - 2;
  const close = Math.round((base + jitter) * 100) / 100;
  const change = Math.round((fracFromSymbol(upper, 2) * 6 - 3) * 100) / 100;
  const prev = close - change;
  const changePercent =
    prev !== 0 && Number.isFinite(prev) ? Math.round((change / prev) * 10000) / 100 : 0;
  const open = Math.round((close - change * 0.5) * 100) / 100;
  const high = Math.max(open, close) + Math.abs(fracFromSymbol(upper, 3));
  const low = Math.min(open, close) - Math.abs(fracFromSymbol(upper, 4));
  const volume = 100000 + (hashSymbol(upper) % 500000) * 100;

  return {
    symbol: upper,
    open,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close,
    volume,
    change,
    changePercent: Number.isFinite(changePercent) ? changePercent : 0,
    time: new Date().toISOString(),
    marketCap: '1.25 Cr',
    pe: 18 + (hashSymbol(upper) % 30),
    high52: Math.round(close * 1.15 * 100) / 100,
    low52: Math.round(close * 0.85 * 100) / 100,
    dividendYield: 0.5 + fracFromSymbol(upper, 5),
    dividendAmount: 2,
    quarterlyDividendAmount: 0.5,
  };
}

export function mockAiPrediction(symbol: string): Record<string, unknown> {
  const upper = symbol.trim().toUpperCase();
  const quote = mockStockQuote(upper);
  const current = quote.close;
  const delta = (fracFromSymbol(upper, 11) - 0.45) * current * 0.02;
  const predictedPrice = Math.round((current + delta) * 100) / 100;
  const confidence = Math.round((0.65 + fracFromSymbol(upper, 12) * 0.25) * 100) / 100;
  const direction: 'up' | 'down' | 'neutral' =
    predictedPrice > current + 1.5 ? 'up' : predictedPrice < current - 1.5 ? 'down' : 'neutral';

  return {
    predictedPrice,
    confidence,
    direction,
    timeframe: '7 days',
    reasoning: [
      'Mock mode: technical structure looks balanced versus recent range.',
      'Volume profile (fixture) suggests typical retail participation.',
      'Sentiment placeholder for offline demo.',
    ],
    riskLevel: confidence > 0.78 ? 'low' : confidence > 0.65 ? 'medium' : 'high',
    factors: {
      technical: Math.round((0.35 + fracFromSymbol(upper, 13) * 0.3) * 100) / 100,
      fundamental: Math.round((0.3 + fracFromSymbol(upper, 14) * 0.35) * 100) / 100,
      sentiment: Math.round((0.3 + fracFromSymbol(upper, 15) * 0.35) * 100) / 100,
    },
  };
}

export function mockPredictAllRows(symbols: string[]): {
  symbol: string;
  currentPrice: number | null;
  predictedPrice: number | null;
}[] {
  return symbols.map((sym) => {
    const upper = sym.trim().toUpperCase();
    const q = mockStockQuote(upper);
    const pred = mockAiPrediction(upper).predictedPrice;
    const predicted =
      typeof pred === 'number' && Number.isFinite(pred) ? pred : q.close * 1.01;
    return {
      symbol: upper,
      currentPrice: q.close,
      predictedPrice: Math.round(predicted * 100) / 100,
    };
  });
}

export function mockMarketIndicesJson(): {
  quoteResponse: {
    result: {
      symbol: string;
      regularMarketPrice: number;
      regularMarketChange: number;
      regularMarketChangePercent: number;
    }[];
  };
} {
  return {
    quoteResponse: {
      result: [
        { symbol: '^NSEI', regularMarketPrice: 24520.35, regularMarketChange: 42.1, regularMarketChangePercent: 0.17 },
        { symbol: '^NIFTYMIDCAP50', regularMarketPrice: 14280.5, regularMarketChange: -18.2, regularMarketChangePercent: -0.13 },
        { symbol: '^NSEBANK', regularMarketPrice: 53240.0, regularMarketChange: 210.5, regularMarketChangePercent: 0.4 },
        { symbol: '^CNXIT', regularMarketPrice: 38500.25, regularMarketChange: 95.0, regularMarketChangePercent: 0.25 },
        { symbol: '^CNXPHARMA', regularMarketPrice: 21000.0, regularMarketChange: -55.0, regularMarketChangePercent: -0.26 },
        { symbol: '^CNXAUTO', regularMarketPrice: 22800.0, regularMarketChange: 120.0, regularMarketChangePercent: 0.53 },
        { symbol: '^CNXFMCG', regularMarketPrice: 56800.0, regularMarketChange: 44.0, regularMarketChangePercent: 0.08 },
        { symbol: '^CNXMETAL', regularMarketPrice: 10250.0, regularMarketChange: -90.0, regularMarketChangePercent: -0.87 },
      ],
    },
  };
}

export function mockStockHistory(symbol: string): HistoryPoint[] {
  const upper = symbol.trim().toUpperCase();
  const end = mockStockQuote(upper).close;
  const points: HistoryPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const wobble = fracFromSymbol(upper, 20 + i) * 0.02 - 0.01;
    const close = Math.round(end * (1 + wobble) * 100) / 100;
    const open = Math.round(close * (1 + (fracFromSymbol(upper, 40 + i) - 0.5) * 0.01) * 100) / 100;
    const high = Math.max(open, close) + 0.5;
    const low = Math.min(open, close) - 0.5;
    points.push({
      date: d.toISOString().slice(0, 10),
      open,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close,
      volume: 50000 + (hashSymbol(upper + i) % 100000),
    });
  }
  return points;
}
