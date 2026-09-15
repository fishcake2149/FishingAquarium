(() => {
  'use strict';

  // Bus-stop -> village route hotfix.
  // The original aquarium footprint overlapped the dirt road leaving the bus stop,
  // so following the visible road could run directly into an invisible/full-building
  // collision rectangle. Keep the building grid-based but move/resize its footprint
  // so the road in front of it is actually walkable.
  try {
    const aquarium = villageObjects.find(o => o.id === 'aquarium');
    if (aquarium) {
      aquarium.tx = 9;
      aquarium.ty = 2;
      aquarium.tw = 9;
      aquarium.th = 5;
      aquarium.door = { x: 13.4, y: 7.0 };
    }

    // If a save was made while the player was pressed against the old footprint,
    // nudge them onto the visible road only when the new geometry still considers
    // the current point solid. Normal saves/positions are left untouched.
    if (state.scene === 'village' && isSolidAt(state.player.x, state.player.y, 10)) {
      const safe = [
        [7.5 * CONFIG.tile, 8.0 * CONFIG.tile],
        [8.0 * CONFIG.tile, 8.5 * CONFIG.tile],
        [9.0 * CONFIG.tile, 8.8 * CONFIG.tile],
        [10.0 * CONFIG.tile, 9.4 * CONFIG.tile],
      ];
      for (const [x, y] of safe) {
        if (!isSolidAt(x, y, 10)) {
          state.player.x = x;
          state.player.y = y;
          break;
        }
      }
    }

    saveGame();
    window.__FISHING_AQUARIUM_MAP_FIX__ = '2026-09-15-bus-road-clear';
  } catch (err) {
    console.error('Bus-stop route fix failed', err);
  }
})();
