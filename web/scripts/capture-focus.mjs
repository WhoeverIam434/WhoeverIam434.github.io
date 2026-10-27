import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3300/";
const OUT = "shots/focus";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];

const page = await browser.newPage({
  viewport: { width: 1440, height: 950 },
});
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

await page.goto(BASE, { waitUntil: "networkidle" });

const focus = page.locator("#focus");
const focusBox = await focus.boundingBox();
const focusHeight = await focus.evaluate(
  (element) => element.getBoundingClientRect().height,
);

const progressbar = page.locator('[role="progressbar"]');
const readProgress = async () => Number(await progressbar.getAttribute("aria-valuenow"));

/* pin the section and charge a little */
await page.evaluate((y) => window.scrollTo(0, y), focusBox.y + 120);
await page.waitForTimeout(450);
const stickyTop = await page.evaluate(
  () => document.querySelector("#focus > div").getBoundingClientRect().top,
);
const progressEarly = await readProgress();
await page.screenshot({ path: `${OUT}/pinned-early.png` });

/* charge further */
await page.evaluate(() => window.scrollBy(0, 380));
await page.waitForTimeout(400);
const progressMid = await readProgress();
await page.screenshot({ path: `${OUT}/pinned-charged.png` });

/* hover a focus card */
const controlCard = page.locator("#focus button", { hasText: "Control Systems" });
await controlCard.hover();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/hover-control.png` });

/* open the pendulum minigame */
await controlCard.click();
await page.waitForTimeout(900);
const dialog = page.locator('[role="dialog"]');
const dialogVisible = await dialog.isVisible();
await page.screenshot({ path: `${OUT}/game-desktop.png` });

/* destabilise, then try to enter an unreasonable value */
const kpInput = page.locator('input[aria-label="Kp value"]');
await kpInput.fill("2");
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/game-unstable.png` });

await kpInput.fill("9999");
const kpAfterClamp = await kpInput.inputValue();

/* reset */
await page.click('button:has-text("Reset")');
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/game-after-reset.png` });

/* Escape closes */
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
const dialogsAfterEscape = await dialog.count();

/* TODO minigame */
await page.locator("#focus button", { hasText: "Robotics" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/game-todo.png` });
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

/* charge to full */
await page.evaluate(
  (height) => window.scrollBy(0, height),
  focusHeight - 950 + 120,
);
await page.waitForTimeout(500);
const progressFull = await readProgress();
await page.screenshot({ path: `${OUT}/charge-complete.png` });

/* mobile */
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(BASE, { waitUntil: "networkidle" });
const mobileFocusBox = await mobile.locator("#focus").boundingBox();
await mobile.evaluate((y) => window.scrollTo(0, y), mobileFocusBox.y + 220);
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: `${OUT}/mobile-pinned.png` });
await mobile
  .locator("#focus button", { hasText: "Control Systems" })
  .click();
await mobile.waitForTimeout(900);
await mobile.screenshot({ path: `${OUT}/mobile-game.png` });

await browser.close();

console.log(
  JSON.stringify(
    {
      focusHeight,
      stickyTopWhilePinned: stickyTop,
      progressEarly,
      progressMid,
      progressFull,
      dialogVisible,
      kpAfterClamp,
      dialogsAfterEscape,
      errors,
    },
    null,
    2,
  ),
);
