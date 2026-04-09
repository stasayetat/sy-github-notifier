export type ApiError = { status: 429; retryAfterMs: number; message: string } | { status: number; message: string };
