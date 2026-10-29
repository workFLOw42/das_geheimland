// Das Geheimland – das Mikroskop des Eichhoernchens (Etappe 5, Live-Wunsch 26.10.2026): Y am Mikroskop in der Mondbasis ->
// ein rundes Okular wie beim Teleskop. Darin Experimente, die man im Weltall macht – kindlich erklaert, mit dem, was sie fuer das
// Leben auf der Erde bedeuten, und nicht zu lang (je zwei Saetze). Links/rechts blaettert, die Erzaehlerin liest vor, B = hinaus.
// Die Bilder sind gemalt (Canvas); seit dem 28.10.2026 laufen Pflanzen, Wasserkugel, Kristalle sowie Feder und Hammer als kleine
// 3D-Experimente mit echten Modellen (unten "3D im Okular"), das gemalte Bild bleibt als Ersatz. Laedt nach mondbasis_innen.js.
(function(){
'use strict';
const story = window.STORY;
const EXP = [
  { name: 'Pflanzen im Weltall', text: ['Im Weltall wachsen Salat und Blumen – ihre Wurzeln wissen dort gar nicht, wo unten ist.', 'So lernen wir, wie man Gemüse auch dort anbaut, wo es wenig Platz und Wasser gibt.'], mal: salat, drei: szPflanze },
  { name: 'Die Wasserkugel', text: ['Ohne Schwerkraft wird Wasser zu einer schwebenden Kugel.', 'Daran sieht man, wie Flüssigkeiten sich bewegen – das hilft zum Beispiel bei besseren Wasserfiltern.'], mal: wasser, drei: szWasser },
  { name: 'Kristalle', text: ['Im Weltall wachsen Kristalle besonders groß und schön.', 'Mit ihnen entwickeln Forscher neue Medikamente für kranke Menschen.'], mal: kristalle, drei: szKristalle },
  { name: 'Mondstaub', text: ['Unter dem Mikroskop sieht Mondstaub aus wie winzige, spitze Glassplitter.', 'Er verrät uns, wie der Mond entstanden ist – und vielleicht auch etwas über unsere Erde.'], mal: staub },
  { name: 'Feder und Hammer', text: ['Auf dem Mond gibt es keine Luft. Lässt man eine Feder und einen Hammer los, fallen beide gleich schnell.', 'So verstehen wir die Schwerkraft – auf dem Mond und auf der Erde.'], mal: feder, drei: szFeder },
  { name: 'Starke Knochen', text: ['Wer lange schwebt, dessen Muskeln und Knochen werden schwächer. Darum turnen Astronauten jeden Tag.', 'Das hilft Ärzten, auch älteren Menschen auf der Erde zu helfen.'], mal: knochen, drei: szKnochen },
  { name: 'Die Erde von oben', text: ['Von hier oben sieht man Wolken, Stürme und Wälder auf der Erde.', 'Damit kann man das Wetter vorhersagen und die Natur schützen.'], mal: erde },
];
const mk = story.mikroskop = { an: false, wahl: 0, el: null, cv: null, titel: null, eingabe: null, sperre: 0, tVor: 0 };

// ---- Bilder (512 x 512, das Okular schneidet rund aus) ------------------------------------------------------------------
function grund(g, a, b){ const gr = g.createRadialGradient(256, 230, 40, 256, 256, 300); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }
function salat(g){
  grund(g, '#dff3ff', '#9cc7e6');
  g.fillStyle = '#8b5a3c'; g.beginPath(); g.moveTo(176, 300); g.lineTo(336, 300); g.lineTo(316, 400); g.lineTo(196, 400); g.fill();
  g.strokeStyle = '#d9c39a'; g.lineWidth = 4; for(const [x, y, c] of [[220, 360, -60], [256, 380, 0], [290, 360, 70], [240, 395, -30], [275, 395, 40]]){ g.beginPath(); g.moveTo(256, 300); g.quadraticCurveTo(x + c, y, x + c * 1.4, y + 40); g.stroke(); }
  g.fillStyle = '#4caf50'; for(const [x, y, r, a] of [[220, 250, 52, -0.5], [292, 248, 52, 0.5], [256, 205, 58, 0], [190, 210, 36, -1], [322, 208, 36, 1]]){ g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, 0, r * 0.55, r, 0, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = '#7ed957'; g.beginPath(); g.ellipse(256, 210, 26, 44, 0, 0, 7); g.fill();
}
function wasser(g){
  grund(g, '#1b2a4a', '#0a1020');
  const gr = g.createRadialGradient(226, 220, 10, 256, 256, 120); gr.addColorStop(0, '#e6f7ff'); gr.addColorStop(0.4, '#5fc2ff'); gr.addColorStop(1, '#1565c0');
  g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 120, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(214, 206, 30, 16, -0.6, 0, 7); g.fill();
  g.fillStyle = '#5fc2ff'; for(const [x, y, r] of [[120, 140, 14], [390, 160, 10], [380, 380, 16], [140, 370, 9]]){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
}
function kristalle(g){
  grund(g, '#2a1f45', '#120c22');
  const k = (x, y, h, w, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y - h * 0.7); g.lineTo(x + w, y); g.lineTo(x, y + h * 0.15); g.lineTo(x - w, y); g.lineTo(x - w, y - h * 0.7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w, y - h * 0.7); g.lineTo(x, y - h * 0.45); g.fill(); };
  k(256, 380, 230, 46, '#b388ff'); k(186, 390, 160, 36, '#7c4dff'); k(330, 392, 180, 38, '#e040fb'); k(140, 400, 100, 26, '#9575cd'); k(378, 400, 110, 26, '#ce93d8');
}
function staub(g){
  grund(g, '#cfcfcf', '#8a8a8a');
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 26; i++){ const x = 80 + rnd() * 352, y = 80 + rnd() * 352, r = 14 + rnd() * 34, n = 3 + Math.floor(rnd() * 3), a0 = rnd() * 6;
    g.fillStyle = ['#5d5d63', '#77777e', '#4a4a50', '#9aa0a8'][i % 4]; g.beginPath();
    for(let j = 0; j < n; j++){ const a = a0 + j / n * 6.283, rr = r * (0.5 + rnd()); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill();
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.stroke(); }
}
function feder(g){
  grund(g, '#3b3f48', '#1b1d22');
  g.fillStyle = '#8e939a'; g.fillRect(0, 410, 512, 102);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.setLineDash([8, 10]); g.lineWidth = 3; for(const x of [176, 336]){ g.beginPath(); g.moveTo(x, 120); g.lineTo(x, 390); g.stroke(); } g.setLineDash([]);
  g.fillStyle = '#6d4c41'; g.fillRect(170, 290, 12, 90); g.fillStyle = '#9e9e9e'; g.fillRect(146, 268, 60, 28);
  g.fillStyle = '#fafafa'; g.beginPath(); g.ellipse(336, 320, 16, 52, 0.25, 0, 7); g.fill(); g.strokeStyle = '#bdbdbd'; g.lineWidth = 3; g.beginPath(); g.moveTo(326, 372); g.lineTo(346, 270); g.stroke();
}
function knochen(g){
  grund(g, '#fff3e0', '#ffcc80');
  g.fillStyle = '#fffaf2'; g.strokeStyle = '#c8a27a'; g.lineWidth = 5;
  g.save(); g.translate(256, 256); g.rotate(-0.6);
  g.beginPath(); g.rect(-120, -24, 240, 48); for(const x of [-130, 130]) for(const y of [-30, 30]){ g.moveTo(x + 30, y); g.arc(x, y, 30, 0, 7); } g.fill(); g.stroke(); g.restore();
  g.fillStyle = '#e65100'; g.font = 'bold 64px system-ui'; g.textAlign = 'center'; g.fillText('💪', 380, 140);
}
function erde(g){
  g.fillStyle = '#04060c'; g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#ffffff'; for(let i = 0; i < 60; i++) g.fillRect((i * 97) % 512, (i * 53) % 512, 2, 2);
  const gr = g.createRadialGradient(220, 210, 20, 256, 256, 170); gr.addColorStop(0, '#6ec6ff'); gr.addColorStop(1, '#0d47a1');
  g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 170, 0, 7); g.fill();
  g.fillStyle = '#43a047'; for(const [x, y, rx, ry, a] of [[200, 230, 50, 70, 0.4], [320, 200, 40, 30, -0.3], [300, 320, 46, 36, 0.6]]){ g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 9; g.lineCap = 'round'; for(const [x, y, r, a, b] of [[250, 250, 110, 0.2, 1.4], [250, 250, 70, 3.4, 4.6], [240, 260, 140, 4.9, 5.6]]){ g.beginPath(); g.arc(x, y, r, a, b); g.stroke(); }
}

// ---- 3D im Okular (Live-Wunsch 28.10.2026: die Experimente mit echten Modellen) -------------------------------------------
// Ein eigener kleiner Renderer auf einer zweiten Leinwand im Okular (wird beim ersten Blick einmal angelegt, das Spielbild
// bleibt unberuehrt). Die Modelle (alle CC-BY-4.0, Namen in tools/build_engine.ps1) laedt erst der erste Blick ins Mikroskop;
// bis sie da sind und ohne WebGL bleibt das gemalte Bild. Jedes Experiment beginnt beim Umblaettern von vorn (D3.t = 0).
const D3 = { r: undefined, cv: null, szenen: {}, vorlagen: {}, warte: {}, t: 0, an: null };
function vorlage(glb, fertig){
  if(D3.vorlagen[glb]){ fertig(D3.vorlagen[glb]); return; }
  if(D3.warte[glb]){ D3.warte[glb].push(fertig); return; }
  if(!window[glb] || !story.ladeGlb) return;
  D3.warte[glb] = [fertig];
  story.ladeGlb(window[glb], glb, (gl) => {
    const o = gl.scene; o.traverse(m => { if(m.isMesh) m.frustumCulled = false; });
    D3.vorlagen[glb] = o; const w = D3.warte[glb]; D3.warte[glb] = null; for(const f of w) f(o);
  });
}
// Kopie der Vorlage, gedreht (dreh), auf eine Groesse gebracht (hoehe | breite | max) und hingestellt: Boden auf y = 0
// (mitte: true = Mitte auf 0), x/z mittig. Gemessen wird nach dem Drehen.
function passend(vor, w){
  const o = vor.clone(true); if(w.dreh) o.rotation.set(w.dreh[0], w.dreh[1], w.dreh[2]); o.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
  const k = (w.hoehe ? w.hoehe / sz.y : w.breite ? w.breite / sz.x : w.max / Math.max(sz.x, sz.y, sz.z)) || 1;
  o.scale.multiplyScalar(k); o.position.set(-c.x * k, -(w.mitte ? c.y : bb.min.y) * k, -c.z * k);
  const h = new THREE.Group(); h.add(o); return h;
}
const glanz = (farbe, o) => new THREE.MeshPhongMaterial(Object.assign({ color: farbe, specular: 0xffffff, shininess: 90 }, o));
function umfaerben(obj, mat){ obj.traverse(m => { if(m.isMesh) m.material = mat; }); }
function leinwandTex(w, h, mal){ const c = document.createElement('canvas'); c.width = w; c.height = h; mal(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function neueSzene(innen, aussen){
  const s = new THREE.Scene();
  s.background = leinwandTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 115, 20, 128, 128, 150); gr.addColorStop(0, innen); gr.addColorStop(1, aussen); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  s.add(new THREE.HemisphereLight(0xffffff, 0x445066, 0.75));
  const l = new THREE.DirectionalLight(0xffffff, 0.9); l.position.set(-2, 4, 3); s.add(l);
  return s;
}
function kamera(x, y, z, zx, zy, zz){ const k = new THREE.PerspectiveCamera(34, 1, 0.05, 100); k.position.set(x, y, z); k.lookAt(zx, zy, zz); return k; }
const sanft = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const raus = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - (1 - x) * (1 - x) * (1 - x); };
function rndAus(sd){ return () => (sd = (sd * 16807) % 2147483647) / 2147483647; }
// kleine schwebende Wassertropfen (Pflanzen, Wasserkugel)
function tropfenWolke(g, n, r0, r1, sd){
  const rnd = rndAus(sd), mat = glanz(0x5fc2ff, { emissive: 0x0b2c55, transparent: true, opacity: 0.85 }), L = [];
  for(let i = 0; i < n; i++){ const m = new THREE.Mesh(new THREE.SphereGeometry(0.035 + rnd() * 0.045, 16, 12), mat);
    L.push({ m, a: rnd() * 6.283, r: r0 + rnd() * (r1 - r0), y: (rnd() - 0.5) * 1.1, v: 0.15 + rnd() * 0.2, p: rnd() * 6 }); g.add(m); }
  return (t) => { for(const d of L){ const a = d.a + t * d.v; d.m.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 0.9 + d.p) * 0.08, Math.sin(a) * d.r); } };
}

// Pflanzen im Weltall: ein durchsichtiger Kasten mit Naehr-Gel, darin wachsen die Wurzeln in alle Richtungen (auch nach oben),
// oben waechst der Farn ("All Plants" von Svea_99, "Pflanze 1") aus klein heraus; ringsum schweben Wassertropfen
function szPflanze(){
  const s = neueSzene('#e3f4ff', '#7fb0d8'), k = kamera(0, 1.15, 3.9, 0, 0.62, 0);
  const g = new THREE.Group(); s.add(g);
  const KA = 0.8;                                                 // Kantenlaenge des Kastens (von y = 0 bis KA)
  const gel = new THREE.Mesh(new THREE.BoxGeometry(KA, KA, KA), glanz(0xbfe8ff, { transparent: true, opacity: 0.32, depthWrite: false, shininess: 120 }));
  gel.position.y = KA / 2; gel.renderOrder = 2; g.add(gel);
  const kanten = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(KA, KA, KA)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
  kanten.position.y = KA / 2; g.add(kanten);
  const deckel = new THREE.Mesh(new THREE.BoxGeometry(KA + 0.04, 0.05, KA + 0.04), new THREE.MeshLambertMaterial({ color: 0x8b5a3c })); deckel.position.y = KA; g.add(deckel);
  // Wurzeln: krumme Schlaeuche vom Stiel unter dem Deckel aus, in alle Richtungen, im Kasten gehalten; wachsen per DrawRange
  const rnd = rndAus(11), wurzelMat = new THREE.MeshLambertMaterial({ color: 0xf1dfb0, emissive: 0x3a2f18 }), wurzeln = [], SEG = 40, RS = 5;
  for(let i = 0; i < 11; i++){
    const a = i / 11 * 6.283 + rnd() * 0.5, d = new THREE.Vector3(Math.cos(a), (rnd() - 0.55) * 1.8, Math.sin(a)).normalize();
    const pts = [new THREE.Vector3(0, KA - 0.05, 0)]; let p = pts[0].clone();
    for(let j = 0; j < 6; j++){
      d.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.9)).normalize();
      p = p.clone().addScaledVector(d, 0.09 + rnd() * 0.05);
      const m = KA / 2 - 0.05; p.x = Math.max(-m, Math.min(m, p.x)); p.z = Math.max(-m, Math.min(m, p.z)); p.y = Math.max(0.05, Math.min(KA - 0.04, p.y));
      pts.push(p);
    }
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), SEG, 0.011 - i * 0.0003, RS, false), m = new THREE.Mesh(geo, wurzelMat);
    m.userData.voll = geo.index.count; m.userData.start = 0.4 + rnd() * 1.6; geo.setDrawRange(0, 0); g.add(m); wurzeln.push(m);
  }
  const pflanze = new THREE.Group(); pflanze.position.y = KA + 0.02; g.add(pflanze);
  vorlage('PFLANZE_GLB', v => pflanze.add(passend(v, { breite: 1.2 })));
  const wolke = tropfenWolke(g, 7, 0.75, 1.15, 5);
  return { s, k, takt(t){
    g.rotation.y = 0.5 + t * 0.18;
    for(const m of wurzeln){ const f = raus((t - m.userData.start) / 5.5), n = Math.floor(f * SEG) * RS * 6; m.geometry.setDrawRange(0, Math.min(m.userData.voll, n)); }
    const w = 0.12 + 0.88 * raus(t / 7); pflanze.scale.setScalar(w); pflanze.rotation.z = Math.sin(t * 0.8) * 0.03;
    wolke(t);
  } };
}
// Starke Knochen: der Knochen ("Bone" von Zab, Live-Wunsch 29.10.2026) schwebt und dreht sich langsam
function szKnochen(){
  const s = neueSzene('#fff3e0', '#d9954f'), k = kamera(0, 0.1, 4.2, 0, 0, 0), g = new THREE.Group(); s.add(g);
  vorlage('KNOCHEN_GLB', v => { const o = passend(v, { max: 3.1, mitte: true }); umfaerben(o, glanz(0xeee2cc, { emissive: 0x2a2014, specular: 0x555555, shininess: 30 })); g.add(o); });
  return { s, k, takt(t){ g.rotation.set(0.5 + Math.sin(t * 0.5) * 0.2, t * 0.45, -0.5); g.position.y = Math.sin(t * 0.9) * 0.08; } };
}
// Die Wasserkugel: der Tropfen ("drop of water" von furret) schwebt, wabbelt und dreht sich; ringsum kleine Tropfen
function szWasser(){
  const s = neueSzene('#1d3058', '#070c18'), k = kamera(0, 0.15, 4.1, 0, 0, 0);
  const g = new THREE.Group(); s.add(g);
  const mat = glanz(0x3fa9ff, { emissive: 0x08264f, transparent: true, opacity: 0.86, shininess: 120 });
  vorlage('TROPFEN_GLB', v => { const o = passend(v, { max: 1.7, mitte: true }); umfaerben(o, mat); g.add(o); });
  const licht = new THREE.PointLight(0xbfe6ff, 0.8, 8); s.add(licht);
  const wolke = tropfenWolke(s, 9, 1.25, 1.6, 9);
  return { s, k, takt(t){
    g.rotation.set(Math.sin(t * 0.4) * 0.3, t * 0.35, Math.sin(t * 0.3) * 0.2);
    g.scale.set(1 + Math.sin(t * 2.1) * 0.07, 1 + Math.sin(t * 2.1 + 2.1) * 0.07, 1 + Math.sin(t * 2.1 + 4.2) * 0.07);
    g.position.y = Math.sin(t * 0.7) * 0.06;
    licht.position.set(Math.cos(t * 0.6) * 2.5, 1.5, Math.sin(t * 0.6) * 2.5 + 1);
    wolke(t);
  } };
}
// Kristalle: im Laborglas ("Lab Tube for P.A.L" von Charlotte Kimberly Andreassen) wachsen sie nacheinander aus dem Boden –
// in der Mitte der grosse ("CRISTAL OSCURO_" von iorko), ringsum bunte Gruppen ("Cristal" von lobach.dre); ein Licht kreist
function szKristalle(){
  const s = neueSzene('#33275a', '#100b20'), k = kamera(0, 1.35, 4.4, 0, 1.08, 0);
  const g = new THREE.Group(); s.add(g);
  const GLAS_H = 2.2, BODEN = 0.36;                              // Hoehe des Glases; innen der Boden (ueber dem Sockel)
  vorlage('LABORGLAS_GLB', v => { const o = passend(v, { hoehe: GLAS_H });
    o.traverse(m => { if(m.isMesh && m.material && m.material.transparent){ m.material.depthWrite = false; m.renderOrder = 3; } }); g.add(o); });
  const kr = [];
  const setze = (o, x, z, dreh, start, gross) => { const h = new THREE.Group(); h.position.set(x, BODEN, z); h.rotation.y = dreh; h.add(o); h.scale.setScalar(0.001); g.add(h); kr.push({ h, start, gross }); };
  vorlage('KRISTALL_DUNKEL_GLB', v => { const o = passend(v, { hoehe: 1.05 }); umfaerben(o, glanz(0xcdb8ff, { emissive: 0x2a1a55, transparent: true, opacity: 0.9, shininess: 140 })); setze(o, 0, 0, 0, 0.3, 1); });
  vorlage('KRISTALL_GLB', v => {
    const F = [0xe040fb, 0x7c4dff, 0x40c4ff, 0xff80ab];
    [[0.3, 0.12, 0.5], [-0.28, 0.16, 2.1], [0.05, -0.3, 3.7], [-0.12, 0.3, 1.2]].forEach(([x, z, d], i) => {
      const o = passend(v, { hoehe: 0.42 - i * 0.04 }); umfaerben(o, glanz(F[i], { emissive: new THREE.Color(F[i]).multiplyScalar(0.18), shininess: 140 })); setze(o, x, z, d, 1.4 + i * 0.9, 1); });
  });
  const licht = new THREE.PointLight(0xffffff, 1.1, 6); s.add(licht);
  return { s, k, takt(t){
    g.rotation.y = 0.3 + t * 0.15;
    for(const c of kr){ const f = raus((t - c.start) / 4); c.h.scale.setScalar(Math.max(0.001, f * c.gross)); }
    licht.position.set(Math.cos(t * 1.1) * 1.4, 1.1 + Math.sin(t * 0.7) * 0.3, Math.sin(t * 1.1) * 1.4);
  } };
}
// Feder und Hammer (wie bei Apollo 15): auf dem Mond, schwarzer Himmel mit Erde; beide schweben kurz, fallen gleichzeitig
// (ohne Luft gleich schnell), kommen zugleich auf – Staub stiebt –, liegen, dann hebt sie eine unsichtbare Hand wieder an
function szFeder(){
  const s = new THREE.Scene(); s.background = new THREE.Color(0x05060a);
  s.add(new THREE.HemisphereLight(0xffffff, 0x333333, 0.55)); const sonne = new THREE.DirectionalLight(0xffffff, 1.1); sonne.position.set(3, 4, 2); s.add(sonne);
  const k = kamera(0, 0.8, 3.5, 0, 0.58, 0);
  // Sterne und die Erde hinten am Himmel
  const rnd = rndAus(21), pos = []; for(let i = 0; i < 420; i++) pos.push((rnd() - 0.5) * 30, 1 + rnd() * 14, -12 - rnd() * 4);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  s.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false })));
  const erdTex = leinwandTex(128, 128, (g) => { const gr = g.createRadialGradient(52, 50, 6, 64, 64, 60); gr.addColorStop(0, '#7fc8ff'); gr.addColorStop(1, '#1747a0');
    g.fillStyle = gr; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.fillStyle = '#3f9d4a'; for(const [x, y, a, b] of [[48, 56, 16, 22], [82, 46, 12, 9], [76, 84, 14, 11]]){ g.beginPath(); g.ellipse(x, y, a, b, 0.4, 0, 7); g.fill(); } });
  const erdeSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: erdTex, transparent: true })); erdeSp.position.set(-1.7, 3.0, -11); erdeSp.scale.setScalar(1.3); s.add(erdeSp);
  // Mondboden: grau mit kleinen Kratern
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshLambertMaterial({ map: leinwandTex(512, 512, (g) => {
    g.fillStyle = '#8f9196'; g.fillRect(0, 0, 512, 512); const r = rndAus(4);
    for(let i = 0; i < 900; i++){ g.fillStyle = r() < 0.5 ? 'rgba(60,60,66,.25)' : 'rgba(230,230,235,.18)'; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
    for(let i = 0; i < 40; i++){ const x = r() * 512, y = r() * 512, q = 4 + r() * 18; g.strokeStyle = 'rgba(220,220,225,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, q, 3.5, 6.2); g.stroke();
      g.fillStyle = 'rgba(50,50,56,.35)'; g.beginPath(); g.arc(x, y + 1, q * 0.8, 0, 7); g.fill(); } }) }));
  boden.rotation.x = -Math.PI / 2; boden.position.z = -2; s.add(boden);
  const H = 0.95, X = 0.44;                                       // Fallhoehe, Abstand von der Mitte
  const hammer = new THREE.Group(), federG = new THREE.Group(); hammer.position.x = -X; federG.position.x = X; s.add(hammer, federG);
  vorlage('HAMMER_GLB', v => hammer.add(passend(v, { breite: 0.64, dreh: [0, 0, 0.12] })));
  vorlage('FEDER_GLB', v => federG.add(passend(v, { max: 0.62, dreh: [Math.PI / 2, 0, -Math.PI / 2] })));
  // Staub beim Aufprall
  const staubTex = leinwandTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(200,200,205,.9)'); gr.addColorStop(1, 'rgba(200,200,205,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const wolken = [-X, X].map(x => { const L = []; for(let i = 0; i < 7; i++){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: staubTex, transparent: true, depthWrite: false, opacity: 0 }));
    sp.userData.r = (i / 6 - 0.5) * 0.7; sp.position.set(x, 0.05, 0.05); s.add(sp); L.push(sp); } return L; });
  const T_HALT = 1.2, T_FALL = 1.7, T_LIEGT = 2.2, T_HOCH = 1.4, ZYK = T_HALT + T_FALL + T_LIEGT + T_HOCH, G = 2 * H / (T_FALL * T_FALL);
  return { s, k, takt(t){
    const z = t % ZYK; let y, aufprall = -1;
    if(z < T_HALT) y = H;
    else if(z < T_HALT + T_FALL){ const u = z - T_HALT; y = H - 0.5 * G * u * u; }
    else if(z < T_HALT + T_FALL + T_LIEGT){ y = 0; aufprall = z - T_HALT - T_FALL; }
    else y = H * sanft((z - T_HALT - T_FALL - T_LIEGT) / T_HOCH);
    hammer.position.y = federG.position.y = y;
    for(const L of wolken) for(const sp of L){ const a = aufprall < 0 ? 1 : Math.min(1, aufprall / 1.2);
      sp.material.opacity = aufprall < 0 ? 0 : 0.7 * (1 - a); sp.position.x = (L === wolken[0] ? -X : X) + sp.userData.r * (0.3 + a);
      sp.position.y = 0.04 + a * 0.12; sp.scale.setScalar(0.12 + a * 0.25); }
  } };
}
function dreiRenderer(){
  if(D3.r !== undefined) return D3.r;
  try {
    const r = new THREE.WebGLRenderer({ canvas: D3.cv, antialias: true });
    r.setPixelRatio(1); r.setSize(D3.cv.width, D3.cv.height, false); r.outputEncoding = THREE.sRGBEncoding;
    D3.r = r;
  } catch(e){ console.warn('Mikroskop 3D:', e); D3.r = null; }
  return D3.r;
}
// das gewaehlte Experiment in 3D zeigen (true) – sonst bleibt das gemalte Bild
function dreiZeigen(e){
  D3.an = null; D3.t = 0;
  if(!e.drei || !dreiRenderer()) return false;
  if(!D3.szenen[e.name]) D3.szenen[e.name] = e.drei();
  D3.an = D3.szenen[e.name]; return true;
}
function dreiTakt(dt){
  if(!D3.an || !D3.r) return;
  D3.t += dt; D3.an.takt(D3.t);
  D3.r.render(D3.an.s, D3.an.k);
}

// ---- Ansicht -------------------------------------------------------------------------------------------------------------
function bauen(){
  if(mk.el) return;
  const el = mk.el = document.createElement('div');
  el.style.cssText = 'position:absolute;inset:0;z-index:46;display:none;background:radial-gradient(circle at 50% 46%, #1a1a1a 0, #000 75%);'
    + 'flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui,sans-serif;user-select:none;';
  const ring = document.createElement('div');
  ring.style.cssText = 'width:72vmin;height:72vmin;border-radius:50%;overflow:hidden;box-shadow:0 0 0 1.4vmin #8a939e, 0 0 0 2.2vmin #3a3f46, inset 0 0 7vmin rgba(0,0,0,.75);position:relative;';
  const cv = mk.cv = document.createElement('canvas'); cv.width = cv.height = 512; cv.style.cssText = 'width:100%;height:100%;display:block;';
  ring.appendChild(cv);
  // die 3D-Leinwand liegt genau darueber (sichtbar nur bei einem 3D-Experiment)
  const cv3 = D3.cv = document.createElement('canvas'); cv3.width = cv3.height = 768; cv3.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;';
  ring.appendChild(cv3);
  const glas = document.createElement('div'); glas.style.cssText = 'position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 6vmin rgba(0,0,0,.7);pointer-events:none;'; ring.appendChild(glas);
  const titel = mk.titel = document.createElement('div'); titel.style.cssText = 'margin-top:3.5vmin;font-size:4.2vmin;font-weight:800;text-shadow:0 2px 6px rgba(0,0,0,.8);';
  // links/rechts: Pfeile wie im Notizbuch (ausruestung.js), B unten rechts wie ueberall (notizbuch.js bZeigen) – ohne Worte
  const pfeil = (r) => { const p = document.createElement('div');
    p.style.cssText = 'position:absolute;top:calc(50% - 4vmin);' + (r > 0 ? 'right' : 'left') + ':calc(50% - 47vmin);width:0;height:0;transform:translateY(-50%);'
      + 'border-top:3.6vmin solid transparent;border-bottom:3.6vmin solid transparent;border-' + (r > 0 ? 'left' : 'right') + ':3.6vmin solid rgba(255,230,160,.9);';
    return p; };
  const b = document.createElement('div'); b.textContent = 'B';
  b.style.cssText = 'position:absolute;right:4%;bottom:5%;width:64px;height:64px;border-radius:50%;background:#e8352b;border:5px solid #fff;'
    + 'box-shadow:0 4px 0 rgba(0,0,0,.35);color:#fff;font:900 36px/54px system-ui,sans-serif;text-align:center;';
  el.appendChild(ring); el.appendChild(titel); el.appendChild(pfeil(-1)); el.appendChild(pfeil(1)); el.appendChild(b); document.body.appendChild(el);
}
function zeigen(i){
  mk.wahl = (i + EXP.length) % EXP.length; const e = EXP[mk.wahl], g = mk.cv.getContext('2d');
  g.clearRect(0, 0, 512, 512); e.mal(g); mk.titel.textContent = e.name;
  D3.cv.style.display = dreiZeigen(e) ? 'block' : 'none';
  if(story.stimmeStopp) story.stimmeStopp();
  story.sprich(e.text, null, 'inventar');                      // 'inventar': schiebt sich vor, B bricht ab (wie beim Teleskop)
}
function liesEingabe(){
  let x = 0, b = false;
  if(keys['ArrowLeft'] || keys['KeyA']) x -= 1; if(keys['ArrowRight'] || keys['KeyD']) x += 1;                           // global-ok: Engine
  if(keys['KeyB'] || keys['Backspace'] || keys['Escape']) b = true;                                                    // global-ok: Engine
  for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])){ if(!gp) continue;
    const ax = gp.axes[0] || 0; if(Math.abs(ax) > 0.5) x = Math.sign(ax);
    if(gp.buttons[14] && gp.buttons[14].pressed) x = -1; if(gp.buttons[15] && gp.buttons[15].pressed) x = 1;
    if(gp.buttons[1] && gp.buttons[1].pressed) b = true; }
  return { x, b };
}
// Tasten auch als Ereignis (ein kurzes Antippen kann zwischen zwei Bildern liegen – wie story.js tasten)
const getippt = { x: 0, b: false };
addEventListener('keydown', e => { if(!mk.an || e.repeat) return;
  if(e.code === 'ArrowLeft' || e.code === 'KeyA') getippt.x = -1; else if(e.code === 'ArrowRight' || e.code === 'KeyD') getippt.x = 1;
  else if(e.code === 'KeyB' || e.code === 'Backspace' || e.code === 'Escape') getippt.b = true; });
function takt(){
  if(!mk.an) return;
  requestAnimationFrame(takt);
  const t = performance.now(), dt = mk.tVor ? Math.min(0.1, (t - mk.tVor) / 1000) : 0; mk.tVor = t;
  const e = liesEingabe(), alt = mk.eingabe; mk.eingabe = e;
  const tipX = getippt.x, tipB = getippt.b; getippt.x = 0; getippt.b = false;
  if((e.b && !alt.b) || tipB){ zu(); return; }
  if(tipX && !(e.x && e.x !== alt.x)){ mk.sperre = 0.6; zeigen(mk.wahl + tipX); return; }
  if(!e.x) mk.sperre = 0;
  else if(e.x !== alt.x || (mk.sperre -= dt) <= 0){ mk.sperre = 0.6; zeigen(mk.wahl + e.x); }
  dreiTakt(dt);
}
function auf(){
  if(mk.an || !story.pauseSetzen) return;
  bauen(); mk.an = true; mk.eingabe = liesEingabe(); mk.sperre = 0.6; mk.tVor = 0;
  story.pauseSetzen('teleskop');                                // wie das Teleskop: das Spiel steht, kein PAUSE-Schild, Ton bleibt
  mk.el.style.display = 'flex';
  zeigen(mk.wahl);
  requestAnimationFrame(takt);
}
function zu(){
  if(!mk.an) return;
  mk.an = false; mk.el.style.display = 'none'; D3.an = null;
  if(story.stimmeStopp) story.stimmeStopp();
  story.bSperre = true;                                         // B nicht gleich als Knien weitergeben (wie Teleskop und Inventar)
  if(story.pauseArt && story.pauseArt() === 'teleskop') story.pauseSetzen(null);
  story.mikroskopGeschaut = true;
}
story.mikroskopAuf = auf;
story.mikroskopZu = zu;
story.mikroskopExperimente = EXP;
})();
