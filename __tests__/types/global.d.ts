/* eslint-disable no-var */
import { WebDriverWrapper } from "@hackney/mat-process-utils";
import "jest-fetch-mock";

declare global {
  declare var browser: WebDriverWrapper | undefined;

  namespace NodeJS {
    interface Global {
      browser?: WebDriverWrapper;
    }

    interface Process {
      browser?: boolean;
    }
  }
}
