// Das Geheimland – Steg und Segelboot am Strand (Etappe 1). Laedt nach insel.js, vor der Engine.
// Der Steg liegt genau vor der Huette (in einer Linie mit Huette, Lagerfeuer und Funkgeraet): kurz vor dem Wasser
// zuerst flache Planken auf dem Sand, ab dem Ufer ein Steg auf Pfaehlen aufs Meer hinaus. Er hat Grenzen (man faellt
// nicht seitlich oder vorn hinunter; vom Strand aus kommt man drauf und wieder runter). Daran liegt links (vom Strand
// aufs Meer gesehen = -x) das Segelboot (Sailboat by JinnMx, CC-BY-4.0), Bug aufs Meer.
// Im letzten Drittel des Stegs erscheint ein Y: einsteigen -> kurze Blende -> Joshi sitzt (kniend) im Boot, der Fuchs
// vorn im Bug und schaut aufs Meer. Y im Boot: wieder aussteigen auf den Steg.
// Einsteigen erst, wenn das Abenteuer begonnen hat (story.abenteuerLos: Ausruestung aus der Huette genommen UND
// Funkspruch angenommen – kommt noch). Vorher sagt die Erzaehlerin TEXT_NOCH_NICHT.
(function(){
'use strict';
const story = window.STORY;

const STEG = {
  x: 0, B: 2.2,
  zSand: 95.8,          // Beginn: flache Planken auf dem Sand
  zUfer: 98.6,          // Wasserlinie (Sandrand der Insel, ISEL_R * 1,12) – ab hier auf Pfaehlen
  zEnde: 120,           // Ende draussen
  H: 0.75,              // Hoehe der Planken ueber dem Meeresspiegel (Rampe vom Sand hoch)
};
const BOOT = { x: STEG.x - STEG.B / 2 - 1.5, z: 115, laenge: 6.2 };
const EINSTIEG_AB = STEG.zUfer + (STEG.zEnde - STEG.zUfer) * 2 / 3;   // letztes Drittel des Stegs (auf Pfaehlen)
const TEXT_NOCH_NICHT = ['Du hast hier noch nicht alles entdeckt. Bitte schaue dich in Ruhe weiter um.'];
const RAND = 0.35;      // m: so weit vom Stegrand bleibt die Figur (Koerper) – man faellt nicht hinunter
story.steg = STEG; story.boot = BOOT;
const s = { gruppe: null, boot: null, bootInnen: null, imBoot: false, t: 0, wechsel: null, sperre: 0, zeichen: null };
story.stegZustand = s;

// ---- Boden und Grenzen -----------------------------------------------------------------------
// Auf dem Steg (auch auf den Sandplanken) gilt die Plankenhoehe; die Raender sind Grenze (nur Richtung Strand frei).
function aufSteg(x, z){ return Math.abs(x - STEG.x) < STEG.B / 2 && z >= STEG.zSand && z <= STEG.zEnde; }
function stegY(z){
  // auf dem Sand flach (knapp ueber dem Sand), ab dem Ufer ueber 3 m auf Stegh hoehe ansteigend, dann eben
  const sand = ISLAND_Y + 0.06;
  if(z <= STEG.zUfer) return sand;
  const k = Math.min(1, (z - STEG.zUfer) / 3);
  return sand + (STEG.H - sand) * k;
}
// Darf die Figur nach (x, z)? Auf dem Steg: nur innerhalb der Raender, nicht ueber das Ende hinaus.
function stegFrei(x, z){
  if(!aufSteg(x, z)) return null;                               // nicht auf dem Steg: andere Regeln
  if(Math.abs(x - STEG.x) > STEG.B / 2 - RAND) return z < STEG.zUfer;   // Rand: auf dem Sandteil darf man seitlich runter
  if(z > STEG.zEnde - RAND) return false;                       // vorn: Ende
  return true;
}
// Ist (x, z) knapp neben dem Steg im Wasser (dort, wo man hinunterfiele)? Dann: Grenze
function nebenStegImWasser(x, z){
  return z > STEG.zUfer && z < STEG.zEnde + 0.6 && Math.abs(x - STEG.x) < STEG.B / 2 + 0.6 && !aufSteg(x, z) && !imBootPlatz(x, z);
}
function imBootPlatz(x, z){ return Math.abs(x - BOOT.x) < 1.3 && Math.abs(z - BOOT.z) < BOOT.laenge / 2; }
function hookSteg(){
  const solidOrig = evaSolid, fussOrig = evaFootY, wasserOrig = isOpenWater, insWasserOrig = evaEnterDinghy;
  evaSolid = function(x, z){
    if(locale === 'earth'){
      const f = stegFrei(x, z); if(f !== null) return f;
      if(eva && aufSteg(eva.group.position.x, eva.group.position.z) && nebenStegImWasser(x, z)) return false;   // nicht vom Steg ins Wasser
    }
    return solidOrig.apply(this, arguments);
  };
  evaFootY = function(x, z){ if(locale === 'earth' && aufSteg(x, z)) return stegY(z); return fussOrig.apply(this, arguments); };
  isOpenWater = function(x, z){ if(locale === 'earth' && (aufSteg(x, z) || nebenStegImWasser(x, z))) return false; return wasserOrig.apply(this, arguments); };
  // vom Steg aus nie ins Wasser fallen (die Engine sucht an der Kante bis 9 m voraus nach Wasser)
  evaEnterDinghy = function(){ if(eva && aufSteg(eva.group.position.x, eva.group.position.z)) return; return insWasserOrig.apply(this, arguments); };
}

// ---- Bauen -----------------------------------------------------------------------------------
function baue(){
  if(s.gruppe) return;
  const w = story.welt(1), g = new THREE.Group();
  const planke = new THREE.MeshLambertMaterial({ color: 0x9a7348 }), planke2 = new THREE.MeshLambertMaterial({ color: 0x8a6640 });
  const dunkel = new THREE.MeshLambertMaterial({ color: 0x5b3e24 });
  // Planken quer, leicht unregelmaessig; auf dem Sand flach, dann die Rampe hinauf
  let i = 0;
  for(let z = STEG.zSand; z < STEG.zEnde - 0.01; z += 0.32, i++){
    const p = new THREE.Mesh(new THREE.BoxGeometry(STEG.B - (i % 4 === 1 ? 0.06 : 0), 0.06, 0.28), i % 3 ? planke : planke2);
    const zm = z + 0.14;
    p.position.set(STEG.x + Math.sin(i * 2.3) * 0.02, stegY(zm) - 0.03, zm);
    p.rotation.y = Math.sin(i * 7.1) * 0.012;
    // Rampe: Planke kippen wie die Steigung
    if(zm > STEG.zUfer && zm < STEG.zUfer + 3) p.rotation.x = -Math.atan2(STEG.H - ISLAND_Y, 3);
    g.add(p);
  }
  // Laengstraeger unter dem Pfahlteil
  const L = STEG.zEnde - STEG.zUfer;
  for(const sx of [-1, 1]){
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, L - 2.6), dunkel); tr.position.set(STEG.x + sx * (STEG.B / 2 - 0.15), STEG.H - 0.14, STEG.zUfer + 2.6 + (L - 2.6) / 2); g.add(tr);
  }
  // Pfaehle (ab dem Ufer, alle 3 m) bis in den Grund, ein Stueck ueber die Planken (Geländerpfosten)
  for(let z = STEG.zUfer + 2; z <= STEG.zEnde + 0.01; z += 3){
    for(const sx of [-1, 1]){
      const pf = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 4.6, 8), dunkel);
      pf.position.set(STEG.x + sx * (STEG.B / 2 - 0.04), STEG.H - 1.9, Math.min(z, STEG.zEnde - 0.15)); g.add(pf);
    }
  }
  // niedrige Kante an beiden Seiten des Pfahlteils (zeigt die Grenze) und vorn am Ende
  for(const sx of [-1, 1]){
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, L - 3.2), dunkel); k.position.set(STEG.x + sx * (STEG.B / 2 - 0.05), STEG.H + 0.07, STEG.zUfer + 3.2 + (L - 3.2) / 2); g.add(k);
  }
  const vorn = new THREE.Mesh(new THREE.BoxGeometry(STEG.B, 0.14, 0.1), dunkel); vorn.position.set(STEG.x, STEG.H + 0.07, STEG.zEnde - 0.05); g.add(vorn);
  // Poller am Bootsplatz (linke Seite)
  for(const z of [BOOT.z - 2.2, BOOT.z + 2.2]){ const po = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 10), dunkel); po.position.set(STEG.x - STEG.B / 2 + 0.2, STEG.H + 0.21, z); g.add(po); }
  g.traverse(o => { if(o.isMesh) o.castShadow = true; });
  w.add(g); s.gruppe = g;
  ladeBoot(w);
}
function ladeBoot(w){
  story.ladeGlb(window.SEGELBOOT_GLB, 'Segelboot', (gl) => {
    const m = gl.scene; m.updateMatrixWorld(true);
    // Rumpf = Mesh "DarkBlue" (z -5,5..4,95 im Modell, Bug bei -z; die Segel ragen bei +z ueber das Heck)
    let rumpf = null; m.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = true; if(/DarkBlue/.test(o.name)) rumpf = o; } });
    const bb = new THREE.Box3().setFromObject(rumpf || m), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    const k = BOOT.laenge / sz.z;
    m.scale.multiplyScalar(k);
    m.position.set(-c.x * k, -bb.min.y * k - 0.4, -c.z * k);    // Kiel 0,4 m unter Wasser, Rumpfmitte im Ursprung
    // Farben nachts: Segel und Rumpf etwas aufhellen (fast schwarz), matt
    m.traverse(o => { if(o.isMesh && o.material){ for(const mt of (Array.isArray(o.material) ? o.material : [o.material])){ mt.metalness = 0;
      if(mt.color){ const h = {}; mt.color.getHSL(h); if(h.l < 0.2) mt.color.setHSL(h.h, h.s, 0.26); } } } });
    const innen = new THREE.Group(); innen.add(m);
    // Bug (-z im Modell) aufs Meer (+z in der Welt): um 180 Grad drehen
    innen.rotation.y = Math.PI;
    const g = new THREE.Group(); g.add(innen); g.position.set(BOOT.x, 0, BOOT.z);
    w.add(g); s.boot = g; s.bootInnen = innen;
    s.bugZ = BOOT.laenge / 2;                                    // Bug in Bootskoordinaten (+z nach der Drehung)
    s.deckY = (bb.max.y - bb.min.y) * k * 0.5 - 0.4;              // ungefaehr Bodenbretter im Boot
    story.koerper(null, { x: BOOT.x, z: BOOT.z, hx: 1.25, hz: BOOT.laenge / 2, h: 8 });   // man laeuft nicht ins Boot (nur mit Y)
  });
}

// ---- Einsteigen / Aussteigen (Y) ----------------------------------------------------------------
function amEinstieg(){
  if(!eva || s.imBoot || eva.boat || story.figur.kniet) return false;
  const p = eva.group.position;
  return aufSteg(p.x, p.z) && p.z > EINSTIEG_AB;
}
let yTex = null;
function yZeichen(){
  if(!yTex){ const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(64, 68, 56, 0, 7); g.fill();
    g.fillStyle = '#f5c518'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.font = 'bold 76px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Y', 64, 66);
    yTex = new THREE.CanvasTexture(c); }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: yTex, depthTest: false, transparent: true })); sp.scale.setScalar(0.6); sp.renderOrder = 999; return sp;
}
let blendeEl = null;
function blende(wert){
  if(!blendeEl){ blendeEl = document.createElement('div'); blendeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;'; document.body.appendChild(blendeEl); }
  blendeEl.style.opacity = String(wert);
}
function wechsle(ziel){ if(!s.wechsel && s.boot) s.wechsel = { t: 0, ziel, gesetzt: false }; }
function setzeUm(ziel){
  const g = eva.group, f = story.figur;
  if(ziel === 'boot'){
    s.imBoot = true;
    // Joshi kniet mittschiffs, Blick zum Bug (aufs Meer = +z -> Engine-yaw PI)
    f.kniet = true; f.aktion = null;
    if(f.acts && f.acts.kneel){ f.cur = 'x'; story.figurAnim ? story.figurAnim('kneel', 0.01, 1) : 0; }
    eva.yaw = Math.PI; g.rotation.y = eva.yaw;
    story.fuchsInsBoot && story.fuchsInsBoot(true);
  } else {
    s.imBoot = false;
    f.kniet = false;
    const x = STEG.x, z = BOOT.z;
    g.position.set(x, stegY(z), z);
    eva.yaw = 0; g.rotation.y = eva.yaw;                          // Blick zum Strand
    story.fuchsInsBoot && story.fuchsInsBoot(false);
  }
  evaOrbit = 0; evaPitch = 0;
  s.sperre = 0.8;
}
function hookBoot(){
  const yOrig = buttonY;
  buttonY = function(){
    if(s.wechsel) return;
    if(s.imBoot){ wechsle('steg'); return; }
    if(amEinstieg()){
      if(story.abenteuerLos){ wechsle('boot'); return; }
      if(!s.hinweis){ s.hinweis = true; story.sprich(TEXT_NOCH_NICHT, () => { s.hinweis = false; }); }
      return;
    }
    return yOrig.apply(this, arguments);
  };
  // Kamera im Boot: hinten links ueber dem Heck, Blick ueber Joshi und den Fuchs zum Bug aufs Meer (vom Steg aus
  // verdeckte das grosse Segel alles). Der rechte Stick (evaOrbit) dreht sie um das Boot.
  const camOrig = updateCamera, _k = new THREE.Vector3(), _z = new THREE.Vector3();
  updateCamera = function(){
    if(!(s.imBoot && eva && s.boot)) return camOrig.apply(this, arguments);
    if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam;
    const yaw = story.bootYaw() + evaOrbit;                       // Bug-Richtung der Welt (Winkel ab +z)
    const b = s.boot.position;
    _z.set(b.x + Math.sin(yaw) * 2.2, b.y + 0.9, b.z + Math.cos(yaw) * 2.2);       // Blickpunkt: vorn im Boot
    _k.set(b.x - Math.sin(yaw) * 5.2 - Math.cos(yaw) * 2.6, b.y + 3.0, b.z - Math.cos(yaw) * 5.2 + Math.sin(yaw) * 2.6);
    camera.position.lerp(_k, Math.min(1, 3 * dtCam)); camera.up.set(0, 1, 0); camera.lookAt(_z);
  };
  // Im Boot: nicht laufen, nicht drehen (sitzt) – die Figur folgt dem schaukelnden Boot
  const updEvaOrig = updateEva;
  updateEva = function(dt, inp){ if(s.imBoot && eva) return; return updEvaOrig.apply(this, arguments); };
}
story.updateSteg = function(dt){
  if(story.etappe !== 1) return;
  baue();
  s.t += dt;
  // Boot schaukelt mit der Duenung
  if(s.boot){ const b = s.boot; b.position.y = seaYAt(BOOT.x, BOOT.z) * 0.9; b.rotation.z = Math.sin(s.t * 0.9) * 0.035; b.rotation.x = Math.sin(s.t * 0.6 + 1) * 0.02; b.updateMatrixWorld(true); }
  // im Boot: Joshi mittschiffs (etwas hinter der Mitte), sitzt auf den Bodenbrettern und schaukelt mit
  if(s.imBoot && eva && s.boot){
    // auf der Bank mittschiffs (kniend – die Knie-Haltung senkt die Huefte, deshalb die Bank als Auflage)
    const p = new THREE.Vector3(0, s.deckY + 0.35, -0.6).applyMatrix4(s.boot.matrixWorld);
    eva.group.position.copy(p); eva.vy = 0; eva.onGround = true;
    eva.yaw = story.bootYaw() + Math.PI;                       // Blick zum Bug (Engine: Nase -Z)
    eva.group.rotation.set(s.boot.rotation.x, eva.yaw, s.boot.rotation.z);
  }
  // Wechsel mit Blende
  if(s.wechsel){
    const w = s.wechsel; w.t += dt;
    if(w.t < 0.35) blende(w.t / 0.35);
    else { if(!w.gesetzt){ w.gesetzt = true; setzeUm(w.ziel); } blende(Math.max(0, 1 - (w.t - 0.35) / 0.45)); if(w.t > 0.8){ s.wechsel = null; blende(0); } }
  }
  if(s.sperre > 0) s.sperre -= dt;
  // Y am Einstieg (bzw. im Boot zum Aussteigen)
  const zeigen = !s.wechsel && (amEinstieg() || s.imBoot);
  if(zeigen && !s.zeichen){ s.zeichen = yZeichen(); story.welt(1).add(s.zeichen); }
  if(s.zeichen){
    s.zeichen.visible = zeigen;
    if(zeigen){ const p = s.imBoot ? eva.group.position : new THREE.Vector3(BOOT.x, STEG.H, BOOT.z);
      s.zeichen.position.set(p.x, (s.imBoot ? p.y + 1.6 : STEG.H + 2.4) + Math.sin(s.t * 3) * 0.07, p.z); }
  }
};
story.imBoot = () => s.imBoot;
story.bootPunkt = (vor, seit, hoch) => s.boot ? new THREE.Vector3(seit || 0, s.deckY + (hoch || 0), vor || 0).applyMatrix4(s.boot.matrixWorld) : null;
// Bug-Richtung in der Welt als Winkel ab +z (wie fuchs.yaw): vorn im Boot = lokale +z-Achse der Bootsgruppe
const _bv = new THREE.Vector3();
story.bootYaw = () => { if(!s.boot) return 0; _bv.set(0, 0, 1).transformDirection(s.boot.matrixWorld); return Math.atan2(_bv.x, _bv.z); };
story.aufSteg = aufSteg;

const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookSteg(); hookBoot(); };
})();
