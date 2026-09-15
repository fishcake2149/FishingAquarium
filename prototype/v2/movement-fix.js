(() => {
  'use strict';

  // Robust movement layer for the HTML prototype.
  // Keeps gameplay WASD-only and adds transition recovery so the player can
  // never remain trapped inside a collider after entering/leaving a scene.
  const canvasEl = document.getElementById('gameCanvas');
  const shellEl = document.getElementById('gameShell');
  if (!canvasEl || !shellEl) return;

  const held = new Set();
  const codeFromEvent = (e) => {
    if (e.code === 'KeyW' || e.keyCode === 87 || e.which === 87) return 'KeyW';
    if (e.code === 'KeyA' || e.keyCode === 65 || e.which === 65) return 'KeyA';
    if (e.code === 'KeyS' || e.keyCode === 83 || e.which === 83) return 'KeyS';
    if (e.code === 'KeyD' || e.keyCode === 68 || e.which === 68) return 'KeyD';
    const k = String(e.key || '').toLowerCase();
    if (k === 'w') return 'KeyW';
    if (k === 'a') return 'KeyA';
    if (k === 's') return 'KeyS';
    if (k === 'd') return 'KeyD';
    return null;
  };

  const down = (e) => {
    const code = codeFromEvent(e);
    if (!code) return;
    held.add(code);
    try { input.keys.add(code); } catch (_) {}
    e.preventDefault();
  };

  const up = (e) => {
    const code = codeFromEvent(e);
    if (!code) return;
    held.delete(code);
    try { input.keys.delete(code); } catch (_) {}
    e.preventDefault();
  };

  document.addEventListener('keydown', down, true);
  document.addEventListener('keyup', up, true);
  window.addEventListener('keydown', down, true);
  window.addEventListener('keyup', up, true);

  canvasEl.tabIndex = 0;
  const focusCanvas = () => {
    try { canvasEl.focus({ preventScroll: true }); }
    catch (_) { try { canvasEl.focus(); } catch (_) {} }
  };
  canvasEl.addEventListener('pointerdown', focusCanvas, true);
  shellEl.addEventListener('pointerdown', focusCanvas, true);
  window.addEventListener('load', focusCanvas, { once: true });
  setTimeout(focusCanvas, 0);

  const clearHeld = () => {
    held.clear();
    try { input.keys.clear(); } catch (_) {}
  };
  window.addEventListener('blur', clearHeld);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearHeld();
  });

  function resetTransientMovementState() {
    clearHeld();
    try { input.pointerDown = false; } catch (_) {}
    try {
      cast.mode = 'idle';
      cast.landing = null;
      cast.depth = null;
      if (dom && dom.castGaugeWrap) dom.castGaugeWrap.classList.add('hidden');
    } catch (_) {}
    setTimeout(focusCanvas, 0);
  }

  // Find the closest legal position around a preferred spawn point. This is
  // also used to recover old saves that happen to be inside changed geometry.
  function placeOnNearestFree(preferredX, preferredY) {
    const candidates = [[0,0]];
    const radii = [16, 24, 32, 48, 64, 80, 96];
    for (const r of radii) {
      candidates.push([0,r],[r,0],[0,-r],[-r,0],[r,r],[r,-r],[-r,r],[-r,-r]);
    }
    for (const [ox, oy] of candidates) {
      const x = preferredX + ox;
      const y = preferredY + oy;
      try {
        if (!isSolidAt(x, y, 10)) {
          state.player.x = x;
          state.player.y = y;
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  function recoverIfEmbedded() {
    try {
      if (!isSolidAt(state.player.x, state.player.y, 10)) return;
      const px = state.player.x;
      const py = state.player.y;
      if (!placeOnNearestFree(px, py)) {
        if (state.scene === 'aquarium') placeOnNearestFree(4.5 * CONFIG.tile, 13.5 * CONFIG.tile);
        else placeOnNearestFree(13.5 * CONFIG.tile, 11.6 * CONFIG.tile);
      }
    } catch (_) {}
  }

  // Replace only the movement reader. Collision, speed and direction remain
  // those of the integrated prototype, with one extra embedded-position guard.
  try {
    updatePlayer = function patchedUpdatePlayer(dt) {
      if (ui.modal || fishing || cast.mode === 'charging' || cast.mode === 'waiting') return;

      recoverIfEmbedded();

      let dx = 0, dy = 0;
      if (held.has('KeyW')) dy -= 1;
      if (held.has('KeyS')) dy += 1;
      if (held.has('KeyA')) dx -= 1;
      if (held.has('KeyD')) dx += 1;
      if (!dx && !dy) return;

      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;

      if (Math.abs(dx) > Math.abs(dy)) state.player.dir = dx < 0 ? 'left' : 'right';
      else state.player.dir = dy < 0 ? 'up' : 'down';

      const step = CONFIG.playerSpeed * dt;
      const nx = state.player.x + dx * step;
      const ny = state.player.y + dy * step;

      if (!isSolidAt(nx, state.player.y, 10)) state.player.x = nx;
      if (!isSolidAt(state.player.x, ny, 10)) state.player.y = ny;
    };
  } catch (err) {
    console.error('WASD movement patch failed to install', err);
  }

  // Scene transitions used to leave the movement layer in a stale state on
  // some runs. Wrap both transitions and explicitly place the player on a free
  // tile immediately outside/inside the door.
  try {
    const originalEnterAquarium = enterAquarium;
    enterAquarium = function patchedEnterAquarium() {
      originalEnterAquarium();
      resetTransientMovementState();
      placeOnNearestFree(4.5 * CONFIG.tile, 13.5 * CONFIG.tile);
      camera.x = 0;
      camera.y = 0;
      saveGame();
    };

    const originalExitAquarium = exitAquarium;
    exitAquarium = function patchedExitAquarium() {
      originalExitAquarium();
      resetTransientMovementState();
      // Put the player clearly below the aquarium facade instead of near its
      // collision edge, then let the normal camera follow from there.
      placeOnNearestFree(13.5 * CONFIG.tile, 11.7 * CONFIG.tile);
      saveGame();
    };
  } catch (err) {
    console.error('Scene transition movement patch failed to install', err);
  }

  // One boot-time recovery for old saves.
  recoverIfEmbedded();
  window.__FISHING_AQUARIUM_MOVEMENT_FIX__ = '2026-09-15-v3-transition-safe';
})();
