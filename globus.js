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

// Orte (Platzhalter, bis die Geschichte die echten Einsatzorte hat): die Insel ist der Start
const ORTE = [
  { name: 'Die Insel', lat: 54.5, lon: 8.3 },
  { name: 'Fall 1', lat: 57.0, lon: 2.0 },
];
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
    out.push(v.normalize().multiplyScalar(GLOBUS_R * (1.01 + 0.06 * Math.sin(Math.PI * t))));
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
  // Erde: eigene Kugel, Textur aus dem Erd-GLB der Engine (die Karte liegt dort auf dem Kopf – wie in Trip to Japan)
  gl.erde = new THREE.Mesh(new THREE.SphereGeometry(GLOBUS_R, 64, 48), new THREE.MeshLambertMaterial({ color: 0x3a6ea5 }));
  gl.szene.add(gl.erde);
  if(window.EARTH_GLB) story.ladeGlb(window.EARTH_GLB, 'Globus', (g) => {
    g.scene.traverse(o => { if(o.isMesh && o.material && o.material.map && !gl.erde.material.map){
      const tex = o.material.map; tex.flipY = !tex.flipY; tex.needsUpdate = true;
      gl.erde.material.map = tex; gl.erde.material.color.set(0xffffff); gl.erde.material.needsUpdate = true; } });
  });
  gl.punkte = new THREE.Group(); gl.erde.add(gl.punkte);
  gl.faden = new THREE.Group(); gl.erde.add(gl.faden);
}
function punkt(ort, farbe, gross){
  const m = new THREE.Mesh(new THREE.SphereGeometry(gross ? 0.028 : 0.02, 16, 12), new THREE.MeshBasicMaterial({ color: farbe }));
  m.position.copy(latLon(ort.lat, ort.lon, GLOBUS_R * 1.012)); gl.punkte.add(m);
}
function zeichnen(anteil){
  for(const o of [...gl.punkte.children, ...gl.faden.children]) story.entsorgen(o);   // jedes Bild neu: alte Stuecke freigeben
  const r = story.reise;
  for(let i = 1; i < r.length; i++){
    const pts = bogen(ORTE[r[i - 1]], ORTE[r[i]], 48), n = Math.max(2, Math.round(pts.length * (i === r.length - 1 ? anteil : 1)));
    gl.faden.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0, n)), Math.max(4, n * 2), 0.009, 8, false),
      new THREE.MeshBasicMaterial({ color: 0xe02020 })));
  }
  punkt(ORTE[0], 0x3b82ff, true);                                     // Start blau
  for(let i = 1; i < r.length; i++){ if(i === r.length - 1 && anteil < 1) continue; punkt(ORTE[r[i]], 0xffd23f, false); }   // Orte gelb, neuer erst bei Ankunft
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
story.zielErreicht = function(){
  story.sprich(['Du bist angekommen!'], () => globusReise(1));
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
      update(dt);
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
