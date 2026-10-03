import path from "node:path";

import { defineConfig } from "vitest/config";

// `.mts` so Vite loads this as ESM.
const root = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    setupFiles: ["test/setup.ts"],
    coverage: {
      provider: "v8",
      // Untested files still count, as 0%.
      include: ["lib/**", "app/**", "components/**"],
      // Pages and components count too; only type files are skipped.
      exclude: ["**/*.d.ts", "**/types.ts"],
      reporter: ["text", "html"],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
    exclude: ["node_modules/**", ".next/**"],
  },
  resolve: {
    // Use the `@/*` alias from tsconfig.
    tsconfigPaths: true,
    alias: [
      {
        // server-only throws outside React Server Components; stub it in tests.
        find: /^server-only$/,
        replacement: path.resolve(root, "test/stubs/server-only.ts"),
      },
    ],
  },
});
