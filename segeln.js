// Das Geheimland – Anzeigen beim Segeln (Live-Wunsch 16.10.2026). Laedt nach ausruestung.js.
// Rechts oben Joshis Kompass (das eingesammelte Modell; sobald er im Rucksack ist, immer – auch zu Fuss; die Nadel zeigt
// nach Norden und pendelt nach). Im Segelboot (steg.js) oben links das Radar (gleich gross wie der Kompass) mit dem roten
// Punkt zum Ziel (wie in Trip to Japan: die SPITZE des Dreiecks ist das Boot), darunter waagerecht der Schubbalken
// (Farben wie in der Engine; blendet nach 5 s aus, bei jeder Aenderung wieder da). Kein linkes HUD, kein Gyroskop.
// Ziel: story.ziel = { x, z, r } – gesetzt, sobald der Funkspruch angenommen ist (FALL1_ZIEL). Ankommen wie in Trip to
// Japan: grob in der Naehe (Abstand < r), dann story.zielErreicht().
(function(){
'use strict';
const story = window.STORY;
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));

// Ziel des ersten Falls: draussen auf dem Meer, gut 200 m vom Steg (Fahrt ~ 1 min). Was dort ist, kommt noch.
const FALL1_ZIEL = { x: 150, z: 300, r: 30 };
const RADAR_WEIT = 300;          // m am Radarrand
const W = 130;                   // Groesse von Radar und Kompass (px), wie die Engine-Scheiben

// ---- Anzeigen (DOM) ---------------------------------------------------------------------------------------------
const hud = { radar: null, ctx: null, kompass: null, schub: null, seg: [], an: false };
function bauen(){
  if(hud.radar) return;
  const c = document.createElement('canvas'); c.width = c.height = W;
  c.style.cssText = 'position:absolute;left:12px;top:12px;pointer-events:none;z-index:15;display:none;';   // oben links (das linke HUD ist aus)
  document.body.appendChild(c); hud.radar = c; hud.ctx = c.getContext('2d');
  // Schubbalken waagerecht unter dem Radar, so breit wie das Radar (links = rot/rueckwaerts, nach rechts mehr Fahrt).
  // Nach SCHUB_SICHT s ohne Aenderung blendet er ueber SCHUB_AUS s aus; aendert sich der Schub, ist er sofort wieder da.
  const s = document.createElement('div');
  s.style.cssText = 'position:absolute;left:12px;top:' + (12 + W + 8) + 'px;width:' + (W - 6) + 'px;height:22px;padding:3px;border-radius:7px;'
    + 'background:rgba(0,0,0,.45);display:none;flex-direction:row;gap:2px;pointer-events:none;z-index:15;';
  for(let i = 0; i < SCHUB_N; i++){ const q = document.createElement('div'); q.style.cssText = 'flex:1;border-radius:3px;background:' + schubFarbe(i) + ';opacity:.15;'; s.appendChild(q); hud.seg.push(q); }
  document.body.appendChild(s); hud.schub = s;
  // Kompass: eigenes kleines WebGL-Bild (das Modell aus dem Rucksack)
  const k = document.createElement('canvas'); k.width = k.height = W * 2;
  k.style.cssText = 'position:absolute;right:12px;top:12px;width:' + W + 'px;height:' + W + 'px;pointer-events:none;z-index:15;display:none;';
  document.body.appendChild(k); hud.kompass = k;
}
function zeigen(an){
  if(an === hud.an) return;
  hud.an = an;
  hud.radar.style.display = an ? 'block' : 'none';
  hud.schub.style.display = an ? 'flex' : 'none';
  if(an){ schubT = 0; schubAlt = ''; }                          // beim Einsteigen erst einmal zeigen
}

// ---- Radar: Spitze des Dreiecks = das Boot, roter Punkt = Ziel (wie Trip to Japan, story.js hookRadarAnzeige) -----
function malRadar(x, z, kurs){
  const g = hud.ctx, cx = W / 2, cy = W / 2, R = W / 2 - 6;
  g.clearRect(0, 0, W, W);
  g.fillStyle = 'rgba(10,25,40,0.55)'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  // Insel (Startinsel bei 0, 0) als heller Fleck – zum Wiederfinden
  const punkt = (px, pz, r, farbe, rand) => {
    const dx = px - x, dz = pz - z, rel = kurs - Math.atan2(dx, dz), d = Math.hypot(dx, dz);
    const rr = Math.min(R - 8, d / RADAR_WEIT * (R - 8));
    g.fillStyle = farbe; g.beginPath(); g.arc(cx + Math.sin(rel) * rr, cy - Math.cos(rel) * rr, r, 0, Math.PI * 2); g.fill();
    if(rand){ g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; g.stroke(); }
  };
  if(story.insel) punkt(0, 0, Math.max(3, story.insel.R * 1.12 / RADAR_WEIT * (R - 8)), 'rgba(220,200,140,0.55)');
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - 5, cy + 13); g.lineTo(cx + 5, cy + 13); g.closePath(); g.fill();
  if(story.ziel) punkt(story.ziel.x, story.ziel.z, 5, '#ff5a3c', true);
}
// ---- Schubbalken: Fahrt des Boots (vorwaerts 0..100 %, rueckwaerts = rotes Segment) --------------------------------
const SCHUB_SICHT = 5, SCHUB_AUS = 1.5;      // s sichtbar nach der letzten Aenderung, dann s ausblenden
let schubAlt = '', schubT = 0, schubOp = '';
function malSchub(v, dt){
  const an = v < -0.05 ? -1 : Math.round(klemme(v / 3.2, 0, 1) * 10);
  if(String(an) !== schubAlt){
    schubAlt = String(an); schubT = 0;                           // geaendert: sofort wieder ganz sichtbar
    hud.seg.forEach((q, i) => { q.style.opacity = (i === 0 ? an < 0 : i <= an) ? '1' : '.15'; });
  } else schubT += dt;
  const op = klemme(1 - (schubT - SCHUB_SICHT) / SCHUB_AUS, 0, 1).toFixed(2);
  if(op !== schubOp){ schubOp = op; hud.schub.style.opacity = op; }
}
// ---- Kompass: Modell von oben, Nadel zeigt nach Norden (-z der Welt) und pendelt gedaempft nach --------------------
const ko = { r: null, sz: null, cam: null, obj: null, nadel: null, w: 0, v: 0, laedt: false };
function kompassBauen(){
  if(ko.r || ko.laedt || !story.kompassVorlage) return;
  ko.laedt = true;
  story.kompassVorlage().then(v => {
    ko.r = new THREE.WebGLRenderer({ canvas: hud.kompass, alpha: true, antialias: true });
    ko.r.setPixelRatio(1); ko.r.setSize(W * 2, W * 2, false);
    ko.sz = new THREE.Scene();
    ko.sz.add(new THREE.HemisphereLight(0xfff4e0, 0x505868, 1.1));
    const l = new THREE.DirectionalLight(0xffffff, 0.8); l.position.set(0.5, 2, 1); ko.sz.add(l);
    const o = v.clone(true); ko.obj = o;
    o.traverse(n => { if(n.name === 'needle_4') ko.nadel = n; });
    // Nadel deutlich: im Modell silbergrau und von oben kaum zu sehen -> rot (die Spitze mit dem Leuchtpunkt zeigt nach
    // Norden), Leuchtpunkt hell. Eigene Materialien, die Vorlage (Tisch, Rucksack) bleibt wie sie ist.
    if(ko.nadel) ko.nadel.traverse(n => { if(!n.isMesh) return; const m = n.material.clone(); n.material = m;
      if(/glow/.test(m.name)){ m.color && m.color.set(0xffffff); if(m.emissive) m.emissive.set(0xffe680); }
      else if(/black/.test(m.name)){
        // Nordhaelfte (+z, Spitze mit Leuchtpunkt) rot, Suedhaelfte hellgrau – ueber Eckenfarben einer eigenen Geometrie
        const g = n.geometry = n.geometry.clone(), p = g.attributes.position, c = new Float32Array(p.count * 3);
        for(let i = 0; i < p.count; i++){ const nord = p.getZ(i) > 0; c.set(nord ? [0.86, 0.1, 0.1] : [0.82, 0.84, 0.88], i * 3); }
        g.setAttribute('color', new THREE.BufferAttribute(c, 3));
        m.map = null; m.vertexColors = true; m.color.set(0xffffff); if(m.emissive) m.emissive.set(0x200000); }
      m.needsUpdate = true; });
    const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
    o.position.sub(c); ko.sz.add(o);
    const m = Math.max(s.x, s.z) * 0.56;
    ko.cam = new THREE.OrthographicCamera(-m, m, m, -m, 0.01, 10); ko.cam.position.set(0, 1, 0.12); ko.cam.lookAt(0, 0, 0);
    ko.basis = ko.nadel ? ko.nadel.quaternion.clone() : null;
  });
}
const _qn = new THREE.Quaternion(), _yA = new THREE.Vector3(0, 1, 0);
function malKompass(kurs, dt){
  kompassBauen();
  if(!ko.r || !ko.nadel) return;
  // Gehaeuse dreht mit dem Boot (die Bootsspitze zeigt im Bild nach oben), die Nadel bleibt im Norden: relativ zum
  // Gehaeuse = -kurs. Gedaempfte Feder, damit sie wie eine echte Nadel nachschwingt.
  // Die Vorlage dreht die Nadel schon um 180 Grad (Spitze bei w = 0 im Bild oben). Blick nach Norden (kurs = PI) -> w = 0.
  // Nachgeprueft an Bildern: Norden rot oben, Blick nach Westen -> rot rechts, Sueden -> rot unten.
  const soll = -kurs + Math.PI;
  let d = soll - ko.w; d = Math.atan2(Math.sin(d), Math.cos(d));
  ko.v += (d * 18 - ko.v * 3.2) * dt; ko.w += ko.v * dt;
  ko.nadel.quaternion.copy(ko.basis).premultiply(_qn.setFromAxisAngle(_yA, ko.w));
  ko.r.render(ko.sz, ko.cam);
}
story.kompassNadel = () => ko.w;

// ---- Jedes Bild --------------------------------------------------------------------------------------------------
let kompassAn = false;
function update(dt){
  bauen();
  const s = story.stegZustand;
  const imBoot = !!(eva && s && s.imBoot && !s.wechsel && locale === 'earth');
  zeigen(imBoot);
  // Kompass (Live-Wunsch): sobald er im Rucksack ist, immer rechts oben – zu Fuss, schwimmend und im Boot. Nicht im
  // Huetten-Raum (eigene Welt, dort gibt es kein Norden) und nicht waehrend der Ausruestungs-Szene.
  const k = !!(eva && story.ausruestung && story.ausruestung.kompass && !(story.innen && story.innen.drin) && locale === 'earth');
  if(k !== kompassAn){ kompassAn = k; hud.kompass.style.display = k ? 'block' : 'none'; }
  // Blickrichtung ab +z: im Boot der Bug, sonst Joshi (Engine: Nase -Z -> yaw + PI)
  if(k) malKompass(imBoot ? story.bootYaw() : eva.yaw + Math.PI, dt);
  if(!imBoot) return;
  const kurs = story.bootYaw();                                  // Bug-Richtung ab +z
  malRadar(s.bx, s.bz, kurs);
  malSchub(s.v, dt);
  // Angekommen? Grob in der Naehe reicht (wie in Trip to Japan)
  const z = story.ziel;
  if(z && Math.hypot(s.bx - z.x, s.bz - z.z) < (z.r || 30)){
    story.ziel = null;
    if(story.zielErreicht) story.zielErreicht(z);
  }
}
story.fall1Angenommen = function(){ story.ziel = Object.assign({}, FALL1_ZIEL); };
// Was am Ziel passiert, kommt noch – vorerst nur ein Satz der Erzaehlerin
story.zielErreicht = story.zielErreicht || function(){ story.sprich(['Du bist angekommen!']); };

function hookSegeln(){
  const loopOrig = loop;
  let tVor = performance.now();
  loop = function(){
    const jetzt = performance.now(), dt = Math.min(0.1, (jetzt - tVor) / 1000); tVor = jetzt;
    update(dt);
    return loopOrig.apply(this, arguments);
  };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookSegeln(); };
})();
