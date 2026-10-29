// Das Geheimland – Etappe 5: die Weihnachtsfeier im grossen Saal der Mondbasis (Live-Wuensche 28.10.2026, Konzept Etappe 5
// Schritte 11-13, 16, 17). Laedt nach mondbasis_innen.js und mikroskop.js.
// Der Saal ist festlich geschmueckt: eine lange Tafel voller Essen (so lang, dass alle auf EINER Seite sitzen), ein
// Weihnachtsbaum (die Tanne der Waldinsel, story.typ 'tanne', grosser Schmuck), Lichterketten unter der Glaskuppel. Alle Gaeste
// laufen frei durcheinander: die Tiere (Gorilla, Elch, Reh, Lama, Hase, Hasenbaby, Eule, zwei Voegel, das Eichhoernchen), Samu
// mit Barki und die beiden Aliens (Modelle aus Spiel_SFG). Am Rand stehen eine Gitarre und daneben ein Schlagzeug: Y -> Joshi
// spielt (figur.musik), das Weihnachtslied laeuft im Loop, die Aliens, Samu, Barki und Fuchsi tanzen, der Gorilla trommelt sich
// auf die Brust, die anderen wiegen sich – bis der Stick bewegt wird. Der blaue Fotoring vor der Tafel: das Gruppenfoto, alle
// sitzen dafuer an der Tafel (von links: Alien | Tiere | Barki | Samu | Joshi | Fuchsi | Tiere | Alien).
(function(){
'use strict';
const story = window.STORY;
const e5 = () => story.etappe === 5;
const mf = story.mondfest = { gebaut: false, an: false, gaeste: [], musik: null, quelle: null, buf: null, warDrin: false, t: 0, foto: false, sitzen: false };
let RA = null, BODEN_Y = 150, S = null;                    // Raeume aus mondbasis_innen.js; S = der Saal
const TAFEL = { dz: -4.6, L: 17, T: 1.1, H: 0.78 };        // relativ zur Saalmitte: hinten, laengs x (Live-Wunsch 29.10.2026: 0,6 m nach vorn – dahinter steht der Elch)
const BAUM = { dx: -9.4, dz: 2.6, h: 6.2 };                 // vorn links im Saal (nicht am Tafelende)
const GITARRE = { dx: 6.6, dz: 3.4 }, SCHLAGZEUG = { dx: 7.8, dz: 0.6 };   // Live-Wunsch 29.10.2026: weiter im Saal (vorher 9,0/4,4 und 10,4/1,6)
const FOTO = { dz: 4.2 };                                   // Ring vorn im Saal (vor der Bueroband), Blick nach hinten auf alle – die ganze Tafel passt ins Bild
const T = {
  eich: ['Danke, Joshi! Das ist das schönste Weihnachtsfest, das es hier oben je gab!'],
  hFoto: ['Schau dich im Saal um. Drück X.'],
  hRaus: ['Geh doch mal wieder nach draußen.'],
  // Ende des Fests (Live-Wunsch 29.10.2026): Foto, mit einem Alien geredet, ein Instrument gespielt – dann einmal dieser Satz
  hAlien: ['Sag doch mal den Aliens Hallo.'],
  hMusik: ['Spiel doch mal Gitarre oder Schlagzeug.'],
  ende: ['Was für ein schönes Fest! Wenn du magst, verabschiede dich und flieg mit der Rakete nach Hause.'],
  bananen: ['Danke, dass du an die Bananen gedacht hast.'],
  foto: ['Klasse! Alle zusammen an einer Tafel – das schönste Weihnachtsfest!'],
};

// ---- Gaeste ------------------------------------------------------------------------------------------------------------
// h: Hoehe (m, wie in den anderen Etappen); idle/geh/tanz: Clipnamen (Endung genuegt); flieg: fliegt statt zu gehen;
// wiegen: tanzt durch Hin-und-her-Wiegen; tisch: sitzt am Tisch AUF der Bank (kleine Tiere) – sonst steht es dahinter
const GAESTE = [
  // Reihenfolge von links (Live-Wunsch 29.10.2026): Gorilla, kleiner Alien, Hasen, Elch (hinter der Tafel), Voegel, ..., grosser Alien
  { id: 'gorilla', glb: 'GORILLA_GLB', h: 1.8, idle: 'Gorilla_idle', geh: 'Gorilla_walk', tanz: 'Gorilla_ChestDrum', breit: 1.5 },   // breit (Live-Befund: verdeckte den Alien)
  { id: 'alien_klein', glb: 'ALIEN_KLEIN_GLB', h: 1.1, tanz: '*', geh: '*', gehTempo: 0.6, breit: 0.8, dreh: Math.PI / 2 },   // dreh: das Modell schaut zur Seite (Live-Befund 29.10.2026; -PI/2 war falsch herum, im Testfoto geprueft)
  { id: 'hase', glb: 'HASE_GLB', h: 0.78, idle: 'Rabbit_idle', geh: 'Rabbit_walk', wiegen: true, breit: 0.6, tisch: true },
  { id: 'hasenbaby', glb: 'HASENBABY_GLB', h: 0.34, idle: 'idle', geh: 'idle', wiegen: true, breit: 0.45, tisch: true, folgt: 'hase' },
  { id: 'elch', glb: 'ELCH_GLB', h: 1.95, idle: 'Moose_Idle_A', geh: 'Moose_Walk', wiegen: true, breit: 0.15 },   // steht hinter der Tafel (hinter Hasenbaby und Vogel)
  { id: 'vogel_blau', glb: 'VOGEL_BLAU_GLB', h: 0.2, idle: 'idle', geh: 'fly', flieg: true, wiegen: true, breit: 0.4, tisch: true },
  { id: 'vogel_meise', glb: 'VOGEL_MEISE_GLB', h: 0.2, idle: 'idle', geh: 'fly', flieg: true, wiegen: true, breit: 0.4, tisch: true },
  { id: 'barki', glb: 'SHIBA_GLB', h: 0.6, idle: 'Idle', geh: 'Walk', tanz: 'Jump', breit: 0.65 },
  { id: 'samu', glb: 'SAMU_GLB', h: 1.5, idle: 'stand', geh: 'walk', tanz: 'dance_hiphop', breit: 0.75 },   // stand = Briefcase-Pose (Live-Wunsch 29.10.2026)
  { id: 'joshi', breit: 0.75 },
  { id: 'fuchsi', breit: 0.65 },
  { id: 'eich', h: 0.75, breit: 0.6, tisch: true },
  { id: 'lama', glb: 'LAMA_GLB', h: 1.7, idle: 'idle', geh: 'walk', wiegen: true, breit: 0.9 },
  { id: 'reh', glb: 'REH_GLB', h: 1.45, idle: 'Dear_idle', geh: 'Dear_walk', wiegen: true, breit: 0.85 },
  { id: 'eule', glb: 'EULE_GLB', h: 0.62, idle: 'idle', geh: 'fly', flieg: true, wiegen: true, breit: 0.6, tisch: true },
  { id: 'alien_gross', glb: 'ALIEN_GROSS_GLB', h: 2.2, tanz: '*', geh: '*', gehTempo: 0.6, breit: 1 },
];
// Sitzplaetze von links nach rechts (vom Fotoring aus gesehen): x entlang der Tafel, die Breiten addiert und mittig
const ENG = 0.82;   // Live-Wunsch 29.10.2026: alle etwas naeher zusammen
(function(){ const L = GAESTE.reduce((s, g) => s + g.breit * ENG, 0); let x = -L / 2; for(const g of GAESTE){ g.sitzX = x + g.breit * ENG / 2; x += g.breit * ENG; } })();

// ---- Bauen ------------------------------------------------------------------------------------------------------------
const lam = (o) => new THREE.MeshLambertMaterial(Object.assign({ emissive: 0x2a2e36 }, o));
function leinwand(w, h, mal){ const c = document.createElement('canvas'); c.width = w; c.height = h; mal(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); }
let G = null;                                               // Gruppe des Saals (liegt in der Raumgruppe der Basis)
story.mondfestBauen = function(raum, mb){
  if(mf.gebaut) return; mf.gebaut = true; mf.mb = mb;
  const R = story.mondbasisRaeume; RA = R.RAUM; BODEN_Y = R.BODEN_Y; S = RA.saal;
  G = new THREE.Group(); G.position.set(S.x, 0, S.z); G.visible = false; raum.add(G);
  tafelBauen(); schmuckBauen(); baumSetzen(); instrumenteBauen();
  // Hindernisse (in Mitte-Koordinaten, mondbasis_innen.js raumTiefe)
  const H = story.mondbasisHindernisse;
  for(let x = -TAFEL.L / 2 + 0.6; x <= TAFEL.L / 2 - 0.5; x += 1.1) H.push({ x: S.x + x, z: S.z + TAFEL.dz, r: 0.68 });
  for(let x = -TAFEL.L / 2 + 0.5; x <= TAFEL.L / 2 - 0.4; x += 0.45) H.push({ x: S.x + x, z: S.z + TAFEL.dz + TAFEL.T / 2 + 0.45, r: 0.24 });   // die Sitzbank (Live-Befund: man lief durch)
  H.push({ x: S.x + BAUM.dx, z: S.z + BAUM.dz, r: 1.6 }, { x: S.x + GITARRE.dx, z: S.z + GITARRE.dz, r: 0.4 }, { x: S.x + SCHLAGZEUG.dx, z: S.z + SCHLAGZEUG.dz - 0.2, r: 0.95 });
  if(story.stelleSetzen){ const w = mitteWelt(S.x, S.z + FOTO.dz); const ty = BODEN_Y + 1.55;
    story.stelleSetzen('fest_foto', w.x, w.z, { x: w.x, y: ty, z: w.z, yaw: 0, pitch: -0.03, fov: 54 }); }
};
function mitteWelt(lx, lz){ const M = mf.mb.mitte; return { x: M.x + lx, z: M.z + lz }; }
// Tafel: lange Tischplatte mit rot-weisser Decke, Baenke davor und dahinter, darauf das Essen der Waldinsel
function tafelBauen(){
  const decke = leinwand(512, 64, (g, w, h) => { for(let i = 0; i < 32; i++) for(let j = 0; j < 4; j++){ g.fillStyle = (i + j) % 2 ? '#e8e2d6' : '#c8322e'; g.fillRect(i * 16, j * 16, 16, 16); } });
  decke.wrapS = THREE.RepeatWrapping; decke.repeat.x = 4;
  const t = new THREE.Group(); t.position.set(0, 0, TAFEL.dz); G.add(t); mf.tafel = t;
  const platte = new THREE.Mesh(new THREE.BoxGeometry(TAFEL.L, 0.07, TAFEL.T), lam({ map: decke, emissive: 0x241818 })); platte.position.y = TAFEL.H; t.add(platte);
  const saum = new THREE.Mesh(new THREE.BoxGeometry(TAFEL.L + 0.04, 0.22, TAFEL.T + 0.04), lam({ color: 0xc8322e })); saum.position.y = TAFEL.H - 0.1; t.add(saum);
  for(let x = -TAFEL.L / 2 + 0.4; x <= TAFEL.L / 2 - 0.3; x += 2.6) for(const z of [-0.4, 0.4]){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, TAFEL.H, 0.1), lam({ color: 0x6b4a2b })); b.position.set(x, TAFEL.H / 2, z); t.add(b); }
  for(const z of [TAFEL.T / 2 + 0.45]){ const bank = new THREE.Mesh(new THREE.BoxGeometry(TAFEL.L - 0.6, 0.08, 0.42), lam({ color: 0x8a5a33 })); bank.position.set(0, 0.45, z); t.add(bank);
    for(let x = -TAFEL.L / 2 + 0.8; x <= TAFEL.L / 2 - 0.7; x += 2.4){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.36), lam({ color: 0x5b3a1f })); b.position.set(x, 0.225, z); t.add(b); } }
  mf.bankY = 0.49; mf.bankZ = TAFEL.dz + TAFEL.T / 2 + 0.45;
  // die Bananen (Live-Wunsch 29.10.2026): hat Joshi sie den Tieren auf der Waldinsel schon zurueckgebracht, stehen sie hier auf der
  // Tafel; hat er sie noch im Rucksack, stellt er sie mit Y hin (bananenY)
  if(!(story.ausruestung && story.ausruestung.bananen)) bananenAufDenTisch(t);
  // Essen: Teller vor jedem Platz, dazwischen Kuchen, Braten, Obstschalen, Brot, Nuesse, Karotten, Bananen, Kerzen
  let s = 17; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, oben = TAFEL.H + 0.04;
  const teller = lam({ color: 0xf6f6f2, emissive: 0x2a2a2a });
  for(const g of GAESTE){ const p = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 0.02, 20), teller); p.position.set(g.sitzX, oben + 0.01, 0.28); t.add(p); }
  const add = (m, x, z, y) => { m.position.set(x, oben + (y || 0), z); t.add(m); return m; };
  for(let x = -TAFEL.L / 2 + 1.0; x < TAFEL.L / 2 - 0.6; x += 1.45){
    const art = Math.floor(rnd() * 7), z = -0.12 + rnd() * 0.12;
    if(art === 0){ const k = add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 20), lam({ color: 0x8a4b2a })), x, z, 0.07); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.03, 20), lam({ color: 0xfff4e6 })); c.position.y = 0.08; k.add(c);
      const kirsche = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), lam({ color: 0xd01818 })); kirsche.position.y = 0.11; k.add(kirsche); }
    else if(art === 1){ const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), lam({ color: 0xa8642a })), x, z, 0.1); b.scale.set(1.3, 0.75, 1);
      for(const sx of [-1, 1]){ const k = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.16, 8), lam({ color: 0xc88a4a })); k.position.set(sx * 0.17, 0.04, 0.06); k.rotation.z = sx * 1.1; b.add(k); }
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.02, 20), teller), x, z, 0); }
    else if(art === 2){ const sch = add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lam({ color: 0xd9c49a, side: THREE.DoubleSide })), x, z, 0.16);
      for(let i = 0; i < 7; i++){ const o = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lam({ color: [0xe53935, 0x7cb342, 0xfb8c00, 0xfdd835][i % 4] })); o.position.set((rnd() - 0.5) * 0.18, -0.02 + rnd() * 0.04, (rnd() - 0.5) * 0.18); sch.add(o); } }
    else if(art === 3){ const br = add(new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), lam({ color: 0xc08a48 })), x, z, 0.07); br.scale.set(1.6, 0.6, 0.8); }
    else if(art === 4){ for(let i = 0; i < 9; i++){ const n = add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), lam({ color: 0x7a5230 })), x + (rnd() - 0.5) * 0.24, z + (rnd() - 0.5) * 0.16, 0.03); n.scale.y = 0.8; } }
    else if(art === 5){ for(let i = 0; i < 4; i++){ const k = add(new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.2, 8), lam({ color: 0xff8a1e })), x - 0.12 + i * 0.08, z, 0.03); k.rotation.z = Math.PI / 2; k.rotation.y = i * 0.3;
      const gr = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), lam({ color: 0x43a047 })); gr.position.y = -0.12; gr.rotation.z = Math.PI; k.add(gr); } }
    else { for(let i = 0; i < 3; i++){ const b = add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 8, 14, Math.PI * 0.8), lam({ color: 0xffd54f })), x - 0.06 + i * 0.06, z, 0.03); b.rotation.x = Math.PI / 2; b.rotation.z = i * 0.25; } }
    // Kerze mit Flamme
    const k = add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.2, 10), lam({ color: 0xfff8e1 })), x + 0.7, -0.25, 0.1);
    const fl = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc04a })); fl.scale.y = 1.8; fl.position.y = 0.14; k.add(fl);
  }
}
function bananenAufDenTisch(t){
  if(mf.bananen || !story.bananenModell) return; const g = GAESTE.find(q => q.id === 'gorilla'), k = story.bananenModell();
  k.scale.multiplyScalar(0.9); k.position.set(g ? g.sitzX : 0, TAFEL.H + 0.04, -0.15); k.rotation.y = 0.4; (t || mf.tafel).add(k); mf.bananen = k;
}
function bananenY(o){
  if(o.spricht || mf.bananen) return; o.spricht = true; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
  if(story.ausruestung) story.ausruestung.bananen = false; bananenAufDenTisch();
  const go = mf.gaeste.find(q => q.D.id === 'gorilla'); if(go){ go.ziel = null; go.warte = 6; anim(go, 'tanz'); }
  story.sprich(T.bananen, () => { o.spricht = false; }, 'gorilla');
}
// Schmuck: Lichterketten im Bogen unter der Kuppel, rote Schleifen am Sockel, Sterne, die von der Kuppel haengen
function schmuckBauen(){
  const farben = [0xff5252, 0xffd740, 0x69f0ae, 0x40c4ff, 0xff80ab], n = 28, R = story.mondbasisRaeume, rr = R.DOM.r - 0.6;
  mf.lichter = [];
  for(let i = 0; i < n; i++){
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    if(Math.cos(a0) * rr > R.WAND.quer - 0.4 || Math.cos(a1) * rr > R.WAND.quer - 0.4) continue;   // nur im Saal
    for(let j = 0; j <= 8; j++){ const u = j / 8, a = a0 + (a1 - a0) * u, y = 3.2 - Math.sin(u * Math.PI) * 0.6;
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: farben[(i * 9 + j) % farben.length] }));
      l.position.set(Math.sin(a) * rr - S.x, y, Math.cos(a) * rr - S.z); G.add(l); mf.lichter.push(l); }
    const sch = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 6, 12), lam({ color: 0xd32f2f })); sch.position.set(Math.sin(a0) * (R.DOM.r - 0.15) - S.x, 0.62, Math.cos(a0) * (R.DOM.r - 0.15) - S.z); sch.rotation.y = a0; G.add(sch);
  }
  const stern = new THREE.Shape(); for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2, r = i % 2 ? 0.12 : 0.3; i ? stern.lineTo(Math.sin(a) * r, Math.cos(a) * r) : stern.moveTo(0, r); }
  const sg = new THREE.ExtrudeGeometry(stern, { depth: 0.06, bevelEnabled: false });
  for(let i = 0; i < 9; i++){ const a = i / 9 * Math.PI * 2 + 0.2, rr = 3 + (i % 3) * 2.6, y = 5.6 + (i % 2) * 0.8;
    const st = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: 0xffe066 })); st.position.set(Math.sin(a) * rr, y, Math.cos(a) * rr); st.rotation.y = a; G.add(st);
    const faden = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.6, 4), lam({ color: 0xdddddd })); faden.position.set(st.position.x, y + 1.1, st.position.z); G.add(faden); }
}
// Weihnachtsbaum: die Tanne der Waldinsel mit grossem Schmuck (waldinsel.js story.typ 'tanne'), hinten links
function baumSetzen(){
  if(!story.setze) return;
  const w = mitteWelt(S.x + BAUM.dx, S.z + BAUM.dz);
  const d = story.setze('tanne', 5, { x: w.x, z: w.z, y: BODEN_Y, h: BAUM.h, schmuck: 'gross', farbe: 2, fest: true });
  if(!d || !d.bereit) return;
  d.bereit.then(() => { if(!d.obj) return; story.entferne(d); d.obj.position.set(BAUM.dx, 0, BAUM.dz); G.add(d.obj); mf.baum = d.obj; if(!mf.mb.drin) story.sichtTeile(d.obj, false); });
}
// Gitarre (am Rand, auf einem Staender) und daneben das Schlagzeug mit Hocker
function instrumenteBauen(){
  const lade = (glb, name, fertig) => { if(!window[glb] || !story.ladeGlb) return; story.ladeGlb(window[glb], name, (gl) => { const o = gl.scene; o.traverse(m => { if(m.isMesh) m.frustumCulled = false; }); o.updateMatrixWorld(true); fertig(o); }); };
  const passend = (o, wie, mass) => { const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    const k = mass / Math.max(0.01, wie === 'h' ? sz.y : Math.max(sz.x, sz.z)); o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k); const h = new THREE.Group(); h.add(o); return h; };
  const blick = Math.atan2(-GITARRE.dx, -GITARRE.dz);                                      // zur Saalmitte
  lade('GITARRE_SAAL_GLB', 'Gitarre', (o) => { const s0 = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
    if(s0.x >= s0.y && s0.x >= s0.z) o.rotation.z = Math.PI / 2; else if(s0.z >= s0.y && s0.z >= s0.x) o.rotation.x = Math.PI / 2; o.updateMatrixWorld(true);
    const h = passend(o, 'h', 1.05); h.position.set(GITARRE.dx, 0, GITARRE.dz); h.rotation.y = blick; h.rotation.z = 0.12; G.add(h); mf.gitarre = h; mf.gitInter = anmelden(h, GITARRE, 'Gitarre', () => musik('guitar')); });
  lade('SCHLAGZEUG_GLB', 'Schlagzeug', (o) => { const h = passend(o, 'b', 2.0); h.position.set(SCHLAGZEUG.dx, 0, SCHLAGZEUG.dz); h.rotation.y = Math.atan2(-SCHLAGZEUG.dx, -SCHLAGZEUG.dz); G.add(h); mf.schlagzeug = h;
    mf.drumInter = anmelden(h, SCHLAGZEUG, 'Schlagzeug', () => musik('drums')); });
  // Hocker hinter dem Schlagzeug (zur Wand hin)
  const a = Math.atan2(SCHLAGZEUG.dx, SCHLAGZEUG.dz), hx = SCHLAGZEUG.dx + Math.sin(a) * 0.9, hz = SCHLAGZEUG.dz + Math.cos(a) * 0.9;
  const hocker = new THREE.Group(); hocker.position.set(hx, 0, hz); G.add(hocker);
  const sitz = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16), lam({ color: 0x222428 })); sitz.position.y = 0.3; hocker.add(sitz);   // so hoch, wie Joshi in der 'drums'-Pose sitzt (Huefte 0,39 m)
  const bein = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), lam({ color: 0x9aa3ad })); bein.position.y = 0.15; hocker.add(bein);
  mf.hocker = { x: hx, z: hz, blick: Math.atan2(hx, hz - 1.0) };   // Joshis yaw (vorwaerts = -z): ueber das Schlagzeug zu den Tanzenden
}
// Y an Gitarre und Schlagzeug: erst im Fest (X zeigt sie im Saal); Joshi steht davor
function anmelden(obj, P, name, aktion){   // (vor dem Fest aus; kommt es erst danach, gleich an und entdeckt)
  const a = Math.atan2(-P.dx, -P.dz), w = mitteWelt(S.x + P.dx + Math.sin(a) * 1.0, S.z + P.dz + Math.cos(a) * 1.0), y = mitteWelt(S.x + P.dx, S.z + P.dz);
  const o = story.interaktion(obj, { name, welt: 5, innen: true, x: w.x, z: w.z, r: 0.5, yx: y.x, yz: y.z, yHoehe: name === 'Gitarre' ? 1.5 : 1.7, aktion, danach: aktion });
  if(o){ o.aus = !mf.an; if(mf.an) o.entdeckt = true; } return o;
}

// ---- Gaeste laden ------------------------------------------------------------------------------------------------------
const _v = new THREE.Vector3();
function hautBox(o){ const bb = new THREE.Box3(); o.updateMatrixWorld(true);
  o.traverse(m => { if(!m.isSkinnedMesh) return; const n = m.geometry.attributes.position.count; for(let i = 0; i < n; i += 5){ m.boneTransform(i, _v); _v.applyMatrix4(m.matrixWorld); bb.expandByPoint(_v); } });
  if(bb.isEmpty()) bb.setFromObject(o); return bb; }
function clip(gl, name){ if(!name) return null; if(name === '*') return gl.animations[0] || null; return gl.animations.find(a => a.name === name || a.name.endsWith('|' + name)) || null; }
function gastLaden(D){
  const daten = window[D.glb]; if(!daten || !story.ladeGlb) return;
  story.ladeGlb(daten, D.id, (gl) => {
    const o = gl.scene;
    o.traverse(m => { if(!m.isMesh) return; m.frustumCulled = false; m.castShadow = false; const alt = m.material;
      m.material = new THREE.MeshLambertMaterial({ map: alt.map || null, vertexColors: !!(m.geometry.attributes.color), color: alt.map || m.geometry.attributes.color ? 0xffffff : (alt.color ? alt.color.getHex() : 0xffffff),
        emissive: 0x1c1c1c, skinning: !!m.isSkinnedMesh, transparent: !!alt.transparent, alphaTest: alt.alphaTest || 0 }); });
    const mx = new THREE.AnimationMixer(o), ruhe = clip(gl, D.idle) || clip(gl, D.tanz) || gl.animations[0];
    if(ruhe){ mx.clipAction(ruhe).play(); mx.update(0.05); }
    const bb = hautBox(o), k = D.h / Math.max(0.01, bb.max.y - bb.min.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k); mx.stopAllAction(); mx.uncacheRoot(o);
    // dreh (Grad im Modell): eine Zwischengruppe richtet es nach +z aus – so stimmt es beim Laufen, Tanzen und auf dem Foto
    const h = new THREE.Group(), inner = new THREE.Group(); inner.add(o); inner.rotation.y = D.dreh || 0; h.add(inner); h.userData.agent = true; G.add(h);
    const g = { D, h, mixer: new THREE.AnimationMixer(o), acts: {}, cur: null, ziel: null, warte: 1 + Math.random() * 3, phase: Math.random() * 6 };
    for(const art of ['idle', 'geh', 'tanz']){ const c2 = clip(gl, D[art]); if(c2) g.acts[art] = g.mixer.clipAction(c2); }
    if(!g.acts.idle) g.acts.idle = g.acts.tanz || g.acts.geh;
    gastPlatz(g, true); mf.gaeste.push(g); anim(g, 'idle');
    if(ALIEN[D.id]){ const w = mitteWelt(S.x, S.z); g.inter = story.interaktion(h, { name: 'Alien', welt: 5, innen: true, x: w.x, z: w.z, r: 0.6, yHoehe: D.h + 0.5, aktion: alienY, danach: alienY });
      if(g.inter){ g.inter.entdeckt = true; g.inter.alienId = D.id; } }
    if(!mf.mb.drin) story.sichtTeile(h, false);
  });
}
function anim(g, art, tempo){
  const a = g.acts[art] || g.acts.idle; if(!a) return;
  if(tempo !== undefined) a.timeScale = tempo; else a.timeScale = 1;
  if(g.cur === a) return;
  const alt = g.cur; a.reset(); a.play(); if(alt) a.crossFadeFrom(alt, 0.3, false); g.cur = a;
}
// zufaelliger freier Platz im Saal (Mitte-Koordinaten des Saals); Voegel und Eule auch auf der Tafel
function zufallsPlatz(g){
  for(let i = 0; i < 30; i++){
    if(g.D.flieg && Math.random() < 0.4){ return { x: (Math.random() - 0.5) * (TAFEL.L - 1), z: TAFEL.dz + (Math.random() - 0.5) * 0.5, y: TAFEL.H + 0.05 }; }
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * (S.r - 1.6), x = Math.sin(a) * r, z = Math.cos(a) * r;
    if(story.mondbasisFrei(S.x + x, S.z + z, 0.6)) return { x, z, y: 0 };
  }
  return { x: 0, z: 2, y: 0 };
}
function gastPlatz(g, start){ const p = zufallsPlatz(g); if(start){ g.h.position.set(p.x, p.y, p.z); g.h.rotation.y = Math.random() * 6.3; } else g.ziel = p; }

// ---- Ablauf -------------------------------------------------------------------------------------------------------------
// Joshi sagt "alles schmuecken" (mondbasis_innen.js): die Gaeste sind da, das Eichhoernchen geht voraus in den Saal
story.mondfestStart = function(){
  if(mf.an) return; mf.an = true; if(G) G.visible = !!mf.mb.drin;
  for(const D of GAESTE) if(D.glb) gastLaden(D);
  const H = story.mondbasisHindernisse; if(H[2]) H[2].aus = true;                            // der Platz des Eichhoernchens im Buero
  if(story.mondbasisEichSetzen) story.mondbasisEichSetzen(S.x - 2.5, S.z + 3.5, Math.PI);
  mf.mb.eichFrei = true;
  for(const o of [mf.gitInter, mf.drumInter]) if(o){ o.aus = false; o.entdeckt = true; }   // gleich mit Y (Live-Wunsch: nicht noch einmal X)
  // noch im Rucksack: Y vor dem Platz des Gorillas stellt sie auf die Tafel
  if(story.ausruestung && story.ausruestung.bananen && !mf.bananen && !mf.banInter){ const g = GAESTE.find(q => q.id === 'gorilla'), w = mitteWelt(S.x + g.sitzX, S.z + mf.bankZ + 0.9), y = mitteWelt(S.x + g.sitzX, S.z + TAFEL.dz);
    // die Y-Zone reicht ueber die ganze Tafel (Live-Wunsch 29.10.2026): Abstand zur Laengsachse, nicht zu einem Punkt
    const ta = mitteWelt(S.x - TAFEL.L / 2, S.z + TAFEL.dz), tb = mitteWelt(S.x + TAFEL.L / 2, S.z + TAFEL.dz);
    mf.banInter = story.interaktion(mf.tafel, { name: 'Bananen auf den Tisch', welt: 5, innen: true, x: w.x, z: w.z, r: TAFEL.T / 2 + 1.2, strecke: { ax: ta.x, az: ta.z, bx: tb.x, bz: tb.z }, yx: y.x, yz: y.z, yHoehe: TAFEL.H + 0.7, aktion: bananenY });
    if(mf.banInter) mf.banInter.entdeckt = true; }
};
story.mondfestEichY = function(o){ if(o.spricht) return; o.spricht = true; story.sprich(T.eich, () => { o.spricht = false; }, 'eich'); };
// ---- Die Aliens (Live-Wunsch 28.10.2026): geht Joshi auf einen zu, kommt ein Y. Er stellt sich vor – sein Name und der seines
// Freundes sind Piep-Bloep-Geraeusche (WebAudio) – und danach ist eine Skizze der beiden mit ihren Namen im Notizbuch.
const ALIEN = { alien_gross: { name: 'Piep-Blöp-Piep', laut: 'pbp', freund: 'alien_klein', rolle: 'alienG' }, alien_klein: { name: 'Blöp-Piep-Blöp', laut: 'bpb', freund: 'alien_gross', rolle: 'alienK' } };
function piepBloep(folge, fertig){
  if(typeof audioCtx === 'undefined' || !audioCtx || audioCtx.state !== 'running'){ story.spaeter(0.6, fertig); return; }      // global-ok: Engine
  let t = audioCtx.currentTime + 0.05; const ziel = audioCtx.destination;                                                    // global-ok: Engine
  for(const z of folge){ const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = z === 'p' ? 'sine' : 'triangle';   // global-ok: Engine
    const d = z === 'p' ? 0.13 : 0.22; if(z === 'p'){ o.frequency.setValueAtTime(1250, t); o.frequency.linearRampToValueAtTime(1500, t + d); }
    else { o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(190, t + d); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(ziel); o.start(t); o.stop(t + d + 0.02); t += d + 0.07; }
  story.spaeter(t - audioCtx.currentTime + 0.15, fertig);                                                                  // global-ok: Engine
}
story.piepBloep = piepBloep;                                         // heimkehr.js: die Namen im Funkspruch des Eichhoernchens
function alienY(o){
  if(o.spricht) return; o.spricht = true; mf.alienGeredet = true; const A = ALIEN[o.alienId], F = ALIEN[A.freund], g = mf.gaeste.find(q => q.D.id === o.alienId);
  if(g){ g.ziel = null; g.warte = 12; const p = eva.group.position; g.h.rotation.y = Math.atan2(p.x - (mf.mb.mitte.x + S.x + g.h.position.x), p.z - (mf.mb.mitte.z + S.z + g.h.position.z)); }
  story.sprich(['Hallo, ich bin'], () => piepBloep(A.laut, () => story.sprich(['Mein Freund'], () => piepBloep(F.laut, () =>
    story.sprich(['und ich waren neugierig, wer hier wohnt.', 'Es freut uns, euch kennenzulernen und mit euch zu feiern!'], () => { o.spricht = false; alienSkizze(); }, A.rolle)), A.rolle)), A.rolle);
}
function alienSkizze(){
  if(mf.alienSkizze || !story.modellBleistift || !story.notizSeiteDazu) return;
  const a = mf.gaeste.find(q => q.D.id === 'alien_gross'), b = mf.gaeste.find(q => q.D.id === 'alien_klein'); if(!a || !b) return; mf.alienSkizze = true;
  const W = 1200, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H);
  if(typeof renderer === 'undefined' || !story.bleistift || !story.klonSkin) return;                       // global-ok: Engine
  const szn = new THREE.Scene(); szn.background = new THREE.Color(0xf4ecd8);
  szn.add(new THREE.HemisphereLight(0xffffff, 0x777777, 1.1)); const l = new THREE.DirectionalLight(0xffffff, 0.8); l.position.set(1, 2, 2); szn.add(l);
  // in der Pose von FOTO_STILL und ohne die Zwischendrehung (Live-Befund 29.10.2026: der kleine Alien stand im Tanz mit dem Ruecken da)
  const kopien = [[a, -0.85], [b, 0.95]].map(([q, x]) => {
    const S = FOTO_STILL[q.D.id], A = S && q.cur, alt = A ? q.cur.time : 0; if(A){ q.cur.time = S.t; q.mixer.update(0); }
    const k = story.klonSkin(q.h.children[0].children[0]); if(A){ q.cur.time = alt; q.mixer.update(0); }
    k.rotation.y = S ? S.dreh : (q.D.dreh || 0);                                                  // (die Lage im Modell bleibt: es ist mittig gesetzt)
    const h = new THREE.Group(); h.add(k); h.position.x = x; h.rotation.y = x < 0 ? 0.25 : -0.25; szn.add(h); return k; });
  const kam = new THREE.PerspectiveCamera(30, W / H, 0.05, 50); kam.position.set(0, 1.25, 5.6); kam.lookAt(0, 1.0, 0);
  const rt = new THREE.WebGLRenderTarget(W, H), alt = renderer.getRenderTarget();                                      // global-ok: Engine
  renderer.setRenderTarget(rt); renderer.clear(); renderer.render(szn, kam); renderer.setRenderTarget(alt);             // global-ok: Engine
  const px = new Uint8Array(W * H * 4); renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); rt.dispose();              // global-ok: Engine
  const roh = document.createElement('canvas'); roh.width = W; roh.height = H; const rg = roh.getContext('2d'), id = rg.createImageData(W, H);
  for(let y = 0; y < H; y++) id.data.set(px.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
  for(let i = 3; i < id.data.length; i += 4) id.data[i] = 255; rg.putImageData(id, 0, 0);
  for(const k of kopien) if(story.entsorgen) story.entsorgen(k);
  g.drawImage(story.bleistift(roh, true), 0, 0, W, H);
  g.fillStyle = 'rgba(55,50,45,.9)'; g.font = 'italic 46px "Comic Sans MS", "Segoe Print", cursive'; g.textAlign = 'center';
  g.fillText(ALIEN.alien_gross.name, 400, 745); g.fillText(ALIEN.alien_klein.name, 830, 745);
  story.notizSeiteDazu({ art: 'skizze', bild: story.mitSignatur ? story.mitSignatur(c) : c, name: 'Die Aliens', ort: 'mond' });
}
story.mondfestHinweis = () => !mf.foto ? T.hFoto : !mf.alienGeredet ? T.hAlien : !mf.gespielt ? T.hMusik : T.ende;
story.mondfestAllesGemacht = () => !!(mf.foto && mf.alienGeredet && mf.gespielt);
story.mondfestFotoFrei = () => mf.an && !mf.foto;
story.e5FestFertig = () => mf.foto;
// Gaeste nur zeigen, wenn Joshi drinnen ist (mondbasis_innen.js innenZeigen)
story.mondfestZeigen = (an) => { for(const g of mf.gaeste) story.sichtTeile(g.h, an); if(mf.baum) story.sichtTeile(mf.baum, an); if(G) G.visible = an && mf.an; };
story.mondfestDraussen = () => { if(mf.musik) musikAus(); };
story.fuchsTanzMitte = () => (mf.musik || mf.luft) && mf.mb.drin ? { x: mf.mb.mitte.x + S.x, z: mf.mb.mitte.z + S.z + 1.0, qx: 0.9, qz: 0 } : null;   // story.js fuchsTanz
// Gaeste unterwegs: laufen zum Ziel (Voegel fliegen), warten ein bisschen, dann weiter
function gastTakt(g, dt){
  g.mixer.update(dt);
  if(g.inter){ const M = mf.mb.mitte; g.inter.x = g.inter.yx = M.x + S.x + g.h.position.x; g.inter.z = g.inter.yz = M.z + S.z + g.h.position.z; if(g.inter.spricht) return; }   // das Y wandert mit
  if(mf.musik || mf.luft){ tanzTakt(g, dt); return; }
  if(mf.sitzen) return;
  g.h.rotation.z = 0; g.h.children[0].position.y = g.h.children[0].userData.y0 !== undefined ? g.h.children[0].userData.y0 : g.h.children[0].position.y;
  if(!g.ziel){ g.warte -= dt; if(g.warte <= 0){ if(g.D.folgt){ const f = mf.gaeste.find(q => q.D.id === g.D.folgt); if(f){ g.ziel = { x: f.h.position.x + 0.7, z: f.h.position.z + 0.5, y: 0 }; } else gastPlatz(g); } else gastPlatz(g); } anim(g, g.warteAnim || 'idle'); return; }
  const p = g.h.position, dx = g.ziel.x - p.x, dz = g.ziel.z - p.z, d = Math.hypot(dx, dz), v = g.D.flieg ? 1.6 : (g.D.h > 1.4 ? 1.0 : 0.7);
  if(d < 0.15){ p.y = g.ziel.y; g.ziel = null; g.warte = 2 + Math.random() * 5; g.warteAnim = g.D.id === 'gorilla' && Math.random() < 0.6 ? 'tanz' : 'idle'; return; }   // der Gorilla trommelt oft beim Warten
  const s = Math.min(d, v * dt);
  // nicht durch die Tafel (Live-Befund 29.10.2026): ist der naechste Schritt nicht frei, ein neues Ziel (Voegel fliegen darueber)
  if(!g.D.flieg && !story.mondbasisFrei(S.x + p.x + dx / d * s, S.z + p.z + dz / d * s, 0.3) && story.mondbasisFrei(S.x + p.x, S.z + p.z, 0.3)){ g.ziel = null; g.warte = 0.2; anim(g, 'idle'); return; }
  p.x += dx / d * s; p.z += dz / d * s;
  if(g.D.flieg){ const rest = d / Math.max(0.5, Math.hypot(dx, dz) + 0.01); p.y += ((d > 1 ? 1.6 : g.ziel.y) - p.y) * Math.min(1, dt * 2); }
  let dw = Math.atan2(dx, dz) - g.h.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); g.h.rotation.y += dw * Math.min(1, dt * 5);
  anim(g, 'geh', g.D.gehTempo);
}
// Tanzen: wer einen Tanz hat, tanzt ihn auf der Stelle; die anderen wiegen sich hin und her (und wippen)
// (Live-Wunsch 29.10.2026) alle kommen in die Mitte des Saals und tanzen dort nah beieinander – auch zu Joshis Luftgitarre
function tanzPlatz(g){
  if(g.tanzPlatz) return g.tanzPlatz; const i = mf.gaeste.indexOf(g), n = Math.max(1, mf.gaeste.length), a = i / n * Math.PI * 2, r = 1.4 + (i % 2) * 1.1;
  return (g.tanzPlatz = { x: Math.sin(a) * r, z: 1.0 + Math.cos(a) * r * 0.8 });
}
function tanzTakt(g, dt){
  g.phase += dt;
  if(g.D.id !== 'barki' && !g.D.flieg){ const P = tanzPlatz(g), p = g.h.position, dx = P.x - p.x, dz = P.z - p.z, d = Math.hypot(dx, dz);
    if(d > 0.25){ const s = Math.min(d, 1.3 * dt), nx = p.x + dx / d * s, nz = p.z + dz / d * s;
      if(story.mondbasisFrei(S.x + nx, S.z + nz, 0.3) || !story.mondbasisFrei(S.x + p.x, S.z + p.z, 0.3)){ p.x = nx; p.z = nz; p.y = 0; g.h.rotation.z = 0;
        let dw = Math.atan2(dx, dz) - g.h.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); g.h.rotation.y += dw * Math.min(1, dt * 6); anim(g, 'geh', g.D.gehTempo); return; } }
    else { let dw = Math.atan2(-p.x, 1.0 - p.z) - g.h.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); g.h.rotation.y += dw * Math.min(1, dt * 3); } }   // zur Mitte
  if(g.D.id === 'barki'){ barkiTollt(g, dt); return; }
  if(g.D.tanz && g.acts.tanz){ anim(g, 'tanz'); g.h.rotation.z = 0; return; }
  anim(g, 'idle');
  g.h.rotation.z = Math.sin(g.phase * 3.2) * 0.12;
  const inner = g.h.children[0]; if(inner.userData.y0 === undefined) inner.userData.y0 = inner.position.y;
  inner.position.y = inner.userData.y0 + Math.abs(Math.sin(g.phase * 3.2)) * g.D.h * 0.05;
}
// Barki (wie in Spiel_SFG begleiter.js, wenn Samu Hip Hop tanzt): vor Samu hin und her, immer wieder ein Sprung
function barkiTollt(g, dt){
  const s = mf.gaeste.find(q => q.D.id === 'samu'); if(!s) { anim(g, 'tanz'); return; }
  const T = g.toll || (g.toll = { seite: 1, naechste: 0.8, sprung: 0 }), sy = s.h.rotation.y, p = g.h.position;
  const vx = s.h.position.x + Math.sin(sy) * 1.6 + Math.cos(sy) * 0.9 * T.seite, vz = s.h.position.z + Math.cos(sy) * 1.6 - Math.sin(sy) * 0.9 * T.seite;
  if(T.sprung > 0){ T.sprung -= dt; anim(g, 'tanz'); const st = 1.4 * dt; p.x += Math.sin(g.h.rotation.y) * st; p.z += Math.cos(g.h.rotation.y) * st; return; }
  if((T.naechste -= dt) <= 0){ T.sprung = 0.9; T.naechste = 1.0 + Math.random() * 1.4; return; }
  const dx = vx - p.x, dz = vz - p.z, d = Math.hypot(dx, dz);
  if(d < 0.35){ T.seite = -T.seite; anim(g, 'idle'); return; }
  const st = Math.min(d, 3.0 * dt); p.x += dx / d * st; p.z += dz / d * st; g.h.rotation.y = Math.atan2(dx, dz); anim(g, 'geh', 1.6);
}
// ---- Musik ----------------------------------------------------------------------------------------------------------------
function liedLaden(dann){
  if(mf.buf){ dann(); return; }
  if(typeof decodeSound !== 'function' || !window.WEIHNACHTSLIED_SND) return;                  // global-ok: Engine
  decodeSound(window.WEIHNACHTSLIED_SND).then(b => { mf.buf = b; dann(); }).catch(e => console.warn('Weihnachtslied:', e));   // global-ok: Engine
}
const HOCKER_SITZ = 0;   // Joshis Hoehe auf dem Hocker (die 'drums'-Animation sitzt)
function musik(was){
  if(mf.musik || !eva) return;
  mf.musik = was; mf.gespielt = true;
  // Joshi an seinen Platz: vor die Gitarre (zur Saalmitte) bzw. auf den Hocker hinter dem Schlagzeug
  const pos = was === 'drums' ? mitteWelt(S.x + mf.hocker.x, S.z + mf.hocker.z) : mitteWelt(S.x + GITARRE.dx - Math.sin(Math.atan2(GITARRE.dx, GITARRE.dz)) * 0.8, S.z + GITARRE.dz - Math.cos(Math.atan2(GITARRE.dx, GITARRE.dz)) * 0.8);
  eva.group.position.set(pos.x, BODEN_Y + (was === 'drums' ? HOCKER_SITZ : 0), pos.z);
  // Blick zu den Gaesten in der Saalmitte (Live-Befund 29.10.2026: Joshi drehte ihnen – und dem Schlagzeug – den Ruecken zu)
  const lx = pos.x - (mf.mb.mitte.x + S.x), lz = pos.z - (mf.mb.mitte.z + S.z);
  eva.yaw = Math.atan2(lx, lz - 1.0); eva.group.rotation.y = eva.yaw;
  if(was === 'guitar' && mf.gitarre) mf.gitarre.visible = false;
  story.figur.musik = was; story.figur.steht = 0;
  mf.musikT = 0;
  if(story.fuchsTanzStart) story.fuchsTanzStart();
  liedLaden(() => { if(!mf.musik || mf.quelle || typeof audioCtx === 'undefined' || !audioCtx) return;           // global-ok: Engine
    const s = audioCtx.createBufferSource(); s.buffer = mf.buf; s.loop = true;                                   // global-ok: Engine
    if(!mf.gain){ mf.gain = audioCtx.createGain(); mf.gain.connect(audioCtx.destination); } mf.gain.gain.value = 0.55;   // global-ok: Engine
    s.connect(mf.gain); s.start(); mf.quelle = s; });
}
function musikAus(){
  if(!mf.musik) return;
  mf.musik = null; story.figur.musik = null;
  if(mf.quelle){ try { mf.quelle.stop(); } catch(e){} mf.quelle = null; }
  if(mf.gitarre) mf.gitarre.visible = true;
  if(story.fuchsTanzEnde) story.fuchsTanzEnde();
  tanzEnde();
}
function tanzEnde(){ for(const g of mf.gaeste){ g.h.rotation.z = 0; const inner = g.h.children[0]; if(inner.userData.y0 !== undefined) inner.position.y = inner.userData.y0; g.ziel = null; g.warte = Math.random() * 2; g.toll = null; g.tanzPlatz = null; } }
// Kamera beim Musizieren (Live-Wunsch 29.10.2026: Joshi war nicht im Bild; die Instrumente stehen dafuer weiter im Saal): hinter
// Joshi mit Abstand, Blick ueber ihn hinweg in den Saal – vorn sieht man ihn spielen, dahinter in der Mitte tanzen alle
const _k = new THREE.Vector3();
story.mondfestKamera = function(){
  // beim Gruppenfoto: auf dem Fotoring, Blick zur Tafel (Live-Wunsch 29.10.2026: die Kamera sprang mit Joshi an die Tafel)
  if(mf.sitzen && story.stelleBlick){ const B = story.stelleBlick('fest_foto'); if(B){ camera.position.set(B.x, B.y, B.z); camera.rotation.set(B.pitch, B.yaw, 0, 'YXZ'); return true; } }   // global-ok: Engine
  if(!mf.musik || !eva) return false;
  const p = eva.group.position, M = mf.mb.mitte, mx = M.x + S.x, mz = M.z + S.z, l = Math.hypot(mx - p.x, mz - p.z) || 1, ux = (mx - p.x) / l, uz = (mz - p.z) / l;
  _k.set(p.x - ux * 2.6 + uz * 1.6, BODEN_Y + 2.0, p.z - uz * 2.6 - ux * 1.6);
  camera.position.lerp(_k, Math.min(1, 3 * dtCam)); camera.up.set(0, 1, 0); camera.lookAt(p.x + ux * 3.5, BODEN_Y + 0.7, p.z + uz * 3.5);   // global-ok: Engine
  return true;
};
// ---- Gruppenfoto -----------------------------------------------------------------------------------------------------------
// notizbuch.js 'fest_foto' (vorher): alle setzen sich an die Tafel – von links Alien | Tiere | Barki | Samu | Joshi | Fuchsi |
// Tiere | Alien; Fuchsi sitzt schon da (laeuft nicht ins Bild), die Kamera sucht wie immer
const FOTO_STILL = { alien_klein: { t: 0, dreh: 0 } };   // Bild (s) im Tanz und Drehung dazu (im Testfoto geprueft: so schaut er nach vorn)
story.mondfestFotoVorbereiten = function(){
  musikAus(); mf.sitzen = true;
  const z = mf.bankZ, blick = 0;
  // alle schauen zum Fotoring (Live-Wunsch 29.10.2026): je nach Platz gedreht – Modelle schauen bei rotation.y = 0 nach +z, Joshi und
  // Fuchsi zaehlen wie Joshis yaw (vorwaerts = -z)
  const zumRing = (lx, lz) => Math.atan2(0 - lx, FOTO.dz - lz), zumRingYaw = (lx, lz) => Math.atan2(lx - 0, lz - FOTO.dz);
  for(const D of GAESTE){
    const lx = D.sitzX, kleinAufBank = D.tisch && D.h < 1, w = mitteWelt(S.x + lx, S.z + z);
    // Joshi und Fuchsi schauen zur Kamera (Live-Befund 29.10.2026: Joshi drehte ihr den Ruecken zu, Fuchsi fehlte; ihr Blick zaehlt wie
    // Joshis yaw: PI = zur Kamera)
    if(D.id === 'joshi'){ eva.group.position.set(w.x, BODEN_Y, w.z + 0.25); eva.yaw = zumRingYaw(lx, z + 0.25); eva.group.rotation.y = eva.yaw; eva.group.visible = true; continue; }
    if(D.id === 'fuchsi'){ if(story.fuchs && story.fuchs.obj){ story.fuchs.aktiv = true; story.fuchs.obj.visible = true; }
      // modus 'foto' (Live-Befund 29.10.2026: mit 'warten' stand er auf und lief weg, sobald Joshi neben ihm stand – er fehlte im Bild)
      if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: w.x, z: w.z + 0.3, blick: zumRing(lx, z + 0.3), modus: 'foto', sitzt: true });   // zumRing: gemessen (zumRingYaw drehte ihn genau weg)
      // genau auf seinen Platz (das Absetzen sucht einen freien Platz – vor der Tafel wich er bis ans Ende der Reihe aus)
      if(story.fuchs && story.fuchs.obj){ story.fuchs.obj.position.set(w.x, BODEN_Y, w.z + 0.3); story.fuchs.yaw = zumRing(lx, z + 0.3); } continue; }
    if(D.id === 'eich'){ const e = story.mondbasisEichhoernchen && story.mondbasisEichhoernchen(); if(e){ e.position.set(w.x, BODEN_Y + mf.bankY, w.z); e.rotation.y = zumRing(lx, z); } continue; }
    const g = mf.gaeste.find(q => q.D.id === D.id); if(!g) continue;
    g.ziel = null;
    // der Elch hinter der Tafel, die anderen Grossen davor – nicht halb in ihr (Live-Befund 29.10.2026)
    if(D.id === 'elch') g.h.position.set(lx, 0, TAFEL.dz - TAFEL.T / 2 - 0.85);
    else g.h.position.set(lx, kleinAufBank ? mf.bankY : 0, z + (kleinAufBank ? 0 : 0.4));
    g.h.rotation.set(0, zumRing(g.h.position.x, g.h.position.z), 0);
    anim(g, D.id === 'gorilla' ? 'tanz' : 'idle');   // der Gorilla trommelt sich im Sucher auf die Brust (Live-Wunsch 29.10.2026)
    // der kleine Alien hat nur einen Tanz – er drehte sich dabei (Live-Befund 29.10.2026): fuers Foto auf einem Bild angehalten, so gedreht,
    // dass er nach vorn schaut (FOTO_STILL)
    if(FOTO_STILL[D.id] && g.cur){ const S = FOTO_STILL[D.id], a = g.cur; g.mixer.stopAllAction(); a.reset(); a.play(); a.time = S.t; g.mixer.update(0); a.paused = true; g.h.children[0].rotation.y = S.dreh; }
  }
};
// Fuer die Aufnahme selbst (notizbuch.js beiAufnahme): der Gorilla genau in seiner Stehpose (so, wie er auf dem Foto sein soll),
// danach trommelt er weiter
story.mondfestAufnahme = function(an){
  const g = mf.gaeste.find(q => q.D.id === 'gorilla'); if(!g || !g.acts.idle) return;
  if(an){ g.mixer.stopAllAction(); const a = g.acts.idle; a.reset(); a.setEffectiveWeight(1); a.play(); g.mixer.update(0); g.cur = a; }
  else anim(g, 'tanz');
};
story.mondfestFotoFertig = function(){ mf.foto = true; mf.sitzen = false;
  for(const g of mf.gaeste) if(FOTO_STILL[g.D.id]){ if(g.cur) g.cur.paused = false; g.h.children[0].rotation.y = g.D.dreh || 0; }   // tanzt wieder
  if(story.fuchs && story.fuchs.modus === 'foto'){ story.fuchs.modus = 'streifen'; story.fuchs.sitzt = false; story.fuchs.ziel = null; } for(const g of mf.gaeste){ g.ziel = null; g.warte = 1 + Math.random() * 3; } };
const fertigVorher = story.e5StelleFertig;
story.e5StelleFertig = (id) => { if(id === 'fest_foto') story.mondfestFotoFertig(); else if(fertigVorher) fertigVorher(id); };

story.updateMondfest = function(dt){
  if(!mf.an) return;
  mf.t += dt;
  for(const l of (mf.lichter || [])) l.visible = ((l.id + Math.floor(mf.t * 2)) % 3) !== 0;
  if(!mf.mb.drin) return;
  for(const g of mf.gaeste) gastTakt(g, dt);
  // das Eichhoernchen laeuft auf dem Fest mit (eigene Animationen in mondbasis_innen.js)
  if(mf.musik){ mf.musikT += dt; if(mf.musikT > 0.8 && story.figur.ausschlag > 0.05) musikAus(); }
  for(const o of [mf.gitInter, mf.drumInter]) if(o) o.aus = !!mf.musik;
  // Joshi spielt Luftgitarre (er stand eine Weile, story.js): alle tanzen mit (Live-Wunsch 29.10.2026, wie am Strand im SFG)
  const luft = !mf.musik && !mf.sitzen && story.figur && story.figur.cur === 'guitar';
  if(luft !== !!mf.luft){ mf.luft = luft; if(!luft) tanzEnde(); }
  // alles gemacht: einmal der Satz zum Abschied (danach wiederholt ihn die Hinweis-Taste)
  if(!mf.endeGesagt && story.mondfestAllesGemacht() && !mf.musik && !mf.luft && !(story.redetGerade && story.redetGerade()) && !(story.aktionLaeuft && story.aktionLaeuft())){ mf.endeGesagt = true;
    story.spaeter(1.5, () => { if(mf.musik || mf.luft){ mf.endeGesagt = false; return; } story.sprich(T.ende); }); }   // spielt er inzwischen wieder: spaeter
};
})();
