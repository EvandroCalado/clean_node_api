import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist'],
    },
  },
});
