import { describe, expect, it } from 'vitest';

import { hasNewRelease } from '../../../src/modules/scanner/scanner.utils';

const mockRepo = {
  id: 'repo-uuid',
  repo: 'owner/repo',
  last_seen_tag: 'v1.0.0',
  checkedAt: new Date(),
};

const mockRelease = { tag_name: 'v1.0.0', id: 1, name: 'v1.0.0', url: '', body: '', created_at: new Date(), published_at: new Date(), author: { login: '', avatar_url: '' } };

describe('hasNewRelease', () => {
  it('should return true when tags differ', () => {
    const result = hasNewRelease({
      currentRepo: mockRepo,
      fetchedRepo: { ...mockRelease, tag_name: 'v2.0.0' },
    });

    expect(result).toBe(true);
  });

  it('should return false when tags are the same', () => {
    const result = hasNewRelease({
      currentRepo: mockRepo,
      fetchedRepo: { ...mockRelease, tag_name: 'v1.0.0' },
    });

    expect(result).toBe(false);
  });
});
