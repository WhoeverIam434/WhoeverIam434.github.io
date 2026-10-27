/**
 * Cart–pole (inverted pendulum) model.
 *
 * The plant is nonlinear and is integrated with RK4. The linear state-space
 * model about the upright equilibrium is derived analytically from the same
 * parameters, so the matrices shown on the page always match the simulation.
 *
 * State vector:  x = [x, ẋ, θ, θ̇]ᵀ      input: u = F [N]
 */

export const PLANT = {
  /** cart mass [kg] */
  cartMass: 1.0,
  /** pendulum bob mass [kg] */
  bobMass: 0.2,
  /** pivot-to-bob distance [m] */
  length: 0.5,
  /** gravitational acceleration [m/s²] */
  gravity: 9.81,
  /** actuator saturation [N] */
  forceLimit: 120,
  /** angle the simulator resets to: inside the linearisation neighbourhood */
  initialAngle: 0.15,
  /** beyond this |θ| the pendulum is considered fallen and the run stops */
  fallLimit: 1.2,
  /** fixed integration step [s] */
  integrateStep: 1 / 240,
} as const;

export type Gains = {
  kp: number;
  ki: number;
  kd: number;
};

export type Status = "running" | "fallen";

export type SimState = {
  x: number;
  vx: number;
  theta: number;
  omega: number;
  integral: number;
  force: number;
  time: number;
  status: Status;
};

export const GAIN_LIMITS = {
  kp: { min: 0, max: 120, step: 0.5, initial: 40, label: "Kp", unit: "N/rad" },
  ki: { min: 0, max: 40, step: 0.1, initial: 2, label: "Ki", unit: "N/(rad·s)" },
  kd: { min: 0, max: 30, step: 0.1, initial: 6, label: "Kd", unit: "N·s/rad" },
} as const;

export type GainKey = keyof typeof GAIN_LIMITS;

export const INITIAL_GAINS: Gains = {
  kp: GAIN_LIMITS.kp.initial,
  ki: GAIN_LIMITS.ki.initial,
  kd: GAIN_LIMITS.kd.initial,
};

const { cartMass: M, bobMass: m, length: l, gravity: g, forceLimit } = PLANT;

/* ── helpers ───────────────────────────────────────────────────── */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Trim a number to at most `digits` decimals, dropping a negative zero. */
export function formatNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) < 10 ** -digits) return "0";
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

export function initialState(): SimState {
  return {
    x: 0,
    vx: 0,
    theta: PLANT.initialAngle,
    omega: 0,
    integral: 0,
    force: 0,
    time: 0,
    status: "running",
  };
}

/* ── controller ────────────────────────────────────────────────── */

/**
 * PID acting on the pendulum angle (setpoint 0) and producing a cart force.
 * A positive angle (leaning towards +x) calls for a positive force, which is
 * the sign convention that makes the loop stabilising.
 */
export function controlForce(
  theta: number,
  omega: number,
  integral: number,
  gains: Gains,
): number {
  const raw = gains.kp * theta + gains.kd * omega + gains.ki * integral;
  return clamp(raw, -forceLimit, forceLimit);
}

/* ── nonlinear plant ───────────────────────────────────────────── */

type Vec5 = [number, number, number, number, number];

const toVec = (s: SimState): Vec5 => [s.x, s.vx, s.theta, s.omega, s.integral];

function derivative(y: Vec5, gains: Gains): Vec5 {
  const [, vx, theta, omega, integral] = y;
  const force = controlForce(theta, omega, integral, gains);

  const sin = Math.sin(theta);
  const cos = Math.cos(theta);
  const denominator = M + m * sin * sin;

  // cart acceleration, from the two coupled equations of motion
  const xAccel =
    (force + m * l * omega * omega * sin - m * g * sin * cos) / denominator;
  // pendulum angular acceleration
  const thetaAccel = (g * sin - xAccel * cos) / l;

  return [vx, xAccel, omega, thetaAccel, theta];
}

const addScaled = (y: Vec5, k: Vec5, scale: number): Vec5 => [
  y[0] + k[0] * scale,
  y[1] + k[1] * scale,
  y[2] + k[2] * scale,
  y[3] + k[3] * scale,
  y[4] + k[4] * scale,
];

/** One RK4 step of the closed-loop nonlinear model. */
export function stepSimulation(
  state: SimState,
  gains: Gains,
  dt: number = PLANT.integrateStep,
): SimState {
  if (state.status === "fallen") return state;

  const y0 = toVec(state);
  const k1 = derivative(y0, gains);
  const k2 = derivative(addScaled(y0, k1, dt / 2), gains);
  const k3 = derivative(addScaled(y0, k2, dt / 2), gains);
  const k4 = derivative(addScaled(y0, k3, dt), gains);

  const next: Vec5 = [0, 0, 0, 0, 0];
  for (let i = 0; i < 5; i += 1) {
    next[i] =
      y0[i] +
      (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }

  const [x, vx, theta, omega, integral] = next;
  const force = controlForce(theta, omega, integral, gains);
  const fallen = Math.abs(theta) > PLANT.fallLimit;

  return {
    x: clamp(x, -500, 500),
    vx,
    theta,
    omega,
    integral: clamp(integral, -3, 3),
    force,
    time: state.time + dt,
    status: fallen ? "fallen" : "running",
  };
}

/* ── linearisation about θ = 0 ─────────────────────────────────── */

export type LinearModel = {
  A: number[][];
  B: number[];
};

/**
 * Continuous-time model at the upright equilibrium:
 *   ẋ = A x + B u,  u = F
 * with the small-angle substitutions sinθ ≈ θ, cosθ ≈ 1, θ̇² ≈ 0.
 */
export function linearizeModel(): LinearModel {
  const A = [
    [0, 1, 0, 0],
    [0, 0, -(m * g) / M, 0],
    [0, 0, 0, 1],
    [0, 0, (g * (M + m)) / (M * l), 0],
  ];
  const B = [0, 1 / M, 0, -(1 / (M * l))];
  return { A, B };
}

/** Poles of the open-loop linear model: two at the origin, one unstable pair. */
export function openLoopPoles(): { re: number; im: number }[] {
  const omega = Math.sqrt((g * (M + m)) / (M * l));
  return [
    { re: 0, im: 0 },
    { re: 0, im: 0 },
    { re: 0, im: omega },
    { re: 0, im: -omega },
  ];
}

/**
 * Characteristic polynomial of the PID-controlled linear model:
 *   s³ + 2Kd·s² + (2Kp − a)·s + 2Ki = 0,   a = g(M+m)/(Ml)
 * (obtained by differentiating the closed-loop θ equation to absorb ∫θ).
 */
export function closedLoopPolynomial(gains: Gains) {
  const a = (g * (M + m)) / (M * l);
  return {
    cubic: 1,
    quadratic: 2 * gains.kd,
    linear: 2 * gains.kp - a,
    constant: 2 * gains.ki,
  };
}

export type StabilityCheck = {
  label: string;
  detail: string;
  ok: boolean;
};

/** Routh–Hurwitz conditions for the cubic above. */
export function stabilityReport(gains: Gains): {
  stable: boolean;
  checks: StabilityCheck[];
} {
  const p = closedLoopPolynomial(gains);
  const checks: StabilityCheck[] = [
    {
      label: "2Kd > 0",
      detail: formatNumber(p.quadratic, 2),
      ok: p.quadratic > 0,
    },
    {
      label: "2Kp − a > 0",
      detail: formatNumber(p.linear, 2),
      ok: p.linear > 0,
    },
    {
      label: "2Ki > 0",
      detail: formatNumber(p.constant, 2),
      ok: p.constant > 0,
    },
    {
      label: "(2Kd)(2Kp − a) > 2Ki",
      detail: formatNumber(p.quadratic * p.linear, 2),
      ok: p.quadratic * p.linear > p.constant,
    },
  ];
  return { stable: checks.every((c) => c.ok), checks };
}

/** Convenience for UI copy: the linearisation is only meaningful near θ = 0. */
export const LINEARISATION = {
  validityRad: 0.2,
  validityDeg: (0.2 * 180) / Math.PI,
  initialDeg: (PLANT.initialAngle * 180) / Math.PI,
  fallDeg: (PLANT.fallLimit * 180) / Math.PI,
} as const;
