"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  GAIN_LIMITS,
  INITIAL_GAINS,
  LINEARISATION,
  PLANT,
  type Gains,
  type SimState,
  type Status,
  clamp,
  closedLoopPolynomial,
  formatNumber,
  initialState,
  linearizeModel,
  openLoopPoles,
  stabilityReport,
  stepSimulation,
} from "@/lib/pendulum";

/* ── canvas palette (matches the page's design tokens) ─────────── */
const COLORS = {
  ink: "#14130f",
  muted: "#6e695c",
  line: "#d8d2c2",
  lineStrong: "#b6ae99",
  accent: "#b03d0e",
  card: "#fbfaf6",
  stable: "#1e6b4b",
  danger: "#9a2a16",
} as const;

const MONO =
  'ui-monospace, "SFMono-Regular", "Cascadia Mono", Consolas, "Liberation Mono", monospace';

type Readout = {
  theta: number;
  omega: number;
  x: number;
  force: number;
};

function formatInput(value: number): string {
  return String(Number(value.toFixed(2)));
}

/* ── scene ─────────────────────────────────────────────────────── */

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: SimState,
  camera: number,
  status: Status,
): void {
  ctx.clearRect(0, 0, width, height);

  const groundY = Math.round(height * 0.8);
  // Zoom so the 0.5 m rod fills most of the space above the rail, while still
  // showing enough rail for the cart to move along.
  const pxPerMeter = clamp(
    Math.min(width / 1.55, (groundY - 40) * 1.6),
    100,
    380,
  );
  const centerX = width / 2;
  const worldToX = (worldX: number) => centerX + (worldX - camera) * pxPerMeter;
  const visibleMeters = width / pxPerMeter;

  /* rail */
  ctx.strokeStyle = COLORS.lineStrong;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 0.5);
  ctx.lineTo(width, groundY + 0.5);
  ctx.stroke();

  /* rail ticks and metre labels */
  ctx.font = `10px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const tickStep = 0.5;
  const start = Math.floor((camera - visibleMeters / 2) / tickStep) * tickStep;
  const end = camera + visibleMeters / 2;

  for (let world = start; world <= end; world += tickStep) {
    const x = worldToX(world);
    if (x < -20 || x > width + 20) continue;
    const isMetre = Math.abs(world - Math.round(world)) < 1e-6;
    ctx.strokeStyle = isMetre ? COLORS.lineStrong : COLORS.line;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, groundY + (isMetre ? 7 : 4));
    ctx.stroke();
    if (isMetre) ctx.fillText(`${world.toFixed(0)} m`, x, groundY + 11);
  }

  /* cart */
  const cartWidth = Math.max(48, 0.26 * pxPerMeter);
  const cartHeight = 22;
  const cartX = worldToX(state.x);
  const cartTop = groundY - cartHeight;

  ctx.fillStyle = COLORS.card;
  ctx.fillRect(cartX - cartWidth / 2, cartTop, cartWidth, cartHeight);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cartX - cartWidth / 2, cartTop, cartWidth, cartHeight);

  /* cart hatch */
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const x = cartX - cartWidth / 2 + (cartWidth / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x, cartTop + 1);
    ctx.lineTo(x, cartTop + cartHeight - 1);
    ctx.stroke();
  }

  /* wheels */
  ctx.fillStyle = COLORS.ink;
  for (const offset of [-0.28, 0.28]) {
    ctx.beginPath();
    ctx.arc(cartX + cartWidth * offset, groundY - 3, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /* pivot */
  const pivotX = cartX;
  const pivotY = cartTop;
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 3, 0, Math.PI * 2);
  ctx.fill();

  /* linearisation window: ±11° rays, dashed and quiet */
  const rodLength = PLANT.length * pxPerMeter;
  ctx.save();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  for (const angle of [LINEARISATION.validityRad, -LINEARISATION.validityRad]) {
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(
      pivotX + Math.sin(angle) * rodLength * 0.92,
      pivotY - Math.cos(angle) * rodLength * 0.92,
    );
    ctx.stroke();
  }
  ctx.restore();

  /* upright reference */
  ctx.save();
  ctx.setLineDash([2, 5]);
  ctx.strokeStyle = COLORS.lineStrong;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(pivotX, pivotY - rodLength * 1.04);
  ctx.stroke();
  ctx.restore();

  /* rod + bob */
  const tipX = pivotX + Math.sin(state.theta) * rodLength;
  const tipY = pivotY - Math.cos(state.theta) * rodLength;

  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.fillStyle = COLORS.accent;
  ctx.beginPath();
  ctx.arc(tipX, tipY, Math.max(6, 0.055 * pxPerMeter), 0, Math.PI * 2);
  ctx.fill();

  /* angle arc */
  const arcRadius = Math.min(rodLength * 0.45, 56);
  ctx.strokeStyle = COLORS.muted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(
    pivotX,
    pivotY,
    arcRadius,
    -Math.PI / 2,
    -Math.PI / 2 + state.theta,
    state.theta < 0,
  );
  ctx.stroke();

  ctx.font = `10px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    `θ ${((state.theta * 180) / Math.PI).toFixed(1)}°`,
    pivotX + arcRadius + 14,
    pivotY - arcRadius * 0.6,
  );

  /* canvas legend */
  ctx.font = `9px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(
    "dashed: upright reference · ±11° window",
    12,
    height - 12,
  );

  /* force arrow */
  if (Math.abs(state.force) > 0.5) {
    const direction = Math.sign(state.force);
    const magnitude = Math.min(Math.abs(state.force) / PLANT.forceLimit, 1);
    const shaft = 20 + magnitude * 52;
    const y = cartTop + cartHeight / 2;
    const x0 = cartX + direction * (cartWidth / 2 + 4);
    const x1 = x0 + direction * shaft;

    ctx.strokeStyle = COLORS.accent;
    ctx.fillStyle = COLORS.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x1 - direction * 6, y - 4);
    ctx.lineTo(x1 - direction * 6, y + 4);
    ctx.closePath();
    ctx.fill();

    ctx.font = `10px ${MONO}`;
    ctx.textAlign = direction > 0 ? "left" : "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      `F ${state.force.toFixed(0)} N`,
      x1 + direction * 8,
      y - 7,
    );
  }

  /* fallen overlay */
  if (status === "fallen") {
    ctx.fillStyle = "rgba(251, 250, 246, 0.74)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = COLORS.danger;
    ctx.font = `600 11px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LOST BALANCE — PRESS RESET", width / 2, height * 0.3);
  }
}

/* ── small UI pieces ───────────────────────────────────────────── */

function StatusPill({ status, stable }: { status: Status; stable: boolean }) {
  const fallen = status === "fallen";
  const label = fallen
    ? "Lost balance"
    : stable
      ? "Stabilising"
      : "Unstable gains";
  const tone = fallen || !stable ? "text-danger" : "text-stable";
  const dot = fallen || !stable ? "bg-danger" : "bg-stable";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] ${tone}`}
    >
      <span className={`inline-block h-1.5 w-1.5 ${dot}`} />
      {label}
    </span>
  );
}

type MatrixBlockProps = {
  label: string;
  values: number[];
  columns: number;
};

function MatrixBlock({ label, values, columns }: MatrixBlockProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="pt-2 font-mono text-xs text-ink-soft">{label}</span>
      <div className="matrix">
        <div
          className="grid gap-x-5 gap-y-1 font-mono text-[13px] tabular-nums"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(2.6rem, auto))`,
          }}
        >
          {values.map((value, index) => (
            <span key={index} className="text-right">
              {formatNumber(value, 3)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type GainControlProps = {
  id: string;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function GainControl({
  id,
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: GainControlProps) {
  const [text, setText] = useState(() => formatInput(value));

  const applyValue = (next: number) => {
    setText(formatInput(next));
    onChange(next);
  };

  const commit = (raw: string) => {
    const parsed = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(parsed)) {
      setText(formatInput(value));
      return;
    }
    const clamped = clamp(parsed, min, max);
    const snapped = Number((Math.round(clamped / step) * step).toFixed(2));
    applyValue(snapped);
  };

  const handleTyping = (raw: string) => {
    if (raw.trim() === "") {
      setText("");
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;

    // Anything outside the allowed range is corrected as it is typed, so an
    // unreasonable value can never reach the plant.
    if (parsed < min || parsed > max) {
      applyValue(clamp(parsed, min, max));
      return;
    }
    setText(raw);
    onChange(parsed);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={`${id}-slider`}
          className="font-mono text-xs tracking-[0.1em]"
        >
          {label}
        </label>
        <span className="mono-label">{unit}</span>
      </div>

      <div className="mt-1 flex items-center gap-3">
        <input
          id={`${id}-slider`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => applyValue(Number(event.target.value))}
          className="gain-range flex-1"
          aria-label={`${label} slider`}
        />
        <input
          id={`${id}-input`}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={text}
          onChange={(event) => handleTyping(event.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commit(text);
              event.currentTarget.blur();
            }
          }}
          className="gain-input w-[74px] border border-line bg-paper px-2 py-1.5 text-right font-mono text-xs tabular-nums transition-colors focus:border-ink focus:outline-none"
          aria-label={`${label} value`}
        />
      </div>

      <div className="mt-0.5 flex justify-between font-mono text-[10px] text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* ── main component ────────────────────────────────────────────── */

export default function PendulumSimulator() {
  const [gains, setGains] = useState<Gains>(INITIAL_GAINS);
  const [status, setStatus] = useState<Status>("running");
  const [readout, setReadout] = useState<Readout>(() => {
    const s = initialState();
    return { theta: s.theta, omega: s.omega, x: s.x, force: 0 };
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SimState>(initialState());
  const gainsRef = useRef<Gains>(INITIAL_GAINS);
  const statusRef = useRef<Status>("running");
  const cameraRef = useRef(0);

  useEffect(() => {
    gainsRef.current = gains;
  }, [gains]);

  const reset = useCallback(() => {
    stateRef.current = initialState();
    cameraRef.current = 0;
    statusRef.current = "running";
    const s = stateRef.current;
    setStatus("running");
    setReadout({ theta: s.theta, omega: s.omega, x: s.x, force: 0 });
  }, []);

  const updateGain = useCallback((key: keyof Gains, value: number) => {
    setGains((previous) => ({ ...previous, [key]: value }));
  }, []);

  /* simulation + render loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frameId = 0;
    let last = performance.now();
    let accumulator = 0;
    let telemetryClock = 0;

    const frame = (now: number) => {
      const elapsed = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (statusRef.current === "running") {
        accumulator += elapsed;
        let guard = 0;
        while (accumulator >= PLANT.integrateStep && guard < 80) {
          stateRef.current = stepSimulation(
            stateRef.current,
            gainsRef.current,
          );
          accumulator -= PLANT.integrateStep;
          guard += 1;
          if (stateRef.current.status === "fallen") {
            statusRef.current = "fallen";
            setStatus("fallen");
            break;
          }
        }
        if (guard >= 80) accumulator = 0;
      } else {
        accumulator = 0;
      }

      cameraRef.current +=
        (stateRef.current.x - cameraRef.current) * Math.min(1, elapsed * 5);

      const rect = canvas.getBoundingClientRect();
      drawScene(
        ctx,
        rect.width,
        rect.height,
        stateRef.current,
        cameraRef.current,
        statusRef.current,
      );

      telemetryClock += elapsed;
      if (telemetryClock >= 0.1) {
        telemetryClock = 0;
        const s = stateRef.current;
        setReadout({ theta: s.theta, omega: s.omega, x: s.x, force: s.force });
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const stability = stabilityReport(gains);
  const polynomial = closedLoopPolynomial(gains);
  const { A, B } = linearizeModel();
  const poles = openLoopPoles();
  const unstablePole = poles.find((pole) => pole.im !== 0);

  const clean = (value: number, digits: number) => {
    const threshold = 0.5 * 10 ** -digits;
    return (Math.abs(value) < threshold ? 0 : value).toFixed(digits);
  };

  const telemetry = [
    {
      label: "θ",
      value: `${clean((readout.theta * 180) / Math.PI, 1)}°`,
    },
    {
      label: "ω",
      value: `${clean((readout.omega * 180) / Math.PI, 0)}°/s`,
    },
    { label: "x", value: `${clean(readout.x * 100, 1)} cm` },
    { label: "F", value: `${clean(readout.force, 1)} N` },
  ];

  return (
    <section
      aria-labelledby="simulator-title"
      className="mt-16 border border-line bg-card"
    >
      {/* header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-7">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="mono-label text-accent">Live model</span>
          <h3
            id="simulator-title"
            className="font-display text-xl md:text-2xl"
          >
            Inverted pendulum
          </h3>
        </div>
        <div className="flex items-center gap-5">
          <span className="mono-label hidden sm:inline">
            PID on θ · force input
          </span>
          <StatusPill status={status} stable={stability.stable} />
        </div>
      </header>

      <div className="grid gap-px bg-line lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* controls, left on desktop */}
        <div className="order-2 bg-card p-5 md:p-7 lg:order-1">
          <div className="flex items-baseline justify-between">
            <p className="mono-label">Gains</p>
            <p className="mono-label">Clamped to limits</p>
          </div>

          <div className="mt-6 space-y-6">
            <GainControl
              id="kp"
              label="Kp"
              unit={GAIN_LIMITS.kp.unit}
              value={gains.kp}
              min={GAIN_LIMITS.kp.min}
              max={GAIN_LIMITS.kp.max}
              step={GAIN_LIMITS.kp.step}
              onChange={(value) => updateGain("kp", value)}
            />
            <GainControl
              id="ki"
              label="Ki"
              unit={GAIN_LIMITS.ki.unit}
              value={gains.ki}
              min={GAIN_LIMITS.ki.min}
              max={GAIN_LIMITS.ki.max}
              step={GAIN_LIMITS.ki.step}
              onChange={(value) => updateGain("ki", value)}
            />
            <GainControl
              id="kd"
              label="Kd"
              unit={GAIN_LIMITS.kd.unit}
              value={gains.kd}
              min={GAIN_LIMITS.kd.min}
              max={GAIN_LIMITS.kd.max}
              step={GAIN_LIMITS.kd.step}
              onChange={(value) => updateGain("kd", value)}
            />
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-7 flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" />
            </svg>
            Reset system
          </button>

          <p className="mt-5 text-xs leading-relaxed text-muted">
            Type in a field or drag a bar. Out-of-range input is clamped to the
            listed limits before it reaches the controller; the loop runs on
            the nonlinear plant, not on the linear model.
          </p>
        </div>

        {/* canvas + telemetry */}
        <div className="order-1 bg-card p-3 md:p-5 lg:order-2">
          <div className="border border-line">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Inverted pendulum on a cart, driven by a PID controller on the pendulum angle"
              className="block h-[280px] w-full md:h-[360px]"
            />
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {telemetry.map((cell) => (
              <div key={cell.label} className="bg-card px-3 py-2.5">
                <dt className="mono-label">{cell.label}</dt>
                <dd className="mt-1 font-mono text-sm tabular-nums">
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* linearisation + closed-loop check */}
      <div className="grid gap-px border-t border-line bg-line lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="bg-card p-5 md:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-display text-lg">Linearised state space</h4>
            <span className="mono-label">at θ = 0</span>
          </div>
          <p className="mt-2 font-mono text-[12px] leading-relaxed text-muted">
            ẋ = A x + B u
            <br />
            x = [x, ẋ, θ, θ̇]ᵀ &nbsp;·&nbsp; u = F [N]
          </p>

          <div className="mt-6 flex flex-wrap items-start gap-x-12 gap-y-6">
            <MatrixBlock label="A =" values={A.flat()} columns={4} />
            <MatrixBlock label="B =" values={B} columns={1} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-4 font-mono text-[11px] text-muted sm:grid-cols-4">
            <div>
              <dt>M</dt>
              <dd className="text-ink">{PLANT.cartMass.toFixed(2)} kg</dd>
            </div>
            <div>
              <dt>m</dt>
              <dd className="text-ink">{PLANT.bobMass.toFixed(2)} kg</dd>
            </div>
            <div>
              <dt>l</dt>
              <dd className="text-ink">{PLANT.length.toFixed(2)} m</dd>
            </div>
            <div>
              <dt>g</dt>
              <dd className="text-ink">{PLANT.gravity.toFixed(2)} m/s²</dd>
            </div>
          </dl>
        </div>

        <div className="bg-card p-5 md:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <h4 className="font-display text-lg">Closed-loop check</h4>
            <span className="mono-label">Routh–Hurwitz</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Differentiating the angle loop to absorb ∫θ gives a cubic in{" "}
            <span className="font-mono text-[12px]">s</span>:
          </p>
          <p className="mt-3 font-mono text-[12.5px] leading-relaxed">
            s³ + {formatNumber(polynomial.quadratic, 2)} s² +{" "}
            {formatNumber(polynomial.linear, 2)} s +{" "}
            {formatNumber(polynomial.constant, 2)} = 0
          </p>

          <ul className="mt-5 space-y-2">
            {stability.checks.map((check) => (
              <li
                key={check.label}
                className="flex items-baseline gap-3 border-b border-line/70 pb-2 font-mono text-[11px]"
              >
                <span
                  className={`shrink-0 text-[10px] uppercase tracking-[0.14em] ${
                    check.ok ? "text-stable" : "text-danger"
                  }`}
                >
                  {check.ok ? "pass" : "fail"}
                </span>
                <span className="text-ink-soft">{check.label}</span>
                <span className="ml-auto text-muted tabular-nums">
                  {check.detail}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            {stability.stable
              ? "All conditions hold: the linearised loop is stable at these gains."
              : "At least one condition fails, so the linearised loop is unstable — expect the run to diverge and then trip the fall limit."}
          </p>
        </div>
      </div>

      {/* notes */}
      <div className="grid gap-px border-t border-line bg-line md:grid-cols-3">
        <div className="bg-card p-5 md:p-7">
          <p className="mono-label">Operating point</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            θ = 0, θ̇ = 0, ẋ = 0, with the cart position x free — the upright
            equilibrium is a manifold, not a single point. Around it sin θ ≈ θ
            and cos θ ≈ 1, which is what produces the A and B above.
          </p>
          <p className="mt-3 font-mono text-[11px] text-muted">
            open-loop poles: 0, 0, ±
            {unstablePole ? Math.abs(unstablePole.im).toFixed(2) : "—"} s⁻¹
          </p>
        </div>

        <div className="bg-card p-5 md:p-7">
          <p className="mono-label">Validity</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            |θ| ≲ {LINEARISATION.validityRad.toFixed(2)} rad (
            {LINEARISATION.validityDeg.toFixed(0)}°). Past that the discarded
            sin, cos and θ̇² terms dominate and this model stops predicting the
            plant — which is why the run is stopped at{" "}
            {LINEARISATION.fallDeg.toFixed(0)}°.
          </p>
        </div>

        <div className="bg-card p-5 md:p-7">
          <p className="mono-label">Reaching the operating point</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            The run starts at θ₀ = {LINEARISATION.initialDeg.toFixed(1)}°,
            inside the window, rather than swinging the pendulum up. The
            controller is then responsible for the rest of the approach to θ = 0
            — and the nonlinear plant is what actually gets integrated.
          </p>
        </div>
      </div>
    </section>
  );
}
