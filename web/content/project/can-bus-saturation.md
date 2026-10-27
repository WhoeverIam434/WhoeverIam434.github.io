# CAN Bus Saturation, and How We Fixed It

No frontmatter here either — the date on the archive is the commit date of this
file.

## The symptom

With four motors on one bus, the robot would occasionally miss position updates
and the lift would stutter at the top of its travel.

## What was happening

- 1 Mbps CAN, 15+ nodes
- each motor reporting a full feedback frame every cycle
- the bus was spending most of its budget on status, not commands

## The fix

We condensed the feedback values into a single packed frame per node and moved
trajectory generation to the STM32 so the bus only carried setpoints.

```c
typedef struct __attribute__((packed)) {
    uint16_t position;
    uint16_t current;
    uint8_t  temperature;
    uint8_t  status;
} motor_feedback_t;
```

> If a bus is saturated, the answer is almost never "send it faster".

## What I would check first next time

1. Bus load per frame — count bytes, not messages.
2. Which data is actually consumed by the controller.
3. Whether the node needs to report at the control rate at all.
