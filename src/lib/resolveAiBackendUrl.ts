/**
 * FastAPI AI service URL. Prefer AI_BACKEND_URL when set; otherwise NEXT_PUBLIC_API_URL
 * so Amplify can use one variable for the deployed API. Falls back to local Uvicorn default.
 */
export function getAiBackendBaseUrl(): string {
  const explicit = process.env.AI_BACKEND_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const fromPublic = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromPublic) return fromPublic.replace(/\/$/, '');
  return 'http://127.0.0.1:8000';
}
