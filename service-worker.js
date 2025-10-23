const CACHE='illusionlab-contrast-v1-3-1';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.json',
  './icon/illusion-192.png','./icon/illusion-512.png',
  './img/blivet.svg','./img/necker.svg','./img/penrose_triangle.svg','./img/penrose_stairs.svg',
  './img/ames_room.svg','./img/rubin_vase.svg','./img/duck_rabbit.svg','./img/kanizsa_triangle.svg',
  './img/muller_lyer.svg','./img/fraser_spiral.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const cp=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return resp;}).catch(()=>caches.match('./index.html'))));});
