// Das Geheimland – Innenraum der Huette ("innen groesser als aussen", wie die Tardis).
// Grundsatz fuer alle Innenraeume: eine eigene, durch ihre Aussenwaende begrenzte Welt. Durch Fenster sieht man
// hoechstens ein Bild der Aussenwelt, hinkommen kann man nicht. Laedt nach insel.js, vor der Engine. Der Raum schwebt weit draussen ueber dem Meer (RAUM, BODEN_Y), von der
// Insel aus nicht zu sehen. Geht die Figur durch die Huettentuer, blendet es ab, und sie steht drinnen an der Tuer;
// durch die Tuer innen wieder hinaus -> vor der Huette. So gibt es in der engen Huette kein Kameraproblem.
// Innen: Tapete (Waende), Holzverkleidung unten, Dielenboden, Balkendecke, Bett, Tisch, Regal, Strassenteppich,
// Laterne. Spaeter kommen hier die Trophaeen und das Ermittler-Brett hin.
(function(){
'use strict';
const story = window.STORY;

const RAUM = { x: 0, z: -620, B: 9, T: 7, H: 3.2 };   // Mitte, Breite (x), Tiefe (z), Hoehe; Tuer auf +z
// Hoch ueber dem Meer: auf Meereshoehe schaltete die Engine in den Unterwassermodus (Kamera unter den Wellen)
// und die Duenung ragte in den Raum. Der Raum ist geschlossen – draussen sieht man nur gemalte Fenster.
const BODEN_Y = 150;
const TUER_B = 1.1, TUER_H = 2.1;
const innen = story.innen = { drin: false, gruppe: null, blende: 0, wechsel: null, sperre: 0 };

// Texturen (Tapete, Dielen, Verkleidung, Strassenteppich) kommen gemeinsam aus texturen.js (story.tex)
function canvasTex(w, h, mal){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  mal(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// ---- Raum bauen ------------------------------------------------------------------------------
function baueRaum(){
  if(innen.gruppe) return;
  const g = new THREE.Group();
  const B = RAUM.B, T = RAUM.T, H = RAUM.H;
  const tapM = new THREE.MeshLambertMaterial({ map: story.tex.tapete() });
  const verkM = new THREE.MeshLambertMaterial({ map: story.tex.verkleidung() });
  const bodenM = new THREE.MeshLambertMaterial({ map: story.tex.dielen() });
  const holz = new THREE.MeshLambertMaterial({ color: 0x8a5a33 });
  const dunkel = new THREE.MeshLambertMaterial({ color: 0x5b3a1f });
  const SOCKEL = 1.0;                                   // Hoehe der Holzverkleidung
  // Boden
  const bodenTex = bodenM.map; bodenTex.repeat.set(B / 2.5, T / 2.5);
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(B, T), bodenM);
  boden.rotation.x = -Math.PI / 2; boden.position.y = 0.01; g.add(boden);
  // Waende: Tapete oben, Verkleidung unten, nach innen gewandt. Vorderwand mit Tueroeffnung.
  function wandStueck(breite, mitteX, y0, y1, mat, wdhX){
    const m = mat.clone(); m.map = mat.map.clone(); m.map.needsUpdate = true;
    m.map.repeat.set(wdhX || breite / 1.6, mat === tapM ? (y1 - y0) / 1.6 : 1);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(breite, y1 - y0), m);
    p.position.set(mitteX, (y0 + y1) / 2, 0); return p;
  }
  function wand(laenge, tuer){
    const w = new THREE.Group();
    const teile = tuer ? [[-laenge / 2, -TUER_B / 2], [TUER_B / 2, laenge / 2]] : [[-laenge / 2, laenge / 2]];
    for(const [a, b] of teile){
      w.add(wandStueck(b - a, (a + b) / 2, 0, SOCKEL, verkM));
      w.add(wandStueck(b - a, (a + b) / 2, SOCKEL, H, tapM));
      const leiste = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.08, 0.05), dunkel); leiste.position.set((a + b) / 2, SOCKEL, 0.02); w.add(leiste);
    }
    if(tuer){                                           // Sturz ueber der Tuer + Rahmen
      w.add(wandStueck(TUER_B, 0, TUER_H, H, tapM));
      for(const [bw, bh, bx, by] of [[0.12, TUER_H, -TUER_B / 2 - 0.06, TUER_H / 2], [0.12, TUER_H, TUER_B / 2 + 0.06, TUER_H / 2], [TUER_B + 0.24, 0.12, 0, TUER_H + 0.06]]){
        const r = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.1), dunkel); r.position.set(bx, by, 0.03); w.add(r);
      }
    }
    return w;
  }
  const hinten = wand(B, false); hinten.position.z = -T / 2; g.add(hinten);
  const vorn = wand(B, true); vorn.position.z = T / 2; vorn.rotation.y = Math.PI; g.add(vorn);
  const links = wand(T, false); links.position.x = -B / 2; links.rotation.y = Math.PI / 2; g.add(links);
  const rechts = wand(T, false); rechts.position.x = B / 2; rechts.rotation.y = -Math.PI / 2; g.add(rechts);
  // In der Tueroeffnung: warmes Nachtblau (draussen ist Nacht) statt Leere
  const nacht = new THREE.Mesh(new THREE.PlaneGeometry(TUER_B, TUER_H), new THREE.MeshBasicMaterial({ color: 0x0d1a3a }));
  nacht.position.set(0, TUER_H / 2, T / 2 + 0.05); nacht.rotation.y = Math.PI; g.add(nacht);
  // Fenster (gemalt: Nachthimmel mit Mond) an der Rueckwand und links
  const fensterTex = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = '#0d1a3a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(84, 40, 16, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#0d1a3a'; c.beginPath(); c.arc(92, 34, 14, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#ffffff'; for(let i = 0; i < 18; i++) c.fillRect((i * 37) % w, (i * 53) % 90, 2, 2);
    c.fillStyle = '#1d3a2a'; c.fillRect(0, 100, w, 28);
  });
  for(const [fx, fz, ry] of [[-2.2, -T / 2 + 0.03, 0], [2.2, -T / 2 + 0.03, 0], [-B / 2 + 0.03, 0.6, Math.PI / 2]]){
    const f = new THREE.Group(); f.position.set(fx, 1.75, fz); f.rotation.y = ry;
    f.add(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.9), new THREE.MeshBasicMaterial({ map: fensterTex })));
    for(const [bw, bh, bx, by] of [[1.16, 0.08, 0, 0.49], [1.16, 0.08, 0, -0.49], [0.08, 0.9, -0.54, 0], [0.08, 0.9, 0.54, 0], [0.05, 0.9, 0, 0], [1.0, 0.05, 0, 0]]){
      const r = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), dunkel); r.position.set(bx, by, 0.02); f.add(r);
    }
    g.add(f);
  }
  // Decke mit Balken
  const decke = new THREE.Mesh(new THREE.PlaneGeometry(B, T), new THREE.MeshLambertMaterial({ color: 0xc9a27a }));
  decke.rotation.x = Math.PI / 2; decke.position.y = H; g.add(decke);
  for(let x = -B / 2 + 1; x < B / 2; x += 1.6){
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, T), dunkel); b.position.set(x, H - 0.11, 0); g.add(b);
  }
  // Moebel: Bett (links hinten), Tisch mit Laterne (rechts), Regal (Rueckwand), Strassen-Spielteppich
  const decken = new THREE.MeshLambertMaterial({ color: 0x3f6fb5 });
  const bett = new THREE.Group(); bett.position.set(-B / 2 + 1.0, 0, -T / 2 + 1.5);
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2.2), holz); rahmen.position.y = 0.2; bett.add(rahmen);
  const kopf = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.9, 0.1), dunkel); kopf.position.set(0, 0.45, -1.1); bett.add(kopf);
  const dk = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 1.5), decken); dk.position.set(0, 0.45, 0.3); bett.add(dk);
  const ki = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.4), new THREE.MeshLambertMaterial({ color: 0xf2efe6 })); ki.position.set(0, 0.47, -0.75); bett.add(ki);
  g.add(bett);
  const tisch = new THREE.Group(); tisch.position.set(B / 2 - 1.4, 0, -0.6);
  const platte = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.9), holz); platte.position.y = 0.78; tisch.add(platte);
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){ const bn = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.07), dunkel); bn.position.set(sx * 0.6, 0.375, sz * 0.36); tisch.add(bn); }
  const lat = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.26, 10), new THREE.MeshBasicMaterial({ color: 0xffd27a })); lat.position.set(0.35, 0.95, 0); tisch.add(lat);
  g.add(tisch);
  const regal = new THREE.Group(); regal.position.set(0.3, 0, -T / 2 + 0.25);
  for(let i = 0; i < 3; i++){ const br = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.32), holz); br.position.y = 0.5 + i * 0.55; regal.add(br); }
  for(const sx of [-1, 1]){ const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.32), dunkel); s.position.set(sx * 1.0, 0.85, 0); regal.add(s); }
  g.add(regal);
  innen.regal = regal;                                  // spaeter: Trophaeen
  // Strassen-Spielteppich (2,7 x 1,8 m) vor dem Bett – bedeckt nur einen Teil des Bodens
  const teppich = story.tex.teppichMesh(2.7, 1.8); teppich.position.set(0.3, 0.02, 0.9); g.add(teppich);
  // Licht: Laterne warm + gedimmtes Grundlicht (hemiLight ist nachts schwach)
  const ll = new THREE.PointLight(0xffc070, 1.6, 14, 1.4); ll.position.set(B / 2 - 1.05, 1.6, -0.6); g.add(ll);
  const grund = new THREE.PointLight(0xffe6c0, 0.9, 16, 1.2); grund.position.set(0, H - 0.4, 0.5); g.add(grund);
  // Hindernisse (Rechtecke in Raumkoordinaten) fuer Moebel
  innen.moebel = [
    { x: bett.position.x, z: bett.position.z, hx: 0.65, hz: 1.15 },
    { x: tisch.position.x, z: tisch.position.z, hx: 0.75, hz: 0.5 },
    { x: regal.position.x, z: regal.position.z, hx: 1.05, hz: 0.2 },
  ];
  g.position.set(RAUM.x, BODEN_Y, RAUM.z);
  story.welt(1).add(g);
  innen.gruppe = g;
}

// ---- Laufen im Raum --------------------------------------------------------------------------
const KOERPER = 0.3;
// Huelle um den Raum (15 m Rand, mehr als EVA_WATER_REACH = 9 m): darin gilt nur raumFrei. Die Engine sucht an
// einer Wand bis 9 m voraus nach Wasser und haette sonst hinter der Rueckwand das Schwimmen gestartet.
const HUELLE = 15;
function imRaum(x, z){ return Math.abs(x - RAUM.x) < RAUM.B / 2 + HUELLE && Math.abs(z - RAUM.z) < RAUM.T / 2 + HUELLE; }
function raumFrei(x, z){
  const lx = x - RAUM.x, lz = z - RAUM.z;
  if(Math.abs(lx) > RAUM.B / 2 - KOERPER || lz < -RAUM.T / 2 + KOERPER) return false;
  if(lz > RAUM.T / 2 - KOERPER && !(Math.abs(lx) < TUER_B / 2 - 0.15 && lz < RAUM.T / 2 + 0.6)) return false;   // nur durch die Tuer
  for(const m of innen.moebel || []) if(Math.abs(lx - m.x) < m.hx + KOERPER && Math.abs(lz - m.z) < m.hz + KOERPER) return false;
  return true;
}
function hookInnen(){
  const solidOrig = evaSolid, fussOrig = evaFootY, hitsOrig = hitsBuilding;
  evaSolid = function(x, z){ if(locale === 'earth' && imRaum(x, z)) return raumFrei(x, z); return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(locale === 'earth' && imRaum(x, z)) return BODEN_Y; return fussOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){ if(locale === 'earth' && imRaum(x, z)) return !raumFrei(x, z); return hitsOrig.apply(this, arguments); };
  // Wasser gibt es im Raum nicht (sonst fing die Engine hier das Schlauchboot/Schwimmen an)
  const insWasserOrig = evaEnterDinghy;
  evaEnterDinghy = function(){ if(innen.drin) return; return insWasserOrig.apply(this, arguments); };
  const offenOrig = isOpenWater;
  isOpenWater = function(x, z){ if(locale === 'earth' && imRaum(x, z)) return false; return offenOrig.apply(this, arguments); };
  // Kamera im Raum: eigene, ruhige Verfolgerkamera – 3,4 m hinter der Figur, 1,9 m hoch, auf
  // Brusthoehe blickend; an den Waenden geklemmt. Der rechte Stick (evaOrbit) dreht sie weiter um die
  // Figur. Die Engine-Kamera ist fuer draussen (1,9-m-Astronaut, 14 m Vorausblick) und schaute
  // geklemmt steil von oben.
  const camOrig = updateCamera;
  const _soll = new THREE.Vector3();
  updateCamera = function(){
    // Innen ersetzt diese Kamera die der Engine ganz (vorher liefen beide, und jede zog in ihre Richtung –
    // das ruckelte massiv)
    if(!(innen.drin && eva)) return camOrig.apply(this, arguments);
    {
      // Umsehen mit dem rechten Stick (I/J/K/L) wie draussen, ohne Eingabe zurueck hinter die Figur
      if(Math.abs(lookX) > 0.01) evaOrbit -= lookX * EVA_LOOK_SPEED * dtCam;
      else evaOrbit += (0 - evaOrbit) * Math.min(1, EVA_LOOK_RETURN * dtCam);
      const p = eva.group.position, yaw = eva.yaw + evaOrbit, m = 0.3;
      _soll.set(p.x + Math.sin(yaw) * 3.4, BODEN_Y + 1.9, p.z + Math.cos(yaw) * 3.4);
      // an den Waenden klemmen – vorn an der Tuerwand INNEN (nie in die Oeffnung, dort sah man das Meer)
      _soll.x = Math.max(RAUM.x - RAUM.B / 2 + m, Math.min(RAUM.x + RAUM.B / 2 - m, _soll.x));
      _soll.z = Math.max(RAUM.z - RAUM.T / 2 + m, Math.min(RAUM.z + RAUM.T / 2 - m, _soll.z));
      // Eng (Figur an einer Wand): naeher ran und tiefer, damit sie nicht steil von oben schaut
      const frei = Math.hypot(_soll.x - p.x, _soll.z - p.z);
      _soll.y = BODEN_Y + 0.95 + 0.95 * Math.min(1, frei / 3.4);
      const c = camera.position;                        // auch die aktuelle Position im Raum halten
      c.x = Math.max(RAUM.x - RAUM.B / 2 + m, Math.min(RAUM.x + RAUM.B / 2 - m, c.x));
      c.z = Math.max(RAUM.z - RAUM.T / 2 + m, Math.min(RAUM.z + RAUM.T / 2 - m, c.z));
      c.y = Math.max(BODEN_Y + 0.5, Math.min(BODEN_Y + RAUM.H - 0.2, c.y));
      if(innen.kamSofort){ camera.position.copy(_soll); innen.kamSofort = false; }
      else camera.position.lerp(_soll, Math.min(1, 6 * dtCam));
      camera.up.set(0, 1, 0);
      camera.lookAt(p.x, p.y + 0.75, p.z);
    }
  };
  // Meer und Moewen drinnen gedaempft
  const ambOrig = updateAmbient;
  updateAmbient = function(dt){
    const r = ambOrig.apply(this, arguments);
    if(innen.drin && ambGullGain && ambOceanGain){ ambGullGain.gain.value *= 0.25; ambOceanGain.gain.value *= 0.4; }
    return r;
  };
}

// ---- Blende und Wechsel ----------------------------------------------------------------------
let blendeEl = null;
function blende(wert){
  if(!blendeEl){
    blendeEl = document.createElement('div');
    blendeEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:25;';
    document.body.appendChild(blendeEl);
  }
  blendeEl.style.opacity = String(wert);
}
// Wechsel: 0,35 s abblenden, im Schwarzen umsetzen, 0,45 s aufblenden
function wechsle(ziel){
  if(innen.wechsel) return;
  innen.wechsel = { t: 0, ziel, gesetzt: false };
}
function setzeUm(ziel){
  const I = story.insel, H = I.huette;
  const g = eva.group;
  if(ziel === 'innen'){
    baueRaum();
    const x = RAUM.x, z = RAUM.z + RAUM.T / 2 - 2.4;      // ein Stueck im Raum, damit die Kamera hinter ihr Platz hat
    g.position.set(x, BODEN_Y, z);
    eva.yaw = 0;                                          // Blick in den Raum (-z)
    innen.drin = true;
  } else {
    // ein Stueck vor der Huette (etwa wie beim Spielstart am Feuer), damit die Kamera hinter Joshi nicht in der Huette
    // haengt; seitlich versetzt, damit er nicht im Lagerfeuer steht (das liegt genau vor der Tuer)
    const x = H.x - 1.8, z = H.z + H.T / 2 + 4.2;
    g.position.set(x, evaFootY(x, z), z);
    eva.yaw = Math.PI;                                    // Blick zum Strand (+z)
    innen.drin = false;
  }
  g.rotation.y = eva.yaw;
  evaOrbit = 0; evaPitch = 0;
  // Kamera sofort hinter die Figur (sonst fliegt sie im Hellwerden quer ueber das Meer)
  const back = new THREE.Vector3(Math.sin(eva.yaw), 0, Math.cos(eva.yaw));
  camera.position.copy(g.position).addScaledVector(back, innen.drin ? 3.2 : 5).add(new THREE.Vector3(0, 2, 0));
  innen.kamSofort = innen.drin;
  innen.sperre = 1.0;                                     // nicht sofort wieder zuruecksetzen
  if(story.fuchsZu) story.fuchsZu(ziel);
}
function updateInnen(dt){
  if(!eva || story.etappe !== 1) return;
  if(innen.wechsel){
    const w = innen.wechsel; w.t += dt;
    if(w.t < 0.35) blende(w.t / 0.35);
    else {
      if(!w.gesetzt){ w.gesetzt = true; setzeUm(w.ziel); }
      blende(Math.max(0, 1 - (w.t - 0.35) / 0.45));
      if(w.t > 0.8){ innen.wechsel = null; blende(0); }
    }
    return;
  }
  if(innen.sperre > 0){ innen.sperre -= dt; return; }
  const p = eva.group.position, H = story.insel.huette;
  // Sicherheitsnetz: aus dem Raum gefallen (Huelle verlassen) -> zurueck an die Tuer
  if(innen.drin && (!imRaum(p.x, p.z) || p.y < BODEN_Y - 1)){ setzeUm('innen'); return; }
  if(!innen.drin){
    // in der Tueroeffnung der Huette (aussen) -> hinein
    if(Math.abs(p.x - H.x) < 0.5 && p.z < H.z + H.T / 2 + 0.05 && p.z > H.z + H.T / 2 - 0.6) wechsle('innen');
  } else {
    // innen durch die Tuer hinaus
    if(Math.abs(p.x - RAUM.x) < 0.6 && p.z > RAUM.z + RAUM.T / 2 - 0.05) wechsle('aussen');
  }
}
story.updateInnen = updateInnen;

const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookInnen(); };
})();
