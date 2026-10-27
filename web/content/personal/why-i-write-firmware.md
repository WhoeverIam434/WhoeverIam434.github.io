---
title: Why I Write Firmware
date: 2026-09-28
summary: Some notes on why the low-level part of the stack is the interesting part.
---

# Why I Write Firmware

Because the feedback loop is physical. You change a number, the motor moves,
and the thing on the bench either works or does not.

## What keeps me here

- The gap between "compiles" and "behaves" is where the interesting problems live.
- Sensors lie in specific ways, and learning those ways is a skill.
- There is no ambiguity about whether it worked.

## What is annoying

- Toolchains
- Re-flashing a board for the ninth time in an hour
- Datasheets that were clearly written by the marketing department

## A small habit

Every time something works, write down the conditions it worked under. Two
lines is enough. Future-you will be very different from present-you.
