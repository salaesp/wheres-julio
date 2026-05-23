---
description: Restyle the app into a GBA Pokémon look and validate it against pokemon/ until it passes (score ≥ 95).
---

Goal: make the running app look like a Game Boy Advance era Pokémon game,
verified against the reference screenshots in the `pokemon/` folder.

Run this loop, up to a maximum of 8 iterations:

1. Invoke the `gba-pokemon-stylist` subagent to apply the GBA Pokémon look to
   the code. On every iteration after the first, give it the validator's
   `issues` from the previous round and tell it to fix each one specifically.
2. Invoke the `gba-pokemon-validator` subagent to boot the Next.js app,
   screenshot it, and score it against `pokemon/`.
3. Read the validator's JSON verdict.
   - If `passed` is true, STOP and report success with the final score and the
     screenshot path.
   - If false, feed its `issues` back into step 1 and continue.

If you reach 8 iterations without passing, STOP and summarize the highest score
reached and the remaining issues so I can decide how to proceed. Do not loop
forever.

Extra context for this run (optional): $ARGUMENTS