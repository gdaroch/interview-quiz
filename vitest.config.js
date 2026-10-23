import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // e2e specs belong to Playwright
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
});
