import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3300/";
const OUT = process.env.SHOT_DIR || "shots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];

const page = await browser.newPage({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(700);

const metrics = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  focusHeight: document.querySelector("#focus")?.getBoundingClientRect().height,
}));

await page.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });
await page.screenshot({ path: `${OUT}/hero.png` });

for (const id of ["experience", "projects", "skills", "education", "contact"]) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await section.screenshot({ path: `${OUT}/${id}.png` });
}

/* the pinned Focus section, captured while pinned */
const focusTop = await page.evaluate(() => {
  const element = document.querySelector("#focus");
  return element
    ? element.getBoundingClientRect().top + window.scrollY
    : 0;
});
await page.evaluate(
  (y) => window.scrollTo({ top: y, behavior: "instant" }),
  focusTop + 160,
);
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/focus.png` });

/* mobile */
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(BASE, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: `${OUT}/mobile-hero.png` });
await mobile.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });

await browser.close();
console.log(JSON.stringify({ metrics, errors }, null, 2));
