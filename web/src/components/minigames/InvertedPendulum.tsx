"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  GAIN_LIMITS,
  INITIAL_GAINS,
  PLANT,
  type Gains,
  type SimState,
  clamp,
  formatNumber,
  initialState,
  linearizeModel,
  stepSimulation,
} from "@/lib/pendulum";

const COLORS = {
  ink: "#14130f",
  muted: "#6e695c",
  line: "#d8d2c2",
  lineStrong: "#b6ae99",
  accent: "#b03d0e",
  paper: "#f4f2ec",
  card: "#fbfaf6",
} as const;

const MONO =
  'ui-monospace, "SFMono-Regular", "Cascadia Mono", Consolas, "Liberation Mono", monospace';

/* ── background scene ──────────────────────────────────────────── */

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: SimState,
  camera: number,
  fallen: boolean,
): void {
  ctx.clearRect(0, 0, width, height);

  const groundY = Math.round(height * (width >= 768 ? 0.78 : 0.9));
  const centerX = width * (width >= 768 ? 0.62 : 0.55);
  const pxPerMeter = clamp(
    width >= 768
      ? Math.min(height * 0.62, width * 0.6)
      : Math.min(height * 0.4, width * 0.6),
    120,
    900,
  );
  const visibleMeters = width / pxPerMeter;
  const worldToX = (x: number) => centerX + (x - camera) * pxPerMeter;

  /* rail */
  ctx.strokeStyle = COLORS.lineStrong;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 0.5);
  ctx.lineTo(width, groundY + 0.5);
  ctx.stroke();

  /* rail graduations */
  for (
    let world = Math.floor((camera - visibleMeters / 2) / 0.5) * 0.5;
    world <= camera + visibleMeters / 2;
    world += 0.5
  ) {
    const x = worldToX(world);
    if (x < -10 || x > width + 10) continue;
    const isMetre = Math.abs(world - Math.round(world)) < 1e-6;
    ctx.strokeStyle = isMetre ? COLORS.lineStrong : COLORS.line;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, groundY + (isMetre ? 6 : 3));
    ctx.stroke();
  }

  /* cart */
  const cartWidth = Math.max(70, 0.26 * pxPerMeter);
  const cartHeight = Math.max(26, 0.13 * pxPerMeter);
  const cartX = worldToX(state.x);
  const cartTop = groundY - cartHeight;

  ctx.fillStyle = COLORS.card;
  ctx.fillRect(cartX - cartWidth / 2, cartTop, cartWidth, cartHeight);
  ctx.strokeStyle = fallen ? COLORS.accent : COLORS.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cartX - cartWidth / 2, cartTop, cartWidth, cartHeight);

  ctx.fillStyle = fallen ? COLORS.accent : COLORS.ink;
  for (const offset of [-0.28, 0.28]) {
    ctx.beginPath();
    ctx.arc(cartX + cartWidth * offset, groundY - 3, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const pivotX = cartX;
  const pivotY = cartTop;

  /* upright reference + linearisation window */
  const rodLength = PLANT.length * pxPerMeter;
  ctx.save();
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = COLORS.line;
  for (const angle of [0, 0.2, -0.2]) {
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(
      pivotX + Math.sin(angle) * rodLength * 1.02,
      pivotY - Math.cos(angle) * rodLength * 1.02,
    );
    ctx.stroke();
  }
  ctx.restore();

  /* rod + bob */
  const tipX = pivotX + Math.sin(state.theta) * rodLength;
  const tipY = pivotY - Math.cos(state.theta) * rodLength;

  ctx.strokeStyle = fallen ? COLORS.accent : COLORS.ink;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.fillStyle = COLORS.accent;
  ctx.beginPath();
  ctx.arc(tipX, tipY, Math.max(9, 0.055 * pxPerMeter), 0, Math.PI * 2);
  ctx.fill();

  /* pivot */
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
  ctx.fill();
}

/* ── gain bar (no box, sits directly on the background) ────────── */

type GainBarProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function GainBar({ id, label, value, min, max, step, onChange }: GainBarProps) {
  const [text, setText] = useState(() => String(Number(value.toFixed(2))));

  const apply = (next: number) => {
    setText(String(Number(next.toFixed(2))));
    onChange(next);
  };

  const commit = (raw: string) => {
    const parsed = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(parsed)) {
      setText(String(Number(value.toFixed(2))));
      return;
    }
    const clamped = clamp(parsed, min, max);
    apply(Number((Math.round(clamped / step) * step).toFixed(2)));
  };

  const handleTyping = (raw: string) => {
    if (raw.trim() === "") {
      setText("");
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    if (parsed < min || parsed > max) {
      apply(clamp(parsed, min, max));
      return;
    }
    setText(raw);
    onChange(parsed);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={`${id}-range`}
          className="font-mono text-[11px] tracking-[0.12em]"
        >
          {label}
        </label>
        <input
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
          aria-label={`${label} value`}
          className="gain-input w-12 bg-transparent text-right font-mono text-[11px] tabular-nums outline-none"
        />
      </div>
      <input
        id={`${id}-range`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => apply(Number(event.target.value))}
        aria-label={`${label} slider`}
        className="gain-range mt-1 w-full"
      />
    </div>
  );
}

/* ── matrix ────────────────────────────────────────────────────── */

function MatrixBlock({
  label,
  values,
  columns,
}: {
  label: string;
  values: number[];
  columns: number;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="pt-1 font-mono text-[10px] text-muted sm:text-[11px]">
        {label} =
      </span>
      <div className="matrix">
        <div
          className="grid gap-x-3 gap-y-0.5 font-mono text-[10px] tabular-nums sm:gap-x-4 sm:text-[11px]"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(1.6rem, auto))`,
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

/* ── minigame ──────────────────────────────────────────────────── */

export default function InvertedPendulum({ onClose }: { onClose: () => void }) {
  const [gains, setGains] = useState<Gains>(INITIAL_GAINS);
  const [fallen, setFallen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SimState>(initialState());
  const gainsRef = useRef<Gains>(INITIAL_GAINS);
  const fallenRef = useRef(false);
  const cameraRef = useRef(0);

  useEffect(() => {
    gainsRef.current = gains;
  }, [gains]);

  const reset = useCallback(() => {
    stateRef.current = initialState();
    cameraRef.current = 0;
    fallenRef.current = false;
    setFallen(false);
  }, []);

  const updateGain = useCallback((key: keyof Gains, value: number) => {
    setGains((previous) => ({ ...previous, [key]: value }));
  }, []);

  /* simulation + background rendering */
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

    const frame = (now: number) => {
      const elapsed = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!fallenRef.current) {
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
            fallenRef.current = true;
            setFallen(true);
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
        fallenRef.current,
      );

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const { A, B } = linearizeModel();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Control systems minigame: inverted pendulum"
      className="fixed inset-0 z-[100] overflow-y-auto bg-paper"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40 sm:opacity-100"
      />

      <div className="pointer-events-none absolute inset-0 p-6 md:p-12">
        <div className="pointer-events-auto relative mx-auto flex min-h-full w-full max-w-[1280px] flex-col">
          <p className="mono-label">Focus — Control Systems</p>

          <h2 className="mt-4 max-w-[9ch] text-[clamp(2.4rem,6vw,4.25rem)] leading-[0.94]">
            Inverted Pendulum
          </h2>

          {/* the three bars sit directly on the background */}
          <div className="mt-8 w-full max-w-[280px] space-y-4 sm:mt-10 sm:space-y-5">
            <GainBar
              id="game-kp"
              label="Kp"
              value={gains.kp}
              min={GAIN_LIMITS.kp.min}
              max={GAIN_LIMITS.kp.max}
              step={GAIN_LIMITS.kp.step}
              onChange={(value) => updateGain("kp", value)}
            />
            <GainBar
              id="game-ki"
              label="Ki"
              value={gains.ki}
              min={GAIN_LIMITS.ki.min}
              max={GAIN_LIMITS.ki.max}
              step={GAIN_LIMITS.ki.step}
              onChange={(value) => updateGain("ki", value)}
            />
            <GainBar
              id="game-kd"
              label="Kd"
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
            className={`mt-7 inline-flex w-fit items-center gap-2 border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
              fallen
                ? "border-accent text-accent hover:bg-accent hover:text-paper"
                : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
            }`}
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
            Reset
          </button>

          {/* linearised model, top right */}
          <div className="mt-8 sm:absolute sm:right-0 sm:top-0 sm:mt-0">
            <p className="mono-label">Linearized state space model</p>
            <p className="mt-2 font-mono text-[11px] text-muted">
              ẋ = A x + B u
            </p>
            <div className="mt-3 flex flex-wrap items-start gap-6">
              <MatrixBlock label="A" values={A.flat()} columns={4} />
              <MatrixBlock label="B" values={B} columns={1} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-auto ml-auto inline-flex items-center gap-2 pt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink"
          >
            Close
            <span aria-hidden="true" className="text-sm leading-none">
              ×
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
