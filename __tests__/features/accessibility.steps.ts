/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineFeature, loadFeature } from "jest-cucumber";
import { DefineScenarioFunctionWithAliases } from "jest-cucumber/dist/src/feature-definition-creation";
import { Then } from "../helpers/Then";
import { When } from "../helpers/When";

const testAccessibility = (
  test: DefineScenarioFunctionWithAliases,
  pageName: string,
  pageTitle = pageName
): void => {
  test(`${pageName} page is accessible`, ({ defineStep, then }) => {
    When.iStartTheProcess(defineStep);
    When.iWaitForTheDataToBeFetched(defineStep);
    When.iVisitXForProcess(defineStep);

    Then.thePageShouldBeAccessible(defineStep);

    then("the page should have a descriptive title", async () => {
      await expect(browser!.getTitle()).resolves.toEqual(
        `${pageTitle} - TODO - Manage a tenancy`
      );
    });
  });
};

defineFeature(loadFeature("./accessibility.feature"), (test) => {
  test("Index page is accessible", ({ defineStep, when, then }) => {
    when(/^I visit the index page$/, async () => {
      await browser!.getRelative("", true);
    });

    Then.thePageShouldBeAccessible(defineStep);

    then("the page should have a descriptive title", async () => {
      await expect(browser!.getTitle()).resolves.toEqual(
        "Loading - TODO - Manage a tenancy"
      );
    });
  });

  test("Loading page is accessible", ({ defineStep, then }) => {
    When.iStartTheProcess(defineStep);
    When.iWaitForTheDataToBeFetched(defineStep);

    Then.thePageShouldBeAccessible(defineStep);

    then("the page should have a descriptive title", async () => {
      await expect(browser!.getTitle()).resolves.toEqual(
        "Loading - TODO - Manage a tenancy"
      );
    });
  });

  testAccessibility(test, "Review");
  testAccessibility(test, "Submit");
  testAccessibility(test, "Confirmed");
  testAccessibility(test, "Pause");
  testAccessibility(test, "Paused");
});
