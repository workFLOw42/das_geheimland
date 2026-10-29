// Das Geheimland – Etappe 5: in der Mondbasis (Live-Wunsch 26.10.2026, umgebaut am 28.10.2026: drei Raeume). Laedt nach mond.js.
// Hier wohnt das Eichhoernchen. Es langweilt sich furchtbar und sendet darum staendig "HALLO" (das Blinken im Teleskop): Es
// wuenscht sich, dass jemand kommt. Die Geschichte (Konzept.md Etappe 5, Schritte 3-11; SPRECHTEXTE.md):
//   Buero (offen): X zeigt nur das Eichhoernchen; Y: es freut sich, Joshi fragt nach dem Essen, es "weiss nichts" und kann
//     angeblich "gar nicht bis zur Waldinsel oder zum Observatorium schauen" (Luege 1 – durchs Teleskop sieht man es doch,
//     teleskop.js Modus 'mond'); es braucht fuenf Steine (mond.js) -> zurueck: das Labor geht auf.
//   Labor: die Steine auf den langen Tisch; X: Mikroskop und zwei Lupenringe (Spur im Staub, Haarbueschel neben den
//     Reagenzglaesern); im Notizbuch mit A vergleichen -> das Eichhoernchen war am Tisch der Tiere.
//   Gestaendnis (zwei Verplapperer) -> der Computer im Buero: Joshi tippt, draussen morst der Strahler "KOMMT ALLE" ->
//     Joshi: alles schmuecken -> der grosse Saal geht auf (mondfest.js: die Weihnachtsfeier).
// Die Raeume sind eine eigene Welt wie Huette, Hoehle und Observatorium (BODEN_Y = 150, weit weg von der Basis, draussen
// unsichtbar): drei runde Raeume unter Glaskuppeln (geodaetisch, Metallrahmen), dazwischen kurze Gaenge mit Tueren; durch das
// Glas sieht man den Mondboden, Sterne und die Erde.
(function(){
'use strict';
const story = window.STORY;
const e5 = () => story.etappe === 5;
const BODEN_Y = 150;
const AB = { dx: 2600, dz: 0 };                         // Lage: so weit neben der Basis, dass man den schwebenden Raum nie sieht
const TUER = { B: 1.8, H: 2.5 };
// EIN Glasdom (Radius DOM.r, Hoehe DOM.h) ist die Aussenwand; innen trennen feste Waende die Raeume (Live-Wunsch 28.10.2026):
// das Buero vorn (Eingang bei +z), links davon das Labor, hinten ueber die ganze Breite der Saal; rechts vom Buero ein
// geschlossener Bereich ohne Tuer. Waende: WAND.quer (z = const, Buero/Saal), WAND.links / WAND.rechts (x = const, ab WAND.quer nach vorn)
const DOM = { r: 14, h: 8 };
const WAND = { quer: 3, links: -5.5, rechts: 5.5 };      // Live-Wunsch 29.10.2026: das Buero breiter (vorher +-4,5)
// x, z: Bezugspunkt (Mitte) des Raums, r: Radius fuer das Herumlaufen der Gaeste (mondfest.js)
const RAUM = {
  buero: { x: 0, z: 8.5, r: 4 },
  labor: { x: -8.8, z: 7.5, r: 3.6 },
  saal: { x: 0, z: -4, r: 9.5, h: DOM.h },
};
// Tueren in den Innenwaenden (zu, bis die Geschichte so weit ist): Lage der Oeffnung und Blickrichtung ins Nachbarzimmer
const TUEREN = {
  labor: { x: WAND.links, z: 7.5, dreh: -Math.PI / 2 },        // in der linken Buerowand
  saal: { x: 0, z: WAND.quer, dreh: Math.PI },                 // in der Rueckwand des Bueros
};
const P = {                                             // Plaetze relativ zur Mitte des Doms
  eich: { x: 0.6, z: 6.3 },
  teleskop: { x: -2.4, z: 5.6, r: 0.9 },                 // mit Abstand zu den Waenden (Live-Wunsch 29.10.2026)
  tisch2: { x: 3.9, z: 8.8, dreh: -Math.PI / 2 },        // Schreibtisch mit Funkgeraet und Computer (rechts im Buero; Live-Wunsch 29.10.2026: um 180 Grad gedreht)
  labortisch: { x: -9.4, z: 4.6, b: 4.2, t: 1.0, h: 0.9 },
  spur: { x: -6.4, z: 9.0 },                            // Lupenring am Boden: Spur im Staub (von der Tuer zum Tisch)
  haare: { x: -10.4, z: 5.95 },                         // Lupenring vor dem Tisch, bei den Reagenzglaesern
};
const EICH_H = 0.75;                                    // m (stehend)
const mb = story.mondbasis = { drin: false, wechsel: null, sperre: 0, gebaut: false, raum: null, eich: null, mixer: null, acts: {}, cur: null,
  stufe: 'neu', warDrin: false, t: 0, inter: null, tueren: {}, steineAufTisch: [], verglichen: {}, szene: null };
story.mondbasisRaeume = { RAUM, BODEN_Y, DOM, WAND };
// In welchem Raum liegt ein Punkt (story.js gleicherRaum: X sucht nur im Raum, in dem Joshi steht – Live-Wunsch 29.10.2026)
story.raumVon = (x, z) => { if(!e5() || !mb.drin || !mb.mitte) return null; const lx = x - mb.mitte.x, lz = z - mb.mitte.z;
  return lz < WAND.quer ? 'saal' : lx < WAND.links ? 'labor' : lx > WAND.rechts ? 'rechts' : 'buero'; };

// ---- Texte (SPRECHTEXTE.md) -------------------------------------------------------------------------------------------
const T = {
  begruessung: ['Oh! Besuch! Endlich Besuch!', 'Du bist der Erste, der mich hier oben besucht. Vor dir war noch nie jemand da!',
    'Hier oben ist es so einsam und so langweilig. Und endlich hat jemand meine Morsezeichen gesehen!', 'Ich hätte so gern ein bisschen Hilfe. Ich hab nämlich ganz schön viel zu tun.'],
  joshiHilft: ['Ich helfe dir gern! Aber ich hab auch eine Frage.', 'Bei den Tieren ist das ganze Essen gestohlen worden, und ich suche es.',
    'Meine Freundin, das Lama, hat gesagt, dass du vielleicht von hier oben etwas gesehen hast.'],
  weissNichts: ['Davon weiß ich nichts. Von hier oben kann ich gar nicht bis zur Waldinsel oder zum Observatorium schauen.',
    'Aber hilfst du mir? Für mein Experiment brauche ich noch Steine. Draußen liegen fünf Stück. Bringst du sie mir?'],
  nochSteine: ['Draußen liegen noch Steine. Bringst du sie mir?'],
  danke: ['Super, alle fünf Steine! Danke, Joshi!', 'Bring sie bitte ins Labor und leg sie auf den großen Tisch. Die Tür ist jetzt offen.'],
  spurLupe: ['Schau mal, Spuren im Staub!'],
  haarLupe: ['Ein Haarbüschel!'],
  vergleichen: ['Vergleich sie doch mal mit den Spuren vom Tatort.'],
  vergleichStart: ['Schau mal genau hin ...'],
  passtSpur: ['Die Spur passt genau – sie ist auch auf dem Packpapier!'],
  passtSpurTisch: ['Und auf dem Festtisch ist sie auch!'],
  passtHaare: ['Die Haare passen genau zum Fell am Bananenkorb!'],
  passtHaarePapier: ['Und es ist auch dasselbe Fell wie auf dem Packpapier!'],
  beides: ['Jetzt weißt du es: Das Eichhörnchen war am Tisch der Tiere.'],
  frage: ['Eichhörnchen, hast du das Essen der Tiere genommen?'],
  nein: ['Ich? Nein! Ich war schon ganz lange nicht mehr auf der Waldinsel.'],
  moment: ['Moment mal … Ich hab doch gar nicht gesagt, dass das Essen auf der Waldinsel gestohlen wurde!', 'Und am Tisch lagen überall Haare. Genau die gleichen Haare liegen hier in deinem Labor.'],
  // (Live-Wunsch 29.10.2026: es schiebt es auf einen Hamster, den es gar nicht gibt – vorher auf Fuchsi)
  hamster: ['Ähm … die sind bestimmt vom Hamster! Der wohnt nämlich auch hier oben und hat genau so ein Fell.'],
  hamsterNicht: ['Ein Hamster? Du hast doch vorhin gesagt, dass vor mir noch nie jemand hier oben war.',
    'Und diese Haare sind weiß mit rotbraunen Streifen. Genau wie deine!'],
  gestaendnis: ['Du hast recht … Ich war es. Ich hab das ganze Essen genommen.', 'Aber es ist noch alles da, drüben im großen Saal.',
    'Seit Wochen sende ich Signale, aber keiner hat geantwortet, und keiner ist mich besuchen gekommen. Da war ich so sauer, dass ich die anderen Tiere ärgern wollte.',
    'Es tut mir total leid. Hilfst du mir, alles wieder zurückzubringen?'],
  idee: ['Ich verstehe dich. So ganz allein hier oben wäre ich auch traurig.', 'Ich hab vielleicht eine bessere Idee!'],
  funkspruch: ['Hallo Lama. Sag den anderen Tieren Bescheid. Das Weihnachtsessen ist gerettet. Kommt alle zum Mond!'],
  // das Lama antwortet ueber Funk (Live-Wunsch 28.10.2026): angekommen, alle sind schon unterwegs
  lamaFunk: ['Hallo Joshi, hier ist das Lama! Deine Nachricht ist angekommen.', 'Ich hab allen Bescheid gesagt – wir sind schon alle auf dem Weg zum Mond!'],
  schmuecken: ['Jetzt schmücken wir hier alles zusammen. Das wird ein ganz besonderes Weihnachtsfest!'],
  auJa: ['Au ja! Ein richtiges Weihnachtsfest!'],
  tuerZu: ['Die Tür ist verschlossen.'],
  // Hinweis-Taste
  hUmschauen: ['Schau dich mal um. Drück X.'],
  hSprechen: ['Sprich doch mal mit dem Eichhörnchen. Drück Y.'],
  hSteine: ['Schau dich draußen um. Drück X, dann zeigt dir Fuchsi die Steine.'],
  hZurueck: ['Bring die Steine zum Eichhörnchen in die Mondbasis.'],
  hLabor: ['Leg die Steine im Labor auf den großen Tisch.'],
  hLaborX: ['Schau dich im Labor um. Drück X.'],
  hVergleich: ['Schau in deinem Rucksack ins Notizbuch. Bei den neuen Seiten drückst du A.'],
  hFragen: ['Sprich doch noch einmal mit dem Eichhörnchen.'],
  hComputer: ['Geh zum Computer im Büro und drück Y.'],
  hSaal: ['Geh mit dem Eichhörnchen in den großen Saal.'],
};
story.mondbasisText = T;

// ---- Lage --------------------------------------------------------------------------------------------------------------
function mitte(){
  const B = story.e5Zustand && story.e5Zustand.basis; if(!B) return null;
  return { x: B.x + AB.dx, z: B.z + AB.dz };
}
function welt(x, z){ const M = mb.mitte; return { x: M.x + x, z: M.z + z }; }

// ---- Texturen ----------------------------------------------------------------------------------------------------------
function leinwand(w, h, mal){ const c = document.createElement('canvas'); c.width = w; c.height = h; mal(c.getContext('2d'), w, h); return new THREE.CanvasTexture(c); }
const plattenTex = () => leinwand(256, 256, (g, w) => { g.fillStyle = '#9aa3ad'; g.fillRect(0, 0, w, w); g.strokeStyle = '#6f7883'; g.lineWidth = 4;
  for(let i = 0; i <= 4; i++){ g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, w); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); }
  g.fillStyle = '#7d8691'; for(let i = 0; i < 4; i++) for(let j = 0; j < 4; j++){ g.fillRect(i * 64 + 6, j * 64 + 6, 4, 4); g.fillRect(i * 64 + 54, j * 64 + 54, 4, 4); } });
// Draussen hinter dem Glas: oben Sterne und die Erde, unten der Mondboden (Rundum-Bild fuer die grosse Huelle)
function himmelTex(){
  return leinwand(1024, 512, (g, w, h) => {
    g.fillStyle = '#04060d'; g.fillRect(0, 0, w, h);
    let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#ffffff'; for(let i = 0; i < 520; i++) g.fillRect(rnd() * w, rnd() * h * 0.5, rnd() < 0.15 ? 2 : 1, rnd() < 0.15 ? 2 : 1);
    for(const [x, y, r] of [[300, 120, 34], [820, 150, 30]]){ const gr = g.createRadialGradient(x - 9, y - 9, 4, x, y, r); gr.addColorStop(0, '#7fc4ff'); gr.addColorStop(1, '#1f5fb8');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#4caf50'; g.beginPath(); g.ellipse(x - 7, y + 3, 11, 14, 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 12, y - 10, 7, 6, 0, 0, 7); g.fill(); }
    const bg = g.createLinearGradient(0, h * 0.5, 0, h); bg.addColorStop(0, '#7f848b'); bg.addColorStop(1, '#55595f'); g.fillStyle = bg; g.fillRect(0, h * 0.5, w, h * 0.5);
    g.fillStyle = '#6e7379'; g.beginPath(); g.moveTo(0, h * 0.5 + 4); for(let x = 0; x <= w; x += 16) g.lineTo(x, h * 0.5 - 10 * Math.abs(Math.sin(x * 0.013)) - 6 * Math.abs(Math.sin(x * 0.041))); g.lineTo(w, h * 0.5 + 6); g.fill();
  });
}
function bodenAussenTex(){
  const t = leinwand(512, 512, (g, w) => { g.fillStyle = '#7d8187'; g.fillRect(0, 0, w, w); let s = 9; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for(let i = 0; i < 1500; i++){ g.fillStyle = rnd() < 0.5 ? 'rgba(60,60,66,.25)' : 'rgba(220,220,226,.15)'; g.fillRect(rnd() * w, rnd() * w, 2 + rnd() * 3, 2 + rnd() * 3); }
    g.strokeStyle = 'rgba(205,205,212,.4)'; g.lineWidth = 2; for(let i = 0; i < 30; i++){ const x = rnd() * w, y = rnd() * w, r = 6 + rnd() * 22; g.beginPath(); g.arc(x, y, r, 3.4, 6.2); g.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t;
}

// ---- Bauen ------------------------------------------------------------------------------------------------------------
const lam = (o) => new THREE.MeshLambertMaterial(Object.assign({ emissive: 0x2a2e36 }, o));
// Glaskuppel: geodaetische Halbkugel (Ikosaeder, Stufe 3) mit Metallrahmen; am Eingang fehlen die unteren Scheiben
const domY = (x, z) => DOM.h * Math.sqrt(Math.max(0, 1 - (x * x + z * z) / (DOM.r * DOM.r)));
function kuppel(){
  const ico = new THREE.IcosahedronGeometry(1, 3), p = ico.attributes.position, glas = [], kanten = [];
  const offen = (x, y, z) => Math.abs(Math.atan2(x, z)) < 0.1 && y * DOM.h < TUER.H + 0.6;
  for(let i = 0; i < p.count; i += 3){
    const v = [0, 1, 2].map(k => new THREE.Vector3(p.getX(i + k), p.getY(i + k), p.getZ(i + k)));
    const cy = (v[0].y + v[1].y + v[2].y) / 3; if(cy < -0.02) continue;
    if(offen((v[0].x + v[1].x + v[2].x) / 3, cy, (v[0].z + v[1].z + v[2].z) / 3)) continue;
    const w = v.map(q => new THREE.Vector3(q.x * DOM.r, Math.max(0, q.y) * DOM.h, q.z * DOM.r));
    for(const q of w) glas.push(q.x, q.y, q.z);
    for(const [a, b] of [[0, 1], [1, 2], [2, 0]]) kanten.push(w[a].x, w[a].y, w[a].z, w[b].x, w[b].y, w[b].z);
  }
  const g = new THREE.Group(), gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(glas, 3)); gg.computeVertexNormals();
  const scheiben = new THREE.Mesh(gg, new THREE.MeshLambertMaterial({ color: 0xbfe0ff, emissive: 0x1a2a3a, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  scheiben.renderOrder = 2; g.add(scheiben);
  const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute(kanten, 3));
  g.add(new THREE.LineSegments(kg, new THREE.LineBasicMaterial({ color: 0xc9d1db })));
  const n = 96; for(let i = 0; i < n; i++){ const a = i / n * Math.PI * 2; if(Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.08) continue;
    const st = new THREE.Mesh(new THREE.BoxGeometry(DOM.r * Math.PI * 2 / n + 0.02, 0.45, 0.18), lam({ color: 0x8a939e })); st.position.set(Math.sin(a) * DOM.r, 0.225, Math.cos(a) * DOM.r); st.rotation.y = a; g.add(st); }
  return g;
}
// Innenwand bis unter das Glas: die Schnittflaeche des Doms in ihrer Ebene, mit Tueroeffnung (loch: Mitte entlang der Wand)
// achse 'x': Wand bei z = c, laeuft entlang x von a0 bis a1; achse 'z': Wand bei x = c, laeuft entlang z
function innenwand(achse, c, a0, a1, loch){
  const s = new THREE.Shape(), N = 40, hoehe = (u) => achse === 'x' ? domY(u, c) : domY(c, u);
  s.moveTo(a0, 0); for(let i = 0; i <= N; i++){ const u = a0 + (a1 - a0) * i / N; s.lineTo(u, Math.max(0.05, hoehe(u) - 0.05)); } s.lineTo(a1, 0); s.lineTo(a0, 0);
  if(loch !== undefined){ const h = new THREE.Path(); h.moveTo(loch - TUER.B / 2, 0.01); h.lineTo(loch + TUER.B / 2, 0.01); h.lineTo(loch + TUER.B / 2, TUER.H); h.lineTo(loch - TUER.B / 2, TUER.H); h.lineTo(loch - TUER.B / 2, 0.01); s.holes.push(h); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: false }); geo.translate(0, 0, -0.08);
  // dezent graugruen (Live-Wunsch 29.10.2026: vorher fast weiss); die Tueren behalten ihren Ton
  const m = new THREE.Mesh(geo, lam({ color: 0xb4c2b2, emissive: 0x262d27 }));
  // das blaue Band, an der Tueroeffnung unterbrochen (Live-Befund 29.10.2026: es lief quer durch die offene Tuer)
  const stuecke = loch === undefined ? [[a0, a1]] : [[a0, loch - TUER.B / 2 - 0.2], [loch + TUER.B / 2 + 0.2, a1]];
  for(const [u0, u1] of stuecke){ if(u1 - u0 < 0.05) continue; const band = new THREE.Mesh(new THREE.BoxGeometry(u1 - u0, 0.22, 0.2), lam({ color: 0x3d7fd1 })); band.position.set((u0 + u1) / 2, 1.0, 0); m.add(band); }
  const g = new THREE.Group(); g.add(m);
  if(achse === 'x') g.position.z = c; else { g.position.x = c; g.rotation.y = -Math.PI / 2; }
  return g;
}
// Tuer in einer Innenwand: blauer Rahmen; zu = graues Blatt mit rotem Schloss, offen = das Blatt faehrt hoch
function tuerBauen(id, g){
  const D = TUEREN[id], t = new THREE.Group(); t.position.set(D.x, 0, D.z); t.rotation.y = D.dreh;
  for(const sx of [-1, 1]){ const r = new THREE.Mesh(new THREE.BoxGeometry(0.2, TUER.H + 0.1, 0.3), lam({ color: 0x3d7fd1 })); r.position.set(sx * (TUER.B / 2 + 0.1), (TUER.H + 0.1) / 2, 0); t.add(r); }
  const oben = new THREE.Mesh(new THREE.BoxGeometry(TUER.B + 0.4, 0.2, 0.3), lam({ color: 0x3d7fd1 })); oben.position.set(0, TUER.H + 0.1, 0); t.add(oben);
  const blatt = new THREE.Group(); t.add(blatt);
  const b = new THREE.Mesh(new THREE.BoxGeometry(TUER.B, TUER.H, 0.1), lam({ color: 0xb8c0ca })); b.position.y = TUER.H / 2; blatt.add(b);
  const schloss = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.06), new THREE.MeshBasicMaterial({ color: 0xff3030 })); schloss.position.set(TUER.B / 2 - 0.3, 1.15, 0.08); blatt.add(schloss);
  g.add(t);
  // Joshi steht im Buero davor (die Tueren gehen vom Buero ab)
  const vor = { x: D.x - Math.sin(D.dreh) * 1.0, z: D.z - Math.cos(D.dreh) * 1.0 }, w = welt(vor.x, vor.z), y = welt(D.x, D.z);
  const inter = story.interaktion(t, { name: 'Tür', welt: 5, innen: true, x: w.x, z: w.z, r: 0.7, yx: y.x, yz: y.z, yHoehe: TUER.H + 0.5, aktion: tuerZuY });
  if(inter) inter.entdeckt = true;
  mb.tueren[id] = { t, blatt, schloss, offen: false, auf: 0, inter };
}
function tuerZuY(o){ if(o.spricht) return; o.spricht = true; story.sprich(T.tuerZu, () => { o.spricht = false; }); }
function tuerAuf(id){ const d = mb.tueren[id]; if(!d || d.offen) return; d.offen = true; if(d.inter){ d.inter.erledigt = true; if(d.inter.zeichen) d.inter.zeichen.visible = false; } d.schloss.material.color.setHex(0x2ecc40); }
story.mondbasisTuerOffen = (id) => !!(mb.tueren[id] && mb.tueren[id].offen);

function baueRaum(){
  if(mb.gebaut) return; mb.mitte = mitte(); if(!mb.mitte) return; mb.gebaut = true;
  const g = new THREE.Group(); g.position.set(mb.mitte.x, BODEN_Y, mb.mitte.z);
  // draussen: grosse Bodenscheibe (Mondboden) und die Huelle mit Sternen, Erde und Horizont
  const aussen = new THREE.Mesh(new THREE.CircleGeometry(95, 48), lam({ map: bodenAussenTex(), emissive: 0x15171b })); aussen.rotation.x = -Math.PI / 2; aussen.position.y = -0.02; g.add(aussen);
  const huelle = new THREE.Mesh(new THREE.SphereGeometry(110, 48, 24), new THREE.MeshBasicMaterial({ map: himmelTex(), side: THREE.BackSide })); huelle.position.y = -2; g.add(huelle);
  const pt = plattenTex(); pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(7, 7);
  const boden = new THREE.Mesh(new THREE.CircleGeometry(DOM.r + 0.15, 64), lam({ map: pt })); boden.rotation.x = -Math.PI / 2; boden.position.y = 0.01; g.add(boden);
  g.add(kuppel());
  // Innenwaende: quer (Buero/Labor | Saal) mit der Saaltuer, links (Buero | Labor) mit der Labortuer, rechts geschlossen
  const zr = (x) => Math.sqrt(DOM.r * DOM.r - x * x);
  g.add(innenwand('x', WAND.quer, -zr(WAND.quer) + 0.05, zr(WAND.quer) - 0.05, TUEREN.saal.x));
  g.add(innenwand('z', WAND.links, WAND.quer, zr(WAND.links) - 0.05, TUEREN.labor.z));
  g.add(innenwand('z', WAND.rechts, WAND.quer, zr(WAND.rechts) - 0.05));
  // Ausgang: Tuerkasten mit dem Blick nach draussen (wie bisher)
  if(story.tuerKasten){ const tk = story.tuerKasten(himmelTex(), TUER.B + 0.04, TUER.H + 0.03, 1.4); tk.position.set(0, 0, DOM.r - 0.25); g.add(tk); }
  for(const sx of [-1, 1]){ const p = new THREE.Mesh(new THREE.BoxGeometry(0.25, TUER.H, 0.5), lam({ color: 0x3d7fd1 })); p.position.set(sx * (TUER.B / 2 + 0.12), TUER.H / 2, DOM.r); g.add(p); }
  tuerBauen('labor', g); tuerBauen('saal', g);
  bueroBauen(g); laborBauen(g);
  story.welt(5).add(g); mb.raum = g;
  eichLaden();
  if(story.mondfestBauen) story.mondfestBauen(g, mb);               // mondfest.js: der grosse Saal
  innenZeigen(mb.drin);
}
// Buero: Schreibtisch mit Funkgeraet, Computer und der Lampe, die HALLO blinkt; das Teleskop auf einem Podest
function bueroBauen(g){
  const pod = new THREE.Mesh(new THREE.CylinderGeometry(P.teleskop.r, P.teleskop.r + 0.1, 0.3, 24), lam({ color: 0xb4bcc6 })); pod.position.set(P.teleskop.x, 0.15, P.teleskop.z); g.add(pod);
  teleskopLaden(g);
  const S2 = P.tisch2, st2 = new THREE.Group(); st2.position.set(S2.x, 0, S2.z); st2.rotation.y = S2.dreh;
  const sp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 0.9), lam({ color: 0x8a6a48 })); sp.position.y = 0.78; st2.add(sp);
  for(const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.07), lam({ color: 0x5e4630 })); b.position.set(x * 1.0, 0.39, z * 0.38); st2.add(b); }
  const lampe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 10), new THREE.MeshBasicMaterial({ color: 0xff3030 })); lampe.position.set(0.95, 1.55, -0.3); st2.add(lampe);
  const antenne = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.72, 6), lam({ color: 0x9aa3ad })); antenne.position.set(0.95, 1.17, -0.3); st2.add(antenne);
  g.add(st2); mb.lampe = lampe; mb.schreibtisch = st2;
  if(story.funkgeraetSetzen) story.funkgeraetSetzen({ eltern: st2, lokal: { x: 0.55, y: 0.815, z: -0.12 }, dreh: 0 });
  computerLaden(st2);
}
// Labor: der lange Tisch mit Proben, Mikroskop, Reagenzglaesern; dazu die Spur im Staub am Boden und das Haarbueschel
function laborBauen(g){
  const T0 = P.labortisch, tisch = new THREE.Group(); tisch.position.set(T0.x, 0, T0.z);
  const platte = new THREE.Mesh(new THREE.BoxGeometry(T0.b, 0.08, T0.t), lam({ color: 0x8a6a48 })); platte.position.y = T0.h; tisch.add(platte);   // Holz wie der Schreibtisch (Live-Wunsch 29.10.2026)
  for(const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, T0.h, 8), lam({ color: 0x8a939e })); b.position.set(x * (T0.b / 2 - 0.1), T0.h / 2, z * (T0.t / 2 - 0.1)); tisch.add(b); }
  for(let i = 0; i < 4; i++){ const s = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.04, 16), lam({ color: 0xbfe3ff, transparent: true, opacity: 0.7 })); s.position.set(0.2 + i * 0.32, T0.h + 0.06, 0.25); tisch.add(s); }
  g.add(tisch); mb.tisch = tisch;
  mikroskopLaden(tisch, T0.h + 0.04);
  reagenzLaden(tisch, T0.h + 0.04);
  // Spur im Staub: graue Staubflaeche, darin Eichhoernchen-Pfoten (vom Eingang zum Tisch)
  const staub = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(spurBild(512, true)), transparent: true, depthWrite: false }));
  staub.rotation.x = -Math.PI / 2; staub.rotation.z = Math.atan2(P.labortisch.x - P.spur.x, P.labortisch.z - P.spur.z) + Math.PI; staub.position.set(P.spur.x, 0.025, P.spur.z); staub.renderOrder = 1; staub.userData.deko = true; g.add(staub);
  // Haarbueschel auf der Tischkante (klein; unter der Lupe gross)
  const h = haarBueschel(0.35); h.position.set(P.haare.x - P.labortisch.x, T0.h + 0.05, T0.t / 2 - 0.12); tisch.add(h);
  // die Lupenringe dazu (notizbuch.js 'labor_spur', 'labor_haare'): ihre Weltlage gibt es erst jetzt
  if(story.stelleSetzen){ const a = welt(P.spur.x, P.spur.z), b = welt(P.haare.x, P.haare.z); story.stelleSetzen('labor_spur', a.x, a.z); story.stelleSetzen('labor_haare', b.x, b.z); }
}
// Eichhoernchen-Pfoten (wie auf dem Packpapier, observatorium_innen.js): Hinterpfoten mit fuenf langen Zehen, kleine Vorderpfoten
function pfote(g, x, y, s, zehen, lang, farbe){ g.save(); g.translate(x, y); g.fillStyle = farbe;
  g.beginPath(); g.ellipse(0, s * 0.18, s * 0.3, s * 0.26, 0, 0, 7); g.fill();
  for(let i = 0; i < zehen; i++){ const a = (i / (zehen - 1) - 0.5) * 1.8; g.beginPath(); g.ellipse(Math.sin(a) * s * 0.42, -Math.cos(a) * s * 0.36 - (lang ? s * 0.12 : 0), s * (lang ? 0.08 : 0.1), s * (lang ? 0.17 : 0.1), a, 0, 7); g.fill(); }
  g.restore(); }
function spurBild(W, mitStaub, farbe){
  const c = document.createElement('canvas'); c.width = W; c.height = W; const g = c.getContext('2d');
  if(mitStaub){ const gr = g.createRadialGradient(W / 2, W / 2, W * 0.1, W / 2, W / 2, W * 0.5); gr.addColorStop(0, 'rgba(150,146,138,.85)'); gr.addColorStop(1, 'rgba(150,146,138,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, W); }
  const f = farbe || 'rgba(70,64,58,.85)', k = W / 512;
  for(const y0 of [110, 330]){ for(const sx of [-1, 1]){ pfote(g, W / 2 + sx * 52 * k, y0 * k, 70 * k, 5, true, f); pfote(g, W / 2 + sx * 24 * k, (y0 + 90) * k, 40 * k, 4, false, f); } }
  return c;
}
// Haarbueschel: weisse und rotbraune Haare (wie das Fell des Eichhoernchens)
function haarBueschel(L){
  const g = new THREE.Group(), weiss = new THREE.MeshLambertMaterial({ color: 0xf2efe8 }), rot = new THREE.MeshLambertMaterial({ color: 0xa8502a });
  let s = 13; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 22; i++){ const l = L * (0.35 + rnd() * 0.4), h = new THREE.Mesh(new THREE.CylinderGeometry(L * 0.006, L * 0.01, l, 5), i % 3 ? weiss : rot);
    h.rotation.set(Math.PI / 2 + (rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 1.2); h.position.set((rnd() - 0.5) * L * 0.15, L * 0.01, (rnd() - 0.5) * L * 0.08); g.add(h); }
  return g;
}
// Live-Befund 29.10.2026: das Mikroskop war pechschwarz, das Teleskop viel dunkler als im Observatorium – volles Metall ohne
// Umgebungsbild spiegelt nichts (beim Mikroskop steuert dazu eine Textur das Metall). Darum matt wie die eigenen Teile der Basis
// (lam: Lambert mit einem Hauch Eigenlicht) – Textur und Farbe bleiben
function aufhellen(o){
  const matt = (x) => (x && x.isMeshStandardMaterial) ? lam({ map: x.map || null, color: x.color ? x.color.getHex() : 0xffffff, transparent: x.transparent, opacity: x.opacity, side: x.side }) : x;
  o.traverse(m => { if(m.isMesh) m.material = Array.isArray(m.material) ? m.material.map(matt) : matt(m.material); });
}
function teleskopLaden(g){
  if(!window.TELESKOP_GLB || !story.ladeGlb) return;
  story.ladeGlb(window.TELESKOP_GLB, 'Teleskop', (gl) => {
    const o = gl.scene; o.traverse(m => { if(m.isMesh) m.frustumCulled = false; }); o.updateMatrixWorld(true); aufhellen(o);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = 1.6 / Math.max(0.01, sz.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    const h = new THREE.Group(); h.add(o); h.position.set(P.teleskop.x, 0.3, P.teleskop.z); h.rotation.y = -Math.PI / 2 - 0.6; g.add(h); mb.teleskop = h;
    if(!mb.drin) story.sichtTeile(h, false);
    if(mb.stufe !== 'neu') teleskopAnmelden();
  });
}
// Y am Teleskop: der Himmel mit der Erde und vorn die drei Orte (teleskop.js Modus 'mond'); erst nach dem ersten Gespraech
function teleskopAnmelden(){
  if(mb.teleInter || !mb.teleskop) return;
  const p = welt(P.teleskop.x + 0.2, P.teleskop.z + 1.4), q = welt(P.teleskop.x, P.teleskop.z);   // vorn (Richtung Eingang), weg von der Labortuer
  mb.teleInter = story.interaktion(mb.teleskop, { name: 'Teleskop', welt: 5, innen: true, x: p.x, z: p.z, r: 0.6, yx: q.x, yz: q.z, yHoehe: 2.3,
    aktion: () => { if(story.teleskopAuf) story.teleskopAuf('mond'); } });
}
function computerLaden(st2){
  if(!window.COMPUTER_GLB || !story.ladeGlb) return;
  story.ladeGlb(window.COMPUTER_GLB, 'Computer', (gl) => {
    const o = gl.scene; o.traverse(m => { if(m.isMesh) m.frustumCulled = false; }); o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = 0.75 / Math.max(0.01, sz.x, sz.z), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k - 0.35, 0.815 - bb.min.y * k, -c.z * k - 0.05); st2.add(o); mb.computer = o;
    if(!mb.drin) story.sichtTeile(o, false);
    if(mb.stufe === 'idee') computerAnmelden();
  });
}
function computerAnmelden(){
  if(mb.compInter || !mb.computer) return;
  mb.raum.updateMatrixWorld(true); const wp = new THREE.Vector3(); mb.computer.getWorldPosition(wp);
  const dx = mb.mitte.x - wp.x, dz = mb.mitte.z - wp.z, l = Math.hypot(dx, dz) || 1;
  mb.compInter = story.interaktion(mb.computer, { name: 'Computer', welt: 5, innen: true, x: wp.x + dx / l * 1.4, z: wp.z + dz / l * 1.4, r: 0.6, yx: wp.x, yz: wp.z, yHoehe: 1.9, aktion: computerY });
  return mb.compInter;
}
// Hinten links auf dem Labortisch der Staender mit den Reagenzglaesern ("3rd - Chemistry // Old Lab Tubes" von Ringo Gunther)
function reagenzLaden(tisch, y){
  if(!window.REAGENZGLAESER_GLB || !story.ladeGlb) return;
  story.ladeGlb(window.REAGENZGLAESER_GLB, 'Reagenzglaeser', (gl) => {
    const o = gl.scene; o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = 0.3 / Math.max(0.01, sz.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k + (P.haare.x - P.labortisch.x), y - bb.min.y * k, -c.z * k - 0.2); o.rotation.y = 0.15; tisch.add(o);
    if(!mb.drin) story.sichtTeile(o, false);
  });
}
function mikroskopLaden(tisch, y){
  if(!window.MIKROSKOP_GLB || !story.ladeGlb) return;
  story.ladeGlb(window.MIKROSKOP_GLB, 'Mikroskop', (gl) => {
    const o = gl.scene; o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = 0.5 / Math.max(0.01, sz.y), c = bb.getCenter(new THREE.Vector3());
    aufhellen(o);
    o.scale.multiplyScalar(k); o.position.set(-c.x * k + 1.4, y - bb.min.y * k, -c.z * k - 0.1); o.rotation.y = -0.4; tisch.add(o); mb.mikroskop = o;
    if(!mb.drin) story.sichtTeile(o, false);
    if(stufeAb('spuren')) mikroskopAnmelden();
  });
}
// Y am Mikroskop: Experimente aus dem Weltall (mikroskop.js) – im Labor erst, wenn die Steine auf dem Tisch liegen (X zeigt es)
function mikroskopAnmelden(){
  if(mb.mikroInter || !mb.mikroskop) return;
  mb.raum.updateMatrixWorld(true); const wp = new THREE.Vector3(); mb.mikroskop.getWorldPosition(wp);
  mb.mikroInter = story.interaktion(mb.mikroskop, { name: 'Mikroskop', welt: 5, innen: true, x: wp.x, z: wp.z + 1.2, r: 0.5, yx: wp.x, yz: wp.z, yHoehe: P.labortisch.h + 0.9,
    aktion: () => { if(story.mikroskopAuf) story.mikroskopAuf(); } });
}

// ---- Das Eichhoernchen -------------------------------------------------------------------------------------------------
const EA = { stehen: 'Idle', schauen: 'lookaround', rennen: 'run', schlafen: 'sleep', hopsen: 'snow' };
function eichLaden(){
  if(mb.eich || mb.laedt || !window.EICHHOERNCHEN_GLB) return; mb.laedt = true;
  story.ladeGlb(window.EICHHOERNCHEN_GLB, 'Eichhoernchen', (gl) => {
    const o = gl.scene;
    o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; const alt = m.material;
      m.material = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, emissive: 0x1c1c1c, skinning: !!m.isSkinnedMesh }); if(alt.dispose) alt.dispose(); } });
    const mx = new THREE.AnimationMixer(o), st = gl.animations.find(a => a.name === EA.stehen), v = new THREE.Vector3();
    if(st){ mx.clipAction(st).play(); mx.update(0.05); } o.updateMatrixWorld(true);
    const bb = new THREE.Box3(); o.traverse(m => { if(!m.isSkinnedMesh) return; for(let i = 0; i < m.geometry.attributes.position.count; i += 3){ m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); bb.expandByPoint(v); } });
    if(bb.isEmpty()) bb.setFromObject(o);
    const k = EICH_H / Math.max(0.01, bb.max.y - bb.min.y); o.scale.multiplyScalar(k);
    const c = bb.getCenter(new THREE.Vector3()); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    mx.stopAllAction(); mx.uncacheRoot(o);
    const h = new THREE.Group(); h.add(o); h.name = 'Eichhoernchen'; h.userData.agent = true;
    const p = welt(P.eich.x, P.eich.z); h.position.set(p.x, BODEN_Y, p.z); h.rotation.y = 0.3;
    story.welt(5).add(h);
    mb.eich = h; mb.mixer = new THREE.AnimationMixer(o); mb.eichClips = gl.animations;
    for(const [n, name] of Object.entries(EA)){ const a = gl.animations.find(x => x.name === name); if(a) mb.acts[n] = mb.mixer.clipAction(a); }
    eichAnim('stehen');
    // Y beim Eichhoernchen – erst nach dem Umschauen (X zeigt im Buero nur das Eichhoernchen, Live-Wunsch 28.10.2026)
    mb.inter = story.interaktion(h, { name: 'Eichhörnchen', welt: 5, innen: true, x: p.x + 0.3, z: p.z + 1.0, r: 0.8, yx: p.x, yz: p.z, yHoehe: EICH_H + 0.6, rolle: 'eich', aktion: eichY });
    if(!mb.drin) story.sichtTeile(h, false);
  });
}
story.mondbasisEichhoernchen = () => mb.eich;
function eichAnim(n, einmal){
  const a = mb.acts[n]; if(!a || mb.cur === n) return;
  const alt = mb.cur && mb.acts[mb.cur];
  a.reset(); a.setLoop(THREE.LoopRepeat, einmal ? einmal : Infinity); a.clampWhenFinished = !!einmal; a.play();
  if(alt) a.crossFadeFrom(alt, 0.3, false);
  mb.cur = n;
}
story.mondbasisEichAnim = eichAnim;
// das Eichhoernchen an einen anderen Platz (Mitte-Koordinaten), z. B. in den Saal
function eichSetzen(x, z, dreh){ if(!mb.eich) return; const p = welt(x, z); mb.eich.position.set(p.x, BODEN_Y, p.z); if(dreh !== undefined) mb.eich.rotation.y = dreh;
  if(mb.inter){ mb.inter.x = p.x + 0.3; mb.inter.z = p.z + 1.0; mb.inter.yx = p.x; mb.inter.yz = p.z; } }
story.mondbasisEichSetzen = eichSetzen;

// ---- Ablauf -------------------------------------------------------------------------------------------------------------
const STUFEN = ['neu', 'steine', 'labor', 'spuren', 'vergleich', 'ueberfuehrt', 'idee', 'gesendet', 'fest'];
const stufeAb = (s) => STUFEN.indexOf(mb.stufe) >= STUFEN.indexOf(s);
story.mondbasisStufe = () => mb.stufe;
function fuchsZeigt(o){ if(!o || !eva || !story.fuchsRundgang) return; o.entdeckt = false; o.frei = true; story.spaeter(0.6, () => story.fuchsRundgang(eva.group.position.x, eva.group.position.z, true, 0, true, q => q === o)); }
function eichY(o){
  if(o.spricht) return; o.spricht = true;
  const fertig = () => { o.spricht = false; eichAnim('stehen'); };
  const s = mb.stufe;
  if(s === 'neu'){
    mb.stufe = 'steine'; eichAnim('hopsen');
    story.sprich(T.begruessung, () => eichAnim('stehen'), 'eich');
    story.sprich(T.joshiHilft, null, 'joshi');
    story.sprich(T.weissNichts, () => { fertig(); if(story.e5SteineAuslegen) story.e5SteineAuslegen(); teleskopAnmelden(); }, 'eich');
    return;
  }
  if(s === 'steine'){
    if(story.e5SteineAlle && story.e5SteineAlle()){
      mb.stufe = 'labor'; eichAnim('hopsen');
      story.sprich(T.danke, () => { fertig(); tuerAuf('labor'); labortischAnmelden(); }, 'eich');
    } else story.sprich(T.nochSteine, fertig, 'eich');
    return;
  }
  if(s === 'ueberfuehrt'){
    mb.stufe = 'idee'; eichAnim('schauen');
    story.sprich(T.frage, null, 'joshi');
    story.sprich(T.nein, null, 'eich');
    story.sprich(T.moment, null, 'joshi');
    story.sprich(T.hamster, null, 'eich');
    story.sprich(T.hamsterNicht, null, 'joshi');
    story.sprich(T.gestaendnis, null, 'eich');
    // der Computer gleich mit Y (Live-Wunsch 29.10.2026: nicht erst X) – Fuchsi laeuft trotzdem hin und zeigt ihn
    story.sprich(T.idee, () => { fertig(); const c = computerAnmelden() || mb.compInter; if(!c || !eva) return; c.entdeckt = true; c.frei = true;
      if(story.fuchsRundgang) story.spaeter(0.6, () => story.fuchsRundgang(eva.group.position.x, eva.group.position.z, true, 0, true, q => q === c)); }, 'joshi');
    return;
  }
  if(s === 'gesendet'){
    mb.stufe = 'fest';
    story.sprich(T.schmuecken, null, 'joshi');
    // danach eine kurze Schwarzblende (Live-Wunsch 29.10.2026: es ist Zeit vergangen – die Gaeste sind da, dann geht die Saaltuer auf)
    story.sprich(T.auJa, () => { fertig(); kurzSchwarz(() => { if(story.mondfestStart) story.mondfestStart(); }, () => { eichAnim('hopsen'); tuerAuf('saal'); }); }, 'eich');
    return;
  }
  if(s === 'fest' && story.mondfestEichY){ o.spricht = false; story.mondfestEichY(o); return; }
  o.spricht = false;
}
// Labortisch: Y legt die Steine ab (still); danach zeigt X Mikroskop und die beiden Lupenringe
function labortischAnmelden(){
  if(mb.tischInter) return;
  const p = welt(P.labortisch.x + 0.4, P.labortisch.z + 1.3), q = welt(P.labortisch.x + 0.4, P.labortisch.z);
  mb.tischInter = story.interaktion(mb.tisch, { name: 'Labortisch', welt: 5, innen: true, x: p.x, z: p.z, r: 0.7, yx: q.x, yz: q.z, yHoehe: P.labortisch.h + 0.8, aktion: steineAblegen });
  if(mb.tischInter) mb.tischInter.entdeckt = true;
}
function steineAblegen(o){
  if(o.erledigt) return; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
  if(story.ausruestung){ story.ausruestung.steine = 0; if(story.steineNeu) story.steineNeu(); }
  const mat = new THREE.MeshLambertMaterial({ color: 0x9aa0b4, emissive: 0x1e2a44 });
  for(let i = 0; i < 5; i++){ const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1 + (i % 3) * 0.025, 0), mat); s.scale.y = 0.75;
    s.position.set(-0.25 + (i % 3) * 0.24, P.labortisch.h + 0.12 + Math.floor(i / 3) * 0.1, -0.28 + (i % 2) * 0.16); s.rotation.set(i, i * 1.3, 0.4); mb.tisch.add(s); mb.steineAufTisch.push(s); }   // freie Tischmitte, hinten (Live-Befund 29.10.2026: lagen im Reagenzglas-Staender)
  mb.stufe = 'spuren'; mikroskopAnmelden();
}
// Lupenringe im Labor (notizbuch.js 'labor_spur', 'labor_haare'): nach dem Ablegen, nach X
story.e5LaborStelleFrei = () => mb.stufe === 'spuren';
// notizbuch.js meldet fertige Stellen der Etappe 5 (pruefeFall1): hier die beiden Lupen, sonst weiter an mondfest.js / heimflug.js
const fertigVorher = story.e5StelleFertig;
story.e5StelleFertig = (id) => { if(id === 'labor_spur' || id === 'labor_haare') story.e5LaborStelleFertig(id); else if(fertigVorher) fertigVorher(id); };
story.e5LaborStelleFertig = function(id){
  mb.lupen = mb.lupen || {}; mb.lupen[id] = true;
  if(mb.lupen.labor_spur && mb.lupen.labor_haare && mb.stufe === 'spuren'){ mb.stufe = 'vergleich'; story.spaeter(0.6, () => story.sprich(T.vergleichen)); }
};
// Spur unter der Lupe und im Notizbuch
story.e5SpurModell = function(){
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.15, 48), new THREE.MeshLambertMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 512;
    const g = c.getContext('2d'); g.fillStyle = '#8e8b85'; g.fillRect(0, 0, 512, 512); let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for(let i = 0; i < 900; i++){ g.fillStyle = rnd() < 0.5 ? 'rgba(60,58,55,.2)' : 'rgba(220,215,205,.2)'; g.fillRect(rnd() * 512, rnd() * 512, 3, 3); }
    g.drawImage(spurBild(512, false, 'rgba(52,48,44,.9)'), 0, 0); return new THREE.CanvasTexture(c); })() }));
  m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(m); return Promise.resolve({ g, L: 0.3 });
};
function seiteMit(mal){ const W = 1200, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, W, H); mal(g, W, H); g.strokeStyle = 'rgba(60,55,50,.5)'; g.lineWidth = 3; g.strokeRect((W - 680) / 2, (H - 680) / 2, 680, 680); return c; }
story.e5SpurSeite = () => seiteMit((g, W, H) => g.drawImage(spurBild(640, false), (W - 640) / 2, (H - 640) / 2));
story.e5HaarModell = function(){ const h = haarBueschel(0.3), g = new THREE.Group(); g.add(h); return Promise.resolve({ g, L: 0.3 }); };
function haarBild(g, cx, cy, k){ let s = 21; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; g.lineCap = 'round';
  for(let i = 0; i < 40; i++){ const x = cx + (rnd() - 0.5) * 200 * k, y = cy + (rnd() - 0.5) * 120 * k, a = -0.6 + rnd() * 0.4, L = (120 + rnd() * 140) * k;
    g.strokeStyle = i % 3 ? 'rgba(70,64,58,.75)' : 'rgba(168,80,42,.85)'; g.lineWidth = 2 + rnd() * 2;
    g.beginPath(); g.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); g.quadraticCurveTo(x + 14 * k, y - 10 * k, x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); g.stroke(); } }
story.e5HaarSeite = () => seiteMit((g, W, H) => haarBild(g, W / 2, H / 2, 1.3));

// ---- Vergleichen im Notizbuch (wie Etappe 4, observatorium_innen.js) --------------------------------------------------------
// Liegt eine der neuen Seiten offen, steht darauf ein gruenes A. A -> das Buch blaettert zu den Seiten der Funde (ziele, der Reihe
// nach; fehlt eine, wird sie uebersprungen), die neue Zeichnung fliegt jeweils herueber und legt sich mit gruenem Rahmen darauf,
// dann zurueck. Sind beide verglichen: das Eichhoernchen war am Tisch – Fuchsi zeigt es. Live-Wunsch 29.10.2026: die Spur auch mit
// dem Tatort (Festtisch), das Haarbueschel mit dem Fell am Bananenkorb und dem auf dem Packpapier
const VERGLEICHE = [
  { id: 'spur', seite: 'Die Spur im Labor', ziele: [['Das Packpapier', T.passtSpur], ['Der Festtisch', T.passtSpurTisch]], bild: () => spurBild(256, false, 'rgba(45,28,12,1)') },
  { id: 'haare', seite: 'Das Haarbüschel', ziele: [['Gestreiftes Fell', T.passtHaare], ['Das Packpapier', T.passtHaarePapier]], bild: () => { const c = document.createElement('canvas'); c.width = c.height = 256; haarBild(c.getContext('2d'), 128, 128, 0.42); return c; } },
];
const zielVon = (V) => { const z = V.v.ziele.filter(q => seitenIndex(q[0]) >= 0); return z[V.i] || null; };   // das aktuelle Ziel (nur vorhandene Seiten)
const seitenIndex = (name) => story.notizSeiten().findIndex(s => s.name === name);
const offenerVergleich = (lage) => VERGLEICHE.find(v => !mb.verglichen[v.id] && lage && lage.some(q => q.s && q.s.name === v.seite));
const vor = { A: story.buchA, Sperre: story.buchSperre, Tick: story.buchTick, Ueber: story.buchUeber };
story.buchSperre = () => (e5() && !!(mb.vg && !mb.vg.fertig)) || !!(vor.Sperre && vor.Sperre());
story.buchA = function(lage){
  if(!e5()) return vor.A ? vor.A(lage) : false;
  if(mb.stufe !== 'vergleich' || mb.vg) return false;
  const v = offenerVergleich(lage); if(!v) return false;
  mb.vg = { v, phase: 'hin', t: 0, i: 0, bild: v.bild() };
  if(story.gehaltenVergessen){ story.gehaltenVergessen(T.vergleichen); story.gehaltenVergessen(T.hVergleich); }
  story.sprich(T.vergleichStart, null, 'inventar'); return true;
};
story.buchTick = function(dt, lage){
  if(!e5()) return vor.Tick ? vor.Tick(dt, lage) : false;
  if(!lage) return false;
  const V = mb.vg;
  if(!V) return mb.stufe === 'vergleich' && !!offenerVergleich(lage);
  if(V.fertig) return false;
  const Z = zielVon(V); if(!Z && V.phase !== 'zurueck') V.phase = 'zurueck';
  if(V.phase === 'hin'){ if(story.buchZuSeite(seitenIndex(Z[0]))){ V.phase = 'vergleich'; V.t = 0; } return true; }
  if(V.phase === 'vergleich'){ const t0 = V.t; V.t += dt;
    if(t0 < 1.6 && V.t >= 1.6) story.sprich(Z[1], null, 'inventar');
    if(V.t > 4.4){ V.i++; V.phase = zielVon(V) ? 'hin' : 'zurueck'; } return true; }   // weiter zum naechsten Fund, sonst zurueck
  if(V.phase === 'zurueck'){ if(story.buchZuSeite(seitenIndex(V.v.seite))){ V.fertig = true; mb.verglichen[V.v.id] = true; mb.vg = null; vergleichFertig(); } return true; }
  return false;
};
story.buchUeber = function(c, lage){
  if(!e5()){ if(vor.Ueber) vor.Ueber(c, lage); return; }
  if(!lage) return;
  const V = mb.vg;
  if(!V && mb.stufe === 'vergleich'){ const v = offenerVergleich(lage), f = v && lage.find(q => q.s && q.s.name === v.seite); if(!f || !story.knopfTextur) return;
    const a = story.knopfTextur('A').image, g = 90 * (1 + Math.sin(mb.t * 5) * 0.08); c.drawImage(a, f.x + f.w / 2 - g / 2, f.y + f.h + 6, g, g); return; }
  if(!V || V.phase !== 'vergleich') return;
  const Z = zielVon(V), name = Z ? Z[0] : V.v.seite, f = lage.find(q => q.s && q.s.name === name); if(!f) return;
  // die Spur fliegt herueber, dreht sich und legt sich genau auf die Spur des Fundes – wie die des Lamas (observatorium_innen.js,
  // Live-Wunsch 29.10.2026); das Haarbueschel legt sich in die Mitte
  const Q = zielLage(V, name, f), start = { x: f.w * 1.35, y: 0, r: 0, g: f.w * 0.42 };
  const w = (k) => k * k * (3 - 2 * k), k = w(Math.min(1, V.t / 1.6)), alpha = V.t > 3.8 ? Math.max(0, 1 - (V.t - 3.8) / 0.6) : 0.95;
  const p = { x: start.x + (Q.x - start.x) * k, y: start.y + (Q.y - start.y) * k, r: start.r + (Q.r - start.r) * k, g: start.g + (Q.g - start.g) * k }, gr = p.g;
  c.save(); c.translate(f.x + f.w / 2, f.y + f.h / 2); c.rotate(f.dreh || 0); c.translate(p.x, p.y); c.rotate(p.r); c.globalAlpha = alpha;
  c.shadowColor = 'rgba(255,250,235,1)'; c.shadowBlur = 14; c.drawImage(Q.bild, -gr / 2, -gr / 2, gr, gr); c.shadowBlur = 0;
  if(V.t >= 1.6){ const b = 0.55 + 0.45 * Math.abs(Math.sin(V.t * 7)); c.globalAlpha = alpha * b; c.strokeStyle = '#2ecc40'; c.lineWidth = 10;
    if(V.v.id === 'spur') c.strokeRect(-gr * 0.2, -gr * 0.44, gr * 0.4, gr * 0.88); else c.strokeRect(-gr * 0.48, -gr * 0.48, gr * 0.96, gr * 0.96); }   // eng um die Spur
  c.restore();
};
// Wohin die Zeichnung auf der Seite des Fundes muss (Seiten-Pixel, Mitte der Seite = 0, 0): Mitte, Drehung, Groesse, Bild
function zielLage(V, name, f){
  if(V.v.id === 'spur' && name === 'Der Festtisch' && story.spurAufFoto && story.e2SpurWege){
    // Tatortfoto: wie beim Lama aus der Kamera des Fotos und dem Weg der Eichhoernchen-Spur auf dem Tisch (waldinsel.js)
    const s = story.spurAufFoto(story.e2SpurWege.hoernchen);
    if(s){ const dx = s.du * f.w, dy = s.dv * f.h; return { x: (s.u - 0.5) * f.w, y: (s.v - 0.5) * f.h, r: Math.atan2(dx, -dy), g: Math.hypot(dx, dy) / 0.76, bild: tischSpur() }; } }
  // Packpapier (observatorium_innen.js obsPapierSeite): die 512er-Zeichnung 600 von 1200 px breit in der Mitte, die Pfoten 30 px tiefer
  if(V.v.id === 'spur' && name === 'Das Packpapier') return { x: 0, y: 30 / 512 * 0.5 * f.w, r: 0, g: 0.5 * f.w, bild: V.bild };
  return { x: 0, y: 0, r: 0, g: f.w * 0.42, bild: V.bild };
}
// Die Laborspur so, wie die Spur auf dem Festtisch laeuft (waldinsel.js spurenDecal): drei Spruenge, Hinterpfoten vorn, die Spur nimmt
// 0,76 des Bildes ein (Laufrichtung = oben)
let tischSpurC = null;
function tischSpur(){
  if(tischSpurC) return tischSpurC;
  const W = 256, c = document.createElement('canvas'); c.width = c.height = W; const g = c.getContext('2d'), f = 'rgba(45,28,12,1)';
  const [e0, e1] = story.e2SpurWege.hoernchen, k = W * 0.76 / Math.hypot(e1.x - e0.x, e1.z - e0.z);
  for(let i = 0; i <= 2; i++){ const y = W * (0.88 - 0.38 * i);
    for(const sx of [-1, 1]){ pfote(g, W / 2 + sx * 0.11 * k, y - 0.09 * k, 0.2 * k, 5, true, f); pfote(g, W / 2 + sx * 0.05 * k, y + 0.13 * k, 0.11 * k, 4, false, f); } }
  return (tischSpurC = c);
}
function eichAufSpurseite(){
  const s = story.notizSeiten()[seitenIndex('Die Spur im Labor')]; if(!s || s.mitEich || !mb.eich || !story.modellBleistift) return;
  const e = story.modellBleistift(mb.eich, -0.7); if(!e) return; const alt = s.bild, W = alt.width, H = alt.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H * 2 - 40; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, c.width, c.height); g.drawImage(alt, 0, 0); g.drawImage(e, 0, H - 40, W, H);
  s.bild = c; s.mitEich = true;
}
function vergleichFertig(){
  if(!(mb.verglichen.spur && mb.verglichen.haare) || mb.stufe !== 'vergleich') return;
  mb.stufe = 'ueberfuehrt';
  eichAufSpurseite();
  story.sprich(T.beides, null, 'inventar');
  // nach dem Inventar: Fuchsi zeigt das Eichhoernchen
  const warte = () => { if(story.inventarOffen && story.inventarOffen()){ story.spaeter(0.5, warte); return; }
    const o = mb.inter; if(!o || !eva) return; o.entdeckt = true; o.frei = true;                       // gleich mit Y ansprechbar
    if(story.fuchsRundgang) story.fuchsRundgang(eva.group.position.x, eva.group.position.z, true, 0, true, q => q === o); };
  story.spaeter(1.0, warte);
}

// ---- Der Computer und der Strahler --------------------------------------------------------------------------------------
// Y am Computer: auf dem Bildschirm tippt Joshi den Funkspruch (Buchstabe fuer Buchstabe), dann ein Blick nach draussen –
// der Strahler morst "KOMMT ALLE" Richtung Erde, die Erzaehlerin liest den ganzen Satz – und zurueck ins Buero
let schirm = null;
function computerY(o){
  if(o.erledigt || mb.szene) return; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
  if(!schirm){ schirm = document.createElement('div');
    schirm.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(80vw,900px);min-height:34vh;padding:4vh 4vw;box-sizing:border-box;z-index:44;'
      + 'background:#05140a;border:1.6vmin solid #3a3f46;border-radius:2vmin;box-shadow:0 0 0 0.6vmin #8a939e, inset 0 0 6vmin rgba(40,255,120,.12);'
      + 'color:#5dff8c;font:700 3.6vmin/1.5 ui-monospace,Consolas,monospace;text-shadow:0 0 8px rgba(80,255,140,.8);display:none;white-space:pre-wrap;';
    document.body.appendChild(schirm); }
  const satz = 'HALLO LAMA.\nSAG DEN ANDEREN TIEREN BESCHEID.\nDAS WEIHNACHTSESSEN IST GERETTET.\nKOMMT ALLE ZUM MOND!';
  mb.szene = { art: 'tippen', t: 0, satz };
  schirm.textContent = ''; schirm.style.display = 'block';
  // die Erzaehlerin liest schon beim Tippen vor – ihr Satz laeuft ueber die Blende bis zum Strahler weiter (Live-Wunsch 29.10.2026)
  story.spaeter(0.4, () => { mb.funkVorgelesen = true; story.sprich(T.funkspruch, () => { mb.funkVorgelesen = false; }); });
}
function szeneTakt(dt){
  const S = mb.szene; if(!S) return;
  S.t += dt;
  if(S.art === 'tippen'){
    const n = Math.min(S.satz.length, Math.floor(S.t * 14)); schirm.textContent = S.satz.slice(0, n) + (Math.floor(S.t * 3) % 2 ? '▌' : ' ');
    if(S.t > S.satz.length / 14 + 1.6){ schirm.style.display = 'none'; mb.szene = { art: 'blende', t: 0, dann: 'strahler' }; }
    return;
  }
  if(S.art === 'blende'){
    blende(Math.min(1, S.t / 0.4));
    if(S.t > 0.45){
      if(S.dann === 'strahler'){ const Z = story.e5Zustand; if(Z && Z.strahler) Z.strahler.text = 'KOMMT ALLE'; mb.szene = { art: 'strahler', t: 0 }; }
      else { mb.szene = { art: 'zurueck', t: 0 }; }
    }
    return;
  }
  // der Strahler: mindestens 6 s (das Morsen sehen), sonst bis die Erzaehlerin fertig ist, hoechstens 13 s
  if(S.art === 'strahler'){ blende(Math.max(0, 1 - S.t / 0.5)); if(S.t > 13 || (S.t > 6 && !mb.funkVorgelesen)){ mb.szene = { art: 'blende', t: 0, dann: 'buero' }; } return; }
  if(S.art === 'zurueck'){ blende(Math.max(0, 1 - S.t / 0.5)); if(S.t > 0.5){ blende(0); mb.szene = null; mb.stufe = 'gesendet'; story.spaeter(1.2, () => story.sprich(T.lamaFunk, null, 'funk:lama')); } }
}
story.mondbasisSzene = () => !!mb.szene;
// Kamera der Strahler-Szene: vom Mondboden schraeg vor dem Eingang hinauf zum Strahler und seinem Lichtkegel
function szeneKamera(){
  const S = mb.szene, Z = story.e5Zustand; if(!S || S.art !== 'strahler' || !Z || !Z.strahler) return false;
  const st = Z.strahler, T0 = Z.tuer.position, u = Math.min(1, S.t / 13);
  const a = 0.9 + u * 0.5, d = 24 - u * 4;
  camera.position.set(st.x + Math.sin(a) * d, st.y + 2.2 + u * 2, st.z + Math.cos(a) * d);                        // global-ok: Engine
  camera.up.set(0, 1, 0); camera.lookAt(st.x, st.y + 9 + u * 6, st.z);                                            // global-ok: Engine
  return T0 !== null;
}
story.e5BasisHinweis = function(){
  if(!mb.drin) return null;
  const s = mb.stufe, ohneX = (o) => o && !o.entdeckt && !o.frei;
  if(s === 'neu') return ohneX(mb.inter) ? T.hUmschauen : T.hSprechen;
  if(s === 'steine') return story.e5SteineAlle && story.e5SteineAlle() ? T.hSprechen : T.hSteine;
  if(s === 'labor') return T.hLabor;
  if(s === 'spuren') return T.hLaborX;
  if(s === 'vergleich') return T.hVergleich;
  if(s === 'ueberfuehrt' || s === 'gesendet') return T.hFragen;
  if(s === 'idee') return T.hComputer;
  if(s === 'fest') return story.mondfestHinweis ? story.mondfestHinweis() : T.hSaal;
  return null;
};
story.e5SteineGesammelt = () => mb.stufe === 'steine' && story.e5SteineAlle && story.e5SteineAlle();

// ---- Hinein / hinaus (wie die Hoehle: Blende, eigene Welt) --------------------------------------------------------------
const HUELLE = 15, KOERPER = 0.32;
function lokal(x, z){ return { lx: x - mb.mitte.x, lz: z - mb.mitte.z }; }
function imRaum(x, z){ if(!mb.mitte) return false; const { lx, lz } = lokal(x, z); return Math.hypot(lx, lz) < DOM.r + HUELLE; }
function innenZeigen(an){ if(mb.raum) story.sichtTeile(mb.raum, an); if(mb.eich) story.sichtTeile(mb.eich, an); if(story.mondfestZeigen) story.mondfestZeigen(an); }
story.mondbasisInnenZeigen = innenZeigen;
// Wie tief steckt ein Punkt ausserhalb der begehbaren Flaeche? rand = Abstand zu Waenden und Glas. Begehbar: das Buero, das
// Labor und der Saal (je im Dom, durch die Innenwaende getrennt), dazu die offenen Tueroeffnungen und der Ausgang
function aussenTiefe(lx, lz, rand){
  const dom = Math.max(0, Math.hypot(lx, lz) - (DOM.r - rand)), W = WAND, m = rand;
  const buero = Math.max(dom, (W.links + m) - lx, lx - (W.rechts - m), (W.quer + m) - lz);
  const labor = Math.max(dom, lx - (W.links - m), (W.quer + m) - lz);
  const saal = Math.max(dom, lz - (W.quer - m));
  let t = Math.min(Math.max(0, buero), Math.max(0, labor), Math.max(0, saal));
  const halb = TUER.B / 2 - KOERPER - 0.08;
  const rechteck = (x0, x1, z0, z1) => Math.hypot(Math.max(0, x0 - lx, lx - x1), Math.max(0, z0 - lz, lz - z1));
  t = Math.min(t, rechteck(-halb, halb, DOM.r - 1.5, DOM.r + 1.4));                                       // Ausgang (immer offen)
  if(story.mondbasisTuerOffen('saal')) t = Math.min(t, rechteck(TUEREN.saal.x - halb, TUEREN.saal.x + halb, W.quer - 1.2, W.quer + 1.2));
  if(story.mondbasisTuerOffen('labor')) t = Math.min(t, rechteck(W.links - 1.2, W.links + 1.2, TUEREN.labor.z - halb, TUEREN.labor.z + halb));
  return t;
}
const imSaal = (lx, lz) => lz < WAND.quer;
// Hindernisse (Kreise in Mitte-Koordinaten); mondfest.js meldet die des Saals dazu
const HIND = [{ x: P.teleskop.x, z: P.teleskop.z, r: P.teleskop.r + 0.2 }, { x: P.tisch2.x, z: P.tisch2.z, r: 1.15 }, { x: P.eich.x, z: P.eich.z, r: 0.45 },
  { x: P.labortisch.x - 1.4, z: P.labortisch.z, r: 0.75 }, { x: P.labortisch.x - 0.45, z: P.labortisch.z, r: 0.75 }, { x: P.labortisch.x + 0.5, z: P.labortisch.z, r: 0.75 }, { x: P.labortisch.x + 1.45, z: P.labortisch.z, r: 0.75 }];
story.mondbasisHindernisse = HIND;
function raumTiefe(x, z){
  const { lx, lz } = lokal(x, z);
  let t = aussenTiefe(lx, lz, KOERPER + 0.3);
  for(const h of HIND){ if(h.aus) continue; const e = h.r + KOERPER - Math.hypot(lx - h.x, lz - h.z); if(e > t) t = e; }
  return t;
}
story.mondbasisFrei = (lx, lz, r) => aussenTiefe(lx, lz, r || 0.6) <= 0 && !HIND.some(h => !h.aus && Math.hypot(lx - h.x, lz - h.z) < h.r + (r || 0.6));
function raumFrei(x, z){ const t = raumTiefe(x, z); if(t <= 0) return true; const von = story.schrittVon && story.schrittVon(); return !!von && t <= raumTiefe(von.x, von.z) + 1e-6; }
let blendeEl = null;
function blende(w){ if(!blendeEl){ blendeEl = document.createElement('div'); blendeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;'; document.body.appendChild(blendeEl); } blendeEl.style.opacity = String(w); }
story.mondbasisBlende = blende;
// kurze Schwarzblende: 0,5 s ab, im Schwarz mitte(), 1,2 s schwarz, 0,6 s auf, danach danach()
function kurzSchwarz(mitte, danach){
  const t0 = performance.now(); let gemacht = false;
  (function f(){ const s = (performance.now() - t0) / 1000;
    if(s < 0.5) blende(s / 0.5);
    else if(s < 1.7){ blende(1); if(!gemacht){ gemacht = true; if(mitte) mitte(); } }
    else if(s < 2.3) blende(1 - (s - 1.7) / 0.6);
    else { blende(0); if(danach) danach(); return; }
    requestAnimationFrame(f); })();
}
function setzeUm(ziel, wo){
  const g = eva.group;
  if(ziel === 'innen'){
    baueRaum(); if(!mb.raum) return;
    mb.drin = true; innenZeigen(true);
    // in der Schwarzblende einmal von innen rendern (Buero, Labor, Saal): Shader und Texturen jetzt (story.innenRendern)
    if(!mb.gerendert && story.innenRendern){ mb.gerendert = true; for(const R of [RAUM.buero, RAUM.labor, RAUM.saal]) story.innenRendern(mb.mitte.x + R.x, BODEN_Y + 1.6, mb.mitte.z + R.z); }
    const q = wo || { x: 0, z: DOM.r - 2.6, yaw: 0 }, p = welt(q.x, q.z); g.position.set(p.x, BODEN_Y, p.z); eva.yaw = q.yaw;
    story.innen.drin = true; story.innen.wo = 'mondbasis';
    if(!mb.warDrin){ mb.warDrin = true; story.spaeter(0.8, () => { if(mb.stufe === 'neu') eichAnim('hopsen'); story.spaeter(2.4, () => { if(mb.cur === 'hopsen' && !(mb.inter && mb.inter.spricht)) eichAnim('stehen'); }); }); }
  } else {
    mb.drin = false; innenZeigen(false);
    const Z = story.e5Zustand, t = Z && Z.tuer ? Z.tuer.position : null;
    // 7,5 m vor der Luke (Live-Befund 29.10.2026: bei 3 m stand die Kamera hinter Joshi mitten in der Kuppel – "im Nirvana")
    if(t){ const AB = 7.5, by = story.bodenGenau ? story.bodenGenau(t.x, t.z + AB) : null; g.position.set(t.x, by !== null ? by : t.y, t.z + AB); }
    eva.yaw = Math.PI;                                                                          // von der Basis weg (+z)
    story.innen.drin = false; story.innen.wo = null;
    if(story.mondfestDraussen) story.mondfestDraussen();
  }
  g.rotation.y = eva.yaw; evaOrbit = 0; evaPitch = 0;                                           // global-ok: Engine
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(g.position).addScaledVector(back, mb.drin ? 3.4 : 5).add(new THREE.Vector3(0, 2, 0));   // global-ok: Engine
  mb.kamSofort = mb.drin; mb.sperre = 1.0;
  if(story.fuchsZu) story.fuchsZu(ziel);
}
story.mondbasisSetzeUm = setzeUm;
story.e5InDieBasis = () => { if(!mb.wechsel && eva) mb.wechsel = { t: 0, ziel: 'innen', gesetzt: false }; };
function updateWechsel(dt){
  if(!eva) return;
  if(mb.wechsel){ const w = mb.wechsel; w.t += dt;
    if(w.t < 0.35) blende(w.t / 0.35);
    else { if(!w.gesetzt){ w.gesetzt = true; setzeUm(w.ziel, w.wo); } blende(Math.max(0, 1 - (w.t - 0.35) / 0.45)); if(w.t > 0.8){ mb.wechsel = null; blende(0); } }
    return; }
  if(mb.sperre > 0){ mb.sperre -= dt; return; }
  if(!mb.drin) return;
  const p = eva.group.position, { lx, lz } = lokal(p.x, p.z);
  if(!imRaum(p.x, p.z) || p.y < BODEN_Y - 1){ setzeUm('innen'); return; }
  if(lz > DOM.r - 0.1 && Math.abs(lx) < TUER.B / 2 && !(story.aktionLaeuft && story.aktionLaeuft()) && !mb.szene) mb.wechsel = { t: 0, ziel: 'aussen', gesetzt: false };
}
story.mondbasisWechsel = (ziel, wo) => { if(!mb.wechsel && eva) mb.wechsel = { t: 0, ziel, wo, gesetzt: false }; };
// Morse "HALLO" an der Lampe des Funkpults (je Buchstabe abwechselnd rot und blau, wie im Teleskop)
function blinken(){
  if(!mb.lampe || !story.morseLicht) return;
  const f = story.morseLicht(mb.stufe === 'gesendet' || mb.stufe === 'fest' ? 'KOMMT ALLE' : 'HALLO', mb.t);
  mb.lampe.material.color.setHex(f !== null ? f : 0x30343c);
}
// Testzugang ?etappe=5&labor (story.js): nach der Landung aussteigen, hinein, ins Labor; die Steine liegen schon auf dem Labortisch
// (Eichhoernchen getroffen, Steine gesammelt, Teleskop da) – jetzt kommen die Spuren
function laborTest(){
  if(mb.laborTest || !(story.spielstand && story.spielstand.laborTest)) return;
  const Z = story.e5Zustand; if(!Z || (Z.phase !== 'gelandet' && Z.phase !== 'zuFuss')) return;
  if(!eva){ if(typeof evaExit === 'function') evaExit(); return; }                          // global-ok: Engine
  if(!mb.drin){ if(!mb.wechsel) mb.wechsel = { t: 0, ziel: 'innen', gesetzt: false }; return; }
  if(mb.wechsel || !mb.tisch || !mb.tueren.labor) return;
  mb.laborTest = true; mb.stufe = 'labor'; mb.warDrin = true;
  teleskopAnmelden(); tuerAuf('labor'); labortischAnmelden(); if(mb.tischInter) steineAblegen(mb.tischInter);
  const p = welt(P.labortisch.x + 0.4, P.labortisch.z + 2.2); eva.group.position.set(p.x, BODEN_Y, p.z); eva.yaw = 0; eva.group.rotation.y = 0;
  if(story.fuchs && story.fuchs.obj){ story.fuchs.obj.position.set(p.x + 0.9, BODEN_Y, p.z + 0.4); story.fuchs.ziel = null; }
}
story.updateMondbasis = function(dt){
  // Live-Wunsch 29.10.2026: auf dem Weg vom Landeplatz zur Basis nach und nach bauen und vorwaermen (story.vorbereiten) – vorher
  // kam alles beim ersten Betreten auf einmal
  if(e5() && !mb.vorbereitet && !mb.drin && eva && locale === 'moon' && story.vorbereiten && mitte()){ mb.vorbereitet = true;   // global-ok: Engine
    story.vorbereiten(() => { baueRaum(); if(!mb.drin) innenZeigen(false); }, 'basis');
  }
  if(!e5()) return;
  mb.t += dt;
  laborTest();
  updateWechsel(dt);
  szeneTakt(dt);
  if(mb.mixer && mb.drin) mb.mixer.update(dt);
  if(mb.drin) blinken();
  for(const id in mb.tueren){ const d = mb.tueren[id]; if(d.offen && d.auf < 1){ d.auf = Math.min(1, d.auf + dt * 0.8); d.blatt.position.y = d.auf * (TUER.H - 0.05); } }
  if(story.updateMondfest) story.updateMondfest(dt);
  // das Eichhoernchen schaut zu Joshi (auf dem Fest laeuft es selbst herum, mondfest.js)
  if(mb.eich && eva && mb.drin && !mb.eichFrei){ const p = eva.group.position, soll = Math.atan2(p.x - mb.eich.position.x, p.z - mb.eich.position.z);
    let dw = soll - mb.eich.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); mb.eich.rotation.y += dw * Math.min(1, dt * 2.5); }
};

// ---- Hooks: Boden, Grenzen, Kamera im Raum --------------------------------------------------------------------------------
function hookBasis(){
  const solidOrig = evaSolid, fussOrig = evaFootY, hitsOrig = hitsBuilding;                     // global-ok: Engine
  evaSolid = function(x, z){ if(e5() && mb.drin && imRaum(x, z)) return raumFrei(x, z); return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(e5() && mb.drin && imRaum(x, z)) return BODEN_Y; return fussOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){ if(e5() && mb.drin && imRaum(x, z)) return !raumFrei(x, z); return hitsOrig.apply(this, arguments); };
  // Kamera: an den runden Waenden und in den Gaengen geklemmt; in der Strahler-Szene draussen
  const camOrig = updateCamera, _soll = new THREE.Vector3();                                    // global-ok: Engine
  updateCamera = function(){
    if(e5() && szeneKamera()) return;
    if(!(e5() && mb.drin && eva)) return camOrig.apply(this, arguments);
    if(story.mondfestKamera && story.mondfestKamera()) return;                                   // mondfest.js: eigene Kamera (Musik)
    if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam; else evaOrbit += (0 - evaOrbit) * Math.min(1, EVA_LOOK_RETURN * dtCam);   // global-ok: Engine
    const p = eva.group.position, yaw = eva.yaw + evaOrbit, { lx, lz } = lokal(p.x, p.z);
    const gross = imSaal(lx, lz);
    let best = null;
    for(const dw of [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4]){
      for(const L of gross ? [5.2, 4.4, 3.6, 2.8] : [4.0, 3.4, 2.8, 2.4]){ const cx = p.x + Math.sin(yaw + dw) * L, cz = p.z + Math.cos(yaw + dw) * L, q = lokal(cx, cz);
        if(aussenTiefe(q.lx, q.lz, 0.8) <= 0){ best = { cx, cz, L }; break; } }
      if(best) break;
    }
    if(!best) best = { cx: p.x + Math.sin(yaw) * 1.6, cz: p.z + Math.cos(yaw) * 1.6, L: 1.6 };
    _soll.set(best.cx, BODEN_Y + 1.5 + best.L * 0.22, best.cz);
    if(mb.kamSofort){ camera.position.copy(_soll); mb.kamSofort = false; } else camera.position.lerp(_soll, Math.min(1, 6 * dtCam));   // global-ok: Engine
    camera.up.set(0, 1, 0); camera.lookAt(p.x, p.y + 0.7, p.z);                               // global-ok: Engine
  };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookBasis(); };
})();
