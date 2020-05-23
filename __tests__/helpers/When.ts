/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DefineStepFunction } from "jest-cucumber";

export class When {
  static iVisitX(defineStep: DefineStepFunction): void {
    defineStep(/^I visit (\/.*)$/, async (relativeUrl: string) => {
      await browser!.getRelative(relativeUrl);
    });
  }

  static iVisitXForProcess(defineStep: DefineStepFunction): void {
    defineStep(
      /^I visit (\/.*) for (a|the) process$/,
      async (relativeUrl: string) => {
        await browser!.getRelative(
          `${
            process.env.TEST_PROCESS_REF
              ? `/${process.env.TEST_PROCESS_REF}`
              : ""
          }${relativeUrl}`
        );
      }
    );
  }

  static iStartTheProcess(defineStep: DefineStepFunction): void {
    defineStep("I start the process", async () => {
      await browser!.getRelative("", true);
    });
  }

  static iWaitForTheDataToBeFetched(defineStep: DefineStepFunction): void {
    defineStep("I wait for the data to be fetched", async () => {
      await browser!.sleep(2000);
    });
  }
}
