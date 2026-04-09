import zod from 'zod';

export const LatestReleaseResponseSchema = zod.object({
  url: zod.string(),
  id: zod.number(),
  tag_name: zod.string(),
  name: zod.string(),
  body: zod.string(),
  created_at: zod.date(),
  published_at: zod.date(),
  author: zod.object({
    login: zod.string(),
    avatar_url: zod.string(),
  }),
});

export const RepositoryResponseSchema = zod.object({
  id: zod.number(),
  name: zod.string(),
  full_name: zod.string(),
  private: zod.boolean(), // TODO: check on private repos
  owner: zod.object({
    login: zod.string(),
    id: zod.number(),
    avatar_url: zod.string(),
  }),
});
