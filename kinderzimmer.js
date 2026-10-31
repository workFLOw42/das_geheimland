// Das Geheimland – Joshis Kinderzimmer und der Traum (Live-Wunsch 28.10.2026, Konzept „Der Rahmen: alles ist ein Traum“).
// Laedt nach huette_innen.js. Etappe 0 (Intro): nach „Los geht's“ steht Joshi in seinem Zimmer – es sieht fast aus wie die
// Huette von innen (dieselbe Einrichtung, huette_innen.js baueRaum('zimmer')), nur: Fuchsi ist ein festes Kuscheltier hinten im
// Bett, es gibt keinen Tisch, dafuer einen groesseren Spielteppich und Spielsachen, und die Tuer ist zu. Joshi kann nur laufen
// (kein Detektivhut, kein X, keine Hinweise ausser „geh ins Bett“); am Bett Y -> er legt sich zu seinem Kuscheltier, die
// Erzaehlerin, dann der Traum-Uebergang (Sternenstrudel, Traumwolken) -> Joshi steht mit Fuchsi draussen
// (Etappe 1). Der Fortschritt (durchgespielte Spiele, ihre Bilder und Trophaeen) bleibt dauerhaft im Browser (story.fortschritt).
(function(){
'use strict';
const story = window.STORY;
const ZIMMER = { x: 0, z: -790, B: 9, T: 7, H: 3.2 };     // wie die Huette (huette_innen.js RAUM), weit davon entfernt; Tuer auf +z (zu)
const BODEN_Y = 150, KOERPER = 0.3, HUELLE = 15;
const kz = story.kinderzimmer = { drin: false, gruppe: null, bett: null, phase: null, t: 0, inter: null, weiter: null, start: null, liegt: false };
const T = {
  // Texte: Live-Wunsch 29.10.2026
  start: ['Es ist spät am Abend. Joshi ist in seinem Zimmer und hat viel gespielt. Er hatte einen tollen Tag. Aber jetzt ist er müde und möchte ins Bett gehen.'],
  hinweis: ['Geh zu deinem Bett und drück Y.'],
  bett: ['Das Bett ist sehr kuschelig und warm. Bestimmt wird Joshi sehr schnell einschlafen und etwas Schönes träumen.'],
  morgen: ['Guten Morgen, Joshi. Es ist Zeit zum Aufstehen. Ich hoffe, Du hattest einen schönen Traum und bist bereit für einen tollen Tag im Kindergarten.'],
};

// ---- Fortschritt (dauerhaft, localStorage; Entscheidung 28.10.2026) -----------------------------------------------------
// { spiele: { 1: { fertig: true, bilder: [{ art, name, bild (JPEG-dataURL) }], trophaeen: ['entchen', ...] } } }
const FORTSCHRITT = 'geheimland.fortschritt';
story.fortschritt = (() => { try { return JSON.parse(localStorage.getItem(FORTSCHRITT) || 'null') || { spiele: {} }; } catch(e){ return { spiele: {} }; } })();
story.fortschrittSpeichern = function(){ try { localStorage.setItem(FORTSCHRITT, JSON.stringify(story.fortschritt)); return true; } catch(e){ console.warn('Fortschritt zu gross', e); return false; } };

// ---- Das Zimmer ---------------------------------------------------------------------------------------------------------
// Spielsachen auf dem Teppich in der Ecke, wo in der Huette der Tisch steht (huette_innen.js ruft das beim Bauen; der Bagger
// kommt von dort): eine Baustelle mit Kran, Pylonen, Absperrung, Sandhaufen und Ziegeln, dazu Autos (Live-Wunsch 28.10.2026)
story.zimmerSpielsachen = function(g, P){
  const farbe = (c) => new THREE.MeshLambertMaterial({ color: c }), add = (m, x, y, z, ry) => { m.position.set(P.x + x, y, P.z + z); if(ry) m.rotation.y = ry; g.add(m); return m; };
  const gelb = farbe(0xf6b80f), dunkel = farbe(0x3a3a3a);
  // Kran: Fuss, Gitterturm, Ausleger mit Gegengewicht, Seil und Haken
  const kran = new THREE.Group(); add(kran, 0.75, 0.03, 0.35, -0.5);
  const fuss = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.34), dunkel); fuss.position.y = 0.04; kran.add(fuss);
  for(const [x, z] of [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]]){ const st = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.95, 0.025), gelb); st.position.set(x, 0.55, z); kran.add(st); }
  for(let i = 0; i < 6; i++){ const q = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.16), gelb); q.position.y = 0.16 + i * 0.16; kran.add(q); }
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.06), gelb); arm.position.set(0.25, 1.05, 0); kran.add(arm);
  const gg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.12), dunkel); gg.position.set(-0.17, 1.0, 0); kran.add(gg);
  const seil = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4), dunkel); seil.position.set(0.6, 0.8, 0); kran.add(seil);
  const haken = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 6, 10, Math.PI * 1.4), farbe(0xd32f2f)); haken.position.set(0.6, 0.53, 0); kran.add(haken);
  // Baustelle: Sandhaufen, Pylonen, rot-weisse Absperrung, ein Stapel Ziegel
  const sand = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), farbe(0xd9b26b)); sand.scale.y = 0.55; add(sand, -0.15, 0.03, -0.45);
  for(const [x, z] of [[-0.6, 0.15], [-0.6, -0.55], [0.25, -0.75], [0.95, -0.55]]){ const p = add(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 12), farbe(0xff6d00)), x, 0.12, z);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.05, 0.035, 12), farbe(0xffffff)); r.position.y = 0.01; p.add(r); }
  const sperre = new THREE.Group(); add(sperre, -0.62, 0.03, -0.2, Math.PI / 2);
  for(const sx of [-0.24, 0.24]){ const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), farbe(0x666666)); b2.position.set(sx, 0.11, 0); sperre.add(b2); }
  for(let i = 0; i < 6; i++){ const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.02), farbe(i % 2 ? 0xffffff : 0xe53935)); l.position.set(-0.225 + i * 0.09, 0.18, 0); sperre.add(l); }
  for(let i = 0; i < 6; i++){ const z = add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.05), farbe(0xb5523a)), 0.1 + (i % 3) * 0.105, 0.055 + Math.floor(i / 3) * 0.05, -0.25); z.rotation.y = 0.2; }
  // Autos: Kipplaster, Polizeiauto, rotes Auto, blaues Auto
  const auto = (x, z, ry, koerper, dach, lang) => { const a2 = new THREE.Group(); add(a2, x, 0.03, z, ry);
    const kk = new THREE.Mesh(new THREE.BoxGeometry(lang || 0.3, 0.08, 0.15), farbe(koerper)); kk.position.y = 0.07; a2.add(kk);
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.07, 0.13), farbe(dach)); d.position.set(-0.02, 0.145, 0); a2.add(d);
    for(const sx of [-1, 1]) for(const sz of [-1, 1]){ const r = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), dunkel); r.rotation.x = Math.PI / 2; r.position.set(sx * (lang || 0.3) * 0.33, 0.035, sz * 0.08); a2.add(r); }
    return a2; };
  const laster = auto(-0.3, 0.6, 0.3, 0xfb8c00, 0xfb8c00, 0.42); const mulde = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.16), farbe(0x9e9e9e)); mulde.position.set(0.08, 0.16, 0); mulde.rotation.z = 0.25; laster.add(mulde);
  const polizei = auto(0.35, 0.75, -0.9, 0xffffff, 0x1565c0); const blau = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.08), farbe(0x2962ff)); blau.position.set(-0.02, 0.195, 0); polizei.add(blau);
  auto(-1.0, 0.75, 1.9, 0xe53935, 0xffcdd2); auto(1.1, 0.95, 0.6, 0x1e88e5, 0xbbdefb);
};
function bauen(){
  if(kz.gruppe || !story.huetteRaumBauen) return;
  const r = story.huetteRaumBauen('zimmer'); if(!r) return;
  const g = r.g; kz.R = r.R; kz.bett = r.R.bett;
  // die Bettdecke (huette_innen.js: 1,15 x 1,5 m) – beim Zudecken legt sich ein Tuch um Joshi (deckeSetzen)
  kz.decke = deckeVon(kz.bett);
  // die Tuer ist zu: ein Holzblatt mit Klinke in der Oeffnung (die Wand ist dort fuer Joshi durchgehend – raumTiefe)
  const tuer = new THREE.Group(); tuer.position.set(0, 0, ZIMMER.T / 2 - 0.04); g.add(tuer);
  const blatt = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.06), new THREE.MeshLambertMaterial({ color: 0x9c6a3c })); blatt.position.y = 1.05; tuer.add(blatt);
  for(const y of [0.55, 1.5]){ const f = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.02), new THREE.MeshLambertMaterial({ color: 0x86592f })); f.position.set(0, y, -0.035); tuer.add(f); }
  const klinke = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), new THREE.MeshLambertMaterial({ color: 0xd8c690 })); klinke.position.set(0.4, 1.0, -0.06); tuer.add(klinke);
  // Fuchsi als Kuscheltier im Bett (eine Kopie des Fuchses, ohne Bewegung). Live-Wunsch 29.10.2026: er SITZT in der oberen Ecke des
  // Betts, am Kopfteil an der langen Wand (x = -0,45), zum Raum, noch 10 % kleiner (0,67 -> 0,6) – Joshi liegt daneben. Die Sitzhaltung
  // kommt aus seiner Sitz-Animation (Fox_Sit2_Idle), einmal angewendet und dann stehen gelassen
  if(story.fuchs && story.fuchs.obj && story.klonSkin){ const k = story.klonSkin(story.fuchs.obj); k.position.set(-0.45, 0.51, -0.82); k.rotation.set(0, Math.PI * 1.95, 0); k.scale.multiplyScalar(0.6);   // etwas mehr zum Zimmer gedreht (Live-Wunsch 29.10.2026)
    const sitz = story.fuchs.acts && story.fuchs.acts['Fox_Sit2_Idle'];
    if(sitz){ const mx = new THREE.AnimationMixer(k); mx.clipAction(sitz.getClip()).play(); mx.update(0.4); }
    k.traverse(m => { if(m.isMesh) m.frustumCulled = false; }); kz.bett.add(k); kz.plusch = k; }
  // Trophaeen-Regal an der rechten Wand (im Buecherregal verschwanden sie zwischen den Buechern): drei Bretter ohne Buecher, wie das Regal
  const tr = new THREE.Group(); tr.position.set(ZIMMER.B / 2 - 0.2, 0, 0.7); tr.rotation.y = -Math.PI / 2; g.add(tr); kz.trophaeenBretter = [];
  const holzT = new THREE.MeshLambertMaterial({ color: 0x8a5a33 }), dunkelT = new THREE.MeshLambertMaterial({ color: 0x5b3a1f });
  for(let i = 0; i < 3; i++){ const br = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.3), holzT); br.position.y = 0.5 + i * 0.55; tr.add(br); kz.trophaeenBretter.push(br); }
  for(const sx of [-1, 1]){ const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.3), dunkelT); s.position.set(sx * 1.0, 0.85, 0); tr.add(s); }
  g.position.set(ZIMMER.x, BODEN_Y, ZIMMER.z); g.visible = false; story.welt(1).add(g); kz.gruppe = g;
  kz.ding = story.ding ? story.ding(g, { welt: 1, typ: 'kinderzimmer' }) : null;
  // Y am Bett (ohne Suchblick): hinlegen
  const bx = ZIMMER.x + kz.bett.position.x, bz = ZIMMER.z + kz.bett.position.z;
  kz.inter = story.interaktion(kz.bett, { name: 'Bett', welt: 1, x: bx + 1.0, z: bz + 0.4, r: 0.6, yx: bx, yz: bz, yHoehe: BODEN_Y - ISLAND_Y + 1.2, aktion: insBett });   // global-ok: Engine
  if(kz.inter){ kz.inter.entdeckt = true; kz.inter.aus = true; }
  erinnerungenZeigen();
}
// Bilder und Trophaeen der schon durchgespielten Spiele (beim ersten Mal ist das Zimmer leer)
function erinnerungenZeigen(){
  const S = story.fortschritt.spiele || {}, bilder = [], tro = [];
  for(const k in S) if(S[k] && S[k].fertig){ bilder.push(...(S[k].bilder || [])); tro.push(...(S[k].trophaeen || [])); }
  if(bilder.length) erinnerungsWand(kz.gruppe, ZIMMER, bilder);
  if(tro.length && story.regalBefuellen) story.regalBefuellen(kz.trophaeenBretter, tro);
}
// Was an die Wand kommt: alle Erinnerungsfotos (Huette, Festtisch, Gorilla, Lama, Weihnachtsfest) und die gemalten Skizzen
const GEMALT = ['Der Steg', 'Das Observatorium', 'Die Mondbasis', 'Die Mondsteine', 'Die Aliens'];
const fuerDieWand = (s) => s && s.bild && (s.art === 'foto' || GEMALT.includes(s.name));
story.wandBilder = (seiten) => (seiten || []).filter(fuerDieWand);
// Plaetze an den Waenden eines Raums wie der Huette (9 x 7 m): Rueckwand, links, rechts, vorn – zwischen Fenstern, Tuer und Bord
const PLAETZE = [[-3.5, 2.05, -1, 0], [3.55, 1.95, -1, 0], [-2.1, 2.45, 0, -1], [2.2, 1.85, 0, -1], [-2.2, 1.9, 0, 1], [-0.6, 1.9, 0, 1], [0.9, 2.0, 0, 1], [-2.6, 1.85, 1, 0], [2.6, 1.85, 1, 0]];
function erinnerungsWand(g, R, seiten){
  const liste = story.wandBilder(seiten).sort((a, b) => (a.art === 'foto' ? 0 : 1) - (b.art === 'foto' ? 0 : 1)).slice(0, PLAETZE.length);
  liste.forEach((s, i) => {
    const [u, y, wand, seite] = PLAETZE[i], foto = s.art === 'foto', bw = foto ? 1.1 : 0.82, bh = bw / 1.5;
    const tex = new THREE.Texture(); const im = typeof s.bild === 'string' ? Object.assign(new Image(), { src: s.bild }) : s.bild;
    tex.image = im; if(im.complete === false) im.onload = () => { tex.needsUpdate = true; }; else tex.needsUpdate = true;
    const b = new THREE.Group();
    const rahmen = new THREE.Mesh(new THREE.BoxGeometry(bw + (foto ? 0.12 : 0.08), bh + (foto ? 0.12 : 0.08), 0.03), new THREE.MeshLambertMaterial({ color: foto ? 0xf6f3ec : 0x7a5230 })); b.add(rahmen);
    const bild = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), new THREE.MeshLambertMaterial({ map: tex, emissive: 0x222222 })); bild.position.z = 0.02; b.add(bild);
    // wand -1: Rueckwand (z = -T/2), 1: vorn; seite -1: links (x = -B/2), 1: rechts
    if(wand){ b.position.set(u, y, wand * (R.T / 2 - 0.03)); b.rotation.y = wand < 0 ? 0 : Math.PI; }
    else { b.position.set(seite * (R.B / 2 - 0.03), y, u); b.rotation.y = seite < 0 ? Math.PI / 2 : -Math.PI / 2; }
    b.userData.keinKoerper = true; g.add(b);
  });
}
story.erinnerungsWand = erinnerungsWand;
// Fortschritt merken (am Ende von Spiel 1): verkleinerte Bilder (600 x 400 JPEG) und die Trophaeen
story.spielFertigMerken = function(nr){
  const bilder = story.wandBilder(story.notizSeiten ? story.notizSeiten() : []).map(s => { const c = document.createElement('canvas'); c.width = 600; c.height = 400;
    try { c.getContext('2d').drawImage(s.bild, 0, 0, 600, 400); return { art: s.art, name: s.name, bild: c.toDataURL('image/jpeg', 0.75) }; } catch(e){ return null; } }).filter(Boolean);
  story.fortschritt.spiele = story.fortschritt.spiele || {};
  story.fortschritt.spiele[nr] = { fertig: true, bilder, trophaeen: story.trophaeenAusSeiten ? story.trophaeenAusSeiten() : [] };
  if(!story.fortschrittSpeichern()){ story.fortschritt.spiele[nr].bilder = bilder.slice(0, 4); story.fortschrittSpeichern(); }
};
// Laufen im Zimmer: Waende rundum, auch vorn (die Tuer ist zu); Moebel ueber objekte.js (story.ding)
function imZimmer(x, z){ return Math.abs(x - ZIMMER.x) < ZIMMER.B / 2 + HUELLE && Math.abs(z - ZIMMER.z) < ZIMMER.T / 2 + HUELLE; }
function tiefe(x, z){ const lx = x - ZIMMER.x, lz = z - ZIMMER.z; return Math.max(0, Math.abs(lx) - (ZIMMER.B / 2 - KOERPER), Math.abs(lz) - (ZIMMER.T / 2 - KOERPER)); }
function frei(x, z){ const t = tiefe(x, z); if(t <= 0) return true; const von = story.schrittVon && story.schrittVon(); return !!von && t <= tiefe(von.x, von.z) + 1e-6; }

// ---- Ablauf -------------------------------------------------------------------------------------------------------------
// Nur laufen (Intro und Outro im Zimmer): kein Hut, kein X, kein Knien, kein Inventar, keine Gitarre (story.js, notizbuch.js)
story.nurLaufen = () => kz.drin || !!kz.halte;   // im Bett (auch in der Huette): auch kein Knien, kein X, kein Inventar
story.zimmerHinweis = () => (kz.drin && !kz.liegt ? T.hinweis : null);
// Neues Spiel (story.js startbildschirm -> weiter): erst das Zimmer, nach dem Traum geht es mit weiter() in Etappe 1
story.introStart = function(weiter){
  bauen(); if(!kz.gruppe || !eva){ weiter(); return; }
  kz.weiter = weiter; kz.start = { x: eva.group.position.x, z: eva.group.position.z, yaw: eva.yaw };
  kz.drin = true; kz.gruppe.visible = true; if(kz.inter) kz.inter.aus = false;
  if(story.fuchs && story.fuchs.obj){ story.fuchs.obj.visible = false; story.fuchs.aktiv = false; }
  eva.group.position.set(ZIMMER.x + 1.2, BODEN_Y, ZIMMER.z + 1.8); eva.yaw = Math.atan2(-(kz.bett.position.x - 1.2), -(kz.bett.position.z - 1.8)); eva.group.rotation.y = eva.yaw;
  evaOrbit = 0; evaPitch = 0; kz.kamSofort = true;                                              // global-ok: Engine
  // entschieden erst, wenn die Ansage drankommt: nur solange Joshi im Zimmer steht (Live-Wunsch 29.10.2026: hing sie in der
  // Warteschlange, kam sie erst beim ersten Betreten der Huette)
  story.spaeter(1.0, () => story.sprich(() => (kz.drin && !kz.liegt && !kz.outro ? T.start : [])));
};
story.introAktiv = () => kz.drin;
story.zimmerOutro = function(abspann){
  bauen(); if(!kz.gruppe || !eva){ if(abspann) abspann(); return; }
  if(story.spielFertigMerken) story.spielFertigMerken(1);
  kz.drin = true; kz.gruppe.visible = true; kz.outro = true;
  const S = story.notizSeiten ? story.notizSeiten() : [];
  if(!kz.erinnert){ kz.erinnert = true; erinnerungsWand(kz.gruppe, ZIMMER, S); if(story.regalBefuellen && story.trophaeenAusSeiten) story.regalBefuellen(kz.trophaeenBretter, story.trophaeenAusSeiten());
    if(story.trophaeenAusSeiten && story.trophaeenAusSeiten().includes('schmetterling') && story.zimmerFalter) story.zimmerFalter(kz.gruppe); }   // er fliegt herum
  if(story.fuchs && story.fuchs.obj){ story.fuchs.obj.visible = false; story.fuchs.aktiv = false; }
  liegtSchon(kz.bett, ZIMMER); kz.kamSofort = true;
  story.spaeter(1.2, () => story.sprich(T.morgen));                                              // Joshi wacht auf (Live-Wunsch 29.10.2026)
  // Y: aufstehen (das Y steht ueber dem Bett), dann noch ein paar Sekunden laufen
  const bx = ZIMMER.x + kz.bett.position.x, bz = ZIMMER.z + kz.bett.position.z;
  const o = story.interaktion(kz.bett, { name: 'Aufstehen', welt: 1, x: bx - 0.1, z: bz + 0.1, r: 0.9, yx: bx, yz: bz, yHoehe: BODEN_Y - ISLAND_Y + 1.6,   // global-ok: Engine
    aktion: (q) => { q.erledigt = true; if(q.zeichen) q.zeichen.visible = false; aufstehen(kz.bett, ZIMMER, () => story.spaeter(8, () => { if(abspann) abspann(); })); } });
  if(o) o.entdeckt = true;
};
story.zimmerAbspannKamera = (an) => { kz.abspann = an; };
function insBett(o){
  if(kz.liegt) return; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
  legen(kz.bett, ZIMMER, kz.decke, T.bett, () => traum(aufwachenDraussen));
}
// Ins Bett (Live-Wunsch 28.10.2026: man sieht es): hingehen, hineinsteigen, auf den Ruecken, zudecken; text danach, danach()
// fruehestens 5 s nach dem Zudecken. Auch fuer das Bett der Huette (heimkehr.js: story.bettLegen)
function deckeVon(bett){ return bett.children.find(m => m.name === 'matratze') || null; }   // die Decke (Tuch) haengt an der Matratze (huette_innen.js)
// Die Decke ist ein weiches Tuch (Live-Wuensche 29.10.2026: vorher hob sich eine Platte; "immer so schoen organisch"; "ans
// Fussende rutschen und dann von unten ueber ihn"): an den Seiten und am Fussende haengt es ueber die Bettkante, vorn der helle
// Umschlag. Drei Lagen, dazwischen wird gleitend gewechselt (deckeSetzen): 0 glatt auf dem leeren Bett, 1 ans Fussende
// geschoben, 2 ueber Joshi. Gemessen an der liegenden Figur (im Bett: Koerper x -0,27..0,14, oben y 0,78, vom Kissen bis z 0,1).
const LIEGEN_VOR = 0.18;   // m: Joshi so weit weg vom Kopfteil (Live-Wuensche 29.10.2026: stiess oben an – 0,08, dann noch 10 cm)
const TUCH = { x0: -0.72, x1: 0.72, z0: -0.6 + LIEGEN_VOR, z1: 1.2, nx: 40, nz: 44, rand: 0.585, fuss: 1.07, matratze: 0.515, koerper: 0.845, mitte: -0.065, vor: LIEGEN_VOR,
  falteL: 0.5 };   // zurueckgeschlagen: auf den letzten 0,5 m vor dem Fussende zusammengeschoben
function tuch(decke){
  if(decke.userData.tuch) return decke.userData.tuch;
  const U = TUCH, geo = new THREE.PlaneGeometry(1, 1, U.nx, U.nz), n = geo.attributes.position.count;
  const flach = new Float32Array(n * 3), falte = new Float32Array(n * 3), drauf = new Float32Array(n * 3), farben = new Float32Array(n * 3), zeile = new Float32Array(n);
  const blau = new THREE.Color(0x3f6fb5), hell = new THREE.Color(0xf2efe6);
  const s = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
  for(let i = 0; i < n; i++){
    const v = 1 - geo.attributes.uv.getY(i); zeile[i] = v;                                         // 0 am Umschlag .. 1 am Fussende
    let x = U.x0 + (U.x1 - U.x0) * geo.attributes.uv.getX(i), z = U.z0 + (U.z1 - U.z0) * v;
    (z < U.z0 + 0.09 ? hell : blau).toArray(farben, i * 3);
    const knitter = 0.009 * Math.sin(x * 23 + z * 7) * Math.sin(z * 17 - x * 5);
    const haengen = (hx, hy, hz) => { const ox = Math.abs(hx) - U.rand, oz = hz - U.fuss;               // ueber die Kante: haengt
      // gleich ueber den Bettkasten hinaus (Live-Befund 29.10.2026: haengend lag sie sonst teils im Rahmen, 1,2 x 2,2 m, und verschwand darunter)
      if(ox > 0) hx = Math.sign(hx) * (U.rand + Math.min(ox * 4, 0.045) + ox * 0.1); if(oz > 0) hz = U.fuss + Math.min(oz * 4, 0.065) + oz * 0.1;
      hy -= Math.max(ox, oz, 0) * 2.6; return [hx, hy, hz]; };   // an den Ecken nicht doppelt tief (sonst spitze Zipfel)
    // leeres Bett: weich auf der Matratze, in der Mitte leicht gebauscht
    flach.set(haengen(x, U.matratze + 0.035 * (1 - s(0.2, 0.55, Math.abs(x - U.mitte))) * (1 - s(0.75, 1.0, z)) + knitter, z), i * 3);
    // zurueckgeschlagen: am Fussende in Wellen zusammengeschoben
    falte.set(haengen(x, U.matratze + 0.03 + 0.07 * Math.pow(Math.sin(v * Math.PI * 3.5), 2) + knitter, U.fuss - U.falteL * (1 - v)), i * 3);
    // ueber Joshi: rund im Querschnitt, am Kinn etwas tiefer (der Kopf bleibt zu sehen), die Fuesse ein kleiner Huegel, dazu Falten
    const hoch = (U.koerper - U.matratze) * (0.82 + 0.18 * s(U.z0, U.z0 + 0.1, z)) + 0.025 * Math.exp(-Math.pow((z - 0.08 - U.vor) / 0.07, 2)) - 0.015 * Math.exp(-Math.pow((z + 0.12 - U.vor) / 0.12, 2));
    drauf.set(haengen(x, U.matratze + hoch * (1 - s(0.15, 0.48, Math.abs(x - U.mitte))) * (1 - s(0.14 + U.vor, 0.4 + U.vor, z)) + knitter, z), i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(farben, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  mesh.position.set(0, 0, 0); mesh.userData.keinKoerper = true; decke.parent.add(mesh);                // Lage wie die Masse oben: im Bett
  // Hoehe der zugedeckten Decke an (x, z) – beim Zudecken bleibt jeder Punkt darueber (nicht durch Joshi hindurch)
  const ueberJoshi = (x, z) => { const hoch = (U.koerper - U.matratze) * (0.82 + 0.18 * s(U.z0, U.z0 + 0.1, z)) + 0.025 * Math.exp(-Math.pow((z - 0.08 - U.vor) / 0.07, 2));
    return U.matratze + hoch * (1 - s(0.15, 0.48, Math.abs(x - U.mitte))) * (1 - s(0.14 + U.vor, 0.4 + U.vor, z)); };
  return (decke.userData.tuch = { mesh, flach, falte, drauf, zeile, ueberJoshi, s: -1 });
}
// lage: 0 glatt (leeres Bett) .. 1 ans Fussende geschoben .. 2 ueber Joshi – dazwischen gleitend
function deckeSetzen(d, lage){
  if(!d) return; const t = tuch(d);
  lage = Math.max(0, Math.min(2, lage)); if(Math.abs(lage - t.s) < 1e-4) return; t.s = lage;
  const a = lage < 1 ? t.flach : t.falte, b = lage < 1 ? t.falte : t.drauf, k = lage < 1 ? lage : lage - 1;
  const p = t.mesh.geometry.attributes.position.array;
  if(lage <= 1) for(let i = 0; i < p.length; i++) p[i] = a[i] + (b[i] - a[i]) * k;
  else for(let i = 0, j = 0; i < t.zeile.length; i++, j += 3){
    // Welle: das Fussende zuerst, der Umschlag zuletzt (Live-Befund 29.10.2026: auf geradem Weg ging die Decke durch Joshi hindurch)
    const q = Math.max(0, Math.min(1, k * 1.7 - (1 - t.zeile[i]) * 0.7)), kk = q * q * (3 - 2 * q);
    const x = a[j] + (b[j] - a[j]) * kk, z = a[j + 2] + (b[j + 2] - a[j + 2]) * kk; let y = a[j + 1] + (b[j + 1] - a[j + 1]) * kk;
    if(kk < 1 && Math.abs(x) < TUCH.rand && z < TUCH.fuss) y = Math.max(y, t.ueberJoshi(x, z) + 0.02);
    p[j] = x; p[j + 1] = y; p[j + 2] = z; }
  t.mesh.geometry.attributes.position.needsUpdate = true; t.mesh.geometry.computeVertexNormals(); t.mesh.geometry.computeBoundingSphere();
}
story.bettDeckeBauen = (bett) => { const d = deckeVon(bett); if(d) deckeSetzen(d, 0); };   // huette_innen.js: gleich beim Bauen
const bettPlatz = (B, base) => { const bx = base.x + B.position.x, bz = base.z + B.position.z;
  return { neben: new THREE.Vector3(bx + 0.95, BODEN_Y, bz + 0.45), liegen: new THREE.Vector3(bx - 0.1, BODEN_Y + 0.70, bz + 0.12 + LIEGEN_VOR) }; };   // 0,70: auf dem runden Kissen (Live-Befund 29.10.2026: 0,66 sank Joshi ein)   // gemessen: Kopf auf dem Kissen (vorn, dahinter Fuchsi)
function legen(B, base, decke, text, danach){
  kz.liegt = true; kz.decke = decke; if(decke && decke.userData.y0 === undefined) decke.userData.y0 = decke.position.y;
  const { neben, liegen } = bettPlatz(B, base), von = eva.group.position.clone(); kz.bettPunkt = liegen.clone();
  const f = story.figur && story.figur.obj; kz.figurDreh = f ? f.rotation.x : 0;
  const yaw0 = eva.yaw, yawHin = Math.atan2(-(neben.x - von.x), -(neben.z - von.z));
  const t0 = performance.now(); let gesagt = !text, zugedeckt = 0, gelandet = 0, sprungYaw = 0, gesprungen = false; kz.gesagt = !text;
  kz.halte = von.clone();
  const w = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
  const F = story.figur, drehung = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
  // Live-Wunsch 29.10.2026: hingehen, dann mit dem Sprung aus dem Stand (Clip 'jump': in der Luft von 0,5 bis 1,05 s) hochspringen,
  // in der Luft drehen und ausgestreckt im Bett landen; die Decke ist da schon ans Fussende gerutscht und kommt danach von unten
  const SPRUNG = 1.3, AB = 0.5, AUF = 1.05;
  (function schritt(){
    const s = (performance.now() - t0) / 1000;
    if(s < SPRUNG){ kz.halte.lerpVectors(von, neben, w(s / SPRUNG)); eva.yaw = drehung(yaw0, yawHin, w(s / 0.5));
      if(story.figurAnim) story.figurAnim('walk', 0.2, 1); deckeSetzen(decke, w((s - 0.6) / 0.7)); }       // hingehen, die Decke rutscht ans Fussende
    else if(!gelandet){ const c = s - SPRUNG;
      if(!gesprungen){ gesprungen = true; sprungYaw = eva.yaw; } if(F && F.acts.jump && F.aktion !== 'jump' && c < AB){ F.aktion = 'jump'; F.aktT = 0; F.mond = null; story.figurAnim('jump', 0.12, 1); }
      if(c < AB){ kz.halte.copy(neben); deckeSetzen(decke, 1); }                                        // in die Knie
      else if(c < AUF){ const k = (c - AB) / (AUF - AB);                                                  // in der Luft: hinueber, drehen, ausstrecken
        kz.halte.lerpVectors(neben, liegen, w(k)); kz.halte.y += Math.sin(Math.PI * k) * 0.08;   // die Hoehe bringt der Sprung-Clip selbst mit
        eva.yaw = drehung(sprungYaw, Math.PI, w(k)); if(f) f.rotation.x = kz.figurDreh + (Math.PI / 2 - kz.figurDreh) * w((k - 0.5) / 0.5); }
      else { gelandet = s; kz.halte.copy(liegen); eva.yaw = Math.PI; if(f) f.rotation.x = Math.PI / 2;      // gelandet, ausgestreckt
        if(F) F.aktion = null; if(story.figurAnim) story.figurAnim('idle', 0.25, 1); } }
    else { if(f) f.rotation.x = Math.PI / 2; kz.halte.copy(liegen);
      const k = w((s - gelandet - 0.2) / 1.1); deckeSetzen(decke, 1 + k);                                // zudecken: von unten ueber ihn
      if(k >= 1 && !zugedeckt) zugedeckt = s;
      if(!gesagt && s > gelandet + 0.4){ gesagt = true; story.sprich(text, () => { kz.gesagt = true; }); }
      if(zugedeckt && kz.gesagt && s - zugedeckt >= 5){ if(danach) danach(); return; } }
    eva.group.rotation.y = eva.yaw;
    requestAnimationFrame(schritt);
  })();
}
story.bettLegen = (B, base, text, danach) => { if(kz.liegt || !eva) return; legen(B, base, deckeVon(B), text, danach); };
// Liegend im Bett, schon zugedeckt (Outro: Joshi wacht auf)
function liegtSchon(B, base){
  kz.liegt = true; kz.decke = deckeVon(B); const d = kz.decke; deckeSetzen(d, 2);
  const { liegen } = bettPlatz(B, base), f = story.figur && story.figur.obj; kz.figurDreh = 0; if(f) f.rotation.x = Math.PI / 2; kz.bettPunkt = liegen.clone();
  kz.halte = liegen.clone(); eva.group.position.copy(liegen); eva.yaw = Math.PI; eva.group.rotation.y = Math.PI;
}
// Aufstehen: aufdecken, aufrichten, neben das Bett
function aufstehen(B, base, danach){
  const { neben, liegen } = bettPlatz(B, base), f = story.figur && story.figur.obj, d = kz.decke, t0 = performance.now();
  const w = (k) => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
  (function schritt(){
    const s = (performance.now() - t0) / 1000;
    if(s < 0.8) deckeSetzen(d, 2 - w(s / 0.8));                                            // zurueckschlagen (ans Fussende)
    else if(s < 2.1){ const k = w((s - 0.8) / 1.3); kz.halte.lerpVectors(liegen, neben, k); if(f) f.rotation.x = Math.PI / 2 * (1 - k); }
    else if(s < 2.8){ if(kz.halte){ aufstehenFigur(true); eva.group.position.copy(neben); } deckeSetzen(d, 1 - w((s - 2.1) / 0.7)); }   // steht: Decke glattziehen
    else { deckeSetzen(d, 0); if(danach) danach(); return; }
    requestAnimationFrame(schritt);
  })();
}
function aufstehenFigur(deckeLassen){ const f = story.figur && story.figur.obj; if(f) f.rotation.x = kz.figurDreh || 0; kz.halte = null; kz.liegt = false; kz.gesagt = false;
  if(!deckeLassen) deckeSetzen(kz.decke, 0); }
// Nach dem Traum: draussen am Feuer, wo startSzene Joshi hingestellt hat; Fuchsi ist wieder lebendig
function aufwachenDraussen(){
  aufstehenFigur(); kz.drin = false; kz.gruppe.visible = false; if(kz.inter) kz.inter.aus = true;
  const s = kz.start; eva.group.position.set(s.x, evaFootY(s.x, s.z), s.z); eva.yaw = s.yaw; eva.group.rotation.y = s.yaw;   // global-ok: Engine
  evaOrbit = 0; evaPitch = 0;                                                                     // global-ok: Engine
  const F = story.insel && story.insel.feuer;
  if(F && story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: F.x - 2.2, z: F.z - 2.3, blick: Math.atan2((F.x - 0.6) - (F.x - 2.2), (F.z + 3.2) - (F.z - 2.3)), modus: 'streifen', sitzt: true, warte: 3 });
  if(story.fuchs && story.fuchs.obj) story.fuchs.obj.visible = true;
  const w = kz.weiter; kz.weiter = null; if(w) w();
}

// ---- Der Traum-Uebergang: Sternenstrudel und Traumwolken (die Mondsichel ist raus, Live-Wunsch 29.10.2026) ---------------------------------------------------
// Ein Bild ueber allem (Canvas): erst wird es dunkelblau, goldene Sterne drehen sich in einem Strudel zur Mitte, weiche Wolken
// ziehen von den Seiten herein; ganz bedeckt -> umsetzen (mitte()), dann oeffnen sich die
// Wolken nach aussen und der Strudel verblasst
const TRAUM_DAUER = 7.0, TRAUM_MITTE = 3.4;
let tc = null;
function traum(mitte){
  if(!tc){ tc = document.createElement('canvas'); tc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:60;pointer-events:none;display:none;'; document.body.appendChild(tc); }
  tc.width = Math.min(1280, innerWidth); tc.height = Math.round(tc.width * innerHeight / innerWidth); tc.style.display = 'block';
  let s = 9; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const sterne = Array.from({ length: 220 }, () => ({ a: rnd() * 6.283, r: 0.1 + rnd() * 0.9, g: 1 + rnd() * 2.6, v: 0.5 + rnd() }));
  const wolken = Array.from({ length: 14 }, (_, i) => ({ seite: i % 2 ? 1 : -1, y: rnd(), g: 0.18 + rnd() * 0.16, v: rnd() }));
  const t0 = performance.now(); let umgesetzt = false;
  (function bild(){
    const t = (performance.now() - t0) / 1000, g = tc.getContext('2d'), W = tc.width, H = tc.height, M = Math.max(W, H);
    const rein = Math.min(1, t / 1.6), raus = t > TRAUM_MITTE + 0.6 ? Math.min(1, (t - TRAUM_MITTE - 0.6) / (TRAUM_DAUER - TRAUM_MITTE - 0.6)) : 0;
    g.clearRect(0, 0, W, H);
    // Himmel
    g.globalAlpha = Math.min(1, t / 1.2) * (1 - raus); g.fillStyle = '#0b1338'; g.fillRect(0, 0, W, H);
    // Sternenstrudel
    for(const st of sterne){ const a = st.a + t * st.v * 1.2, r = st.r * M * 0.75 * (1 - 0.45 * Math.min(1, t / TRAUM_MITTE)) * (1 + raus * 0.8);
      const x = W / 2 + Math.cos(a) * r, y = H / 2 + Math.sin(a) * r * 0.75;
      g.globalAlpha = (0.5 + 0.5 * Math.sin(t * 6 + st.a * 9)) * rein * (1 - raus); g.fillStyle = '#ffe08a';
      g.beginPath(); g.arc(x, y, st.g, 0, 7); g.fill(); }
    // Traumwolken von den Seiten (oeffnen sich wieder)
    const zu = Math.min(1, t / TRAUM_MITTE) * (1 - raus);
    for(const w of wolken){ const x = W / 2 + w.seite * (W * 0.75 - zu * W * (0.42 + w.v * 0.1)), y = H * (0.1 + w.y * 0.8), R = M * w.g;
      g.globalAlpha = 0.85 * Math.min(1, t / 1.0) * (1 - raus);
      const gr = g.createRadialGradient(x, y, R * 0.1, x, y, R); gr.addColorStop(0, 'rgba(235,236,255,0.95)'); gr.addColorStop(1, 'rgba(200,205,245,0)'); g.fillStyle = gr; g.fillRect(x - R, y - R, R * 2, R * 2); }
    g.globalAlpha = 1;
    if(!umgesetzt && t >= TRAUM_MITTE){ umgesetzt = true; mitte(); }
    if(t < TRAUM_DAUER) requestAnimationFrame(bild); else tc.style.display = 'none';
  })();
}
story.traumUebergang = traum;

// ---- Einhaengen ---------------------------------------------------------------------------------------------------------
function hook(){
  const solidOrig = evaSolid, fussOrig = evaFootY, hitsOrig = hitsBuilding;                         // global-ok: Engine
  const hier = (x, z) => kz.drin && locale === 'earth' && imZimmer(x, z);                           // global-ok: Engine
  evaSolid = function(x, z){ if(hier(x, z)) return frei(x, z); return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(hier(x, z)) return BODEN_Y; return fussOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){ if(hier(x, z)) return !frei(x, z); return hitsOrig.apply(this, arguments); };
  // Im Bett (hinlegen, liegen, aufstehen – kz.halte) steht die Figur-Steuerung: kein Laufen, kein Drehen (Live-Wunsch 29.10.2026);
  // die Kamera darf sich weiter umsehen. Auch im Bett der Huette (heimkehr.js)
  const evaOrig = updateEva;                                                                        // global-ok: Engine
  // auch der Stick-Ausschlag auf 0 (Live-Befund 29.10.2026: kam Joshi laufend ans Bett, blieb der letzte Wert stehen – er 'lief' im Bett)
  updateEva = function(){ if(kz.halte && eva){ if(story.figur){ story.figur.tempo = 0; story.figur.ausschlag = 0; } return; } return evaOrig.apply(this, arguments); };   // global-ok: Engine
  // Kamera im Zimmer: hinter Joshi, an den Waenden geklemmt (wie in der Huette die Wand)
  const camOrig = updateCamera, _s = new THREE.Vector3();                                           // global-ok: Engine
  updateCamera = function(){
    if(!((kz.drin || kz.liegt) && eva)) return camOrig.apply(this, arguments);
    if(kz.halte){ eva.group.position.copy(kz.halte); }
    if(!kz.drin && !kz.liegt) return camOrig.apply(this, arguments);                                       // im Bett der Huette: die Bettansicht
    if(kz.abspann && kz.drin){ const a = performance.now() / 9000; camera.position.set(ZIMMER.x + Math.sin(a) * 2.6, BODEN_Y + 2.2, ZIMMER.z + Math.cos(a) * 2.0); camera.up.set(0, 1, 0); camera.lookAt(ZIMMER.x, BODEN_Y + 1.2, ZIMMER.z - 0.5); return; }   // global-ok: Engine
    const p = eva.group.position, yaw = eva.yaw + evaOrbit, mx = ZIMMER.B / 2 - 0.4, mz = ZIMMER.T / 2 - 0.4;   // global-ok: Engine
    if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam; else evaOrbit += (0 - evaOrbit) * Math.min(1, EVA_LOOK_RETURN * dtCam);   // global-ok: Engine
    let L = 3.2; const cx = () => Math.max(ZIMMER.x - mx, Math.min(ZIMMER.x + mx, p.x + Math.sin(yaw) * L)), cz = () => Math.max(ZIMMER.z - mz, Math.min(ZIMMER.z + mz, p.z + Math.cos(yaw) * L));
    // im Bett (ab dem Hinlegen, auch beim Sprung): fest von schraeg oben auf den Liegeplatz – Live-Befund 29.10.2026: hinter Joshi drehte
    // die Kamera beim Sprung mit ihm und sprang in der Luft um
    const B0 = kz.liegt && kz.bettPunkt;
    if(B0) _s.set(B0.x + 1.9, BODEN_Y + 2.4, B0.z + 0.9); else _s.set(cx(), BODEN_Y + 1.9, cz());
    if(kz.kamSofort){ camera.position.copy(_s); kz.kamSofort = false; } else camera.position.lerp(_s, Math.min(1, (B0 ? 2.5 : 5) * dtCam));   // global-ok: Engine
    if(B0){ kz.kamBlick = kz.kamBlick || new THREE.Vector3(p.x, BODEN_Y + 0.9, p.z); kz._bv = kz._bv || new THREE.Vector3(); kz.kamBlick.lerp(kz._bv.set(B0.x, BODEN_Y + 0.55, B0.z - 0.6), Math.min(1, 2.5 * dtCam)); }   // global-ok: Engine
    else kz.kamBlick = null;
    camera.up.set(0, 1, 0); if(B0) camera.lookAt(kz.kamBlick); else camera.lookAt(p.x, BODEN_Y + 0.9, p.z);   // global-ok: Engine
  };
  // Im Zimmer kein Meer und keine Moewen (Live-Wunsch 31.10.2026: Joshi ist noch nicht bzw. nicht mehr auf der Insel) – im Intro
  // bis zum Aufwachen draussen, im Outro ab dem Aufwachen im Zimmer; draussen blendet die Engine sie danach weich ein (AMB_RATE)
  const ambOrig = updateAmbient;                                                                    // global-ok: Engine
  updateAmbient = function(){ const r = ambOrig.apply(this, arguments);
    if(kz.drin && typeof ambGullGain !== 'undefined' && ambGullGain){ ambGullGain.gain.value = 0; if(ambOceanGain) ambOceanGain.gain.value = 0; }   // global-ok: Engine
    return r; };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hook(); };
})();
