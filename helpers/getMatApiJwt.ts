import { ON_SERVER } from "@hackney/mat-process-utils";
import { nullAsUndefined } from "null-as-undefined";
import basePath from "../config/basePath";

export const getMatApiJwt = (
  processRef: string | undefined
): string | undefined => {
  if (ON_SERVER) {
    return;
  }

  if (!processRef) {
    return;
  }

  return nullAsUndefined(
    sessionStorage.getItem(`${basePath}/${processRef}:matApiJwt`)
  );
};
