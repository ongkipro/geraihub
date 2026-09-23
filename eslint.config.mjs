import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/worker/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["../app/*", "../../app/*", "@/app/*"], message: "Worker code cannot depend on UI routes." }] },
      ],
    },
  },
];

export default config;
