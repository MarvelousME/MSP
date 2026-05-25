import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Self-contained Expo project (own lint setup)
      "mobile/**",
      // One-off CLI utilities and scratch scripts (CommonJS)
      "scratch/**",
      "scripts/**",
      "setup-user.js",
      "next.config.js",
      // Legacy / archived code, not part of the Next.js build
      "frontend-old/**",
      "backend/**",
    ],
  },
];

export default eslintConfig;
