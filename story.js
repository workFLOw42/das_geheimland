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
// Steuerung zu Fuss: linker Stick (Pfeiltasten) gehen bis rennen · B springen (im Lauf: Sprungrolle)
// · A (Enter) hinknien / aufstehen · im Wasser: RT/LT (E/Q) tauchen.
(function(){
'use strict';

const story = window.STORY = { etappe: 1, gestartet: false, ton: false };

// Name der Spielfigur steht noch nicht fest – nur hier aendern.
const NAME = 'Detektiv';

// ---- Hilfen ----------------------------------------------------------------------------------
function glbBytes(daten){
  const bin = atob(daten.split(',')[1]), u = new Uint8Array(bin.length);
  for(let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u.buffer;
}
function ladeGlb(daten, name, fertig){
  if(!daten || !THREE.GLTFLoader) return;
  new THREE.GLTFLoader().parse(glbBytes(daten), '', fertig, (e) => console.warn(name + '-GLB Ladefehler:', e));
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
  updateShadow = function(){ if(eva){ planeShadow.visible = false; return; } return schattenOrig.apply(this, arguments); };
  updateOvalShadow = function(){ if(eva) return; return ovalOrig.apply(this, arguments); };
  _islandCache.clear(); _subBerthCache.clear(); _xwpCache.clear(); _parkCache.clear();

  // Der X-Wing parkt am Oststrand (Nase zum Wasser) – fuer spaeter, wenn geflogen wird.
  const findStartOrig = findStart;
  findStart = function(name){
    if(name === 'XWing' && story.etappe === 1) return { x: 62, y: ISLAND_Y, z: -8, yaw: -Math.PI / 2 };
    return findStartOrig(name);
  };
}

// ---- Nacht -----------------------------------------------------------------------------------
// Das Geheimland beginnt nachts: dunkelblauer Himmel, Sterne, gedimmtes Licht. SKY_DAY ist ein
// const-Objekt der Engine – die Farbe selbst darf man umsetzen, updateSpaceBlend mischt dann
// von dort ins All. Licht und Sterne werden nach dem Original-Aufruf nachgezogen.
// Sternhimmel: Sternenkuppel (3 x 780 Sterne) + Milchstrassen-Panorama der Engine (beide sonst nur im
// All) und ein Mond schraeg hinter der Huette. Alle drei ohne Nebel – der Erdnebel endet bei 3 km,
// die Kuppel liegt bei 1,2 Mio. m und waere sonst verschluckt. Das Mondlicht (sun) kommt aus seiner Richtung.
const NACHT_HIMMEL = 0x0b1633;
const NACHT_MW = 0.75;                           // Milchstrasse: deutlich, aber nicht grell (Engine im All: 1,6)
// Mond schraeg hinter der Huette (vom Startplatz am Feuer aus im Blick), nicht zu hoch – dann sieht ihn die Verfolgerkamera
const MOND = { az: Math.PI + 0.45, hoch: 0.2, r: 22000, dist: 900000 };   // Richtung (rad ab +z), Hoehenwinkel, Radius, Abstand
const mond = { obj: null, halo: null, laedt: false };
function nachtOhneNebel(obj){
  obj.traverse(o => { if(!o.material) return; for(const m of (Array.isArray(o.material) ? o.material : [o.material])){ m.fog = false; m.needsUpdate = true; } });
}
function baueMond(){
  if(mond.laedt || !window.MOON_GLB) return;
  mond.laedt = true;                             // nur EINMAL laden (der Callback kommt erst spaeter)
  preloadSphereGLB(window.MOON_GLB, MOND.r, (g) => {
    g.traverse(o => { if(!o.isMesh) return;
      const src = Array.isArray(o.material) ? o.material[0] : o.material;
      // selbstleuchtend: der Mond soll hell sein, egal wo das Licht der Szene steht
      o.material = new THREE.MeshBasicMaterial({ map: src && (src.map || src.emissiveMap), color: 0xfff6dc, fog: false });
      o.frustumCulled = false; o.renderOrder = -1; });
    scene.add(g);                                                   // global-ok: Himmel gehoert keiner Welt
    mond.obj = g;
    // weicher Lichthof um den Mond
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 10, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,245,210,.55)'); gr.addColorStop(0.35, 'rgba(200,215,255,.18)'); gr.addColorStop(1, 'rgba(200,215,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    mond.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), fog: false, depthWrite: false, transparent: true }));
    mond.halo.scale.setScalar(MOND.r * 3.2); mond.halo.renderOrder = -2;
    scene.add(mond.halo);                                           // global-ok: Himmel
  });
}
function hookNacht(){
  SKY_DAY.set(NACHT_HIMMEL);
  cloudMat.color.setHex(0x3a4766);                  // Wolken nachts dunkel-blaugrau statt weiss
  const orig = updateSpaceBlend;
  const _r = new THREE.Vector3();
  updateSpaceBlend = function(dt){
    const r = orig.apply(this, arguments);
    if(locale === 'earth'){
      const tag = spaceBlend;                    // 0 = am Boden, 1 = im All
      hemiLight.intensity = 0.45 + 0.1 * tag;    // Mondlicht: man soll noch alles gut erkennen
      sun.intensity = 0.35 + 0.5 * tag;
      if(starDome){ if(!starDome.userData.nacht){ nachtOhneNebel(starDome); starDome.userData.nacht = true; }
        starDome.visible = true; starDome.position.copy(camera.position); }
      if(starMat) starMat.opacity = Math.max(starMat.opacity, 1);
      // Panorama additiv: das Foto hat schwarzen Weltraum und deckte den dunkelblauen Nachthimmel ab –
      // addiert bleibt das Blau, und Band und Nebel leuchten darauf. Im All (tag -> 1) wieder wie die Engine.
      if(mwMat){ const add = tag < 0.5;
        if(mwMat.userData.add !== add){ mwMat.userData.add = add; mwMat.blending = add ? THREE.AdditiveBlending : THREE.NormalBlending; mwMat.transparent = add; mwMat.needsUpdate = true; } }
      if(mwDome){ if(!mwDome.userData.nacht){ nachtOhneNebel(mwDome); mwDome.userData.nacht = true; }
        mwDome.visible = true; mwDome.position.copy(camera.position);
        // schraeg ueber den Himmel gelegt, damit das Band von der Insel aus gut zu sehen ist
        mwDome.rotation.set(0.9, 0.4, 0.35);
        if(mwMat){ const s = Math.max(NACHT_MW, tag * MW_BRIGHT); mwMat.color.setRGB(s, s, s); } }
      baueMond();
      if(mond.obj){
        _r.set(Math.sin(MOND.az) * Math.cos(MOND.hoch), Math.sin(MOND.hoch), Math.cos(MOND.az) * Math.cos(MOND.hoch));
        mond.obj.position.copy(camera.position).addScaledVector(_r, MOND.dist);
        mond.halo.position.copy(camera.position).addScaledVector(_r, MOND.dist * 1.02);   // knapp hinter dem Mond
        mond.obj.visible = mond.halo.visible = true;
        sun.position.copy(_r).multiplyScalar(400);                  // Mondlicht kommt vom Mond
        sun.color.setHex(0xc8d6ff);
      }
    } else if(mond.obj){ mond.obj.visible = mond.halo.visible = false; sun.color.setHex(0xffffff); }
    return r;
  };
}

// ---- Spielfigur ------------------------------------------------------------------------------
// models/figur.glb: Joshi-Modell mit Mixamo-Rig, 60 fps, Clips (aus _mixamo/anim per merge_clips.py):
//   idle walk run jump swim fly hang kneel roll skate guitar drums look
// Blick im Modell +Z. Die Hueftbewegung bleibt nur senkrecht (Sprung, Knien, Rolle), waagerecht
// bewegt die Engine die Figur.
const FIGUR_H = 1.20;
const GITARRE_NACH = 12;      // s Stillstehen, dann holt er die Gitarre raus
const EINMAL_FIGUR = ['jump', 'roll', 'kneel'];
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
  const updateEvaOrig = updateEva;
  updateEva = function(dt, inp){
    if(!eva) return updateEvaOrig(dt, inp);
    if(sw.aktiv && steuerbar()){ schwimmUpdate(dt, inp); return; }
    const roh = -(inp.pitch || 0), a = Math.abs(roh), dreh = Math.abs(inp.yaw || 0);
    if(a > 0.05 || dreh > 0.05){ figur.steht = 0; if(figur.cur === 'guitar'){ gitarreMusik(false); figurAnim('idle', 0.2); } }
    if(figur.kniet && (a > 0.3 || dreh > 0.5) && steuerbar()) aufstehen();
    if(figur.aktion === 'roll'){
      // Sprungrolle: gleichmaessiger Schwung aus dem Lauf (die Hueftkurve des Clips stockt in der Mitte
      // und sah ruckelig aus). Gegen Ende: Stick gehalten -> nahtlos weiterlaufen, sonst ausbremsen.
      figur.rollStick = a;
      const t = figur.aktT, ende = figur.acts.roll.getClip().duration / ROLL_TEMPO;
      const k = klemme((t - ROLL_BREMS_AB * ende) / ((1 - ROLL_BREMS_AB) * ende), 0, 1);
      const v = figur.rollV * (a > 0.3 ? 1 : 1 - 0.8 * k * k * (3 - 2 * k));
      return updateEvaOrig(dt, { pitch: -klemme(v / EVA_SPEED, 0, 1), yaw: (inp.yaw || 0) * 0.3 });
    }
    if(!steuerbar() || figur.kniet || figur.aktion === 'jump'){ figur.ausschlag = 0; figur.tempo = 0; return updateEvaOrig(dt, {}); }
    figur.ausschlag = a;
    const f = a <= 0.5 ? a / 0.5 * GEH_MAX : GEH_MAX + (a - 0.5) / 0.5 * (1 - GEH_MAX);
    figur.tempo = f * EVA_SPEED;
    return updateEvaOrig(dt, Object.assign({}, inp, { pitch: -Math.sign(roh) * f }));
  };
  // B zu Fuss: springen – im Stand der normale Sprung, beim Gehen/Rennen die Sprungrolle
  evaActionB = function(){ springen(); };
  evaJump = function(){};          // der Engine-Huepfer passt nicht zur Figur
  cycleModel = function(){};       // Fahrzeuge waehlt die Geschichte
  // Grosses Astronauten-Symbol beim Aussteigen passt nicht zur Figur
  const showBigOrig = showBig;
  showBig = function(t){
    if(t && /\u{1F9D1}‍\u{1F680}/u.test(t)) t = '';
    return showBigOrig.call(this, t);
  };
  const mdlEl = document.getElementById('mdl');
  const hudOrig = updateHUD;
  updateHUD = function(){
    const r = hudOrig.apply(this, arguments);
    if(eva && mdlEl && mdlEl.textContent !== NAME) mdlEl.textContent = NAME;
    return r;
  };
}
const GEH_MAX = 0.3;          // Anteil von EVA_SPEED bei 50 % Stick (~1,8 m/s)
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
// A (Controller) / Enter (Tastatur): hinknien bzw. wieder aufstehen. Die Engine nutzt A zu Fuss
// nicht (nur als Schubbremse im Flieger), Leertaste waere Vollschub – deshalb Enter.
const tasten = { prevA: true, enter: false };
addEventListener('keydown', e => {
  if(e.defaultPrevented) return;                     // z. B. Enter auf dem Startbildschirm
  if((e.code === 'Enter' || e.code === 'NumpadEnter') && !e.repeat) tasten.enter = true;
});
function knieTaste(){
  let a = false;
  if(gamepadIndex !== null){ const gp = navigator.getGamepads()[gamepadIndex]; a = !!(gp && gp.buttons[0] && gp.buttons[0].pressed); }
  const neu = (a && !tasten.prevA) || tasten.enter;
  tasten.prevA = a; tasten.enter = false;
  if(!neu || !eva || eva.boat || eva.rover || sw.aktiv || figur.aktion || !steuerbar()) return;
  if(figur.kniet) aufstehen(); else hinknien();
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
function gitarreMusik(an){
  if(!an || !soundOn || !audioCtx || audioCtx.state !== 'running' || !window.GITARRE_SND){
    if(gitarre.quelle){ try { gitarre.quelle.stop(); } catch(e){} gitarre.quelle = null; }
    return;
  }
  if(gitarre.quelle) return;
  if(!gitarre.buf){
    if(!gitarre.laedt){ gitarre.laedt = true; decodeSound(window.GITARRE_SND).then(b => { gitarre.buf = b; }).catch(e => console.warn('Gitarre:', e)); }
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
  if(figur.cur !== 'guitar' || figur.ausschlag > 0.05 || figur.aktion || figur.kniet || sw.aktiv) gitarreMusik(false);
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
    const frei = figur.aktion === 'jump' ? SPRUNG_FREI : clip.duration / ROLL_TEMPO - 0.3;
    const dauer = clip.duration / figur.acts[figur.aktion].timeScale;
    const stick = figur.aktion === 'roll' ? figur.rollStick : figur.ausschlag;
    if(figur.aktT < frei || (figur.aktT < dauer - 0.1 && stick < 0.1)) return;
    figur.aktion = null;                          // naechster Clip blendet aus dem Endbild
  }
  if(figur.kniet) return;
  if(sw.aktiv){ figurAnim('swim', 0.3, 0.6 + figur.ausschlag * 0.6); figur.steht = 0; return; }
  const v = figur.tempo;
  if(figur.ausschlag > 0.5){ figurAnim('run', 0.2, klemme(v / 5.2, 0.8, 1.3)); figur.steht = 0; }
  else if(figur.ausschlag > 0.05){ figurAnim('walk', 0.25, klemme(v / 1.5, 0.6, 1.4)); figur.steht = 0; }
  else {
    figur.steht += dt;
    if(figur.steht > GITARRE_NACH && figur.acts.guitar){ figurAnim('guitar', 0.6, 1); gitarreMusik(true); return; }
    else figurAnim('idle', 0.3, 1);
  }
}
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
// Stick bewegt und dreht, RT taucht ab, LT taucht auf (Tastatur: E / Q). An Land steht sie wieder.
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
      d -= gp.buttons[7] ? gp.buttons[7].value : 0;    // RT = runter
      d += gp.buttons[6] ? gp.buttons[6].value : 0;    // LT = rauf
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
const FA = {
  stehen: 'Fox_Idle', gehen: 'Fox_Walk_InPlace', rennen: 'Fox_Run_InPlace',
  setzen: 'Fox_Sit1', sitzen: 'Fox_Sit2_Idle', sitzPause: 'Fox_Sit_Idle_Break', aufstehen: 'Fox_Sit3_StandUp',
  spielen: ['Fox_Attack_Paws', 'Fox_Attack_Tail'], huepfen: 'Fox_Jump_Pivot_InPlace',
};
const EINMAL = [FA.setzen, FA.aufstehen, FA.sitzPause, FA.huepfen, ...FA.spielen];
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
    const kp = kopf ? kopf.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 0, 1);
    fuchs.kopf = Math.atan2(kp.x - c.x, kp.z - c.z);
    const k = FUCHS_LANG / Math.max(sz.x, sz.z);
    obj.scale.multiplyScalar(k);
    obj.position.set(-c.x * k, -bb.min.y * k, -c.z * k);    // mittig, Pfoten auf y = 0
    const wrap = new THREE.Group(); wrap.add(obj);
    fuchs.obj = wrap; fuchs.mixer = mixer; fuchs.cur = FA.stehen;
    if(fuchs.wartetAuf) fuchsAbsetzen(fuchs.wartetAuf);
  });
}
function fuchsAnim(name, blend){
  if(fuchs.cur === name || !fuchs.acts[name]) return;
  const a = fuchs.acts[name];
  a.reset().play();
  if(fuchs.cur && fuchs.acts[fuchs.cur]) fuchs.acts[fuchs.cur].crossFadeTo(a, blend || 0.3, false);
  fuchs.cur = name;
}
// Laeuft ein Einmal-Clip noch?
function fuchsClipLaeuft(name){
  const a = fuchs.acts[name];
  return fuchs.cur === name && a && a.time < a.getClip().duration - 0.05;
}
// Wo darf er laufen? Gras, Sand und der Huetten-Innenraum – nicht ins Wasser (auch nicht ins Flache), nicht in Waende
function fuchsFrei(x, z){ return evaSolid(x, z) && watGrund(x, z) === null && !hitsBuilding(x, ISLAND_Y + 0.5, z, false); }
// Die Figur wechselt durch die Huettentuer (huette_innen.js): der Fuchs kommt mit – ausser er wartet noch am Strand
story.fuchsZu = function(ziel){
  if(!fuchs.obj || !fuchs.aktiv || fuchs.modus === 'warten' || !eva) return;
  const n = nebenFigur(-1.2, 0.8);
  fuchs.obj.position.set(n.x, evaFootY(n.x, n.z), n.z);
  fuchs.yaw = eva.yaw + Math.PI; fuchs.ziel = null; fuchs.warte = 1.5;
  if(fuchs.modus !== 'streifen'){ fuchs.modus = 'streifen'; fuchs.sitzt = false; }
};
// Fuchs bei (x, z) in die Welt setzen, Blick p.blick (Winkel ab +Z), p.modus (Standard: streifen)
function fuchsAbsetzen(p){
  if(!fuchs.obj){ fuchs.wartetAuf = p; return; }
  fuchs.wartetAuf = null;
  welt(story.etappe).add(fuchs.obj);
  fuchs.obj.position.set(p.x, evaFootY(p.x, p.z), p.z);
  fuchs.yaw = p.blick;
  fuchs.aktiv = true;
  fuchs.modus = p.modus || 'streifen'; fuchs.ziel = null; fuchs.warte = 2;
  if(fuchs.modus === 'warten'){ fuchs.acts[FA.sitzen] && (fuchs.cur = null, fuchsAnim(FA.sitzen, 0.01)); fuchs.sitzt = true; }
}
function fuchsRufen(){
  if(!fuchs.aktiv) return;
  fuchs.modus = 'kommen'; fuchs.ziel = null; fuchs.sitzt = false;
}
function fuchsLoslassen(){
  if(!fuchs.aktiv || fuchs.modus === 'streifen') return;
  fuchs.modus = 'streifen'; fuchs.ziel = null;
  fuchs.warte = fuchs.sitzt ? 0.6 : 0;
  if(fuchs.sitzt) fuchsAnim(FA.aufstehen, 0.2);
  fuchs.sitzt = false;
}
const STREIF_R = 9;            // m: so weit streift er um die Figur herum
const STREIF_MAX = 16;         // m: weiter weg -> er kommt zuegig hinterher
const WARTE_BIS = 5;           // m: so nah muss die Figur kommen, dann begleitet er sie
// Laeuft zum Punkt (zx, zz). tempo m/s. Rueckgabe: Restabstand.
function fuchsLaufe(dt, zx, zz, tempo){
  const fp = fuchs.obj.position;
  const dx = zx - fp.x, dz = zz - fp.z, d = Math.hypot(dx, dz);
  if(d < 0.05) return d;
  const soll = Math.atan2(dx, dz);
  const dw = winkelDiff(fuchs.yaw, soll);
  fuchs.yaw += klemme(dw, -5 * dt, 5 * dt);
  const s = Math.min(d, tempo * dt) * Math.max(0.15, Math.cos(dw));
  const nx = fp.x + Math.sin(fuchs.yaw) * s, nz = fp.z + Math.cos(fuchs.yaw) * s;
  fuchs.blockiert = !fuchsFrei(nx, nz);
  if(!fuchs.blockiert){ fp.x = nx; fp.z = nz; fuchsAnim(tempo >= 4 ? FA.rennen : FA.gehen, 0.2); }
  else { fuchs.ziel = null; fuchsAnim(FA.stehen, 0.3); }      // Wasser/Wand: stehen bleiben
  return d;
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
  } else if(fuchs.modus === 'kommen' && eva){
    // direkt vor die Figur (0,9 m), Blick zu ihr
    const v = nebenFigur(0.9, 0);
    const d = fuchsLaufe(dt, v.x, v.z, Math.hypot(v.x - fp.x, v.z - fp.z) > 3 ? 6.5 : 2.5);
    // Ziel im Wasser (Figur watet): am Ufer bleiben und von dort aus spielen
    if(d < 0.2 || fuchs.blockiert){
      fuchs.modus = 'spielen'; fuchs.spielI = 0;
      fuchsAnim(FA.spielen[0], 0.15);
    }
  } else if(fuchs.modus === 'spielen' && eva){
    fuchsSchaue(dt, zu.x, zu.z, 6);
    if(!fuchsClipLaeuft(fuchs.cur)){
      if(++fuchs.spielI < FA.spielen.length) fuchsAnim(FA.spielen[fuchs.spielI], 0.15);
      else fuchs.modus = 'hinsetzen';
    }
  } else if(fuchs.modus === 'hinsetzen' && eva){
    // links neben die Figur, gleiche Blickrichtung wie sie
    const l = nebenFigur(0.15, 0.85);
    if(!fuchs.sitzt){
      const d = fuchsLaufe(dt, l.x, l.z, 1.6);
      if(d < 0.15 || fuchs.blockiert){ fuchs.sitzt = true; fuchsAnim(FA.setzen, 0.25); }
    } else {
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
      const h = eva ? nebenFigur(-2.5, 1.2) : { x: zu.x, z: zu.z };
      fuchsLaufe(dt, h.x, h.z, 7.5);
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
  fuchs.obj.rotation.y = fuchs.yaw - fuchs.kopf;
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

// ---- Stimme + Untertitel ---------------------------------------------------------------------
// Browser erlauben Sprachausgabe erst nach einer Nutzergeste – deshalb der Startbildschirm.
// Ton an: Stimme. Ton aus (N / D-Pad runter): Untertitel. Immer nur eine Ansage gleichzeitig.
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
  subEl.textContent = text || '';
  subEl.style.opacity = text ? '1' : '0';
}
const STIMME_W = /Katja|Amala|Seraphina|Louisa|Hedda|Elke|Klarissa|Tanja|Google Deutsch|female|weiblich/i;
const STIMME_M = /Conrad|Killian|Florian|Stefan|Ralf|Kasper|Bernd|Christoph|male|männlich/i;
function stimmeFuer(rolle){
  const de = window.speechSynthesis.getVoices().filter(v => /^de/i.test(v.lang));
  const re = rolle === 'radio' ? STIMME_M : STIMME_W;
  return de.filter(v => re.test(v.name)).sort((a, b) => (a.localService ? 1 : 0) - (b.localService ? 1 : 0))[0] || de[0] || null;
}
function satzDauer(s){ return 1200 + s.length / 14 * 1000; }
let sprichtGerade = null;
const sprichWarte = [];
// Saetze nacheinander sprechen; fertig() genau einmal. rolle 'radio' = Radiostimme (tiefer).
function sprich(saetze, fertig, rolle){
  if(sprichtGerade){ sprichWarte.push(() => sprich(saetze, fertig, rolle)); return; }
  const synth = window.speechSynthesis;
  let i = -1, timer = null, done = false;
  const me = sprichtGerade = {};
  function weiter(){
    clearTimeout(timer);
    if(done) return;
    if(++i >= saetze.length){
      done = true; untertitel(''); sprichtGerade = null;
      if(fertig) fertig();
      const n = sprichWarte.shift(); if(n) n();
      return;
    }
    const s = saetze[i];
    if(synth && story.ton && soundOn && synth.getVoices().length){
      untertitel('');
      const u = new SpeechSynthesisUtterance(s), st = stimmeFuer(rolle);
      u.lang = 'de-DE'; if(st) u.voice = st;
      u.rate = 0.95;                              // fuer Kinderohren etwas langsamer
      u.pitch = rolle === 'radio' && !(st && STIMME_M.test(st.name)) ? 0.8 : 1.05;
      u.onend = u.onerror = () => { if(sprichtGerade === me) weiter(); };
      synth.speak(u);
      timer = setTimeout(() => { if(sprichtGerade === me) weiter(); }, (s.length / 14 * 1000 + 1500) * 2.5);
    } else {
      untertitel(s);
      timer = setTimeout(weiter, satzDauer(s));
    }
  }
  weiter();
}
story.sprich = sprich;

// ---- Startbildschirm -------------------------------------------------------------------------
// Ein grosser Knopf. A / Enter / Leertaste / Klick. Die Geste schaltet Ton und Stimme frei.
function startbildschirm(weiter){
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;'
    + 'justify-content:center;background:radial-gradient(ellipse at center,rgba(20,30,70,.55),rgba(0,0,10,.85));'
    + 'color:#fff;font-family:system-ui,sans-serif;z-index:30;text-align:center;user-select:none;';
  el.innerHTML = '<div style="font-size:clamp(34px,7vw,64px);font-weight:800;letter-spacing:1px;text-shadow:0 0 18px #6af">🌙 Das Geheimland</div>'
    + '<div style="font-size:clamp(16px,2.6vw,22px);margin-top:10px;opacity:.85">🔍 Ein Detektiv-Abenteuer mit deinem Fuchs 🦊</div>'
    + '<button style="margin-top:38px;min-width:220px;height:64px;border-radius:16px;border:3px solid #ffd23f;'
    + 'background:#ffd23f;color:#1a1a1a;font:800 26px system-ui;cursor:pointer;transform:scale(1.05)">▶ Los geht\'s</button>'
    + '<div style="font-size:14px;margin-top:18px;opacity:.7">A / Enter</div>';
  document.body.appendChild(el);
  let los = false;
  function start(){
    if(los) return; los = true;
    el.remove();
    removeEventListener('keydown', taste, true);
    story.ton = true; story.gestartet = true;
    if(!soundOn) toggleSound();
    weiter();
  }
  function taste(e){
    if(e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter'){ e.preventDefault(); e.stopPropagation(); start(); }
  }
  addEventListener('keydown', taste, true);
  el.querySelector('button').addEventListener('pointerdown', (e) => { e.stopPropagation(); start(); });
  let prevA = true;                                   // erst nach dem Loslassen zaehlen
  (function pad(){
    if(los) return;
    for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])){
      if(!gp) continue;
      const a = !!(gp.buttons[0] && gp.buttons[0].pressed);
      if(a && !prevA){ start(); return; }
      prevA = a; break;
    }
    requestAnimationFrame(pad);
  })();
}
function steuerbar(){ return story.gestartet; }

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
  g.userData.geraet = r; g.userData.lampe = lampe;
  return g;
}
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
function updateRadio(dt){
  if(!radio.obj) return;
  radio.t += dt;
  const r = radio.obj.userData.geraet;
  r.rotation.z = radio.an ? Math.sin(radio.t * 30) * 0.03 : 0;
  r.position.y = 0.45 + (radio.an ? Math.abs(Math.sin(radio.t * 22)) * 0.01 : 0);
  radio.obj.userData.lampe.visible = !radio.an || Math.sin(radio.t * 10) > 0;
}
function startSzene(){
  const I = story.insel, H = I.huette, F = I.feuer;
  story.baueInsel();
  // Funkgeraet auf einer Kiste rechts neben dem Feuer, Lautsprecher zum Startplatz
  radio.obj = baueRadio();
  radio.obj.position.set(F.x + 1.7, ISLAND_Y, F.z - 0.6);
  radio.obj.rotation.y = 0.5;
  welt(1).add(radio.obj);
  // Figur zwischen Feuer und Strand, Blick zur Huette (-z: Engine-yaw = 0). So hat die Kamera hinter
  // ihr Feuer, Palmen und Huette im Bild (aus der Huette heraus hing sie hinter der Rueckwand).
  if(eva){
    const x = F.x - 0.6, z = F.z + 3.2;
    eva.group.position.set(x, evaFootY(x, z), z);
    eva.yaw = 0; eva.group.rotation.y = eva.yaw;
  }
  // Fuchs sitzt am Strand zwischen Feuer und Meer und schaut aufs Wasser (+z)
  fuchsAbsetzen({ x: F.x + 1.2, z: I.R * 1.04, blick: 0, modus: 'warten' });
}
function durchsage(){
  radio.an = true;
  sprich(DURCHSAGE, () => { radio.an = false; sprich(NACH_DURCHSAGE); }, 'radio');
}

// ---- Hauptschleife ---------------------------------------------------------------------------
function hilfeOffen(){ const h = document.getElementById('hint'); return !!(h && h.classList.contains('show')); }
function hookLoop(){
  const loopOrig = loop;
  let tPrev = performance.now();
  loop = function(){
    const now = performance.now();
    const dt = Math.min(0.1, (now - tPrev) / 1000); tPrev = now;
    if(hilfeOffen()) return loopOrig.apply(this, arguments);   // Pause
    timerTick(dt);
    knieTaste();
    updateFigur(dt);
    figurWache(dt);
    planeGroup.visible = !eva;                // X-Wing nur sichtbar, wenn man drin sitzt
    updateFuchs(dt);
    updateRadio(dt);
    if(story.updateE1) story.updateE1(dt);
    if(story.updateInnen) story.updateInnen(dt);   // huette_innen.js: Tuer -> Blende -> Innenraum
    weltenSichtbar();
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

window.STORY_HOOK = function(){
  hookHudAus();
  hookWelt();
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
  startbildschirm(() => {});
};
})();
