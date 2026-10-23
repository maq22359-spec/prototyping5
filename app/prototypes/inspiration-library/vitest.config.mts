import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("../../../", import.meta.url)) } },
  test: { environment: "node", include: ["app/prototypes/inspiration-library/tests/**/*.test.ts"], clearMocks: true },
});
