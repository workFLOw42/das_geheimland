// Das Geheimland – die Heimkehr und das Ende von Spiel 1 (Live-Wuensche 28.10.2026, Konzept „Der Rahmen: alles ist ein Traum“,
// Schritte 3-4). Laedt nach heimflug.js. Nach dem Heimflug (heimflug.js: Spielstand mit heimkehr, Globus, Neuladen) ist das wieder
// Etappe 1 auf Joshis Insel – aber ohne ihren Anfang: keine Ausruestung auf dem Tisch (die ist im Rucksack), kein Elch-Funkruf, kein
// Boot; nur das, was die Heimkehr braucht.
//   Die Rakete landet schraeg hinter der Huette (360-Grad-Schwenk), ein Y darueber; Y = aussteigen, Fuchsi springt hinterher.
//   Detektivhut und X zeigen nur das Funkgeraet: "Hallo Joshi!" alle 15 s (erst nach X), bis Joshi rangeht. Dann der Funkspruch des
//   Eichhoernchens (mit den Namen der Aliens als Piep-Bloep-Toene). Die Huette leuchtet auf: "Schau doch mal in deine Huette."
//   Drinnen haengen die Erinnerungsfotos (grosse Abzuege) und die gemalten Skizzen, im Regal stehen die Trophaeen. Y am Bett:
//   Joshi legt sich hin, der Traum-Uebergang -> er wacht in seinem Zimmer auf (kinderzimmer.js zimmerOutro), alles ist noch da.
//   Y: aufstehen, ein paar Sekunden laufen, dann der Abspann.
(function(){
'use strict';
const story = window.STORY;
story.heimkehr = !!(story.spielstand && story.spielstand.heimkehr && story.etappe === 1);
const hk = story.heimkehrZustand = { phase: null, t: 0, rakete: null, funkT: 0, funk: null, funkFertig: false, glowT: 0, warDrin: false, bettInter: null, yJet: null, ab: null };
const T = {
  hallo: ['Hallo Joshi!'],
  funk1: ['Hallo Joshi. Ich wollte mich ganz herzlich bei dir bedanken.', 'Du hast Weihnachten gerettet, und dank dir hatten wir das tollste Fest der Welt – ach quatsch, des ganzen Universums!'],
  funk2: ['und'],
  funk3: ['haben uns herzlich zu sich auf ihren Planeten eingeladen. Also besuch sie ruhig mal, wenn du wieder hier bist.', 'Und mich kannst du auch jederzeit besuchen. Bis bald!'],
  huette: ['Schau doch mal in deine Hütte.'],
  hAussteigen: ['Steig mit Y aus.'],
  hUmschauen: ['Schau dich mal um. Drück X.'],
  hFunk: ['Geh zum Funkgerät und drück Y.'],
  hBett: ['Leg dich doch in dein Bett. Drück dort Y.'],
  abspann: ['Joshi hat seinen ersten kniffligen Fall gelöst und viele neue Freunde gefunden.', 'Wir sind gespannt, was er beim nächsten Mal erleben wird.'],
};
const RAKETE_H = 9;

// ---- Landung --------------------------------------------------------------------------------------------------------------
story.heimkehrLos = function(){
  const H = story.insel && story.insel.huette; if(!H || !eva || !window.RAKETE_GLB || !story.ladeGlb) return;
  const x = H.x - 7.5, z = H.z - 8.5, y = evaFootY(x, z);                                                         // global-ok: Engine
  hk.ziel = { x, y, z }; hk.phase = 'laden';
  eva.group.visible = false; if(story.fuchs && story.fuchs.obj){ story.fuchs.obj.visible = false; story.fuchs.aktiv = false; }
  hk.halte = eva.group.position.clone();
  story.ladeGlb(window.RAKETE_GLB, 'Rakete', (gl) => {
    const o = gl.scene; o.traverse(m => { if(m.isMesh){ m.frustumCulled = false; m.castShadow = true; } }); o.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(o), sz = bb.getSize(new THREE.Vector3()), k = RAKETE_H / Math.max(0.01, sz.y), c = bb.getCenter(new THREE.Vector3());
    o.scale.multiplyScalar(k); o.position.set(-c.x * k, -bb.min.y * k, -c.z * k);
    const g = new THREE.Group(); g.add(o); g.position.set(x, y + 140, z); story.welt(1).add(g); hk.rakete = g; hk.r = Math.max(sz.x, sz.z) * k / 2;
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffa630, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.rotation.x = Math.PI; fl.position.y = -1.2; fl.userData.deko = true; g.add(fl); hk.flamme = fl;
    hk.phase = 'sinken'; hk.t = 0;
  });
};
function landungTakt(dt){
  if(hk.phase !== 'sinken' && hk.phase !== 'gelandet') return;
  hk.t += dt; if(eva && hk.halte) eva.group.position.copy(hk.halte);
  const Z = hk.ziel, g = hk.rakete;
  if(hk.phase === 'sinken'){
    const u = Math.min(1, hk.t / 9), h = 140 * Math.pow(1 - u, 2.2);
    g.position.y = Z.y + h; hk.flamme.scale.set(1, 0.6 + (1 - u) * 0.8, 1);
    if(u >= 1){ hk.phase = 'gelandet'; hk.t = 0; hk.flamme.visible = false; }
  }
  if(hk.phase === 'gelandet'){
    if(!hk.yJet && story.knopfTextur){ hk.yJet = new THREE.Sprite(new THREE.SpriteMaterial({ map: story.knopfTextur('Y'), transparent: true, depthTest: false, depthWrite: false })); hk.yJet.renderOrder = 999; hk.yJet.scale.setScalar(1.4); story.welt(1).add(hk.yJet); }
    if(hk.yJet){ hk.yJet.visible = story.yErlaubt();   // Y-Standard (story.js)
      hk.yJet.position.set(Z.x, Z.y + RAKETE_H + 1.2 + Math.sin(hk.t * 3) * 0.12, Z.z); }
    if(yGedrueckt()) aussteigen();
  }
}
let yVor = true;
function yGedrueckt(){
  let y = typeof keys !== 'undefined' && !!keys['KeyY'];                                                        // global-ok: Engine
  for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])) if(gp && gp.buttons[3] && gp.buttons[3].pressed) y = true;
  const kante = y && !yVor; yVor = y; return kante;
}
story.heimkehrAussteigen = () => aussteigen();
function aussteigen(){
  if(hk.phase !== 'gelandet') return; hk.phase = 'zuFuss'; hk.halte = null; if(hk.yJet) hk.yJet.visible = false;
  const Z = hk.ziel, H = story.insel.huette, dx = H.x - Z.x, dz = H.z - Z.z, l = Math.hypot(dx, dz) || 1;
  // seitlich neben der Rakete, Blick zur Huette (Live-Befund 29.10.2026: vor ihr stand sie genau in seinem Ruecken – die Kamera hing
  // ~9 m hinter ihm in der Rakete)
  const x = Z.x - dz / l * (hk.r + 3.5) + dx / l * 1.5, z = Z.z + dx / l * (hk.r + 3.5) + dz / l * 1.5;
  eva.group.position.set(x, evaFootY(x, z), z); eva.yaw = Math.atan2(-(H.x - x), -(H.z - z)); eva.group.rotation.y = eva.yaw; eva.group.visible = true;   // global-ok: Engine
  evaOrbit = 0; evaPitch = 0; if(typeof snapCamera === 'function') snapCamera();                                    // global-ok: Engine
  if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: x + Math.cos(eva.yaw) * 1.3, z: z - Math.sin(eva.yaw) * 1.3, blick: eva.yaw, modus: 'streifen', sitzt: false, warte: 1 });
  if(story.fuchs && story.fuchs.obj) story.fuchs.obj.visible = true;
  hk.funkT = 4;                                                                                                      // der erste Ruf kurz danach
  const f = funkObj(); if(f){ f.entdeckt = true; f.frei = true; }                 // ohne X (Live-Wunsch: draussen gibt es nichts mehr zu entdecken)
}
// Kamera bei der Landung: einmal 360 Grad um die Rakete, am Ende vor ihr
function landungKamera(){
  if(!(hk.phase === 'sinken' || hk.phase === 'gelandet') || !hk.rakete) return false;
  const Z = hk.ziel, u = hk.phase === 'sinken' ? Math.min(1, hk.t / 9) : 1, k = u * u * (3 - 2 * u), a = Math.PI * 0.25 + k * Math.PI * 2;
  const p = hk.rakete.position, d = 30 - k * 6;
  camera.position.set(Z.x + Math.sin(a) * d, Z.y + 5 + (1 - k) * 25, Z.z + Math.cos(a) * d);                       // global-ok: Engine
  camera.up.set(0, 1, 0); camera.lookAt(p.x, p.y + RAKETE_H * 0.5, p.z);                                           // global-ok: Engine
  return true;
}

// ---- Funkgeraet und Huette -----------------------------------------------------------------------------------------------
const funkObj = () => story.interListe && story.interListe.find(o => o.name === 'Funkgerät' && o.welt === 1);
function funkY(o){
  if(o.spricht || hk.funkFertig) return; o.spricht = true; hk.funk = 'spricht';
  const beep = story.piepBloep || ((f, n) => story.spaeter(0.6, n));
  story.sprich(T.funk1, () => beep('pbp', () => story.sprich(T.funk2, () => beep('bpb', () => story.sprich(T.funk3, () => {
    o.spricht = false; hk.funkFertig = true; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
    hk.glowT = 0.01; story.einleitung(1.2, T.huette);
  }, 'funk:eich')), 'funk:eich')), 'funk:eich');
}
function funkTakt(dt){
  if(hk.phase !== 'zuFuss' || hk.funkFertig) return;
  const o = funkObj(); if(!o) return;
  if(o.aktion !== funkY){ o.aktion = funkY; o.text = null; o.danach = null; o.einmal = false; }
  if(hk.funk === 'spricht' || !o.entdeckt){ hk.funkT = Math.min(hk.funkT, 2); return; }
  hk.funkT -= dt; if(hk.funkT <= 0){ hk.funkT = 15; story.sprich(T.hallo, null, 'funk:eich'); }
}
// Nur, was die Heimkehr braucht: alle anderen Dinge der Insel ruhen (o.aus)
function nurHeimkehr(){
  if(!story.interListe) return;
  for(const o of story.interListe){ if(o.welt !== 1) continue;
    o.aus = !((o.name === 'Funkgerät' && hk.phase === 'zuFuss') || o === hk.bettInter || o.name === 'Aufstehen'); }
}
// Die Huette leuchtet auf (bis Joshi drin ist); drinnen einmal: Erinnerungen an den Waenden, Trophaeen im Regal, das Bett
function huetteTakt(dt){
  if(hk.phase !== 'zuFuss') return;
  const I = story.innen;
  if(I && I.drin && I.gruppe && !hk.warDrin){
    hk.warDrin = true; hk.glowT = 0;
    // die Bilder haengen schon (notizbuch.js huetteSetzen, seit 31.10.2026) – huetteVonSeiten setzt nur noch die Trophaeen nach
    if(story.huetteVonSeiten) story.huetteVonSeiten();
    const B = I.bett, base = I.gruppe.position;
    hk.bettInter = story.interaktion(B, { name: 'Bett', welt: 1, innen: true, x: base.x + B.position.x + 1.0, z: base.z + B.position.z + 0.4, r: 0.6, yx: base.x + B.position.x, yz: base.z + B.position.z, yHoehe: 1.2,
      aktion: (o) => { o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; story.bettLegen(B, base, null, () => story.traumUebergang(() => aufwachenImZimmer())); } });
    if(hk.bettInter) hk.bettInter.entdeckt = true;
  }
  if(hk.funkFertig && hk.glowT > 0 && !hk.warDrin){ hk.glowT -= dt; if(hk.glowT <= 0){ hk.glowT = 3.5; const h = story.interListe.find(o => o.name === 'Hütte'); if(h){ h.glow = h.glowDauer = 2.4; } } }
}
// Nach dem Traum: im Kinderzimmer, alles ist noch da; aufstehen, laufen, Abspann
function aufwachenImZimmer(){
  if(story.innen){ story.innen.drin = false; if(story.innen.gruppe) story.innen.gruppe.visible = false; }
  if(story.zimmerOutro) story.zimmerOutro(abspann); else abspann();
}
story.heimkehrHinweis = function(){
  if(hk.phase === 'gelandet') return T.hAussteigen;
  if(hk.phase !== 'zuFuss') return null;
  if(!hk.funkFertig) return T.hFunk;
  if(!hk.warDrin) return T.huette;
  if(story.innen && story.innen.drin) return T.hBett;
  return T.huette;
};

// ---- Abspann (wie im SFG-Spiel, ohne Statistiken) -----------------------------------------------------------------------------
function abspann(){
  if(hk.ab) return;
  if(story.zimmerAbspannKamera) story.zimmerAbspannKamera(true);
  story.sprich(T.abspann);
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;inset:0;z-index:58;pointer-events:none;overflow:hidden;color:#fff;font-family:system-ui,sans-serif;'
    + 'text-shadow:0 2px 6px rgba(0,0,0,.75);background:linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.2) 40%,rgba(0,0,0,.45));opacity:0;transition:opacity 1.5s';
  const roll = document.createElement('div');
  roll.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);top:100%;display:flex;flex-direction:column;align-items:center;text-align:center;';
  const z = (t, g) => '<div style="font-size:' + (g || 20) + 'px;margin:4px 0;opacity:.92">' + t + '</div>', u = (t) => '<div style="font-size:24px;font-weight:700;margin:40px 0 10px;color:#ffd23f">' + t + '</div>';
  roll.innerHTML = '<div style="font-size:48px;font-weight:800;margin-bottom:6px">🌙 Das Geheimland</div>'
    + '<div style="font-size:21px;opacity:.88;margin-bottom:24px">Joshi hat seinen ersten kniffligen Fall gelöst!</div>'
    + u('Mit dabei') + z('Joshi') + z('Fuchsi') + z('die Tiere der Waldinsel') + z('der Gorilla') + z('das Lama') + z('das Eichhörnchen') + z('Samu und Barki') + z('Piep-Blöp-Piep und Blöp-Piep-Blöp')
    + u('Danke') + z('allen Künstlerinnen und Künstlern der 3D-Modelle und Töne', 18) + z('(Namen und Lizenzen: README)', 16)
    + '<div style="font-size:40px;font-weight:800;margin-top:140px;color:#ffd23f">Für Joshi!</div>'
    + '<div style="font-size:30px;font-weight:700;margin-top:6px">Hab’ dich lieb!</div>';
  const sig = document.createElement('div');
  sig.style.cssText = 'position:absolute;right:18px;bottom:14px;font-size:15px;opacity:.85;font-weight:600;text-align:right';
  sig.innerHTML = '<div style="font-size:13px;font-weight:500;opacity:.9;margin-bottom:6px">Weitere Infos siehe:<br>github.com/workFLOw42/das_geheimland</div>by workFLOw42 ©2026';
  el.appendChild(roll); el.appendChild(sig); document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  // wie im SFG-Spiel (Spiel_SFG/abspann.js, Live-Wunsch 29.10.2026): er bleibt stehen, sobald alles zu sehen ist – das Ende knapp ueber
  // dem B; passt er nicht ins Bild, wird er kleiner. Dann erscheint unten mittig das B, damit endet er
  const h = roll.offsetHeight, s = Math.min(1, (innerHeight - 130) / Math.max(1, h));
  if(s < 1){ roll.style.transformOrigin = 'top center'; roll.style.transform = 'translateX(-50%) scale(' + s.toFixed(3) + ')'; }
  hk.ab = { el, roll, t: 0, h, ziel: Math.max(16, innerHeight - 110 - h * s) };
}
function abspannB(){
  const A = hk.ab, k = A.b = document.createElement('div');
  k.style.cssText = 'position:absolute;left:50%;bottom:26px;transform:translateX(-50%);width:58px;height:58px;border-radius:50%;background:#e8352b;'
    + 'border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.45);color:#fff;font:800 32px system-ui,sans-serif;display:flex;align-items:center;'
    + 'justify-content:center;opacity:0;transition:opacity .6s;text-shadow:none';
  k.textContent = 'B'; A.el.appendChild(k); requestAnimationFrame(() => { k.style.opacity = '1'; });
  const taste = (e) => { if(e.code !== 'KeyB' && e.code !== 'Escape') return; e.preventDefault(); e.stopPropagation(); if(!e.repeat) abspannEnde(); };
  A.taste = taste; addEventListener('keydown', taste, true);
  let pB = true;                                                    // erst nach dem Loslassen zaehlen
  (function pad(){ if(A.ende) return;
    let b = false; for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])) if(gp && gp.buttons[1] && gp.buttons[1].pressed) b = true;
    if(b && !pB){ abspannEnde(); return; } pB = b; requestAnimationFrame(pad); })();
}
// B: abblenden, Spielstand dieser Sitzung loeschen, zurueck zum Start (neues Spiel)
function abspannEnde(){
  const A = hk.ab; if(!A || A.ende) return; A.ende = true; if(A.taste) removeEventListener('keydown', A.taste, true);
  const b = document.createElement('div'); b.style.cssText = 'position:absolute;inset:0;background:#000;opacity:0;z-index:59;transition:opacity 1.5s'; document.body.appendChild(b);
  requestAnimationFrame(() => { b.style.opacity = '1'; });
  setTimeout(() => { try { sessionStorage.removeItem('geheimland.stand'); } catch(e){} location.reload(); }, 2200);
}
story.heimkehrAbspann = abspann;
function abspannTakt(dt){
  const A = hk.ab; if(!A) return;
  A.t += dt; const top = Math.max(A.ziel, innerHeight - A.t * 42);   // ~42 px/s herein, dann bleibt er stehen
  A.roll.style.top = top + 'px';
  if(top <= A.ziel && !A.b) abspannB();
}

// ---- Takt und Einhaengen ------------------------------------------------------------------------------------------------------
let stimmeFertig = false;
function stimmeFrei(){ if(stimmeFertig || !window.speechSynthesis) return; stimmeFertig = true;
  window.speechSynthesis.cancel(); window.speechSynthesis.resume(); const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); }
if(story.heimkehr){ addEventListener('keydown', stimmeFrei, { once: true }); addEventListener('pointerdown', stimmeFrei, { once: true }); }
function takt(dt){
  if(story.heimkehr && !stimmeFertig) for(const gp of (navigator.getGamepads ? navigator.getGamepads() : [])) if(gp && gp.buttons.some(b => b.pressed)) stimmeFrei();
  if(story.heimkehr){ nurHeimkehr(); landungTakt(dt); funkTakt(dt); huetteTakt(dt); }
  abspannTakt(dt);
}
function hook(){
  const camOrig = updateCamera;                                                                                    // global-ok: Engine
  updateCamera = function(){ if(story.heimkehr && landungKamera()) return; return camOrig.apply(this, arguments); };
  const loopOrig = loop; let tv = 0;                                                                               // global-ok: Engine
  loop = function(){ const t = performance.now(), dt = tv ? Math.min(0.1, (t - tv) / 1000) : 0; tv = t; if(!(story.pause && story.pause())) takt(dt); return loopOrig.apply(this, arguments); };
}
const startVorher = window.STORY_START;
window.STORY_START = function(){ hook(); if(startVorher) return startVorher.apply(this, arguments); };
})();
