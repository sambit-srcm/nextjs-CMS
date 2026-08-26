import path from "node:path";

import { defineConfig } from "vitest/config";

// `.mts` so Vite loads this as ESM. As a `.ts` file it is treated as CommonJS,
// which warns today and is planned to become an error.
const root = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    setupFiles: ["test/setup.ts"],
    coverage: {
      provider: "v8",
      // Everything matching `include` is reported, tested or not, so an
      // untested module shows as 0% rather than vanishing from the total.
      include: ["lib/**", "app/**", "components/**"],
      // Pages and components are in scope: excluding them would report a
      // percentage over the data layer alone, which flatters the number.
      // Only type declarations are dropped, since they compile away.
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.d.ts", "**/types.ts"],
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
