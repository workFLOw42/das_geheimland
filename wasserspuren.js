// Das Geheimland – Wasserspuren der Orcas (Live-Wunsch 18.10.2026, wie in "Reise nach Japan" spuren.js): schwimmt ein Orca
// an der Oberflaeche, laeuft hinter ihm eine Heckwelle (helle Scheiben, die auseinanderlaufen und vergehen) und vorn steigt
// etwas Gischt auf; springt er, spritzt es beim Herausschiessen und beim Eintauchen kraeftig nach allen Seiten.
// Nur Optik: keine Grenze, keine Steuerung. Laedt nach story.js, haengt sich an loop (STORY_START).
(function(){
'use strict';
const story = window.STORY;
const TROPFEN_MAX = 220, WELLEN_MAX = 40, SICHT = 400;
const ORCA_RUECKEN = 1.4;                            // Ruecken ueber der Modellunterkante (ORCA_BACK der Engine)
const ws = { tropfen: [], wellen: [], mat: null, wMat: null, wGeo: null };
function bauen(){
  if(ws.mat) return;
  ws.mat = new THREE.MeshBasicMaterial({ color: 0xf2f7fb, transparent: true, opacity: 0.9, depthWrite: false });
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 8, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.7, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  ws.wMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0 });
  ws.wGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
}
// n Tropfen rund um (x, z) auf der Wasserflaeche wy, nach oben und aussen; kraft ~ Groesse und Wucht
function spritzer(x, wy, z, n, kraft){
  bauen();
  for(let i = 0; i < n; i++){
    let t = ws.tropfen.find(q => !q.m.visible);
    if(!t){ if(ws.tropfen.length >= TROPFEN_MAX) return; t = { m: new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), ws.mat), v: new THREE.Vector3() }; t.m.userData.deko = true; scene.add(t.m); ws.tropfen.push(t); }   // global-ok
    const a = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 1.2 * kraft;
    t.m.position.set(x + Math.cos(a) * r, wy + 0.05, z + Math.sin(a) * r); t.m.visible = true; t.t = 0; t.s = (0.8 + Math.random() * 1.2) * Math.min(1.8, 0.6 + kraft * 0.5);
    const aus = (1 + Math.random() * 2.5) * kraft, hoch = (2.5 + Math.random() * 4.5) * kraft;
    t.v.set(Math.cos(a) * aus, hoch, Math.sin(a) * aus);
  }
}
story.spritzer = spritzer;
function welle(x, z, rich, k, groesse){
  bauen();
  let w = ws.wellen.find(q => !q.m.visible);
  if(!w){ if(ws.wellen.length >= WELLEN_MAX) return; w = { m: new THREE.Mesh(ws.wGeo, ws.wMat.clone()) }; w.m.renderOrder = 2; w.m.userData.deko = true; scene.add(w.m); ws.wellen.push(w); }   // global-ok
  w.m.position.set(x, seaYAt(x, z) + 0.06, z); w.m.rotation.y = rich; w.m.visible = true; w.t = 0; w.k = k; w.g = groesse;
}
// Heckwelle fuer andere (Live-Wunsch 18.10.2026: das Segelboot, segeln.js): (x, z) hinter dem Heck, rich = Fahrtrichtung
// (Winkel ab +z), k = 0..1 Fahrt, groesse = Faktor (Orca 1,1)
story.heckWelle = (x, z, rich, k, groesse) => welle(x, z, rich, k, groesse);
function orcaSpuren(dt){
  if(typeof orcas === 'undefined' || !orcas.length) return;
  const cp = camera.position;
  for(const o of orcas){
    if(!o.group || !o.placed || !o.group.visible || Math.hypot(o.x - cp.x, o.z - cp.z) > SICHT){ o.spur = null; continue; }
    const wy = seaYAt(o.x, o.z), oben = o.group.position.y + ORCA_RUECKEN - wy, unten = o.group.position.y - wy;
    const S = o.spur || (o.spur = { oben, unten, t: Math.random() * 0.2, gT: 0 });
    const fx = -Math.sin(o.heading), fz = -Math.cos(o.heading);
    if(S.oben < 0.9 && oben >= 0.9 && oben - S.oben > 1.5 * dt) spritzer(o.x + fx * 2, wy, o.z + fz * 2, 26, 1.6);   // schiesst heraus
    if(S.unten > 0.1 && unten <= 0.1) spritzer(o.x, wy, o.z, 40, 2.0);                                              // klatscht hinein
    S.oben = oben; S.unten = unten;
    if(oben > -0.4 && oben < 0.9){                                                   // schwimmt, Ruecken knapp heraus
      if((S.t -= dt) <= 0){ S.t = 0.3; welle(o.x - fx * 4, o.z - fz * 4, Math.atan2(fx, fz), 0.55, 1.1); }
      if((S.gT -= dt) <= 0){ S.gT = 0.12; spritzer(o.x + fx * 3.6, wy, o.z + fz * 3.6, 2, 0.45); }
    }
  }
}
function schritt(dt){
  if(locale !== 'earth'){ for(const t of ws.tropfen) t.m.visible = false; for(const w of ws.wellen) w.m.visible = false; return; }
  orcaSpuren(dt);
  for(const t of ws.tropfen) if(t.m.visible){
    t.t += dt; t.v.y -= 9.81 * dt; t.m.position.addScaledVector(t.v, dt);
    t.m.scale.setScalar(t.s * Math.max(0.15, 1 - t.t * 1.4));
    if(t.t > 0.9 || t.m.position.y < seaYAt(t.m.position.x, t.m.position.z) - 0.2) t.m.visible = false;
  }
  for(const w of ws.wellen) if(w.m.visible){
    w.t += dt; const a = w.t / 1.6, g = w.g || 1;
    w.m.scale.set((2.4 + a * 7 * (0.5 + w.k)) * g, 1, (1.6 + a * 3) * g);
    w.m.position.y = seaYAt(w.m.position.x, w.m.position.z) + 0.06;
    w.m.material.opacity = 0.6 * (0.4 + w.k) * (1 - a);
    if(a >= 1) w.m.visible = false;
  }
}
let tVor = 0;
const startVorher = window.STORY_START;
window.STORY_START = function(){
  const loopOrig = loop;
  loop = function(){
    const r = loopOrig.apply(this, arguments);
    const t = performance.now(), dt = tVor ? Math.min(0.1, (t - tVor) / 1000) : 0; tVor = t;
    const pause = document.getElementById('hint') && document.getElementById('hint').classList.contains('show');
    if(!pause) schritt(dt);
    return r;
  };
  if(startVorher) return startVorher.apply(this, arguments);
};
})();
