(async()=>{
  const names=['game-01.txt','game-02.txt','game-03.txt','game-04.txt','game-05.txt','game-06.txt'];
  const parts=await Promise.all(names.map(async n=>{const r=await fetch('./payload/'+n);if(!r.ok)throw new Error('payload '+n+' '+r.status);return r.text();}));
  const b=Uint8Array.from(atob(parts.join('').replace(/\s/g,'')),c=>c.charCodeAt(0));
  const ds=new DecompressionStream('gzip');
  const src=await new Response(new Blob([b]).stream().pipeThrough(ds)).text();
  (0,eval)(src);
})().catch(err=>{console.error(err);document.body.insertAdjacentHTML('beforeend','<pre style="position:fixed;inset:20px;background:#200;color:#fff;padding:20px;z-index:99999">Prototype load failed: '+String(err)+'</pre>');});
