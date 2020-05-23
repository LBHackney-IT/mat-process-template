/* eslint-env node */
require("dotenv/config");
const express = require("express");
const { readFileSync } = require("fs");
const { join } = require("path");
const nextjs = require("next");
const basePath = require("../config/basePath");
const nextConfig = require("../next.config");
const api = require("./api");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000");

const server = express();
const app = nextjs({ dev, conf: nextConfig });

const handle = app.getRequestHandler();

if (dev) {
  console.log("> Starting server in development mode");
}

app
  .prepare()
  .then(() => {
    if (dev) {
      // Handle hot module reloading, which aren't rewritten for us.
      server.use("/_next/*", (req, res) => {
        const url = req.originalUrl.replace(
          "/_next",
          `${nextConfig.assetPrefix}/_next`
        );

        res.redirect(url);
      });
    }

    const sw = readFileSync(
      join(__dirname, "..", nextConfig.distDir, "service-worker.js")
    );

    server
      .head("/", (_req, res) => {
        res.sendStatus(200);
      })
      .use(basePath + "/api", api)
      .get(basePath + "/service-worker.js", (_req, res) => {
        res.send(sw);
      })
      .get("*", (req, res) => {
        if (req.url.startsWith(`${nextConfig.assetPrefix}/_next`)) {
          req.url = req.url.replace(
            new RegExp(`^${nextConfig.assetPrefix}`),
            ""
          );
        }

        handle(req, res);
      })
      .use((_req, res) => {
        res.sendStatus(500);
      })
      .listen(port, (err) => {
        if (err) {
          throw err;
        }

        console.log(`> Ready on port ${port}`);
      });
  })
  .catch((err) => {
    console.error("> An error occurred");
    console.error("> Unable to start the server");
    console.error(err);
  });
