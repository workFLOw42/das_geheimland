// Das Geheimland – Etappe 2: die Waldinsel, am Festtisch (Fall 1 "Das Weihnachtsessen", Konzept Abschnitt 7).
// Laedt als letztes Spielskript (nach insel.js: Typ 'lagerfeuer'; nach steg.js), vor der Engine. Aktiv nur, wenn story.etappe === 2 (nach dem Globus und dem Neuladen, siehe
// spielstand in story.js; zum Testen index.html?etappe=2).
// Es ist Tag. Die Insel liegt wie Joshis Insel bei 0, 0 und ist genauso gross (insel.js baut Sand und Gras – hier mit
// Schnee); Joshi kommt mit dem Segelboot an einem Steg an, der genauso gebaut ist wie zu Hause (steg.js). Vom Steg aus
// liegt nahe am Strand eine Lichtung: Lagerfeuer, Festtisch mit Baenken und Resten, ein geschmueckter Weihnachtsbaum,
// rundherum Nadelbaeume mit etwas Schmuck. Am Tisch sitzen die Tiere und sind traurig: das ganze Essen ist weg.
// Jedes Tier erzaehlt bei Y (nach dem Suchblick X) etwas davon (Entwuerfe, SPRECHTEXTE.md).
// Noch nicht hier (naechster Schritt): blauer Fotoring am Tisch (zwei Fussspuren), brauner Lupenring am Waldweg
// (Bananenschale), Gang in den Wald -> Globus zum Gorilla.
(function(){
'use strict';
const story = window.STORY;
const e2 = () => story.etappe === 2;

// ---- Ort -------------------------------------------------------------------------------------
// Alles in Weltkoordinaten, +z = Sueden = zum Steg und aufs Meer (wie auf Joshis Insel). Der Steg liegt bei x 0
// (steg.js), die Lichtung gleich dahinter auf der Wiese; der Wald beginnt rundherum ab WALD_AB.
const LICHTUNG = { x: 0, z: 70, r: 15 };             // freie Flaeche am Strand (Sand bis ~98,6)
const TISCH = { x: 0, z: 68, B: 4.6, T: 1.3, H: 0.78, dreh: 0 };   // laengs x, Joshi kommt von +z
const FEUER = { x: 5.2, z: 73.5 };                   // rechts vorn auf der Lichtung (in der Mitte stand es auf dem Weg vom Steg zum Tisch)
const BAUM = { x: -7.5, z: 64, h: 6.2 };             // Weihnachtsbaum links hinter dem Tisch
const WEG = { x: 7, z: 55 };                         // Eingang des Waldwegs (rechts hinten), dort der braune Lupenring
// Der Weg selbst: festgetretener Schnee von der Lichtung durch den Wald (dort spaeter: Gang zum Gorilla). Baeume halten
// WEG_FREI Abstand zur Linie.
// Live-Wunsch 21.10.2026: an der Lichtung sanft auslaufen und im Wald weiterlaufen, bis er dort verschwindet (nicht
// einfach aufhoeren) – darum reicht die Linie tief in den Wald (bis fast an den Nordrand) und blendet an beiden Enden aus
const WEG_LINIE = [{ x: 4.6, z: 60.2 }, { x: 7, z: 55 }, { x: 11, z: 45 }, { x: 13.5, z: 33 }, { x: 13, z: 20 }, { x: 10, z: 4 }, { x: 12, z: -14 }, { x: 8, z: -34 }];
// Anteil der Laenge, ueber den der Weg am Anfang (aus der Schneewiese heraus: blass und schmal -> voll) bzw. im Wald ausblendet
const WEG_AUS = { anfang: 0.16, ende: 0.25 };
const WEG_FREI = 3.2;
// Live-Wunsch 21.10.2026: am Weg mehr Baeume, links und rechts, der Eingang "ein wenig gruselig, duester und eng" – hohe,
// dunkle Tannen ohne Schnee dicht am Weg (Gasse ~3 m), dahinter weitere; ab dem Ring ein Schatten auf dem Weg
const WEG_GASSE = 2.1;                                 // m von der Wegmitte bis zum Stamm (schmale Tannen, ~1,5 m Radius unten)
const SCHALE = { x: 6.7, z: 55.9, dreh: 0.7 };       // die Bananenschale mit den Ameisen, im Ring (notizbuch.js 'weg_lupe')
const WALD_AB = 22;                                  // m ab der Lichtungsmitte: Nadelbaeume
story.waldinsel = { lichtung: LICHTUNG, tisch: TISCH, feuer: FEUER, baum: BAUM, weg: WEG };

// ---- Tiere am Tisch (Live-Auswahl 21.10.2026: Hase + Hasenbaby, Eule + Elch, Reh + Voegel) ------------------------
// WildPoly3D, CC-BY-NC-4.0, Low-Poly mit Vertexfarben. Fuers Spiel nur die gebrauchten Clips (C:/tmp/gt/tiere.mjs).
// Groessen im Spiel (m, Hoehe in Haltung gemessen, C:/tmp/jfg/test/tiere_verlauf.js – die Ruhepose ist bei Eule, Reh
// und den Voegeln fast nichts): gross = Zielhoehe. Blick im Modell +z. sitz: auf der Bank (y Sitzflaeche) oder
// daneben auf dem Boden ('boden') bzw. auf dem Tisch ('tisch'). Elch: Moose_Sit liegt 0,7 m in der Luft (gemessen) –
// er steht daher am Kopfende (Moose_Idle_A).
// Joshi kommt vom Strand (+z) und steht vor dem Tisch – damit er die Gesichter sieht, sitzen alle auf der Bank auf der
// Waldseite (-z, Bankmitte z = TISCH.z - BANK_Z) und schauen zum Strand; die Kleinen sitzen auf dem Tisch (hinter der
// Tischkante saehe man sie nicht), Elch und Reh stehen (Reh hinter der Bank, Kopf ueber dem Tisch; Elch am Kopfende).
// Nebeneinander je ~0,85 m: so waehlt Joshi das Tier, indem er vor ihm steht (das Y erscheint ueber dem Tier).
// r: Saeule (Grenze) um die Mitte · vor: Standplatz von Joshi (dort zaehlt die Naehe fuers Y, dorthin laeuft der Fuchs
// zum Markieren) · rolle: Stimme (story.js sprich – tierM tief, tierW normal, tierK hoch), damit man sie auseinanderhaelt.
// VORN: Joshis Standplatz vor der vorderen Bank (gemessen: frei ab z 69,5 – C:/tmp/jfg/test/e2_frei.js)
const BANK_Z = TISCH.T / 2 + 0.36, HINTEN = TISCH.z - BANK_Z, VORN = 70.0;
const TIERE = [
  // Elch: Moose_Sit hebt das ganze Modell um 0,7 m an (Wurzelknochen, gemessen) – die Groesse kommt darum aus dem Stehen
  // (mass), die Hoehe aus der Sitzhaltung: er sitzt auf dem Boden (Live-Wunsch 21.10.2026)
  { id: 'elch', glb: 'ELCH_GLB', name: 'Elch', gross: 1.95, clips: ['Moose_Sit'], mass: 'Moose_Idle_A', x: -4.1, z: 67.6, blick: Math.PI / 2 + 0.35, sitz: 'boden', r: 0.8,
    vor: { x: -3.9, z: 69.6 }, rolle: 'tierM',
    text: ['Oh, hallo Joshi. Schön, dass du da bist.', 'Wir wollten heute ein großes Weihnachtsessen feiern. Alle zusammen, hier am Tisch.',
      'Aber als wir kamen, war alles weg. Das ganze Essen!'] },
  { id: 'vogel_meise', glb: 'VOGEL_MEISE_GLB', name: 'Meise', gross: 0.2, clips: ['idle'], x: -2.1, z: TISCH.z + 0.15, blick: -0.3, sitz: 'tisch', r: 0.12, rolle: 'tierK',
    text: ['Piep, piep! Kannst du uns helfen? Du bist doch ein Detektiv.'] },
  { id: 'hase', glb: 'HASE_GLB', name: 'Hase', gross: 0.78, clips: ['Rabbit_idle', 'Rabbit_lookaround'], x: -1.25, z: HINTEN, blick: 0.1, sitz: 'bank', r: 0.28, rolle: 'tierW',
    text: ['Ich hatte so viele Möhren mitgebracht. Und jetzt ist keine einzige mehr da.'] },
  { id: 'hasenbaby', glb: 'HASENBABY_GLB', name: 'Hasenbaby', gross: 0.34, clips: ['idle', 'wash', 'lookaround'], x: -0.4, z: TISCH.z - 0.25, blick: 0, sitz: 'tisch', r: 0.18, rolle: 'tierK',
    text: ['Ich hab so großen Hunger.'] },
  { id: 'reh', glb: 'REH_GLB', name: 'Reh', gross: 1.45, clips: ['Dear_idle', 'Dear_look'], x: 0.45, z: HINTEN - 0.75, blick: 0, sitz: 'boden', r: 0.4, rolle: 'tierW',
    text: ['Wer macht denn so etwas? Der ganze Tisch ist durcheinander.'] },
  { id: 'eule', glb: 'EULE_GLB', name: 'Eule', gross: 0.62, clips: ['idle', 'headtwist'], x: 1.3, z: HINTEN, blick: -0.1, sitz: 'bank', r: 0.26, rolle: 'tierM',
    text: ['Hu-huu. Ich habe die ganze Nacht aufgepasst. Aber gesehen habe ich niemanden.'] },
  { id: 'vogel_blau', glb: 'VOGEL_BLAU_GLB', name: 'blauer Vogel', gross: 0.2, clips: ['idle'], x: 2.15, z: TISCH.z + 0.15, blick: 0.3, sitz: 'tisch', r: 0.12, rolle: 'tierK',
    text: ['Piep! Nicht mal ein Krümel ist übrig geblieben.'] },
];
// Radius des Standplatzes (story.interaktion r; Y zeigt sich bis r + 1,6 m – story.js INTER_Y_R – nimmt aber immer das
// naechste). Die Plaetze liegen ~0,85 m auseinander: wer genau vor einem Tier steht, bekommt dessen Y.
const VOR_R = 0.4;
// Erste Ansage nach dem Aussteigen am Steg (Erzaehlerin, Entwurf): wo man ist und dass die Tiere warten
// Live-Wunsch 22.10.2026: bei der Ankunft nur der erste Satz; was zu tun ist, sagt die Hilfe-Taste (TEXT_HINWEIS_TIERE)
const TEXT_ANKUNFT = ['Du bist auf der Waldinsel angekommen.'];
const TEXT_HINWEIS_TIERE = ['Schau mal, da vorne am Tisch sitzen die Tiere.', 'Sie sehen ganz traurig aus. Geh doch mal hin und hör dir an, was passiert ist.'];
// Der Tisch selbst bekommt im naechsten Schritt den blauen Fotoring (Spur sichern) – jetzt noch kein Y am Tisch
const TEXT_BAUM = ['Ein wunderschön geschmückter Weihnachtsbaum.'];

// ---- Boden: Schnee mit Struktur (Live-Wunsch 21.10.2026: "dem Schnee etwas Struktur geben", weniger grell) ----------
// Zwei Schichten. Unten (insel.js buildIsland nimmt story.winterGras fuer die Grasflaeche): eine gekachelte Schneetextur –
// leicht graublau, mit weichen Mulden (Schatten), feinen Windrippeln und ein paar Grashalmen, die durchschauen. Darueber
// (schneeDecke) eine grosse, einmalige Textur ueber die ganze Insel: getaute Stellen mit gedaempftem Gras und hellere
// Verwehungen – sie bricht die Wiederholung der Kachel auf. Der Sand am Wasser bleibt frei.
function schneeDecke(R){
  const N = 1024, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  let s = 17; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.clearRect(0, 0, N, N);
  const kreis = (x, y, r, innen, aussen) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, innen); gr.addColorStop(1, aussen);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  for(let i = 0; i < 700; i++){
    const x = rnd() * N, y = rnd() * N, d = Math.hypot(x - N / 2, y - N / 2) / (N / 2); if(d > 0.98) continue;
    // nicht auf der Lichtung mit dem Tisch (Mitte der Lichtung bei z 70 -> Bild unten, siehe uv der CircleGeometry)
    const lx = N / 2 + LICHTUNG.x / R * N / 2, ly = N / 2 - LICHTUNG.z / R * N / 2;
    const f = rnd();
    if(f < 0.28 && Math.hypot(x - lx, y - ly) > N * 0.1){ const r = 10 + rnd() * 34;      // getaute Stelle: Gras schaut durch
      kreis(x, y, r, 'rgba(96,112,82,0.55)', 'rgba(96,112,82,0)'); }
    else if(f < 0.7){ const r = 18 + rnd() * 60; kreis(x, y, r, 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)'); }          // Verwehung, heller
    else { const r = 14 + rnd() * 44; kreis(x, y, r, 'rgba(150,170,196,0.22)', 'rgba(150,170,196,0)'); }                  // Mulde, kuehler
  }
  const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.CircleGeometry(R, 64), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.y = ISLAND_Y + 0.01; m.renderOrder = 1; m.userData.begehbar = true;
  return m;
}
let winterGrasMat = null;
story.winterGras = function(){
  if(winterGrasMat) return winterGrasMat;
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  g.fillStyle = '#dfe5ec'; g.fillRect(0, 0, N, N);                 // Grundton: Schnee im Schatten des Waldes, nicht reinweiss
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // weiche Mulden und Huegelchen (licht/schattig) – nahtlos: je Fleck auch an den gegenueberliegenden Raendern
  const fleck = (x, y, r, farbe) => { for(const dx of [-N, 0, N]) for(const dy of [-N, 0, N]){
    const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); gr.addColorStop(0, farbe); gr.addColorStop(1, farbe.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = gr; g.beginPath(); g.arc(x + dx, y + dy, r, 0, 7); g.fill(); } };
  for(let i = 0; i < 60; i++) fleck(rnd() * N, rnd() * N, 30 + rnd() * 70, rnd() < 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(160,178,200,0.28)');
  // Windrippel: feine, leicht geschwungene Linien quer (hell oben, Schatten darunter)
  g.lineWidth = 1.4;
  for(let i = 0; i < 90; i++){ const y0 = rnd() * N, x0 = rnd() * N, L = 40 + rnd() * 110, w = (rnd() - 0.5) * 0.4;
    for(const [dy, farbe] of [[0, 'rgba(255,255,255,0.6)'], [1.6, 'rgba(140,160,186,0.3)']]){
      g.strokeStyle = farbe; g.beginPath();
      for(let k = 0; k <= 12; k++){ const x = x0 + L * k / 12, y = y0 + dy + Math.sin(k * 0.9 + i) * 2.2 + (x - x0) * w;
        k ? g.lineTo(x % N, (y + N) % N) : g.moveTo(x % N, (y + N) % N); }
      g.stroke(); } }
  // ein paar Halme, die aus dem Schnee schauen, und Glitzer
  for(let i = 0; i < 160; i++){ const x = rnd() * N, y = rnd() * N; g.strokeStyle = rnd() < 0.6 ? 'rgba(110,122,88,0.55)' : 'rgba(140,120,84,0.5)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y - 3 - rnd() * 5); g.stroke(); }
  for(let i = 0; i < 500; i++){ g.fillStyle = 'rgba(255,255,255,' + (0.5 + rnd() * 0.5) + ')'; g.fillRect(rnd() * N, rnd() * N, 1, 1); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  winterGrasMat = new THREE.MeshLambertMaterial({ map: t });
  return winterGrasMat;
};
story.winterGrasKachel = 9;                          // m je Wiederholung

// ---- Katalog (objekte.js): erst definieren, dann setzen -----------------------------------------------------------
// Nadelbaum: Stamm (Zylinder) und drei bis vier Kegel, die oberen schneebedeckt; Grenze = Stamm und Kegel in ihrer Form
const nadelMat = [new THREE.MeshLambertMaterial({ color: 0x2f5d3a }), new THREE.MeshLambertMaterial({ color: 0x27503a }), new THREE.MeshLambertMaterial({ color: 0x356b40 })];
const tanneMat = new THREE.MeshLambertMaterial({ vertexColors: true });   // der ganze Baum in einem Mesh (verschmelze)
const dunkelMat = new THREE.MeshLambertMaterial({ color: 0x173326 });      // die Tannen am Waldweg: dunkel, ohne Schnee
const schneeMat = new THREE.MeshLambertMaterial({ color: 0xf4f8ff });
const rindeMat = new THREE.MeshLambertMaterial({ color: 0x5a3c25 });
function baueTanne(p){
  // der Weihnachtsbaum bekommt beim Verschmelzen ein eigenes Material: sein Aufleuchten (Suchblick) soll nicht den ganzen
  // Wald mitnehmen
  const gross = p.schmuck === 'gross';
  const g = new THREE.Group(), h = p.h || 7, n = h > 6 ? 4 : 3, farbe = p.dunkel ? dunkelMat : nadelMat[(p.farbe || 0) % nadelMat.length];
  const stamm = new THREE.Mesh(new THREE.CylinderGeometry(0.13 * h / 7, 0.2 * h / 7, h * 0.3, 7), rindeMat);
  stamm.position.y = h * 0.15; g.add(stamm);
  // schmal (Waldweg): hohe, enge Tannen – sonst sperrten die unteren Kegel (bei 9 m ~2,5 m Radius) die Gasse ganz zu
  const breite = p.schmal ? 0.17 : 0.3;
  for(let i = 0; i < n; i++){
    const k = i / n, r = (0.95 - k * 0.6) * h * breite, hh = h * (0.42 - k * 0.06), y = h * (p.schmal ? 0.14 : 0.2) + k * h * 0.58;
    const kegel = new THREE.Mesh(new THREE.ConeGeometry(r, hh, 8), farbe); kegel.position.y = y + hh / 2; kegel.rotation.y = i * 0.7; g.add(kegel);
    // Schnee: eine flachere, etwas kleinere Kappe auf dem oberen Teil jedes Kegels (wenig Schnee)
    if(p.schnee !== false){ const kap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.62, hh * 0.42, 8), schneeMat);
      kap.position.y = y + hh * 0.79; kap.rotation.y = i * 0.7 + 0.2; kap.userData.keinKoerper = true; g.add(kap); }
  }
  if(p.schmuck) schmueckeBaum(g, h, n, p.schmuck);
  verschmelze(g, gross ? tanneMat.clone() : tanneMat);
  return g;
}
// Ein Baum aus 8-15 Teilen waeren im ganzen Wald weit ueber tausend Zeichenaufrufe (gemessen 758 – zu viel fuers Tablet).
// Darum wird jeder Baum EIN Mesh: alle Teile (Stamm, Nadeln, Schnee, Kugeln, Stern, Geschenke) mit ihrer Farbe als
// Vertexfarbe in eine Geometrie. Die Grenze dieses Meshes vermisst objekte.js in Scheiben – sie folgt so der Kegelform
// (Schnee und Kugeln liegen innerhalb der Kegel). Nur die Lichterketten bleiben einzeln (sie funkeln).
function verschmelze(g, mat){
  g.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), teile = [], weg = [], m4 = new THREE.Matrix4();
  g.traverse(o => {
    if(!o.isMesh || o.userData.lichterkette) return;
    const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(m4.multiplyMatrices(inv, o.matrixWorld));
    teile.push({ geo, farbe: o.material.color }); weg.push(o);
  });
  for(const o of weg){ o.parent.remove(o); o.geometry.dispose(); }
  const n = teile.reduce((s, q) => s + q.geo.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let i = 0;
  for(const { geo, farbe } of teile){
    const c = geo.attributes.position.count;
    pos.set(geo.attributes.position.array, i * 3); nor.set(geo.attributes.normal.array, i * 3);
    for(let k = 0; k < c; k++) col.set([farbe.r, farbe.g, farbe.b], (i + k) * 3);
    i += c; geo.dispose();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; g.add(m);
}
// Schmuck: Kugeln am unteren Rand der Kegel; beim grossen Baum dazu eine Lichterkette (selbstleuchtend) und ein Stern
const KUGEL_FARBEN = [0xd83a3a, 0xf2c230, 0x3a7bd8, 0xe8e8f0, 0xc040c8];
const kugelMat = KUGEL_FARBEN.map(f => new THREE.MeshLambertMaterial({ color: f, emissive: 0x222222 }));   // geteilt: verschmelzen je Farbe
function schmueckeBaum(g, h, n, art){
  let s = Math.round(h * 100); const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const voll = art === 'gross';
  for(let i = 0; i < n; i++){
    const k = i / n, r = (0.95 - k * 0.6) * h * 0.3, y = h * 0.2 + k * h * 0.58;
    const anzahl = voll ? 9 - i : 3;
    for(let j = 0; j < anzahl; j++){
      const a = j / anzahl * Math.PI * 2 + rnd() * 0.5 + i, rr = r * 0.9;
      const kugel = new THREE.Mesh(new THREE.SphereGeometry(voll ? 0.11 : 0.09, 10, 8), kugelMat[(i * 3 + j) % kugelMat.length]);
      kugel.position.set(Math.cos(a) * rr, y + 0.08, Math.sin(a) * rr); kugel.userData.keinKoerper = true; g.add(kugel);
    }
    if(voll){
      // Lichterkette: kleine warme Lichtpunkte in einer Spirale um den Kegel
      for(let j = 0; j < 14; j++){ const a = j / 14 * Math.PI * 2 * 1.3 + i * 1.1, t = j / 14, rr = r * (0.95 - t * 0.5), hh = h * (0.42 - k * 0.06);
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffe08a }));
        l.position.set(Math.cos(a) * rr, y + hh * t * 0.9 + 0.1, Math.sin(a) * rr); l.userData.keinKoerper = true; l.userData.lichterkette = true; g.add(l); }
    }
  }
  if(voll){
    // Stern auf der Spitze (flach, beidseitig, leuchtend gelb)
    const st = new THREE.Shape();
    for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 0.14 : 0.34; i ? st.lineTo(Math.cos(a) * rr, -Math.sin(a) * rr) : st.moveTo(Math.cos(a) * rr, -Math.sin(a) * rr); }
    const stern = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: 0.06, bevelEnabled: false }), new THREE.MeshLambertMaterial({ color: 0xffd23f, emissive: 0xb08a10 }));
    stern.geometry.center(); stern.position.y = h * 0.2 + h * 0.58 * (n - 1) / n + h * (0.42 - (n - 1) / n * 0.06) + 0.25; stern.userData.keinKoerper = true; g.add(stern);
    // Geschenke unter dem Baum (Quader mit Schleife)
    for(const [x, z, b, f] of [[0.9, 0.5, 0.45, 0xd83a3a], [-0.7, 0.8, 0.38, 0x3a7bd8], [0.2, 1.05, 0.32, 0x5ab04a]]){
      const p = new THREE.Mesh(new THREE.BoxGeometry(b, b * 0.75, b), new THREE.MeshLambertMaterial({ color: f })); p.position.set(x, b * 0.375, z); g.add(p);
      const band = new THREE.Mesh(new THREE.BoxGeometry(b * 1.02, b * 0.77, 0.06), new THREE.MeshLambertMaterial({ color: 0xf2c230 })); band.position.copy(p.position); band.userData.keinKoerper = true; g.add(band);
      const band2 = band.clone(); band2.rotation.y = Math.PI / 2; g.add(band2);
    }
  }
}
// Festtisch mit zwei Baenken (laengs x): Platte, Beine, darauf Reste – umgefallene Becher, leere Teller, Kruemel,
// eine leere Schuessel, ein paar Tannenzweige als Schmuck. Grenze: jedes Teil in seiner Form (der Fuchs geht unter
// dem Tisch durch).
const holzMat = new THREE.MeshLambertMaterial({ color: 0x8a5a33 }), holzDunkel = new THREE.MeshLambertMaterial({ color: 0x5b3a1f });
function baueFesttisch(){
  const g = new THREE.Group(), B = TISCH.B, T = TISCH.T, H = TISCH.H;
  const platte = new THREE.Mesh(new THREE.BoxGeometry(B, 0.07, T), holzMat); platte.position.y = H - 0.035; g.add(platte);
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){
    const bein = new THREE.Mesh(new THREE.BoxGeometry(0.09, H - 0.07, 0.09), holzDunkel); bein.position.set(sx * (B / 2 - 0.2), (H - 0.07) / 2, sz * (T / 2 - 0.15)); g.add(bein);
  }
  // Baenke: laengs, je 0,45 m hoch, 0,32 m tief, 0,25 m neben der Tischkante
  for(const sz of [-1, 1]){
    const bank = new THREE.Mesh(new THREE.BoxGeometry(B, 0.06, 0.32), holzMat); bank.position.set(0, 0.42, sz * (T / 2 + 0.36)); g.add(bank);
    for(const sx of [-1, 1]){ const f = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.39, 0.26), holzDunkel); f.position.set(sx * (B / 2 - 0.25), 0.195, sz * (T / 2 + 0.36)); g.add(f); }
  }
  g.userData.bankY = 0.45; g.userData.bankZ = TISCH.T / 2 + 0.36;
  // Tischdecke (rot-weiss kariert) in der Mitte, Laeufer
  const c = document.createElement('canvas'); c.width = c.height = 64; const cg = c.getContext('2d');
  for(let y = 0; y < 8; y++) for(let x = 0; x < 8; x++){ cg.fillStyle = (x + y) % 2 ? '#c8302c' : '#f4ede0'; cg.fillRect(x * 8, y * 8, 8, 8); }
  const dt = new THREE.CanvasTexture(c); dt.wrapS = dt.wrapT = THREE.RepeatWrapping; dt.repeat.set(6, 1.6); dt.magFilter = THREE.NearestFilter;
  const decke = new THREE.Mesh(new THREE.PlaneGeometry(B - 0.6, T - 0.35), new THREE.MeshLambertMaterial({ map: dt }));
  decke.rotation.x = -Math.PI / 2; decke.position.y = H + 0.004; decke.userData.keinKoerper = true; g.add(decke);
  const reste = new THREE.Group(); reste.userData.keinKoerper = true; reste.position.y = H; g.add(reste);
  const teller = new THREE.MeshLambertMaterial({ color: 0xf2f0ea }), becher = new THREE.MeshLambertMaterial({ color: 0x3a7bd8 }), becher2 = new THREE.MeshLambertMaterial({ color: 0xd8a03a });
  // leere Teller vor jedem Platz (beide Seiten; vorn nicht auf den Spuren, siehe SPUR_*)
  for(const [x, sz] of [[-1.6, -1], [-0.65, -1], [0.6, -1], [1.7, -1], [-0.35, 1], [0.2, 1]]){
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.025, 16), teller); t.position.set(x + sz * 0.08, 0.013, sz * 0.36); reste.add(t);
  }
  // umgefallene Becher, eine leere Schuessel, Kruemel
  for(const [x, z, m, um] of [[-0.6, 0.1, becher, true], [0.35, 0.3, becher2, true], [1.75, -0.32, becher, false], [-1.75, -0.3, becher2, false]]){
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.12, 10), m);
    if(um){ b.rotation.z = Math.PI / 2; b.rotation.y = x; b.position.set(x, 0.05, z); } else b.position.set(x, 0.06, z);
    reste.add(b);
  }
  const sch = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xb06a3a, side: THREE.DoubleSide }));
  sch.rotation.x = Math.PI; sch.scale.y = 0.55; sch.position.set(0.45, 0.12, -0.3); reste.add(sch);   // leere Schuessel (Hoehlung nach oben)
  let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const kruemel = new THREE.MeshLambertMaterial({ color: 0xc89a5a });
  for(let i = 0; i < 24; i++){ const k = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, 0.02), kruemel);
    k.position.set((rnd() - 0.5) * (B - 0.8), 0.008, (rnd() - 0.5) * (T - 0.5)); k.rotation.y = rnd() * 3; reste.add(k); }
  reste.add(spurenDecal());
  // Tannenzweige als Tischschmuck mit roten Beeren
  // (hinten an der Kante – vorn sitzen die Voegel)
  for(const x of [-1.6, 1.75]){ const z = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), nadelMat[2]); z.rotation.z = Math.PI / 2; z.position.set(x, 0.06, -0.42); reste.add(z);
    for(let i = 0; i < 3; i++){ const be = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshLambertMaterial({ color: 0xd02020 })); be.position.set(x + (i - 1) * 0.08, 0.1, -0.36); reste.add(be); } }
  g.traverse(o => { if(o.isMesh){ o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// Zwei Fussspuren quer ueber die Tischdecke (Konzept: "auf dem Foto sind zwei Fussspuren" – vom Lama und vom Eichhoernchen;
// Live-Wunsch 26.10.2026: das Lama statt des Hamsters), dunkelbraun wie von Sosse. Deutlich groesser als in echt, damit man sie
// auf dem Foto sieht: Lama zwei laengliche Zehen je Huf (im Wechselschritt), Eichhoernchen mit langen Zehen, im Sprung (die
// grossen Hinterpfoten paarweise vorn, die kleinen Vorderpfoten dahinter). Flach auf der Decke, ohne Grenze.
// Leinwand 4 x 1 m (Tisch-Koordinaten x -2..2, z -0,5..0,5), 256 px je m; oben im Bild = hinten (-z).
const SPUR_PX = 256;
// Je Abdruck: erst ein heller Rand (hebt ihn vom roten Karo ab, Live-Pruefung: dunkelbraun allein ging im Muster unter),
// dann die dunkle Pfote darauf
function pfote(g, x, z, dreh, gr, zehen, lang){
  const formen = (s) => { g.beginPath(); g.ellipse(0, s * 0.18, s * 0.32, s * 0.27, 0, 0, 7);          // Ballen
    for(let i = 0; i < zehen; i++){ const a = (i / (zehen - 1) - 0.5) * 1.9;                            // Zehen im Bogen davor
      g.moveTo(Math.sin(a) * s * 0.42 + s * 0.12, -Math.cos(a) * s * 0.36 - (lang ? s * 0.12 : 0));
      g.ellipse(Math.sin(a) * s * 0.42, -Math.cos(a) * s * 0.36 - (lang ? s * 0.12 : 0), s * (lang ? 0.08 : 0.11), s * (lang ? 0.17 : 0.11), a, 0, 7); } };
  g.save(); g.translate((x + 2) * SPUR_PX, (z + 0.5) * SPUR_PX); g.rotate(dreh); const s = gr * SPUR_PX;
  formen(s); g.lineWidth = s * 0.16; g.strokeStyle = 'rgba(250,244,230,0.95)'; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = 'rgba(58,30,12,0.96)'; formen(s); g.fill();
  g.restore();
}
// Huf des Lamas: zwei laengliche Zehen nebeneinander, vorn leicht gespreizt, mit kleinen Naegeln an der Spitze (dieselbe Form
// wie die Spur im Observatorium, observatorium_innen.js huf) – auch mit hellem Rand
function huf(g, x, z, dreh, gr){
  const formen = (s) => { g.beginPath();
    for(const sx of [-1, 1]){ g.moveTo(sx * s * 0.17 + s * 0.14, s * 0.04); g.ellipse(sx * s * 0.17, s * 0.04, s * 0.14, s * 0.34, sx * 0.12, 0, 7);
      g.moveTo(sx * s * 0.22 + s * 0.06, -s * 0.36); g.ellipse(sx * s * 0.22, -s * 0.36, s * 0.06, s * 0.07, sx * 0.12, 0, 7); } };
  g.save(); g.translate((x + 2) * SPUR_PX, (z + 0.5) * SPUR_PX); g.rotate(dreh); const s = gr * SPUR_PX;
  formen(s); g.lineWidth = s * 0.14; g.strokeStyle = 'rgba(250,244,230,0.95)'; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = 'rgba(58,30,12,0.96)'; formen(s); g.fill();
  g.restore();
}
// Wege der beiden Spuren (Tisch-Koordinaten) – die Reste auf dem Tisch liegen daneben (baueFesttisch)
const SPUR_LAMA = [{ x: -1.85, z: 0.45 }, { x: -0.85, z: -0.42 }];
const SPUR_HOERNCHEN = [{ x: 1.85, z: 0.42 }, { x: 0.75, z: -0.42 }];
// fuer den Spurvergleich im Notizbuch (observatorium_innen.js): wo die Spuren auf dem Tatortfoto liegen
story.e2SpurWege = { lama: SPUR_LAMA, hoernchen: SPUR_HOERNCHEN, tisch: TISCH };
function spurenDecal(){
  const c = document.createElement('canvas'); c.width = 4 * SPUR_PX; c.height = SPUR_PX; const g = c.getContext('2d');
  // Lama: Hufe mit zwei Zehen, im Wechselschritt – von vorn links nach hinten
  const [h0, h1] = SPUR_LAMA, hd = Math.atan2(h1.x - h0.x, -(h1.z - h0.z));
  for(let i = 0; i <= 5; i++){ const t = i / 5, seite = i % 2 ? 1 : -1;
    huf(g, h0.x + (h1.x - h0.x) * t + Math.cos(hd) * seite * 0.09, h0.z + (h1.z - h0.z) * t + Math.sin(hd) * seite * 0.09, hd, 0.2); }
  // Eichhoernchen: groesser, lange Zehen, in Spruengen – von vorn rechts nach hinten zur Mitte
  const [e0, e1] = SPUR_HOERNCHEN, ed = Math.atan2(e1.x - e0.x, -(e1.z - e0.z));
  for(let i = 0; i <= 2; i++){ const t = i / 2, x = e0.x + (e1.x - e0.x) * t, z = e0.z + (e1.z - e0.z) * t, q = { x: Math.cos(ed), z: Math.sin(ed) };
    const vor = { x: Math.sin(ed), z: -Math.cos(ed) };
    for(const sx of [-1, 1]) pfote(g, x + q.x * sx * 0.11 + vor.x * 0.09, z + q.z * sx * 0.11 + vor.z * 0.09, ed, 0.2, 5, true);        // Hinterpfoten
    for(const sx of [-1, 1]) pfote(g, x + q.x * sx * 0.05 - vor.x * 0.13, z + q.z * sx * 0.05 - vor.z * 0.13, ed, 0.11, 4, false); }    // Vorderpfoten
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.007; m.renderOrder = 1; m.name = 'Fussspuren';
  return m;
}
// ---- Bananenschale mit Ameisen (Live-Wunsch 21.10.2026: unter der Lupe Ameisen ueber der Bananenschale) -------------
// Aus Grundformen, liegt flach (Oberseite +y, Stiel nach -z): vier aufgeklappte Schalenstreifen (gelb, braune Flecken) um
// einen Stiel, darauf eine Ameisenstrasse. Dieselbe Schale liegt im Ring am Waldweg und kommt unter die Lupe
// (notizbuch.js STELLEN 'weg_lupe': bau / animiere). Masse in m (die ganze Schale ~22 cm).
const schaleMat = new THREE.MeshLambertMaterial({ color: 0xf0cf3c }), schaleInnen = new THREE.MeshLambertMaterial({ color: 0xf6ecc4 });
const fleckMat = new THREE.MeshLambertMaterial({ color: 0x6b4a1e }), ameiseMat = new THREE.MeshLambertMaterial({ color: 0x241510 });
// Form wie eine leer gegessene Banane, die am Boden liegt (Live-Pruefung: die erste Fassung von oben sah aus wie eine Blume):
// ein gebogener Rumpf (offene Wanne entlang eines Bogens) mit braunem Stiel an einem Ende und schwarzer Spitze am anderen,
// dazu zwei Schalenlappen, die vom Stielende flach auf den Boden geklappt sind. Alles in einem System um die Mitte (0, 0):
// der Bogen laeuft von x -L/2 (Spitze) nach +L/2 (Stiel) und biegt sich in der Mitte BOGEN_H nach +z.
const BANANE = { L: 0.24, H: 0.045, r: 0.024 };
function bananenPunkt(u){                             // u 0..1 entlang des Bogens -> Mitte und Richtung in der Bodenebene
  const x = (u - 0.5) * BANANE.L, z = BANANE.H * (1 - Math.pow(2 * u - 1, 2));
  const dx = BANANE.L, dz = BANANE.H * -4 * (2 * u - 1), l = Math.hypot(dx, dz);
  return { x, z, tx: dx / l, tz: dz / l };
}
// Rumpf: flach gedrueckte Kugeln entlang des Bogens (gelb, glatt ineinander), oben eine helle, schmalere Reihe = die
// aufgerissene Innenseite. Zu den Enden hin schmaler.
function bananenRumpf(g){
  const r = BANANE.r, N = 14;
  for(let i = 0; i <= N; i++){
    const u = i / N, p = bananenPunkt(u), k = 0.4 + 0.6 * Math.sin(Math.PI * u), rr = r * k;
    const a = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), schaleMat); a.scale.set(rr, rr * 0.62, rr); a.position.set(p.x, rr * 0.62, p.z); g.add(a);
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), schaleInnen); b.scale.set(rr * 0.62, rr * 0.25, rr * 0.62); b.position.set(p.x, rr * 1.12, p.z); g.add(b);
  }
}
function baueSchale(){
  const g = new THREE.Group(), r = BANANE.r;
  bananenRumpf(g);
  const e0 = bananenPunkt(0), e1 = bananenPunkt(1);
  // Stiel (braun) am rechten Ende, ein Stueck hochgebogen; Spitze (schwarz) links
  const stiel = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.01, 0.04, 7), fleckMat);
  stiel.position.set(e1.x + e1.tx * 0.017, 0.016, e1.z + e1.tz * 0.017); stiel.rotation.set(0, 0, -Math.PI / 2 + 0.4); stiel.rotation.y = -Math.atan2(e1.tz, e1.tx); g.add(stiel);
  const spitze = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 6), new THREE.MeshLambertMaterial({ color: 0x2a2018 })); spitze.position.set(e0.x - 0.004, 0.01, e0.z); g.add(spitze);
  // zwei Lappen am Stielende, flach auf den Boden geklappt (gelb mit hellem Innenstreifen), nach vorn und hinten gespreizt –
  // Richtung in der Bodenebene: von der Stielseite zurueck zur Mitte, je um 'dreh' gedreht
  for(const [dreh, lang] of []){                                   // (Lappen: unter der Lupe als Ring missverstaendlich – weg)
    const w = Math.atan2(-e1.tx, -e1.tz) + dreh;                     // Winkel ab +z (wie rotation.y)
    const lap = new THREE.Group(); lap.position.set(e1.x - e1.tx * 0.025, 0.003, e1.z - e1.tz * 0.025); lap.rotation.y = w; g.add(lap);
    const a = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), schaleMat); a.scale.set(0.02, 0.005, lang / 2); a.position.z = lang / 2; lap.add(a);
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8), schaleInnen); b.scale.set(0.012, 0.004, lang / 2 - 0.01); b.position.set(0, 0.003, lang / 2); lap.add(b);
  }
  // braune Flecken aussen auf dem Rumpf
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 12; i++){ const u = 0.1 + rnd() * 0.8, p = bananenPunkt(u), seite = rnd() < 0.5 ? -1 : 1, rr = r * (0.4 + 0.6 * Math.sin(Math.PI * u));
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.004 + rnd() * 0.004, 6, 4), fleckMat);
    f.position.set(p.x - p.tz * seite * rr * 0.8, rr * 0.75, p.z + p.tx * seite * rr * 0.8); f.scale.y = 0.6; g.add(f); }
  // Ameisen: Kopf, Brust, Hinterleib, sechs Beine, Fuehler – 2,2 cm (deutlich groesser als in echt: unter der Lupe soll ein
  // Kind sie sofort sehen; mit blossem Auge kleine Punkte)
  const ameisen = [], A = 1.4;
  for(let i = 0; i < 9; i++){
    const a = new THREE.Group(); a.scale.setScalar(A);
    for(const [z, rr] of [[0.0066, 0.0025], [0, 0.002], [-0.0072, 0.0036]]){ const k = new THREE.Mesh(new THREE.SphereGeometry(rr, 8, 5), ameiseMat); k.position.z = z; k.scale.z = 1.25; a.add(k); }
    for(const sz of [-1, 1]) for(const z of [-0.0018, 0, 0.0018]){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.001, 0.001), ameiseMat); b.position.set(sz * 0.0042, -0.0012, z); b.rotation.y = z * 200 * sz; a.add(b); }
    for(const sz of [-1, 1]){ const f = new THREE.Mesh(new THREE.BoxGeometry(0.0008, 0.0008, 0.007), ameiseMat); f.position.set(sz * 0.0018, 0.0012, 0.0115); f.rotation.y = sz * 0.5; a.add(f); }   // Fuehler
    g.add(a); ameisen.push({ a, u: i / 9 });
  }
  g._ameisen = ameisen;                                            // nicht in userData (clone kopiert userData per JSON)
  schaleAnimieren(g, 0);
  return g;
}
// Ameisenstrasse (Live-Wunsch: "Ameisen ueber Bananenschale"): vom Boden vorn links herauf auf die Schale, innen in der
// Wanne entlang zum Stiel und dort hinten wieder hinunter. Je Ameise: Abschnitt hinauf (0..0,15), auf der Schale
// (0,15..0,85, folgt dem Bogen), hinunter (0,85..1).
function ameisenPunkt(u){
  const r = BANANE.r, auf = (v) => bananenPunkt(0.08 + v * 0.84);
  if(u < 0.15){ const k = u / 0.15, z = auf(0); return { x: z.x - 0.07 * (1 - k), y: 0.002 + 0.016 * k, z: z.z + 0.09 * (1 - k) }; }
  if(u > 0.85){ const k = (u - 0.85) / 0.15, z = auf(1); return { x: z.x + 0.06 * k, y: 0.018 - 0.016 * k, z: z.z - 0.08 * k }; }
  const v = (u - 0.15) / 0.7, p = auf(v), rr = r * (0.4 + 0.6 * Math.sin(Math.PI * (0.08 + v * 0.84)));
  return { x: p.x, y: rr * 1.35, z: p.z };                       // oben auf dem Rumpf
}
function schaleAnimieren(g, t){
  const A = g._ameisen; if(!A) return;
  for(const m of A){
    const u = (m.u + t * 0.05) % 1, p = ameisenPunkt(u), q = ameisenPunkt(Math.min(0.999, u + 0.01));
    m.a.position.set(p.x + Math.sin(t * 9 + m.u * 20) * 0.0015, p.y, p.z);
    m.a.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + Math.sin(t * 7 + m.u * 13) * 0.25;   // schaut in Laufrichtung, wackelt
  }
}
// notizbuch.js (Lupe): eine eigene Schale fuer das grosse Bild
story.e2Bananenschale = () => { const g = baueSchale(), bb = new THREE.Box3().setFromObject(g), L = Math.max(...bb.getSize(new THREE.Vector3()).toArray()); return Promise.resolve({ g, L }); };
story.e2SchaleAnimieren = schaleAnimieren;
story.typ('bananenschale', { bau: () => baueSchale(), form: 'quader' });
// Festgetretener Weg: flache, leicht graubraune Streifen ueber der Schneedecke (begehbar)
function baueWeg(o){
  o = o || {}; const LIN = o.linie || WEG_LINIE, AUS = o.aus || WEG_AUS;
  const g = new THREE.Group(); g.userData.begehbar = true;
  // Erdweg (braun, mit Schneerest am Rand): auf dem weissen Schnee gut zu sehen (Live-Pruefung: grau ging unter). Weiche
  // Raender per Textur, in Segmenten entlang der Linie; an den Knicken ueberlappen sie.
  // Textur ueber die GANZE Laenge (uv.y 0..1): quer weiche Raender, laengs am Anfang und am Ende auslaufen (WEG_AUS),
  // dazu ein paar Fussspuren-Flecken, damit er nicht glatt wirkt
  const c = document.createElement('canvas'); c.width = 64; c.height = 1024; const cg = c.getContext('2d'), gr = cg.createLinearGradient(0, 0, 64, 0);
  gr.addColorStop(0, 'rgba(120,92,60,0)'); gr.addColorStop(0.22, 'rgba(120,92,60,0.85)'); gr.addColorStop(0.5, 'rgba(104,78,50,0.95)');
  gr.addColorStop(0.78, 'rgba(120,92,60,0.85)'); gr.addColorStop(1, 'rgba(120,92,60,0)'); cg.fillStyle = gr; cg.fillRect(0, 0, 64, 1024);
  let ws = 9; const wr = () => (ws = (ws * 16807) % 2147483647) / 2147483647;
  for(let i = 0; i < 220; i++){ cg.fillStyle = wr() < 0.5 ? 'rgba(80,60,38,0.35)' : 'rgba(230,226,218,0.35)'; cg.beginPath(); cg.ellipse(14 + wr() * 36, wr() * 1024, 2 + wr() * 4, 3 + wr() * 6, 0, 0, 7); cg.fill(); }
  cg.globalCompositeOperation = 'destination-in';
  const lg = cg.createLinearGradient(0, 0, 0, 1024);   // flipY: uv.y 0 (Anfang an der Lichtung) = UNTEN im Bild, uv.y 1 (Waldende) = oben
  // EIN Verlauf fuer beide Enden (destination-in loescht alles ausserhalb des gemalten Rechtecks – zwei getrennte Verlaeufe
  // machten den Weg ganz unsichtbar, gemessen). Weich (Smoothstep in Stufen): oben (Waldende) 0 -> 1, unten (Lichtung) 1 -> 0
  const weich = (k) => k * k * (3 - 2 * k);
  for(const k of [0, 0.25, 0.5, 0.75, 1]) lg.addColorStop(AUS.ende * k, 'rgba(0,0,0,' + weich(k).toFixed(3) + ')');
  for(const k of [0, 0.25, 0.5, 0.75, 1]) lg.addColorStop(1 - AUS.anfang * (1 - k), 'rgba(0,0,0,' + (1 - weich(k)).toFixed(3) + ')');
  cg.fillStyle = lg; cg.fillRect(0, 0, 64, 1024);
  // unbeleuchtet (Basic): ein flaches Band am Boden bekam mit Lambert je nach Seite fast kein Licht (wurde schwarz)
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xd8c4a8, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  // EIN Band entlang der Linie (Catmull-Rom, weich gebogen) – einzelne Stuecke zeigten an den Knicken Kanten
  const kurve = new THREE.CatmullRomCurve3(LIN.map(p => new THREE.Vector3(p.x, 0, p.z))), N = 120, B = 1.1, pos = [], uv = [], idx = [];
  // Wicklung: (links, rechts) je Punkt; Dreiecke so, dass die Vorderseite nach oben zeigt (sonst nur von unten sichtbar).
  // getPointAt: gleichmaessig nach Laenge (die Ausblendung soll in Metern gleich verlaufen)
  for(let i = 0; i <= N; i++){ const u = i / N, p = kurve.getPointAt(u), t = kurve.getTangentAt(u);
    // vorn aus der Wiese heraus: schmal anfangen und auf volle Breite wachsen
    const k = Math.min(1, u / AUS.anfang), b = B * (0.35 + 0.65 * k * k * (3 - 2 * k));
    pos.push(p.x - t.z * b, ISLAND_Y + 0.02, p.z + t.x * b, p.x + t.z * b, ISLAND_Y + 0.02, p.z - t.x * b); uv.push(0, u, 1, u);
    if(i < N){ const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((v, i) => i % 3 === 1 ? 1 : 0), 3));   // flach, nach oben
  mat.side = THREE.DoubleSide;
  const band = new THREE.Mesh(geo, mat); band.renderOrder = 2; g.add(band);       // nach der Schneedecke (renderOrder 1) zeichnen
  if(o.ohneWegweiser) return { boden: g, wegweiser: null };
  // Wegweiser am Eingang: Pfosten mit Pfeilschild (zeigt in den Wald) – das Kind sieht, wo es hingeht
  const holz = new THREE.MeshLambertMaterial({ color: 0x7a5530 });
  const pfosten = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.6, 8), holz); pfosten.position.set(WEG.x + 1.6, ISLAND_Y + 0.8, WEG.z + 0.8);
  // Pfeil (Spitze in Schild-Richtung +x) zeigt den Weg entlang in den Wald: Drehung so, dass +x auf die Wegrichtung faellt
  const p2 = WEG_LINIE[2], w = Math.atan2(p2.z - WEG.z, p2.x - WEG.x);
  const schild = new THREE.Shape(); schild.moveTo(-0.38, -0.13); schild.lineTo(0.2, -0.13); schild.lineTo(0.42, 0); schild.lineTo(0.2, 0.13); schild.lineTo(-0.38, 0.13); schild.lineTo(-0.38, -0.13);
  const sm = new THREE.Mesh(new THREE.ExtrudeGeometry(schild, { depth: 0.05, bevelEnabled: false }), new THREE.MeshLambertMaterial({ color: 0xa8743e }));
  sm.geometry.translate(0.1, 0, -0.025);
  sm.position.set(pfosten.position.x, ISLAND_Y + 1.42, pfosten.position.z); sm.rotation.set(0, -w, 0);
  const wegweiser = new THREE.Group(); wegweiser.add(pfosten, sm);
  return { boden: g, wegweiser };
}
function aesteUeberWeg(kurve, gasse, von, bis){
  gasse = gasse || WEG_GASSE; von = von === undefined ? 0.1 : von; bis = bis === undefined ? 0.62 : bis;
  // Jeder Ast in Weltkoordinaten (Live-Pruefung: gedreht + verschoben zeigten die Spitzen nicht zur Wegmitte, darueber blieb
  // ein Streifen Himmel): vom Stamm am Wegrand (4,5..6,5 m hoch) schraeg ueber den Weg bis knapp ueber die andere Haelfte
  // (3,0..3,8 m hoch). Ein flacher Kegel, Basis am Stamm, Spitze am Ende – von beiden Seiten, sie greifen ineinander.
  let s = 41; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const teile = [], start = new THREE.Vector3(), ende = new THREE.Vector3(), mitte = new THREE.Vector3(), dir = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion(), m4 = new THREE.Matrix4(), sc = new THREE.Vector3(1, 1, 1);
  const farben = [new THREE.Color(0x143022), new THREE.Color(0x1a3a28), new THREE.Color(0x10281c)];
  for(let i = 0; i < 90; i++){
    const u = von + i / 90 * (bis - von), p = kurve.getPointAt(u), t = kurve.getTangentAt(u), nx = -t.z, nz = t.x;   // quer zum Weg
    for(const seite of [-1, 1]){
      if(rnd() < 0.1) continue;
      const ab = gasse + 0.2, ueber = 0.4 + rnd() * 0.9;          // wie weit der Ast ueber die Wegmitte hinaus reicht
      start.set(p.x + nx * seite * ab, ISLAND_Y + 4.5 + rnd() * 2.0, p.z + nz * seite * ab);
      ende.set(p.x - nx * seite * ueber + t.x * (rnd() - 0.5) * 1.2, ISLAND_Y + 3.0 + rnd() * 0.8, p.z - nz * seite * ueber + t.z * (rnd() - 0.5) * 1.2);
      dir.subVectors(ende, start); const L = dir.length(); dir.normalize();
      const geo = new THREE.ConeGeometry(0.75 + rnd() * 0.45, L, 6);   // Spitze bei +y, Basis bei -y
      geo.scale(1, 1, 0.35);                                     // flach (eine Astschicht), Breite laengs des Wegs
      // Ausrichtung: +y -> dir, die flache Seite nach oben (Achse z des Kegels moeglichst senkrecht)
      q.setFromUnitVectors(Y, dir);
      mitte.addVectors(start, ende).multiplyScalar(0.5);
      geo.applyMatrix4(m4.compose(mitte, q, sc));
      const fa = farben[Math.floor(rnd() * 3)], n = geo.attributes.position.count, col = new Float32Array(n * 3);
      for(let k = 0; k < n; k++) col.set([fa.r, fa.g, fa.b], k * 3);
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      teile.push(geo.index ? geo.toNonIndexed() : geo);
    }
  }
  const n = teile.reduce((a, g) => a + g.attributes.position.count, 0), P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3);
  let o = 0; for(const g of teile){ g.computeVertexNormals(); P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); m.castShadow = true;
  m.userData.keinKoerper = true;                                  // ueber Kopfhoehe: keine Grenze (sonst stiesse die Kamera an)
  return m;
}
// Schatten im Wald auf dem Weg: breites, weiches, dunkelblaues Band, das am Waldrand einsetzt (kein Licht – Basic)
function wegSchatten(kurve){
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
  const quer = g.createLinearGradient(0, 0, 64, 0); quer.addColorStop(0, 'rgba(20,30,45,0)'); quer.addColorStop(0.3, 'rgba(20,30,45,1)'); quer.addColorStop(0.7, 'rgba(20,30,45,1)'); quer.addColorStop(1, 'rgba(20,30,45,0)');
  g.fillStyle = quer; g.fillRect(0, 0, 64, 256);
  g.globalCompositeOperation = 'destination-in';
  // flipY: uv.y 0 (Anfang am Waldrand) = UNTEN im Canvas (y 256). Live-Befund 21.10.2026: hier lief der Verlauf falsch herum,
  // am Waldrand stand eine harte Kante. Jetzt unten weich in vielen Stufen (Smoothstep) von 0 auf die volle Staerke.
  const laengs = g.createLinearGradient(0, 256, 0, 0);
  for(let k = 0; k <= 10; k++){ const u = k / 10, a = u * u * (3 - 2 * u); laengs.addColorStop(u * 0.45, 'rgba(0,0,0,' + (a * 0.48).toFixed(3) + ')'); }
  laengs.addColorStop(1, 'rgba(0,0,0,0.52)');
  g.fillStyle = laengs; g.fillRect(0, 0, 64, 256);
  const N = 80, B = 4.2, pos = [], uv = [], idx = [], u0 = 0.04;
  for(let i = 0; i <= N; i++){ const u = u0 + (1 - u0) * i / N, p = kurve.getPointAt(u), t = kurve.getTangentAt(u);
    pos.push(p.x - t.z * B, ISLAND_Y + 0.03, p.z + t.x * B, p.x + t.z * B, ISLAND_Y + 0.03, p.z - t.x * B); uv.push(0, i / N, 1, i / N);
    if(i < N){ const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  m.renderOrder = 3; m.userData.deko = true; return m;
}
// Waldweg als Baustein (hoehle.js: das Ende desselben Wegs auf der anderen Seite – ohne Schnee in der Gasse):
// o = { welt, linie, aus, gasse (m Wegmitte bis Stamm), von, bis (Anteil der Laenge mit Gasse und Aesten), rnd, frei(x, z) }
// Baut Band, dunkle Tannengasse (drei Reihen), Aeste und Schatten. Rueckgabe: Liste der gesetzten Baeume { x, z }.
story.waldweg = function(o){
  const w = story.welt(o.welt), weg = baueWeg({ linie: o.linie, aus: o.aus, ohneWegweiser: true }); w.add(weg.boden);
  const kurve = new THREE.CatmullRomCurve3(o.linie.map(p => new THREE.Vector3(p.x, 0, p.z))), rnd = o.rnd || Math.random, gasse = o.gasse || WEG_GASSE;
  const baeume = [], n = Math.round((o.bis - o.von) * 70);
  for(let i = 0; i < n; i++){ const u = o.von + i / n * (o.bis - o.von), p = kurve.getPointAt(u), t = kurve.getTangentAt(u);
    for(const seite of [-1, 1]) for(const reihe of [0, 1, 2]){
      if(reihe === 1 && i % 2) continue; if(reihe === 2 && i % 3) continue;
      const ab = gasse + (o.weit ? o.weit(u) : 0) + reihe * 2.4 + rnd() * 0.5, x = p.x - t.z * seite * ab, z = p.z + t.x * seite * ab;
      if(o.frei && !o.frei(x, z)) continue;
      story.setze('tanne', o.welt, { x, z, h: 9 + rnd() * 5, dunkel: true, schmal: true, schnee: false, dreh: rnd() * 6.3, fest: true }); baeume.push({ x, z });
    } }
  w.add(aesteUeberWeg(kurve, gasse, o.astVon === undefined ? o.von : o.astVon, o.bis));
  const sch = wegSchatten(kurve); w.add(sch);
  return { kurve, baeume };
};
// Dunst in der Waldgasse (Live-Wunsch 22.10.2026: "der Waldeingang sollte auch normal etwas neblig aussehen, nicht erst,
// wenn ich ihn betrete"): weiche, helle Schleier zwischen den Tannen entlang des Wegs, von aussen schon zu sehen. Sprites
// (drehen sich zur Kamera), ohne Tiefe schreiben, im Nebel der Szene. o = { welt, linie, von, bis, farbe }. aus(): weg.
story.waldNebel = function(o){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,0.75)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.32)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c), w = story.welt(o.welt), kurve = new THREE.CatmullRomCurve3(o.linie.map(p => new THREE.Vector3(p.x, 0, p.z)));
  const gruppe = new THREE.Group(); gruppe.userData.deko = true;
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const n = 30;
  for(let i = 0; i < n; i++){
    const u = o.von + (i + rnd() * 0.6) / n * (o.bis - o.von), p = kurve.getPointAt(Math.min(1, u)), t = kurve.getTangentAt(Math.min(1, u)), q = (rnd() - 0.5) * 2.2;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: o.farbe || 0xc8d2dc, transparent: true, depthWrite: false, opacity: 0.55 + rnd() * 0.3 }));
    const k = Math.min(1, (u - o.von) / 0.08);                     // vorn am Eingang zart, dahinter dichter
    sp.material.opacity *= 0.45 + 0.55 * k;
    sp.position.set(p.x - t.z * q, ISLAND_Y + 1.2 + rnd() * 1.6, p.z + t.x * q); sp.scale.set(7 + rnd() * 4, 3.2 + rnd() * 1.6, 1);
    sp.renderOrder = 4; gruppe.add(sp);
  }
  w.add(gruppe);
  return { gruppe, aus(){ gruppe.visible = false; } };
};
function abstandZumWeg(x, z){
  let d = Infinity;
  for(let i = 0; i + 1 < WEG_LINIE.length; i++){ const a = WEG_LINIE[i], b = WEG_LINIE[i + 1], dx = b.x - a.x, dz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)));
    d = Math.min(d, Math.hypot(x - a.x - dx * t, z - a.z - dz * t)); }
  return d;
}
// Lichterkette zwischen zwei Baeumen (Girlande: durchhaengender Bogen aus Leuchtpunkten) – Deko, keine Grenze
function girlande(a, b, hoch, n){
  const g = new THREE.Group(); g.userData.deko = true;
  const mat = [new THREE.MeshBasicMaterial({ color: 0xffd27a }), new THREE.MeshBasicMaterial({ color: 0xff7a7a }), new THREE.MeshBasicMaterial({ color: 0x8ad0ff })];
  for(let i = 0; i <= n; i++){ const t = i / n, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t, y = ISLAND_Y + hoch - Math.sin(Math.PI * t) * 0.8;
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), mat[i % 3]); l.position.set(x, y, z); l.userData.lichterkette = true; g.add(l); }
  return g;
}
story.typ('tanne', { bau: (p) => baueTanne(p) });
story.typ('festtisch', { bau: () => baueFesttisch() });

// ---- Tiere laden: Vorlage messen (in Haltung), klonen, an den Tisch setzen ------------------------------------------
const wi = { gebaut: false, tiere: [], t: 0, lichter: [], angekommen: false, tisch: null, insBoot: false, spurGesagt: false, wald: 0 };
function tierLaden(T){
  story.ladeGlb(window[T.glb], T.name, (gl) => {
    const o = gl.scene;
    o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; m.castShadow = true;
      // Vertexfarben mit Lambert wie die uebrige Kulisse (Standard-Material wirkte am Tag stumpf und dunkel). three.js r128:
      // ohne skinning: true zeichnet ein eigenes Material die RUHEPOSE (gemessen: Eule, Reh, Voegel winzig, Elch verdreht)
      const alt = m.material; m.material = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xffffff, skinning: !!m.isSkinnedMesh }); if(alt.dispose) alt.dispose(); } });
    // Haltung: Clip kurz angespielt, mit Skinning gemessen (Ruhepose != sichtbare Form). Groesse (gross = Hoehe) aus dem
    // Clip T.mass (Standard: der erste), Lage am Boden aus dem Clip, der gespielt wird (clips[0]) – so sitzt ein Tier, dessen
    // Sitz-Clip in der Luft haengt, trotzdem auf dem Boden und behaelt seine Groesse
    const clips = T.clips.map(n => gl.animations.find(a => a.name === n)).filter(Boolean);
    const mx = new THREE.AnimationMixer(o), v = new THREE.Vector3();
    const messe = (clip) => {
      mx.stopAllAction(); if(clip){ mx.clipAction(clip).reset().play(); mx.update(0.05); }
      o.updateMatrixWorld(true);
      const bb = new THREE.Box3();
      o.traverse(m => { if(!m.isSkinnedMesh) return; const n = m.geometry.attributes.position.count;
        for(let i = 0; i < n; i += 3){ m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); bb.expandByPoint(v); } });
      return bb;
    };
    const massClip = T.mass ? gl.animations.find(a => a.name === T.mass) : null;
    const bbMass = messe(massClip || clips[0]), bb = massClip ? messe(clips[0]) : bbMass;
    const k = T.gross / Math.max(0.01, bbMass.max.y - bbMass.min.y);
    T.hoehe = (bb.max.y - bb.min.y) * k;                           // so hoch ist es in seiner Haltung
    o.scale.multiplyScalar(k);
    const c = bb.getCenter(new THREE.Vector3());
    o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    const huelle = new THREE.Group(); huelle.add(o); huelle.name = T.name;
    huelle.userData.agent = true;                                  // Tier: keine Bauteil-Grenze (story.pruefeWelt), sondern eine Saeule (s. u.)
    huelle.position.set(T.x, sitzY(T), T.z); huelle.rotation.y = T.blick;
    story.welt(2).add(huelle); huelle.updateMatrixWorld(true);     // vor dem Vermessen der Saeule (sonst laege sie im Ursprung)
    // Saeule als Grenze: so gross wie das Tier in Haltung (Kreis um die Mitte), Joshi laeuft nicht durch
    const saeule = new THREE.Mesh(new THREE.CylinderGeometry(T.r, T.r, T.hoehe, 10), new THREE.MeshBasicMaterial({ visible: false }));
    saeule.position.y = T.hoehe / 2; huelle.add(saeule);
    story.ding(saeule, { welt: 2, typ: 'tier:' + T.id });
    // eigener Mixer (nicht in userData: clone() kopiert userData per JSON)
    mx.stopAllAction(); mx.uncacheRoot(o);
    const mixer = new THREE.AnimationMixer(o), acts = clips.map(a => mixer.clipAction(a));
    const tier = { T, obj: huelle, mixer, acts, cur: 0, t: Math.random() * 3, wechsel: 6 + Math.random() * 6 };
    if(acts[0]){ acts[0].play(); mixer.setTime(Math.random() * clips[0].duration); }
    wi.tiere.push(tier);
    if(T.id !== 'elch'){ if(!tierGruppe.parent) story.welt(2).add(tierGruppe); tierGruppe.add(huelle); }   // Gruppe liegt bei 0, 0, 0
    if(T.id === 'elch'){
      // der Elch: eigenes Y an seinem Kopfende (Live-Wunsch: "nur den Elch und ein Y fuer alle anderen")
      story.interaktion(huelle, { name: T.name, welt: 2, x: T.vor.x, z: T.vor.z, r: VOR_R, yx: T.x, yz: T.z, rolle: T.rolle,
        yHoehe: sitzY(T) - ISLAND_Y + T.hoehe + 0.3, einmal: true, aktion: (o) => tiereErzaehlen(o, [tier]) });
    } else if(wi.tiere.filter(t => t.T.id !== 'elch').length === TIERE.length - 1) tischInteraktion();
  });
}
// Alle anderen Tiere am Tisch zusammen: EIN Y mitten ueber dem Tisch, Joshi steht davor. Beim Suchblick leuchten alle auf
// einmal (die Interaktion haengt an der Gruppe tierGruppe, deren Materialien gemeinsam aufleuchten). Y = alle erzaehlen
// hektisch durcheinander – nacheinander, ohne Pause zwischen den Tieren, jedes schaut dabei auf.
const tierGruppe = new THREE.Group();
function tischInteraktion(){
  const andere = wi.tiere.filter(t => t.T.id !== 'elch').sort((a, b) => TIERE.indexOf(a.T) - TIERE.indexOf(b.T));
  story.interaktion(tierGruppe, { name: 'Tiere am Tisch', welt: 2, x: 0, z: VORN, r: 1.6, yx: 0, yz: TISCH.z, rolle: 'tierW',
    yHoehe: TISCH.H + 1.15, einmal: true, aktion: (o) => tiereErzaehlen(o, andere) });
}
// Erzaehlen: Saetze der Tiere nacheinander, jedes in seiner Stimme; vor seinem ersten Satz schaut es auf
function tiereErzaehlen(o, tiere){
  o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; o.spricht = true;
  tiere.forEach((t, i) => {
    const letzt = i === tiere.length - 1;
    story.sprich(t.T.text, letzt ? () => { o.spricht = false; spurPruefen(); } : null, t.T.rolle);
  });
  // Aufschauen passend zum Sprechen: grob nach der Laenge der Saetze vorher (sprich hat keinen "faengt an"-Rueckruf)
  let t0 = 0;
  for(const t of tiere){ story.spaeter(t0, () => tierFreut(t)); t0 += t.T.text.reduce((s, x) => s + 0.6 + x.length / 14, 0); }
}

// ---- Spur am Tisch (Live-Wunsch 21.10.2026) ------------------------------------------------------------------------
// Haben alle Tiere erzaehlt, sagt die Erzaehlerin, Joshi solle sich noch einmal umschauen. Erst das naechste X schaltet
// die beiden Ringe frei (notizbuch.js STELLEN 'tisch_foto' und 'weg_lupe', bedingung = story.e2SpurFrei; der Weg liegt
// 13 m vom Tisch, X sucht 20 m weit); der Fuchs zeigt sie. Blau: Foto vom Tisch mit den zwei Fussspuren (spurenDecal).
// Braun: am Eingang des Waldwegs die Bananenschale mit den Ameisen, unter der Lupe.
const TEXT_SPUR = ['Hm... Wer das Essen genommen hat, hat vielleicht eine Spur hinterlassen.',
  'Schau dich am Tisch doch noch einmal ganz genau um.'];
const TEXT_HINWEIS_SPUR = ['Schau dich am Tisch noch einmal ganz genau um. Drück dafür X.'];
const TEXT_HINWEIS_RING = ['Stell dich in den blauen Kreis vor dem Tisch und drück Y. Dann machst du ein Foto.'];
const TEXT_HINWEIS_LUPE = ['Am Weg in den Wald ist ein brauner Kreis. Stell dich hinein und drück Y. Dann schaust du ganz genau hin.'];
const alleTiereGehoert = () => wi.tiere.length === TIERE.length && story.interListe.filter(o => o.welt === 2 && o.rolle).length === 2
  && story.interListe.filter(o => o.welt === 2 && o.rolle).every(o => o.erledigt);
story.e2SpurFrei = () => !!wi.spurGesagt;
// ---- Danach: der Gorilla (Live-Wunsch 21.10.2026) --------------------------------------------------------------------
// Der Gorilla kommt erst nach der LUPE ins Spiel: Joshi fragt, von wem die Bananenschale wohl ist – die Eule: vom Gorilla,
// der mag doch Bananen und ist in letzter Zeit so schlecht gelaunt; der Elch: er wohnt am Ende dieses Weges. Ist auch das
// Foto gemacht, ist der Weg frei (sonst erinnert die Erzaehlerin an den blauen Kreis). Geht Joshi dann in den Weg hinein
// (WEG_REIN), kommt der Globus (Ort 2: die Hoehle des Gorillas). Etappe 3 gibt es noch nicht – globus.js beendet dort
// vorerst das Spiel ("Fortsetzung folgt").
const TEXT_JOSHI_FRAGT = ['Von wem die Bananenschale wohl ist?'];
const TEXT_GORILLA_EULE = ['Hu-huu! Bestimmt vom Gorilla. Der mag doch so gerne Bananen.', 'Und überhaupt ist er in letzter Zeit so schlecht gelaunt.'];
const TEXT_GORILLA_ELCH = ['Der Gorilla wohnt in einer Höhle am Ende von diesem Weg. Auf der anderen Seite des Waldes.'];
const TEXT_GORILLA_ERZ = ['Vielleicht weiß der Gorilla etwas. Folge doch dem Weg in den Wald.'];
const TEXT_ERST_FOTO = ['Vorher machst du aber noch ein Foto vom Tisch. Stell dich in den blauen Kreis.'];
const TEXT_HINWEIS_WEG = ['Folge dem Weg in den Wald. Dort wohnt der Gorilla.'];
const TEXT_WEG_NOCH_NICHT = ['Hier geht ein Weg in den Wald. Schau dich vorher noch genau auf der Lichtung um.'];
// Live-Wunsch 22.10.2026: "den Weg im Wald ein wenig laenger laufbar, damit es laenger gruselig ist" – und dann "deutlich
// kuerzen, etwa 50–75 % laenger als im Original": die Reise beginnt ~21 m hinter dem Eingang (vorher 12,9 m), auf der
// WEG_LINIE zwischen (11, 45) und (13,5, 33)
const WEG_REIN = { x: 12.0, z: 37, r: 3.2 };
// notizbuch.js ruft das nach jeder fertigen Stelle (Foto, Lupe)
// Nach dem Tatortfoto (Live-Wunsch 21.10.2026: "muesste Joshi nicht auch nach den Spuren fragen?"): Joshi fragt, wem die
// Spuren gehoeren – keiner am Tisch war es (Lama und Eichhoernchen sitzen nicht dabei), verraten wird nichts.
const TEXT_SPUR_JOSHI = ['Da sind ja Spuren auf dem Tisch! Wem gehören die denn?'];
const TEXT_SPUR_HASE = ['Meine sind das nicht. Meine Pfoten sehen ganz anders aus.'];
const TEXT_SPUR_EULE = ['Und ich habe Krallen, keine Pfoten. Hu-huu.'];
const TEXT_SPUR_ELCH = ['Solche Spuren habe ich hier im Wald noch nie gesehen.'];
const TEXT_SPUR_MERKEN = ['Merk dir die Spuren gut. Vielleicht findest du später heraus, wem sie gehören.'];
const TEXT_FUCHS_FUND = ['Schau mal, dein Fuchs hat noch etwas gefunden.'];
const tierNach = (id) => wi.tiere.find(q => q.T.id === id);
// Der Fuchs laeuft zu genau einem Ring und zeigt ihn (Pfote + Blinken)
function fuchsZumRing(id){
  const k = story.kreisZielVon && story.kreisZielVon(id);
  if(!k || !eva || !story.fuchsRundgang) return;
  story.fuchsRundgang(eva.group.position.x, eva.group.position.z, false, 0, true, o => o === k);
}
// Hinweis-Taste (story.js): zu dem Ring, den der Hinweis nennt (erst das Foto, dann die Lupe)
story.e2HinweisFuchs = function(){
  if(wi.wegFrei || !wi.spurGesagt || !story.stelleZustand) return;
  if(story.stelleZustand('tisch_foto') === 'offen') fuchsZumRing('tisch_foto');
  else if(story.stelleZustand('weg_lupe') === 'offen') fuchsZumRing('weg_lupe');
};
// Ein Gespraech: [rolle, saetze, tier-id (schaut auf)] nacheinander; fertig() nach dem letzten Satz. Das Aufschauen grob
// nach der Laenge der Saetze davor (sprich hat keinen "faengt an"-Rueckruf)
function gespraech(teile, fertig){
  let t0 = 0;
  teile.forEach(([rolle, saetze, id], i) => {
    if(id){ const t = tierNach(id); story.spaeter(t0, () => { if(t) tierFreut(t); }); }
    story.sprich(saetze, i === teile.length - 1 ? fertig : null, rolle);
    t0 += saetze.reduce((s, x) => s + 0.6 + x.length / 14, 0);
  });
}
// notizbuch.js ruft das nach jeder fertigen Stelle (Foto, Lupe). Je Stelle ein Gespraech; der Weg in den Wald ist frei,
// wenn BEIDE Gespraeche vorbei sind – egal in welcher Reihenfolge.
const wegPruefen = () => { if(wi.spurBesprochen && wi.gorillaBesprochen && !wi.wegFrei){ wi.wegFrei = true; story.sprich(TEXT_GORILLA_ERZ); } };
story.e2StelleFertig = function(){
  if(!story.stelleZustand) return;
  const foto = story.stelleZustand('tisch_foto') === 'fertig', lupe = story.stelleZustand('weg_lupe') === 'fertig';
  if(foto && !wi.spurGefragt){
    wi.spurGefragt = true;
    story.spaeter(1.2, () => gespraech([['joshi', TEXT_SPUR_JOSHI], ['tierW', TEXT_SPUR_HASE, 'hase'], ['tierM', TEXT_SPUR_EULE, 'eule'],
      ['tierM', TEXT_SPUR_ELCH, 'elch'], [undefined, TEXT_SPUR_MERKEN]], () => {
      wi.spurBesprochen = true;
      // Lupe noch offen (Live-Wunsch 21.10.2026): der Fuchs laeuft noch einmal zum braunen Ring und zeigt ihn
      // Lupe noch offen (Live-Wunsch 21.10.2026): sobald die Erzaehlerin fertig ist, laeuft der Fuchs von selbst zum braunen
      // Ring und zeigt ihn (nur diesen – nicht erst andere offene Dinge)
      if(story.stelleZustand('weg_lupe') !== 'fertig'){ fuchsZumRing('weg_lupe'); story.sprich(TEXT_FUCHS_FUND); }
      else wegPruefen();
    }));
  }
  if(lupe && !wi.gorillaGesagt){
    wi.gorillaGesagt = true;
    story.spaeter(1.2, () => gespraech([['joshi', TEXT_JOSHI_FRAGT], ['tierM', TEXT_GORILLA_EULE, 'eule'], ['tierM', TEXT_GORILLA_ELCH, 'elch']], () => {
      wi.gorillaBesprochen = true;
      if(story.stelleZustand('tisch_foto') !== 'fertig') story.sprich(TEXT_ERST_FOTO); else wegPruefen();
    }));
  }
};
function updateWeg(){
  if(!eva || (story.imBoot && story.imBoot())) return;
  const p = eva.group.position, drin = Math.hypot(p.x - WEG_REIN.x, p.z - WEG_REIN.z) < WEG_REIN.r;
  // waehrend einer Aktion (story.aktionLaeuft) geht es nicht weiter in den Wald: wie an einer Wand zurueck an den Rand des
  // Ausloesers (und auf dem Weg nicht daran vorbei)
  if(drin && (wi.reise || wi.wegFrei) && story.aktionLaeuft && story.aktionLaeuft()){
    const dx = p.x - WEG_REIN.x, dz = p.z - WEG_REIN.z, l = Math.hypot(dx, dz) || 1, vx = ZURUECK.x - WEG_REIN.x, vz = ZURUECK.z - WEG_REIN.z, vl = Math.hypot(vx, vz);
    const ux = dx * vx + dz * vz > 0 ? dx / l : vx / vl, uz = dx * vx + dz * vz > 0 ? dz / l : vz / vl;   // immer zur Lichtung hin hinaus
    p.x = WEG_REIN.x + ux * WEG_REIN.r; p.z = WEG_REIN.z + uz * WEG_REIN.r; return; }
  // schon einmal bei der Hoehle gewesen: der Waldweg fuehrt mit einer kurzen Schwarzblende hinueber (dieselbe Insel)
  // schon einmal bei der Hoehle (auch vor einem Neuladen: story.e3Besucht im Spielstand) – der Globus kommt nur beim ersten Mal
  if(wi.reise || story.e3Besucht){ if(drin && story.e3Besucht && story.waldinselWechsel) story.waldinselWechsel(3); return; }
  if(!drin){ wi.amWeg = false; return; }
  if(wi.wegFrei){ wi.reise = true; story.globusReise(2, story.e3Wechsel ? () => story.e3Wechsel() : null); return; }   // hoehle.js: Etappe 3
  if(!wi.amWeg){ wi.amWeg = true; story.sprich(wi.gorillaGesagt ? TEXT_ERST_FOTO : TEXT_WEG_NOCH_NICHT); }
}
// Untergrund (Engine untergrundAt): die Waldinsel liegt unter Schnee, nur der Waldweg ist Erde (Etappe 3: dazu Weg und Piste,
// hoehle.js story.e3Erde); Strand und Wasser kennt die Engine selbst
if(story.untergrundHook) story.untergrundHook((x, z) => {
  if(story.etappe !== 2 && story.etappe !== 3) return undefined;
  if(!isOnLand(x, z)) return undefined;                                            // global-ok: Engine
  if(abstandZumWeg(x, z) < 1.8 || (story.e3Erde && story.e3Erde(x, z))) return 'erde';
  return 'schnee';
});
const ZURUECK = { x: 11.2, z: 45.5 };                // zwischen Wegeingang (WEG) und WEG_REIN
// Die Lichtung gibt es auch, wenn man in Etappe 3 neu geladen hat (Fliegen: von oben zu sehen; zurueckgehen): dann wird sie
// nachgebaut, und alles dort gilt als erledigt (Joshi war ja schon da)
story.e2Bauen = function(){ if(wi.gebaut) return; baue(); wi.angekommen = wi.losGerufen = true; wi.spurGesagt = wi.spurBesprochen = wi.gorillaBesprochen = wi.wegFrei = wi.reise = true; };
story.e2Voegel = (an) => voegel(an);
story.e2Zurueck = function(){
  story.e2Bauen();
  story.etappe = 2; story.ziel = null;
  if(!eva) return;
  const { x, z } = story.freierPlatz(ZURUECK.x, ZURUECK.z, 'joshi');
  eva.group.position.set(x, evaFootY(x, z), z); eva.vy = 0;
  eva.yaw = Math.atan2(x - LICHTUNG.x, z - LICHTUNG.z); eva.group.rotation.y = eva.yaw;   // Blick zur Lichtung
  if(typeof evaOrbit !== 'undefined'){ evaOrbit = 0; evaPitch = 0; }                         // global-ok: Engine
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(eva.group.position).addScaledVector(back, 5).add(new THREE.Vector3(0, 2, 0));   // global-ok: Engine
  if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: x - 1.2, z: z + 1.0, blick: eva.yaw + Math.PI, modus: 'streifen', sitzt: false, warte: 1 });
};
// Tatortfoto (notizbuch.js 'tisch_foto'): nur der Tisch mit Resten und Spuren – die Tiere sind fuer das Bild weg
story.e2FotoAusblenden = () => wi.tiere.map(t => t.obj);
// Live-Wunsch 22.10.2026: die beiden Ringe erscheinen, sobald Joshi mit den Tieren gesprochen hat – ohne neues X und ohne
// Ansage (Weihnachtsbaum und Waldweg spielen dafuer keine Rolle); der Fuchs zeigt sie. TEXT_SPUR nur noch ueber die Hilfe-Taste.
function spurPruefen(){
  if(wi.spurGesagt || !alleTiereGehoert()) return;
  wi.spurGesagt = true;
  for(const id of ['tisch_foto', 'weg_lupe']){ const k = story.kreisZielVon && story.kreisZielVon(id); if(k) k.frei = true; }
  story.spaeter(0.8, () => { if(eva && story.fuchsRundgang) story.fuchsRundgang(eva.group.position.x, eva.group.position.z, false, 0, true,
    o => o === story.kreisZielVon('tisch_foto') || o === story.kreisZielVon('weg_lupe')); });
}
// Hinweis-Taste auf der Waldinsel (story.js hinweisGeben fragt zuerst hier): null = die allgemeinen Saetze
story.e2Hinweis = function(){
  if(wi.wegFrei) return TEXT_HINWEIS_WEG;
  if(!wi.spurGesagt && !alleTiereGehoert()) return TEXT_HINWEIS_TIERE;     // noch nicht bei allen Tieren gewesen
  if(!wi.spurGesagt || !story.stelleZustand) return null;
  const foto = story.stelleZustand('tisch_foto'), lupe = story.stelleZustand('weg_lupe');
  if(foto === 'zu' || lupe === 'zu') return TEXT_SPUR;
  if(foto === 'offen') return TEXT_HINWEIS_RING;
  if(lupe === 'offen') return TEXT_HINWEIS_LUPE;
  return null;
};
// Hoehe der Fuesse: Bank, Tisch oder Boden
function sitzY(T){
  if(T.sitz === 'bank') return ISLAND_Y + 0.45;
  if(T.sitz === 'tisch') return ISLAND_Y + TISCH.H;
  return ISLAND_Y;
}
// Entdeckt (der Fuchs markiert): das Tier schaut kurz auf – naechster Clip (umschauen), dann zurueck
function tierFreut(tier){
  if(tier.acts.length > 1) clipWechsel(tier, 1);
}
function clipWechsel(tier, i){
  if(i === tier.cur || !tier.acts[i]) return;
  const alt = tier.acts[tier.cur], neu = tier.acts[i];
  neu.reset(); neu.play(); neu.crossFadeFrom(alt, 0.5, false);
  tier.cur = i; tier.t = 0; tier.wechsel = i === 0 ? 6 + Math.random() * 6 : neu.getClip().duration;
}

// ---- Aufbauen ------------------------------------------------------------------------------------------------------
function baue(){
  if(wi.gebaut) return; wi.gebaut = true;
  const w = story.welt(2), R = story.insel.R;
  w.add(schneeDecke(R * 0.98));
  const weg = baueWeg(); w.add(weg.boden); w.add(weg.wegweiser); story.ding(weg.wegweiser, { welt: 2, typ: 'wegweiser' });
  wi.schale = story.setze('bananenschale', 2, { x: SCHALE.x, z: SCHALE.z, dreh: SCHALE.dreh, fest: true }).obj;
  wi.tisch = story.setze('festtisch', 2, { x: TISCH.x, z: TISCH.z, dreh: TISCH.dreh, fest: true }).obj;
  // Lagerfeuer (Typ aus insel.js) – Licht und Animation selbst, das Feuer von Etappe 1 gehoert insel.js
  story.setze('lagerfeuer', 2, { x: FEUER.x, z: FEUER.z, fest: true }).bereit.then(d => feuerAn(d.obj));
  // Funkgeraet (Live-Wunsch 26.10.2026): vom Tisch aus gesehen rechts neben dem Lagerfeuer, der Lautsprecher zum Tisch
  if(story.funkgeraetSetzen){ const f = { x: FEUER.x - TISCH.x, z: FEUER.z - TISCH.z }, l = Math.hypot(f.x, f.z), x = FEUER.x - f.z / l * 1.7, z = FEUER.z + f.x / l * 1.7;
    story.funkgeraetSetzen({ welt: 2, x, z, dreh: Math.atan2(TISCH.x - x, TISCH.z - z) }); }
  // Weihnachtsbaum
  {  // synchron (bau ist kein Promise): die Laempchen muessen vor zusammenfassen() in wi.lichter sein
    const d = story.setze('tanne', 2, { x: BAUM.x, z: BAUM.z, h: BAUM.h, schmuck: 'gross', farbe: 2, fest: true });
    d.obj.traverse(o => { if(o.userData.lichterkette) wi.lichter.push(o); });
    story.interaktion(d.obj, { name: 'Weihnachtsbaum', welt: 2, x: BAUM.x, z: BAUM.z, r: 1.6, yHoehe: BAUM.h + 0.6, einmal: true, text: TEXT_BAUM }); }
  // Nadelwald rundherum: dicht ab WALD_AB, nicht auf dem Sand, nicht am Steg; ein paar einzelne naeher an der Lichtung
  let s = 23; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const baeume = [];
  // Live-Wunsch 21.10.2026: hinter dem Lagerplatz Platz fuer die schoenen (verschneiten) Baeume, links und rechts im
  // Hintergrund dichter Wald. Abstand je nach Lage: hinter der Lichtung (Blick vom Steg geradeaus) locker, seitlich und
  // weiter hinten eng.
  const abstand = (x, z) => { const vorne = Math.abs(x) < 16 && z > 40 && z < 100;          // Blick von der Wiese auf die Lichtung
    return vorne ? 4.4 : 2.9; };
  for(let i = 0; i < 1400 && baeume.length < 290; i++){
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * R * 0.94, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const dL = Math.hypot(x - LICHTUNG.x, z - LICHTUNG.z);
    if(dL < WALD_AB - 4 + rnd() * 6) continue;                   // die Lichtung bleibt frei (ausgefranster Rand)
    if(Math.abs(x) < 6 && z > 78) continue;                      // Blick vom Steg zur Lichtung frei
    if(abstandZumWeg(x, z) < WEG_FREI + 1.2) continue;           // der Waldweg bleibt frei (die Gasse setzt eigene Baeume)
    if(baeume.some(b => Math.hypot(b.x - x, b.z - z) < abstand(x, z))) continue;
    baeume.push({ x, z });
    story.setze('tanne', 2, { x, z, h: 6 + rnd() * 6, farbe: Math.floor(rnd() * 3), dreh: rnd() * 6.3, schmuck: dL < WALD_AB + 6 && rnd() < 0.35 ? 'klein' : null, fest: true });
  }
  // Gasse am Waldweg: ab kurz hinter dem Ring je Seite eine Reihe dunkler Tannen dicht am Weg, eine zweite dahinter
  const kurve = new THREE.CatmullRomCurve3(WEG_LINIE.map(p => new THREE.Vector3(p.x, 0, p.z)));
  for(let i = 0; i < 40; i++){
    const u = 0.05 + i / 40 * 0.6, p = kurve.getPointAt(u), t = kurve.getTangentAt(u);   // Gasse vom Eingang ein gutes Stueck in den Wald
    for(const seite of [-1, 1]) for(const reihe of [0, 1, 2]){
      if(reihe === 1 && i % 2) continue; if(reihe === 2 && i % 3) continue;
      // am Eingang (bis zum Ausloeser der Reise, WEG_REIN) etwas weiter, damit die Kamera hinter Joshi nicht in den Aesten
      // haengt; danach eng
      const auf = Math.max(0, 1 - Math.hypot(p.x - WEG.x, p.z - WEG.z) / 14);
      const ab = WEG_GASSE + auf * 1.6 + reihe * 2.4 + rnd() * 0.5, x = p.x - t.z * seite * ab, z = p.z + t.x * seite * ab;
      if(Math.hypot(x - SCHALE.x, z - SCHALE.z) < 3) continue;   // der braune Ring bleibt offen
      story.setze('tanne', 2, { x, z, h: 9 + rnd() * 5, dunkel: true, schmal: true, schnee: false, dreh: rnd() * 6.3, fest: true });
      baeume.push({ x, z });
    }
  }
  // Aeste ueber dem Weg (Live-Wunsch: "ab der dritten, vierten Baumreihe die Aeste auch ueber den Weg wachsen lassen") –
  // dunkle, flache, schraege Astkegel von beiden Seiten, die sich ueber der Wegmitte treffen; unten frei ab ~2,6 m
  // (Joshi 1,2 m, Kamera ~2 m dahinter) – eine Art Dach, darunter wird es dunkel. Alle in EINEM Mesh (Zeichenaufrufe).
  wi.dunkel = [aesteUeberWeg(kurve)]; w.add(wi.dunkel[0]);
  // Schatten ueber dem Weg im Wald (dunkler Streifen, weich) – der Eingang wirkt duester
  wi.dunkel.push(wegSchatten(kurve)); w.add(wi.dunkel[1]);
  // Dunst im Wald: schon von der Lichtung aus zu sehen (nicht erst beim Betreten)
  wi.nebel = story.waldNebel({ welt: 2, linie: WEG_LINIE, von: 0.1, bis: 0.62, farbe: 0xb4c2cf });
  // Lichterketten zwischen den vordersten Baeumen um die Lichtung (etwas Weihnachtsschmuck an den Baeumen)
  const rand = baeume.filter(b => Math.hypot(b.x - LICHTUNG.x, b.z - LICHTUNG.z) < WALD_AB + 5 && b.z < LICHTUNG.z + 8)
    .sort((a, b) => Math.atan2(a.z - LICHTUNG.z, a.x - LICHTUNG.x) - Math.atan2(b.z - LICHTUNG.z, b.x - LICHTUNG.x));
  for(let i = 0; i + 1 < rand.length; i += 2){ const a = rand[i], b = rand[i + 1];
    if(Math.hypot(a.x - b.x, a.z - b.z) < 9){ const gl = girlande(a, b, 3.2, 14); w.add(gl); gl.traverse(o => { if(o.userData.lichterkette) wi.lichter.push(o); }); } }
  story.lagerAm = { x: FEUER.x, z: FEUER.z };
  for(const T of TIERE) tierLaden(T);
  zusammenfassen(w);
}
// Zeichenaufrufe (gemessen 1136 nach dem dichteren Wald – Ziel: unter Etappe 1): alle Tannen ausser dem Weihnachtsbaum je
// Material zu EINEM Mesh, alle Laempchen je Farbe in ein InstancedMesh. Die Original-Meshes bleiben unsichtbar stehen – sie
// sind die Grenzen (objekte.js braucht nur Geometrie und Matrix, nicht die Sichtbarkeit).
const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
story.tannenZusammen = (n) => zusammenfassen(story.welt(n), n);
function zusammenfassen(w, weltN){
  weltN = weltN || 2;
  w.updateMatrixWorld(true);
  const proMat = new Map();
  for(const d of story.dinge){
    if(d.welt !== weltN || (d.typ !== 'tanne' && d.typ !== 'felsbrocken') || !d.obj) continue;
    let istBaum = false; d.obj.traverse(o => { if(o.userData.lichterkette) istBaum = true; }); if(istBaum) continue;   // der Weihnachtsbaum leuchtet beim Suchblick
    d.obj.traverse(o => { if(!o.isMesh || !o.visible) return;
      if(!proMat.has(o.material)) proMat.set(o.material, []); proMat.get(o.material).push(o); });
  }
  for(const [mat, liste] of proMat){
    const n = liste.reduce((a, o) => a + o.geometry.attributes.position.count, 0), hatFarbe = !!liste[0].geometry.attributes.color;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = hatFarbe ? new Float32Array(n * 3) : null;
    let i = 0;
    for(const o of liste){ const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
      P.set(g.attributes.position.array, i * 3); N.set(g.attributes.normal.array, i * 3); if(C && g.attributes.color) C.set(g.attributes.color.array, i * 3);
      i += g.attributes.position.count; g.dispose(); o.visible = false; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    if(C) geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const m = new THREE.Mesh(geo, mat); m.userData.deko = true; m.castShadow = true; w.add(m);
  }
  if(weltN !== 2) return;
  // Laempchen: je Material (Farbe) ein InstancedMesh; wi.lichter wird zur Liste { im, i, p, s } fuer das Funkeln
  const proL = new Map();
  for(const l of wi.lichter){ if(!proL.has(l.material)) proL.set(l.material, []); proL.get(l.material).push(l); }
  const neu = [];
  for(const [mat, liste] of proL){
    const im = new THREE.InstancedMesh(liste[0].geometry, mat, liste.length); im.userData.deko = true; im.frustumCulled = false;
    liste.forEach((l, k) => { l.updateMatrixWorld(true); l.matrixWorld.decompose(_p, _q, _s); im.setMatrixAt(k, l.matrixWorld); l.visible = false;
      neu.push({ im, i: k, p: _p.clone(), s: _s.x }); });
    w.add(im);
  }
  wi.lichter = neu;
}
// insel.js (Typ 'lagerfeuer', danach) gibt dem Feuer Licht, Animation und das Y – das gilt fuer die Heimatinsel. Hier
// braucht das Feuer kein Y (Live-Wunsch 21.10.2026): die Interaktion faellt weg, Licht und Flackern bleiben.
function feuerAn(m){
  const L = story.interListe, i = L.findIndex(o => o.obj === m);
  if(i >= 0) L.splice(i, 1);
}

// ---- Ankunft ----------------------------------------------------------------------------------------------------
// Live-Wunsch 21.10.2026: wie in Trip to Japan – nach dem Globus steht Joshi gleich auf der Waldinsel (kein Neuladen,
// kein Startbildschirm). Er steht auf der Wiese zwischen Steg und Lichtung und schaut zum Tisch (Blick wie auf dem
// Live-Bild), der Fuchs neben ihm; das Segelboot liegt am Steg. Gleicher Startplatz nach einem Neuladen (Spielstand).
const START = { x: 0.6, z: 86, blick: { x: 0, z: 68 } };
function setzeStart(){
  if(!eva) return;
  const { x, z } = story.freierPlatz(START.x, START.z, 'joshi');
  eva.group.position.set(x, evaFootY(x, z), z); eva.vy = 0;
  eva.yaw = Math.atan2(x - START.blick.x, z - START.blick.z); eva.group.rotation.y = eva.yaw;   // Engine: Nase -Z
  if(typeof evaOrbit !== 'undefined'){ evaOrbit = 0; evaPitch = 0; }
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));                 // Kamera gleich hinter Joshi
  camera.position.copy(eva.group.position).addScaledVector(back, 5).add(new THREE.Vector3(0, 2, 0));
  if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: x - 1.3, z: z - 0.8, blick: eva.yaw + Math.PI, modus: 'streifen', sitzt: true, warte: 2 });
}
// Nach dem Neuladen (story.js STORY_START): vor dem Startbildschirm
story.e2StartSzene = function(){ baue(); setzeStart(); };
// Nach "Los geht's" bzw. direkt nach dem Globus: kurz warten, dann die Erzaehlerin
story.e2Los = function(){
  if(wi.angekommen || wi.losGerufen) return; wi.losGerufen = true;
  story.spaeter(1.2, () => { if(wi.angekommen) return; wi.angekommen = true; story.sprich(TEXT_ANKUNFT); });   // Testzugang setzt angekommen vorher
};
// Testzugaenge (story.js Startbildschirm): 'spuren' = die Tiere haben erzaehlt, beide Ringe sind offen; 'weg' = dazu Foto
// und Lupe gemacht (echte Bilder im Notizbuch), beide Gespraeche vorbei, der Weg in den Wald frei. Wartet, bis die Tiere
// geladen sind (ihre Interaktionen entstehen erst dann).
story.testE2 = function(stufe){
  if(stufe !== 'spuren' && stufe !== 'weg') return;
  const warte = () => { if(wi.tiere.length < TIERE.length || !story.interListe.some(o => o.name === 'Tiere am Tisch')){ story.spaeter(0.2, warte); return; }
    for(const o of story.interListe) if(o.welt === 2){ o.entdeckt = true; o.frei = true; o.benutzt = Math.max(1, o.benutzt); if(o.einmal) o.erledigt = true; }
    if(story.hinweisStand) story.hinweisStand.aussenGeschaut = true;
    wi.angekommen = true; wi.spurGesagt = true;
    for(const id of ['tisch_foto', 'weg_lupe']) if(story.testStelleFrei) story.testStelleFrei(id);
    if(stufe !== 'weg') return;
    story.testStelle('tisch_foto').then(() => story.testStelle('weg_lupe')).then(() => {
      wi.spurGefragt = wi.spurBesprochen = wi.gorillaGesagt = wi.gorillaBesprochen = wi.wegFrei = wi.fuchsZurLupe = true; });
  };
  warte();
};
// Direkt aus Etappe 1 (globus.js, im Schwarzen): umschalten ohne Neuladen. Joshi sitzt noch im Boot – steg.js legt es an
// und laesst ihn aussteigen; die Inselzelle 0, 0 wird mit Winterwiese neu gebaut (insel.js fragt story.etappe); Steg und
// Boot ziehen in die Welt der Waldinsel um; Tageshimmel, Licht.
story.e2Wechsel = function(){
  story.etappe = 2; story.ziel = null;                            // das Segelziel von Etappe 1 gilt hier nicht mehr
  if(story.etappeWechsel) story.etappeWechsel(2);                  // story.js: Hinweis-Stand, Inselzelle; steg.js: Steg/Boot
  hookWald(); baue(); setzeStart(); story.e2Los();
};

// ---- Geraeusche im Wald (Live-Wunsch 21.10.2026) ------------------------------------------------------------------
// Ist Joshi auf dem Waldweg im Wald (wegTiefe > 0), ruft ab und zu eine Eule ("owl" von freesound_community, Pixabay –
// eule_snd.js) und ganz leise knackt irgendwo Holz ("breaking wood" von Dragon Studio, Pixabay – holz_snd.js), je von
// einer zufaelligen Seite. Die Takte laufen ueber story.spaeter: in Pause und Inventar steht alles.
// Live-Befund 21.10.2026: das Knacken war nicht zu hoeren (0,06), die Eule kam erst mit dem Globus – jetzt laeuft beides
// schon ab dem Eingang des Wegs (WEG), die Eule gleich, das Holz nach ~2 s
// Live-Befund 22.10.2026: das Knacken klang "wie ein Knacksen des Lautsprechers" – die Aufnahme ist 8 s lang und meist fast
// still, dazwischen einzelne harte Spitzen; leise abgespielt blieben nur die Spitzen. Jetzt: ein zusammenhaengendes Stueck
// (HOLZ_STUECK, beginnt kurz vor dem lautesten Bruch bei ~1,4 s) mit weichem Ein- und Ausblenden, ein Tiefpass nimmt das
// Harte, und etwas lauter.
const WALD_TON = { eule: { vol: 0.35, pause: [8, 13] }, holz: { vol: 0.42, pause: [5, 10] } };
const HOLZ_STUECK = { ab: 1.1, lang: 2.6, ein: 0.06, aus: 0.7, tief: 2600 };
const ton = { eule: null, holz: null, laedt: false, an: false };
function waldTonLaden(){
  if(ton.laedt || typeof decodeSound !== 'function' || !audioCtx) return; ton.laedt = true;
  if(window.EULE_SND) decodeSound(window.EULE_SND).then(b => { ton.eule = b; }).catch(e => console.warn('Eule-Ton', e));
  if(window.HOLZ_SND) decodeSound(window.HOLZ_SND).then(b => { ton.holz = b; }).catch(e => console.warn('Holz-Ton', e));
}
function waldTon(n){
  const buf = ton[n]; if(!buf || !soundOn || !audioCtx || audioCtx.state !== 'running') return;
  const q = audioCtx.createBufferSource(), g = audioCtx.createGain(); q.buffer = buf;
  g.gain.value = WALD_TON[n].vol * (0.8 + Math.random() * 0.4);
  q.playbackRate.value = 0.94 + Math.random() * 0.12;               // nie zweimal ganz gleich
  let ziel = g;
  if(n === 'holz'){
    const H = HOLZ_STUECK, t0 = audioCtx.currentTime, v = g.gain.value, lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = H.tief; lp.connect(g);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + H.ein); g.gain.setValueAtTime(v, t0 + H.lang - H.aus); g.gain.linearRampToValueAtTime(0, t0 + H.lang);
    if(audioCtx.createStereoPanner){ const p = audioCtx.createStereoPanner(); p.pan.value = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.5); g.connect(p); ziel = p; }
    q.connect(lp); ziel.connect(audioCtx.destination); q.start(t0, H.ab, H.lang + 0.05); return;
  }
  if(audioCtx.createStereoPanner){ const p = audioCtx.createStereoPanner(); p.pan.value = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.5); g.connect(p); ziel = p; }
  q.connect(g); ziel.connect(audioCtx.destination); q.start();
}
function waldTonTakt(n){
  const [a, b] = WALD_TON[n].pause;
  // nur auf der Waldinsel (Live-Befund 22.10.2026: vor der Hoehle knackte es weiter – updateE2 laeuft in Etappe 3 nicht
  // mehr, ton.an wurde nie zurueckgesetzt)
  story.spaeter(a + Math.random() * (b - a), () => { if(!ton.an || !e2()){ ton.an = false; return; } waldTon(n); waldTonTakt(n); });
}
// Nach der Hoehle (Live-Wunsch 22.10.2026): der Wald ist hell – kein Nebel, kein Schatten auf dem Weg, nicht dunkler; statt
// Uhu und Knacken zwitschern Voegel
// ---- Rueckkehr mit dem Bananenkorb (Live-Wunsch 22.10.2026, freiwillig) -------------------------------------------------
// Ist Joshi nach der Hoehle wieder an der Lichtung und hat den Korb im Inventar, ist ueber dem Tisch wieder ein Y: Joshi
// erzaehlt, warum der Gorilla die Bananen genommen hat – die Tiere sind betroffen, freuen sich und wollen ihn gleich besuchen
// (das sieht man nicht). Danach steht der Korb auf dem Tisch und ist nicht mehr im Inventar. Wer es nicht tut, behaelt den Korb.
const TEXT_KORB_JOSHI = ['Ich weiß jetzt, wer die Bananen genommen hat. Es war der Gorilla.',
  'Er war ganz doll traurig, weil sein Holzentchen kaputt war. Und niemand war da, mit dem er reden konnte.',
  'Er lässt sich bei euch entschuldigen. Hier sind eure Bananen.'];
const TEXT_KORB_HASE = ['Oh nein, der arme Gorilla! Das wussten wir ja gar nicht.'];
const TEXT_KORB_EULE = ['Hu-huu. Wir hätten mal nach ihm sehen sollen.'];
const TEXT_KORB_ELCH = ['Wie schön, dass die Bananen wieder da sind!'];
const TEXT_KORB_BESUCH = ['Wir gehen ihn gleich mal besuchen.'];
function korbAngebot(){
  if(wi.korbInter || wi.korbZurueck || !wi.hell || !(story.ausruestung && story.ausruestung.bananen) || !tierGruppe.children.length) return;
  wi.korbInter = story.interaktion(tierGruppe, { name: 'Bananen zurückbringen', welt: 2, x: 0, z: VORN, r: 1.6, yx: 0, yz: TISCH.z,
    yHoehe: TISCH.H + 1.15, einmal: true, entdeckt: true, aktion: (o) => korbZurueckgeben(o) });
}
function korbZurueckgeben(o){
  o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; o.spricht = true;
  gespraech([['joshi', TEXT_KORB_JOSHI], ['tierW', TEXT_KORB_HASE, 'hase'], ['tierM', TEXT_KORB_EULE, 'eule'], ['tierM', TEXT_KORB_ELCH, 'elch'], ['tierW', TEXT_KORB_BESUCH, 'hase']], () => { o.spricht = false; });
  // der Korb wandert aus dem Rucksack auf den Tisch, sobald Joshi ihn uebergibt (nach seinen Saetzen)
  story.spaeter(TEXT_KORB_JOSHI.reduce((s, x) => s + 0.6 + x.length / 14, 0), () => {
    if(story.ausruestung) story.ausruestung.bananen = false; wi.korbZurueck = true;
    if(story.bananenModell){ const k = story.bananenModell(); k.scale.multiplyScalar(0.9); k.position.set(TISCH.x + 0.6, ISLAND_Y + TISCH.H, TISCH.z); k.rotation.y = 0.4; story.welt(2).add(k); }
  });
}
function waldHell(){
  if(wi.hell) korbAngebot();
  if(!story.e3Besucht || wi.hell) return; wi.hell = true; ton.an = false;
  if(wi.nebel && wi.nebel.aus) wi.nebel.aus();
  for(const o of wi.dunkel || []) if(o) o.visible = false;
}
// Vogelgezwitscher: "birds singing" von oliviaaydin (Pixabay, voegel_snd.js), 19,6 s in Schleife, weich ein- und ausgeblendet
const VOEGEL_VOL = 0.8, VOEGEL_BLENDE = 1.2;
const vogel = { buf: null, laedt: false, src: null, gain: null };
function voegel(an){
  if(an && !vogel.buf && !vogel.laedt && window.VOEGEL_SND && typeof decodeSound === 'function' && audioCtx){ vogel.laedt = true;   // global-ok: Engine
    decodeSound(window.VOEGEL_SND).then(b => { vogel.buf = b; }).catch(e => console.warn('Voegel', e)); }
  if(!audioCtx) return;                                               // global-ok: Engine
  const t = audioCtx.currentTime;
  if(an && !vogel.src && vogel.buf && soundOn && audioCtx.state === 'running'){   // global-ok: Engine
    const q = audioCtx.createBufferSource(), g = audioCtx.createGain(); q.buffer = vogel.buf; q.loop = true;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(VOEGEL_VOL, t + VOEGEL_BLENDE);
    q.connect(g); g.connect(audioCtx.destination); q.start(); vogel.src = q; vogel.gain = g;
  } else if(!an && vogel.src){ const q = vogel.src, g = vogel.gain; vogel.src = null; vogel.gain = null;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + VOEGEL_BLENDE);
    try { q.stop(t + VOEGEL_BLENDE + 0.1); } catch(e){} }
}
function updateWaldTon(){
  const drin = !!(eva && abstandZumWeg(eva.group.position.x, eva.group.position.z) < 4.5 && Math.hypot(eva.group.position.x - WEG.x, eva.group.position.z - WEG.z) < 60
    && eva.group.position.z < WEG.z + 1.5);                         // ab dem Eingang des Wegs (am Wegweiser) in den Wald hinein
  if(wi.hell){ ton.an = false; voegel(drin && e2()); return; }
  if(drin) waldTonLaden();
  if(drin && !ton.an){ ton.an = true; story.spaeter(0.3, () => { if(ton.an && e2()) waldTon('eule'); }); story.spaeter(2.2, () => { if(ton.an && e2()) waldTon('holz'); });
    waldTonTakt('eule'); waldTonTakt('holz'); }
  else if(!drin) ton.an = false;
}

// ---- Jedes Bild ------------------------------------------------------------------------------------------------
story.updateE2 = function(dt){
  if(!e2()) return;
  baue();
  wi.t += dt;
  // (Feuer: Flackern und Animation macht insel.js updateE1 fuer jedes gesetzte Lagerfeuer)
  if(wi.schale) schaleAnimieren(wi.schale, wi.t);                  // die Ameisen krabbeln (aus der Naehe gerade so zu sehen)
  updateWeg();
  if(story.gestartet) waldTonLaden();
  waldHell();                                                      // nach der Hoehle: heller Wald, Korb zurueckbringen
  updateWaldTon();
  // Lichterketten funkeln leicht
  const geaendert = new Set();
  for(let i = 0; i < wi.lichter.length; i++){ const l = wi.lichter[i], k = l.s * (0.85 + 0.3 * (0.5 + 0.5 * Math.sin(wi.t * 2.2 + i * 1.7)));
    l.im.setMatrixAt(l.i, _m.compose(l.p, _q.identity(), _s.set(k, k, k))); geaendert.add(l.im); }
  for(const im of geaendert) im.instanceMatrix.needsUpdate = true;
  // Tiere: Ruhe-Clip, ab und zu umschauen / putzen; sprechendes Tier schaut zu Joshi
  const fig = eva && eva.group.position;
  for(const tier of wi.tiere){
    tier.mixer.update(dt);
    tier.t += dt;
    if(tier.t > tier.wechsel){ if(tier.cur === 0 && tier.acts.length > 1) clipWechsel(tier, 1 + Math.floor(Math.random() * (tier.acts.length - 1))); else clipWechsel(tier, 0); }
    // nah dran: zu Joshi drehen (sanft, hoechstens 50 Grad aus der Sitzrichtung)
    if(fig){ const d = Math.hypot(fig.x - tier.T.x, fig.z - tier.T.z);
      let soll = tier.T.blick;
      if(d < 5){ const zu = Math.atan2(fig.x - tier.T.x, fig.z - tier.T.z); let w = zu - tier.T.blick; w = Math.atan2(Math.sin(w), Math.cos(w)); soll = tier.T.blick + Math.max(-0.9, Math.min(0.9, w)); }
      let dw = soll - tier.obj.rotation.y; dw = Math.atan2(Math.sin(dw), Math.cos(dw)); tier.obj.rotation.y += dw * Math.min(1, dt * 2); }
  }
};

// ---- Hooks -------------------------------------------------------------------------------------------------------
// Tag (Konzept: "es ist Tag"): Engine-Tageshimmel mit Sonne und Wolken; Sternbilder aus (sternbilder.js fragt
// story.nacht ab). Der Nachthimmel (story.js hookNacht) gilt nur in Etappe 1.
function hookWald(){
  if(!e2()) return;
  setSky('day');                                                // global-ok: Engine
  story.nacht = false;
  if(typeof starDome !== 'undefined' && starDome) starDome.visible = false;   // Sterne vom Nachthimmel (Wechsel ohne Neuladen)
}
// Licht (Live-Wunsch 21.10.2026: "wirkt zu ueberstrahlt, deutlich dezenter"): der Tageshimmel der Engine stellt Streulicht
// 1,0 und Sonne 0,85 ein – das ist fuer die gruene Flugspiel-Welt gedacht; auf weissem Schnee blendet es. Hier nach jedem
// Bild der Engine (updateSpaceBlend) gedaempft, der Himmel etwas blasser (Winter), leichter Dunst in der Ferne.
const LICHT = { hemi: 0.62, sonne: 0.58, himmel: new THREE.Color(0x9fb8d2), nebelNah: 60, nebelFern: 420 };
const WALD_DUNKEL = { ab: 2, lang: 10, farbe: new THREE.Color(0x24302c) };   // m im Wald: ab da dunkler, nach 'lang' m voll
const _wc = new THREE.Color();
// Wie weit ist (x, z) schon im Wald? Laenge entlang des Wegs ab dem Eingang (WEG), nur wenn nahe am Weg; sonst 0
function wegTiefe(x, z){
  if(abstandZumWeg(x, z) > 4.5) return 0;
  let best = Infinity, lang = 0, L = 0;
  for(let i = 0; i + 1 < WEG_LINIE.length; i++){ const a = WEG_LINIE[i], b = WEG_LINIE[i + 1], dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz);
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (l * l))), d = Math.hypot(x - a.x - dx * t, z - a.z - dz * t);
    if(d < best){ best = d; lang = L + t * l; } L += l; }
  const ein = Math.hypot(WEG.x - WEG_LINIE[0].x, WEG.z - WEG_LINIE[0].z);   // der Eingang liegt ein Stueck nach dem Wegbeginn
  return Math.max(0, lang - ein);
}
function hookLicht(){
  const orig = updateSpaceBlend;
  updateSpaceBlend = function(){
    const r = orig.apply(this, arguments);
    if(e2() && locale === 'earth' && spaceBlend < 0.05){
      // im Wald (Live-Wunsch 21.10.2026: "ab hinter der Lichterkette langsam abblendend etwas dunkler"): wald 0..1 nach dem
      // Weg, den Joshi schon im Wald ist (ab WALD_DUNKEL.ab m hinter dem Eingang, voll nach WALD_DUNKEL.lang m) – sanft
      const d = eva && !wi.hell ? wegTiefe(eva.group.position.x, eva.group.position.z) : 0;   // heller Wald: nicht dunkler
      const ziel = Math.max(0, Math.min(1, (d - WALD_DUNKEL.ab) / WALD_DUNKEL.lang));
      wi.wald += (ziel - wi.wald) * 0.05;
      const k = wi.wald * wi.wald * (3 - 2 * wi.wald);
      hemiLight.intensity = LICHT.hemi * (1 - 0.55 * k); sun.intensity = LICHT.sonne * (1 - 0.7 * k);
      _wc.copy(LICHT.himmel).lerp(WALD_DUNKEL.farbe, k);
      scene.background.copy(LICHT.himmel); scene.fog.color.copy(_wc);
      scene.fog.near = LICHT.nebelNah * (1 - 0.75 * k); scene.fog.far = LICHT.nebelFern * (1 - 0.7 * k);
    }
    return r;
  };
}
// ---- Die Waldinsel ist gross (Live-Wunsch 22.10.2026) ---------------------------------------------------------------------
// Etappe 2 und 3 liegen auf derselben Insel (eine Karte, hoehle.js MITTE_Z / insel.js etappeMitte): hier der Strand mit der
// Lichtung, landeinwaerts der dichte Wald, dahinter Berg, Piste und Hoehle. Joshi geht nicht durch den Wald hinaus (nur ueber
// den Waldweg): WALD_GRENZE um die Lichtung, landeinwaerts.
const WALD_GRENZE = 86, WALD_GRENZE_Z = 55;          // m ab der Mitte, landeinwaerts (z kleiner als WALD_GRENZE_Z)
function hookLand(){
  // nicht ueber den Waldrand hinaus landeinwaerts
  const evaOrig = updateEva;                                         // global-ok: Engine
  updateEva = function(){ const r = evaOrig.apply(this, arguments);
    if(e2() && eva && !eva.boat){ const p = eva.group.position, d = Math.hypot(p.x, p.z);
      if(d > WALD_GRENZE && p.z < WALD_GRENZE_Z){ const k = WALD_GRENZE / d; p.x *= k; p.z *= k; } }
    return r; };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookWald(); hookLicht(); hookLand(); };
})();
