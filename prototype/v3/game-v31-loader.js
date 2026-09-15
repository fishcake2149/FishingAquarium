(async () => {
  'use strict';
  try {
    const urls = [1, 2, 3, 4, 5].map(n => `./v31/part${n}.txt?v=20260915-1`);
    const parts = await Promise.all(urls.map(async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`payload ${res.status}: ${url}`);
      return (await res.text()).trim();
    }));

    const b64 = parts.join('');
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    if (!('DecompressionStream' in window)) {
      throw new Error('This browser does not support DecompressionStream.');
    }

    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const source = await new Response(stream).text();
    (0, eval)(source);
  } catch (err) {
    console.error('Fishing Aquarium v3.1 load failed', err);
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = '게임 로드 오류 · 새로고침해주세요.';
      toast.classList.remove('hidden');
    }
  }
})();
