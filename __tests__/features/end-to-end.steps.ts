/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineFeature, loadFeature } from "jest-cucumber";
import { join } from "path";
import { until } from "selenium-webdriver";
import { Expect } from "../helpers/Expect";

jest.setTimeout(120 * 1000);

const imagePath = join(__dirname, "..", "__fixtures__", "image.jpg");
const processData = {};

defineFeature(loadFeature("./end-to-end.feature"), (test) => {
  test("Performing a check", ({ when, then }) => {
    when("I complete a process", async () => {
      const processRef = process.env.TEST_PROCESS_REF;

      // Index page
      await browser!.getRelative("", true);

      // Wait for redirect.
      await browser!.wait(
        until.elementLocated({ css: '[data-testid="submit"]' }),
        10000
      );

      // Loading page
      await expect(browser!.getCurrentUrl()).resolves.toContain(
        `${processRef}/loading`
      );

      // Wait for data fetching.
      await browser!.waitForEnabledElement(
        { css: '[data-testid="submit"]' },
        1000,
        10000
      );

      await browser!.submit();

      // Review page
      await expect(browser!.getCurrentUrl()).resolves.toContain(
        `${processRef}/review`
      );

      await browser!.submit();

      // Submit page
      await expect(browser!.getCurrentUrl()).resolves.toContain(
        `${processRef}/submit`
      );

      await browser!.submit();

      // Wait for the submission to finish.
      await browser!.wait(until.urlMatches(/\/confirmed$/));

      // Confirmed page
      await expect(browser!.getCurrentUrl()).resolves.toContain(
        `${processRef}/confirmed`
      );
    });

    then("I should see that the process has been submitted", async () => {
      await Expect.pageToContain("has been submitted for manager review");
    });

    then("the data in the backend should match the answers given", async () => {
      const response = await fetch(
        `https://${process.env.PROCESS_API_HOST}${process.env.PROCESS_API_BASE_URL}/v1/processData/${process.env.TEST_PROCESS_REF}`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": process.env.PROCESS_API_KEY || "",
          },
        }
      );

      expect(response.status).toEqual(200);

      const responseData = await response.json();

      const persistedProcessData = JSON.parse(
        JSON.stringify(responseData.processData.processData).replace(
          /image:[\w-]+?.+?(?=")/g,
          imagePath
        )
      );

      expect(persistedProcessData.submitted).toBeDefined();
      expect({
        ...persistedProcessData,
        submitted: undefined,
      }).toEqual(processData);
    });
  });
});
