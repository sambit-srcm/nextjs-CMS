import path from "node:path";

import { defineConfig } from "vitest/config";

// `.mts` so Vite loads this as ESM. As a `.ts` file it is treated as CommonJS,
// which warns today and is planned to become an error.
const root = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    setupFiles: ["test/setup.ts"],
    coverage: {
      provider: "v8",
      // Everything matching `include` is reported, tested or not, so an
      // untested module shows as 0% rather than vanishing from the total.
      include: ["lib/**", "app/api/**", "components/**"],
      // Route and page components are React Server Components; exercising them
      // needs a rendering harness rather than a unit test, so they are measured
      // through the query and validation layers they delegate to.
      // Types compile away, and .tsx here is React chrome rather than logic.
      exclude: ["**/*.test.ts", "**/*.d.ts", "**/types.ts", "**/*.tsx"],
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
    // Reads `@/*` from tsconfig rather than duplicating the mapping here, so
    // test resolution cannot drift from what the app itself uses.
    tsconfigPaths: true,
    alias: [
      {
        // `server-only` throws outside a React Server Component. Tests exercise
        // these modules directly, so it is stubbed rather than the guard
        // removed — the guard keeps credentials out of client bundles.
        find: /^server-only$/,
        replacement: path.resolve(root, "test/stubs/server-only.ts"),
      },
    ],
  },
});
