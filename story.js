// Das Geheimland – Spiellogik. Haengt sich per Wrapper in die unveraenderte Flugspiel-Engine
// (engine/engine.js) ein, genau wie Spiel_SFG. Ladeordnung: *_glb.js -> story.js -> insel.js
// -> engine/engine.js.
// Die Engine ruft am Ende ihres Boot-Blocks zwei Hooks auf (eingefuegt von tools/build_engine.ps1):
//   STORY_HOOK  – bevor Inseln und Startplatz berechnet werden: hier werden Funktionen ersetzt.
//   STORY_START – vor dem ersten Bild: hier wird die Startszene aufgebaut.
// Wichtig: story.js laeuft VOR der Engine. Engine-Funktionen und let/const-Globals (state, eva,
// locale, ...) gibt es erst ab STORY_HOOK – auf Top-Level hier also nichts davon anfassen.
//
// Zielgruppe: ein fast 6-jaehriges Kind. Alles Wichtige sagt die Stimme; Texte sind nur Beiwerk.
// Steuerung zu Fuss (wie Trip to Japan): linker Stick (Pfeiltasten) gehen bis rennen · A (Leertaste) springen
// (im Lauf: Sprungrolle) · B hinknien / aufstehen · X umherschauen · im Wasser: rechter Stick vor/zurueck (E/Q) tauchen.
(function(){
'use strict';

// abenteuerLos: true, sobald Joshi die Ausruestung aus der Huette hat und den Funkspruch angenommen hat (kommt noch) –
// erst dann kann er ins Segelboot steigen (steg.js)
const story = window.STORY = { etappe: 1, gestartet: false, ton: false, abenteuerLos: false };

// ---- Spielstand ueber das Neuladen hinweg (Live-Wunsch 21.10.2026: Beginn des Falls auf der Waldinsel) ------------
// Zwischen zwei Etappen wird die Seite neu geladen (globus.js: alles zuruecksetzen). Vorher merkt sich das Spiel in
// sessionStorage, wo es weitergeht: Etappe, die Reise auf dem Globus, was im Rucksack ist und die Seiten im Notizbuch
// (Bilder als PNG). Das liest hier jedes Skript beim Laden (story.spielstand). Nur fuer diesen Tab und diese Sitzung –
// Schliessen faengt wieder auf Joshis Insel an. Zum Testen: index.html?etappe=2 springt direkt hin (mit voller
// Ausruestung, ohne Seiten), ?etappe=1 loescht den Spielstand.
const SPIELSTAND = 'geheimland.stand';
story.spielstand = (function(){
  let stand = null;
  try {
    const q = new URLSearchParams(location.search).get('etappe');
    if(q === '1') sessionStorage.removeItem(SPIELSTAND);
    else if(q) stand = { etappe: +q, reise: [0, 1], rucksack: { notizbuch: true, lupe: true, kompass: true, messer: true, stift: true, kamera: true }, seiten: [], test: true };
    if(!stand) stand = JSON.parse(sessionStorage.getItem(SPIELSTAND) || 'null');
    // ?etappe=... nur einmal auswerten: aus der Adresse nehmen, sonst loeschte das Neuladen nach dem Globus (location.reload)
    // den eben gemerkten Spielstand gleich wieder (?etappe=1) bzw. sprang immer zum Test-Stand
    if(q && history.replaceState) history.replaceState(null, '', location.pathname + location.hash);
  } catch(e){ stand = null; }
  if(stand && stand.etappe > 1) story.etappe = stand.etappe;
  return stand;
})();
// Etappenwechsel OHNE Neuladen (Live-Wunsch 21.10.2026: wie in Trip to Japan – nach dem Globus gleich am neuen Ort, kein
// Startbildschirm). Die neue Etappe setzt story.etappe und ruft das hier: die Inselzelle 0, 0 der Engine wird entsorgt und
// im naechsten Bild neu gebaut (insel.js waehlt die Wiese nach story.etappe), der Hinweis-Stand faengt neu an, und jede
// Datei, die etwas mitnehmen muss, haengt sich an story.etappeWechselHooks (steg.js: Steg und Boot).
story.etappeWechselHooks = [];
story.etappeWechsel = function(n){
  const z = islandCells.get('0,0');                              // global-ok: Engine-Inselzellen
  if(z){ scene.remove(z); entsorgen(z); }                        // global-ok
  islandCells.delete('0,0');                                     // global-ok
  _islandCache.clear();                                          // global-ok
  hinweisStand.xSatz = 0; hinweisStand.aussenGeschaut = false; hinweisStand.innenGeschaut = false; story.allesGesagt = false;
  for(const h of story.etappeWechselHooks) h(n);
};
// Welche Etappen es schon gibt (globus.js: zu einer, die fehlt, wird nicht neu geladen)
story.etappeGebaut = (n) => n === 1 || (n === 2 && !!story.e2StartSzene);
story.spielstandMerken = function(naechste){
  const A = story.ausruestung || {}, rucksack = {};
  for(const n of ['notizbuch', 'lupe', 'kompass', 'messer', 'stift', 'kamera']) rucksack[n] = !!A[n];
  const seiten = (story.notizSeiten ? story.notizSeiten() : []).map(s => {
    let bild = null; try { bild = s.bild && s.bild.toDataURL ? s.bild.toDataURL('image/png') : null; } catch(e){}
    return { art: s.art, name: s.name, ort: s.ort, dreh: s.dreh, bild };
  });
  const stand = { etappe: naechste, reise: story.reise ? story.reise.slice() : [0], rucksack, seiten };
  try { sessionStorage.setItem(SPIELSTAND, JSON.stringify(stand)); }
  catch(e){ stand.seiten = []; try { sessionStorage.setItem(SPIELSTAND, JSON.stringify(stand)); } catch(e2){} console.warn('Spielstand ohne Notizbuch-Seiten (zu gross)', e); }
};

// Name der Spielfigur (Live-Entscheidung 14.10.2026: Joshi) – nur hier aendern.
const NAME = 'Joshi';

// ---- Hilfen ----------------------------------------------------------------------------------
function glbBytes(daten){
  const bin = atob(daten.split(',')[1]), u = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}
// story.laedt zaehlt die GLBs, die gerade dekodiert werden – der Start-Knopf kommt erst, wenn alles fertig ist (startbildschirm)
story.laedt = 0;
function ladeGlb(daten, name, fertig){
  if(!daten || !THREE.GLTFLoader) return;
  story.laedt++;
  const ende = () => { story.laedt = Math.max(0, story.laedt - 1); };
  new THREE.GLTFLoader().parse(glbBytes(daten), '', (g) => { try { fertig(g); } finally { ende(); } },
    (e) => { ende(); console.warn(name + '-GLB Ladefehler:', e); });
}
story.ladeGlb = ladeGlb;
function entsorgen(obj){
  if(!obj) return;
  if(obj.parent) obj.parent.remove(obj);
  obj.traverse(o => {
    if(o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    for(const m of mats){ if(m.map) m.map.dispose(); m.dispose(); }
  });
}
story.entsorgen = entsorgen;
// Kuerzester Drehwinkel von a nach b
function winkelDiff(a, b){ const d = b - a; return Math.atan2(Math.sin(d), Math.cos(d)); }
const klemme = (v, a, b) => Math.max(a, Math.min(b, v));

// Timer in Spielzeit (stehen, solange die Anleitung offen ist)
const timerListe = [];
function spaeter(sek, fn){ timerListe.push({ t: sek, fn }); }
function timerTick(dt){
  const faellig = [];
  for(let i = timerListe.length - 1; i >= 0; i--){
    if((timerListe[i].t -= dt) <= 0){ faellig.unshift(timerListe[i].fn); timerListe.splice(i, 1); }
  }
  for(const f of faellig) f();
}
story.spaeter = spaeter;

// ---- Welten ----------------------------------------------------------------------------------
// Jeder Einsatzort baut seine Kulisse in EINE eigene Gruppe (story.welt(n)), nie direkt in die Szene
// (Lehre aus Spiel_SFG: sonst stehen Objekte in fremden Welten). Sichtbar ist nur die aktuelle,
// und nur auf der Erde.
const welten = new Map();
function welt(n){
  if(!welten.has(n)){
    const g = new THREE.Group(); g.name = 'welt' + n;
    scene.add(g); welten.set(n, g);                           // global-ok: Welt-Wurzel
  }
  return welten.get(n);
}
function weltenSichtbar(){
  for(const [n, g] of welten) g.visible = n === story.etappe && locale === 'earth';
}
function weltEntsorgen(n){
  const g = welten.get(n);
  if(!g) return;
  for(const o of [...g.children]) o.userData.fremd ? g.remove(o) : entsorgen(o);
  scene.remove(g); welten.delete(n);
}
story.welt = welt;
story.weltEntsorgen = weltEntsorgen;

// ---- Grenzen: siehe objekte.js (Objekt-Katalog, Grenzen in exakter Form, freier Platz beim Setzen) ------------
// Hier nur, was objekte.js von der Figur wissen muss: ob gerade Joshis eigener Schritt geprueft wird (schrittVon,
// wer schon drinsteckt, darf hinaus) und ob er in der Luftphase eines Sprungs ist (dann zaehlen die Fuesse hoeher).
story.schrittVon = () => (figurSchritt && eva) ? eva.group.position : null;
story.figurInLuft = () => (figur.aktion === 'jump' && figur.aktT > 0.5 && figur.aktT < 1.05) || (figur.aktion === 'roll' && figur.aktT > 0.3 && figur.aktT < 0.9);

// ---- Nur die Startinsel, keine Traeger/Hangar/Vorfeld (die kleine Insel baut insel.js) -------
function hookWelt(){
  wantHangarStart = false;
  const islandOrig = _islandInfoCalc;
  _islandInfoCalc = function(cx, cz){
    if(cx !== 0 || cz !== 0) return null;
    return islandOrig(cx, cz);
  };
  carrierInfo = function(){ return null; };
  _parkLocalCalc = function(){ return null; };
  preloadHarbor = function(){};
  harborHeight = -10;
  enterHangar = function(){ return false; };
  preloadHangar = function(){};
  spawnFire = function(){ return false; };
  aiFindFireIsland = function(){ return null; };
  harborSubNear = function(){ return null; };
  harborBoatLocal = function(){ return null; };
  evaStartJet = function(){};
  // Sein Lade-Callback ruft placeAtStart und wuerde die Figur wieder einsammeln (SFG-Falle)
  preloadFord = function(){};
  // Kein Flugverkehr am Himmel (KI-Flotte, Alpha-Jet-Vorbeiflug) – Live-Wunsch 14.10.
  updateTrafficAll = function(dt){ worldClock += dt; };
  // Der X-Wing bleibt als unsichtbarer Anker der Engine stehen (state.pos haelt Inselzellen, Meer,
  // Kamera beim Aussteigen) – zu sehen ist er nicht, sein Schatten auch nicht. Fliegen kommt spaeter.
  const schattenOrig = updateShadow, ovalOrig = updateOvalShadow;
  // Zu Fuss blendet die Engine den Flugzeugschatten selbst aus und ruft den Ovalschatten der Figur auf – also laufen lassen
  updateShadow = function(){ const r = schattenOrig.apply(this, arguments); if(eva) planeShadow.visible = false; return r; };
  // Weicher Ovalschatten der Engine (echte Schatten gibt es nicht): zu Fuss rund 0,9 m – fuer den 1,9-m-Astronauten.
  // Fuer Joshi (1,20 m) auf FIGUR_SCHATTEN verkleinert; im Innenraum (150 m hoch) liegt er auf dem Raumboden.
  updateOvalShadow = function(){
    const r = ovalOrig.apply(this, arguments);
    if(eva && !eva.boat && !eva.rover && ovalShadow.visible){
      const k = ovalShadow.scale.x / 0.9;                     // Engine: 0,9 m, mit Sprunghoehe groesser
      ovalShadow.scale.set(FIGUR_SCHATTEN * k, FIGUR_SCHATTEN * k, 1);
      if(story.innen && story.innen.drin) ovalShadow.position.y = 150.045;  // Raumboden (huette_innen.js BODEN_Y), knapp ueber dem Teppich (150,03)
      if(story.imBoot && story.imBoot()) ovalShadow.visible = false;         // im Boot: der Schatten laege auf dem Wasser
      if(!story.gestartet) ovalShadow.visible = false;                       // Startbildschirm: Joshi ist noch nicht da
      // Auf dem Steg: die Engine kennt ihn nicht und legte den Schatten aufs Wasser darunter (live gemeldet)
      const steg = story.stegBoden && story.stegBoden(ovalShadow.position.x, ovalShadow.position.z);
      if(steg !== null && steg !== undefined) ovalShadow.position.y = steg + 0.03;
      ovalShadowMat.opacity *= SCHATTEN_DECK;
    }
    return r;
  };
  _islandCache.clear(); _subBerthCache.clear(); _xwpCache.clear(); _parkCache.clear();

  // Der X-Wing parkt am Oststrand (Nase zum Wasser) – fuer spaeter, wenn geflogen wird.
  const findStartOrig = findStart;
  findStart = function(name){
    if(name === 'XWing' && story.etappe === 1) return { x: 62, y: ISLAND_Y, z: -8, yaw: -Math.PI / 2 };
    return findStartOrig(name);
  };
}

// ---- Nacht -----------------------------------------------------------------------------------
// Das Geheimland beginnt nachts: sternklarer Himmel mit Milchstrasse und Mond, gedimmtes Mondlicht, keine Wolken.
// Seit 19.10.2026 ist das der globale Nachthimmel der Engine (setSky('night'), Flugspiel) – Trip to Japan nutzt ihn
// in der Wueste. Die Sternbilder (sternbilder.js) bleiben hier.
function hookNacht(){
  if(story.etappe !== 1) return;                                // Waldinsel (Etappe 2): Tag, waldinsel.js
  setSky('night');                                              // global-ok: Engine
}

// ---- Spielfigur ------------------------------------------------------------------------------
// models/figur.glb: Joshi-Modell mit Mixamo-Rig, 60 fps, Clips (aus _mixamo/anim per merge_clips.py):
//   idle walk run jump swim fly hang kneel roll skate guitar drums look
// Blick im Modell +Z. Die Hueftbewegung bleibt nur senkrecht (Sprung, Knien, Rolle), waagerecht
// bewegt die Engine die Figur.
const FIGUR_H = 1.20;
const GITARRE_NACH = 12;      // s Stillstehen, dann holt er die Gitarre raus
const EINMAL_FIGUR = ['jump', 'roll', 'kneel', 'look'];
const figur = story.figur = { obj: null, inner: null, mixer: null, acts: {}, cur: null, t: 0,
  kniet: false, aktion: null, aktT: 0, rollV: 0, steht: 0, ausschlag: 0, tempo: 0 };
function preloadFigur(){
  ladeGlb(window.FIGUR_GLB, 'Figur', (gltf) => {
    const obj = gltf.scene;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3());
    obj.scale.multiplyScalar(FIGUR_H / Math.max(0.001, size.y));
    obj.updateMatrixWorld(true);
    obj.position.y -= new THREE.Box3().setFromObject(obj).min.y;   // Fuesse auf y = 0
    obj.rotation.y = Math.PI;                                       // Modell schaut +Z, Engine erwartet -Z
    obj.traverse(o => {
      if(!o.isMesh) return;
      o.castShadow = true; o.frustumCulled = false;
      // FBX2glTF setzt metallic 0,4 – Haut und Pulli wirkten dadurch dunkel und speckig
      if(o.material){ o.material.metalness = 0; o.material.roughness = 0.85; }
    });
    const wrap = new THREE.Group(); wrap.add(obj);
    figur.obj = wrap; figur.inner = obj;
    if(gltf.animations.length){
      figur.mixer = new THREE.AnimationMixer(obj);
      for(const clip of gltf.animations){
        // Hueftspur: x/z auf den ersten Wert festhalten – die Figur bewegt die Engine. Bei der Rolle
        // wandert die Huefte im Clip ~60 cm nach vorn und zurueck (Mixamo "in place" zieht sie am Ende
        // zurueck) – festgehalten; den Vorwaertsschwung gibt updateEva (gleichmaessig, siehe ROLL_TEMPO).
        for(const t of clip.tracks){
          if(!/Hips\.position$/.test(t.name)) continue;
          const v = t.values, x0 = v[0], z0 = v[2];
          for(let i = 0; i < v.length; i += 3){ v[i] = x0; v[i + 2] = z0; }
        }
        const a = figur.acts[clip.name] = figur.mixer.clipAction(clip);
        if(EINMAL_FIGUR.includes(clip.name)){ a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; }
      }
      figurAnim('idle');
    }
    if(eva && eva.group){ eva.group.clear(); eva.group.add(figur.obj); }
  });
}
// Wechselt den Clip mit Ueberblendung. Nur der neue und der ausblendende laufen; alle anderen werden
// gestoppt (vorher hingen alle 13 Clips mit Gewicht 1 im Mixer – siehe figurWache).
function figurAnim(name, blend, tempo){
  const a = figur.acts[name];
  if(!a) return;
  if(tempo !== undefined) a.timeScale = tempo;
  if(figur.cur === name) return;
  const alt = figur.cur && figur.acts[figur.cur];
  for(const n in figur.acts){ const b = figur.acts[n]; if(b !== a && b !== alt) b.stop(); }
  a.reset(); a.setEffectiveWeight(1); a.play();
  if(alt) alt.crossFadeTo(a, blend || 0.25, false);
  figur.cur = name;
}
story.figurAnim = (n, b, t) => figurAnim(n, b, t);
// Mond und Milchstrasse haengen an der Kamera (unendlich weit weg). Fuer eine andere Kamera (Foto, notizbuch.js) kurz zu
// deren Position, danach wieder story.mondAn(camera.position)
story.mondAn = (pos) => skyFollow(pos);                        // global-ok: Engine (Nachthimmel)
// Fuchs-Animationen von aussen (notizbuch.js: beim Foto ins Bild laufen und hinsetzen)
story.fuchsAnim = function(was){ const n = { gehen: FA.gehen, setzen: FA.setzen, sitzen: FA.sitzen, stehen: FA.stehen }[was]; if(n) fuchsAnim(n, 0.25); };
// Joshi arbeitet (hockt sich hin, z. B. zum Schnitzen) – ohne dass der Fuchs zum Spielen kommt. blick: { x, z } = dorthin
// schauen (z. B. das Lagerfeuer). an = false: steht wieder auf.
story.arbeiten = function(an, blick){
  figur.arbeitet = !!an;
  if(an && blick && eva){ eva.yaw = Math.atan2(eva.group.position.x - blick.x, eva.group.position.z - blick.z); eva.group.rotation.y = eva.yaw; }
  if(!an && figur.cur === 'kneel') figurAnim('idle', 0.35, 1);
};
function hookFigur(){
  preloadFigur();
  // Die Figur ist EIN Objekt (Skelett!) – kein clone(), sondern in die neue Gruppe umhaengen
  const makeOrig = makeAstronaut;
  makeAstronaut = function(){
    if(!figur.obj) return makeOrig();
    if(figur.obj.parent) figur.obj.parent.remove(figur.obj);
    const g = new THREE.Group(); g.add(figur.obj);
    return g;
  };
  // Tempo: Stick bis 50 % = gehen, darueber rennen (wie Kenji). Kniend, beim Sprung und vor dem
  // Start steht sie still; Stick bewegen steht wieder auf. Im Wasser: Schwimmen.
  const updateEvaRoh = updateEva;
  const updateEvaOrig = function(){ figurSchritt = true; try { return updateEvaRoh.apply(this, arguments); } finally { figurSchritt = false; } };
  updateEva = function(dt, inp){
    if(!eva) return updateEvaOrig(dt, inp);
    if(sw.aktiv && steuerbar()){ schwimmUpdate(dt, inp); return; }
    const roh = -(inp.pitch || 0), a = Math.abs(roh), dreh = Math.abs(inp.yaw || 0);
    if(a > 0.05 || dreh > 0.05){ figur.steht = 0; if(figur.cur === 'guitar'){ gitarreMusik(false); figurAnim('idle', 0.2); } }
    if(figur.kniet && (a > 0.3 || dreh > 0.5) && steuerbar()) aufstehen();
    if(figur.aktion === 'look' && (a > 0.15 || dreh > 0.3)) figur.aktion = null;   // Stick bricht das Umschauen ab
    if(figur.aktion === 'roll'){
      // Sprungrolle: gleichmaessiger Schwung aus dem Lauf (die Hueftkurve des Clips stockt in der Mitte
      // und sah ruckelig aus). Gegen Ende: Stick gehalten -> nahtlos weiterlaufen, sonst ausbremsen.
      figur.rollStick = a;
      const t = figur.aktT, ende = figur.acts.roll.getClip().duration / ROLL_TEMPO;
      const k = klemme((t - ROLL_BREMS_AB * ende) / ((1 - ROLL_BREMS_AB) * ende), 0, 1);
      const v = figur.rollV * (a > 0.3 ? 1 : 1 - 0.8 * k * k * (3 - 2 * k));
      return updateEvaOrig(dt, { pitch: -klemme(v / EVA_SPEED, 0, 1), yaw: (inp.yaw || 0) * 0.3 });
    }
    if(!steuerbar() || figur.kniet || figur.aktion === 'jump' || figur.aktion === 'look'){ figur.ausschlag = 0; figur.tempo = 0; return updateEvaOrig(dt, {}); }
    figur.ausschlag = a;
    const f = a <= 0.5 ? a / 0.5 * GEH_MAX : GEH_MAX + (a - 0.5) / 0.5 * (1 - GEH_MAX);
    figur.tempo = f * EVA_SPEED;
    return updateEvaOrig(dt, Object.assign({}, inp, { pitch: -Math.sign(roh) * f }));
  };
  // B zu Fuss: hinknien / aufstehen (Engine: buttonB -> evaActionB, Tastatur B und Controller-Knopf 1)
  // im Inventar ist B "zu" (ausruestung.js), bei einem grossen Bild "fertig" (notizbuch.js) – dann nicht knien
  evaActionB = function(){ if(hilfeOffen() || (story.szeneLaeuft && story.szeneLaeuft())) return; knieUmschalten(); };
  evaJump = function(){};          // der Engine-Huepfer passt nicht zur Figur
  // Die Figur laeuft nicht durch den Fuchs: sein Kreis ist fuer ihren Schritt kein fester Grund
  const solidFigOrig = evaSolid;
  // Nur fuer IHRE Schritte (figurSchritt, gesetzt um den Engine-Lauf) – sonst sperrte es auch die Schritte des Fuchses selbst
  evaSolid = function(x, z){ if(figurSchritt && eva && fuchs.obj && fuchs.aktiv && fuchs.obj.parent){ const f = fuchs.obj.position;
      const neu = Math.hypot(x - f.x, z - f.z), jetzt = Math.hypot(eva.group.position.x - f.x, eva.group.position.z - f.z);
      if(neu < ABSTAND_MIN && neu < jetzt) return false; }
    return solidFigOrig.apply(this, arguments); };
  // Leertaste setzt in readInput Vollschub, X Schub 0 – zu Fuss soll beides den (unsichtbaren) X-Wing nicht
  // umstellen: den Schub nach readInput auf den Wert davor zuruecksetzen
  const readOrig = readInput;
  // Beim Schwimmen gehoert der rechte Stick dem Tauchen (tauchEingabe) – die Kamera soll dabei nicht kippen
  // Im Segelboot (steg.js) gilt die Fahrzeug-Belegung der Engine: rechter Stick / W,S = Schub (bleibt stehen), A / C =
  // rueckwaerts, Leertaste = Vollgas. Dafuer liest readInput, waehrend es laeuft, Joshi als "im Boot" (eva.boat) – sonst
  // waere der rechte Stick Umsehen. Der Schub bleibt dann stehen, zu Fuss wird er wie bisher zurueckgesetzt.
  readInput = function(){
    const thr = state.throttle, segeln = !!(eva && story.imBoot && story.imBoot());
    const boot = eva && eva.boat; if(segeln) eva.boat = eva.boat || {};
    let r; try { r = readOrig.apply(this, arguments); } finally { if(segeln) eva.boat = boot; }
    if(eva && !segeln) state.throttle = thr;
    if(sw.aktiv || segeln) lookY = 0;
    return r; };
  cycleModel = function(){};       // Fahrzeuge waehlt die Geschichte
  // Grosses Astronauten-Symbol beim Aussteigen passt nicht zur Figur
  const showBigOrig = showBig;
  showBig = function(t){
    if(t && /\u{1F9D1}‍\u{1F680}/u.test(t)) t = '';
    return showBigOrig.call(this, t);
  };
  // Kamera beim Gitarrespielen weiter weg, damit Figur und tanzender Fuchs (5 m vor ihr) ins Bild passen. Die
  // Engine-Kamera folgt der Figur weich (lerp); darauf kann man nicht jedes Bild multiplizieren (der Abstand wuchs
  // dann ins Unendliche). Deshalb hier eine eigene, ruhige Kamera: hinter der Figur in KAM_WEIT x Engine-Abstand,
  // Blick auf die Mitte zwischen Figur und Fuchs-Platz; der rechte Stick (evaOrbit) dreht sie um beide.
  const camOrigF = updateCamera;
  const _kw = new THREE.Vector3();
  updateCamera = function(){
    const soll = eva && figur.cur === 'guitar' && !sw.aktiv && !(story.innen && story.innen.drin) ? 1 : 0;
    // Knien: eigene Seitenkamera, damit man den Fuchs vor Joshi spielen sieht (von hinten verdeckte Joshi ihn)
    const knie = eva && figur.kniet && !sw.aktiv && !(story.innen && story.innen.drin) ? 1 : 0;
    figur.kamKnie = (figur.kamKnie || 0) + (knie - (figur.kamKnie || 0)) * Math.min(1, 2 * dtCam);
    if(eva && figur.kamKnie > 0.01 && !(figur.kamWeit > 0.01)){
      const p = eva.group.position, w = figur.kamKnie, yaw = eva.yaw + KNIE_WINKEL * w + evaOrbit;
      const m = nebenFigur(0.55 * w, 0.15 * w);                            // Blickpunkt zwischen Joshi und Fuchs
      _kw.set(p.x + Math.sin(yaw) * (7 - 3.2 * w), p.y + 3.4 - 2.0 * w, p.z + Math.cos(yaw) * (7 - 3.2 * w));
      camera.position.lerp(_kw, Math.min(1, 4 * dtCam));
      camera.up.set(0, 1, 0); camera.lookAt(m.x, p.y + 0.5, m.z);
      return;
    }
    figur.kamWeit = (figur.kamWeit || 0) + (soll - (figur.kamWeit || 0)) * Math.min(1, 1.2 * dtCam);
    if(!(eva && figur.kamWeit > 0.01)) return camOrigF.apply(this, arguments);
    // Kreisfahrt: langsam um Joshi und den Fuchs herum (eine Runde in KAM_RUNDE s); der rechte Stick dreht selbst
    if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam;
    else if(soll) evaOrbit += (Math.PI * 2 / KAM_RUNDE) * dtCam * figur.kamWeit;
    else evaOrbit += (0 - Math.atan2(Math.sin(evaOrbit), Math.cos(evaOrbit))) * Math.min(1, 1.5 * dtCam);   // zurueck hinter die Figur
    const p = eva.group.position, yaw = eva.yaw + evaOrbit, w = figur.kamWeit;
    const m = nebenFigur(TANZ_ABST * 0.45 * w, 0);                       // Blickpunkt: zwischen Figur und Fuchs
    let dist = 7 * (1 + (KAM_WEIT - 1) * w);
    // Steht hinter der Figur etwas (Huette, Palme), naeher heran – bis kurz davor
    for(let s = 1.5; s <= dist; s += 0.5){
      const x = p.x + Math.sin(yaw) * s, z = p.z + Math.cos(yaw) * s;
      if(hitsBuilding(x, ISLAND_Y + 2.5, z, false)){ dist = Math.max(4, s - 1); break; }
    }
    const hoch = 3.4 + 2.6 * w;                                          // etwas hoeher: der Blick geht ueber Joshi auf den Fuchs
    _kw.set(p.x + Math.sin(yaw) * dist, p.y + hoch, p.z + Math.cos(yaw) * dist);
    camera.position.lerp(_kw, Math.min(1, 3 * dtCam));
    camera.up.set(0, 1, 0);
    camera.lookAt(m.x, p.y + 0.8, m.z);
  };  const mdlEl = document.getElementById('mdl');
  const hudOrig = updateHUD;
  updateHUD = function(){
    const r = hudOrig.apply(this, arguments);
    if(eva && mdlEl && mdlEl.textContent !== NAME) mdlEl.textContent = NAME;
    return r;
  };
}
const GEH_MAX = 0.3;          // Anteil von EVA_SPEED bei 50 % Stick (~1,8 m/s)
const FIGUR_SCHATTEN = 0.38;  // m Radius des Bodenschattens unter Joshi (Live-Wunsch: kleiner, der Staub beim Laufen gibt Kontrast)
const SCHATTEN_DECK = 0.6;    // Anteil der Engine-Deckkraft (0,18..0,40) – etwas durchsichtiger
const KNIE_WINKEL = -1.05;     // rad: so weit schwenkt die Kamera beim Knien zur Seite (rechts von Joshi)
const KAM_RUNDE = 40;         // s fuer eine Kreisfahrt der Kamera beim Gitarrespielen
const KAM_WEIT = 1.6;         // Kamera-Abstand beim Gitarrespielen (x Engine-Abstand)
let figurSchritt = false;     // true, waehrend die Engine die Figur bewegt (evaSolid: Fuchs als Hindernis)
// Sprungrolle: konstanter Schwung (rollV, aus dem Lauftempo), ab ROLL_BREMS_AB der Clipdauer bremst
// sie aus, wenn der Stick losgelassen ist.
const ROLL_TEMPO = 1.15;      // Clip etwas schneller abspielen – fluessiger
const ROLL_BREMS_AB = 0.6;
const SPRUNG_FREI = 1.5;      // s: danach darf der Stick den Sprung abbrechen
function springen(){
  if(!eva || eva.boat || eva.rover || sw.aktiv || !steuerbar() || figur.aktion || figur.kniet) return;
  if(figur.tempo > 0.3 && figur.acts.roll){
    figur.aktion = 'roll'; figur.aktT = 0;
    figur.rollV = klemme(figur.tempo, 2.2, 3.6); figur.rollStick = 1;
    figurAnim('roll', 0.15, ROLL_TEMPO);
  } else if(figur.acts.jump){
    figur.aktion = 'jump'; figur.aktT = 0;
    figurAnim('jump', 0.12, 1);
  }
}
// A (Controller-Knopf 0) / Leertaste: springen · X (Knopf 2) / X: umherschauen. Die Engine nutzt beide zu Fuss
// nicht (A = Schubbremse, X = Boost, Leertaste = Vollschub – alles nur im Flieger, siehe hookFigur: readInput).
// Tastendruecke als Ereignis merken: ein kurzer Tipp kann zwischen zwei Bildern liegen.
const tasten = { prevA: true, prevX: true, a: false, x: false };
addEventListener('keydown', e => {
  if(e.defaultPrevented || e.repeat) return;         // z. B. Enter/Leertaste auf dem Startbildschirm
  if(e.code === 'Space') tasten.a = true;
  if(e.code === 'KeyX') tasten.x = true;
});
function figurTasten(){
  let a = false, x = false;
  if(gamepadIndex !== null){ const gp = navigator.getGamepads()[gamepadIndex];
    a = !!(gp && gp.buttons[0] && gp.buttons[0].pressed); x = !!(gp && gp.buttons[2] && gp.buttons[2].pressed); }
  const neuA = (a && !tasten.prevA) || tasten.a, neuX = (x && !tasten.prevX) || tasten.x;
  tasten.prevA = a; tasten.prevX = x; tasten.a = tasten.x = false;
  if(neuA) springen();
  if(neuX) umschauen();
}
function knieUmschalten(){
  if(!eva || eva.boat || eva.rover || sw.aktiv || figur.aktion || !steuerbar()) return;
  if(figur.kniet) aufstehen(); else hinknien();
}
// X: Look Around (60 fps, 4,5 s, auf der Stelle) – einmal ansehen, Stick bricht ab, danach wieder Stehen
function umschauen(){
  if(!eva || eva.boat || eva.rover || sw.aktiv || !steuerbar() || figur.aktion || figur.kniet || !figur.acts.look || !eva.onGround) return;
  figur.aktion = 'look'; figur.aktT = 0;
  figurAnim('look', 0.25, 1);
  fuchsSuche();                                   // Suchblick: der Fuchs schnueffelt nach Interaktionsobjekten
}
function hinknien(){
  if(!figur.acts.kneel) return;
  figur.kniet = true;
  figurAnim('kneel', 0.35, 1);
  fuchsRufen();
}
function aufstehen(){
  figur.kniet = false;
  figurAnim('idle', 0.4);
  fuchsLoslassen();
}
// Gitarren-Loop (Pixabay: idoberg, punk rock guitar loop) – leise, solange er Gitarre spielt; jede
// Bewegung stoppt ihn sofort (kein Ausblenden). Der Puffer wird beim ersten Mal dekodiert.
const GITARRE_VOL = 0.09;
const gitarre = { buf: null, laedt: false, quelle: null, gain: null };
function gitarreLaden(dann){
  if(gitarre.buf){ if(dann) dann(); return; }
  if(dann) (gitarre.warten || (gitarre.warten = [])).push(dann);
  if(gitarre.laedt || !audioCtx || !window.GITARRE_SND) return; gitarre.laedt = true;
  decodeSound(window.GITARRE_SND).then(b => { gitarre.buf = b; const w = gitarre.warten || []; gitarre.warten = null; for(const f of w) f(); })
    .catch(e => { gitarre.laedt = false; console.warn('Gitarre:', e); });
}
story.gitarreLaden = gitarreLaden;
function gitarreMusik(an){
  if(!an || !soundOn || !audioCtx || audioCtx.state !== 'running' || !window.GITARRE_SND){
    if(gitarre.quelle){ try { gitarre.quelle.stop(); } catch(e){} gitarre.quelle = null; }
    return;
  }
  if(gitarre.quelle) return;
  if(!gitarre.buf){
    // Live-Befund 16.10. ("ich hoere die Rockmusik nicht mehr"): beim ersten Mal wurde nur dekodiert und nie gespielt –
    // gitarreMusik(true) kommt nur einmal beim Wechsel zur Gitarre. Jetzt: nach dem Dekodieren gleich los, wenn er noch spielt
    gitarreLaden(() => { if(figur.cur === 'guitar' && !figur.aktion && !figur.kniet) gitarreMusik(true); });
    return;
  }
  const s = audioCtx.createBufferSource(); s.buffer = gitarre.buf; s.loop = true;
  if(!gitarre.gain){ gitarre.gain = audioCtx.createGain(); gitarre.gain.connect(audioCtx.destination); }
  gitarre.gain.gain.value = GITARRE_VOL;
  s.connect(gitarre.gain); s.start();
  gitarre.quelle = s;
}
function updateFigur(dt){
  if(!figur.obj) return;
  if(figur.cur !== 'guitar' || figur.ausschlag > 0.05 || figur.aktion || figur.kniet || sw.aktiv){ gitarreMusik(false); fuchsTanzEnde(); }
  if(!figur.mixer){
    // altes GLB ohne Rig: beim Laufen leicht wippen
    const a = figur.ausschlag || 0;
    figur.t += dt * (6 + a * 8);
    figur.inner.position.y = a > 0.05 ? Math.abs(Math.sin(figur.t)) * 0.05 * Math.min(1, a * 2) : 0;
    return;
  }
  figur.mixer.update(dt);
  if(!eva) return;
  if(figur.aktion){
    figur.aktT += dt;
    const clip = figur.acts[figur.aktion].getClip();
    const frei = figur.aktion === 'jump' ? SPRUNG_FREI : figur.aktion === 'look' ? clip.duration - 0.35 : clip.duration / ROLL_TEMPO - 0.3;
    const dauer = clip.duration / figur.acts[figur.aktion].timeScale;
    const stick = figur.aktion === 'roll' ? figur.rollStick : figur.ausschlag;
    if(figur.aktion === 'look' && figur.aktT < frei){ figur.steht = 0; return; }   // Umschauen: bis kurz vor Schluss, dann weich zurueck
    if(figur.aktion !== 'look' && (figur.aktT < frei || (figur.aktT < dauer - 0.1 && stick < 0.1))) return;
    figur.aktion = null;                          // naechster Clip blendet aus dem Endbild
  }
  if(figur.kniet) return;
  // Arbeiten (z. B. Schnitzen, notizbuch.js – story.arbeiten): Joshi hockt sich hin, dieselbe Pose wie Knien, aber OHNE
  // figur.kniet – der Fuchs kommt dann nicht zum Spielen (Live-Wunsch 16.10.). Fuer jede kuenftige Arbeit wiederverwendbar.
  if(figur.arbeitet){ figurAnim('kneel', 0.35, 1); figur.steht = 0; return; }
  if(sw.aktiv){ figurAnim('swim', 0.3, 0.6 + figur.ausschlag * 0.6); figur.steht = 0; return; }
  const v = figur.tempo;
  if(figur.ausschlag > 0.5){ figurAnim('run', 0.2, klemme(v / 5.2, 0.8, 1.3)); figur.steht = 0; }
  else if(figur.ausschlag > 0.05){ figurAnim('walk', 0.25, klemme(v / 1.5, 0.6, 1.4)); figur.steht = 0; }
  else {
    // Waehrend die Stimme spricht (oder eine Szene laeuft) gilt Stillstand nicht als "idle": keine Gitarre (Live-Befund
    // 16.10.: sie fing mitten in der Erklaerung an). Die Zeit beginnt danach von vorn.
    // ... und nicht, waehrend der Fuchs gerade markiert (Live-Wunsch 16.10.)
    if(sprichtGerade || sprichWarte.length || (story.szeneLaeuft && story.szeneLaeuft()) || fuchs.modus === 'schnueffeln'){
      figur.steht = 0;
      if(figur.cur === 'guitar'){ gitarreMusik(false); fuchsTanzEnde(); }
      figurAnim('idle', 0.3, 1); return;
    }
    if(steuerbar()) figur.steht += dt;          // erst nach dem Startbildschirm zaehlen
    if(figur.steht > GITARRE_NACH && figur.acts.guitar){ figurAnim('guitar', 0.6, 1); gitarreMusik(true); fuchsTanzStart(); return; }
    else figurAnim('idle', 0.3, 1);
  }
}
// ---- Staub beim Laufen (Live-Wunsch 15.10.): hebt sich ein Fuss vom Sand/Gras, wirbelt dort ein kleines Woelkchen auf
// (Kontrast zum kleineren, blasseren Schatten). Erkannt am Zehenknochen: war er unten und steigt ueber STAUB_HOCH -> Woelkchen.
// Nicht auf dem Steg, im Wasser, beim Schwimmen oder im Innenraum.
const STAUB_UNTEN = 0.08, STAUB_HOCH = 0.12, STAUB_DAUER = 0.8, STAUB_MAX = 30;
const staub = { teile: [], tex: null, fuesse: null, frei: 0 };
function staubTextur(){
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function staubPuff(p, stark){
  if(!staub.tex) staub.tex = staubTextur();
  let t = staub.teile.find(q => q.alter >= STAUB_DAUER);
  if(!t){
    if(staub.teile.length >= STAUB_MAX) return;
    // nachts kein leuchtendes Beige: gedecktes Sandgrau (Sprites sind unbeleuchtet)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: staub.tex, color: 0xc2b694, transparent: true, depthWrite: false, opacity: 0 }));
    sp.renderOrder = 3; welt(1).add(sp);
    t = { sp, alter: STAUB_DAUER }; staub.teile.push(t);
  }
  t.alter = 0; t.stark = stark; t.sp.visible = true;
  t.sp.position.set(p.x + (Math.random() - 0.5) * 0.06, p.y + 0.03, p.z + (Math.random() - 0.5) * 0.06);
  t.dx = (Math.random() - 0.5) * 0.12; t.dz = (Math.random() - 0.5) * 0.12;
}
const _fp = new THREE.Vector3();
function updateStaub(dt){
  for(const t of staub.teile){
    if(t.alter >= STAUB_DAUER){ t.sp.visible = false; continue; }
    t.alter += dt; const k = Math.min(1, t.alter / STAUB_DAUER);
    t.sp.position.x += t.dx * dt; t.sp.position.z += t.dz * dt; t.sp.position.y += 0.18 * dt * (1 - k);
    t.sp.scale.setScalar(0.14 + 0.4 * Math.sqrt(k) * t.stark);
    t.sp.material.opacity = 0.55 * t.stark * (1 - k) * Math.min(1, t.alter / 0.08);
  }
  if(!figur.obj || !eva || locale !== 'earth') return;
  if(!staub.fuesse){
    staub.fuesse = [];
    figur.obj.traverse(o => { if(o.isBone && /ToeBase$/.test(o.name)) staub.fuesse.push({ bone: o, unten: true }); });
  }
  const g = eva.group.position;
  const geht = figur.ausschlag > 0.05 && eva.onGround && !figur.kniet && !sw.aktiv && !(story.innen && story.innen.drin)
    && !(story.imBoot && story.imBoot()) && !(story.aufSteg && story.aufSteg(g.x, g.z)) && watGrund(g.x, g.z) === null
    && (isOnLand(g.x, g.z) || isOnBeach(g.x, g.z));
  for(const f of staub.fuesse){
    f.bone.getWorldPosition(_fp);
    const h = _fp.y - evaFootY(_fp.x, _fp.z);
    if(h < STAUB_UNTEN) f.unten = true;
    else if(f.unten && h > STAUB_HOCH){ f.unten = false; if(geht) staubPuff({ x: _fp.x, y: evaFootY(_fp.x, _fp.z), z: _fp.z }, figur.ausschlag > 0.5 ? 1 : 0.65); }
  }
  fuchsStaub(dt);
}
// Fuchsi wirbelt auch Staub auf (Live-Wunsch 18.10.2026): laeuft er schneller als FUCHS_STAUB_V, steigt in kurzen
// Abstaenden hinter ihm ein kleineres Woelkchen auf (er ist klein und leicht) – nur auf Gras und Sand, nicht auf dem
// Steg, im Wasser, im Boot oder im Innenraum.
const FUCHS_STAUB_V = 0.3, _ffp = new THREE.Vector3();
function fuchsStaub(dt){
  const F = fuchs; if(!F.obj || !F.aktiv || !F.obj.visible || F.modus === 'boot' || (story.innen && story.innen.drin) || dt <= 0) return;
  const p = F.obj.position, v = staub.fuchsVor ? Math.hypot(p.x - staub.fuchsVor.x, p.z - staub.fuchsVor.z) / dt : 0;
  const rx = staub.fuchsVor ? p.x - staub.fuchsVor.x : 0, rz = staub.fuchsVor ? p.z - staub.fuchsVor.z : 0;
  staub.fuchsVor = (staub.fuchsVor || _ffp).set(p.x, p.y, p.z);
  if(v < FUCHS_STAUB_V || v > 20){ staub.fuchsT = Math.min(staub.fuchsT || 0, 0.08); return; }
  if((staub.fuchsT = (staub.fuchsT || 0) - dt) > 0) return;
  staub.fuchsT = 0.18 + 0.22 / (0.6 + Math.min(1.5, v / 3)) + Math.random() * 0.06;
  if((story.aufSteg && story.aufSteg(p.x, p.z)) || watGrund(p.x, p.z) !== null || !(isOnLand(p.x, p.z) || isOnBeach(p.x, p.z))) return;
  const l = Math.hypot(rx, rz) || 1;
  staubPuff({ x: p.x - rx / l * 0.25, y: evaFootY(p.x, p.z), z: p.z - rz / l * 0.25 }, Math.min(0.6, 0.35 + v / 15));
}
story.staub = staub;

// ---- Figur-Absicherung + Diagnose (?debug) – wie kenjiWache in Spiel_SFG -----------------------
// Gemeldet: die Figur verschwindet nach einer Weile Gitarrespielen (lokal im Test nicht nachstellbar).
// Jedes Bild: in eva.group einhaengen, sichtbar, kein Culling. Mit ?debug steht unten links der Zustand.
const DEBUG = /[?&]debug\b/.test(location.search);
let dbgEl = null, dbgT = 0;
function figurWache(dt){
  if(!figur.obj || !eva || !eva.group || eva.rover || eva.boat) return;
  if(figur.obj.parent !== eva.group){ eva.group.clear(); eva.group.add(figur.obj); story.figurRepariert = (story.figurRepariert || 0) + 1; }
  eva.group.visible = true;
  figur.obj.traverse(o => { o.visible = true; if(o.isMesh) o.frustumCulled = false; });
  if(!DEBUG) return;
  dbgT -= dt; if(dbgT > 0) return; dbgT = 0.5;
  if(!dbgEl){
    dbgEl = document.createElement('div');
    dbgEl.style.cssText = 'position:absolute;left:8px;bottom:28px;color:#ff0;font:12px monospace;'
      + 'background:rgba(0,0,0,.5);padding:4px 6px;z-index:40;pointer-events:none;white-space:pre;';
    document.body.appendChild(dbgEl);
  }
  const p = eva.group.position, w = new THREE.Vector3(); let mesh = null;
  figur.obj.traverse(o => { if(o.isMesh) mesh = o; });
  if(mesh) mesh.getWorldPosition(w);
  const laufen = Object.keys(figur.acts).filter(n => figur.acts[n].isRunning()).map(n => n + ':' + figur.acts[n].getEffectiveWeight().toFixed(2));
  dbgEl.textContent = 'Figur ' + figur.cur + ' steht=' + figur.steht.toFixed(1) + ' eva=' + p.x.toFixed(1) + ',' + p.y.toFixed(1) + ',' + p.z.toFixed(1)
    + ' mesh=' + w.x.toFixed(1) + ',' + w.y.toFixed(1) + ',' + w.z.toFixed(1) + ' repariert=' + (story.figurRepariert || 0) + '\nClips: ' + laufen.join(' ');
}
// Punkt relativ zur Figur: vor = Meter nach vorn (Blickrichtung), links = Meter nach links
function nebenFigur(vor, links){
  const p = eva.group.position, y = eva.yaw;          // Engine: Nase -Z, yaw um +Y
  const fx = -Math.sin(y), fz = -Math.cos(y);          // vorn
  const lx = -Math.cos(y), lz = Math.sin(y);           // links
  return { x: p.x + fx * vor + lx * links, z: p.z + fz * vor + lz * links };
}

// ---- Schwimmen (aus Spiel_SFG) ----------------------------------------------------------------
// Laeuft die Figur ins Meer, watet sie erst (flacher Grund am Strand), dann schwimmt sie: linker
// Stick bewegt und dreht, rechter Stick vor taucht ab, zurueck taucht auf (Tastatur: E / Q). An Land steht sie wieder.
const SCHWIMM_V   = 1.6;     // m/s
const TAUCH_V     = 1.2;     // m/s auf und ab
const SCHWIMM_TIEF = 0.35;   // m: so tief liegt der Koerper an der Oberflaeche im Wasser (Figur 1,20 m; Swim-Clip liegt waagerecht)
const sw = story.schwimm = { aktiv: false };
function schwimmStart(x, z){
  sw.aktiv = true;
  figur.kniet = false; figur.aktion = null;
  const g = eva.group;
  g.position.set(x, seaYAt(x, z) - SCHWIMM_TIEF, z);
  eva.vy = 0; eva.onGround = true;
  evaJumpFrom = null;
}
function tauchEingabe(){
  let d = 0;
  if(keys['KeyE']) d -= 1;
  if(keys['KeyQ']) d += 1;
  if(gamepadIndex !== null){
    const gp = navigator.getGamepads()[gamepadIndex];
    if(gp){
      // rechter Stick wie das U-Boot (Flugspiel, Trip to Japan): nach vorn = abtauchen, zurueck = auftauchen
      const ry = gp.axes[3] || 0;
      if(Math.abs(ry) > 0.2) d += (ry - Math.sign(ry) * 0.2) / 0.8;
    }
  }
  return klemme(d, -1, 1);
}
function schwimmUpdate(dt, inp){
  const g = eva.group;
  eva.yaw -= (inp.yaw || 0) * EVA_TURN * dt;
  g.rotation.y = eva.yaw;
  const v = -(inp.pitch || 0) * SCHWIMM_V;
  const nx = g.position.x - Math.sin(eva.yaw) * v * dt;
  const nz = g.position.z - Math.cos(eva.yaw) * v * dt;
  figur.ausschlag = Math.abs(inp.pitch || 0); figur.tempo = 0;
  // Ans Ufer: wieder zu Fuss
  if(evaSolid(nx, nz) && !isOpenWater(nx, nz) || isOnBeach(nx, nz) || isOnLand(nx, nz) || watGrund(nx, nz) !== null){
    sw.aktiv = false;
    g.position.set(nx, evaFootY(nx, nz), nz);
    eva.vy = 0; eva.onGround = true;
    return;
  }
  if(story.schwimmGesperrt && story.schwimmGesperrt(g.position, nx, nz)){ evaKmh = 0; state.pos.copy(eva.planeAt); return; }
  g.position.x = nx; g.position.z = nz;
  const oben = seaYAt(nx, nz, dt) - SCHWIMM_TIEF;
  const unten = seabedY(nx, nz) + 0.8;
  const t = tauchEingabe();
  let y = g.position.y + t * TAUCH_V * dt;
  if(t === 0 && y < oben) y = Math.min(oben, y + 0.4 * dt);     // ohne Eingabe treibt sie nach oben
  g.position.y = Math.max(unten, Math.min(oben, y));
  eva.onGround = true;
  state.pos.copy(eva.planeAt);
  evaKmh = Math.abs(v) * 3.6;
}
// Waten: am Sandrand ist das Wasser auf den ersten WAT_W m flach. Dort steht die Figur auf dem
// Grund; erst wo es tiefer als WAT_TIEF ist, schwimmt sie (Koerper dann etwa zur Haelfte im Wasser).
const WAT_W = 12, WAT_TIEF = 0.6;
function watAbstand(x, z){
  if(isOnLand(x, z) || isOnBeach(x, z)) return 0;
  for(let r = 2; r <= WAT_W; r += 2){
    for(let k = 0; k < 8; k++){ const a = k * Math.PI / 4; if(isOnBeach(x + Math.cos(a) * r, z + Math.sin(a) * r) || isOnLand(x + Math.cos(a) * r, z + Math.sin(a) * r)) return r; }
  }
  return Infinity;
}
function watGrund(x, z){ const d = watAbstand(x, z); if(d === 0 || d === Infinity) return null; return seaYAt(x, z) - WAT_TIEF * (d / WAT_W) * 0.98; }
story.watGrund = watGrund;
function hookSchwimmen(){
  // Ins Wasser = schwimmen (statt Schlauchboot der Engine)
  evaEnterDinghy = function(x, z){ if(eva && !eva.boat && !sw.aktiv) schwimmStart(x, z); };
  const solidOrig = evaSolid, fussOrig = evaFootY, bedOrig = seabedY;
  evaSolid = function(x, z){ if(solidOrig.apply(this, arguments)) return true; return locale === 'earth' && watGrund(x, z) !== null; };
  evaFootY = function(x, z){ if(locale === 'earth'){ const g = watGrund(x, z); if(g !== null) return g; } return fussOrig.apply(this, arguments); };
  // Meeresboden in der Watzone flach (sonst sieht man unter Wasser einen Sockel)
  seabedY = function(x, z, islands){ const r = bedOrig.apply(this, arguments);
    if(islands || locale !== 'earth') return r;
    const g = watGrund(x, z); return g !== null ? Math.min(r, g) : r; };
  // Kamera beim Schwimmen: dichter dran, beim Tauchen tiefer
  const camOrig = updateCamera;
  updateCamera = function(){
    if(eva && sw.aktiv){
      const p = eva.group.position, yaw = eva.yaw + evaOrbit;
      const tief = seaYAt(p.x, p.z) - p.y;
      const k = klemme((tief - 0.5) / 2, 0, 1);
      const dist = 5 - 1.6 * k, hoch = 1.9 - 1.5 * k;
      const soll = new THREE.Vector3(p.x + Math.sin(yaw) * dist, p.y + hoch, p.z + Math.cos(yaw) * dist);
      if(sideView !== 0){
        const qx = Math.cos(eva.yaw), qz = -Math.sin(eva.yaw);
        soll.set(p.x + qx * 5 * sideView, p.y + 0.5 + 0.5 * (1 - k), p.z + qz * 5 * sideView);
      }
      camera.position.lerp(soll, Math.min(1, 6 * dtCam));
      camera.up.set(0, 1, 0);
      camera.lookAt(p.x, p.y + 0.35, p.z);
      return;
    }
    return camOrig.apply(this, arguments);
  };
}

// ---- Fuchs: der Begleiter --------------------------------------------------------------------
// Fox von pxltiger (CC-BY-4.0), 30 Animationen (nur die "InPlace"-Varianten – bewegt wird er hier).
// Verhalten:
//   warten    – zu Beginn sitzt er am Strand und schaut aufs Meer, bis die Figur zu ihm kommt.
//   streifen  – frei und neugierig: laeuft zu Punkten um die Figur, schnuppert, sitzt mal kurz,
//               huepft vor Freude. Entfernt sie sich, kommt er hinterher. Ins Wasser geht er nicht.
//   kommen    – die Figur kniet (A): er rennt zu ihr ...
//   spielen   – ... und macht direkt vor ihr Fox_Attack_Paws/Tail (sieht nach Spielen aus),
//   hinsetzen – danach setzt er sich links neben sie und bleibt, bis sie aufsteht.
const FUCHS_LANG = 0.9;                    // m Kopf bis Schwanzspitze
const _fb = new THREE.Vector3();
const FA = {
  stehen: 'Fox_Idle', gehen: 'Fox_Walk_InPlace', rennen: 'Fox_Run_InPlace',
  setzen: 'Fox_Sit1', sitzen: 'Fox_Sit2_Idle', sitzPause: 'Fox_Sit_Idle_Break', aufstehen: 'Fox_Sit3_StandUp',
  // Spielen vor der knienden Figur: dreimal mit den Pfoten (Live-Wunsch 14.10.2026 – der erste faellt noch halb in die
  // Ankunft), dann hinsetzen. Der Schwanzschlag (Attack_Tail) gehoert zum Tanz (TANZ_DREH).
  spielen: ['Fox_Attack_Paws', 'Fox_Attack_Paws', 'Fox_Attack_Paws'], huepfen: 'Fox_Jump_Pivot_InPlace',
};
const EINMAL = [FA.setzen, FA.aufstehen, FA.sitzPause, FA.huepfen, ...new Set(FA.spielen), 'Fox_Somersault_InPlace', 'Fox_Attack_Tail'];
const fuchs = story.fuchs = { obj: null, mixer: null, acts: {}, cur: null, kopf: 0, yaw: 0, aktiv: false,
  modus: 'warten', ziel: null, warte: 0, t: 0, spielI: 0, sitzt: false, tun: null };
function preloadFuchs(){
  ladeGlb(window.FUCHS_GLB, 'Fuchs', (gltf) => {
    const obj = gltf.scene;
    obj.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = true; } });
    const mixer = new THREE.AnimationMixer(obj);
    for(const c of gltf.animations){
      const a = fuchs.acts[c.name] = mixer.clipAction(c);
      if(EINMAL.includes(c.name)){ a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; }
    }
    // In der gehaeuteten Haltung messen (die Bindepose-Box passt nicht, siehe SFG tiere.js)
    if(fuchs.acts[FA.stehen]) fuchs.acts[FA.stehen].play();
    mixer.update(0.01); obj.updateMatrixWorld(true);
    const bb = new THREE.Box3(), p = new THREE.Vector3();
    obj.traverse(m => { if(!m.isSkinnedMesh) return; const n = m.geometry.attributes.position.count;
      for(let i = 0; i < n; i += 3){ m.boneTransform(i, p); p.applyMatrix4(m.matrixWorld); bb.expandByPoint(p); } });
    if(bb.isEmpty()) bb.setFromObject(obj);
    const sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    // Blickrichtung: vom Koerpermittelpunkt zum Kopfknochen
    let kopf = null; obj.traverse(o => { if(!kopf && o.isBone && /head/i.test(o.name)) kopf = o; });
    obj.traverse(o => { if(!fuchs.becken && o.isBone && /Pelvis/i.test(o.name)) fuchs.becken = o; });   // fuer das Anheben bei Salto/Schwanzschlag
    const kp = kopf ? kopf.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 0, 1);
    fuchs.kopf = Math.atan2(kp.x - c.x, kp.z - c.z);
    const k = FUCHS_LANG / Math.max(sz.x, sz.z);
    obj.scale.multiplyScalar(k);
    obj.position.set(-c.x * k, -bb.min.y * k, -c.z * k);    // mittig, Pfoten auf y = 0
    // Ruhehoehe des Beckens in der Idle-Haltung, relativ zum Fuss des Fuchses (wrap steht bei y = 0)
    if(fuchs.becken){ obj.updateMatrixWorld(true); fuchs.beckenRuhe = fuchs.becken.getWorldPosition(new THREE.Vector3()).y; fuchs.inner = obj; fuchs.innerY = obj.position.y; }
    const wrap = new THREE.Group(); wrap.add(obj);
    fuchs.obj = wrap; fuchs.mixer = mixer; fuchs.cur = FA.stehen;
    // eigener weicher Bodenschatten (dasselbe Material wie Joshis Ovalschatten), haengt am Fuchs, liegt flach
    fuchs.schatten = new THREE.Mesh(new THREE.CircleGeometry(1, 24), ovalShadowMat.clone());   // eigene Kopie: die Engine aendert die Deckkraft des Originals mit Joshis Sprunghoehe
    fuchs.schatten.material.opacity = 0.22 * (typeof SHADOW_DECK === 'number' ? SHADOW_DECK : 1);   // etwas durchsichtiger (Live-Wunsch 15.10.), insgesamt dezenter (Engine)
    fuchs.schatten.rotation.x = -Math.PI / 2; fuchs.schatten.scale.set(0.24, 0.5, 1); fuchs.schatten.position.y = typeof SHADOW_LIFT === 'number' ? SHADOW_LIFT : 0.045;
    fuchs.schatten.rotation.z = fuchs.kopf;                      // Laengsachse zum Kopf
    wrap.add(fuchs.schatten);
    if(typeof shadowFollowFeet === 'function') shadowFollowFeet(fuchs.schatten, wrap);   // folgt den Pfoten (Engine)
    wrap.userData.agent = true;                                       // Begleiter: eigene Grenzregeln, kein Ding
    if(fuchs.wartetAuf) fuchsAbsetzen(fuchs.wartetAuf);
  });
}
// Spiel- und Trick-Clips sind kurz und schnell (Schwanzschlag: 150 Grad in 0,8 s) – langsamer abspielen und nur kurz
// ueberblenden, sonst ging die Mitte der Drehung in der Blende unter (Live-Befund: Anfang und Ende sichtbar, Mitte fehlt)
const FUCHS_LANGSAM = { Fox_Attack_Paws: 0.75, Fox_Attack_Tail: 0.7, Fox_Somersault_InPlace: 0.75, Fox_Jump_Pivot_InPlace: 0.85 };
function fuchsAnim(name, blend){
  if(fuchs.cur === name || !fuchs.acts[name]) return;
  const a = fuchs.acts[name];
  a.timeScale = FUCHS_LANGSAM[name] || 1;
  if(FUCHS_LANGSAM[name]) blend = Math.min(blend || 0.3, 0.08);
  a.reset().play();
  if(fuchs.cur && fuchs.acts[fuchs.cur]) fuchs.acts[fuchs.cur].crossFadeTo(a, blend || 0.3, false);
  fuchs.cur = name;
}
// Clip von vorn starten, auch wenn er gerade schon laeuft (zweimal Pfoten, Tanzdrehungen); alle anderen Clips werden
// sauber ausgeblendet (vorher lief bei cur = null der alte Clip mit vollem Gewicht weiter).
function fuchsNeu(name){
  const a = fuchs.acts[name]; if(!a) return;
  if(EINMAL.includes(name)){ a.setLoop(THREE.LoopOnce); a.clampWhenFinished = true; }
  a.timeScale = FUCHS_LANGSAM[name] || 1;
  for(const n in fuchs.acts){ const b = fuchs.acts[n]; if(b !== a && b.isRunning()) b.fadeOut(0.08); }
  a.reset(); a.setEffectiveWeight(1); a.fadeIn(0.08); a.play();
  fuchs.cur = name;
}
// Laeuft ein Einmal-Clip noch?
function fuchsClipLaeuft(name){
  const a = fuchs.acts[name];
  return fuchs.cur === name && a && a.time < a.getClip().duration - 0.03;
}
// Wo darf er laufen? Gras, Sand und der Huetten-Innenraum – nicht ins Wasser (auch nicht ins Flache), nicht in Waende
// Grenzen der Dinge (objekte.js) in seiner Groesse; steckt er schon drin (von), darf er jeden Schritt, der nicht tiefer geht
function fuchsFrei(x, z, von){
  // Live-Befund 18.10.2026: unter dem Steg liegt die Watzone (z 99..110) – der Fuchs steht aber OBEN auf den Planken.
  // Vorher sperrte watGrund dort quer ueber den ganzen Steg: nach dem Segeln kam er vom Ende nicht mehr herunter.
  const steg = !!(story.aufSteg && story.aufSteg(x, z));
  if(!evaSolid(x, z) || (!steg && watGrund(x, z) !== null) || (story.hitsOhneDinge || hitsBuilding)(x, ISLAND_Y + 0.5, z, false)) return false;
  const t = story.fuchsTiefe(x, z);
  return t <= 0 || (!!von && t <= story.fuchsTiefe(von.x, von.z) + 1e-6);
}
// Die Figur wechselt durch die Huettentuer (huette_innen.js): der Fuchs kommt mit – ausser er wartet noch am Strand
story.fuchsZu = function(ziel){
  if(!fuchs.obj || !fuchs.aktiv || fuchs.modus === 'warten' || !eva) return;
  // neben die Figur (nicht hinter sie: beim Hinausgehen laege das in der Huette, dort steckte der Fuchs fest)
  let n = nebenFigur(0.4, 1.1);
  if(!fuchsFrei(n.x, n.z)) n = nebenFigur(0.4, -1.1);
  n = story.freierPlatz(n.x, n.z, 'fuchs');
  fuchs.obj.position.set(n.x, evaFootY(n.x, n.z), n.z);
  fuchs.yaw = eva.yaw + Math.PI; fuchs.ziel = null; fuchs.warte = 1.5;
  if(fuchs.modus !== 'streifen'){ fuchs.modus = 'streifen'; fuchs.sitzt = false; }
};
// Fuchs ins Boot (steg.js): sitzt vorn im Bug und schaut aufs Meer; beim Aussteigen zurueck auf den Steg neben Joshi
story.fuchsInsBoot = function(rein){
  if(!fuchs.obj || !fuchs.aktiv) return;
  if(fuchs.schatten) fuchs.schatten.visible = !rein;
  if(rein){ fuchs.modus = 'boot'; fuchs.sitzt = true; fuchs.tanz = null; fuchs.such = null; fuchs.cur = null; fuchsAnim(FA.sitzen, 0.01); }
  else if(eva){ fuchs.modus = 'streifen'; fuchs.sitzt = false; fuchs.warte = 1.5; fuchsAnim(FA.aufstehen, 0.2);
    const v = nebenFigur(-1.0, 0.5), n = story.freierPlatz(v.x, v.z, 'fuchs'); fuchs.obj.position.set(n.x, evaFootY(n.x, n.z), n.z); fuchs.yaw = eva.yaw + Math.PI; }
};
// Fuchs bei (x, z) in die Welt setzen, Blick p.blick (Winkel ab +Z), p.modus (Standard: streifen), p.sitzt (sitzend
// anfangen), p.warte (s bis er losstreift)
function fuchsAbsetzen(p){
  if(!fuchs.obj){ fuchs.wartetAuf = p; return; }
  fuchs.wartetAuf = null;
  welt(story.etappe).add(fuchs.obj);
  const n = story.freierPlatz(p.x, p.z, 'fuchs');
  fuchs.obj.position.set(n.x, evaFootY(n.x, n.z), n.z);
  fuchs.yaw = p.blick;
  fuchs.aktiv = true;
  fuchs.modus = p.modus || 'streifen'; fuchs.ziel = null; fuchs.warte = p.warte || 2;
  if(fuchs.modus === 'warten' || p.sitzt){ fuchs.acts[FA.sitzen] && (fuchs.cur = null, fuchsAnim(FA.sitzen, 0.01)); fuchs.sitzt = true; }
}
story.fuchsAbsetzenAuf = (p) => fuchsAbsetzen(p);              // waldinsel.js: Ankunft am Steg
// ---- Fuchs tanzt zur Gitarre (Live-Wunsch 14.10.2026) ----------------------------------------------------------
// Spielt die Figur Gitarre, rennt der Fuchs an einen Platz TANZ_ABST m vor ihr und laeuft dort quer vor ihr hin und
// her (TANZ_BREIT m), dreht sich immer wieder (Hopser mit Drehung, Salto). Nach TANZ_DAUER s setzt er sich genau vor
// sie und schaut sie an. Hoert sie auf, streift er wieder.
const TANZ_ABST = 5, TANZ_BREIT = 1.5, TANZ_DAUER = 10;
// Je Runde (10 s) kommen etwa 3-4 Drehungen dran – die Reihenfolge sorgt fuer zwei Saltos pro Runde
const TANZ_DREH = ['Fox_Somersault_InPlace', 'Fox_Jump_Pivot_InPlace', 'Fox_Somersault_InPlace', 'Fox_Attack_Tail'];
const SITZ_PAUSE = 10;        // s Sitzen, dann von vorn (Tanz bzw. Pfoten), solange Gitarre bzw. Knien dauert
function fuchsTanzStart(){
  // auch aus dem Warten am Strand heraus: die Gitarre lockt ihn (sonst sass er beim Spielstart hinter der Figur und fehlte im Bild)
  if(!fuchs.aktiv || fuchs.modus === 'tanzen') return;
  if(fuchs.modus === 'warten' && fuchs.sitzt) fuchsAnim(FA.aufstehen, 0.2);
  fuchs.modus = 'tanzen'; fuchs.tanz = { phase: 'hin', t: 0, seite: 1, dreh: 0, naechste: 1.2 }; fuchs.sitzt = false; fuchs.ziel = null;
}
function fuchsTanzEnde(){
  if(fuchs.modus !== 'tanzen') return;
  fuchs.modus = 'streifen'; fuchs.ziel = null; fuchs.warte = fuchs.sitzt ? 0.6 : 0.3;
  if(fuchs.sitzt) fuchsAnim(FA.aufstehen, 0.2);
  fuchs.sitzt = false; fuchs.tanz = null;
}
function fuchsTanz(dt, fp){
  const T = fuchs.tanz, g = eva.group.position;
  // Abstand: 5 m (im Huetten-Raum 2,5 m) – liegt der Platz in einem Hindernis (Huette, Feuer ...), so nah heran,
  // bis er frei ist (sonst lief der Fuchs an der Wand hin und her und kam nie an)
  let ab = story.innen && story.innen.drin ? 2.5 : TANZ_ABST;
  while(ab > 1.6){ const q = nebenFigur(ab, 0); if(fuchsFrei(q.x, q.z) && fuchsFrei(nebenFigur(ab, TANZ_BREIT).x, nebenFigur(ab, TANZ_BREIT).z) && fuchsFrei(nebenFigur(ab, -TANZ_BREIT).x, nebenFigur(ab, -TANZ_BREIT).z)) break; ab -= 0.3; }
  const mitte = nebenFigur(ab, 0);
  if(T.phase === 'hin'){
    const d = fuchsLaufe(dt, mitte.x, mitte.z, Math.hypot(mitte.x - fp.x, mitte.z - fp.z) > 3 ? 7 : 3);
    T.hinT = (T.hinT || 0) + dt;
    if(d < 0.3 || fuchs.blockiert || T.hinT > 6){ T.phase = 'tanz'; T.t = 0; T.hinT = 0; }   // spaetestens nach 6 s: hier tanzen
    return;
  }
  if(T.phase === 'tanz'){
    if(fuchs.cur === FA.aufstehen && fuchsClipLaeuft(FA.aufstehen)) return;   // nach der Sitzpause erst aufstehen
    T.t += dt;
    if(T.t > TANZ_DAUER){ T.phase = 'setzen'; return; }
    // laeuft eine Drehung? dann auf der Stelle bleiben, bis sie fertig ist
    if(T.drehClip){ if(fuchsClipLaeuft(T.drehClip)) return; T.drehClip = null; }
    if((T.naechste -= dt) <= 0){
      const c = TANZ_DREH[T.dreh++ % TANZ_DREH.length];
      if(fuchs.acts[c]){ fuchsNeu(c); T.drehClip = c; }
      T.naechste = 1.4 + Math.random() * 1.2;
      return;
    }
    // quer vor der Figur hin und her: Ziel abwechselnd links / rechts der Mitte
    const z = nebenFigur(ab, T.seite * TANZ_BREIT);
    const d = fuchsLaufe(dt, z.x, z.z, 2.6);
    if(d < 0.3 || fuchs.blockiert) T.seite = -T.seite;
    return;
  }
  // setzen: genau vor die Figur, Blick zu ihr
  if(!fuchs.sitzt){
    const d = fuchsLaufe(dt, mitte.x, mitte.z, 1.6);
    if(d < 0.2 || fuchs.blockiert){ fuchs.sitzt = true; fuchs.sitzT = 0; fuchsAnim(FA.setzen, 0.25); }
  } else {
    // nach SITZ_PAUSE s wieder aufstehen und den ganzen Tanz von vorn (Joshi spielt weiter)
    if((fuchs.sitzT += dt) > SITZ_PAUSE){ fuchs.sitzt = false; fuchsAnim(FA.aufstehen, 0.2); Object.assign(T, { phase: 'tanz', t: 0, dreh: 0, naechste: 0.8, drehClip: null }); return; }
    fuchsSchaue(dt, g.x, g.z, 3);
    if(fuchs.cur === FA.setzen && !fuchsClipLaeuft(FA.setzen)) fuchsAnim(FA.sitzen, 0.2);
    else if(fuchs.cur === FA.sitzen && Math.random() < dt / 9) fuchsAnim(FA.sitzPause, 0.2);
    else if(fuchs.cur === FA.sitzPause && !fuchsClipLaeuft(FA.sitzPause)) fuchsAnim(FA.sitzen, 0.2);
  }
}
function fuchsRufen(){
  if(!fuchs.aktiv) return;
  // Kniet Joshi mitten im Markieren hin, kommt der Fuchs – merkt sich aber, was er noch nicht markiert hat (Live-Wunsch
  // 16.10.: als markiert gilt nur, was einmal angetippt und geblinkt hat), und macht nach dem Aufstehen weiter
  if(fuchs.modus === 'schnueffeln' && fuchs.such) fuchs.suchRest = fuchs.such.liste.slice(fuchs.such.i).filter(o => !o.entdeckt);
  fuchs.such = null;
  fuchs.modus = 'kommen'; fuchs.ziel = null; fuchs.sitzt = false;
}
function fuchsLoslassen(){
  if(!fuchs.aktiv || fuchs.modus === 'streifen') return;
  fuchs.modus = 'streifen'; fuchs.ziel = null;
  fuchs.warte = fuchs.sitzt ? 0.6 : 0;
  if(fuchs.sitzt) fuchsAnim(FA.aufstehen, 0.2);
  fuchs.sitzt = false;
  // unterbrochener Rundgang: weiter mit dem, was noch fehlt
  const rest = (fuchs.suchRest || []).filter(o => !o.entdeckt); fuchs.suchRest = null;
  if(rest.length){ fuchs.modus = 'schnueffeln'; fuchs.such = { liste: rest, i: 0, phase: 'hin', t: 0, platz: null }; }
}
const STREIF_R = 9;            // m: so weit streift er um die Figur herum
const STREIF_MAX = 16;         // m: weiter weg -> er kommt zuegig hinterher
const WARTE_BIS = 5;           // m: so nah muss die Figur kommen, dann begleitet er sie
// Laeuft zum Punkt (zx, zz). tempo m/s. Rueckgabe: Restabstand.
// Figur und Fuchs sind Koerper: je ein Kreis um den Mittelpunkt (unabhaengig von der Animation). Der Fuchs laeuft
// um die Figur herum und nie in sie hinein; die Figur laeuft nicht durch den Fuchs (evaSolid, hookFigur).
const FIGUR_R = 0.3, FUCHS_R = 0.25, ABSTAND_MIN = FIGUR_R + FUCHS_R;
function fuchsLaufe(dt, zx, zz, tempo){
  const fp = fuchs.obj.position;
  const dx = zx - fp.x, dz = zz - fp.z, d = Math.hypot(dx, dz);
  if(d < 0.05) return d;
  let soll = Math.atan2(dx, dz);
  // Liegt die Figur auf dem Weg (zwischen Fuchs und Ziel, naeher als Umweg-Radius an der Linie): seitlich vorbei
  if(eva && eva.group){
    const g = eva.group.position, gx = g.x - fp.x, gz = g.z - fp.z, gd = Math.hypot(gx, gz);
    const vor = (gx * dx + gz * dz) / d;                         // wie weit voraus (auf der Linie)
    const seit = (gx * dz - gz * dx) / d;                        // Abstand zur Linie (Vorzeichen = Seite)
    const UM = ABSTAND_MIN + 0.35;
    if(vor > 0 && vor < d + 0.2 && Math.abs(seit) < UM && gd > 0.05){
      const weg = Math.atan2(gx, gz) + (seit > 0 ? -1 : 1) * Math.min(Math.PI / 2, Math.asin(Math.min(1, UM / gd)) + 0.15);
      soll = weg;                                                // an der Figur vorbei, auf der Seite des Ziels
    }
  }
  // Um Hindernisse herum (Feuer, Kiste, Palme, Huette): ist die Richtung blockiert, schrittweise links/rechts bis 120 Grad
  // probieren und die erste freie nehmen. Die einmal gewaehlte Seite bleibt eine Weile (umSeite), sonst pendelte er.
  const schritt = Math.max(0.12, tempo * dt);
  const frei = (w) => { const x = fp.x + Math.sin(w) * schritt, z = fp.z + Math.cos(w) * schritt; return fuchsSchrittFrei(fp, x, z); };
  if(!frei(soll)){
    let gefunden = null;
    const seiten = fuchs.umSeite ? [fuchs.umSeite, -fuchs.umSeite] : [1, -1];
    for(let a = 0.3; a <= 2.1 && gefunden === null; a += 0.3) for(const sd of seiten){ if(frei(soll + sd * a)){ gefunden = soll + sd * a; fuchs.umSeite = sd; break; } }
    if(gefunden !== null){ soll = gefunden; fuchs.umT = 0.6; }
  } else if((fuchs.umT = (fuchs.umT || 0) - dt) <= 0) fuchs.umSeite = 0;
  const dw = winkelDiff(fuchs.yaw, soll);
  fuchs.yaw += klemme(dw, -6 * dt, 6 * dt);
  const s = Math.min(d, tempo * dt) * Math.max(0.3, Math.cos(dw));
  const nx = fp.x + Math.sin(fuchs.yaw) * s, nz = fp.z + Math.cos(fuchs.yaw) * s;
  fuchs.blockiert = !fuchsSchrittFrei(fp, nx, nz);
  if(!fuchs.blockiert){ fp.x = nx; fp.z = nz; fuchsAnim(tempo >= 4 ? FA.rennen : FA.gehen, 0.2); }
  else if(!frei(soll)){ fuchs.ziel = null; fuchsAnim(FA.stehen, 0.3); }   // wirklich kein Weg (Wasser): stehen bleiben
  else fuchs.blockiert = false;                                             // dreht noch in die freie Richtung
  return d;
}
// ---- Eigene Wegsuche (Live-Befund 16.10.: beim Absuchen blieb er haengen, wenn Joshi dicht an einem Objekt stand) ----
// Ein kleines Raster (WEG_RASTER m) um Start und Ziel, A* ueber freie Zellen (fester Grund, keine Grenze, nicht in Joshi),
// daraus Wegpunkte, die fuchsGeheZu nacheinander ablaeuft. Kein Weg -> die erreichbare Zelle, die dem Ziel am naechsten ist
// (er bleibt nie stehen, wo er nicht weiterkommt).
const WEG_RASTER = 0.3, WEG_RAND = 4, WEG_MAX = 2600;
function fuchsWeg(sx, sz, zx, zz){
  const minX = Math.min(sx, zx) - WEG_RAND, minZ = Math.min(sz, zz) - WEG_RAND;
  const nx = Math.ceil((Math.max(sx, zx) + WEG_RAND - minX) / WEG_RASTER) + 1, nz = Math.ceil((Math.max(sz, zz) + WEG_RAND - minZ) / WEG_RASTER) + 1;
  const idx = (i, j) => j * nx + i, px = (i) => minX + i * WEG_RASTER, pz = (j) => minZ + j * WEG_RASTER;
  const si = Math.round((sx - minX) / WEG_RASTER), sj = Math.round((sz - minZ) / WEG_RASTER);
  const zi = Math.round((zx - minX) / WEG_RASTER), zj = Math.round((zz - minZ) / WEG_RASTER);
  const g = eva && eva.group ? eva.group.position : null;
  const freiCache = new Map();
  const frei = (i, j) => { const k = idx(i, j); let f = freiCache.get(k);
    if(f === undefined){ const x = px(i), z = pz(j); f = fuchsFrei(x, z) && !(g && Math.hypot(x - g.x, z - g.z) < ABSTAND_MIN + 0.1); freiCache.set(k, f); } return f; };
  const h = (i, j) => Math.hypot(i - zi, j - zj);
  const gK = new Map([[idx(si, sj), 0]]), von = new Map(), offen = [[h(si, sj), si, sj]];
  let best = [si, sj], bestH = h(si, sj), n = 0;
  while(offen.length && n++ < WEG_MAX){
    let m = 0; for(let q = 1; q < offen.length; q++) if(offen[q][0] < offen[m][0]) m = q;
    const [, i, j] = offen.splice(m, 1)[0], k = idx(i, j), gk = gK.get(k);
    const hh = h(i, j); if(hh < bestH){ bestH = hh; best = [i, j]; }
    if(i === zi && j === zj) break;
    for(const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]){
      const a = i + di, b = j + dj; if(a < 0 || b < 0 || a >= nx || b >= nz) continue;
      if(!frei(a, b) && !(a === zi && b === zj)) continue;
      if(di && dj && (!frei(i + di, j) || !frei(i, j + dj))) continue;      // nicht diagonal durch eine Ecke
      const kn = idx(a, b), gn = gk + (di && dj ? 1.414 : 1);
      if(gK.has(kn) && gK.get(kn) <= gn) continue;
      gK.set(kn, gn); von.set(kn, k); offen.push([gn + h(a, b), a, b]);
    }
  }
  // Weg zurueckverfolgen (bis zum Ziel oder der naechsten erreichbaren Zelle), dann ausduennen
  const pfad = []; let k = idx(best[0], best[1]);
  while(k !== undefined){ pfad.unshift({ x: px(k % nx), z: pz(Math.floor(k / nx)) }); k = von.get(k); }
  if(best[0] === zi && best[1] === zj) pfad[pfad.length - 1] = { x: zx, z: zz };
  return pfad.filter((p, i) => i === pfad.length - 1 || i % 2 === 1);
}
// Zum Punkt (zx, zz) laufen – mit Wegsuche. Rueckgabe: Restabstand zum Ziel. Neu geplant wird, wenn sich das Ziel
// aendert, er 0,5 s nicht vorankommt oder sein Weg zu Ende ist.
function fuchsGeheZu(dt, zx, zz, tempo){
  const fp = fuchs.obj.position, W = fuchs.weg || (fuchs.weg = { pfad: [], zx: NaN, zz: NaN, fest: 0, lx: fp.x, lz: fp.z });
  const rest = Math.hypot(zx - fp.x, zz - fp.z);
  if(rest < 0.25){ W.pfad = []; return rest; }
  if(Math.hypot(W.zx - zx, W.zz - zz) > 0.3 || !W.pfad.length || W.fest > 0.5){
    W.pfad = fuchsWeg(fp.x, fp.z, zx, zz); W.zx = zx; W.zz = zz; W.fest = 0;
  }
  while(W.pfad.length > 1 && Math.hypot(W.pfad[0].x - fp.x, W.pfad[0].z - fp.z) < 0.3) W.pfad.shift();
  const p = W.pfad[0] || { x: zx, z: zz };
  fuchsLaufe(dt, p.x, p.z, tempo);
  // kommt er nicht voran? (weniger als ein Zehntel des Sollwegs)
  const g = Math.hypot(fp.x - W.lx, fp.z - W.lz); W.lx = fp.x; W.lz = fp.z;
  W.fest = g < tempo * dt * 0.1 ? W.fest + dt : 0;
  return rest;
}
// Darf der Fuchs von fp nach (x, z)? Fester Grund, kein Hindernis und nicht naeher in die Figur hinein
function fuchsSchrittFrei(fp, x, z){
  if(!fuchsFrei(x, z, fp)) return false;
  if(eva && eva.group){ const g = eva.group.position, neu = Math.hypot(x - g.x, z - g.z);
    if(neu < ABSTAND_MIN && neu < Math.hypot(fp.x - g.x, fp.z - g.z)) return false; }
  return true;
}
function fuchsSchaue(dt, x, z, rate){
  const fp = fuchs.obj.position;
  fuchs.yaw += klemme(winkelDiff(fuchs.yaw, Math.atan2(x - fp.x, z - fp.z)), -rate * dt, rate * dt);
}
function updateFuchs(dt){
  if(!fuchs.obj || !fuchs.aktiv) return;
  fuchs.mixer.update(dt);
  fuchs.t += dt;
  const fp = fuchs.obj.position;
  const zu = eva && eva.group ? eva.group.position : state.pos;
  const dFigur = Math.hypot(zu.x - fp.x, zu.z - fp.z);
  if(dFigur > 80 && fuchs.modus !== 'warten'){               // abgehaengt (z. B. nach einem Flug): nachholen
    const n = eva ? nebenFigur(-2, 1) : { x: zu.x + 3, z: zu.z + 3 };
    if(fuchsFrei(n.x, n.z)){ fp.x = n.x; fp.z = n.z; fuchs.ziel = null; }
  }

  if(fuchs.modus === 'warten'){
    // sitzt am Strand; kommt die Figur nah, steht er auf, huepft und begleitet sie
    if(fuchs.cur === FA.sitzen && Math.random() < dt / 8) fuchsAnim(FA.sitzPause, 0.2);
    else if(fuchs.cur === FA.sitzPause && !fuchsClipLaeuft(FA.sitzPause)) fuchsAnim(FA.sitzen, 0.2);
    if(eva && dFigur < WARTE_BIS){
      fuchs.modus = 'streifen'; fuchs.sitzt = false; fuchs.ziel = null; fuchs.warte = 1.2; fuchs.tun = 'huepfen';
      fuchsAnim(FA.aufstehen, 0.2);
    }
  } else if(fuchs.modus === 'boot'){
    // vorn im Bug vor dem Mast (Platz aus steg.js, Live-Skizze), Blick aufs Meer, schaukelt mit
    const b = story.bootPunkt && story.bootPunkt(story.stegZustand.platzFuchs || 1.8, 0, 0.12);
    if(b){ fp.copy(b); fuchs.yaw = story.bootYaw(); fuchs.obj.rotation.y = fuchs.yaw - fuchs.kopf; }
    if(fuchs.schatten) fuchs.schatten.visible = false;               // im Boot kein Bodenschatten
    if(fuchs.cur === FA.sitzen && Math.random() < dt / 10) fuchsAnim(FA.sitzPause, 0.2);
    else if(fuchs.cur === FA.sitzPause && !fuchsClipLaeuft(FA.sitzPause)) fuchsAnim(FA.sitzen, 0.2);
    return;
  } else if(fuchs.modus === 'foto'){
    // notizbuch.js fuehrt ihn (laeuft ins Bild, setzt sich, schaut in die Kamera) – hier nichts tun
    if(fuchs.cur === FA.setzen && !fuchsClipLaeuft(FA.setzen)) fuchsAnim(FA.sitzen, 0.2);
  } else if(fuchs.modus === 'schnueffeln' && eva){
    fuchsSchnueffeln(dt, fp);
  } else if(fuchs.modus === 'tanzen' && eva){
    fuchsTanz(dt, fp);
  } else if(fuchs.modus === 'kommen' && eva && fuchs.cur === FA.aufstehen && fuchsClipLaeuft(FA.aufstehen)){
    // erst fertig aufstehen (nach der Sitzpause), dann wieder hin
  } else if(fuchs.modus === 'kommen' && eva){
    // vor die Figur, leicht zur Seite versetzt (1,1 m vor, 0,35 m links) – sonst verdeckte Joshi ihn fuer die Kamera
    const v = nebenFigur(1.1, 0.35);
    const d = fuchsLaufe(dt, v.x, v.z, Math.hypot(v.x - fp.x, v.z - fp.z) > 3 ? 6.5 : 2.5);
    // Ziel im Wasser (Figur watet): am Ufer bleiben und von dort aus spielen
    if(d < 0.2 || fuchs.blockiert){
      fuchs.modus = 'spielen'; fuchs.spielI = 0;
      fuchsAnim(FA.spielen[0], 0.15);
    }
  } else if(fuchs.modus === 'spielen' && eva){
    fuchsSchaue(dt, zu.x, zu.z, 6);
    if(!fuchsClipLaeuft(fuchs.cur)){
      if(++fuchs.spielI < FA.spielen.length) fuchsNeu(FA.spielen[fuchs.spielI]);   // auch gleicher Clip: von vorn
      else fuchs.modus = 'hinsetzen';
    }
  } else if(fuchs.modus === 'hinsetzen' && eva){
    // links neben die Figur, gleiche Blickrichtung wie sie
    const l = nebenFigur(0.15, 0.85);
    if(!fuchs.sitzt){
      const d = fuchsLaufe(dt, l.x, l.z, 1.6);
      if(d < 0.15 || fuchs.blockiert){ fuchs.sitzt = true; fuchs.sitzT = 0; fuchsAnim(FA.setzen, 0.25); }
    } else {
      // nach SITZ_PAUSE s wieder aufstehen und noch einmal mit den Pfoten spielen (Joshi kniet weiter)
      if((fuchs.sitzT += dt) > SITZ_PAUSE){ fuchs.sitzt = false; fuchs.modus = 'kommen'; fuchsAnim(FA.aufstehen, 0.2); return; }
      // zur Blickrichtung der Figur drehen (Engine-yaw -> Winkel ab +Z: yaw + PI)
      fuchs.yaw += klemme(winkelDiff(fuchs.yaw, eva.yaw + Math.PI), -3 * dt, 3 * dt);
      if(fuchs.cur === FA.setzen && !fuchsClipLaeuft(FA.setzen)) fuchsAnim(FA.sitzen, 0.2);
      else if(fuchs.cur === FA.sitzen && Math.random() < dt / 9) fuchsAnim(FA.sitzPause, 0.2);
      else if(fuchs.cur === FA.sitzPause && !fuchsClipLaeuft(FA.sitzPause)) fuchsAnim(FA.sitzen, 0.2);
    }
  } else {
    // streifen: frei und neugierig
    if(fuchs.cur === FA.aufstehen && fuchsClipLaeuft(FA.aufstehen)){ /* erst fertig aufstehen */ }
    else if(dFigur > STREIF_MAX){
      // Live-Befund 18.10.2026 (nach dem Segeln hing Fuchsi auf dem Steg fest): das Nachholen lief ohne Wegsuche schraeg
      // auf Joshi zu, auf dem schmalen Steg gegen die Randgrenze – er rannte auf der Stelle. Auf dem Steg erst laengs
      // in der Mitte zum Strand-Ende, sonst mit Wegsuche (fuchsGeheZu) wie beim Absuchen.
      const S = story.steg, aufSteg = S && Math.abs(fp.x - S.x) < S.B / 2 + 0.2 && fp.z > S.zSand && fp.z < S.zEnde + 0.5;
      const h = eva ? nebenFigur(-2.5, 1.2) : { x: zu.x, z: zu.z };
      const strandSeite = S && zu.z < S.zSand + 1;                  // Joshi ist am Strand (nicht auf dem Steg/draussen)
      if(aufSteg && strandSeite) fuchsLaufe(dt, S.x, S.zSand - 1.5, 7.5);
      else fuchsGeheZu(dt, h.x, h.z, 7.5);
      fuchs.ziel = null; fuchs.warte = 0.5; fuchs.tun = null;
    } else if(fuchs.ziel){
      const d = fuchsLaufe(dt, fuchs.ziel.x, fuchs.ziel.z, fuchs.ziel.tempo);
      if(d < 0.3){ fuchs.ziel = null; fuchs.warte = 1.5 + Math.random() * 4; fuchs.tun = fuchsLaune(); }
    } else {
      fuchs.warte -= dt;
      fuchsBeschaeftigt(dt, zu);
      if(fuchs.warte <= 0) fuchsNeuesZiel(zu);
    }
  }
  fp.y = evaFootY(fp.x, fp.z);
  // Pivot-Hopser: der Clip dreht den Fuchs nicht (nur 14 Grad) – die halbe Drehung macht der Code, weich mit dem Hopser
  let dreh = 0;
  if(fuchs.cur === 'Fox_Jump_Pivot_InPlace' && fuchs.acts[fuchs.cur]){
    const a = fuchs.acts[fuchs.cur], k = Math.min(1, a.time / a.getClip().duration);
    const e = k * k * (3 - 2 * k);
    dreh = Math.PI * e;
    fp.y += Math.sin(Math.PI * k) * 0.22;                        // kleiner Bogen in der Luft
    if(k >= 0.999 && !fuchs.drehFertig){ fuchs.yaw += Math.PI; fuchs.drehFertig = true; dreh = 0; }
  } else fuchs.drehFertig = false;
  fuchs.obj.rotation.y = fuchs.yaw - fuchs.kopf + dreh;
  // Salto und Schwanzschlag senken das Becken im Clip weit unter die Ruhehoehe – dann den Fuchs so weit anheben,
  // dass er nicht in den Boden taucht (die Mitte der Drehung war sonst unter der Grasflaeche)
  if(fuchs.inner && fuchs.becken && fuchs.beckenRuhe !== undefined){
    fuchs.inner.position.y = fuchs.innerY;
    fuchs.obj.updateMatrixWorld(true);
    // Becken in Fuchs-Koordinaten (ohne die Welt-Hoehe fp.y), mit der Ruhehoehe vergleichen
    const tief = fuchs.beckenRuhe - (fuchs.becken.getWorldPosition(_fb).y - fp.y);
    if(tief > 0.01 && FUCHS_LANGSAM[fuchs.cur]) fuchs.inner.position.y = fuchs.innerY + tief * 0.85;
  }
}
// Was er am Ziel macht: schnuppern (stehen, Kopf herum), kurz sitzen oder vor Freude huepfen
function fuchsLaune(){
  const r = Math.random();
  if(r < 0.55) return 'schnuppern';
  if(r < 0.85) return 'sitzen';
  return 'huepfen';
}
function fuchsBeschaeftigt(dt, zu){
  if(fuchs.tun === 'sitzen'){
    if(fuchs.cur !== FA.setzen && fuchs.cur !== FA.sitzen && fuchs.cur !== FA.aufstehen){ fuchsAnim(FA.setzen, 0.3); fuchs.warte = Math.max(fuchs.warte, 4); }
    else if(fuchs.cur === FA.setzen && !fuchsClipLaeuft(FA.setzen)) fuchsAnim(FA.sitzen, 0.2);
    fuchsSchaue(dt, zu.x, zu.z, 1.5);                       // sitzt und guckt zur Figur
    if(fuchs.warte <= 0.6 && fuchs.cur === FA.sitzen) fuchsAnim(FA.aufstehen, 0.2);
  } else if(fuchs.tun === 'huepfen'){
    if(fuchs.cur !== FA.huepfen){ if(!fuchsClipLaeuft(FA.aufstehen)) fuchsAnim(FA.huepfen, 0.2); }
    else if(!fuchsClipLaeuft(FA.huepfen)) fuchs.tun = 'schnuppern';
  } else {
    if(!fuchsClipLaeuft(FA.aufstehen)) fuchsAnim(FA.stehen, 0.3);
    fuchs.yaw += Math.sin(fuchs.t * 1.3) * 0.6 * dt;        // neugierig herumschauen
  }
}
// Neues Ziel: ein Punkt im Umkreis der Figur, bevorzugt vor ihr (da, wo sie hinlaeuft)
function fuchsNeuesZiel(zu){
  const fp = fuchs.obj.position;
  for(let i = 0; i < 12; i++){
    const vor = eva ? (Math.random() * 1.6 - 0.4) * STREIF_R : 0;
    const quer = (Math.random() * 2 - 1) * STREIF_R;
    const z = eva ? nebenFigur(vor, quer) : { x: zu.x + quer, z: zu.z + vor };
    if(Math.hypot(z.x - zu.x, z.z - zu.z) < 2) continue;    // nicht vor die Fuesse
    if(Math.hypot(z.x - fp.x, z.z - fp.z) < 2.5) continue;   // lohnt sich nicht
    if(!fuchsFrei(z.x, z.z)) continue;
    const weit = Math.hypot(z.x - fp.x, z.z - fp.z) > 7;
    fuchs.ziel = { x: z.x, z: z.z, tempo: weit && Math.random() < 0.6 ? 5 : 1.5 };
    fuchs.tun = null;
    return;
  }
  fuchs.warte = 1;
}

// ---- Interaktionsobjekte (global) -------------------------------------------------------------------------
// Fuer die Geschichte wichtige Objekte melden sich mit story.interaktion(obj, { name, x, z, r, yHoehe, aktion }) an.
// Sie tun erst etwas, wenn Joshi sie mit dem Suchblick (X) entdeckt hat: dann schnueffelt der Fuchs umher, macht vor
// jedem noch unentdeckten Objekt in der Naehe (INTER_SUCH_R) kurz einen Pfoten-Hopser, und das Objekt leuchtet auf.
// Danach erscheint ueber einem entdeckten Objekt ein "Y", sobald Joshi nah genug ist (r + INTER_Y_R); Y loest
// seine aktion aus. Ohne Suchblick: kein Y, nichts passiert.
//   x, z: Mitte · r: Radius des Objekts (fuer Fuchs-Platz und Y-Naehe) · yHoehe: Hoehe des Y ueber dem Boden ·
//   text: Saetze der Erzaehlerin bei Y (oder aktion(o)) · einmal: true = reines Info-Objekt – nach dem ersten Y
//   (Text gehoert) kein Y mehr · danach(o): was Y ab dem zweiten Mal tut (statt des Texts) ·
//   welt: Etappe, in der es wichtig ist (Standard: die aktuelle) ·
//   innen: true = steht im Huetten-Raum (Live-Wunsch: dort gibt es auch Interaktionsobjekte). Nicht jedes Objekt ist in
//   jeder Etappe wichtig – angemeldet wird nur, was die Geschichte dort braucht.
const INTER_SUCH_R = 20, INTER_Y_R = 1.6, GLOW_T = 1.6;   // X untersucht 20 m weit (Live-Wunsch 16.10.)
const INNEN_BODEN = 150;
const TEXT_ALLES_ENTDECKT = ['Hier hast Du schon alles entdeckt.'];
// Alles entdeckt, aber noch nicht an allem Y gedrueckt (Live-Wunsch 16.10.) – Hinweis-Taste und X sagen das
const TEXT_NOCH_OFFEN = ['Klasse, Du hast alles entdeckt. Gehe zu jedem Objekt und schau, ob du was tun kannst.'];
// EINHEITLICHE LOGIK (Live-Wunsch 16.10.) fuer Objekte und farbige Kreise (notizbuch.js):
//   unentdeckt  -> X schaltet frei, der Fuchs laeuft hin und markiert (Pfote + Blinken)
//   offen       -> entdeckt, aber noch nicht mit Y benutzt: X schickt den Fuchs NOCHMAL hin (zeigt es, ohne Ansage),
//                  die Detektivmuetze erscheint in der Naehe, die Hinweis-Taste sagt TEXT_NOCH_OFFEN
//   erledigt    -> einmal mit Y benutzt (das Funkgeraet bleibt mit Y bedienbar, zaehlt aber dann als erledigt)
function offen(o){ return o.entdeckt && !o.benutzt && !o.erledigt; }
story.objektOffen = offen;
const TEXT_NICHTS_HIER = ['Hier scheint es nichts Interessantes zu geben.'];      // Boden des Huetten-Raums (huette_innen.js BODEN_Y)
const GLOW_FARBE = new THREE.Color(0xffd27a);
const interListe = [];
function interaktion(obj, opt){
  const o = Object.assign({ obj, name: '', x: 0, z: 0, r: 1, yHoehe: 1.5, aktion: null, danach: null, einmal: false, erledigt: false, benutzt: 0, welt: story.etappe, innen: false,
    entdeckt: false, glow: 0, glowDauer: 1, zeichen: null, mats: null }, opt);
  interListe.push(o); return o;
}
story.interaktion = interaktion;
story.interListe = interListe;
// Leuchten: Emissive aller Materialien des Objekts kurz Richtung warmes Gelb (Original wird gemerkt und zurueckgesetzt)
function setGlow(o, k){
  if(!o.mats){ o.mats = []; o.obj.traverse(n => { if(!n.isMesh) return;
    for(const m of (Array.isArray(n.material) ? n.material : [n.material]))
      if(m && m.emissive && !o.mats.some(x => x.m === m)) o.mats.push({ m, e: m.emissive.clone(), i: m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1 }); }); }
  for(const x of o.mats){ x.m.emissive.copy(x.e).lerp(GLOW_FARBE, k * 0.75); if(x.m.emissiveIntensity !== undefined) x.m.emissiveIntensity = x.i + k * 0.5; }
}
function glowStart(o, t){ o.glow = o.glowDauer = t; }
// "Y" wie der gelbe Controller-Knopf
let yTex = null;
function yZeichen(){
  if(!yTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#f5c518'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Y', 64, 66);
    yTex = new THREE.CanvasTexture(c); }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: yTex, depthTest: false, transparent: true }));
  s.scale.setScalar(0.6); s.renderOrder = 999; return s;
}
// Das naechste entdeckte Objekt in Y-Reichweite (nur zu Fuss, draussen)
function interNaechstes(){
  if(!eva || eva.boat || eva.rover || sw.aktiv) return null;
  const drin = !!(story.innen && story.innen.drin);
  const g = eva.group.position; let best = null, bd = 1e9;
  for(const o of interListe){ if(o.welt !== story.etappe || !o.entdeckt || o.erledigt || o.innen !== drin) continue;
    const d = Math.hypot(o.x - g.x, o.z - g.z) - o.r; if(d < INTER_Y_R && d < bd){ bd = d; best = o; } }
  return best;
}
let interT = 0;
function updateInteraktion(dt){
  interT += dt;
  const nah = interNaechstes();
  for(const o of interListe){
    if(o.glow > 0){ o.glow = Math.max(0, o.glow - dt); setGlow(o, Math.max(0, Math.sin((1 - o.glow / o.glowDauer) * Math.PI))); }
    // Waehrend eine Erklaerung laeuft (Live-Wunsch 16.10.), braucht es kein Y – es kommt danach wieder
    const zeigen = o === nah && !o.spricht;
    if(zeigen && !o.zeichen){ o.zeichen = yZeichen(); welt(o.welt).add(o.zeichen); }
    // yx/yz: das Y steht ueber einer anderen Stelle als der Standplatz (Tiere am Festtisch: Joshi steht davor, das Y ueber dem Tier)
    if(o.zeichen){ o.zeichen.visible = zeigen; if(zeigen) o.zeichen.position.set(o.yx !== undefined ? o.yx : o.x, (o.innen ? INNEN_BODEN : ISLAND_Y) + o.yHoehe + Math.sin(interT * 3) * 0.07, o.yz !== undefined ? o.yz : o.z); }
  }
}
function interAktion(o){
  if(o.spricht) return;                                          // spricht noch: Y tut nichts
  glowStart(o, 0.8);
  o.benutzt++;
  if(o.benutzt > 1 && o.danach) return o.danach(o);             // ab dem zweiten Mal (z. B. Funkrauschen)
  if(o.aktion) return o.aktion(o);
  if(o.text){
    o.spricht = true;
    // Info-Objekt: das Y verschwindet sofort; nach dem Text erscheint es nicht wieder
    if(o.einmal){ o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; }
    const text = typeof o.text === 'function' ? o.text(o) : o.text;   // Text kann vom Spielstand abhaengen (Huette)
    sprich(text, () => { o.spricht = false; if(story.fall1Pruefen) story.fall1Pruefen(); }, o.rolle);   // Erzaehlerin; danach: Funk faellig?
  }
}
function hookInteraktion(){
  // Y an einem entdeckten Objekt = dessen Aktion (statt Ein-/Aussteigen der Engine)
  const yOrig = buttonY;
  // In Pause und Inventar tun Y (und B, siehe hookFigur) nichts – sonst stieg man z. B. im Inventar ins Boot
  buttonY = function(){ if(hilfeOffen()) return; if(story.fotoY && story.fotoY()) return;   // notizbuch.js: Foto-/Skizzenstelle
    const o = interNaechstes(); if(o){ interAktion(o); return; } return yOrig.apply(this, arguments); };
}
// Suchblick: Fuchs besucht die unentdeckten Objekte in der Naehe, jeweils das naechste zuerst
function fuchsSuche(){
  if(story.innen && story.innen.drin) hinweisStand.innenGeschaut = true; else hinweisStand.aussenGeschaut = true;
  if(!fuchs.aktiv || !eva) return;
  const g = eva.group.position;
  const drin = !!(story.innen && story.innen.drin);
  // Global (Live-Wunsch 16.10.): X untersucht im Umkreis INTER_SUCH_R (20 m) und schaltet alles darin frei – Objekte UND
  // farbige Markierungen (notizbuch.js). Der Fuchs laeuft dann ALLES Freigeschaltete ab, das er noch nicht markiert hat,
  // auch wenn es weiter weg liegt (z. B. die Markierungen, die nach der Erklaerung freigeschaltet wurden), und markiert es.
  story.fuchsRundgang(g.x, g.z, drin, INTER_SUCH_R);
}
// Rundgang des Fuchses: zuerst im Umkreis r um (x, z) alles freischalten, dann alles Freigeschaltete, aber noch nicht
// Markierte ablaufen (das naechste zuerst). r = 0: nichts Neues freischalten, nur ablaufen (nach der Erklaerung).
// nurOffen: nur die offenen Dinge (entdeckt, aber noch ohne Y) zeigen, ohne Ansage (die Hinweis-Taste spricht selbst)
// nur (optional): Filter – der Fuchs zeigt nur diese Ziele (waldinsel.js: genau den einen Ring)
story.fuchsRundgang = function(x, z, drin, r, nurOffen, nur){
  if(!fuchs.aktiv || !eva) return;
  if(r) for(const o of interListe) if(o.welt === story.etappe && o.innen === drin && Math.hypot(o.x - x, o.z - z) < r) o.frei = true;
  if(r && story.kreiseFreischalten) story.kreiseFreischalten(x, z, r, drin);
  const kreise = story.sucheKreise ? story.sucheKreise(drin) : [];
  const hier = interListe.filter(o => o.welt === story.etappe && o.innen === drin && o.frei).concat(kreise);
  let rest = nurOffen ? [] : hier.filter(o => !o.entdeckt);
  if(nurOffen){ rest = hier.filter(o => o.kreis ? true : offen(o)); if(nur) rest = rest.filter(nur); if(!rest.length) return; }
  // Nichts Neues: beim X laeuft der Fuchs dann die OFFENEN Dinge ab (entdeckt, aber noch ohne Y; Kreise: noch nicht
  // gemacht) – mit dem Satz, dass man jetzt hingehen soll. Ist auch nichts offen: "schon alles entdeckt" bzw. "nichts hier".
  let nochmal = false;
  if(!rest.length && r && !nurOffen){ rest = hier.filter(o => o.kreis ? true : offen(o)); nochmal = rest.length > 0; }
  if(r && !rest.length || nochmal){ if(!story.allesGesagt){ story.allesGesagt = true;
    sprich(nochmal ? TEXT_NOCH_OFFEN : (hier.length ? TEXT_ALLES_ENTDECKT : TEXT_NICHTS_HIER), () => { story.allesGesagt = false; }); } }
  if(!rest.length) return;
  const liste = []; let px = fuchs.obj.position.x, pz = fuchs.obj.position.z;
  while(rest.length){ rest.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz)); const o = rest.shift(); liste.push(o); px = o.x; pz = o.z; }
  if(fuchs.sitzt || fuchs.modus === 'warten') fuchsAnim(FA.aufstehen, 0.2);
  fuchs.sitzt = false; fuchs.tanz = null; fuchs.ziel = null;
  fuchs.modus = 'schnueffeln'; fuchs.such = { liste, i: 0, phase: 'hin', t: 0, platz: null, nochmal };
}
// Notbremse: er laeuft hoechstens so lange zu einem Objekt, wie der Weg dauert (+ SUCH_LUFT s, mindestens SUCH_MAX s) –
// oder bis er SUCH_FEST s nicht vorankommt; dann schnueffelt er, wo er ist. Live-Befund 16.10.: mit festen 4 s blieb er
// bei den Kreisen am Strand (15 m weit) auf halbem Weg stehen und pfotete von dort.
const SUCH_MAX = 4, SUCH_LUFT = 3, SUCH_FEST = 2;
function fuchsSchnueffeln(dt, fp){
  const S = fuchs.such;
  if(fuchs.cur === FA.aufstehen && fuchsClipLaeuft(FA.aufstehen)) return;
  const o = S.liste[S.i];
  if(!o){ fuchs.modus = 'streifen'; fuchs.such = null; fuchs.warte = 1; return; }
  if(S.phase === 'hin'){
    if(!S.platz){
      // Platz vor dem Objekt, bevorzugt auf der Seite zu Joshi (damit man es sieht) – aber frei UND mit Abstand zu Joshi:
      // stand Joshi dicht am Objekt, war genau dieser Platz zwischen beiden eingeklemmt, und der Fuchs kam nie an
      const g = eva.group.position; let dx = g.x - o.x, dz = g.z - o.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      for(const r of [o.r + 0.55, o.r + 0.9, o.r + 1.3]) {
        for(const a of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.4, -2.4, 3.1]){ const c = Math.cos(a), s = Math.sin(a);
          const x = o.x + (dx * c - dz * s) * r, z = o.z + (dx * s + dz * c) * r;
          if(fuchsFrei(x, z) && Math.hypot(x - g.x, z - g.z) > ABSTAND_MIN + 0.25){ S.platz = { x, z }; break; } }
        if(S.platz) break;
      }
      if(!S.platz) S.platz = { x: fp.x, z: fp.z };
      if(fuchs.weg) fuchs.weg.pfad = [];
      S.tMax = Math.max(SUCH_MAX, Math.hypot(S.platz.x - fp.x, S.platz.z - fp.z) * 1.4 / 2.2 + SUCH_LUFT);
      S.fest = 0; S.bester = Infinity;
    }
    S.t += dt;
    const d = fuchsGeheZu(dt, S.platz.x, S.platz.z, 2.2);       // sucht sich selbst einen freien Weg (wie beim Tanzen)
    if(d < S.bester - 0.05){ S.bester = d; S.fest = 0; } else S.fest += dt;
    if(d < 0.3 || S.t > S.tMax || S.fest > SUCH_FEST){ S.phase = 'schnupper'; S.t = 0; fuchsAnim(FA.stehen, 0.2); }
    return;
  }
  S.t += dt;
  fuchsSchaue(dt, o.x, o.z, 5);
  if(S.phase === 'schnupper'){
    fuchs.yaw += Math.sin(S.t * 9) * 0.9 * dt;                    // schnuppert, Kopf hin und her
    if(S.t > 0.7){ S.phase = 'paw'; S.t = 0; fuchsNeu('Fox_Attack_Paws'); o.entdeckt = true; if(o.blinken) o.blinken(); else glowStart(o, GLOW_T); }   // auch beim "nochmal": zeigt es
    return;
  }
  if(S.phase === 'paw' && !fuchsClipLaeuft('Fox_Attack_Paws')){ S.i++; S.phase = 'hin'; S.platz = null; S.t = 0; }
}

// ---- Hinweise auf D-Pad links (Tastatur T) – wie die kleinen Infos in Trip to Japan, nur gesprochen ------------
// Die Erzaehlerin sagt, was als Naechstes gut waere. Reihenfolge (Live-Wunsch 14.10.2026):
//   1. noch nie umgeschaut:                       "Mit X kannst Du dich ganz genau umschauen ..."
//   2. kam Satz 1 schon zweimal (trotzdem nicht):  "Stelle dich vor das Lagerfeuer und drücke X zum Umschauen."
//   3. draussen schon umgeschaut, in der Huette noch nicht: "Schau dir doch mal deine Huette von innen ganz genau an."
//   4. sonst (alles entdeckt): noch offen – dann der Satz zum Umschauen ohne Neues
//   vor allem anderen: alles eingesammelt und das Funkgeraet ruft -> "Schau doch mal zum Funkgeraet ..."
//   im Segelboot (mit Ziel): "Steuere das Boot einfach auf den roten Punkt des Radars zu."
const HINWEIS = {
  x:      ['Mit X kannst Du dich ganz genau umschauen und alles Wichtige entdecken. Probier es gleich mal am Lagerfeuer aus.'],
  feuer:  ['Stelle dich vor das Lagerfeuer und drücke X zum Umschauen.'],
  huette: ['Schau dir doch mal deine Hütte von innen ganz genau an.'],
  funk:   ['Schau doch mal zum Funkgerät. Jemand möchte mit dir sprechen und braucht vielleicht deine Hilfe.'],
  boot:   ['Steuere das Boot einfach auf den roten Punkt des Radars zu.'],
  detektiv: ['Schau dich ganz genau um, um alles zu entdecken.'],
  // Waldinsel (Etappe 2, Entwurf): erst zum Tisch, dann mit X die Tiere entdecken
  e2tisch: ['Geh doch mal zum Tisch. Dort sitzen die Tiere. Mit X kannst du sie entdecken.'],
};
const hinweisStand = { xSatz: 0, aussenGeschaut: false, innenGeschaut: false, spricht: false };
story.hinweisStand = hinweisStand;
function hinweisGeben(){
  if(hinweisStand.spricht || !story.gestartet) return;
  const H = hinweisStand;
  let satz;
  // Alles eingesammelt und der Funk ruft (Live-Wunsch 16.10.): zum Funkgeraet schicken – geht allem anderen vor
  if(story.imBoot && story.imBoot()){ if(!story.ziel) return; satz = HINWEIS.boot; }   // im Segelboot: zum roten Punkt (ohne Ziel kein Satz)
  else if(story.detektivPhase && story.detektivPhase()) satz = HINWEIS.detektiv;      // Markierungen offen (notizbuch.js)
  else if(radio.fall1 === 'ruft') satz = HINWEIS.funk;
  else if(story.etappe === 2){                                      // Waldinsel: eine Welt, keine Huette
    const hier = interListe.filter(o => o.welt === 2), e2 = story.e2Hinweis && story.e2Hinweis();
    if(e2){ satz = e2; if(story.e2HinweisFuchs) story.e2HinweisFuchs(); }   // Spur am Tisch (waldinsel.js); der Fuchs zeigt den Ring
    else if(!H.aussenGeschaut || hier.some(o => !o.entdeckt)) satz = HINWEIS.e2tisch;
    else if(hier.some(offen)){ satz = TEXT_NOCH_OFFEN; const g = eva && eva.group.position; if(g) story.fuchsRundgang(g.x, g.z, false, 0, true); }
    else satz = TEXT_ALLES_ENTDECKT;
  }
  else if(!H.aussenGeschaut && !H.innenGeschaut){
    if(H.xSatz >= 2) satz = HINWEIS.feuer;
    else { satz = HINWEIS.x; H.xSatz++; }
  } else {
    // Pro Welt getrennt (Live-Befund 16.10.: in der fertig ausgeraeumten Huette kam der Satz fuer die offenen Dinge
    // draussen): Huetten-Raum und Insel draussen zaehlen jeweils fuer sich
    const drin = !!(story.innen && story.innen.drin);
    const hier = interListe.filter(o => o.welt === story.etappe && o.innen === drin);
    if(!H.innenGeschaut && !drin && !hier.some(o => !o.entdeckt || offen(o))) satz = HINWEIS.huette;
    else if(hier.some(o => !o.entdeckt)) satz = HINWEIS.x;
    else if(hier.some(offen)){
      satz = TEXT_NOCH_OFFEN;                                      // entdeckt, aber noch ohne Y: der Fuchs zeigt sie nochmal
      const g = eva && eva.group.position; if(g) story.fuchsRundgang(g.x, g.z, drin, 0, true);
    }
    else if(!drin && !H.innenGeschaut) satz = HINWEIS.huette;
    else satz = TEXT_ALLES_ENTDECKT;
  }
  H.spricht = true;
  sprich(satz, () => { H.spricht = false; });
}
story.hinweisGeben = hinweisGeben;
function hookHinweis(){
  addEventListener('keydown', e => { if(e.code === 'KeyT' && !e.repeat) hinweisGeben(); });
  let prev = false;                                              // D-Pad links (14): die Engine wertet es nicht aus
  (function pad(){
    const gp = gamepadIndex !== null ? navigator.getGamepads()[gamepadIndex] : null;
    const d = !!(gp && gp.buttons[14] && gp.buttons[14].pressed);
    if(d && !prev) hinweisGeben();
    prev = d; requestAnimationFrame(pad);
  })();
}

// ---- Stimme + Untertitel ---------------------------------------------------------------------
// Browser erlauben Sprachausgabe erst nach einer Nutzergeste – deshalb der Startbildschirm.
// Immer gesprochen, ohne Untertitel (Live-Wunsch 16.10.: der Spieler kann noch nicht lesen). Der Ton ist immer an – ein
// Umschalten gibt es nicht (hookTon). Immer nur eine Ansage gleichzeitig.
let subEl = null;
function untertitel(text){
  if(!subEl){
    subEl = document.createElement('div');
    subEl.style.cssText = 'position:absolute;left:50%;bottom:9%;transform:translateX(-50%);'
      + 'max-width:min(900px,90vw);padding:12px 18px;border-radius:10px;background:rgba(0,0,0,.6);'
      + 'color:#fff;font:22px/1.4 system-ui,sans-serif;text-align:center;pointer-events:none;'
      + 'transition:opacity .4s;z-index:20;';
    document.body.appendChild(subEl);
  }
  subEl.textContent = '';                               // keine Untertitel (siehe oben) – Aufrufe bleiben harmlos
  subEl.style.opacity = '0';
  void text;
}
const STIMME_W = /Katja|Amala|Seraphina|Louisa|Hedda|Elke|Klarissa|Tanja|Google Deutsch|female|weiblich/i;
const STIMME_M = /Conrad|Killian|Florian|Stefan|Ralf|Kasper|Bernd|Christoph|male|männlich/i;
function stimmeFuer(rolle){
  const de = window.speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
  const re = rolle === 'radio' || rolle === 'tierM' ? STIMME_M : STIMME_W;
  return de.filter(v => re.test(v.name)).sort((a, b) => (a.localService ? 1 : 0) - (b.localService ? 1 : 0))[0] || de[0] || null;
}
function satzDauer(s){ return 1200 + s.length / 14 * 1000; }
let sprichtGerade = null, gehalten = null;
const sprichWarte = [];
// Inventar-Erklaerungen (rolle 'inventar', Live-Frage 16.10.): sie stellen sich nicht hinten an, sondern schieben sich
// dazwischen. Ein laufender Spielsatz wird dafuer "gehalten" (gehalten) – nicht abgebrochen, sein fertig() bleibt offen.
// Schliesst man das Inventar, geht er weiter: genau an der Stelle, wenn nichts erklaert wurde, sonst wird der
// unterbrochene Satz noch einmal von vorn gesprochen (Chrome kann nach einem anderen Satz nicht mitten im Satz weiter).
function halten(){
  const me = sprichtGerade; if(!me || me.rolle === 'inventar') return;
  me.pause(true); me.wiederholen = !!me.satzLaeuft;
  gehalten = me; sprichtGerade = null;
  if(window.speechSynthesis) window.speechSynthesis.cancel();
}
// beim Schliessen von Inventar/Pause: Erklaerung beenden, gehaltenen Satz fortsetzen; true = erledigt
function fortsetzen(){
  story.stimmeStopp();
  const g = gehalten; gehalten = null;
  if(g){ sprichtGerade = g; if(g.wiederholen) g.nochmal(); else g.pause(false); return true; }
  if(!sprichtGerade){ const n = sprichWarte.shift(); if(n) n(); }
  return false;
}
// Saetze nacheinander sprechen; fertig() genau einmal. rolle 'radio' = Radiostimme (tiefer), 'funkRahmen' = Erzaehlerin
// mit Funkrauschen. Funk: vor dem ersten Satz und nach dem letzten je FUNK_RAHMEN s Funkrauschen (Live-Wunsch 16.10.).
const FUNK_RAHMEN = 1;
function sprich(saetze, fertig, rolle){
  if(rolle === 'inventar'){ story.stimmeStopp(); halten(); }
  else if(sprichtGerade || gehalten){ sprichWarte.push(() => sprich(saetze, fertig, rolle)); return; }
  const synth = window.speechSynthesis;
  let i = -1, timer = null, done = false;
  const me = sprichtGerade = { rolle };
  // Rauschen davor/danach: beim Funk (Maennerstimme) und bei der Erklaerung des Funkgeraets ('funkRahmen', Erzaehlerin)
  const funk = rolle === 'radio' || rolle === 'funkRahmen';
  // Pausierbarer Timer (Pause: Restzeit merken, danach weiter) – Notfall-Timer und Funkrauschen-Takt
  let tFn = null, tBis = 0, tRest = 0;
  const stelle = (fn, ms) => { clearTimeout(timer); tFn = fn; tBis = performance.now() + ms; timer = setTimeout(fn, ms); };
  me.stopp = () => { clearTimeout(timer); tFn = null; done = true; };   // story.stimmeStopp
  me.pause = (an) => {
    if(!!an === !!me.angehalten) return;                          // doppelt anhalten verfaelscht die Restzeit
    me.angehalten = !!an;
    if(!tFn) return;
    if(an){ clearTimeout(timer); tRest = Math.max(0, tBis - performance.now()); }
    else stelle(tFn, tRest);
  };
  me.nochmal = () => { me.angehalten = false; me.satzLaeuft = false; i--; weiter(); };   // gehaltenen Satz neu sprechen
  function ende(){
    done = true; untertitel(''); sprichtGerade = null;
    if(fertig) fertig();
    if(rolle === 'inventar') return;                             // die Warteschlange setzt fortsetzen() fort
    const n = sprichWarte.shift(); if(n) n();
  }
  function weiter(){
    clearTimeout(timer); tFn = null;
    if(done) return;
    if(++i >= saetze.length){
      if(funk && !me.nachRauschen){ me.nachRauschen = true; i = saetze.length; funkRauschen(FUNK_RAHMEN + 0.3); stelle(ende, FUNK_RAHMEN * 1000); }
      else ende();
      return;
    }
    if(funk && i === 0 && !me.vorRauschen){                         // erst rauschen, dann der erste Satz
      me.vorRauschen = true; i = -1; funkRauschen(FUNK_RAHMEN + 0.3);
      stelle(weiter, FUNK_RAHMEN * 1000); return;
    }
    const s = saetze[i];
    // Auch ohne geladene Stimmenliste sprechen (Standardstimme des Browsers): die Liste kommt oft erst spaeter, und dann
    // lief der erste Text nur als Untertitel – gesprochen wurde erst beim zweiten Mal (Live-Befund am Lagerfeuer)
    if(synth){
      untertitel('');
      // Gesprochen "Joschi" (Live-Wunsch 16.10.: klingt in der deutschen Sprachausgabe richtiger) – geschrieben bleibt NAME
      // Ein Satzobjekt je Versuch (Wache unten): ein verworfener Versuch darf mit seinem onerror nichts mehr ausloesen.
      let aktU = null;
      const neuU = () => {
        const u = new SpeechSynthesisUtterance(s.replace(/Joshi/g, 'Joschi')), st = stimmeFuer(rolle);
        u.lang = 'de-DE'; if(st) u.voice = st;
        u.rate = 0.95;                              // fuer Kinderohren etwas langsamer
        u.pitch = rolle === 'radio' && !(st && STIMME_M.test(st.name)) ? 0.8 : 1.05;
        // Tiere am Festtisch (waldinsel.js): tief (Elch, Eule), normal (Hase, Reh), hoch und etwas schneller (Kleine, Voegel)
        if(rolle === 'tierM') u.pitch = st && STIMME_M.test(st.name) ? 0.85 : 0.7;
        if(rolle === 'tierW') u.pitch = 1.2;
        if(rolle === 'tierK'){ u.pitch = 1.7; u.rate = 1.05; }
        if(rolle === 'joshi') u.pitch = 1.45;                          // Joshi selbst (fragt etwas): helle Kinderstimme
        u.onend = u.onerror = () => { if(aktU === u && sprichtGerade === me){ me.satzLaeuft = false; weiter(); } };
        u.onstart = () => { if(aktU === u) u.lief = true; };
        return u;
      };
      // Faellt der Satz in eine Pause (z. B. ein Funkruf), wartet er, bis sie vorbei ist – nicht sprechen und sofort
      // anhalten (genau dabei haengt Chrome). Sonst vorher immer resume(): ein haengender Zustand ueberlebt so nie.
      const los = () => {
        // nur in der echten Pause warten – im Inventar spricht die Erklaerung sofort (Live-Befund 16.10.: nach A kam lange
        // nichts, weil der Satz auf das Ende der "Pause" Inventar wartete)
        // (Spielsaetze warten auch im Inventar – nur die Erklaerungen selbst sprechen dort)
        if(sprichtGerade !== me) return;
        if(hilfeOffen() && rolle !== 'inventar'){ stelle(los, 200); return; }
        // Live-Befund 19.10.2026: hier stand heute zuerst ein cancel() vor JEDEM Satz (gegen den Stau eines fremden Tabs) –
        // zu grob, seitdem gab es "Probleme, die es vorher nie gab" (Schnitzen, Aussteigen). Jetzt wird nur freigeraeumt, wenn
        // ein Satz nachweislich nicht anfaengt: kein onstart nach START_WARTE ms -> verwerfen, freiraeumen, neu (einmal).
        synth.resume(); story.stimmePausiert = false;
        const START_WARTE = 1500;
        const versuch = (n) => {
          const u = aktU = neuU(); synth.speak(u); me.satzLaeuft = true;
          setTimeout(() => {
            if(aktU !== u || u.lief || sprichtGerade !== me || me.angehalten) return;
            aktU = null; synth.cancel(); synth.resume();      // zuerst aktU weg: das onerror des Verworfenen geht ins Leere
            if(n < 2) versuch(n + 1);
            else { me.satzLaeuft = false; stelle(weiter, satzDauer(s)); }   // spricht gar nicht: weiter wie ohne Stimme
          }, START_WARTE);
        };
        versuch(1);
        stelle(() => { if(sprichtGerade === me) weiter(); }, (s.length / 14 * 1000 + 1500) * 2.5);
      };
      los();
    } else stelle(weiter, satzDauer(s));                     // ohne Sprachausgabe: nur die Pause
  }
  weiter();
}
story.sprich = sprich;
story.stimmeFrei = () => !sprichtGerade && !gehalten && !sprichWarte.length;   // gerade keine Ansage (notizbuch.js wartet darauf)
// Laufende Inventar-Erklaerung abbrechen (Umwaehlen, Notizbuch, Schliessen) – ohne fertig(); Spielsaetze nie
story.stimmeStopp = function(){
  const me = sprichtGerade; if(!me || me.rolle !== 'inventar') return;
  sprichtGerade = null; me.stopp(); untertitel('');
  if(window.speechSynthesis) window.speechSynthesis.cancel();
};
// Live-Befund 19.10.2026 (in "Reise nach Japan" kein Ton, bis der Browser neu gestartet war): die Sprachausgabe ist in
// Chrome EINE Warteschlange fuer den ganzen Browser. Steht dieser Tab mitten im Satz in der Pause (synth.pause, siehe
// pauseWechsel), bleibt jede Stimme in jedem anderen Tab stumm (nachgestellt, C:/tmp/jfg/test/tts_tabs2.js). Darum: wird
// der Tab verlassen oder versteckt, wird der angehaltene Satz verworfen – er faellt danach als "fertig" weiter (onerror),
// und der naechste wartet wie gewohnt, bis die Pause vorbei ist.
function stimmeFreigeben(){
  const synth = window.speechSynthesis; if(!synth) return;
  if(story.stimmePausiert || synth.paused){ synth.cancel(); synth.resume(); story.stimmePausiert = false; }
}
addEventListener('pagehide', () => { if(window.speechSynthesis) window.speechSynthesis.cancel(); });
document.addEventListener('visibilitychange', () => { if(document.hidden) stimmeFreigeben(); });
// Stimmen frueh anstossen (Chrome/Edge laden sie verzoegert)
if(window.speechSynthesis){ window.speechSynthesis.getVoices(); window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices()); }

// ---- Startbildschirm -------------------------------------------------------------------------
// Live-Wunsch 16.10.: schon beim Laden zu sehen (statt des blauen Engine-HUDs) – Titel und Untertitel stehen fest in
// index.html (#ladebild, von tools/build_engine.ps1 eingesetzt). Ist das Spiel geladen (hier), wird der Hintergrund
// durchsichtig (man sieht die Insel) und der Knopf erscheint. Joshi ist erst zu sehen, wenn es wirklich losgeht.
// A / Enter / Leertaste / Klick. Die Geste schaltet Ton und Stimme frei.
function startbildschirm(weiter){
  let el = document.getElementById('ladebild');
  if(!el){                                            // Sicherheitsnetz: index.html ohne Ladebild
    el = document.createElement('div'); el.id = 'ladebild';
    el.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:system-ui,sans-serif;text-align:center;user-select:none;';
    el.innerHTML = '<div style="font-size:clamp(34px,7vw,64px);font-weight:800;letter-spacing:1px;text-shadow:0 0 18px #6af">🌙 Das Geheimland</div>'
      + '<div style="font-size:clamp(16px,2.6vw,22px);margin-top:10px;opacity:.85">Ein Detektiv-Abenteuer</div><div id="ladeknopf"></div>';
    document.body.appendChild(el);
  }
  el.style.background = 'radial-gradient(ellipse at center,rgba(20,30,70,.55),rgba(0,0,10,.85))';
  const platz = document.getElementById('ladeknopf') || el;
  // Joshi erst beim Start zeigen
  if(eva) eva.group.visible = false;
  let los = false, bereit = false, bilder = 0;
  // Der Knopf kommt erst, wenn das Spiel wirklich bereit ist (Live-Wunsch 16.10.: vorher reagierte ein frueher Druck oft
  // nicht): keine Modelle mehr im Dekodieren, Figur und Fuchs da, Ausruestung vorgeladen, ein paar Bilder gezeichnet
  // (damit die Shader fertig sind und der erste Schritt nicht ruckelt). Spaetestens nach START_MAX s kommt er trotzdem.
  const START_BILDER = 30, START_MAX = 25, t0 = performance.now();
  if(story.ausruestungVorladen) story.ausruestungVorladen();
  function knopfZeigen(){
    bereit = true;
    platz.style.height = '';
    platz.innerHTML = '<button style="margin-top:38px;min-width:220px;height:64px;border-radius:16px;border:3px solid #ffd23f;'
      + 'background:#ffd23f;color:#1a1a1a;font:800 26px system-ui;cursor:pointer;transform:scale(1.05)">▶ Los geht\'s</button>';
    platz.querySelector('button').addEventListener('pointerdown', (e) => { e.stopPropagation(); start(); });
  }
  (function warte(){
    if(bereit) return;
    bilder++;
    const fertig = story.laedt === 0 && figur.obj && fuchs.obj && bilder >= START_BILDER;
    if(fertig || performance.now() - t0 > START_MAX * 1000){ knopfZeigen(); return; }
    requestAnimationFrame(warte);
  })();
  function start(test){
    if(los || !bereit) return; los = true;
    // Ton freischalten: Knopf und Taste fangen das Ereignis ab (stopPropagation), die Engine bekam es nie (wie in Trip to Japan)
    if(typeof armAudio === 'function'){ armAudio(); if(typeof audioArmed !== 'undefined') audioArmed = true; }
    el.remove();
    if(eva) eva.group.visible = true;
    removeEventListener('keydown', taste, true);
    if(test){ testStarten(test); return; }                 // Testzugang: eigener Einstieg (Ton und Stimme schaltet er selbst frei)
    // Das A, das gestartet hat, ist noch gedrueckt: nicht gleich als Sprung zaehlen (erst nach dem Loslassen)
    tasten.prevA = true; tasten.a = false;
    story.ton = true; story.gestartet = true;
    if(!soundOn) story.tonAn();
    funkLaden();                                      // Funk-Ton gleich dekodieren – sonst fehlte beim ersten Ruf das Rauschen
    gitarreLaden();                                   // ebenso die Gitarre (sonst blieb das erste Spielen stumm)
    // Sprachausgabe mit der Nutzergeste freischalten: ein stummer, leerer Satz – danach spricht der Browser zuverlaessig
    // (vorher cancel: ein anderer Tab kann sie angehalten haben, siehe stimmeFreigeben)
    if(window.speechSynthesis){ window.speechSynthesis.cancel(); window.speechSynthesis.resume(); const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); }
    weiter();
  }
  // ---- Testzugang (Live-Wunsch 21.10.2026, wie in Trip to Japan): X 3 s halten blendet unter "Los geht's" eine Leiste ein.
  // Jeder Zugang startet mitten in einer Etappe – mit allem freigeschaltet, was davor im Spiel passiert waere (TEST_ZUGANG).
  // Waehlen: links/rechts (Pfeile, Stick, D-Pad) oder Maus; A / Enter startet den gewaehlten; B / Esc blendet sie wieder aus.
  let testAn = false, testWahl = -1, xSeit = 0, xTaste = false;
  function testZeigen(){
    let leiste = el.querySelector('#testleiste');
    if(!testAn){ if(leiste) leiste.remove(); testWahl = -1; return; }
    if(!leiste){ leiste = document.createElement('div'); leiste.id = 'testleiste';
      leiste.style.cssText = 'margin-top:26px;display:flex;flex-direction:column;align-items:center;gap:10px';
      leiste.innerHTML = '<div style="font-size:16px;opacity:.8">Testzugang</div><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:94vw">'
        + TEST_ZUGANG.map((z, i) => '<button data-t="' + i + '" style="height:42px;padding:0 14px;border-radius:10px;border:2px solid rgba(255,255,255,.45);'
          + 'background:rgba(255,255,255,.1);color:#fff;font:600 16px system-ui;cursor:pointer">' + z.t + '</button>').join('') + '</div>'
        + '<div style="font-size:13px;opacity:.7;max-width:760px">← → wählen · A / Enter starten · B / Esc zurück · ' + TEST_ZUGANG.map(z => z.t + ': ' + z.info).join(' · ') + '</div>';
      platz.appendChild(leiste);
      leiste.querySelectorAll('button').forEach(b => { const i = +b.dataset.t;
        b.addEventListener('pointerenter', () => { testWahl = i; testMalen(); });
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); testWahl = i; start(TEST_ZUGANG[i]); }); }); }
    testMalen();
  }
  function testMalen(){
    const knopf = platz.querySelector('button:not([data-t])');
    if(knopf) knopf.style.opacity = testWahl >= 0 ? '0.55' : '1';
    el.querySelectorAll('#testleiste button').forEach(b => { const an = +b.dataset.t === testWahl;
      b.style.background = an ? '#ffd23f' : 'rgba(255,255,255,.1)'; b.style.color = an ? '#1a1a1a' : '#fff'; b.style.borderColor = an ? '#ffd23f' : 'rgba(255,255,255,.45)'; });
  }
  function testSchritt(d){ if(!testAn) return; const n = TEST_ZUGANG.length; testWahl = testWahl < 0 ? (d > 0 ? 0 : n - 1) : (testWahl + d + n) % n; testMalen(); }
  function xPruefen(gedrueckt){
    if(!gedrueckt){ xSeit = 0; return; }
    if(!xSeit) xSeit = performance.now();
    if(bereit && !testAn && performance.now() - xSeit > 3000){ testAn = true; testZeigen(); }
  }
  (function xWache(){ if(los) return; let xPad = false;
    for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])) if(gp && gp.buttons[2] && gp.buttons[2].pressed) xPad = true;
    xPruefen(xTaste || xPad); requestAnimationFrame(xWache); })();
  function taste(e){
    if(e.code === 'KeyX'){ e.preventDefault(); e.stopPropagation(); xTaste = true; return; }
    if(testAn && (e.code === 'ArrowRight' || e.code === 'ArrowLeft')){ e.preventDefault(); e.stopPropagation(); testSchritt(e.code === 'ArrowRight' ? 1 : -1); return; }
    if(testAn && (e.code === 'Escape' || e.code === 'KeyB')){ e.preventDefault(); e.stopPropagation(); testAn = false; testZeigen(); return; }
    if(e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter'){ e.preventDefault(); e.stopPropagation(); start(testWahl >= 0 ? TEST_ZUGANG[testWahl] : null); }
  }
  addEventListener('keydown', taste, true);
  addEventListener('keyup', (e) => { if(e.code === 'KeyX') xTaste = false; }, true);
  // A an JEDEM Controller (vorher nur am ersten in der Liste – war das ein anderer als der der Engine, reagierte der erste
  // Druck nicht, und beim zweiten sprang Joshi). Erst nach dem Loslassen zaehlen.
  const prevA = {}, prevTest = {};
  // Der Druck, der den Controller "aufweckt", kommt als gamepadconnected – auch der zaehlt (sofern das Spiel bereit ist)
  addEventListener('gamepadconnected', (e) => { const gp = e.gamepad; if(!los && bereit && gp && gp.buttons[0] && gp.buttons[0].pressed) start(); });
  (function pad(){
    if(los) return;
    for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])){
      if(!gp) continue;
      const a = !!(gp.buttons[0] && gp.buttons[0].pressed);
      // Chrome meldet einen Controller oft erst mit dem ersten Tastendruck (Live-Befund 16.10.: man musste immer 2x A
      // druecken, egal wie lange man wartete) – dann ist A beim ersten Sehen schon unten und zaehlt sofort
      if(a && prevA[gp.index] !== true && bereit){ start(testWahl >= 0 ? TEST_ZUGANG[testWahl] : null); return; }
      prevA[gp.index] = a;
      // Testleiste: links/rechts waehlen (Stick, D-Pad), B schliesst sie
      const r = (gp.axes[0] || 0) > 0.5 || !!(gp.buttons[15] && gp.buttons[15].pressed), l = (gp.axes[0] || 0) < -0.5 || !!(gp.buttons[14] && gp.buttons[14].pressed);
      const bb = !!(gp.buttons[1] && gp.buttons[1].pressed), alt = prevTest[gp.index] || {};
      if(r && !alt.r) testSchritt(1); if(l && !alt.l) testSchritt(-1); if(bb && !alt.b && testAn){ testAn = false; testZeigen(); }
      prevTest[gp.index] = { r, l, b: bb };
    }
    requestAnimationFrame(pad);
  })();
}
// ---- Testzugaenge: was in der Etappe vorher geschehen waere, wird hier freigeschaltet -------------------------------
// stufe je Etappe (siehe die Dateien): E1 'detektiv' = Ausruestung im Rucksack, alles entdeckt und angesehen, die Detektiv-
// Phase laeuft (vier Kreise frei); E1 'segeln' = dazu alle vier Bilder im Notizbuch, der Funkspruch angenommen, Joshi im
// Boot am Steg, das Ziel auf dem Radar. E2 = Waldinsel nach dem Globus (Rucksack + die vier Seiten); 'spuren' = die Tiere
// haben erzaehlt, beide Ringe offen; 'weg' = Foto und Lupe gemacht, beide Gespraeche vorbei, der Weg in den Wald frei.
const TEST_ZUGANG = [
  { t: 'E1 Detektiv', info: 'Ausrüstung, alles entdeckt, die vier Kreise', etappe: 1, stufe: 'detektiv' },
  { t: 'E1 Segeln', info: 'alle Bilder, Funk angenommen, im Boot', etappe: 1, stufe: 'segeln' },
  { t: 'E2', info: 'Waldinsel, Ankunft', etappe: 2, stufe: 'start' },
  { t: 'E2 Spuren', info: 'Tiere gehört, Foto- und Lupenring', etappe: 2, stufe: 'spuren' },
  { t: 'E2 Waldweg', info: 'Foto und Lupe fertig, Weg frei', etappe: 2, stufe: 'weg' },
];
story.testZugang = TEST_ZUGANG;
// E1: alles vor der Detektiv-Phase (Rucksack, alle Objekte draussen und in der Huette entdeckt und benutzt)
function testE1Basis(){
  const A = story.ausruestung; for(const n of ['notizbuch', 'lupe', 'kompass', 'messer', 'stift', 'kamera']) A[n] = true; A.komplett = true;
  hinweisStand.aussenGeschaut = hinweisStand.innenGeschaut = true; hinweisStand.xSatz = 2;
  for(const o of interListe) if(o.welt === 1){ o.entdeckt = true; o.frei = true; o.benutzt = Math.max(1, o.benutzt); if(o.einmal) o.erledigt = true; }
  // die Ausruestung liegt nicht mehr auf Tisch und Regal (der Raum wird erst beim Betreten gebaut: dann leer – ausruestung.js)
  if(story.innen) story.innen.warDrin = true;
}
// E1: Funkspruch angenommen – das Funkgeraet rauscht nur noch, das Boot ist frei, das Ziel auf dem Radar
function testFunkAngenommen(){
  radio.fall1 = 'angenommen'; radio.an = false;
  const o = interListe.find(i => i.obj === radio.obj); if(o){ o.entdeckt = true; o.aktion = null; o.danach = () => funkRauschen(3); o.benutzt = Math.max(1, o.benutzt); }
  story.abenteuerLos = true; if(story.fall1Angenommen) story.fall1Angenommen();
}
function testStarten(z){
  // wie start(): Ton und Stimme freischalten, Joshi zeigen
  const el = document.getElementById('ladebild'); if(el) el.remove();
  if(typeof armAudio === 'function'){ armAudio(); if(typeof audioArmed !== 'undefined') audioArmed = true; }
  if(eva) eva.group.visible = true;
  tasten.prevA = true; tasten.a = false;
  story.ton = true; story.gestartet = true; story.test = z;
  if(!soundOn) story.tonAn();
  funkLaden(); gitarreLaden();
  if(window.speechSynthesis){ window.speechSynthesis.cancel(); window.speechSynthesis.resume(); const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); }
  if(z.etappe === 1){
    testE1Basis();
    const e1 = story.testE1 ? story.testE1(z.stufe === 'segeln' ? 'fertig' : 'detektiv') : Promise.resolve();
    e1.then(() => { if(z.stufe !== 'segeln') return; testFunkAngenommen(); if(story.imBootStarten) story.imBootStarten(); });
    return;
  }
  // E2 und spaeter: Etappe 1 komplett (Rucksack, alle Bilder) – dann wie nach dem Globus direkt in die Waldinsel
  testE1Basis();
  (story.testE1 ? story.testE1('fertig') : Promise.resolve()).then(() => {
    testFunkAngenommen();
    if(story.etappe === 1){ if(story.reise) story.reise.push(1); if(story.e2Wechsel) story.e2Wechsel(); }   // nach einem Neuladen schon in E2
    if(story.testE2) story.testE2(z.stufe);
  });
}
// Laufen, springen, knien, umschauen: erst nach dem Start – und nicht, waehrend etwas in den Rucksack gesteckt wird
// (Live-Befund 16.10.: man konnte waehrend der Einpack-Animation weglaufen)
function steuerbar(){ return story.gestartet && !(story.szeneLaeuft && story.szeneLaeuft()); }

// ---- Etappe 1: Start am Lagerfeuer, Kurbel-Funkgeraet daneben --------------------------------
// Die Insel selbst (Huette, Palmen, Feuer, Moewen) baut insel.js. Hier: Funkgeraet, Startplatz, Durchsage.
// Noch fehlen: Kinderzimmer + Zaubertuer (davor), die Kamera und die Einsatzorte (danach).
const radio = { obj: null, t: 0, an: false };
function baueRadio(){
  const g = new THREE.Group();
  const kiste = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.45), new THREE.MeshLambertMaterial({ color: 0x7a5230 }));
  kiste.position.y = 0.225; g.add(kiste);
  const r = new THREE.Group(); r.position.y = 0.45; g.add(r);
  const koerper = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.16), new THREE.MeshLambertMaterial({ color: 0xd2452f }));
  koerper.position.y = 0.13; r.add(koerper);
  const lautspr = new THREE.Mesh(new THREE.CircleGeometry(0.075, 16), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  lautspr.position.set(-0.09, 0.13, 0.081); r.add(lautspr);
  const skala = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xfff0a0 }));
  skala.position.set(0.11, 0.16, 0.081); r.add(skala);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.45, 4), new THREE.MeshLambertMaterial({ color: 0xbbbbbb }));
  ant.position.set(0.16, 0.48, 0); ant.rotation.z = -0.35; r.add(ant);
  const kurbel = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.02), new THREE.MeshLambertMaterial({ color: 0x333333 }));
  kurbel.position.set(0.225, 0.1, 0); r.add(kurbel);
  const lampe = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: 0x40ff60 }));
  lampe.position.set(0.11, 0.07, 0.085); r.add(lampe);
  ant.userData.keinKoerper = true;                                   // die 6 mm duenne Antenne sperrt nicht
  g.userData.geraet = r; g.userData.lampe = lampe;
  return g;
}
// (Typ 'funkgeraet' wird in STORY_HOOK angemeldet – objekte.js laedt erst nach story.js)
const DURCHSAGE = [
  '*knack* ... *rausch* ...',
  'Achtung, ' + NAME + '! Achtung!',
  'Im Geheimland wurde Chaos angerichtet!',
  'Schnapp dir deine Kamera, folge den Hinweisen und löse das Rätsel!',
];
const NACH_DURCHSAGE = [
  'Das kam über Funk! Das Funkgerät steht am Lagerfeuer.',
  'Dein Fuchs wartet schon am Strand auf dich.',
];
// Kurzes Funkrauschen: ein Stueck aus "Searching the radio noise" (freesound_community, Pixabay – funk_snd.js), jedes
// Mal von einer anderen Stelle, weich ein- und ausgeblendet; das Geraet wackelt und blinkt dabei wie bei der Durchsage.
// Ist der Ton noch nicht geladen, kommt ersatzweise selbst erzeugtes Rauschen. dauer in s.
const FUNK_VOL = 0.4, FUNK_AUS = 1.0;          // Lautstaerke, Dauer des Ausblendens (s)
let funkBuf = null, funkLaedt = false, rauschBuf = null;
function funkLaden(){
  if(funkBuf || funkLaedt || !window.FUNK_SND || !audioCtx) return;
  funkLaedt = true; decodeSound(window.FUNK_SND).then(b => { funkBuf = b; }).catch(e => { funkLaedt = false; console.warn('Funk-Ton', e); });
}
function funkRauschen(dauer){
  radio.an = true; story.spaeter(dauer, () => { if(radio.fall1 !== 'ruft') radio.an = false; });
  if(!soundOn || !audioCtx || audioCtx.state !== 'running') return;
  funkLaden();
  const jetzt = audioCtx.currentTime, g = audioCtx.createGain();
  // Ausblenden hoechstens ein Viertel der Dauer (Live-Befund: beim 1-s-Rauschen vor dem Funkspruch begann es nach 0,3 s
  // schon wieder leiser zu werden – es klang abgeschnitten)
  const aus = Math.min(FUNK_AUS, dauer * 0.25);
  g.gain.setValueAtTime(0, jetzt); g.gain.linearRampToValueAtTime(FUNK_VOL, jetzt + 0.05);
  g.gain.setValueAtTime(FUNK_VOL, jetzt + dauer - aus); g.gain.linearRampToValueAtTime(0, jetzt + dauer);   // sanft aus
  g.connect(audioCtx.destination);
  const q = audioCtx.createBufferSource();
  if(funkBuf){
    q.buffer = funkBuf; q.connect(g);
    const ab = Math.random() * Math.max(0, funkBuf.duration - dauer);
    q.start(jetzt, ab, dauer);
    return;
  }
  // Ersatz: gefiltertes Rauschen mit Knistern
  const sr = audioCtx.sampleRate, n = Math.floor(sr * dauer);
  if(!rauschBuf || rauschBuf.length !== n){
    rauschBuf = audioCtx.createBuffer(1, n, sr); const d = rauschBuf.getChannelData(0); let b = 0;
    for(let i = 0; i < n; i++){ b = 0.6 * b + 0.4 * (Math.random() * 2 - 1); d[i] = (b + (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 3 : 0)) * 0.5; }
  }
  q.buffer = rauschBuf;
  const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
  q.connect(bp).connect(g); q.start(jetzt);
}story.funkRauschen = funkRauschen;
// ausruestung.js: Ruft/spricht der Funk gerade? (dann erscheint das Funkgeraet unten rechts, wie der Rucksack)
// Ruft oder spricht ein Funkspruch (rolle 'radio' – nicht die Erklaerung des Geraets und nicht das kurze Rauschen bei Y)
story.funkAktiv = () => radio.fall1 === 'ruft' || !!(sprichtGerade && sprichtGerade.rolle === 'radio');
story.funkWackel = () => radio.t;
story.baueFunkgeraet = () => baueRadio();
function updateRadio(dt){
  if(!radio.obj) return;
  radio.t += dt;
  const r = radio.obj.userData.geraet;
  r.rotation.z = radio.an ? Math.sin(radio.t * 30) * 0.03 : 0;
  r.position.y = 0.45 + (radio.an ? Math.abs(Math.sin(radio.t * 22)) * 0.01 : 0);
  radio.obj.userData.lampe.visible = !radio.an || Math.sin(radio.t * 10) > 0;
}
function startSzene(){
  if(story.etappe === 2 && story.e2StartSzene){ story.e2StartSzene(); return; }   // Waldinsel: im Boot am Steg (waldinsel.js)
  const I = story.insel, H = I.huette, F = I.feuer;
  story.baueInsel();
  // Funkgeraet auf einer Kiste rechts neben dem Feuer, Lautsprecher zum Startplatz
  // Grenze: Kiste und Geraet in ihrer echten Form (objekte.js); steht dort schon etwas, rueckt es daneben
  radio.obj = story.setze('funkgeraet', 1, { x: F.x + 1.7, z: F.z - 0.6, dreh: 0.5 }).obj;
  interaktion(radio.obj, { name: 'Funkgerät', x: radio.obj.position.x, z: radio.obj.position.z, r: 0.45, yHoehe: 1.25,
    text: ['Mit dem Funkgerät können dich Andere erreichen, wenn sie deine Hilfe brauchen.'], rolle: 'funkRahmen',   // 1 s Rauschen davor und danach
    danach: () => funkRauschen(3) });         // 3 s, dann sanft ausgeblendet (Live-Wunsch)
  // Figur zwischen Feuer und Strand, Blick zur Huette (-z: Engine-yaw = 0). So hat die Kamera hinter
  // ihr Feuer, Palmen und Huette im Bild (aus der Huette heraus hing sie hinter der Rueckwand).
  if(eva){
    const { x, z } = story.freierPlatz(F.x - 0.6, F.z + 3.2, 'joshi');
    eva.group.position.set(x, evaFootY(x, z), z);
    eva.yaw = 0; eva.group.rotation.y = eva.yaw;
  }
  // Fuchs (Live-Wunsch 16.10.): zwischen Huette, linker Palme und Feuer – vor Joshi im Bild, nicht hinter ihm am Strand.
  // Er sitzt und schaut zu Joshi; ab dem Start begleitet er ihn (auch in die Huette – sonst fand der Suchblick dort
  // nichts, weil der Fuchs draussen wartete).
  fuchsAbsetzen({ x: F.x - 2.2, z: F.z - 2.3, blick: Math.atan2((F.x - 0.6) - (F.x - 2.2), (F.z + 3.2) - (F.z - 2.3)), modus: 'streifen', sitzt: true, warte: 3 });
}
function durchsage(){
  radio.an = true;
  sprich(DURCHSAGE, () => { radio.an = false; sprich(NACH_DURCHSAGE); }, 'radio');
}
// ---- Funkspruch fuer den ersten Fall (Live-Wunsch 16.10.: kommt, sobald die Ausruestung komplett im Rucksack ist) -----
// Die Funkstimme (maennlich, Rolle 'radio') ruft: erst FALL1_RUF, dann alle FALL1_WIEDER s FALL1_NOCHMAL – das Geraet am
// Feuer rauscht, wackelt und blinkt dabei –, bis Joshi am Funkgeraet Y drueckt. Dann FALL1_FUNK (zum Testen nur ein Satz;
// die Erklaerung des Problems kommt noch) und das Segelboot ist frei (abenteuerLos; Ziel und Radar: segeln.js).
const FALL1_RUF = ['Hallo ' + NAME + ', bist du da?'];
const FALL1_NOCHMAL = [NAME + ', bitte kommen.'];
const FALL1_FUNK = ['Hallo ' + NAME + "... Bitte hilf' uns. Wir haben ein großes Problem.", 'Bitte steig schnell in dein Segelboot und komme zu uns. Ich markiere unseren Standort auf deinem Radar.'];   // Live-Wunsch 16.10.
const FALL1_WIEDER = 15;
// Wann darf der Funkspruch kommen? (Live-Wunsch 16.10.) Erst wenn draussen UND in der Huette abgesucht (X) und an jedem
// Objekt der Etappe einmal Y gedrueckt wurde – Lagerfeuer, Huette, Funkgeraet, Regal, Tisch. Geprueft nach dem Einpacken
// und nach jedem Y; der Ruf kommt dann mit einer kurzen Pause, damit er nicht in eine laufende Ansage faellt.
function fall1Bereit(){
  const H = hinweisStand;
  if(!H.aussenGeschaut || !H.innenGeschaut) return false;
  if(!(story.ausruestung && story.ausruestung.komplett)) return false;
  return interListe.every(o => o.welt !== story.etappe || (o.entdeckt && o.benutzt > 0));
}
// Live-Wunsch 16.10.: ist das geschafft, kommt noch NICHT der Funkspruch – erst die Detektiv-Phase (notizbuch.js): wieder
// draussen erklaert die Erzaehlerin die farbigen Markierungen. Der Funk kommt, wenn alle vier Markierungen erledigt sind.
story.fall1Bereit = fall1Bereit;
story.fall1Pruefen = function(){
  if(radio.fall1 || !fall1Bereit()) return;
  if(story.detektivStart){ story.detektivStart(); return; }        // notizbuch.js: Markierungen, danach der Funk
  spaeter(1.5, () => { if(!radio.fall1 && fall1Bereit()) story.fall1Funk(); });
};
story.fall1Funk = function(){
  if(radio.fall1) return;
  radio.fall1 = 'ruft';
  let erster = true;
  const ruf = () => {
    if(radio.fall1 !== 'ruft') return;
    radio.an = true;                                             // Rauschen davor und danach macht sprich (rolle 'radio')
    sprich(erster ? FALL1_RUF : FALL1_NOCHMAL, () => { if(radio.fall1 === 'ruft') radio.an = false; }, 'radio'); erster = false;
    spaeter(FALL1_WIEDER, ruf);
  };
  spaeter(1.5, ruf);
  const o = interListe.find(i => i.obj === radio.obj);
  if(o){ o.entdeckt = true; o.erledigt = false; o.danach = null; o.aktion = (oo) => {
    if(radio.fall1 !== 'ruft') return funkRauschen(3);
    radio.fall1 = 'angenommen'; radio.an = true; oo.spricht = true;
    sprich(FALL1_FUNK, () => { radio.an = false; oo.spricht = false; oo.aktion = null; oo.danach = () => funkRauschen(3);
      story.abenteuerLos = true;                                   // jetzt darf er ins Boot (steg.js)
      if(story.fall1Angenommen) story.fall1Angenommen(); }, 'radio');
  }; }
};

// ---- Pause (D-Pad hoch / H, Live-Wunsch 16.10.) -------------------------------------------------------------------
// Das ueberladene Hilfe-Fenster der Engine braucht es nicht. Die Engine haelt aber alles an, solange #hint sichtbar ist
// (loop: "PAUSE ... renderer.render; return") – das bleibt der Schalter, nur unsichtbar. Statt des Fensters steht
// "PAUSE" im Stil des Y-Zeichens. Dazu: Ton ganz aus (Master-Gain, globus.js), die Stimme haelt an genau der Stelle an
// (speechSynthesis.pause/resume), die Story-Timer stehen (timerTick laeuft nicht), und alle eigenen Bildschleifen
// (Einstecken, Kompass, Gischt, Globus) fragen story.pause() ab.
// Zwei Arten (Live-Wunsch 16.10.): "hilfe" = D-Pad hoch / H -> PAUSE-Zeichen; "inventar" = D-Pad runter / N -> der Rucksack
// mit allen Dingen (ausruestung.js). Beide halten das Spiel, den Ton und die Stimme an und blenden Kompass, Radar und
// Schubbalken aus (body.pausiert). Beide schalten ueber dieselbe #hint-Klasse, damit auch die Engine-Physik steht; wer
// pausiert hat, beendet sie auch (H schliesst kein Inventar und umgekehrt).
const pause = { art: null };
function hilfeOffen(){ const h = document.getElementById('hint'); return !!(h && h.classList.contains('show')); }
story.pause = hilfeOffen;
story.pauseArt = () => pause.art;
function pauseSetzen(art){
  const h = document.getElementById('hint'); if(!h) return;
  pause.art = art;
  h.classList.toggle('show', !!art);
}
story.pauseSetzen = pauseSetzen;
let pauseEl = null, pauseWar = false;
function pauseAnzeige(an){
  if(!pauseEl){
    pauseEl = document.createElement('div');
    pauseEl.textContent = 'PAUSE';
    pauseEl.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:18px 46px;border-radius:999px;'
      + 'background:#f5c518;border:6px solid #fff;box-shadow:0 6px 0 rgba(0,0,0,.35);color:#1a1a1a;font:900 64px system-ui,sans-serif;'
      + 'letter-spacing:4px;pointer-events:none;z-index:60;display:none;';
    document.body.appendChild(pauseEl);
    // das Engine-Fenster selbst nie zeigen (es bleibt nur der Pause-Schalter); in der Pause keine Etappen-Anzeigen
    const st = document.createElement('style');
    st.textContent = '#hint.show { visibility: hidden !important; } body.pausiert [data-etappe-hud] { visibility: hidden !important; }';
    document.head.appendChild(st);
  }
  pauseEl.style.display = an ? 'block' : 'none';
}
function pauseWechsel(an){
  pauseAnzeige(an && pause.art !== 'inventar');
  document.body.classList.toggle('pausiert', an);                 // Kompass, Radar, Schubbalken aus (data-etappe-hud)
  // die Y-Zeichen ueber den Objekten auch (sie schimmerten durch die Inventar-Flaeche); danach setzt updateInteraktion sie neu
  if(an) for(const o of interListe) if(o.zeichen) o.zeichen.visible = false;
  if(an && story.stegZustand && story.stegZustand.zeichen) story.stegZustand.zeichen.visible = false;
  // Stimme anhalten – ABER nur, wenn wirklich gerade gesprochen wird. Live-Befund 16.10. ("die gesamte Sprachausgabe ist
  // gestoert"): Chrome haengt, wenn pause() OHNE laufenden Satz kommt (Pause/Inventar gleich zu Beginn) – jeder spaetere
  // Satz bleibt dann stumm, bis zufaellig wieder resume() kommt (nachgestellt in echtem Chrome, C:/tmp/jfg/test/tts_echt.js).
  // speechSynthesis.paused meldet das nicht zuverlaessig (es stand auf false). Darum: pause() nur bei laufendem Satz,
  // resume() danach immer – und sprich() ruft vor jedem neuen Satz resume() (siehe dort).
  const synth = window.speechSynthesis;
  if(synth){ if(an){ if(synth.speaking){ synth.pause(); story.stimmePausiert = true; } } else { synth.resume(); story.stimmePausiert = false; } }
  // Ton: in der Pause ganz aus, im Inventar bleibt das Hintergrundgeraeusch (Meer, Moewen) – Live-Wunsch 16.10.; danach
  // wieder an (ausser der Globus laeuft – der hat den Ton selbst ausgeblendet)
  if(story.master && audioCtx && (pause.art !== 'inventar' || !an)){ const g = story.master.gain, t = audioCtx.currentTime;
    if(an){ story.master.vorPause = g.value; g.cancelScheduledValues(t); g.setValueAtTime(0, t); }
    else { const ziel = story.globusAktiv && story.globusAktiv() ? 0 : (story.master.vorPause === undefined ? 1 : Math.max(story.master.vorPause, 1));
      g.cancelScheduledValues(t); g.setValueAtTime(0, t); g.linearRampToValueAtTime(ziel, t + 0.3); } }
  if(!an && fortsetzen()) return;                                 // gehaltener Satz geht weiter (s. halten)
  if(sprichtGerade && sprichtGerade.pause) sprichtGerade.pause(an);
}
story.pauseWechsel = pauseWechsel;

// ---- Hauptschleife ---------------------------------------------------------------------------
function hookLoop(){
  const loopOrig = loop;
  let tPrev = performance.now();
  loop = function(){
    const now = performance.now();
    const dt = Math.min(0.1, (now - tPrev) / 1000); tPrev = now;
    const p = hilfeOffen();
    if(p !== pauseWar){ pauseWar = p; pauseWechsel(p); }
    if(p) return loopOrig.apply(this, arguments);   // Pause
    timerTick(dt);
    if(story.updateObjekte) story.updateObjekte(dt);   // objekte.js: Grenzen nachfuehren, Schiffe schieben beiseite
    figurTasten();
    updateFigur(dt);
    figurWache(dt);
    updateStaub(dt);
    planeGroup.visible = !eva;                // X-Wing nur sichtbar, wenn man drin sitzt
    updateFuchs(dt);
    updateRadio(dt);
    if(story.updateE1) story.updateE1(dt);
    if(story.updateE2) story.updateE2(dt);         // waldinsel.js: Tiere, Lichterketten
    if(story.updateInnen) story.updateInnen(dt);   // huette_innen.js: Tuer -> Blende -> Innenraum
    if(story.updateSteg) story.updateSteg(dt);     // steg.js: Steg, Segelboot, einsteigen
    if(story.sternbilderUpdate) story.sternbilderUpdate();   // sternbilder.js
    updateInteraktion(dt);
    if(story.gestartet) funkLaden();               // Funk-Ton vorab dekodieren (nach der Startgeste)
    weltenSichtbar();
    // Startbildschirm: die Insel lebt dahinter, aber Joshi (und sein Schatten) ist erst zu sehen, wenn es losgeht – vor dem
    // Zeichnen der Engine verstecken (sein Schatten: hookStartSchatten, die Engine setzt ihn im eigenen Loop sichtbar)
    if(!story.gestartet && eva) eva.group.visible = false;
    return loopOrig.apply(this, arguments);
  };
}

// ---- HUD: ausgeblendet (Live-Wunsch 14.10.) ----------------------------------------------------
// Kein Radar, kein Gyroskop, keine linke Anzeige (Modell/Hoehe/Speed/Sprung/Symbole), kein
// Controller-Hinweis. Das grosse Bestaetigungssymbol (#big) bleibt, ist aber leer gefiltert.
// Ideen, falls doch ein HUD gebraucht wird: statt "Modell: Detektiv" + Astronauten-Symbol nur der
// Name (Joshi) und Joshis Gesicht als kleines Icon (aus dem Figur-Render ausschneiden) – sonst nichts.
const HUD_AUS = ['hud', 'radar', 'gyro', 'pad'];
function hookHudAus(){
  const st = document.createElement('style');
  st.textContent = HUD_AUS.map(id => '#' + id).join(',') + '{display:none!important}';
  document.head.appendChild(st);
}

// ---- Ton: immer an (Live-Wunsch 16.10.) ------------------------------------------------------------------------
// Die Engine schaltet mit N / D-Pad runter um und zeigt dabei ein grosses Lautsprecher-Symbol. Hier: einmal einschalten
// (mit der Startgeste, siehe startbildschirm), danach tut das Umschalten nichts mehr, und ein Symbol gibt es nicht.
function hookTon(){
  const tonOrig = toggleSound;
  story.tonAn = function(){ if(soundOn) return; tonOrig(); if(toggleEl) toggleEl.style.opacity = '0'; };
  // D-Pad runter / N (vorher Ton an/aus) = Inventar: pausiert und zeigt den Rucksack mit allen Dingen; nochmal = weiter
  toggleSound = function(){
    story.tonAn();
    if(!story.gestartet || !story.inventar || (story.globusAktiv && story.globusAktiv())) return;
    if(pause.art === 'inventar') story.inventarZu();
    else if(!pause.art && story.inventar(true)) pauseSetzen('inventar');
  };
  // Inventar zu (D-Pad runter, oder B im Inventar – ausruestung.js): auch ein offenes Notizbuch klappt mit zu
  story.inventarZu = function(){ if(pause.art !== 'inventar') return; pauseSetzen(null); story.inventar(false); };
  // D-Pad hoch / H (vorher das Hilfe-Fenster) = Pause mit PAUSE-Zeichen
  toggleHelp = function(){
    if(!story.gestartet) return;
    if(pause.art === 'hilfe') pauseSetzen(null);
    else if(!pause.art) pauseSetzen('hilfe');
  };
  pauseAnzeige(false);                                              // Style-Regeln gleich anlegen
  const symOrig = showToggle;
  showToggle = function(sym){ if(sym === '🔊' || sym === '🔇') return; return symOrig.apply(this, arguments); };   // Lautsprecher an / aus
}

window.STORY_HOOK = function(){
  if(typeof strandleben !== 'undefined'){ strandleben.an = true; strandleben.festPlatz = story.seeloewenPlatz || null; }   // Forellen im Flachwasser, Seeloewen am Strand (Engine)
  hookTon();
  story.typ('funkgeraet', { bau: baueRadio });
  hookHudAus();
  hookWelt();
  hookInteraktion();
  hookHinweis();
  hookNacht();
  hookFigur();
  hookSchwimmen();
  preloadFuchs();
  hookLoop();
};
window.STORY_START = function(){
  placeAtStart('XWing');           // -> findStart-Wrapper: am Oststrand
  fadeHold = 0; flashFade(1.0);    // den Hangar-Vorhang der Engine nicht abwarten
  evaExit();                       // die Figur steht neben dem X-Wing ...
  startSzene();                    // ... und wird in die Huette gestellt
  // Durchsage vorerst aus (Live-Wunsch 14.10.: Text erstmal weglassen) – Funkgeraet bleibt stehen
  // startbildschirm(() => spaeter(2.0, durchsage));
  // Waldinsel: nach dem Start steigen Joshi und der Fuchs aus dem Boot, dann die Erzaehlerin (waldinsel.js)
  startbildschirm(() => { if(story.etappe === 2){ if(story.stegAussteigen) spaeter(0.6, story.stegAussteigen); if(story.e2Los) story.e2Los(); } });
};
})();
