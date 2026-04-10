import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    isolate: true,
    globalSetup: 'tests/integration/globalSetup.ts',
    include: ['tests/**/*.int.{spec,test}.ts'],
    env: {
      DOTENV_CONFIG_PATH: 'profiles/.env.test',
    },
    fileParallelism: false
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@modules': path.resolve(__dirname, './src/modules'),
    },
  },
});
