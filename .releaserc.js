module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits"
      }],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    ['@semantic-release/npm', { npmPublish: false }],
    [
      '@semantic-release/github',
      {
        failComment: false, // don't create a comment in PRs and issues
        successComment: false, // don't create a 'release failed' issue on the repo
        releasedLabels: ['published'], // tag PRs with [published] when release succeeded
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'pnpm-lock.yaml', 'CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
