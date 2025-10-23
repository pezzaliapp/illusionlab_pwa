const CACHE='illusionlab-wikimedia-v1-3-2';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.json','./icon/illusion-192.png','./icon/illusion-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // App shell: cache-first; External images: network-first (no cache here)
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }else{
    e.respondWith(fetch(e.request).catch(()=>caches.match('./index.html')));
  }
});
