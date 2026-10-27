---
title: War Dragon — Build Notes
date: 2026-07-21
summary: What actually broke on the ABU Robocon robot, and what the fix cost.
---

# War Dragon — Build Notes

A short log of the climbing mechanism work, mostly so future-me remembers why
the firmware looks the way it does.

## The climbing mechanism

The rack-and-pinion lift went through three revisions:

1. Direct drive, no ramp profile — motor cooked itself in about 40 seconds.
2. Trapezoidal profile with position setpoints — stable, but the VESC rounding
   made the top of the travel inconsistent.
3. Trapezoidal profile plus fixed-point angle targets on the STM32 side —
   climbing speed up by 121%, no overheating.

## What the fix cost

- one afternoon of thermal measurements
- two motor replacements
- a rewrite of the setpoint dispatcher

## Firmware layout

```c
/* trajectory is generated on the STM32, the VESC only closes the loop */
void lift_set_target(float height_mm)
{
    float v_max = profile_velocity(height_mm);
    float accel = profile_acceleration(height_mm);
    plan_trapezoid(&lift_plan, height_mm, v_max, accel);
}
```

> The VESC position loop is good at what it does. Do not make it do trajectory
> generation on top of that.
