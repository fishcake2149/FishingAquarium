(() => {
  'use strict';

  // Critical runtime fix: during daytime Yotri fell through to the generic
  // resident scheduler. Her id ends with a letter, so Number('i') became NaN,
  // the target lookup returned undefined, and updateNpcs crashed the entire
  // requestAnimationFrame loop after about one second.
  try {
    scheduleTarget = function patchedScheduleTarget(npc) {
      const h = state.gameMinute / 60;

      if (npc.id === 'yotri') {
        if (isNight()) return { x: 43 * CONFIG.tile, y: 29 * CONFIG.tile };
        return { x: 45 * CONFIG.tile, y: 16 * CONFIG.tile };
      }
      if (npc.id === 'luka') return { x: 7 * CONFIG.tile, y: 9 * CONFIG.tile };
      if (npc.id === 'rohan') return { x: 33 * CONFIG.tile, y: 18 * CONFIG.tile };
      if (npc.id === 'marco') return { x: 27 * CONFIG.tile, y: 11 * CONFIG.tile };
      if (npc.id === 'bruno') return { x: 38 * CONFIG.tile, y: 11 * CONFIG.tile };

      const match = String(npc.id || '').match(/(\d+)$/);
      const numericSuffix = match ? Number(match[1]) : 0;
      const seed = (Math.floor(h * 2) + numericSuffix) % 4;
      const targets = [
        { x: 20 * CONFIG.tile, y: 14 * CONFIG.tile },
        { x: 28 * CONFIG.tile, y: 14 * CONFIG.tile },
        { x: 48 * CONFIG.tile, y: 14 * CONFIG.tile },
        { x: 16 * CONFIG.tile, y: 23 * CONFIG.tile },
      ];
      return targets[seed] || targets[0];
    };

    // Keep one visible breadcrumb in DevTools for this exact crash class.
    window.__FISHING_AQUARIUM_RUNTIME_FIX__ = '2026-09-15-yotri-schedule-crash';
  } catch (err) {
    console.error('Critical NPC schedule fix failed', err);
  }
})();
