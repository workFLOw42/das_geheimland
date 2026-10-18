// Das Geheimland – Globus zwischen den Etappen (Live-Wunsch 16.10.2026, Vorbild Trip to Japan / Spiel_SFG story.js
// "Globus-Reise"). Laedt nach segeln.js.
// Ablauf: Schwarzblende (Ton blendet mit aus) -> Globus: die Kamera faehrt vom letzten zum neuen Ort, ein roter Faden
// waechst dazwischen -> Schwarzblende -> die Seite wird NEU GELADEN. Das setzt die Etappe vollstaendig zurueck: Speicher
// leer, keine Timer, Toene, Modelle oder Zustaende, die stehen bleiben oder doppelt laufen (Live-Wunsch). Danach kommt
// der Startbildschirm. Spaeter: der Spielstand (welche Etappe) wird vorher gemerkt (sessionStorage) und nach dem
// Neuladen die naechste Etappe aufgebaut – dafuer gibt es story.naechsteEtappe.
// story.globusReise(nach, fertig?) – nach = Index in ORTE. Ohne fertig: neu laden.
(function(){
'use strict';
const story = window.STORY;

// Joshi ist im Geheimland – darum keine Erde, sondern eine eigene kleine Welt (Live-Wunsch 16.10.): viel Meer, ein paar
// Inseln, gemalt (weltTextur). Start = Joshis Insel mit einem Haus als Symbol; andere Orte vorerst ein Standardpunkt, bis
// feststeht, was sie werden. An der Spitze des wachsenden Fadens: ein kleines Gesicht von Joshi (aus der Spielfigur).
const ORTE = [
  { name: 'Joshis Insel', lat: 18, lon: -12, symbol: 'haus' },
  { name: 'Fall 1', lat: 34, lon: 22 },
];
// Inseln der Geheimland-Welt (lat, lon, Groesse in Grad) – Joshis Insel ist die erste
const INSELN = [[18, -12, 7], [34, 22, 5], [-8, 30, 9], [52, -40, 6], [-30, -20, 11], [5, 70, 8], [-45, 60, 7], [40, 110, 10], [-15, 140, 6], [62, 160, 5], [10, -90, 9], [-55, -120, 8]];
const GLOBUS_R = 1, GLOBUS_FAHRT = 4.5, GLOBUS_HALT = 2.5;
const gl = { szene: null, kam: null, erde: null, faden: null, punkte: null, aktiv: false, t: 0, von: 0, nach: 0, fertig: null, ende: false, textEl: null };
story.reise = [0];

function latLon(lat, lon, r){
  const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}
// Grosskreis zwischen zwei Orten, in der Mitte leicht ueber der Oberflaeche
function bogen(a, b, n){
  const va = latLon(a.lat, a.lon, 1), vb = latLon(b.lat, b.lon, 1), w = Math.max(1e-4, va.angleTo(vb)), out = [];
  for(let i = 0; i <= n; i++){
    const t = i / n;
    const v = new THREE.Vector3().copy(va).multiplyScalar(Math.sin((1 - t) * w) / Math.sin(w)).addScaledVector(vb, Math.sin(t * w) / Math.sin(w));
    // 2 % ueber der Kugel statt 1 % (Live-Befund 18.10.2026 in Trip to Japan: die Kugel schnitt den Faden stellenweise an)
    out.push(v.normalize().multiplyScalar(GLOBUS_R * (1.02 + Math.min(0.06, 0.03 + w * 0.04) * Math.sin(Math.PI * t))));
  }
  return out;
}
function bauen(){
  if(gl.szene) return;
  gl.szene = new THREE.Scene(); gl.szene.background = new THREE.Color(0x02040a);
  gl.kam = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.01, 100);
  gl.szene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sonne = new THREE.DirectionalLight(0xffffff, 0.9); sonne.position.set(3, 2, 4); gl.szene.add(sonne);
  const sg = new THREE.BufferGeometry(), sp = new Float32Array(1500 * 3);
  for(let i = 0; i < 1500; i++){ const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(30 + Math.random() * 20); sp.set([v.x, v.y, v.z], i * 3); }
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  gl.szene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 })));
  // Die Welt des Geheimlands: eigene Kugel mit gemalter Karte (Meer, Inseln mit Sandrand)
  gl.erde = new THREE.Mesh(new THREE.SphereGeometry(GLOBUS_R, 64, 48), new THREE.MeshLambertMaterial({ map: weltTextur() }));
  gl.szene.add(gl.erde);
  // leichter Schimmer am Rand (Atmosphaere)
  const hof = new THREE.Mesh(new THREE.SphereGeometry(GLOBUS_R * 1.06, 48, 32), new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.12, side: THREE.BackSide }));
  gl.szene.add(hof);
  gl.punkte = new THREE.Group(); gl.erde.add(gl.punkte);
  gl.faden = new THREE.Group(); gl.erde.add(gl.faden);
  // feste Symbole (einmal gebaut, nicht jedes Bild): Haus auf Joshis Insel, Joshis Gesicht an der Fadenspitze
  gl.haus = symbolSprite(inselBild(), 0.22); gl.erde.add(gl.haus);
  gl.gesicht = symbolSprite(gesichtBild(), 0.15); gl.gesicht.visible = false; gl.erde.add(gl.gesicht);
}
// Karte als Canvas (equirektangular: x = Laenge, y = Breite) – passt zu latLon und SphereGeometry
function weltTextur(){
  const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const meer = g.createLinearGradient(0, 0, 0, H); meer.addColorStop(0, '#1f5a8f'); meer.addColorStop(0.5, '#2c7cb8'); meer.addColorStop(1, '#1f5a8f');
  g.fillStyle = meer; g.fillRect(0, 0, W, H);
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const xy = (lat, lon) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
  for(const [lat, lon, r] of INSELN){
    const [x, y] = xy(lat, lon), rx = r / 360 * W, ry = r / 180 * H;
    // unregelmaessiger Umriss: Flachwasser, Sand, Gras
    for(const [k, farbe] of [[1.55, 'rgba(120,200,220,0.55)'], [1.15, '#e8d49a'], [0.85, '#4f9a4a']]){
      g.fillStyle = farbe; g.beginPath();
      for(let i = 0; i <= 24; i++){ const a = i / 24 * Math.PI * 2, w = 1 + (rnd() - 0.5) * 0.35;
        const px = x + Math.cos(a) * rx * k * w, py = y + Math.sin(a) * ry * k * w; i ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}
// Symbole: Sprite auf der Oberflaeche, immer zur Kamera gedreht, ohne Tiefentest am Rand
function symbolSprite(canvas, gross){
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
  sp.scale.setScalar(gross); sp.renderOrder = 5; return sp;
}
// Joshis Insel auf dem Globus: dasselbe Symbol wie im Notizbuch, hier farbig (ausruestung.js story.inselIcon); fehlt es,
// das alte Haus
function inselBild(){
  if(!story.inselIcon) return hausBild();
  const c = document.createElement('canvas'); c.width = c.height = 200; story.inselIcon(c.getContext('2d'), 100, 100, 190, 'farbe'); return c;
}
function hausBild(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(64, 112, 40, 9, 0, 0, 7); g.fill();
  g.fillStyle = '#9a6a3c'; g.fillRect(30, 58, 68, 50);                                       // Wand
  g.fillStyle = '#d6b76a'; g.beginPath(); g.moveTo(18, 62); g.lineTo(64, 20); g.lineTo(110, 62); g.closePath(); g.fill();   // Strohdach
  g.strokeStyle = '#8a6b2e'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#5b3a1f'; g.fillRect(56, 76, 18, 32);                                       // Tuer
  g.fillStyle = '#ffd27a'; g.fillRect(36, 70, 14, 12); g.fillRect(80, 70, 14, 12);            // Fenster (Licht)
  g.lineWidth = 5; g.strokeStyle = '#ffffff'; g.strokeRect(30, 58, 68, 50);
  return c;
}
// Joshis Gesicht: der Kopf aus der Zeichnung der Figur (joshi_kopf.js, vom Nutzer), rund in einem Abzeichen. Fehlt das
// Bild, wird ersatzweise die Spielfigur einmal von vorn auf den Kopf gerendert.
function gesichtBild(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  // runder Rahmen wie ein Abzeichen
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill();
  g.fillStyle = '#3b82ff'; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill();
  if(window.JOSHI_KOPF_PNG){
    const im = new Image();
    im.onload = () => { g.save(); g.beginPath(); g.arc(64, 64, 56, 0, 7); g.clip(); g.fillStyle = '#fbfaf7'; g.fill(); g.drawImage(im, 8, 8, 112, 112); g.restore();
      if(gl.gesicht) gl.gesicht.material.map.needsUpdate = true; };
    im.src = window.JOSHI_KOPF_PNG;
    return c;
  }
  const f = story.figur && story.figur.obj;
  // three.js nimmt beim Laden den Doppelpunkt aus Knotennamen (mixamorig:Head -> mixamorigHead)
  let kopf = null; if(f) f.traverse(o => { if(!kopf && /^mixamorig:?Head$/.test(o.name)) kopf = o; });
  if(!f || !kopf || typeof renderer === 'undefined') return c;
  try {
    const rt = new THREE.WebGLRenderTarget(256, 256), sz = new THREE.Scene(), eltern = f.parent;
    sz.add(new THREE.HemisphereLight(0xffffff, 0x666677, 1.2)); const l = new THREE.DirectionalLight(0xffffff, 0.6); l.position.set(0.5, 1, 2); sz.add(l);
    f.updateMatrixWorld(true);
    const p = kopf.getWorldPosition(new THREE.Vector3()), q = f.getWorldQuaternion(new THREE.Quaternion());
    // die Figur schaut entlang ihrer -z-Achse (Engine: Nase -Z) – von dort auf den Kopf blicken
    const vorn = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
    const kam = new THREE.PerspectiveCamera(28, 1, 0.01, 10);
    kam.position.copy(p).addScaledVector(vorn, 0.75).add(new THREE.Vector3(0, 0.05, 0)); kam.lookAt(p.x, p.y + 0.04, p.z);
    const pos = f.position.clone(), rot = f.quaternion.clone(), sc = f.scale.clone();
    const m = f.matrixWorld.clone(); sz.add(f); m.decompose(f.position, f.quaternion, f.scale); f.updateMatrixWorld(true);
    const alt = renderer.getRenderTarget(); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(sz, kam); renderer.setRenderTarget(alt);
    sz.remove(f); f.position.copy(pos); f.quaternion.copy(rot); f.scale.copy(sc); if(eltern) eltern.add(f); f.updateMatrixWorld(true);
    // Pixel holen, rund ausschneiden
    const px = new Uint8Array(256 * 256 * 4); renderer.readRenderTargetPixels(rt, 0, 0, 256, 256, px); rt.dispose();
    const tmp = document.createElement('canvas'); tmp.width = tmp.height = 256; const tg = tmp.getContext('2d'), id = tg.createImageData(256, 256);
    for(let y = 0; y < 256; y++) id.data.set(px.subarray((255 - y) * 1024, (256 - y) * 1024), y * 1024);   // WebGL: unten nach oben
    tg.putImageData(id, 0, 0);
    g.save(); g.beginPath(); g.arc(64, 64, 56, 0, 7); g.clip(); g.drawImage(tmp, 0, 0, 256, 256, 8, 8, 112, 112); g.restore();
  } catch(e){ console.warn('Gesicht:', e); }
  return c;
}
function punkt(ort, farbe, gross){
  const m = new THREE.Mesh(new THREE.SphereGeometry(gross ? 0.028 : 0.02, 16, 12), new THREE.MeshBasicMaterial({ color: farbe }));
  m.position.copy(latLon(ort.lat, ort.lon, GLOBUS_R * 1.012)); gl.punkte.add(m);
}
function zeichnen(anteil){
  for(const o of [...gl.punkte.children, ...gl.faden.children]) story.entsorgen(o);   // jedes Bild neu: alte Stuecke freigeben
  const r = story.reise;
  let spitze = null;
  for(let i = 1; i < r.length; i++){
    const letztes = i === r.length - 1;
    const pts = bogen(ORTE[r[i - 1]], ORTE[r[i]], 48), n = Math.max(2, Math.round(pts.length * (letztes ? anteil : 1)));
    gl.faden.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0, n)), Math.max(4, n * 2), 0.009, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xe02020, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 })));   // gewinnt knapp gegen die Kugel
    if(letztes) spitze = pts[n - 1];
  }
  // Joshis Insel: das Haus (statt eines Punkts), etwas ueber der Oberflaeche
  gl.haus.position.copy(latLon(ORTE[0].lat, ORTE[0].lon, GLOBUS_R * 1.06));
  // die anderen Orte: Standardpunkt, der neue erst bei Ankunft (bis feststeht, was sie werden)
  for(let i = 1; i < r.length; i++){ if(i === r.length - 1 && anteil < 1) continue; if(ORTE[r[i]].symbol !== 'haus') punkt(ORTE[r[i]], 0xffd23f, false); }
  // Joshis Gesicht wandert an der Spitze des Fadens mit, am Ziel bleibt es dort
  gl.gesicht.visible = !!spitze;
  if(spitze) gl.gesicht.position.copy(spitze).normalize().multiplyScalar(GLOBUS_R * 1.09);
}
function kamera(k){
  const a = ORTE[gl.von], b = ORTE[gl.nach], e = k * k * (3 - 2 * k);
  const v = latLon(a.lat + (b.lat - a.lat) * e, a.lon + (b.lon - a.lon) * e, 1).normalize();
  gl.kam.position.copy(v).multiplyScalar(4.2 - 0.6 * Math.sin(Math.PI * e)); gl.kam.up.set(0, 1, 0); gl.kam.lookAt(0, 0, 0);
}
// Schwarzblende: 0,9 s ab, mitte(), nach dauer s wieder auf
let schwarzEl = null;
function schwarz(dauer, mitte){
  if(!schwarzEl){ schwarzEl = document.createElement('div');
    schwarzEl.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;transition:opacity .8s;pointer-events:none;z-index:40;';
    document.body.appendChild(schwarzEl); }
  schwarzEl.style.opacity = '1';
  setTimeout(() => { if(mitte) mitte(); if(dauer !== null) setTimeout(() => { schwarzEl.style.opacity = '0'; }, (dauer || 0.1) * 1000); }, 900);
}
// Ton: alles, was an audioCtx haengt, gemeinsam aus- und einblenden (wie der Master-Gain in Trip to Japan)
function tonBlende(ziel, dauer){
  if(typeof audioCtx === 'undefined' || !audioCtx || !story.master) return;
  const g = story.master.gain, t = audioCtx.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(ziel, t + dauer);
}
function globusReise(nach, fertig){
  if(gl.aktiv || gl.unterwegs) return;
  gl.unterwegs = true;
  bauen();
  tonBlende(0, 0.9);
  if(window.speechSynthesis) window.speechSynthesis.cancel();        // keine Ansage laeuft in den Globus hinein
  schwarz(0.1, () => {
    for(const id of ['radar', 'gyro', 'hud', 'pad']){ const e = document.getElementById(id); if(e) e.style.visibility = 'hidden'; }
    document.body.classList.add('globus');                            // Etappen-Anzeigen (Radar, Schub, Kompass) aus
    gl.von = story.reise[story.reise.length - 1]; gl.nach = nach; story.reise.push(nach);
    gl.aktiv = true; gl.t = 0; gl.fertig = fertig || null; gl.ende = false;
    zeichnen(0); kamera(0);
    text(ORTE[nach].name); gl.textEl.style.opacity = '0';
  });
}
story.globusReise = globusReise;
story.globusAktiv = () => gl.aktiv || !!gl.unterwegs;
// Ortsname unten (fuer Vorlesende; der Spieler sieht vor allem den Faden)
function text(t){
  if(!gl.textEl){ gl.textEl = document.createElement('div');
    gl.textEl.style.cssText = 'position:absolute;left:0;right:0;bottom:12%;text-align:center;color:#fff;font:600 30px system-ui,sans-serif;'
      + 'text-shadow:0 2px 8px #000;pointer-events:none;z-index:30;transition:opacity .6s;';
    document.body.appendChild(gl.textEl); }
  gl.textEl.textContent = t || '';
}
function update(dt){
  gl.t += dt;
  const k = Math.min(1, gl.t / GLOBUS_FAHRT);
  zeichnen(k); kamera(k);
  if(gl.t > 0.6) gl.textEl.style.opacity = '1';
  if(gl.t > GLOBUS_FAHRT + GLOBUS_HALT && !gl.ende){
    gl.ende = true;
    schwarz(null, () => {
      const f = gl.fertig;
      if(f){ gl.aktiv = false; gl.unterwegs = false; gl.textEl.style.opacity = '0'; document.body.classList.remove('globus'); f(); schwarzEl.style.opacity = '0'; tonBlende(1, 1.5); return; }
      // Etappe komplett zuruecksetzen: neu laden (der Bildschirm bleibt schwarz, bis der Startbildschirm kommt)
      try { sessionStorage.setItem('geheimland.reise', JSON.stringify(story.reise)); } catch(e){}
      location.reload();
    });
  }
}
// Am Ziel des ersten Falls (segeln.js ruft story.zielErreicht): kurzer Satz, dann der Globus
// Sofort die Blende (Live-Befund: vorher erst der Satz, und waehrenddessen segelte man weiter); der Satz kommt im Globus
story.zielErreicht = function(){
  globusReise(1);
  setTimeout(() => story.sprich(['Du bist angekommen!']), 2200);       // echte Zeit: im Globus laufen die Story-Timer nicht
};

// ---- Einhaengen: waehrend des Globus zeichnet nur er, das Spiel steht ------------------------------------------
function hookGlobus(){
  // Master-Gain zwischen alle Toene der Engine und die Lautsprecher (Vorbild Trip to Japan hookMaster)
  const initOrig = initAudio;
  initAudio = function(){
    const neu = !audioCtx, r = initOrig.apply(this, arguments);
    if(neu && audioCtx && !story.master){
      const echt = audioCtx.destination, g = audioCtx.createGain(); g.connect(echt);
      story.master = { gain: g.gain };
      Object.defineProperty(audioCtx, 'destination', { get: () => g, configurable: true });
    }
    return r;
  };
  const loopOrig = loop;
  let tVor = performance.now();
  loop = function(){
    const jetzt = performance.now(), dt = Math.min(0.1, (jetzt - tVor) / 1000); tVor = jetzt;
    if(gl.aktiv){
      // Pause auch hier: der Globus steht. readInput laeuft, damit D-Pad hoch / H die Pause wieder beenden
      const p = story.pause && story.pause();
      if(p !== gl.pause){ gl.pause = p; if(story.pauseWechsel) story.pauseWechsel(p); }
      readInput();
      if(!p) update(dt);
      gl.kam.aspect = innerWidth / innerHeight; gl.kam.updateProjectionMatrix();
      renderer.render(gl.szene, gl.kam);
      requestAnimationFrame(loop);
      return;
    }
    return loopOrig.apply(this, arguments);
  };
  // Anzeigen der Etappe (Radar, Schub, Kompass: data-etappe-hud) waehrend des Globus aus
  const st = document.createElement('style');
  st.textContent = 'body.globus [data-etappe-hud] { visibility: hidden !important; }';
  document.head.appendChild(st);
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookGlobus(); };
})();
