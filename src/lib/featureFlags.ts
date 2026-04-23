/**
 * Public env (inlined at build time). On AWS Amplify, set variables in the console
 * so they are available when `next build` runs.
 */
export function isUseMock(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

/** Base URL for real backend API calls (axios and AI backend resolution). No trailing slash. */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://13.235.245.48:8000';
  return raw.replace(/\/$/, '');
}
