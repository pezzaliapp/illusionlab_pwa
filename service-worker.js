// IllusionLab — offline cache v1.3 (Bright Edition)
const CACHE = 'illusionlab-bright-v1-3';
const CORE = ['./','./index.html','./styles.css','./app.js','./manifest.json','./icon/illusion-192.png','./icon/illusion-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp=>{
      const url = new URL(req.url);
      const ok = (url.origin===location.origin) || url.hostname.endsWith('wikimedia.org') || url.hostname.endsWith('wikipedia.org');
      if(ok){ const copy = resp.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); }
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
