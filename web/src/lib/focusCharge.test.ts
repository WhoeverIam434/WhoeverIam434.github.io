import assert from "node:assert/strict";
import { test } from "node:test";

import { computeCharge } from "./focusCharge.ts";

const VIEWPORT = 900;
const SECTION = VIEWPORT + 600; // 600px of charge travel

test("charge is empty while the section is still below the fold", () => {
  const state = computeCharge(400, SECTION, VIEWPORT);
  assert.equal(state.progress, 0);
  assert.equal(state.pinned, false);
  assert.equal(state.complete, false);
});

test("charge starts at zero when the panel just pins", () => {
  const state = computeCharge(0, SECTION, VIEWPORT);
  assert.equal(state.progress, 0);
  assert.equal(state.pinned, true);
  assert.equal(state.complete, false);
});

test("progress follows the scrolled distance", () => {
  assert.equal(computeCharge(-150, SECTION, VIEWPORT).progress, 0.25);
  assert.equal(computeCharge(-300, SECTION, VIEWPORT).progress, 0.5);
});

test("charge completes exactly when the travel is used up", () => {
  const state = computeCharge(-600, SECTION, VIEWPORT);
  assert.equal(state.progress, 1);
  assert.equal(state.pinned, true);
  assert.equal(state.complete, true);
});

test("progress clamps after the section has been scrolled past", () => {
  const state = computeCharge(-1400, SECTION, VIEWPORT);
  assert.equal(state.progress, 1);
  assert.equal(state.pinned, false);
  assert.equal(state.complete, true);
});

test("a section shorter than the viewport never divides by zero", () => {
  const state = computeCharge(0, 400, VIEWPORT);
  assert.equal(state.progress, 0);
  assert.equal(state.complete, false);
});
