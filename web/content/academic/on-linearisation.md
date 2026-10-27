# On Linearisation Windows

This file has no frontmatter. Its date comes from the commit that added it —
which is exactly "when it was uploaded" — and its title comes from the H1 below.

## Why the window matters

A linear model is a local statement. It says nothing about what happens when
the state leaves the neighbourhood it was derived in.

For the pendulum demo on the home page:

- the run starts at `θ₀ = 8.6°`, inside the ±11° window
- the controller has to bring it to zero from there
- outside the window, the nonlinear terms dominate and the same gains stop
  behaving predictably

## What I would do differently

Instead of hand-placing the pendulum near upright, a real deployment needs a
swing-up controller and a handover condition. The linear controller is only the
last few hundred milliseconds of that story.

```text
energy pumping → capture region → LQR/PID handover
```
