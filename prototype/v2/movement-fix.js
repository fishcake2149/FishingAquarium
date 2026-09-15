(() => {
  'use strict';

  // Robust movement layer for the HTML prototype.
  // Keeps gameplay WASD-only, but does not depend on the original input Set
  // receiving keyboard events correctly in every browser/focus state.
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

  // Capture before focused HUD/buttons can consume the event.
  document.addEventListener('keydown', down, true);
  document.addEventListener('keyup', up, true);
  window.addEventListener('keydown', down, true);
  window.addEventListener('keyup', up, true);

  // Make the actual game canvas a keyboard focus target.
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

  // Replace only the movement reader. Collision, speed, direction and every
  // other gameplay rule remain the same as the integrated prototype.
  try {
    updatePlayer = function patchedUpdatePlayer(dt) {
      if (ui.modal || fishing || cast.mode === 'charging' || cast.mode === 'waiting') return;

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

      // Axis-separated collision preserves smooth wall sliding.
      if (!isSolidAt(nx, state.player.y, 10)) state.player.x = nx;
      if (!isSolidAt(state.player.x, ny, 10)) state.player.y = ny;
    };
  } catch (err) {
    console.error('WASD movement patch failed to install', err);
  }

  window.__FISHING_AQUARIUM_MOVEMENT_FIX__ = '2026-09-15-v2';
})();
