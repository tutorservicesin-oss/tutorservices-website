import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "assets/**",
      "vendor/**",
      "*.html",
      "*.js",
      "*.min.css",
      "api/**",
      "scripts/**"
    ],
  },
];

export default eslintConfig;
