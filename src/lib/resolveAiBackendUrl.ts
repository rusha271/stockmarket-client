/**
 * FastAPI AI service URL. Prefer AI_BACKEND_URL, then NEXT_PUBLIC_AI_BACKEND_URL,
 * then NEXT_PUBLIC_API_URL. Falls back to deployed AI backend.
 */
export function getAiBackendBaseUrl(): string {
  const explicit = process.env.AI_BACKEND_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const aiPublic = process.env.NEXT_PUBLIC_AI_BACKEND_URL?.trim();
  if (aiPublic) return aiPublic.replace(/\/$/, '');
  const fromPublic = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromPublic) return fromPublic.replace(/\/$/, '');
  return 'https://cardstock-landside-ogle.ngrok-free.dev';
}
