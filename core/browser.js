import { chromium } from "playwright";

export async function ensureBrowser() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });

  return {
    browser: context,
    close: async () => {
      await context.close();
      await browser.close();
    },
  };
}
