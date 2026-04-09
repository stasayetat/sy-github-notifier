import { env } from '@shared/env';
import { logger } from '@shared/logger';
import { getOrSet } from '@shared/redis';
import { ApiError, E, LatestReleaseResponse } from '@shared/types';
import { getErrorMessage } from '@shared/utils';
import { resolveRetryAfterMs } from '@shared/utils/github.utils';
import axios, { AxiosRequestConfig } from 'axios';
import ms from 'ms';

export namespace GithubApiClient {
  const baseUrl = 'https://api.github.com';

  const GITHUB_AUTH_HEADERS: AxiosRequestConfig = {
    validateStatus: status => [200, 404, 429].includes(status),
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_AUTH_TOKEN}`,
      'X-GitHub-Api-Version': '2026-03-10',
    },
  };

  export const getLatestRelease = (repo: string): Promise<E.Either<ApiError, LatestReleaseResponse>> => {
    return getOrSet(
      `github:release:${repo}`,
      ms('10 minutes'),
      () => getSimple<LatestReleaseResponse>(`/repos/${repo}/releases/latest`),
      either => E.isRight(either),
    );
  };

  const getSimple = async <T>(path: string): Promise<E.Either<ApiError, T>> => {
    try {
      const response = await axios.get<T>(baseUrl + path, GITHUB_AUTH_HEADERS);

      if (response.status === 429) {
        const retryAfterMs = resolveRetryAfterMs(response);

        return E.left({
          status: 429,
          retryAfterMs,
          message: `GitHub API rate limit exceeded. Retry after ${retryAfterMs}ms`,
        });
      }

      if (response.status !== 200) {
        return E.left({ status: response.status, message: String(response.data) });
      }

      return E.right(response.data);
    } catch (error: unknown) {
      const message = getErrorMessage(error);

      logger.error(`Error getting latest release: ${message}`);

      return E.left({ status: 500, message });
    }
  };
}
