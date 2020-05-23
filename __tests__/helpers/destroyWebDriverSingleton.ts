export const destroyWebDriverSingleton = async (): Promise<void> => {
  const browser = global.browser;

  delete global.browser;

  await browser?.quit();
};
