import querystring from "querystring";
import {
  Browser,
  Builder,
  Locator,
  until,
  WebDriver,
  WebElement,
} from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import firefox from "selenium-webdriver/firefox";

export interface WebDriverWrapperCreateOptions {
  browser?: string;
  headless?: boolean;
  baseUrl?: string;
}

export class WebDriverWrapper implements WebDriver {
  static async create({
    browser = Browser.CHROME,
    headless = true,
    baseUrl,
  }: WebDriverWrapperCreateOptions = {}): Promise<WebDriverWrapper> {
    const windowSize = { width: 1280, height: 720 };

    const chromeOptions = new chrome.Options().windowSize(windowSize);
    const firefoxOptions = new firefox.Options().windowSize(windowSize);

    if (headless) {
      chromeOptions.headless();
      firefoxOptions.headless();
    }

    const builder = new Builder()
      .forBrowser(browser)
      .setChromeOptions(chromeOptions)
      .setFirefoxOptions(firefoxOptions);

    return new this(await builder.build(), baseUrl);
  }

  readonly driver: WebDriver;
  readonly baseUrl?: string;

  /* WebDriver methods */

  readonly execute: WebDriver["execute"];
  readonly setFileDetector: WebDriver["setFileDetector"];
  readonly getExecutor: WebDriver["getExecutor"];
  readonly getSession: WebDriver["getSession"];
  readonly getCapabilities: WebDriver["getCapabilities"];
  readonly quit: WebDriver["quit"];
  readonly actions: WebDriver["actions"];
  readonly executeScript: WebDriver["executeScript"];
  readonly executeAsyncScript: WebDriver["executeAsyncScript"];
  readonly wait: WebDriver["wait"];
  readonly sleep: WebDriver["sleep"];
  readonly getWindowHandle: WebDriver["getWindowHandle"];
  readonly getAllWindowHandles: WebDriver["getAllWindowHandles"];
  readonly getPageSource: WebDriver["getPageSource"];
  readonly getCurrentUrl: WebDriver["getCurrentUrl"];
  readonly close: WebDriver["close"];
  readonly get: WebDriver["get"];
  readonly getTitle: WebDriver["getTitle"];
  readonly findElement: WebDriver["findElement"];
  readonly findElements: WebDriver["findElements"];
  readonly takeScreenshot: WebDriver["takeScreenshot"];
  readonly manage: WebDriver["manage"];
  readonly navigate: WebDriver["navigate"];
  readonly switchTo: WebDriver["switchTo"];

  constructor(driver: WebDriver, baseUrl?: string) {
    this.driver = driver;
    this.baseUrl = baseUrl;

    /* WebDriver methods */

    this.execute = this.driver.execute.bind(this.driver);
    this.setFileDetector = this.driver.setFileDetector.bind(this.driver);
    this.getExecutor = this.driver.getExecutor.bind(this.driver);
    this.getSession = this.driver.getSession.bind(this.driver);
    this.getCapabilities = this.driver.getCapabilities.bind(this.driver);
    this.quit = this.driver.quit.bind(this.driver);
    this.actions = this.driver.actions.bind(this.driver);
    this.executeScript = this.driver.executeScript.bind(this.driver);
    this.executeAsyncScript = this.driver.executeAsyncScript.bind(this.driver);
    this.wait = this.driver.wait.bind(this.driver);
    this.sleep = this.driver.sleep.bind(this.driver);
    this.getWindowHandle = this.driver.getWindowHandle.bind(this.driver);
    this.getAllWindowHandles = this.driver.getAllWindowHandles.bind(
      this.driver
    );
    this.getPageSource = this.driver.getPageSource.bind(this.driver);
    this.getCurrentUrl = this.driver.getCurrentUrl.bind(this.driver);
    this.close = this.driver.close.bind(this.driver);
    this.get = this.driver.get.bind(this.driver);
    this.getTitle = this.driver.getTitle.bind(this.driver);
    this.findElement = this.driver.findElement.bind(this.driver);
    this.findElements = this.driver.findElements.bind(this.driver);
    this.takeScreenshot = this.driver.takeScreenshot.bind(this.driver);
    this.manage = this.driver.manage.bind(this.driver);
    this.navigate = this.driver.navigate.bind(this.driver);
    this.switchTo = this.driver.switchTo.bind(this.driver);
  }

  async getRelative(
    relativeUrl: string,
    includeParameters = false
  ): Promise<void> {
    if (!this.baseUrl) {
      throw new Error(`No base URL is set to make ${relativeUrl} relative to.`);
    }

    if (includeParameters) {
      relativeUrl += `?${querystring.stringify({
        processRef: process.env.TEST_PROCESS_REF,
        processApiJwt: process.env.TEST_PROCESS_API_JWT,
        matApiJwt: process.env.TEST_MAT_API_JWT,
        data: process.env.TEST_MAT_API_DATA,
      })}`;
    }

    const url = `${this.baseUrl}${relativeUrl}`;

    return this.get(url);
  }

  async waitForEnabledElement(
    locator: Locator,
    locateTimeout = 1000,
    enabledTimeout = 1000
  ): Promise<WebElement> {
    const url = await this.getCurrentUrl();

    const element = await this.wait(
      until.elementLocated(locator),
      locateTimeout,
      `Unable to find ${JSON.stringify(locator)} on ${url}`
    );

    return this.wait(
      until.elementIsEnabled(element),
      enabledTimeout,
      `${JSON.stringify(locator)} on ${url} never became enabled`
    );
  }

  async submit(
    locator: Locator = { css: '[data-testid="submit"]' },
    submitTimeout = 10000
  ): Promise<void> {
    const url = await this.getCurrentUrl();

    const submitButton = await this.waitForEnabledElement(locator);

    await submitButton.click();
    await this.wait(
      until.stalenessOf(submitButton),
      submitTimeout,
      `${url} never became stale`
    );
  }
}
