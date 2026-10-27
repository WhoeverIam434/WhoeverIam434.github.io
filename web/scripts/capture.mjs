import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3100/";
const OUT = process.env.SHOT_DIR || "shots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];

const page = await browser.newPage({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const metrics = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  width: window.innerWidth,
  cards: document.querySelectorAll("canvas").length,
}));

await page.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });
await page.screenshot({ path: `${OUT}/hero.png` });

for (const id of [
  "focus",
  "experience",
  "projects",
  "skills",
  "education",
  "contact",
]) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await section.screenshot({ path: `${OUT}/${id}.png` });
}

const simulator = page.locator('section[aria-labelledby="simulator-title"]');
await simulator.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await simulator.screenshot({ path: `${OUT}/simulator-default.png` });

/* interaction: destabilise the loop, then check the status pill */
const kpInput = page.locator("#kp-input");
await kpInput.fill("2");
await page.waitForTimeout(1500);
const unstableStatus = await page
  .locator('[role="status"]')
  .first()
  .textContent();
const thetaAfterUnstable = await page
  .locator("section[aria-labelledby='simulator-title'] dd")
  .first()
  .textContent();
await simulator.screenshot({ path: `${OUT}/simulator-unstable.png` });

/* clamp check: an unreasonable value must not reach the controller */
await kpInput.fill("9999");
const clampedValue = await kpInput.inputValue();

/* reset should bring the pendulum back to the initial angle */
await page.click("text=Reset system");
await page.waitForTimeout(500);
const thetaAfterReset = await page
  .locator("section[aria-labelledby='simulator-title'] dd")
  .first()
  .textContent();

/* stable run again, let the loop settle, capture the settled frame */
await kpInput.fill("40");
await page.click("text=Reset system");
await page.waitForTimeout(1800);
await simulator.screenshot({ path: `${OUT}/simulator-settled.png` });
const settledStatus = await page
  .locator('[role="status"]')
  .first()
  .textContent();

/* mobile pass */
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(BASE, { waitUntil: "networkidle" });
await mobile.waitForTimeout(700);
await mobile.screenshot({ path: `${OUT}/mobile-hero.png` });
const menuButton = mobile.locator('button[aria-controls="nav-menu"]');
await menuButton.click();
await mobile.waitForTimeout(350);
await mobile.screenshot({ path: `${OUT}/mobile-menu.png` });
await menuButton.click();
await mobile.waitForTimeout(250);
await mobile.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });
const mobileSim = mobile.locator('section[aria-labelledby="simulator-title"]');
await mobileSim.scrollIntoViewIfNeeded();
await mobile.waitForTimeout(400);
await mobileSim.screenshot({ path: `${OUT}/mobile-simulator.png` });

await browser.close();

console.log(
  JSON.stringify(
    {
      metrics,
      stableStatus: settledStatus?.trim(),
      unstableStatus: unstableStatus?.trim(),
      thetaAfterUnstable: thetaAfterUnstable?.trim(),
      thetaAfterReset: thetaAfterReset?.trim(),
      clampedValue,
      errors,
    },
    null,
    2,
  ),
);
