import { mkdir } from "node:fs/promises";

import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3300";
const OUT = "shots/blog";
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

/* home: nav + directory */
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/home-hero.png` });

const navInfo = await page.evaluate(() => {
  const list = document.querySelector("nav ul");
  const rect = list?.getBoundingClientRect();
  const links = Array.from(document.querySelectorAll("nav ul a")).map((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute("href"),
    right: a.getBoundingClientRect().right,
  }));
  return { listRight: rect?.right, viewport: window.innerWidth, links };
});

const directory = page.locator("#directory");
await directory.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await directory.screenshot({ path: `${OUT}/home-directory.png` });

/* academic listing */
await page.goto(`${BASE}/academic`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/academic-list.png`, fullPage: true });

const academicRows = await page.evaluate(() =>
  Array.from(document.querySelectorAll("main li a")).map((a) =>
    a.textContent.replace(/\s+/g, " ").trim(),
  ),
);

/* personal listing */
await page.goto(`${BASE}/personal`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/personal-list.png`, fullPage: true });

/* post page */
await page.goto(`${BASE}/academic/lorem-ipsum`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/post-lorem.png`, fullPage: true });
const postInfo = await page.evaluate(() => ({
  title: document.querySelector("h1")?.textContent,
  bodyBlocks: document.querySelectorAll(".post-body > *").length,
  headings: Array.from(document.querySelectorAll(".post-body h2")).map((h) =>
    h.textContent.trim(),
  ),
  hasPre: document.querySelectorAll(".post-body pre").length,
  hasTable: document.querySelectorAll(".post-body table").length,
}));

/* no-frontmatter post, date should fall back to git/mtime */
await page.goto(`${BASE}/academic/on-linearisation`, {
  waitUntil: "networkidle",
});
const fallback = await page.evaluate(() => ({
  meta: document.querySelector("main p.mono-label")?.textContent?.trim(),
  title: document.querySelector("h1")?.textContent,
}));

/* mobile listing */
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(`${BASE}/academic`, { waitUntil: "networkidle" });
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: `${OUT}/academic-mobile.png`, fullPage: true });

await browser.close();
console.log(
  JSON.stringify(
    { navInfo, academicRows, postInfo, fallback, errors },
    null,
    2,
  ),
);
