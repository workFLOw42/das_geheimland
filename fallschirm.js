// Das Geheimland – Fallschirmsprung als Baustein (Live-Wunsch 22.10.2026: "wie beim SFG-Spiel"; gebraucht beim Einstieg in
// die Lama-Etappe, Konzept Abschnitt 7 / Etappe 4: ueber der Wueste mit B abspringen, der Autopilot bringt das Flugzeug
// zurueck – das wird nur gesagt, nicht gezeigt). Laedt nach story.js, vor der Engine.
// Uebernommen aus dem Finale von Trip to Japan (finale.js: abspringen, schirmAuf, sprungSchritt, freiflugSchritt/Pose,
// fahrtwind, Sprung-Kamera mit Seitenblick) – dort laeuft es seit Wochen. Unterschiede:
//   - eigene Namen und eigener Zustand (story.fallschirm), damit nichts mit der Engine (ejectSeat/updateParachute) oder dem
//     Finale kollidiert
//   - Tricks (Rolle, Salto) gehen wie dort mit dem rechten Stick bzw. Q/E und I/K, werden aber nicht gezaehlt oder angesagt
//   - der Schirm geht SCHIRM_AUF m ueber dem Landeplatz auf (Engine FALLSCHIRM_AUF, 75 m – gilt in beiden Spielen)
//   - gelandet steht Joshi zu Fuss da (eigene Figur, nicht evaExit: die Etappen sperren das Aussteigen dort, wo kein Flugzeug
//     landen darf). Fuchsi ist dann von selbst wieder bei ihm (story.js updateFuchs: da, solange Joshi zu Fuss ist)
// Aufruf: story.fallschirmSprung({ welt, lande: { x, z }, boden(x, z) -> y, anker: { x, z }, fertig() })
//   lande  – Landepunkt (der Gleitpfad bringt ihn genau hin; der linke Stick versetzt ihn um bis zu LANDE_FREI m)
//   boden  – Bodenhoehe (Standard evaFootY)
//   anker  – wo das Flugzeug danach "steht" (eva.planeAt; Standard: der Landepunkt)
//   fertig – nach der Landung (Joshi zu Fuss)
(function(){
'use strict';
const story = window.STORY;
// m ueber der Landestelle: der Schirm geht von selbst auf – gemeinsamer Wert der Engine (FALLSCHIRM_AUF, 75 m), gilt auch in
// Trip to Japan
const SCHIRM_AUF = typeof FALLSCHIRM_AUF !== 'undefined' ? FALLSCHIRM_AUF : 75;   // global-ok: Engine
const FALL_MAX = 55, SINK_SCHIRM = 7;          // m/s: freier Fall hoechstens, am Schirm
const GLEIT_FALL = 30, GLEIT_SCHIRM = 16;      // m/s waagerecht hoechstens (zum Landepunkt)
const LANDE_FREI = 30;           // m: so weit verschiebt der linke Stick den Landepunkt
const FLUG_WEG = 14;             // s, dann ist die Flugzeug-Kopie weg
const ZIEH_AB = 60;              // m ueber dem Landeplatz: ab hier zieht der Schirm sanft genau dorthin
const _X = new THREE.Vector3(1, 0, 0), _Y = new THREE.Vector3(0, 1, 0), _Z = new THREE.Vector3(0, 0, 1);
const fs = story.fallschirm = { schritt: null, g: null, mitte: null, v: new THREE.Vector3(), yaw: 0, t: 0, opt: null, flieger: null,
  lande: null, rolle: 0, salto: 0 };
story.fallschirmAktiv = () => !!fs.schritt;

// ---- Eingabe (wie finale.js stick / rStick) ----------------------------------------------------------------------------
function stick(){
  let x = (keys['ArrowRight'] ? 1 : 0) - (keys['ArrowLeft'] ? 1 : 0), y = (keys['ArrowDown'] ? 1 : 0) - (keys['ArrowUp'] ? 1 : 0);   // global-ok: Engine
  const gp = gamepadIndex !== null ? navigator.getGamepads()[gamepadIndex] : null;   // global-ok: Engine
  if(gp){ const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0; if(Math.abs(ax) > 0.15) x = ax; if(Math.abs(ay) > 0.15) y = ay; }
  return { x, y };
}
function rStick(){
  let x = (keys['KeyE'] ? 1 : 0) - (keys['KeyQ'] ? 1 : 0), y = (keys['KeyK'] ? 1 : 0) - (keys['KeyI'] ? 1 : 0);   // global-ok: Engine
  const gp = gamepadIndex !== null ? navigator.getGamepads()[gamepadIndex] : null;   // global-ok: Engine
  if(gp){ const rt = gp.buttons[7] ? gp.buttons[7].value : 0, lt = gp.buttons[6] ? gp.buttons[6].value : 0;
    if(Math.abs(rt - lt) > 0.1) x = rt - lt; const ay = gp.axes[3] || 0; if(Math.abs(ay) > 0.25) y = ay; }
  return { x, y };
}
// ---- Freiflug: Rolle und Salto (Tricks), losgelassen richtet er sich auf (wie finale.js) -----------------------------------
function freiflugSchritt(dt){
  const rs = rStick();
  fs.rolle -= rs.x * 4.5 * dt;                               // ~1,4 s je Rolle
  fs.salto += rs.y * 3.5 * dt;                               // R-Stick vor (negativ) = Kopf runter / abtauchen
  if(!rs.x && !rs.y){ const z = w => Math.round(w / (2 * Math.PI)) * 2 * Math.PI, f = Math.min(1, dt * 2.5);
    fs.rolle += (z(fs.rolle) - fs.rolle) * f; fs.salto += (z(fs.salto) - fs.salto) * f; }
}
// Figur mit der Koerpermitte auf fs.mitte: Blickrichtung yaw, Salto um die Querachse, Rolle um die Laengsachse ('fly' liegt
// flach, Kopf voraus)
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _fm = new THREE.Vector3();
function freiflugPose(){
  const g = fs.g; g.quaternion.setFromAxisAngle(_Y, fs.yaw).multiply(_q1.setFromAxisAngle(_X, fs.salto)).multiply(_q2.setFromAxisAngle(_Z, fs.rolle));
  _fm.set(0, 0.8, 0).applyQuaternion(g.quaternion); g.position.copy(fs.mitte).sub(_fm);
}
// ---- Fahrtwind: duenne helle Striche vor/neben der Kamera, ziehen nach hinten (wie finale.js fahrtwind) ----------------
let wind = null;
function windBauen(){
  if(wind) return wind;
  const N = 40, pos = new Float32Array(N * 2 * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, fog: false }));
  m.frustumCulled = false; m.userData.deko = true; scene.add(m);   // global-ok: Engine-Szene (folgt der Kamera)
  const t = []; for(let i = 0; i < N; i++) t.push({ x: 0, y: 0, z: 0, life: 0 });
  return wind = { m, pos, t };
}
const _wd = new THREE.Vector3(), _wa = new THREE.Vector3(), _wb = new THREE.Vector3();
function fahrtwind(dt){
  const w = windBauen(), v = fs.v.length(), st = Math.max(0, Math.min(1, (v - 5) / 15));
  w.m.visible = true; w.m.material.opacity = 0.55 * st;
  if(v < 0.5) return;
  _wd.copy(fs.v).multiplyScalar(1 / v);
  _wa.crossVectors(_wd, Math.abs(_wd.y) > 0.9 ? _X : _Y).normalize(); _wb.crossVectors(_wd, _wa).normalize();
  const c = camera.position;                                 // global-ok: Engine
  w.t.forEach((s, i) => {
    s.life -= dt;
    if(s.life <= 0){ s.life = 0.25 + Math.random() * 0.3;
      const vor = 8 + Math.random() * 14, a = Math.random() * 6.28, r = 3 + Math.random() * 4, qa = Math.cos(a) * r, qb = Math.sin(a) * r * 0.7;
      s.x = c.x + _wd.x * vor + _wa.x * qa + _wb.x * qb; s.y = c.y + _wd.y * vor + _wa.y * qa + _wb.y * qb; s.z = c.z + _wd.z * vor + _wa.z * qa + _wb.z * qb; }
    const k = v * 1.2 * dt; s.x -= _wd.x * k; s.y -= _wd.y * k; s.z -= _wd.z * k;
    s.x += fs.v.x * dt; s.y += fs.v.y * dt; s.z += fs.v.z * dt;
    const len = 0.8 + v * 0.06; w.pos.set([s.x, s.y, s.z, s.x + _wd.x * len, s.y + _wd.y * len, s.z + _wd.z * len], i * 6);
  });
  w.m.geometry.attributes.position.needsUpdate = true;
}
function windAus(){ if(wind){ wind.m.visible = false; wind.m.material.opacity = 0; } }

// ---- Ablauf ------------------------------------------------------------------------------------------------------------
story.fallschirmSprung = function(opt){
  if(fs.schritt || eva || state.onGround) return false;       // global-ok: Engine
  fs.opt = Object.assign({ boden: (x, z) => evaFootY(x, z) }, opt || {});   // global-ok: Engine
  fs.schritt = 'fall'; fs.t = 0; fs.rolle = 0; fs.salto = 0;
  const w = fs.opt.welt !== undefined ? story.welt(fs.opt.welt) : scene;   // global-ok: Engine-Szene als Rueckfall
  // Flugzeug: eine Kopie fliegt geradeaus weiter (der Autopilot bringt es zurueck), das echte ist weg
  const f = planeGroup.clone(true); w.add(f); planeGroup.visible = false;   // global-ok: Engine
  fs.flieger = { g: f, v: state.vel.clone(), t: 0 };
  const e = new THREE.Euler().setFromQuaternion(state.quat, 'YXZ'), back = new THREE.Vector3(0, 0, 1).applyQuaternion(state.quat);
  fs.yaw = e.y;
  const fig = makeAstronaut(); w.add(fig);                   // global-ok: Engine (story.js hookFigur: Joshis Figur)
  fig.position.set(state.pos.x + back.x * 8, state.pos.y - 3, state.pos.z + back.z * 8);
  fs.g = fig; fs.mitte = fig.position.clone().add(new THREE.Vector3(0, 0.8, 0));
  fs.v.copy(state.vel).multiplyScalar(0.6); fs.v.y = 0;
  const L = fs.opt.lande || { x: fs.mitte.x, z: fs.mitte.z }; fs.lande = { x: L.x, z: L.z, sx: 0, sz: 0 };
  state.throttle = 0;
  if(story.figurAnim) story.figurAnim('fly', 0.2);
  return true;
};
function schirmAuf(){
  if(fs.schritt !== 'fall') return;
  fs.schritt = 'schirm';
  const w = fs.g.parent, g = makeParachute();                // global-ok: Engine (Schirm mit Joshi darunter)
  g.position.copy(fs.mitte); g.position.y -= 0.8;
  w.remove(fs.g); w.add(g); fs.g = g; fs.mitte = null; fs.rolle = 0; fs.salto = 0; windAus();
  if(story.figurAnim) story.figurAnim('hang', 0.3);
  fs.v.y = Math.max(fs.v.y, -20);
}
function schritt(dt){
  const f = fs.flieger;
  if(f){ f.t += dt; f.g.position.addScaledVector(f.v, dt); if(f.t > FLUG_WEG){ if(f.g.parent) f.g.parent.remove(f.g); fs.flieger = null; } }
  fs.t += dt;
  const O = fs.opt, st = stick(), p = fs.schritt === 'fall' ? fs.mitte : fs.g.position;
  // Gleitpfad: waagerecht genau so schnell zum Landepunkt, dass er bei der Landung erreicht ist; der linke Stick versetzt ihn
  const L0 = fs.lande, lx = L0.x + L0.sx, lz = L0.z + L0.sz;
  L0.sx += st.x * 6 * dt * Math.cos(fs.yaw); L0.sz -= st.x * 6 * dt * Math.sin(fs.yaw);
  const ls = Math.hypot(L0.sx, L0.sz); if(ls > LANDE_FREI){ L0.sx *= LANDE_FREI / ls; L0.sz *= LANDE_FREI / ls; }
  const hoehe = Math.max(1, p.y - O.boden(lx, lz));
  const sink = fs.schritt === 'fall' ? Math.max(15, -fs.v.y) : SINK_SCHIRM;
  const rest = fs.schritt === 'fall' ? (Math.max(0, hoehe - SCHIRM_AUF) / sink + SCHIRM_AUF / SINK_SCHIRM) : hoehe / sink;
  const ex = lx - p.x, ez = lz - p.z, ed = Math.hypot(ex, ez);
  const vSoll = Math.min(fs.schritt === 'fall' ? GLEIT_FALL : GLEIT_SCHIRM, ed / Math.max(1, rest));
  const zx = ed > 0.5 ? ex / ed * vSoll : 0, zz = ed > 0.5 ? ez / ed * vSoll : 0;
  if(fs.schritt === 'fall'){
    fs.yaw -= st.x * 1.3 * dt;
    const a = Math.min(1, dt * 0.8);
    fs.v.x += (zx - fs.v.x) * a; fs.v.z += (zz - fs.v.z) * a;
    fs.v.y = Math.max(-FALL_MAX, fs.v.y - 9.81 * dt);
    freiflugSchritt(dt);
    if(p.y - 0.8 - O.boden(lx, lz) < SCHIRM_AUF){ freiflugPose(); schirmAuf(); return; }   // ueber der Landestelle
    fahrtwind(dt);
  } else {
    if(ed > 2){ let dy = Math.atan2(-ex, -ez) - fs.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); fs.yaw += dy * Math.min(1, dt * 1.2); }
    const a = Math.min(1, dt * 1.5);
    fs.v.x += (zx - fs.v.x) * a; fs.v.z += (zz - fs.v.z) * a;
    fs.v.y += (-SINK_SCHIRM - fs.v.y) * a;
    fs.g.rotation.set(0, fs.yaw, Math.sin(fs.t * 1.3) * 0.06, 'YXZ');
  }
  p.addScaledVector(fs.v, dt);
  // am Schirm sanft genau ueber den Landeplatz ziehen (Live-Wunsch 23.10.2026: "etwas sanfter, etwas frueher beginnen"): ab ZIEH_AB m
  // Hoehe ganz leicht, zum Boden hin staerker (vorher erst ab 25 m und gleich kraeftig)
  if(fs.schritt === 'schirm'){ const h = p.y - O.boden(lx, lz), f = Math.max(0, Math.min(1, 1 - (h - 3) / ZIEH_AB));
    if(f > 0){ const k = Math.min(1, dt * (0.25 + 2.0 * f * f)); p.x += (lx - p.x) * k; p.z += (lz - p.z) * k; } }
  if(fs.schritt === 'fall') freiflugPose();
  // Engine-Kamera, Radar und Schatten folgen state.pos
  state.pos.copy(p); state.vel.copy(fs.v); state.onGround = false; state.throttle = 0;   // global-ok: Engine
  const gy = O.boden(p.x, p.z);
  if(p.y <= gy){ p.y = gy; gelandet(p); }
}
function gelandet(p){
  const w = fs.g.parent, x = p.x, z = p.z;
  if(w) w.remove(fs.g);
  fs.schritt = null; fs.g = null; windAus();
  // zu Fuss an der Landestelle – die Figur wie in evaExit der Engine, ohne deren Sperren
  const y = fs.opt.boden(x, z), a = fs.opt.anker || { x, z };
  state.pos.set(a.x, fs.opt.boden(a.x, a.z), a.z); state.vel.set(0, 0, 0); state.onGround = true; state.throttle = 0;   // global-ok: Engine
  const g = makeAstronaut();                                 // global-ok: Engine
  g.position.set(x, y, z); g.rotation.y = fs.yaw; scene.add(g);   // global-ok: wie evaExit
  eva = { group: g, vy: 0, onGround: true, yaw: fs.yaw, planeAt: new THREE.Vector3(a.x, state.pos.y, a.z) };   // global-ok: Engine
  if(typeof evaOrbit !== 'undefined'){ evaOrbit = 0; evaPitch = 0; }   // global-ok: Engine
  if(story.figurAnim) story.figurAnim('idle', 0.3);
  if(typeof snapCamera === 'function') snapCamera();         // global-ok: Engine
  const fertig = fs.opt.fertig; fs.opt = null; if(fertig) fertig();
}
// ---- Kamera beim Sprung (wie finale.js): hinter Joshi, im freien Fall hoeher; LB/RB = Seitenblick -------------------------
const _cp = new THREE.Vector3();
let seitK = 0, seitS = 1;
function kamera(){
  const p = fs.schritt === 'fall' ? fs.mitte : fs.g.position, fx = -Math.sin(fs.yaw), fz = -Math.cos(fs.yaw);
  if(sideView !== 0) seitS = sideView;                       // global-ok: Engine (LB/RB)
  seitK = sideView !== 0 ? Math.min(1, seitK + 0.12) : 0;
  if(seitK > 0.02){
    const rx = -fz, rz = fx, schirm = fs.schritt === 'schirm', w = schirm ? 12 : 7, hy = schirm ? 2 : 1;
    _cp.set(p.x + rx * w * seitS + fx * 1.5, p.y + hy + 1.5, p.z + rz * w * seitS + fz * 1.5);
    camera.position.lerp(_cp, Math.min(1, 0.1 + seitK * 0.3));   // global-ok: Engine
    camera.up.set(0, 1, 0); camera.lookAt(p.x + fx * 2, p.y + hy + 0.6, p.z + fz * 2);
    if(sideView !== 0) return;
  }
  // wie die Sprung-Kamera in Trip to Japan (finale.js), auf Joshi verkleinert (1,20 statt 1,55 m): in der Hoehe folgt sie SOFORT,
  // waagerecht weich (Live-Befund 23.10.2026: mit lerp in allen Richtungen blieb sie im freien Fall – bis 55 m/s – weit oben
  // zurueck, Joshi wurde winzig und es wirkte, als stuerze er ab); der Blick geht etwas unter ihn
  const fall = fs.schritt === 'fall', hinten = fall ? 6 : 11, hoch = fall ? 3.5 : 2.6;
  _cp.set(p.x - fx * hinten, p.y + hoch, p.z - fz * hinten);
  camera.up.set(0, 1, 0);                                        // global-ok: Engine
  const w = fall ? 0.35 : 0.12;                                  // im Fall gleitet er bis 30 m/s waagerecht: dort dichter dran
  camera.position.x += (_cp.x - camera.position.x) * w; camera.position.z += (_cp.z - camera.position.z) * w;
  camera.position.y = Math.max(_cp.y, fs.opt.boden(camera.position.x, camera.position.z) + 3);
  camera.lookAt(p.x + fx * 5, p.y - (fall ? 3.5 : 0.6), p.z + fz * 5);
}
// ---- Einhaengen: waehrend des Sprungs keine Flugphysik (das Flugzeug ist weg), eigene Kamera, keine Fluganzeigen ---------
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher();
  const physOrig = stepPhysics;                              // global-ok: Engine
  stepPhysics = function(dt){ if(fs.schritt){ if(!(story.pause && story.pause())) schritt(dt); return; } return physOrig.apply(this, arguments); };
  const camOrig = updateCamera;                              // global-ok: Engine
  updateCamera = function(){ if(fs.schritt && fs.g){ kamera(); return; } return camOrig.apply(this, arguments); };
  // Radar/Schub (segeln.js, data-etappe-hud) aus, solange er springt
  const st = document.createElement('style'); st.textContent = 'body.fallschirm [data-etappe-hud]{display:none!important}'; document.head.appendChild(st);
  (function hud(){ document.body.classList.toggle('fallschirm', !!fs.schritt); requestAnimationFrame(hud); })();
};
})();
