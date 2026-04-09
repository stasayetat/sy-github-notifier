export type ApiResponse = { status: 429; retryAfterMs: number; message: string } | { status: number; message: string };
