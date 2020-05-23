/* eslint-env node */
require("dotenv/config");
const withOffline = require("next-offline");
const { join } = require("path");
const basePath = require("./config/basePath");
const findAllRoutes = require("./build/helpers/findAllRoutes");

const dev = process.env.NODE_ENV !== "production";

// Environment variables need to be set at build time to have them be included
// in the client files.
const env = {
  ENVIRONMENT_NAME: process.env.ENVIRONMENT_NAME,
  PROCESS_NAME: process.env.PROCESS_NAME,
  WORKTRAY_URL: process.env.WORKTRAY_URL,
  DIVERSITY_FORM_URL: process.env.DIVERSITY_FORM_URL,
  FEEDBACK_FORM_URL: process.env.FEEDBACK_FORM_URL,
};

if (dev) {
  Object.assign(env, {
    TEST_PROCESS_REF: process.env.TEST_PROCESS_REF,
    TEST_PROCESS_API_JWT: process.env.TEST_PROCESS_API_JWT,
    TEST_MAT_API_JWT: process.env.TEST_MAT_API_JWT,
    TEST_MAT_API_DATA: process.env.TEST_MAT_API_DATA,
    TEST_PROCESS_STAGE: process.env.TEST_PROCESS_STAGE,
  });
}

for (const [key, value] of Object.entries(env)) {
  if (value === undefined) {
    throw new Error(`Environment value ${key} is required but missing`);
  }
}

module.exports = withOffline({
  assetPrefix: basePath,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  publicRuntimeConfig: {
    allRoutes: findAllRoutes(
      join(__dirname, "pages"),
      new RegExp(`\\.(?:${["js", "jsx", "ts", "tsx"].join("|")})$`),
      /^api/
    ),
  },
  env,
  registerSwPrefix: basePath,
  scope: `${basePath}/`,
  workboxOpts: {
    exclude: [/\/api\//],
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "offlinePageCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
      {
        urlPattern: /\.(?:css|js)$/,
        handler: "CacheFirst",
        method: "GET",
        options: {
          cacheName: "offlineFileCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  },
});
