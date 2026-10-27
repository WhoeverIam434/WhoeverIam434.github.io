import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GAIN_LIMITS,
  INITIAL_GAINS,
  PLANT,
  clamp,
  closedLoopPolynomial,
  controlForce,
  formatNumber,
  initialState,
  linearizeModel,
  openLoopPoles,
  stabilityReport,
  stepSimulation,
  type Gains,
} from "./pendulum.ts";

const a = (PLANT.gravity * (PLANT.cartMass + PLANT.bobMass)) /
  (PLANT.cartMass * PLANT.length);

test("linearised A and B follow the closed form", () => {
  const { A, B } = linearizeModel();
  assert.equal(A.length, 4);
  assert.ok(A.every((row) => row.length === 4));
  assert.equal(A[1][2], (-PLANT.bobMass * PLANT.gravity) / PLANT.cartMass);
  assert.ok(Math.abs(A[3][2] - a) < 1e-12);
  assert.equal(B[1], 1 / PLANT.cartMass);
  assert.equal(B[3], -1 / (PLANT.cartMass * PLANT.length));
  // only the θ columns of A and the cart row of B are non-trivial
  assert.equal(A[0][1], 1);
  assert.equal(A[2][3], 1);
});

test("open-loop poles include the unstable pair", () => {
  const poles = openLoopPoles();
  const unstable = poles.filter((p) => p.im !== 0);
  assert.equal(unstable.length, 2);
  assert.ok(Math.abs(Math.abs(unstable[0].im) - Math.sqrt(a)) < 1e-12);
});

test("closed-loop polynomial matches the gains", () => {
  const gains: Gains = { kp: 40, ki: 2, kd: 6 };
  const p = closedLoopPolynomial(gains);
  assert.equal(p.quadratic, 12);
  assert.ok(Math.abs(p.linear - (80 - a)) < 1e-12);
  assert.equal(p.constant, 4);
});

test("Routh–Hurwitz marks default gains stable and small Kp unstable", () => {
  assert.equal(stabilityReport(INITIAL_GAINS).stable, true);

  const weak = stabilityReport({ kp: 5, ki: 2, kd: 6 });
  assert.equal(weak.stable, false);

  const noDamping = stabilityReport({ kp: 40, ki: 2, kd: 0 });
  assert.equal(noDamping.stable, false);

  const noIntegral = stabilityReport({ kp: 40, ki: 0, kd: 6 });
  assert.equal(noIntegral.stable, false);
});

test("control force saturates at the actuator limit", () => {
  assert.equal(controlForce(10, 0, 0, INITIAL_GAINS), PLANT.forceLimit);
  assert.equal(controlForce(-10, 0, 0, INITIAL_GAINS), -PLANT.forceLimit);
});

test("closed loop settles from the initial angle with default gains", () => {
  let s = initialState();
  for (let i = 0; i < 240 * 6 && s.status === "running"; i += 1) {
    s = stepSimulation(s, INITIAL_GAINS);
  }
  assert.equal(s.status, "running");
  assert.ok(Math.abs(s.theta) < 0.005, `theta settled to ${s.theta}`);
  assert.ok(Math.abs(s.omega) < 0.05);
});

test("the pendulum falls without proportional feedback", () => {
  let s = initialState();
  const gains: Gains = { kp: 0, ki: 0, kd: 6 };
  let steps = 0;
  while (s.status === "running" && steps < 240 * 10) {
    s = stepSimulation(s, gains);
    steps += 1;
  }
  assert.equal(s.status, "fallen");
  assert.ok(Math.abs(s.theta) > PLANT.fallLimit);
});

test("simulation is frozen once the pendulum has fallen", () => {
  let s = initialState();
  const gains: Gains = { kp: 0, ki: 0, kd: 0 };
  while (s.status === "running") s = stepSimulation(s, gains);
  const frozen = stepSimulation(s, gains);
  assert.deepEqual(frozen, s);
});

test("gain limits clamp out-of-range input", () => {
  for (const key of Object.keys(GAIN_LIMITS) as (keyof typeof GAIN_LIMITS)[]) {
    const { min, max } = GAIN_LIMITS[key];
    assert.equal(clamp(min - 50, min, max), min);
    assert.equal(clamp(max + 50, min, max), max);
  }
  assert.equal(clamp(Number.NaN || 0, 0, 10), 0);
});

test("formatNumber trims noise without a signed zero", () => {
  assert.equal(formatNumber(23.544), "23.544");
  assert.equal(formatNumber(-1.962), "-1.962");
  assert.equal(formatNumber(1), "1");
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(-0.0000001), "0");
});
