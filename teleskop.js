// Das Geheimland – durch das Teleskop des Lamas schauen (Live-Wunsch 23.10.2026). Laedt nach observatorium_innen.js, vor
// der Engine. Freiwillig: fuer die Geschichte zaehlt es nicht – man darf, sobald alle Aufgaben der Etappe 4 erledigt sind
// (observatorium_innen.js zeigt dann am Teleskop ein Y).
// Ansicht: der Nachthimmel, rund wie durch ein Okular. Links/rechts/hoch/runter springt das Teleskop zum naechsten Objekt in
// dieser Richtung (wie im Inventar) und gleitet weich dorthin; die Stimme sagt seinen Namen. A: das Objekt wird gross, die
// Erzaehlerin erzaehlt ein paar Fakten. B: wieder hinaus – auch mitten in einer Erklaerung (sie hoert dann auf).
// Objekte: Sonne, Merkur, Venus, Mond, Mars, Jupiter, Saturn, Uranus, Neptun, Pluto (Modelle von Akshat, CC-BY-4.0), die
// Milchstrasse und die Sternbilder aus sternbilder.js. Die Erde fehlt (auf ihr steht man). Die Sonne steht – als Ausnahme
// in der Nacht – tief am Horizont. Auf dem Mond blinkt an einer Stelle etwas (wichtig fuer die Geschichte, das Lama
// erwaehnt es spaeter): Morsezeichen H A L L O, rot und blau.
(function(){
'use strict';
const story = window.STORY;
const FOV = 38;                         // Grad: Blickfeld im Okular
const R_HIMMEL = 900;                   // Radius der Himmelskugel (m, eigene Szene)
const GLEIT = 3.2;                      // wie schnell das Teleskop zum gewaehlten Objekt schwenkt (1/s)

// ---- Die Objekte: Richtung (Azimut 0 = Nord, 90 = Ost; Hoehe), Groesse am Himmel (Grad), Name, Fakten -----------------
// Fakten fuer Kinder: Entfernungen in km und Lichtminuten (Licht ist schnell: 300.000 km in einer Sekunde), Tag und Jahr,
// woraus er besteht, Alter, eine Besonderheit. Planeten: kleinste Entfernung zur Erde ("wenn er uns am naechsten ist").
// Modus 'mond' (story.teleskopAuf('mond'), Buero der Mondbasis, Live-Wunsch 28.10.2026): der Mond fehlt (auf ihm steht man),
// dafuer ist die Erde da; davor in der Runde zuerst drei Bilder von oben (ORTE, teleskop_bilder.js).
const PLANETEN = [
  { id: 'erde', glb: 'PLANET_ERDE_GLB', name: 'Die Erde', az: 100, h: 30, gr: 3.6, nurMond: true, fakten: [
    'Die Erde – unser Zuhause!',
    'Vom Mond aus ist sie ungefähr 384.000 Kilometer weit weg. Ihr Licht braucht etwas mehr als eine Sekunde bis hierher.',
    'Von hier oben sieht man die blauen Meere, die grünen Wälder und die weißen Wolken.',
    'Die Erde ist ungefähr 4,5 Milliarden Jahre alt. Sie ist der einzige Planet, auf dem wir Pflanzen und Tiere kennen.'] },
  { id: 'mond', glb: 'PLANET_MOND_GLB', nichtMond: true, name: 'Der Mond', az: 100, h: 30, gr: 3.2, fakten: [
    'Der Mond.',
    'Er ist unser Nachbar im Weltall und ungefähr 384.000 Kilometer von der Erde weg. Sein Licht braucht nur etwas mehr als eine Sekunde bis zu uns.',
    'Bis zur Sonne sind es 150 Millionen Kilometer – das Licht braucht dafür gut 8 Minuten.',
    'In 27 Tagen fliegt der Mond einmal um die Erde. Ein Tag auf dem Mond – von einem Sonnenaufgang bis zum nächsten – dauert fast einen ganzen Monat.',
    'Der Mond ist aus Gestein und ungefähr 4,5 Milliarden Jahre alt.',
    'Er zeigt uns immer dieselbe Seite. Und 1969 sind zum ersten Mal Menschen auf ihm herumgelaufen.'] },
  { id: 'mars', glb: 'PLANET_MARS_GLB', name: 'Mars', az: 140, h: 25, gr: 1.6, fakten: [
    'Der Mars, der rote Planet.',
    'Von der Sonne ist er 228 Millionen Kilometer weit weg, das sind fast 13 Lichtminuten.',
    'Wenn er uns ganz nah ist, sind es bis zur Erde 55 Millionen Kilometer, ungefähr 3 Lichtminuten.',
    'Ein Tag auf dem Mars dauert nur ein bisschen länger als bei uns: 24 Stunden und 37 Minuten. Ein Jahr dauert 687 Tage, fast zwei Erdenjahre.',
    'Er ist aus Gestein, und sein Staub ist rostig – darum ist er rot.',
    'Auf dem Mars steht der höchste Vulkan, den wir kennen: der Olympus Mons, fast dreimal so hoch wie der Mount Everest.',
    'Der Mars ist ungefähr 4,6 Milliarden Jahre alt und hat zwei kleine Monde.'] },
  { id: 'jupiter', glb: 'PLANET_JUPITER_GLB', name: 'Jupiter', az: 160, h: 17, gr: 2.4, fakten: [
    'Jupiter, der größte Planet.',
    'Er ist 778 Millionen Kilometer von der Sonne weg, das sind 43 Lichtminuten.',
    'Bis zur Erde sind es, wenn er uns am nächsten ist, fast 600 Millionen Kilometer – das Licht braucht dafür über eine halbe Stunde.',
    'Ein Tag dauert auf dem Jupiter nicht mal 10 Stunden. Für eine Runde um die Sonne braucht er aber fast 12 Jahre.',
    'Jupiter ist ein Gasriese aus Wasserstoff und Helium. Mehr als tausend Erden würden in ihn hineinpassen.',
    'Der große rote Fleck ist ein Sturm, der größer ist als die ganze Erde.',
    'Jupiter ist ungefähr 4,6 Milliarden Jahre alt und hat fast 100 Monde.'] },
  { id: 'saturn', glb: 'PLANET_SATURN_GLB', name: 'Saturn', az: 205, h: 22, gr: 2.6, fakten: [
    'Saturn, der Planet mit den Ringen.',
    'Er ist 1,4 Milliarden Kilometer von der Sonne weg, das Licht braucht dafür 80 Minuten.',
    'Bis zur Erde sind es mindestens 1,2 Milliarden Kilometer, über eine Stunde für das Licht.',
    'Ein Tag dauert auf dem Saturn nur gut 10 Stunden, ein Jahr aber fast 30 Erdenjahre.',
    'Saturn ist ein Gasriese aus Wasserstoff und Helium. Er ist so leicht, dass er in einer riesigen Badewanne schwimmen würde.',
    'Seine Ringe bestehen aus ganz vielen Stücken aus Eis und Gestein – manche sind klein wie Sandkörner, andere so groß wie ein Haus.',
    'Saturn ist ungefähr 4,6 Milliarden Jahre alt.'] },
  { id: 'uranus', glb: 'PLANET_URANUS_GLB', name: 'Uranus', az: 222, h: 31, gr: 1.6, fakten: [
    'Uranus.',
    'Er ist fast 3 Milliarden Kilometer von der Sonne weg, das Licht braucht dafür 2 Stunden und 40 Minuten.',
    'Bis zur Erde sind es mindestens 2,6 Milliarden Kilometer, fast zweieinhalb Stunden für das Licht.',
    'Ein Tag dauert 17 Stunden. Für eine Runde um die Sonne braucht er 84 Jahre.',
    'Uranus ist ein Eisriese aus Wasser, Ammoniak und Methan – das Methan macht ihn blaugrün.',
    'Das Besondere: Uranus liegt auf der Seite. Er rollt wie eine Kugel um die Sonne.',
    'Er ist ungefähr 4,6 Milliarden Jahre alt.'] },
  { id: 'neptun', glb: 'PLANET_NEPTUN_GLB', name: 'Neptun', az: 238, h: 37, gr: 1.5, fakten: [
    'Neptun, der äußerste Planet.',
    'Er ist 4,5 Milliarden Kilometer von der Sonne weg, das Licht braucht dafür gut 4 Stunden.',
    'Bis zur Erde sind es mindestens 4,3 Milliarden Kilometer, ungefähr 4 Stunden für das Licht.',
    'Ein Tag dauert 16 Stunden. Ein Jahr dauert 165 Erdenjahre.',
    'Neptun ist ein Eisriese aus Wasser, Ammoniak und Methan, darum ist er so tiefblau.',
    'Auf dem Neptun wehen die stärksten Stürme im ganzen Sonnensystem – über 2000 Kilometer in der Stunde.',
    'Er ist ungefähr 4,6 Milliarden Jahre alt.'] },
  { id: 'pluto', glb: 'PLANET_PLUTO_GLB', name: 'Pluto', az: 254, h: 42, gr: 1.1, fakten: [
    'Pluto.',
    'Er ist fast 6 Milliarden Kilometer von der Sonne weg, das Licht braucht dafür ungefähr fünfeinhalb Stunden. Bis zur Erde ist es ungefähr genauso weit.',
    'Ein Tag dauert auf dem Pluto über 6 Erdentage, ein Jahr 248 Erdenjahre.',
    'Pluto ist aus Gestein und Eis und kleiner als unser Mond.',
    'Das Besondere: Früher war Pluto der neunte Planet. Seit 2006 nennt man ihn einen Zwergplaneten, weil er so klein ist und es dort draußen viele ähnliche Eiswelten gibt.',
    'Auf seiner Oberfläche gibt es eine große helle Fläche aus Eis, die aussieht wie ein Herz.',
    'Pluto ist ungefähr 4,6 Milliarden Jahre alt.'] },
  { id: 'venus', glb: 'PLANET_VENUS_GLB', name: 'Venus', az: 270, h: 16, gr: 1.6, fakten: [
    'Venus.',
    'Sie ist 108 Millionen Kilometer von der Sonne weg, das sind 6 Lichtminuten.',
    'Sie kommt der Erde von allen Planeten am nächsten: bis auf 38 Millionen Kilometer, nur gut 2 Lichtminuten.',
    'Ein Tag auf der Venus dauert länger als ihr Jahr! Für eine Drehung braucht sie 243 Tage, für eine Runde um die Sonne nur 225.',
    'Sie dreht sich auch noch rückwärts: dort geht die Sonne im Westen auf.',
    'Venus ist aus Gestein, aber ihre dicke Luft hält die Wärme fest. Darum ist sie mit über 450 Grad der heißeste Planet.',
    'Sie ist ungefähr 4,6 Milliarden Jahre alt.'] },
  { id: 'merkur', glb: 'PLANET_MERKUR_GLB', name: 'Merkur', az: 282, h: 10, gr: 1.1, fakten: [
    'Merkur, der kleinste Planet.',
    'Er ist der Sonne am nächsten: 58 Millionen Kilometer, das Licht braucht dafür nur 3 Minuten.',
    'Bis zur Erde sind es mindestens 77 Millionen Kilometer, gut 4 Lichtminuten.',
    'Ein Jahr dauert auf dem Merkur nur 88 Tage. Ein Tag aber – von Sonnenaufgang bis Sonnenaufgang – dauert 176 Tage, also zwei Merkur-Jahre!',
    'Merkur ist aus Gestein mit einem großen Kern aus Eisen. Am Tag ist es dort glühend heiß und in der Nacht eiskalt.',
    'Er ist ungefähr 4,6 Milliarden Jahre alt und hat keinen Mond.'] },
  { id: 'sonne', glb: 'PLANET_SONNE_GLB', name: 'Die Sonne', az: 296, h: 5, gr: 4.5, leuchtet: true, fakten: [
    'Die Sonne.',
    'Sie ist ein Stern – eine riesige Kugel aus glühendem Gas, vor allem Wasserstoff und Helium.',
    'Von der Erde ist sie 150 Millionen Kilometer weit weg. Ihr Licht braucht gut 8 Minuten bis zu uns.',
    'Sie ist so groß, dass mehr als eine Million Erden hineinpassen würden. An ihrer Oberfläche ist es 5500 Grad heiß.',
    'Die Sonne dreht sich in ungefähr 25 Tagen einmal um sich selbst. Und für eine Runde um die Mitte der Milchstraße braucht sie 230 Millionen Jahre.',
    'Sie ist ungefähr 4,6 Milliarden Jahre alt.',
    'Schau aber nie mit bloßen Augen oder einem Fernrohr direkt in die echte Sonne – das ist gefährlich für die Augen!'] },
];
const ORTE = [
  { id: 'tisch', bild: 'tisch', name: 'Die Waldinsel', az: 76, h: 22, gr: 6, fakten: ['Ein guter Blick auf die Waldinsel und den Festtisch.'] },
  { id: 'hoehle', bild: 'hoehle', name: 'Die Höhle des Gorillas', az: 86, h: 14, gr: 6, fakten: ['Die Höhle des Gorillas.'] },
  { id: 'oase', bild: 'oase', name: 'Das Observatorium', az: 96, h: 22, gr: 6, fakten: ['Das Observatorium.'] },
];
const MILCHSTRASSE = { id: 'milchstrasse', name: 'Die Milchstraße', az: 300, h: 62, gr: 9, fakten: [
  'Die Milchstraße.',
  'Das ist unsere Galaxie – eine riesige Scheibe aus über 100 Milliarden Sternen. Unsere Sonne ist einer davon.',
  'Wir sehen sie als hellen Streifen am Himmel, weil wir selbst in dieser Scheibe wohnen und seitlich hineinschauen.',
  'Sie ist so groß, dass das Licht 100.000 Jahre braucht, um einmal quer hindurch zu fliegen.',
  'In ihrer Mitte sitzt ein riesiges Schwarzes Loch.',
  'Die Milchstraße ist ungefähr 13 Milliarden Jahre alt – viel älter als die Sonne.'] };
const STERNBILD_FAKTEN = {
  grosserBaer: { name: 'Der Große Bär', fakten: [
    'Der Große Bär.',
    'Seine sieben hellsten Sterne bilden den Großen Wagen: vier Sterne sind der Wagenkasten, drei die Deichsel.',
    'Wenn du die beiden hinteren Sterne des Kastens fünfmal verlängerst, findest du den Polarstern.',
    'Den Großen Wagen kann man bei uns das ganze Jahr über sehen.',
    'Seine Sterne sind so weit weg, dass ihr Licht viele Jahre bis zu uns braucht – beim hellsten über 120 Jahre.'] },
  kleinerBaer: { name: 'Der Kleine Bär', fakten: [
    'Der Kleine Bär, auch Kleiner Wagen.',
    'Ganz vorn an seiner Deichsel steht der Polarstern.',
    'Der Polarstern zeigt immer nach Norden. Er steht fast still, und alle anderen Sterne drehen sich um ihn. Seefahrer haben sich früher danach gerichtet.',
    'Sein Licht braucht über 400 Jahre bis zu uns.'] },
  kassiopeia: { name: 'Kassiopeia', fakten: [
    'Kassiopeia.',
    'Ihre fünf hellen Sterne sehen aus wie ein großes W.',
    'In einer alten griechischen Sage war Kassiopeia eine Königin, die sehr eitel war.',
    'Man findet sie auf der anderen Seite vom Polarstern, gegenüber vom Großen Wagen.'] },
  orion: { name: 'Orion', fakten: [
    'Orion, der Himmelsjäger.',
    'Die drei Sterne in seiner Mitte sind sein Gürtel.',
    'Der rötliche Stern oben ist Beteigeuze, ein Riesenstern: Stünde er an der Stelle unserer Sonne, würde er bis über die Bahn des Mars reichen.',
    'Der helle bläuliche Stern unten heißt Rigel.',
    'Orion sieht man am besten im Winter.'] },
};

// ---- Szene ------------------------------------------------------------------------------------------------------------
const tk = story.teleskop = { an: false, szene: null, kam: null, objekte: [], wahl: 0, blick: new THREE.Vector3(0, 0.5, -1).normalize(), nah: null, nahT: 0,
  fov: FOV, fovSoll: FOV, eingabe: { x: 0, y: 0, a: false, b: false }, sperre: 0, spricht: false, t: 0, bereit: false, laedt: 0 };
const dirAus = (az, h) => { const A = az * Math.PI / 180, H = h * Math.PI / 180; return new THREE.Vector3(Math.sin(A) * Math.cos(H), Math.sin(H), -Math.cos(A) * Math.cos(H)); };
function leuchtTex(innen, aussen){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, innen); gr.addColorStop(0.35, aussen); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
function bauen(){
  if(tk.szene) return;
  const s = tk.szene = new THREE.Scene();
  tk.kam = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 0.1, 3000);
  // Himmel: tiefes Blau zum Horizont, darunter dunkle Erde
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(R_HIMMEL + 50, 48, 24), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: (() => {
    const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#02030a'); gr.addColorStop(0.42, '#060a1e'); gr.addColorStop(0.495, '#16224a'); gr.addColorStop(0.505, '#05060a'); gr.addColorStop(1, '#020203');
    g.fillStyle = gr; g.fillRect(0, 0, 8, 256); return new THREE.CanvasTexture(c); })() }));
  s.add(himmel);
  // Sterne: viele kleine, einige helle (fest gesaet)
  let sd = 77; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for(const [n, gr, hell] of [[2600, 1.6, 0.75], [420, 2.6, 1.0]]){
    const pos = [];
    for(let i = 0; i < n; i++){ const z = rnd() * 1.1 - 0.1, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - z * z); pos.push(Math.cos(a) * r * R_HIMMEL, z * R_HIMMEL, Math.sin(a) * r * R_HIMMEL); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    s.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: gr, sizeAttenuation: false, transparent: true, opacity: hell, depthWrite: false })));
  }
  // Milchstrasse: ein breites, wolkiges Leuchtband als Grosskreis, der durch MILCHSTRASSE (und tief am Horizont) laeuft
  const mDir = dirAus(MILCHSTRASSE.az, MILCHSTRASSE.h), achse = new THREE.Vector3().crossVectors(mDir, dirAus(MILCHSTRASSE.az + 90, 0)).normalize();
  const band = document.createElement('canvas'); band.width = 1024; band.height = 128; const bg = band.getContext('2d');
  for(let i = 0; i < 2200; i++){ const x = rnd() * 1024, y = 64 + (rnd() + rnd() + rnd() - 1.5) * 34, r = 2 + rnd() * 14; const gr = bg.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(190,200,255,' + (0.05 + rnd() * 0.07) + ')'); gr.addColorStop(1, 'rgba(190,200,255,0)'); bg.fillStyle = gr; bg.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for(let i = 0; i < 1600; i++){ bg.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd() * 0.6) + ')'; bg.fillRect(rnd() * 1024, 64 + (rnd() + rnd() - 1) * 40, 1, 1); }
  for(let i = 0; i < 26; i++){ bg.fillStyle = 'rgba(0,0,0,0.25)'; bg.beginPath(); bg.ellipse(rnd() * 1024, 64 + (rnd() - 0.5) * 30, 20 + rnd() * 40, 4 + rnd() * 6, (rnd() - 0.5) * 0.4, 0, 7); bg.fill(); }   // Staubbaender
  const bandTex = new THREE.CanvasTexture(band); bandTex.wrapS = THREE.RepeatWrapping; bandTex.repeat.x = 3;
  const mw = new THREE.Mesh(new THREE.CylinderGeometry(R_HIMMEL, R_HIMMEL, R_HIMMEL * 0.32, 96, 1, true), new THREE.MeshBasicMaterial({ map: bandTex, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  mw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), achse); s.add(mw);
  // Licht fuer die Planeten (von der Sonne her) und etwas Grundlicht
  s.add(new THREE.AmbientLight(0xffffff, 0.35));
  const sl = new THREE.DirectionalLight(0xffffff, 1.2); sl.position.copy(dirAus(296, 5)).multiplyScalar(100); s.add(sl);
  // Ring um das gewaehlte Objekt (gelb, pulsiert)
  const rc = document.createElement('canvas'); rc.width = rc.height = 128; const rg = rc.getContext('2d'); rg.strokeStyle = '#f5c518'; rg.lineWidth = 7; rg.beginPath(); rg.arc(64, 64, 56, 0, 7); rg.stroke();
  tk.ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(rc), transparent: true, depthTest: false, depthWrite: false })); tk.ring.renderOrder = 10; s.add(tk.ring);
  // Gruenes A (Live-Wunsch 23.10.2026): klein unten mittig halb ueberlappend am Ring des gewaehlten Objekts – A = mehr erfahren
  tk.a = new THREE.Sprite(new THREE.SpriteMaterial({ map: story.knopfTextur ? story.knopfTextur('A') : null, transparent: true, depthTest: false, depthWrite: false })); tk.a.renderOrder = 11; s.add(tk.a);
  // Objekte
  const mond = tk.modus === 'mond';
  if(mond && window.TELESKOP_BILDER) for(const O of ORTE) tk.objekte.push(ortBauen(O));
  for(const P of PLANETEN) if(!(mond && P.nichtMond) && !(!mond && P.nurMond)) tk.objekte.push({ art: 'planet', P, id: P.id, name: P.name, fakten: P.fakten, dir: dirAus(P.az, P.h), gr: P.gr, obj: null });
  tk.objekte.push({ art: 'milchstrasse', id: 'milchstrasse', name: MILCHSTRASSE.name, fakten: MILCHSTRASSE.fakten, dir: mDir, gr: MILCHSTRASSE.gr });
  sternbilderBauen();
  for(const o of tk.objekte) if(o.art === 'planet') planetLaden(o);
  // Start: der Mond (im Buero der Mondbasis: der Festtisch)
  tk.wahl = Math.max(0, tk.objekte.findIndex(o => o.id === (mond ? 'tisch' : 'mond'))); tk.blick.copy(tk.objekte[tk.wahl].dir);
}
// Ein Bild von oben am Himmel: rund, mit hellem Rand; gross (A) als runde Scheibe im Okular
function ortTex(O){ const im = new Image(); im.src = window.TELESKOP_BILDER[O.bild];
  const t = new THREE.Texture(im); im.onload = () => { t.needsUpdate = true; }; return t; }
function ortBauen(O){
  const o = { art: 'bild', O, id: O.id, name: O.name, fakten: O.fakten, dir: dirAus(O.az, O.h), gr: O.gr, tex: ortTex(O) };
  const g = new THREE.Group(), d = R_HIMMEL * 0.9, rad = d * Math.tan(o.gr / 2 * Math.PI / 180);
  const k = new THREE.Group(); g.add(k); g.userData.k = k;
  k.add(new THREE.Mesh(new THREE.CircleGeometry(rad, 40), new THREE.MeshBasicMaterial({ map: o.tex })));
  const rand = new THREE.Mesh(new THREE.RingGeometry(rad, rad * 1.08, 40), new THREE.MeshBasicMaterial({ color: 0xdfe8ff })); rand.position.z = 0.01; k.add(rand);
  g.position.copy(o.dir).multiplyScalar(d); g.lookAt(0, 0, 0); tk.szene.add(g); o.obj = g;
  return o;
}
// Sternbilder aus sternbilder.js (b.punkte: dort schon an ihren Platz gesetzt) – eigene Sterne und Linien, hier in der Szene
function sternbilderBauen(){
  const B = story.sternbilder || {}, stern = leuchtTex('rgba(255,255,255,1)', 'rgba(200,215,255,0.35)');
  for(const k in B){
    const b = B[k], F = STERNBILD_FAKTEN[k]; if(!b.punkte || !F) continue;
    const dirs = b.punkte.map(v => v.clone().normalize()), g = new THREE.Group();
    dirs.forEach((d, i) => { const mag = b.sterne[i][3], sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stern, color: mag < 1 ? 0xffe6c8 : 0xffffff, transparent: true, depthWrite: false }));
      sp.position.copy(d).multiplyScalar(R_HIMMEL * 0.98); sp.scale.setScalar(R_HIMMEL * Math.max(0.016, 0.042 - mag * 0.006)); g.add(sp); });   // groesser als am Spielhimmel: im Okular sollen sie leuchten
    const pos = []; for(const [a, c] of b.linien) pos.push(...dirs[a].clone().multiplyScalar(R_HIMMEL * 0.98).toArray(), ...dirs[c].clone().multiplyScalar(R_HIMMEL * 0.98).toArray());
    const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const lmat = new THREE.LineBasicMaterial({ color: 0x9fb8ff, transparent: true, opacity: 0.35, depthWrite: false }); g.add(new THREE.LineSegments(lgeo, lmat));
    tk.szene.add(g);
    const mitte = dirs.reduce((s, v) => s.add(v), new THREE.Vector3()).normalize();
    const radius = Math.max(...dirs.map(v => v.angleTo(mitte))) * 180 / Math.PI;
    tk.objekte.push({ art: 'sternbild', id: k, name: F.name, fakten: F.fakten, dir: mitte, gr: 2 * radius + 4, linien: lmat });   // gr = Durchmesser (Grad)
  }
}
function planetLaden(o){
  const daten = window[o.P.glb]; if(!daten || !story.ladeGlb) return;
  tk.laedt++;
  story.ladeGlb(daten, o.name, (gl) => {
    tk.laedt--;
    const m = gl.scene; m.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(m), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    const r = Math.min(sz.x, sz.y, sz.z) / 2 || 1;                  // Kugelradius (bei Saturn ohne die Ringe: die flache Achse)
    m.position.sub(c); const h = new THREE.Group(); h.add(m); h.scale.setScalar(1 / r);   // Radius 1
    m.traverse(n => { if(!n.isMesh) return; n.frustumCulled = false;
      if(o.P.leuchtet){ const alt = n.material; n.material = new THREE.MeshBasicMaterial({ map: alt.map || alt.emissiveMap, color: 0xffffff }); } });
    o.vorlage = h;
    o.obj = himmelsKoerper(o); tk.szene.add(o.obj);
  });
}
// Am Himmel: das Modell klein in seiner Richtung (Radius nach o.gr), die Sonne mit Schein, der Mond mit dem Blinken
function himmelsKoerper(o){
  const g = new THREE.Group(), k = o.vorlage.clone(true), d = R_HIMMEL * 0.9, rad = d * Math.tan(o.gr / 2 * Math.PI / 180);
  k.scale.multiplyScalar(rad); g.add(k); g.position.copy(o.dir).multiplyScalar(d); g.userData.k = k;
  if(o.P.leuchtet){ const sch = new THREE.Sprite(new THREE.SpriteMaterial({ map: leuchtTex('rgba(255,235,170,0.9)', 'rgba(255,170,60,0.35)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sch.scale.setScalar(rad * 6); g.add(sch); }
  if(o.id === 'mond') g.userData.blink = blinkLicht(g, rad);
  g.lookAt(0, 0, 0);                                              // eine Seite zum Betrachter
  return g;
}
// Das Blinken auf dem Mond: ein kleines, warmes Licht auf der Vorderseite, das alle 2,4 s zweimal kurz aufleuchtet
function blinkLicht(g, rad){
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: leuchtTex('rgba(255,255,255,1)', 'rgba(255,255,255,0.25)'), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
  sp.position.set(rad * 0.38, rad * 0.28, rad * 0.9);             // in Gruppen-Koordinaten: +z zeigt nach lookAt zum Betrachter
  sp.scale.setScalar(rad * 0.17); sp.renderOrder = 5; g.add(sp); return sp;   // nur ein kleiner Punkt (Live-Wunsch: nicht der ganze Mond)
}
// Blinken (Live-Wunsch 23.10.2026): Morsezeichen "H A L L O", Buchstabe fuer Buchstabe abwechselnd rot und blau, dann eine
// Pause und von vorn. Takt MORSE_T s: Punkt 1, Strich 3, Luecke im Buchstaben 1, zwischen Buchstaben 3, am Ende 7 Takte.
const MORSE_T = 0.2, MORSE = ['....', '.-', '.-..', '.-..', '---'], MORSE_FARBE = [0xff3b30, 0x3b7bff];
const morse = (() => { const an = []; let t = 0;
  MORSE.forEach((z, b) => { for(let i = 0; i < z.length; i++){ const d = z[i] === '-' ? 3 : 1; an.push({ von: t, bis: t + d, farbe: MORSE_FARBE[b % 2] }); t += d + 1; } t += 2; });
  return { an, dauer: t + 5 }; })();
const _blinkFarbe = new THREE.Color();
function blinkStaerke(t, sp){
  const p = (t / MORSE_T) % morse.dauer, e = morse.an.find(q => p >= q.von && p < q.bis);
  if(e && sp) sp.material.color.setHex(e.farbe);
  if(!e) return 0;
  const rand = Math.min(p - e.von, e.bis - p);                     // weiche Kanten (0,15 Takte)
  return Math.min(1, rand / 0.15);
}

// ---- Grossansicht (A): das Modell vor dem Okular, die Erzaehlerin erzaehlt -----------------------------------------
function nahZeigen(o){
  nahWeg();
  tk.nahO = o; tk.nahT = 0;
  if(o.art === 'planet' && o.vorlage){
    const g = new THREE.Group(), k = o.vorlage.clone(true); g.add(k); g.userData.k = k;
    if(o.P.leuchtet){ const sch = new THREE.Sprite(new THREE.SpriteMaterial({ map: leuchtTex('rgba(255,235,170,0.8)', 'rgba(255,170,60,0.3)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sch.scale.setScalar(3.4); g.add(sch); }
    if(o.id === 'mond') g.userData.blink = blinkLicht(g, 1);
    tk.szene.add(g); tk.nah = g;
  } else if(o.art === 'bild'){
    const g = new THREE.Group(), k = new THREE.Group(); g.add(k); g.userData.k = k;           // k dreht sich in schritt (hier leer)
    g.add(new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshBasicMaterial({ map: o.tex })));
    tk.szene.add(g); tk.nah = g;
  } else tk.fovSoll = Math.max(14, Math.min(64, o.gr * 1.3));     // Sternbild, Milchstrasse: so, dass es ganz ins Okular passt
  if(o.linien) o.linien.opacity = 0.85;
  sprechen(o.fakten);
}
function nahWeg(){
  if(tk.nah){ tk.szene.remove(tk.nah); tk.nah = null; }
  if(tk.nahO && tk.nahO.linien) tk.nahO.linien.opacity = 0.35;
  tk.nahO = null; tk.fovSoll = FOV;
}
function sprechen(saetze){
  if(story.stimmeStopp) story.stimmeStopp();
  tk.spricht = true;
  story.sprich(saetze, () => { tk.spricht = false; }, 'inventar');   // 'inventar': schiebt sich vor, B bricht ab (story.stimmeStopp)
}

// ---- Bedienen ---------------------------------------------------------------------------------------------------------
function liesEingabe(){
  let x = 0, y = 0, a = false, b = false;
  if(keys['ArrowLeft'] || keys['KeyA']) x -= 1; if(keys['ArrowRight'] || keys['KeyD']) x += 1; if(keys['ArrowUp'] || keys['KeyW']) y += 1; if(keys['ArrowDown'] || keys['KeyS']) y -= 1;
  if(keys['Enter'] || keys['Space'] || keys['NumpadEnter']) a = true; if(keys['KeyB'] || keys['Backspace'] || keys['Escape']) b = true;
  for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])){ if(!gp) continue;
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0; if(Math.abs(ax) > 0.5) x = Math.sign(ax); if(Math.abs(ay) > 0.5) y = -Math.sign(ay);
    if(gp.buttons[14] && gp.buttons[14].pressed) x = -1; if(gp.buttons[15] && gp.buttons[15].pressed) x = 1;
    if(gp.buttons[12] && gp.buttons[12].pressed) y = 1; if(gp.buttons[13] && gp.buttons[13].pressed) y = -1;
    if(gp.buttons[0] && gp.buttons[0].pressed) a = true; if(gp.buttons[1] && gp.buttons[1].pressed) b = true; }
  return { x, y, a, b };
}
// Naechstes Objekt in Richtung (sx, sy) vom gewaehlten aus (im Bild: rechts / oben)
const _r = new THREE.Vector3(), _o = new THREE.Vector3(), _v = new THREE.Vector3();
function nachbar(sx, sy){
  const c = tk.objekte[tk.wahl].dir;
  _r.crossVectors(c, new THREE.Vector3(0, 1, 0)).normalize();       // rechts
  _o.crossVectors(_r, c).normalize();                              // oben (senkrecht zur Blickrichtung)
  let best = -1, wert = Infinity;
  tk.objekte.forEach((o, i) => {
    if(i === tk.wahl) return;
    _v.copy(o.dir).addScaledVector(c, -o.dir.dot(c));
    const px = _v.dot(_r), py = _v.dot(_o), l = Math.hypot(px, py); if(l < 1e-4) return;
    const cos = (px * sx + py * sy) / (l * Math.hypot(sx, sy)); if(cos < 0.45) return;
    const w = o.dir.angleTo(c) / (cos * cos); if(w < wert){ wert = w; best = i; }
  });
  return best;
}
// Links/rechts: eine feste Runde um den Himmel (Live-Wunsch 26.10.2026: mit dem Kegel-Nachbarn kam man nicht an alle Planeten, man
// musste zwischendurch die Richtung wechseln). Alle Objekte nach ihrer Himmelsrichtung sortiert; rechts = im Uhrzeigersinn weiter,
// am Ende wieder von vorn – so erreicht man mit einer Richtung jedes Objekt. Hoch/runter bleibt der Nachbar im Bild (nachbar).
function imKreis(sx){
  const az = (o) => Math.atan2(o.dir.x, o.dir.z);                  // nach rechts wird dieser Winkel kleiner (rechts = Blick x oben)
  const liste = tk.objekte.map((o, i) => ({ i, a: az(o) })).sort((p, q) => q.a - p.a);   // absteigend = nach rechts
  const k = liste.findIndex(e => e.i === tk.wahl), n = liste.length;
  return liste[((k + (sx > 0 ? 1 : -1)) % n + n) % n].i;
}
function steuern(dt){
  const e = liesEingabe(), alt = tk.eingabe, kante = { a: e.a && !alt.a, b: e.b && !alt.b };
  const dir = e.x || e.y; let schritt = null;
  if(!dir) tk.sperre = 0;
  else if(tk.sperre <= 0 || e.x !== alt.x || e.y !== alt.y){ schritt = { x: e.x, y: e.y }; tk.sperre = e.x === alt.x && e.y === alt.y ? 0.45 : 0.6; }
  else tk.sperre -= dt;
  tk.eingabe = e;
  // B: aus der Nahansicht eines Objekts erst zurueck zur Auswahl (Live-Wunsch 26.10.2026), dort hinaus – auch mitten in einer Erklaerung
  if(kante.b){ if(tk.nahO){ nahWeg(); if(story.stimmeStopp) story.stimmeStopp(); tk.spricht = false; } else zu(); return; }
  if(schritt){ const n = schritt.x ? imKreis(schritt.x) : nachbar(0, schritt.y);
    if(n >= 0){ tk.wahl = n; nahWeg(); sprechen([tk.objekte[n].name]); } }
  if(kante.a){ const o = tk.objekte[tk.wahl]; if(tk.nahO === o) { nahWeg(); sprechen([o.name]); } else nahZeigen(o); }
}

// ---- Auf / zu ---------------------------------------------------------------------------------------------------------
let okular = null;
function okularBauen(){
  if(okular) return;
  okular = document.createElement('div');
  okular.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:46;display:none;'
    + 'background:radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0, rgba(0,0,0,0) 40vmin, rgba(20,14,6,.85) 43vmin, #000 46vmin);';
  const ring = document.createElement('div');
  ring.style.cssText = 'position:absolute;left:50%;top:50%;width:86vmin;height:86vmin;transform:translate(-50%,-50%);border-radius:50%;'
    + 'box-shadow:0 0 0 1.2vmin rgba(201,160,70,.75), inset 0 0 6vmin rgba(0,0,0,.8);';
  okular.appendChild(ring); document.body.appendChild(okular);
}
function auf(modus){
  if(tk.an || !story.pauseSetzen) return;
  modus = modus === 'mond' ? 'mond' : 'himmel';
  if(tk.modus !== modus){ if(tk.szene) tk.szene = null; tk.objekte = []; tk.wahl = 0; tk.modus = modus; }   // anderer Ort: Himmel neu
  bauen(); okularBauen();
  tk.an = true; tk.eingabe = liesEingabe(); tk.sperre = 0.5; tk.fov = tk.fovSoll = FOV; nahWeg();
  story.pauseSetzen('teleskop'); okular.style.display = 'block';
  const o = tk.objekte[tk.wahl]; if(o) tk.blick.copy(o.dir);
  sprechen(['Wow, der Sternenhimmel! Schau dich mit dem Steuerkreuz um. Mit A erfährst du mehr.']);
}
function zu(){
  if(!tk.an) return;
  tk.an = false; nahWeg();
  if(story.stimmeStopp) story.stimmeStopp(); tk.spricht = false;
  okular.style.display = 'none';
  story.bSperre = true;                                            // B nicht gleich als Knien weitergeben (wie das Inventar)
  if(story.pauseArt && story.pauseArt() === 'teleskop') story.pauseSetzen(null);
  story.teleskopGeschaut = true;                                   // observatorium_innen.js: danach der Skizzenring daneben
  if(story.teleskopDanach) story.spaeter(0.5, () => story.teleskopDanach());
}
story.teleskopAuf = auf;
story.teleskopZu = zu;

// ---- Jedes Bild: steuern, schwenken, zeichnen (ueber das Spielbild) --------------------------------------------------
const _ziel = new THREE.Vector3(), _aUp = new THREE.Vector3();
function schritt(dt){
  if(!tk.an) return;
  tk.t += dt;
  steuern(dt); if(!tk.an) return;
  const o = tk.objekte[tk.wahl];
  _ziel.copy(o.dir); tk.blick.lerp(_ziel, Math.min(1, GLEIT * dt)).normalize();
  tk.fov += (tk.fovSoll - tk.fov) * Math.min(1, 3 * dt);
  const k = tk.kam; k.fov = tk.fov; k.aspect = innerWidth / innerHeight; k.updateProjectionMatrix();
  k.position.set(0, 0, 0); k.up.set(0, 1, 0); k.lookAt(tk.blick);
  // Ring um das gewaehlte Objekt (am Himmel; in der Grossansicht eines Planeten aus)
  const d = R_HIMMEL * 0.85, rad = d * Math.tan((o.gr * 0.5 + 1.2) * Math.PI / 180);
  tk.ring.visible = !tk.nahO;                                      // in der Grossansicht kein Ring
  tk.ring.position.copy(o.dir).multiplyScalar(d); tk.ring.scale.setScalar(rad * 2 * (1 + Math.sin(tk.t * 4) * 0.05));
  // das A am unteren Rand des Rings (Bild-unten = gegen die Kamera-Oben-Richtung), so gross wie ein Knopf im Okular
  tk.a.visible = !tk.nahO; _aUp.set(0, 1, 0).applyQuaternion(k.quaternion);
  tk.a.position.copy(tk.ring.position).addScaledVector(_aUp, -rad * 0.98); tk.a.scale.setScalar(d * Math.tan(tk.fov * 0.026 * Math.PI / 180) * 2);
  // Planeten drehen sich langsam; das Blinken auf dem Mond
  for(const q of tk.objekte) if(q.obj){ q.obj.userData.k.rotation.y += dt * 0.05; if(q.obj.userData.blink) q.obj.userData.blink.material.opacity = blinkStaerke(tk.t, q.obj.userData.blink); }
  if(tk.nah){
    tk.nahT += dt; const e = Math.min(1, tk.nahT / 0.6), w = e * e * (3 - 2 * e);
    // vor der Kamera, Mitte des Okulars, so gross, dass es 60 % des Rundes fuellt
    const abst = 6, r = abst * Math.tan(tk.fov / 2 * Math.PI / 180) * 0.55 * w + 0.001;
    tk.nah.position.copy(tk.blick).multiplyScalar(abst); tk.nah.scale.setScalar(r);
    tk.nah.userData.k.rotation.y += dt * 0.25;
    tk.nah.lookAt(0, 0, 0); tk.nah.userData.k.rotation.x = 0.25;
    if(tk.nah.userData.blink) tk.nah.userData.blink.material.opacity = blinkStaerke(tk.t, tk.nah.userData.blink);
  }
  const ac = renderer.autoClear; renderer.autoClear = true; renderer.render(tk.szene, k); renderer.autoClear = ac;
}
let tVor = 0;
const startVorher = window.STORY_START;
window.STORY_START = function(){
  const loopOrig = loop;
  loop = function(){
    const r = loopOrig.apply(this, arguments);
    const t = performance.now(), dt = tVor ? Math.min(0.1, (t - tVor) / 1000) : 0; tVor = t;
    schritt(dt);
    return r;
  };
  if(startVorher) return startVorher.apply(this, arguments);
};
if(/[?&]teleskop/.test(story.urlParameter || location.search)) story.teleskopTest = true;   // story.js hat die Adresse da schon aufgeraeumt
})();
