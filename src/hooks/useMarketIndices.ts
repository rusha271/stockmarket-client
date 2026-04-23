'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { isMarketOpen } from '@/utils/timeSlots';

const MARKET_INDICES_API = '/api/market-indices';
const POLL_INTERVAL_MS = 5000;

export interface MarketIndex {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
}

interface YahooQuoteResult {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  shortName?: string;
}

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: YahooQuoteResult[];
    error?: unknown;
  };
}

function parseResponse(json: YahooQuoteResponse): MarketIndex[] {
  const results = json?.quoteResponse?.result;
  if (!Array.isArray(results)) return [];

  return results
    .filter(
      (r): r is YahooQuoteResult & { symbol: string; regularMarketPrice: number } =>
        typeof r?.symbol === 'string' &&
        typeof r?.regularMarketPrice === 'number'
    )
    .map((r) => ({
      symbol: r.symbol,
      regularMarketPrice: r.regularMarketPrice,
      regularMarketChange: typeof r.regularMarketChange === 'number' ? r.regularMarketChange : 0,
      regularMarketChangePercent:
        typeof r.regularMarketChangePercent === 'number' ? r.regularMarketChangePercent : 0,
    }));
}

export function useMarketIndices(): {
  data: MarketIndex[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pendingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchIndices = useCallback(async (signal?: AbortSignal | null) => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (pendingRef.current) return;

    pendingRef.current = true;
    const fetchOptions: RequestInit = { headers: { Accept: 'application/json' }, cache: 'no-store' };
    if (signal) fetchOptions.signal = signal;

    try {
      const res = await fetch(MARKET_INDICES_API, fetchOptions);
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as YahooQuoteResponse;
      if (!mountedRef.current) return;
      const parsed = parseResponse(json);
      if (mountedRef.current) {
        if (parsed.length > 0) {
          setData(parsed);
          setError(null);
        } else if (json?.quoteResponse?.result && Array.isArray(json.quoteResponse.result)) {
          setError(new Error('No valid index data in response'));
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch indices'));
      }
    } finally {
      pendingRef.current = false;
    }
  }, []);

  const refetch = useCallback(async () => {
    if (!mountedRef.current) return;
    setError(null);
    setLoading(true);
    await fetchIndices();
    if (mountedRef.current) setLoading(false);
  }, [fetchIndices]);

  useEffect(() => {
    mountedRef.current = true;
    if (isMarketOpen()) {
      setLoading(true);
      fetchIndices().finally(() => {
        if (mountedRef.current) setLoading(false);
      });
    } else {
      setLoading(false);
    }

    if (isMarketOpen()) {
      intervalRef.current = setInterval(() => {
        if (!isMarketOpen()) return;
        if (typeof document !== 'undefined' && document.hidden) return;
        pollAbortRef.current = new AbortController();
        fetchIndices(pollAbortRef.current.signal);
      }, POLL_INTERVAL_MS);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (pollAbortRef.current) {
        pollAbortRef.current.abort();
        pollAbortRef.current = null;
      }
    };
  }, [fetchIndices]);

  return { data, loading, error, refetch };
}
