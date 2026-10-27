import assert from "node:assert/strict";
import { test } from "node:test";

import {
  firstHeading,
  formatMonthYear,
  humanizeSlug,
  stripLeadingHeading,
} from "./postFormat.ts";

test("formatMonthYear renders month and year in UTC", () => {
  assert.equal(formatMonthYear(new Date("2026-09-12T00:00:00Z")), "Sep 2026");
  assert.equal(formatMonthYear(new Date("2026-06-03T23:00:00Z")), "Jun 2026");
  assert.equal(formatMonthYear(new Date("2025-01-01T00:00:00Z")), "Jan 2025");
  assert.equal(formatMonthYear(new Date("2026-12-31T23:59:00Z")), "Dec 2026");
});

test("humanizeSlug turns file names into titles", () => {
  assert.equal(humanizeSlug("war-dragon_notes"), "War Dragon Notes");
  assert.equal(humanizeSlug("best-game-is-gta-6"), "Best Game Is Gta 6");
  assert.equal(
    humanizeSlug("2026-09-12-lorem-ipsum.md"),
    "Lorem Ipsum",
  );
});

test("firstHeading picks the first Markdown H1", () => {
  assert.equal(firstHeading("# Hello\n\nbody"), "Hello");
  assert.equal(firstHeading("intro\n\n## Sub\n\n# Later"), "Later");
  assert.equal(firstHeading("no heading here"), null);
});

test("stripLeadingHeading removes only the leading H1", () => {
  assert.equal(stripLeadingHeading("# Title\n\nBody"), "Body");
  assert.equal(stripLeadingHeading("# Title\nBody"), "Body");
  assert.equal(
    stripLeadingHeading("Intro\n\n# Not first"),
    "Intro\n\n# Not first",
  );
});
