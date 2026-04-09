import { LatestReleaseResponseSchema, RepositoryResponseSchema } from '@shared/schemas';
import zod from 'zod';

export type LatestReleaseResponse = zod.infer<typeof LatestReleaseResponseSchema>;

export type RepositoryResponse = zod.infer<typeof RepositoryResponseSchema>;
