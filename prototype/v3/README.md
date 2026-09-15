# Fishing Aquarium Prototype v3

Clean rebuild of the pond-village HTML prototype. v2 is kept intact as a fallback.

Implemented in v3:
- Responsive 16:9-first viewport with wider/narrower aspect handling and camera clamping.
- Free WASD movement; left-click contextual interaction; ESC close/cancel.
- Grid-based world, collision, NPC pathing, aquarium placement footprints and rotation.
- Pond village map: bus stop, aquarium exterior/interior, Marco shop, Bruno workshop, homes, paths, trees, bridge and pond.
- Temporary 4-direction pixel player with walking motion; distinct main NPC palettes and generic residents.
- Time-linked shadows/lighting, sunny/cloudy/spring-rain weather, day/night presentation.
- Persistent near/mid/far water-depth gradient. Cast distance only chooses landing position; landing depth determines habitat.
- Anywhere-water fishing from valid shoreline direction with oscillating 0→100→0 cast gauge.
- 360° catch minigame as blur/dim overlay over the current world, preserving fixed-step timing and inertia controls.
- Pond roster of 14 species with depth/weather/time filtering and weighted spawning. Koi is intentionally not included.
- 9-slot stacked inventory for species/items; fish size updates codex min/max records rather than creating per-fish inventory instances.
- Rod/bobber/bait/active equipment; wide rod, wide bait, curiosity bait and ice bomb.
- Physical aquarium manager room. Sleep/time skip and ticket-price controls are manager-desk only.
- Main tank plus placeable small tanks, rugs and plants. Placeable tanks can hold fish.
- Aquarium visitors, ticket acceptance, pending revenue and 04:00 daily settlement.
- Optional local reopening progression before any future bus unlock.
- v3 save data plus migration from the v2 save key.
- Galmuri Korean retro/pixel font loaded by CSS with system fallbacks.

Live entry point: repository root `index.html` redirects to `prototype/v3/`.
