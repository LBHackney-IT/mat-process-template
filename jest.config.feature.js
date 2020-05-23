/* eslint-env node */
module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testRunner: "jest-circus/runner",
  setupFilesAfterEnv: [
    "dotenv/config",
    "cross-fetch/polyfill",
    "jest-axe/extend-expect",
    "<rootDir>/__tests__/jest.setup.feature.ts",
  ],
  testMatch: [
    "<rootDir>/__tests__/features/**/?(*.)+(spec|steps|test).[jt]s?(x)",
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  restoreMocks: true,
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/__tests__/tsconfig.json",
      babelConfig: "<rootDir>/babel.config.js",
    },
  },
};
