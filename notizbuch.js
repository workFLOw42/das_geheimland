// Das Geheimland – Fotos und Skizzen fuers Notizbuch (Live-Wunsch 16.10.2026). Laedt nach ausruestung.js.
// An bestimmten Stellen geht ein Foto (blauer Kreis am Boden) oder eine Bleistiftskizze (roter Kreis) – jedes Bild ist
// vorgegeben (Blick, Ausschnitt, wo der Fuchs sitzt). Steht Joshi auf dem Kreis, erscheint ein Y. Mit Y:
//   Foto:   die Kamera kommt aus dem Rucksack -> in Inventargroesse ein Bild wie durch den Sucher -> Klick und Blitz ->
//           das Bild fliegt in den Rucksack und wird ins Notizbuch geklebt.
//   Skizze: der Stift kommt aus dem Rucksack -> eine leere Seite, auf die der Stift die Szene als Bleistiftzeichnung
//           kritzelt -> sie fliegt in den Rucksack und kommt ins Notizbuch.
// Jede Stelle geht nur einmal. Freigeschaltet werden sie mit dem Funkspruch des ersten Falls (Kamera und Stift sind
// dann im Rucksack). Das Notizbuch selbst (blaettern, B = zu) steckt in ausruestung.js; die Seiten liefert story.notizSeiten.
(function(){
'use strict';
const story = window.STORY;
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));
const weich = (k) => { k = klemme(k, 0, 1); return k * k * (3 - 2 * k); };

// ---- Die Stellen (alles vorgegeben) -----------------------------------------------------------------------------
// kreis: wo Joshi stehen muss (x, z), r; blick: Kamera fuers Bild (Position, yaw/pitch wie die Engine-Kamera, fov);
// fuchs: wo der Fuchs dabei sitzt und dass er zur Kamera schaut; ohneJoshi: Joshi ist nicht im Bild.
// Blicke ausgemessen (C:/tmp/jfg/test/blicke.js) nach den Vorlagen des Nutzers: Foto = Huette mit beiden Palmen, Feuer und
// Funkgeraet, viel Sternenhimmel, unten etwas Strand, der Fuchs rechts neben der rechten Palme; Skizze = vom Strand ueber
// den Steg aufs Meer, das Boot rechts daneben, oben viel offener Himmel (dort springt spaeter ein Wal ueber das Boot).
// Der Kreis liegt dort, wo die Kamera steht (Joshi steht da und macht das Bild).
const STELLEN = [
  { id: 'huette_foto', art: 'foto', name: 'Deine Hütte', kreis: { x: -2.5, z: 96.5, r: 1.1 },
    blick: { x: -2.5, y: 2.6, z: 96.5, yaw: -0.2, pitch: 0.24, fov: 62 }, fuchs: { x: 4.6, z: 81.6 }, ohneJoshi: true,
    text: ['Klick! Ein schönes Foto von deiner Hütte. Es klebt jetzt in deinem Notizbuch.'] },
  { id: 'steg_skizze', art: 'skizze', name: 'Der Steg', kreis: { x: -8.0, z: 88.0, r: 1.1 },
    blick: { x: -8.0, y: 2.6, z: 88.0, yaw: Math.PI + 0.38, pitch: 0.22, fov: 56 }, fuchs: null, ohneJoshi: true,
    // Live-Wunsch: ein Orca springt ueber das Boot – mitten im Bogen, etwas hinter dem Boot (vom Strand aus gesehen),
    // quer zum Blick, Nase leicht nach unten (er kommt gerade wieder herunter)
    wal: { dx: 1.0, dz: 1.5, hoch: 10.5, kurs: Math.PI / 2 + 0.3, nick: -0.3 },
    text: ['Du zeichnest den Steg, dein Segelboot und einen Wal, der darüber springt, in dein Notizbuch.'] },
];
// Farbe des Kreises je nach Gegenstand (Live-Wunsch 16.10.): Kamera blau, Stift rot, Taschenmesser gruen, Lupe braun
const KREIS_FARBE = { foto: 'rgba(70,150,255,A)', skizze: 'rgba(235,60,60,A)', messer: 'rgba(60,190,90,A)', lupe: 'rgba(150,100,55,A)' };
const zustand = story.notiz = { frei: false, gemacht: {}, seiten: [], aktiv: null };
story.notizSeiten = () => zustand.seiten;
story.notizFreischalten = () => { zustand.frei = true; if(typeof preloadOrca === 'function') preloadOrca(); };   // Wal fuer die Skizze

// ---- Kreise am Boden und das Y ------------------------------------------------------------------------------------
const marken = [];
function kreisTextur(farbe){
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 60, 128, 128, 126);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, farbe.replace('A', '0.25')); gr.addColorStop(0.8, farbe.replace('A', '0.85')); gr.addColorStop(1, farbe.replace('A', '0'));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.lineWidth = 8; g.strokeStyle = farbe.replace('A', '0.95'); g.beginPath(); g.arc(128, 128, 98, 0, 7); g.stroke();
  return new THREE.CanvasTexture(c);
}
function markenBauen(){
  if(marken.length) return;
  for(const s of STELLEN){
    const farbe = KREIS_FARBE[s.art] || KREIS_FARBE.foto;
    const m = new THREE.Mesh(new THREE.CircleGeometry(s.kreis.r, 40), new THREE.MeshBasicMaterial({ map: kreisTextur(farbe), transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; m.userData.deko = true; m.visible = false;
    story.welt(1).add(m);
    const y = gelbY(); y.visible = false; story.welt(1).add(y);
    marken.push({ s, m, y, t: Math.random() * 6 });
  }
}
let yTex = null;
function gelbY(){
  if(!yTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#f5c518'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Y', 64, 66);
    yTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: yTex, depthTest: false, transparent: true })); sp.scale.setScalar(0.6); sp.renderOrder = 999; sp.userData.deko = true; return sp;
}
function aufKreis(s){
  if(!eva || story.etappe !== 1 || (story.innen && story.innen.drin) || (story.imBoot && story.imBoot()) || (story.schwimm && story.schwimm.aktiv)) return false;
  const p = eva.group.position; return Math.hypot(p.x - s.kreis.x, p.z - s.kreis.z) < s.kreis.r;
}
function updateMarken(dt){
  markenBauen();
  for(const k of marken){
    const offen = zustand.frei && !zustand.gemacht[k.s.id] && story.etappe === 1;
    k.m.visible = offen;
    if(!offen){ k.y.visible = false; continue; }
    k.t += dt;
    const yb = evaFootY(k.s.kreis.x, k.s.kreis.z);
    k.m.position.set(k.s.kreis.x, yb + 0.03, k.s.kreis.z);
    k.m.material.opacity = 0.75 + Math.sin(k.t * 2.6) * 0.2;        // leicht pulsieren, damit man ihn sieht
    k.y.visible = aufKreis(k.s) && !zustand.aktiv;
    if(k.y.visible) k.y.position.set(k.s.kreis.x, yb + 2.0 + Math.sin(k.t * 3) * 0.07, k.s.kreis.z);
  }
}
// Y (story.js buttonY fragt hier zuerst): steht Joshi auf einem offenen Kreis -> los
story.fotoY = function(){
  if(zustand.aktiv || !zustand.frei) return false;
  const k = marken.find(q => !zustand.gemacht[q.s.id] && aufKreis(q.s));
  if(!k) return false;
  starte(k.s);
  return true;
};

// ---- Das Bild aufnehmen (Foto: echte Szene aus dem vorgegebenen Blick; Skizze: daraus eine Bleistiftzeichnung) ----
const BILD_W = 1200, BILD_H = 800;
function aufnehmen(s){
  // Skizze: Fernebene bei 1,5 km – Sterne, Sternbilder, Milchstrasse und Mond fallen weg (Linien und Punkte waeren auf dem
  // Papier stoerend geworden), Meer, Steg und Boot bleiben
  const kam = new THREE.PerspectiveCamera(s.blick.fov, BILD_W / BILD_H, 0.5, s.art === 'skizze' ? 1500 : 1600000);
  kam.position.set(s.blick.x, s.blick.y, s.blick.z); kam.rotation.set(s.blick.pitch, s.blick.yaw, 0, 'YXZ'); kam.updateMatrixWorld(true);
  // Joshi raus, Fuchs auf seinen Platz (danach alles zurueck)
  const f = story.fuchs, fp = f.obj ? f.obj.position.clone() : null, fyaw = f.yaw, frot = f.obj ? f.obj.rotation.y : 0;
  const joshiSichtbar = eva ? eva.group.visible : false, schatten = typeof ovalShadow !== 'undefined' ? ovalShadow.visible : false;
  if(s.ohneJoshi && eva){ eva.group.visible = false; if(typeof ovalShadow !== 'undefined') ovalShadow.visible = false; }
  if(s.fuchs && f.obj){ f.obj.position.set(s.fuchs.x, evaFootY(s.fuchs.x, s.fuchs.z), s.fuchs.z);
    const w = Math.atan2(s.blick.x - s.fuchs.x, s.blick.z - s.fuchs.z); f.obj.rotation.y = w; }
  else if(f.obj && s.art === 'skizze'){ f.obj.visible = false; }
  // Wal fuer die Skizze: ein Klon der Orca-Vorlage der Engine, kurz ueber das Boot gestellt (danach wieder weg)
  let wal = null;
  if(s.wal && typeof orcaTpl !== 'undefined' && orcaTpl && typeof cloneSkinned === 'function'){
    const b = story.stegZustand || { bx: story.boot.x, bz: story.boot.z };
    wal = cloneSkinned(orcaTpl);
    wal.position.set(b.bx + s.wal.dx, s.wal.hoch, b.bz + s.wal.dz);
    wal.rotation.set(s.wal.nick, s.wal.kurs, 0, 'YXZ');
    scene.add(wal); wal.updateMatrixWorld(true);                    // global-ok: nur fuer die Aufnahme, gleich wieder entfernt
  }
  const rt = new THREE.WebGLRenderTarget(BILD_W, BILD_H);
  const alt = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, kam); renderer.setRenderTarget(alt);
  const px = new Uint8Array(BILD_W * BILD_H * 4); renderer.readRenderTargetPixels(rt, 0, 0, BILD_W, BILD_H, px); rt.dispose();
  if(eva){ eva.group.visible = joshiSichtbar; if(typeof ovalShadow !== 'undefined') ovalShadow.visible = schatten; }
  if(f.obj){ if(fp) f.obj.position.copy(fp); f.yaw = fyaw; f.obj.rotation.y = frot; f.obj.visible = true; }
  if(wal) scene.remove(wal);
  const c = document.createElement('canvas'); c.width = BILD_W; c.height = BILD_H; const g = c.getContext('2d'), id = g.createImageData(BILD_W, BILD_H);
  for(let y = 0; y < BILD_H; y++) id.data.set(px.subarray((BILD_H - 1 - y) * BILD_W * 4, (BILD_H - y) * BILD_W * 4), y * BILD_W * 4);
  for(let i = 3; i < id.data.length; i += 4) id.data[i] = 255;
  g.putImageData(id, 0, 0);
  return s.art === 'skizze' ? bleistift(c) : polaroid(c);
}
// Foto: leicht warm, etwas Vignette (wie ein Sofortbild)
function polaroid(c){
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,200,140,0.07)'; g.fillRect(0, 0, c.width, c.height);
  const v = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.height * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = v; g.fillRect(0, 0, c.width, c.height);
  return c;
}
// Skizze: Kanten des Bilds als Bleistiftstriche auf Papier, ohne Farbe (Helligkeits-Kanten + feine Schraffur im Dunklen).
// Fuer die Skizze wird ohne Sterne, Sternbilder und Mond aufgenommen (sie waeren dunkle Punkte und Linien geworden) –
// stattdessen ein paar leichte Kreuzchen am Himmel.
function bleistift(c){
  const W = c.width, H = c.height, g = c.getContext('2d'), src = g.getImageData(0, 0, W, H).data;
  const L = new Float32Array(W * H);
  for(let i = 0; i < W * H; i++) L[i] = (src[i * 4] * 0.3 + src[i * 4 + 1] * 0.59 + src[i * 4 + 2] * 0.11) / 255;
  const out = document.createElement('canvas'); out.width = W; out.height = H; const o = out.getContext('2d');
  o.fillStyle = '#f4ecd8'; o.fillRect(0, 0, W, H);                // Papier
  const id = o.getImageData(0, 0, W, H), d = id.data;
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let y = 1; y < H - 1; y++) for(let x = 1; x < W - 1; x++){
    const i = y * W + x;
    // Sobel-Kante
    const gx = -L[i - W - 1] - 2 * L[i - 1] - L[i + W - 1] + L[i - W + 1] + 2 * L[i + 1] + L[i + W + 1];
    const gy = -L[i - W - 1] - 2 * L[i - W] - L[i - W + 1] + L[i + W - 1] + 2 * L[i + W] + L[i + W + 1];
    let ton = Math.min(1, Math.hypot(gx, gy) * 2.2);
    if(ton < 0.12) ton = 0;                                         // feines Rauschen (Wellen, Gras) nicht als Strich
    // Schraffur nur auf den dunkelsten Flaechen (Bootsrumpf, Pfaehle), fein und leicht – das Meer bleibt fast frei
    const dunkel = 1 - L[i];
    if(dunkel > 0.82 && ((x + y) % 9 === 0)) ton = Math.max(ton, (dunkel - 0.82) * 1.4);
    ton = ton * (0.78 + rnd() * 0.22);
    const k = i * 4;
    d[k] = 244 - ton * 190; d[k + 1] = 236 - ton * 190; d[k + 2] = 216 - ton * 180;
  }
  o.putImageData(id, 0, 0);
  // ein paar Sterne als Kreuzchen am Himmel (sonst ist der Himmel leer)
  o.strokeStyle = 'rgba(60,55,50,.55)'; o.lineWidth = 1.5;
  for(let n = 0; n < 26; n++){ const x = rnd() * W, y = rnd() * H * 0.35; o.beginPath(); o.moveTo(x - 4, y); o.lineTo(x + 4, y); o.moveTo(x, y - 4); o.lineTo(x, y + 4); o.stroke(); }
  signatur(o, W, H, rnd);
  return out;
}
// Signatur (Live-Wunsch): ein handschriftliches J unten rechts – Querstrich oben, Bogen nach unten mit Haken nach links,
// als Bleistift: drei duenne, leicht versetzte Striche uebereinander (wird beim Kritzeln zuletzt "geschrieben")
function signatur(o, W, H, rnd){
  const x = W - 120, y = H - 150, s = 1.1;
  o.lineCap = 'round'; o.lineJoin = 'round';
  for(let n = 0; n < 3; n++){
    const j = () => (rnd() - 0.5) * 2.2;
    o.strokeStyle = 'rgba(55,50,45,' + (0.55 - n * 0.12) + ')'; o.lineWidth = 3.4 - n * 0.8;
    o.beginPath();                                                  // Querstrich oben, leicht schraeg
    o.moveTo(x - 26 * s + j(), y + 4 + j()); o.quadraticCurveTo(x + 2 * s, y - 4 + j(), x + 30 * s + j(), y - 2 + j()); o.stroke();
    o.beginPath();                                                  // Bogen nach unten, Haken nach links, kleiner Schwung
    o.moveTo(x + 8 * s + j(), y - 2 + j());
    o.bezierCurveTo(x + 10 * s + j(), y + 40 * s + j(), x + 12 * s + j(), y + 66 * s + j(), x - 6 * s + j(), y + 74 * s + j());
    o.bezierCurveTo(x - 22 * s + j(), y + 80 * s + j(), x - 34 * s + j(), y + 62 * s + j(), x - 26 * s + j(), y + 50 * s + j());
    o.stroke();
  }
}

// ---- Ablauf: Gegenstand raus, Bild zeigen, Klick/Kritzeln, Bild in den Rucksack, ins Notizbuch ----------------------
const ab = { mesh: null, cv: null, tex: null, phase: null, t: 0, bild: null, s: null, blitz: null };
function starte(s){
  zustand.aktiv = s;
  zustand.gemacht[s.id] = true;                                    // geht nur einmal
  ab.bild = aufnehmen(s); ab.s = s;
  story.ausRucksack(s.art === 'foto' ? 'kamera' : 'stift', () => { ab.phase = 'zeigen'; ab.t = 0; });
}
function anzeigeBauen(szene){
  if(ab.mesh) return;
  ab.cv = document.createElement('canvas'); ab.cv.width = BILD_W; ab.cv.height = BILD_H;
  ab.tex = new THREE.CanvasTexture(ab.cv);
  ab.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: ab.tex, transparent: true, depthWrite: false, depthTest: false }));
  ab.mesh.renderOrder = 4; ab.mesh.visible = false; szene.add(ab.mesh);
  ab.blitz = document.createElement('div');
  ab.blitz.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:45;transition:opacity .35s';
  document.body.appendChild(ab.blitz);
}
// Sucher: das Foto mit dunklem Rand, Fadenkreuz-Ecken und rotem Aufnahme-Punkt
function sucherMalen(){
  const g = ab.cv.getContext('2d'), W = BILD_W, H = BILD_H;
  g.clearRect(0, 0, W, H); g.drawImage(ab.bild, 0, 0, W, H);
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, W, 36); g.fillRect(0, H - 36, W, 36); g.fillRect(0, 0, 36, H); g.fillRect(W - 36, 0, 36, H);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 6;
  for(const [x, y, dx, dy] of [[70, 70, 1, 1], [W - 70, 70, -1, 1], [70, H - 70, 1, -1], [W - 70, H - 70, -1, -1]]){ g.beginPath(); g.moveTo(x, y + dy * 60); g.lineTo(x, y); g.lineTo(x + dx * 60, y); g.stroke(); }
  g.beginPath(); g.arc(W / 2, H / 2, 26, 0, 7); g.stroke();
  g.fillStyle = '#ff3b30'; g.beginPath(); g.arc(W - 90, 90, 14, 0, 7); g.fill();
  ab.tex.needsUpdate = true;
}
// Kritzeln: die Skizze von links oben nach rechts unten "aufdecken", mit Bleistiftspitze
function kritzelMalen(k){
  const g = ab.cv.getContext('2d'), W = BILD_W, H = BILD_H;
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H);
  // in Zeilenbaendern aufdecken, wie hin und her gekritzelt
  const baender = 10, ganz = Math.floor(k * baender), rest = k * baender - ganz, bh = H / baender;
  for(let b = 0; b < Math.min(baender, ganz + 1); b++){
    const w = b < ganz ? W : W * rest, x0 = b % 2 ? W - w : 0;
    g.drawImage(ab.bild, x0, b * bh, w, bh + 1, x0, b * bh, w, bh + 1);
  }
  ab.spitze = { x: (ganz % 2 ? W - W * rest : W * rest) / W, y: (ganz + 0.5) / baender };
  ab.tex.needsUpdate = true;
}
const T_ZEIGEN = 0.5, T_FOTO = 1.4, T_KRITZEL = 3.2, T_HALTEN = 1.0, T_WEG = 0.8;
story.bildEbeneAktiv = () => !!(ab.phase || zustand.aktiv);
story.bildEbene = function(dt, szene, pause){
  if(!pause) updateMarken(dt);
  if(!ab.phase) return;
  anzeigeBauen(szene);
  if(pause) return;
  ab.t += dt;
  const H = 2 * 5 * Math.tan(15 * Math.PI / 180), B = H * innerWidth / innerHeight;   // Bildebene (ausruestung.js EBENE)
  const w = B * 2 / 3, h = Math.min(H * 2 / 3, w * BILD_H / BILD_W);                   // so gross wie der Inventarrahmen
  const fw = h * BILD_W / BILD_H;
  ab.mesh.visible = true;
  if(ab.phase === 'zeigen'){                                       // erscheint (wie durch den Sucher bzw. leere Seite)
    const k = weich(ab.t / T_ZEIGEN);
    ab.mesh.position.set(0, 0, 1.2); ab.mesh.scale.set(fw * (0.8 + 0.2 * k), h * (0.8 + 0.2 * k), 1); ab.mesh.material.opacity = k;
    if(ab.s.art === 'foto') sucherMalen(); else kritzelMalen(0);
    if(ab.t >= T_ZEIGEN){ ab.phase = ab.s.art === 'foto' ? 'foto' : 'kritzel'; ab.t = 0; }
  } else if(ab.phase === 'foto'){                                  // kurz halten, dann Klick und Blitz
    if(ab.t > 0.6 && !ab.klick){ ab.klick = true; klick(); ab.blitz.style.transition = 'none'; ab.blitz.style.opacity = '0.9';
      requestAnimationFrame(() => { ab.blitz.style.transition = 'opacity .45s'; ab.blitz.style.opacity = '0'; });
      // nach dem Klick: das fertige Foto ohne Sucher
      const g = ab.cv.getContext('2d'); g.drawImage(ab.bild, 0, 0, BILD_W, BILD_H); ab.tex.needsUpdate = true; }
    if(ab.t >= T_FOTO){ ab.phase = 'halten'; ab.t = 0; story.rucksackZurueck(); }
  } else if(ab.phase === 'kritzel'){
    kritzelMalen(weich(ab.t / T_KRITZEL));
    if(ab.spitze && story.stiftAn) story.stiftAn(ab.spitze.x, ab.spitze.y, fw, h);   // der Stift zeichnet sichtbar mit
    if(ab.t >= T_KRITZEL){ kritzelMalen(1); ab.phase = 'halten'; ab.t = 0; story.rucksackZurueck(); }
  } else if(ab.phase === 'halten'){
    if(ab.t >= T_HALTEN){ ab.phase = 'weg'; ab.t = 0; }
  } else if(ab.phase === 'weg'){                                   // klein in den Rucksack (unten rechts)
    const k = weich(ab.t / T_WEG), zx = B / 2 * 0.8, zy = -H / 2 * 0.66;
    ab.mesh.position.set(zx * k, zy * k + Math.sin(k * Math.PI) * 0.3, 1.2);
    ab.mesh.scale.set(fw * (1 - k * 0.95), h * (1 - k * 0.95), 1); ab.mesh.material.opacity = 1 - k * 0.3;
    if(ab.t >= T_WEG){
      ab.mesh.visible = false; ab.phase = null; ab.klick = false;
      zustand.seiten.push({ art: ab.s.art, bild: ab.bild, name: ab.s.name, dreh: (zustand.seiten.length % 2 ? 0.03 : -0.025) });
      const s = ab.s; story.sprich(s.text, () => { zustand.aktiv = null; });
    }
  }
};
// Klick-Geraeusch der Kamera (selbst erzeugt: kurzes Knacken + Verschluss)
function klick(){
  if(typeof audioCtx === 'undefined' || !audioCtx || audioCtx.state !== 'running') return;
  const t = audioCtx.currentTime, sr = audioCtx.sampleRate, n = Math.floor(sr * 0.12), buf = audioCtx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  for(let i = 0; i < n; i++){ const k = i / n; d[i] = (Math.random() * 2 - 1) * Math.exp(-k * 18) * (i < sr * 0.004 ? 1 : 0.5) + (k > 0.5 && k < 0.56 ? (Math.random() * 2 - 1) * 0.6 : 0); }
  const q = audioCtx.createBufferSource(); q.buffer = buf; const g = audioCtx.createGain(); g.gain.value = 0.5;
  q.connect(g).connect(audioCtx.destination); q.start(t);
}
// Freischalten: mit dem Funkspruch des ersten Falls (Kamera und Stift sind dann im Rucksack)
const angenommenVorher = story.fall1Angenommen;
story.fall1Angenommen = function(){ story.notizFreischalten(); if(angenommenVorher) return angenommenVorher.apply(this, arguments); };
})();
