import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The three.js scene is imperative by design: geometry, materials and the
    // callout overlay are mutated per frame rather than re-rendered.
    files: ["components/scene/**"],
    rules: { "react-hooks/immutability": "off" },
  },
]);

export default eslintConfig;
