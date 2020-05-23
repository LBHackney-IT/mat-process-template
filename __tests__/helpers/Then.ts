/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { axe } from "jest-axe";
import { DefineStepFunction } from "jest-cucumber";
import { Expect } from "./Expect";

export class Then {
  static iShouldBeAbleToContinue(defineStep: DefineStepFunction): void {
    defineStep("I should be able to continue", async () => {
      await Expect.toBeEnabled({
        css: '[data-testid="submit"]',
      });
    });
  }

  static iShouldntBeAbleToContinue(defineStep: DefineStepFunction): void {
    defineStep("I shouldn't be able to continue", async () => {
      await Expect.toBeDisabled({
        css: '[data-testid="submit"]',
      });
    });
  }

  static iShouldSeeXOnThePage(defineStep: DefineStepFunction): void {
    defineStep(/^I should see "(.+)" on the page$/, async (content: string) => {
      const element = await browser!.findElement({ tagName: "body" });

      await expect(element.getText()).resolves.toContain(content);
    });
  }

  static thePageShouldBeAccessible(defineStep: DefineStepFunction): void {
    defineStep("the page should be accessible", async () => {
      const document = await browser!.getPageSource();

      await expect(axe(document)).resolves.toHaveNoViolations();
    });
  }

  static thePageTitleShouldBeX(defineStep: DefineStepFunction): void {
    defineStep(/^the page title should be "(.+)"$/, async (title: string) => {
      await expect(browser!.getTitle()).resolves.toEqual(title);
    });
  }
}
