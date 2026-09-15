(() => {
  'use strict';

  const shell = document.getElementById('gameShell');
  const canvas = document.getElementById('gameCanvas');
  if (!shell || !canvas || typeof input === 'undefined') return;

  const keyMap = new Map([
    ['KeyW', 'KeyW'], ['KeyA', 'KeyA'], ['KeyS', 'KeyS'], ['KeyD', 'KeyD'],
    ['w', 'KeyW'], ['a', 'KeyA'], ['s', 'KeyS'], ['d', 'KeyD'],
    ['W', 'KeyW'], ['A', 'KeyA'], ['S', 'KeyS'], ['D', 'KeyD'],
  ]);

  function resolveMoveKey(event) {
    return keyMap.get(event.code) || keyMap.get(event.key) || null;
  }

  function onKeyDown(event) {
    const code = resolveMoveKey(event);
    if (!code) return;
    input.keys.add(code);
    event.preventDefault();
  }

  function onKeyUp(event) {
    const code = resolveMoveKey(event);
    if (!code) return;
    input.keys.delete(code);
    event.preventDefault();
  }

  // Capture at document level so WASD works even when a HUD button or other
  // element currently has focus. Keep the original window listeners too;
  // Set semantics make duplicate adds harmless.
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('keyup', onKeyUp, true);

  // Give the game surface an explicit focus target. This fixes cases where a
  // freshly opened Pages tab leaves keyboard focus on browser/UI chrome.
  shell.tabIndex = -1;
  function focusGame() {
    try { shell.focus({ preventScroll: true }); } catch (_) { shell.focus(); }
  }
  canvas.addEventListener('pointerdown', focusGame, true);
  shell.addEventListener('pointerdown', focusGame, true);
  window.addEventListener('load', focusGame, { once: true });
  setTimeout(focusGame, 0);

  // Avoid a stuck key when the tab loses focus while a movement key is held.
  window.addEventListener('blur', () => input.keys.clear());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) input.keys.clear();
  });
})();
