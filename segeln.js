// Das Geheimland – Anzeigen beim Segeln (Live-Wunsch 16.10.2026). Laedt nach ausruestung.js.
// Rechts oben Joshis Kompass (das eingesammelte Modell; sobald er im Rucksack ist, immer – auch zu Fuss; die Nadel zeigt
// nach Norden und pendelt nach). Im Segelboot (steg.js) oben links das Radar (gleich gross wie der Kompass) mit dem roten
// Punkt zum Ziel (wie in Trip to Japan: die SPITZE des Dreiecks ist das Boot), darunter der Schubbalken
// (senkrecht, so breit wie das Radar; Farben wie in der Engine; blendet nach 5 s aus, bei jeder Aenderung wieder da). Kein linkes HUD, kein Gyroskop.
// In der Mustang (Etappe 3, hoehle.js story.e3FlugAnzeige) dieselben Anzeigen: Radar mit dem roten Punkt, Schubbalken.
// Ziel: story.ziel = { x, z, r } – gesetzt, sobald der Funkspruch angenommen ist (FALL1_ZIEL). Ankommen wie in Trip to
// Japan: grob in der Naehe (Abstand < r), dann story.zielErreicht().
(function(){
'use strict';
const story = window.STORY;
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));

// Ziel des ersten Falls: draussen auf dem Meer. Direkt hingesteuert hoechstens ~15 s (zielZiehen). Was dort ist, kommt noch.
// r: Zielzone (wie in Trip to Japan: den Punkt nicht genau treffen muessen – Live-Befund: bei 30 m verschwand der Punkt und
// man segelte noch ein Stueck weiter, bevor die Blende kam)
// Startpunkt weit draussen (~450 m); er rueckt entgegen, wenn man auf ihn zufaehrt (zielZiehen)
const FALL1_ZIEL = { x: 201, z: 402, r: 60 };
const RADAR_WEIT = 300;          // m am Radarrand
const W = 130;                   // Groesse von Radar und Kompass (px), wie die Engine-Scheiben
const SCHUB_H = 293;            // Hoehe des Schubbalkens (px) – Segmente um 1/3 groesser als zuerst (220, Live-Wunsch)
const SCHUB_ABST = 20;          // px Luft zwischen Radar und Schubbalken (Live-Wunsch: 10 px tiefer)
const FLUG_WEIT = 3000;         // m am Radarrand im Flugzeug (es ist zehnmal so schnell wie das Boot)

// ---- Anzeigen (DOM) ---------------------------------------------------------------------------------------------
const hud = { radar: null, ctx: null, kompass: null, schub: null, seg: [], an: false };
function bauen(){
  if(hud.radar) return;
  const c = document.createElement('canvas'); c.width = c.height = W;
  c.style.cssText = 'position:absolute;left:12px;top:12px;width:' + W + 'px;height:' + W + 'px;pointer-events:none;z-index:16;display:none;';   // oben links (das linke HUD ist aus)
  c.dataset.etappeHud = '1'; document.body.appendChild(c); hud.radar = c; hud.ctx = c.getContext('2d');
  // Schubbalken senkrecht unter dem Radar, so breit wie das Radar (unten = rot/rueckwaerts, nach oben mehr Fahrt).
  // Nach SCHUB_SICHT s ohne Aenderung blendet er ueber SCHUB_AUS s aus; aendert sich der Schub, ist er sofort wieder da.
  const s = document.createElement('div');
  s.style.cssText = 'position:absolute;left:12px;top:' + (12 + W + SCHUB_ABST) + 'px;width:' + (W - 6) + 'px;height:' + SCHUB_H + 'px;padding:3px;border-radius:9px;'
    + 'background:rgba(0,0,0,.45);display:none;flex-direction:column-reverse;gap:3px;pointer-events:none;z-index:15;';
  for(let i = 0; i < SCHUB_N; i++){ const q = document.createElement('div'); q.style.cssText = 'flex:1;border-radius:3px;background:' + schubFarbe(i) + ';opacity:.15;'; s.appendChild(q); hud.seg.push(q); }
  s.dataset.etappeHud = '1'; document.body.appendChild(s); hud.schub = s;
  // Kompass: eigenes kleines WebGL-Bild (das Modell aus dem Rucksack)
  const k = document.createElement('canvas'); k.width = k.height = W * 2;
  k.style.cssText = 'position:absolute;right:12px;top:12px;width:' + W + 'px;height:' + W + 'px;pointer-events:none;z-index:15;display:none;';
  k.dataset.etappeHud = '1'; document.body.appendChild(k); hud.kompass = k;
}
function zeigen(an){
  if(an === hud.an) return;
  hud.an = an;
  hud.radar.style.display = an ? 'block' : 'none';
  hud.schub.style.display = an ? 'flex' : 'none';
  if(an){ schubT = 0; schubAlt = '';                            // beim Einsteigen erst einmal zeigen
    // Der Balken setzt UNTER dem Radar an (Live-Wunsch: das Radar nie ueberdecken) – an der gemessenen Unterkante
    const r = hud.radar.getBoundingClientRect(); hud.schub.style.top = Math.round(r.bottom + SCHUB_ABST) + 'px'; }
}

// ---- Radar: Spitze des Dreiecks = das Boot, roter Punkt = Ziel (wie Trip to Japan, story.js hookRadarAnzeige) -----
function malRadar(x, z, kurs, ziel, weit){
  ziel = ziel || story.ziel; weit = weit || RADAR_WEIT;
  const g = hud.ctx, cx = W / 2, cy = W / 2, R = W / 2 - 6;
  g.clearRect(0, 0, W, W);
  g.fillStyle = 'rgba(10,25,40,0.55)'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  // Alles auf die Scheibe zuschneiden (Live-Befund: weit von der Insel ragte ihr Fleck ueber den Rand hinaus)
  g.save(); g.beginPath(); g.arc(cx, cy, R - 1, 0, Math.PI * 2); g.clip();
  // Insel (Startinsel bei 0, 0) als heller Fleck – zum Wiederfinden
  const punkt = (px, pz, r, farbe, rand) => {
    const dx = px - x, dz = pz - z, rel = kurs - Math.atan2(dx, dz), d = Math.hypot(dx, dz);
    const rr = Math.min(R - 8, d / weit * (R - 8));
    g.fillStyle = farbe; g.beginPath(); g.arc(cx + Math.sin(rel) * rr, cy - Math.cos(rel) * rr, r, 0, Math.PI * 2); g.fill();
    if(rand){ g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; g.stroke(); }
  };
  if(story.insel) punkt(0, 0, Math.max(3, story.insel.R * 1.12 / weit * (R - 8)), 'rgba(220,200,140,0.55)');
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - 5, cy + 13); g.lineTo(cx + 5, cy + 13); g.closePath(); g.fill();
  if(ziel) punkt(ziel.x, ziel.z, 5, '#ff5a3c', true);
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
}
// ---- Schubbalken: der eingestellte Schub (0..100 %, rueckwaerts = rotes Segment) – nicht die Fahrt: die naehert sich
// dem Hoechstwert nur an, damit blieb das letzte blaue Segment unerreichbar (Live-Befund 16.10.) ------------------------
const SCHUB_SICHT = 5, SCHUB_AUS = 1.5;      // s sichtbar nach der letzten Aenderung, dann s ausblenden
let schubAlt = '', schubT = 0, schubOp = '';
// Live-Wunsch 18.10.2026: sichtbar nicht erst, wenn sich der Schub AENDERT, sondern sobald die Schubtasten betaetigt
// werden – auch bei Vollschub und weiter hoch gedrueckt. Schubtasten: rechter Stick / W,S (thrHold), Leertaste, X, A/C
// (Hook in hookSegeln). Eine geaenderte Stufe zaehlt weiterhin mit.
function schubBetaetigt(){ schubT = 0; }
function malSchub(g, dt){
  const an = g < -0.01 ? -1 : Math.round(klemme(g, 0, 1) * 10);
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

// ---- Fahrt sichtbar machen (Live-Wunsch 16.10.): Gischt an den Seiten, leichter Fahrtwind --------------------------
// Gischt: kleine helle Spritzer, die vorn an beiden Bordwaenden aufsteigen und schraeg nach hinten-aussen wegfliegen,
// mehr und weiter, je schneller das Boot faehrt. Wind: duenne Striche um die Kamera, die nach hinten ziehen – Machart
// wie der Fahrtwind in Trip to Japan (finale.js fahrtwind), aber deutlich weniger: wenige, blasse, erst ab halber Fahrt.
const GISCHT_MAX = 160, WIND_N = 14, WIND_OPAZ = 0.22;
const fahrt = { g: null, gischt: [], gMat: null, gT: 0, wind: null, windPos: null, windT: [] };
function fahrtBauen(){
  if(fahrt.g) return;
  const g = fahrt.g = new THREE.Group(); g.userData.deko = true; story.welt(1).add(g);
  fahrt.gMat = new THREE.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.85, depthWrite: false });
  fahrt.windPos = new Float32Array(WIND_N * 6);
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.BufferAttribute(fahrt.windPos, 3));
  fahrt.wind = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
  fahrt.wind.frustumCulled = false; g.add(fahrt.wind);
  for(let i = 0; i < WIND_N; i++) fahrt.windT.push({ x: 0, y: 0, z: 0, life: 0 });
}
const _gV = new THREE.Vector3();
const _gInv = new THREE.Matrix4(), _gL = new THREE.Vector3(), _gK = new THREE.Vector3();
const GISCHT_RAND = 0.35;      // m ueber dem Bootsboden (Bootskoordinaten): so hoch duerfen Spritzer dicht an der Bordwand
function updateFahrtOptik(dt, s, an){
  fahrtBauen();
  const v = an ? Math.abs(s.v) : 0, k = klemme(v / 3.2, 0, 1);
  // Gischt: am Bug links und rechts, alle paar Hundertstel ein Spritzer
  fahrt.gT -= dt;
  if(an && v > 0.4 && fahrt.gT <= 0 && story.bootPunkt){
    fahrt.gT = 0.022 / (0.3 + k);                             // bei voller Fahrt ~ 60 Spritzer pro Sekunde und Seite
    const fx = Math.sin(s.yaw), fz = Math.cos(s.yaw), vor = s.v >= 0 ? 1 : -1;
    for(const seite of [-1, 1]){
      let t = fahrt.gischt.find(q => !q.m.visible);
      if(!t){ if(fahrt.gischt.length >= GISCHT_MAX) break; t = { m: new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0), fahrt.gMat), v: new THREE.Vector3() }; fahrt.g.add(t.m); fahrt.gischt.push(t); }
      // vorn an der Bordwand (etwas hinter der Spitze), auf der Wasserlinie – genau AUSSEN an der Wand dieser Stelle
      // (story.bordwand: der Rumpf ist unsymmetrisch; mit festen 0,8 m lag die Gischt rechts im Boot, Live-Befund 17.10.)
      // ausserhalb der BORDKANTE (Draufsicht), nicht nur der Wasserlinie – sonst sah man sie von oben im Boot
      const lz = (1.0 + Math.random() * 1.0) * vor, wand = story.bordwand ? story.bordwand(lz, seite, true) : 0.8 * seite;
      const p = story.bootPunkt(lz, wand + seite * 0.12, -0.3) || _gV.set(s.bx, 0, s.bz);
      t.m.position.set(p.x, seaYAt(p.x, p.z) + 0.05, p.z); t.m.visible = true; t.t = 0; t.s = 0.6 + Math.random() * 1.0;
      // seitlich hinaus, nach hinten und ein Stueck hoch
      const quer = (0.8 + Math.random() * 0.9) * (0.5 + k), hoch = 0.8 + Math.random() * 1.0 * (0.4 + k), zurueck = 0.4 + k * 0.8;
      t.v.set(fz * seite * quer - fx * zurueck * vor, hoch, -fx * seite * quer - fz * zurueck * vor);
    }
  }
  // Heckwelle (Live-Wunsch 18.10.2026, wie bei den Orcas – wasserspuren.js story.heckWelle): alle paar Zehntel eine helle
  // Scheibe hinter dem Heck, die auseinanderlaeuft und vergeht; je schneller, desto oefter und breiter
  fahrt.wT = (fahrt.wT || 0) - dt;
  if(an && v > 0.5 && fahrt.wT <= 0 && story.heckWelle && story.bootPunkt){
    fahrt.wT = 0.16 / (0.4 + k);
    const vor = s.v >= 0 ? 1 : -1, p = story.bootPunkt(-3.3 * vor, 0, -0.3);
    if(p) story.heckWelle(p.x, p.z, (story.bootYaw ? story.bootYaw() : s.yaw) + (vor < 0 ? Math.PI : 0), 0.3 + k * 0.6, 0.55);
  }
  // nie ueber dem Boot (Live-Befund 17.10.: Spritzer flogen ueber den Bug ins Boot): in Bootskoordinaten pruefen, ob
  // der Punkt zwischen den Bordwaenden liegt (story.bordwand), egal in welcher Hoehe
  const inv = story.stegZustand && story.stegZustand.boot ? _gInv.copy(story.stegZustand.boot.matrixWorld).invert() : null;
  if(inv) _gK.copy(camera.position).applyMatrix4(inv);             // Kamera in Bootskoordinaten (auf welcher Seite?)
  for(const t of fahrt.gischt) if(t.m.visible){
    t.t += dt; t.v.y -= 9.81 * dt; t.m.position.addScaledVector(t.v, dt);
    t.m.scale.setScalar(t.s * Math.max(0.15, 1 - t.t * 1.4));
    if(t.t > 0.7 || t.m.position.y < seaYAt(t.m.position.x, t.m.position.z) - 0.2) t.m.visible = false;
    else if(inv && story.bordwand){ _gL.copy(t.m.position).applyMatrix4(inv);
      // ueber dem Boot nie – und nahe an der Bordwand nicht hoeher als ihre Oberkante (sonst sah man sie von der anderen
      // Seite ueber den Rand hinweg "im Boot", Live-Bild 17.10.)
      const l = story.bordwand(_gL.z, -1, true), r = story.bordwand(_gL.z, 1, true);   // Bordkante (Draufsicht)
      if(Math.abs(_gL.z) < 3.2 && (_gL.x > l - 0.05 && _gL.x < r + 0.05 || (_gL.x > l - 0.6 && _gL.x < r + 0.6 && _gL.y > GISCHT_RAND))) t.m.visible = false;
      // auf der von der Kamera abgewandten Seite nicht (man saehe sie ueber den niedrigen Bootsrand hinweg wie "im Boot")
      // (nur wenn die Kamera deutlich seitlich steht – von hinten sieht man nicht ins Boot, dann beide Seiten)
      else if(Math.abs(_gK.x) > 1.5 && Math.abs(_gL.z) < 3.2 && Math.sign(_gL.x) !== Math.sign(_gK.x)) t.m.visible = false; }
  }
  // Wind: erst ab halber Fahrt, sanft ein- und ausblenden
  const st = an ? klemme((v - 1.4) / 1.8, 0, 1) : 0;
  fahrt.wind.material.opacity += (WIND_OPAZ * st - fahrt.wind.material.opacity) * Math.min(1, dt * 2);
  if(fahrt.wind.material.opacity < 0.005) return;
  const fx = Math.sin(s.yaw) * Math.sign(s.v || 1), fz = Math.cos(s.yaw) * Math.sign(s.v || 1), c = camera.position;
  fahrt.windT.forEach((w, i) => {
    w.life -= dt;
    if(w.life <= 0){ w.life = 0.5 + Math.random() * 0.5;
      const vor = 4 + Math.random() * 8, a = Math.random() * 6.28, r = 2 + Math.random() * 3;   // Ring um die Blickachse (Mitte frei)
      w.x = c.x + fx * vor + fz * Math.cos(a) * r; w.y = c.y - 0.8 + Math.sin(a) * r * 0.6; w.z = c.z + fz * vor - fx * Math.cos(a) * r; }
    const zu = (v * 2.5 + 2) * dt;                                // zieht an der Kamera vorbei nach hinten
    w.x += s.v * Math.sin(s.yaw) * dt - fx * zu; w.z += s.v * Math.cos(s.yaw) * dt - fz * zu;
    const len = 0.5 + v * 0.15;
    fahrt.windPos.set([w.x, w.y, w.z, w.x + fx * len, w.y, w.z + fz * len], i * 6);
  });
  fahrt.wind.geometry.attributes.position.needsUpdate = true;
}

// ---- Jedes Bild --------------------------------------------------------------------------------------------------
let kompassAn = false;
function update(dt){
  bauen();
  const s = story.stegZustand;
  const imBoot = !!(eva && s && s.imBoot && !s.wechsel && locale === 'earth');
  const flug = story.e3FlugAnzeige ? story.e3FlugAnzeige() : null;   // in der Mustang
  zeigen(imBoot || !!flug);
  // Kompass (Live-Wunsch): sobald er im Rucksack ist, immer rechts oben – zu Fuss, schwimmend und im Boot. Nicht im
  // Huetten-Raum (eigene Welt, dort gibt es kein Norden) und nicht waehrend der Ausruestungs-Szene.
  const k = !!(eva && story.ausruestung && story.ausruestung.kompass && !(story.innen && story.innen.drin) && locale === 'earth');
  if(k !== kompassAn){ kompassAn = k; hud.kompass.style.display = k ? 'block' : 'none'; }
  // Blickrichtung ab +z: im Boot der Bug, sonst Joshi (Engine: Nase -Z -> yaw + PI)
  if(k) malKompass(imBoot ? story.bootYaw() : eva.yaw + Math.PI, dt);
  if(s && story.etappe === 1) updateFahrtOptik(dt, s, imBoot);
  if(flug){ malRadar(flug.x, flug.z, flug.kurs, flug.ziel, FLUG_WEIT); malSchub(state.throttle, dt); return; }
  if(!imBoot) return;
  const kurs = story.bootYaw();                                  // Bug-Richtung ab +z
  malRadar(s.bx, s.bz, kurs);
  malSchub(story.bootSchub ? story.bootSchub() : 0, dt);
  // Angekommen? Grob in der Naehe reicht (wie in Trip to Japan)
  const z = story.ziel;
  if(z) zielZiehen(z, s, dt);
  if(z && Math.hypot(s.bx - z.x, s.bz - z.z) < (z.r || 60)){
    story.ziel = null;
    state.throttle = 0;                                           // das Boot laeuft aus, die Blende kommt sofort
    if(story.zielErreicht) story.zielErreicht(z);
  }
}
story.fall1Angenommen = function(){ story.ziel = Object.assign({}, FALL1_ZIEL); };
// Das Ziel kommt entgegen (Live-Wunsch 16.10.): es liegt weit draussen, damit rund um die Insel Platz zum Herumfahren
// bleibt – faehrt man aber auf den Punkt zu, rueckt er dem Boot entgegen: so schnell wie das Boot ihm naeherkommt, mal
// ZIEL_ZUG – aber nur, wenn der Bug wirklich auf ihn zeigt (Abweichung unter ~45 Grad, voll ab ~18 Grad). Direkt vom
// Steg mit voller Fahrt: ~14 s (im Spiel gemessen, C:/tmp/jfg/test/ziel15.js); wer herumkreuzt, dem rueckt es kaum nach. Nie naeher
// als ZIEL_MIN m an die Inselmitte: der Ring ums Ufer (Sand bis ~99 m) bleibt frei zum Herumfahren. Ankommen zaehlt nur
// im Boot (s. o. imBoot) – schwimmend ist das Ziel nie erreichbar.
const ZIEL_ZUG = 8, ZIEL_MIN = 200;
function zielZiehen(z, s, dt){
  const dx = z.x - s.bx, dz = z.z - s.bz, d = Math.hypot(dx, dz); if(d < 1) return;
  const c = (Math.sin(s.yaw) * dx + Math.cos(s.yaw) * dz) / d;   // cos der Abweichung Bug <-> Ziel
  const naeher = Math.max(0, c) * Math.max(0, s.v) * klemme((c - 0.7) / 0.25, 0, 1);   // m/s in Richtung Ziel
  if(naeher <= 0) return;
  const w = Math.min(naeher * ZIEL_ZUG * dt, d - (z.r || 60) * 0.5);
  if(w <= 0) return;
  const nx = z.x - dx / d * w, nz = z.z - dz / d * w;
  if(Math.hypot(nx, nz) < ZIEL_MIN) return;                      // nicht bis an die Insel heranruecken
  z.x = nx; z.z = nz;
}
// Was am Ziel passiert, kommt noch – vorerst nur ein Satz der Erzaehlerin
story.zielErreicht = story.zielErreicht || function(){ story.sprich(['Du bist angekommen!']); };   // globus.js ersetzt das

function hookSegeln(){
  // Schubtasten betaetigt -> Schubbalken sofort wieder ganz sichtbar (siehe schubBetaetigt)
  const holdOrig = thrHold;
  thrHold = function(dir){ if(dir) schubBetaetigt(); return holdOrig.apply(this, arguments); };
  const leseOrig = readInput;
  readInput = function(){
    const r = leseOrig.apply(this, arguments);
    if(keys['Space'] || keys['KeyC'] || keys['KeyX'] || keys['ShiftLeft'] || keys['ShiftRight'] || aPrev || boosting) schubBetaetigt();
    return r;
  };
  const loopOrig = loop;
  let tVor = performance.now();
  loop = function(){
    const jetzt = performance.now(), dt = Math.min(0.1, (jetzt - tVor) / 1000); tVor = jetzt;
    if(!(story.pause && story.pause())) update(dt);               // Pause: Gischt, Wind, Kompassnadel stehen
    return loopOrig.apply(this, arguments);
  };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookSegeln(); };
})();
