/* eslint-env node */
const { readdirSync, statSync } = require("fs");
const { join } = require("path");

const findAllRoutes = (dir, filter, ignore, arr = [], rootDir = dir) => {
  const result = readdirSync(dir);

  result.forEach((part) => {
    const absolutePath = join(dir, part);

    if (ignore && ignore.test(part)) {
      return;
    }

    const pathStat = statSync(absolutePath);

    if (pathStat.isDirectory()) {
      findAllRoutes(absolutePath, filter, ignore, arr, rootDir);
      return;
    }

    if (!filter.test(part)) {
      return;
    }

    arr.push(
      absolutePath.replace(rootDir, "").split(".").slice(0, -1).join(".")
    );
  });

  return arr.sort();
};

module.exports = findAllRoutes;
