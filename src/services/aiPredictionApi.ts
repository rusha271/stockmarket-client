type ApiErrorType = 'network' | 'timeout' | 'server' | 'unknown';

export class ApiRequestError extends Error {
  type: ApiErrorType;
  status?: number;
  constructor(message: string, type: ApiErrorType, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.type = type;
    this.status = status;
  }
}

interface RequestOptions {
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 1;
const DEFAULT_AI_API_BASE_URL = 'https://cardstock-landside-ogle.ngrok-free.dev';
const MAX_SYMBOLS_PER_REQUEST = 50;

function getAiApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_AI_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    DEFAULT_AI_API_BASE_URL;
  return raw.replace(/\/$/, '');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toFriendlyMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Request failed. Please try again.';
}

async function requestJson<T>(
  url: string,
  init: RequestInit,
  options: RequestOptions = {}
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const serverMessage =
          typeof data?.error === 'string'
            ? data.error
            : `Server error (${response.status}). Please try again.`;
        throw new ApiRequestError(serverMessage, 'server', response.status);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeout);

      const isAbort = error instanceof DOMException && error.name === 'AbortError';
      const isLikelyNetwork = error instanceof TypeError;
      const isLastAttempt = attempt >= retries;

      if (!isLastAttempt) {
        await delay(700 * (attempt + 1));
        continue;
      }

      if (isAbort) {
        throw new ApiRequestError(
          'Request timed out while loading the AI model. Please try again in a moment.',
          'timeout'
        );
      }

      if (error instanceof ApiRequestError) {
        throw error;
      }

      if (isLikelyNetwork) {
        throw new ApiRequestError(
          'Network error. Please check your internet connection and try again.',
          'network'
        );
      }

      throw new ApiRequestError(
        toFriendlyMessage(error),
        'unknown'
      );
    }
  }

  throw new ApiRequestError('Request failed unexpectedly.', 'unknown');
}

interface PredictRequest {
  symbol: string;
  current_time_slot?: string;
  prediction_target_time?: string;
}

interface PredictAllRequest {
  symbols: string[];
  current_time_slot?: string;
  prediction_target_time?: string;
}

function chunkSymbols(symbols: string[], chunkSize: number): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    chunks.push(symbols.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function predictSingleStock(body: PredictRequest): Promise<Record<string, unknown>> {
  const baseUrl = getAiApiBaseUrl();
  return requestJson<Record<string, unknown>>(
    `${baseUrl}/predict`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    { timeoutMs: 60_000, retries: 1 }
  );
}

export async function predictAllStocks(body: PredictAllRequest): Promise<Record<string, unknown>> {
  const baseUrl = getAiApiBaseUrl();
  if (body.symbols.length <= MAX_SYMBOLS_PER_REQUEST) {
    return requestJson<Record<string, unknown>>(
      `${baseUrl}/predict/all`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      { timeoutMs: 60_000, retries: 1 }
    );
  }

  const symbolChunks = chunkSymbols(body.symbols, MAX_SYMBOLS_PER_REQUEST);
  const mergedPredictions: unknown[] = [];

  for (const symbols of symbolChunks) {
    const chunkResponse = await requestJson<Record<string, unknown>>(
      `${baseUrl}/predict/all`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          symbols,
        }),
      },
      { timeoutMs: 60_000, retries: 1 }
    );

    const rows = Array.isArray(chunkResponse)
      ? chunkResponse
      : Array.isArray(chunkResponse.predictions)
        ? chunkResponse.predictions
        : [];
    mergedPredictions.push(...rows);
  }

  return { predictions: mergedPredictions };
}
