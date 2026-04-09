import { AxiosResponse } from 'axios';
import ms from 'ms';

export const resolveRetryAfterMs = (response: AxiosResponse): number => {
  const retryAfter = String(response.headers['retry-after']);

  if (retryAfter) {
    return Number(retryAfter) * 1000;
  }

  const resetAt = String(response.headers['x-ratelimit-reset']);

  if (resetAt) {
    return Math.max(0, Number(resetAt) * 1000 - Date.now());
  }

  return ms('1 minute');
};
