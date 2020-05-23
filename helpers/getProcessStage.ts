import { ON_SERVER } from "@hackney/mat-process-utils";
import { NextRouter } from "next/router";
import { nullAsUndefined } from "null-as-undefined";
import basePath from "../config/basePath";

export const getProcessStage = (router: NextRouter): string | undefined => {
  if (ON_SERVER) {
    return;
  }

  const { processRef } = router.query;

  return nullAsUndefined(
    sessionStorage.getItem(`${basePath}/${processRef}:processStage`)
  );
};
