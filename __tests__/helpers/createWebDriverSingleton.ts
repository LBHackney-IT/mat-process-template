import { Browser } from "selenium-webdriver";
import yn from "yn";
import basePath from "../../config/basePath";
import { destroyWebDriverSingleton } from "./destroyWebDriverSingleton";
import WebDriverWrapper from "./WebDriverWrapper";

export const createWebDriverSingleton = async (): Promise<void> => {
  await destroyWebDriverSingleton();

  global.browser = await WebDriverWrapper.create({
    browser: process.env.TEST_BROWSER || Browser.CHROME,
    headless: yn(process.env.TEST_HEADLESS, { default: true }),
    baseUrl: `http://localhost:${process.env.PORT || 3000}${basePath}`,
  });
};
