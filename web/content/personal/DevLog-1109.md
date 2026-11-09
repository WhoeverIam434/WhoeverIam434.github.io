--- 
title: Dev Log 1107
date: 2026-11-09
Summary: Robocon RL
---

# Dev Log - Robocon 2027

## Planning Layer
Previously, when I joined back Robocon, I asked if I can try implementing the planning layer for BR, which is fully autonomous this year, and that means that it has to make decisions automatically.  
At first though, I thought Tabular Reinforcement Learning would be a good idea, and part of the reason is that I underestimated the size of the state. I thought at maximum it's just 1000-2000, but in fact it could be as large as 10^12. In which Tabular Method would fail

The reason I thought RL would be great as of the following reasons:
- The reward is clear and given, which means modelling the environment is possible
- The environment seemly matches Markov's Property (which might not be true, I am not master in this)
- The actions are mostly deterministic, unless they failed in execution

Yet, training RL also faces the following problem:
- The environment is an adversarial game between 2 teams
- The agent's teammate (TR) is noncommunicable, and brings difficulty in modelling it
- Robustness is a key concern, as it's not guaranteed it won't do stupid things rarely
- Real data for actions does not exists yet (e.g How long each action takes, how likely will it fail...)

Whether RL would be a suitable choice for this year's task require further testing and prototyping. 

Alternatively, if RL really fails, what would be the other options?

Environment is partially built up, but I need to think how to model the opponent and teammate.
For teammate, as it's only mission is to transfer blocks, I wish to estimate it using Mean Time To Happen (MTTH) (idea from EU4/EU5 lol). Maybe Normal Distribution will simply be used.

As for opponent, IDK. Fuck it. I thought self-play would be a fun idea but Deepseek says it can't guarantee Nash Convergence. Who needs Nash and Game Theory anyways! As long as we are fast enough we don't have to care about the enemy ;) 