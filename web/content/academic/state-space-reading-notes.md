---
title: State Space Control — Reading Notes
date: 2026-08-04
summary: Notes from working through the system modelling, analysis and control course.
---

# State Space Control — Reading Notes

These are working notes, not a textbook. They exist so I stop re-deriving the
same three things every time I open a new project.

## The model is not the machine

Writing `ẋ = Ax + Bu` is a claim about a neighbourhood. For the inverted
pendulum I linearise at `θ = 0` and accept that the model is only honest inside
roughly ±0.2 rad.

- `sin θ ≈ θ`, `cos θ ≈ 1`, `θ̇² ≈ 0`
- the discarded terms are exactly what saves you when the pendulum falls

## Things worth remembering

1. Poles tell you where the system wants to go, not where it will end up.
2. A stable loop with a drifting cart is still a drifting cart.
3. Saturation is part of the plant, not an implementation detail.

## The cart–pole linearisation

```
A = [ 0    1      0     0 ]
    [ 0    0   −mg/M     0 ]
    [ 0    0      0     1 ]
    [ 0    0  g(M+m)/(Ml) 0 ]

B = [ 0, 1/M, 0, −1/(Ml) ]ᵀ
```

With `M = 1.0`, `m = 0.2`, `l = 0.5`, the unstable open-loop pair sits at
`±4.85 s⁻¹`. The whole job of the controller is to move that pair left.

> If the model is wrong in a direction you never excite, you will never find
> out until the robot does something interesting.
