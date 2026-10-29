// Das Geheimland – Etappe 5: auf dem Mond (Live-Wunsch 23.10.2026, Konzept Abschnitt 7). Laedt nach teleskop.js.
// Nach dem Globus (Ort 4, der Mond) fliegt der X-Wing den Landeanflug von allein: von vorn auf die Mondbasis der Engine zu,
// er sinkt und setzt vor ihrem kleinen Kuppelhaus auf. Joshi steigt mit Y aus, Fuchsi springt hinterher, beide laufen zur
// Basis; am Eingang Y -> hinein (mondbasis_innen.js). Kein freies Fliegen im Weltall:
// den X-Wing kann Joshi hier erst wieder besteigen, wenn die Geschichte so weit ist (story.e5DarfFliegen).
// Mondboden und Mondbasis sind die der Engine (ihre Leuchtsaeule nicht) (enterGround('moon'); tools/build_engine.ps1 kopiert dafuer
// crater_glb.js und moonbase_glb.js mit).
// Draussen (Live-Wunsch 28.10.2026, Konzept Etappe 5 Schritte 1, 2, 6): nach dem Aussteigen Detektivhut und blaues X; X (auf dem
// Mondboden 50 m weit) markiert nur die Basis und den Strahler neben dem Eingang, der "HALLO" morst (Y: Satz, dann ein roter
// Skizzenring). Ein Weg aus Steinplatten fuehrt vom Landeplatz zum Eingang, daneben liegt ein Holzscheit. Die fuenf Mondsteine
// liegen von Anfang an da, entdecken kann man sie erst nach der Bitte des Eichhoernchens; sie kommen als Haeufchen ins Inventar.
(function(){
'use strict';
const story = window.STORY;
const e5 = () => story.etappe === 5;
// Lage relativ zur Mondbasis (_basePosMoon, Boden baseGroundY): ihr kleines Kuppelhaus am Ende der Roehre liegt bei +z
// (gemessen am Modell: x -11..8, z 70..91). Davor der Landeplatz; der Eingang sitzt an seiner Stirnseite (tuerBauen).
// dz 128 (vorher 138): Joshi steigt so innerhalb der 50 m des Suchblicks vom Eingang aus (Live-Wunsch 28.10.2026)
const LANDUNG = { dx: 16, dz: 128 };
const ANFLUG = { weit: 1100, hoch: 260, dauer: 22, schweben: 30 };   // m vor dem Landeplatz, m darueber, s bis zum Schweben, m Schwebehoehe
const TUER = { b: 1.5, h: 2.3 };
const SUCH_R_MOND = 50;                                 // Suchblick und Detektivhut draussen auf dem Mond (sonst 20 / 12 m)
const STRAHLER = { dx: 8.5, dz: 6.5, h: 7 };            // neben dem Eingang (von draussen gesehen rechts), frei vor der Kuppel; Masthoehe
const BASIS_BODEN = 0x5c5c5c;                           // der Extra-Boden der Basis so hell wie der Mondboden (vorher 0x909090)
const m5 = { phase: null, t: 0, start: null, ziel: null, basis: null, tuer: null, inter: null, ausgestiegen: false, drin: false,
  strahler: null, strahlerInter: null, strahlerGeschaut: false, strahlerFest: false, draussenGebaut: false };
story.e5Zustand = m5;
story.e5DarfFliegen = false;

// Anflug und Landung ohne Ansage (Live-Wunsch 28.10.2026): Blende, Globus, Blende, Anflug mit 360-Grad-Schwenk, Landung; danach
// steht ein Y ueber dem X-Wing (yUeberJet)
const TEXT_AUSGESTIEGEN = ['Du bist auf dem Mond gelandet! Hier bist du ganz leicht und kannst richtig hoch springen.'];
const TEXT_HINWEIS_X = ['Schau dich mal um. Drück X.'];
const TEXT_HINWEIS = ['Schau doch mal in die Mondbasis hinein. Der Eingang ist vorn, neben dem großen Strahler. Drück dort Y.'];
const TEXT_HINWEIS_JET = ['Steig mit Y aus.'];
const TEXT_STRAHLER = ['Ein Strahler – und er morst das Wort HALLO.'];   // der Skizzenring kommt erst nach dem Fest (e5StelleFrei)
const TEXT_FOLGT = 'Joshi und Fuchsi sind an der Mondbasis. Wie es drinnen weitergeht, erfährst du bald.';

// ---- Ort ------------------------------------------------------------------------------------------------------------
// Bodenhoehe genau (wie in Trip to Japan, objekte.js bodenGenau): surfaceY der Engine rechnet auf dem Mond mit einem groben
// Hoehenraster und nur unter dem Fokus genau – vor dem Kuppelhaus lieferte es 20 m statt 61 m. Hier per Raycast gegen die
// Bodenkachel unter dem Punkt und die Plattform der Basis, auf 0,25 m zwischengespeichert. Gilt fuer die Fuesse (evaFootY:
// Joshi, Fuchsi) und den Eingang; surfaceY (Flieger, Landung) bleibt, wie die Engine es braucht.
const _bRay = new THREE.Raycaster(), _bVon = new THREE.Vector3(), _bAb = new THREE.Vector3(0, -1, 0), bodenCache = new Map();
function bodenGenau(x, z){
  const G = typeof GROUNDS !== 'undefined' && GROUNDS.moon; if(locale !== 'moon' || !G || !G.tiles) return null;            // global-ok: Engine
  // Live-Befund 29.10.2026 (Speicherprofil: 740 MB Muell in 4,5 s beim Laufen und Springen, das massive Ruckeln draussen): Zahl
  // statt Text als Schluessel, die Kachel ueber ihr Dreiecksraster statt per Raycast (kachelHoehe, siehe bodenOhneRaycast), die
  // Basis nur, wenn der Punkt ueber ihr liegt
  const key = Math.round(x * 4) * 4194304 + Math.round(z * 4);
  const c = bodenCache.get(key); if(c !== undefined) return c;
  const T = G.tile, tile = G.tiles.get(Math.round(x / T) + ',' + Math.round(z / T)); if(!tile) return null;
  let y = kachelHoehe(kachelRaster(tile), x, z);
  if(typeof moonBaseObj !== 'undefined' && moonBaseObj && moonBaseObj.visible){                                             // global-ok: Engine
    // Plattform und Stufen der Basis, nicht ihr Dach (Live-Befund 29.10.2026: vor der Luke ragt die Kuppel ueber den Boden – als
    // hoechster Treffer stand Joshi dort ploetzlich "auf dem Dach" und kam nicht bis zur Tuer). Darum zaehlt die Glaskuppel
    // (Icosphere) nicht als Boden – sie reicht auch unter die Platte in die Erde (Live-Befund 29.10.2026: nach dem Hinausgehen stand
    // Joshi "im Nirvana unter der Erde"). Alles andere – die grosse Platte mit ihrem Relief, Stufen, Plattformen – wie bisher, der
    // hoechste Treffer (ein Versuch mit fester Plattformhoehe liess Joshi unter die Platte fallen, sie ist nicht eben)
    const yb = kachelHoehe(kachelRaster(moonBaseObj, 160, /^Icosphere/), x, z);                  // global-ok: Engine
    if(yb !== null && (y === null || yb > y)) y = yb; }
  if(y === null) return null;
  if(bodenCache.size > 4000) bodenCache.clear();
  bodenCache.set(key, y); return y;
}
story.bodenGenau = bodenGenau;
const bodenY = (x, z) => { const b = bodenGenau(x, z); return b !== null ? b : surfaceY(x, z); };                            // global-ok: Engine
function basis(){
  const bp = (typeof _basePosMoon !== 'undefined' && _basePosMoon) || { x: 0, z: 0 };                    // global-ok: Engine
  return { x: bp.x, z: bp.z, y: typeof baseGroundY === 'function' ? baseGroundY(bp) : 0 };               // global-ok: Engine
}
// Suchblick und Detektivhut draussen auf dem Mondboden: 50 m statt 20 / 12 m (Live-Wunsch 28.10.2026) – die Basis liegt gut
// 40 m vom Landeplatz. In der Basis gilt der Standard (story.js fuchsSuche, notizbuch.js Muetze).
// nach dem Fest weiter (Live-Befund 29.10.2026: an der Basis lag die Rakete ausserhalb – kein blaues X, "alles entdeckt", und Fuchsi zeigte sie doch)
story.suchRadiusAussen = () => (e5() && locale === 'moon' && eva && !(story.mondbasis && story.mondbasis.drin)) ? (story.e5FestFertig && story.e5FestFertig() ? SUCH_R_MOND * 1.6 : SUCH_R_MOND) : null;   // global-ok: Engine
// Eingang: eine leuchtende Luke an der Stirnseite des kleinen Kuppelhauses, auf dem Boden davor. Die Kugel wird am Modell
// vermessen (Icosphere001), damit die Luke genau auf ihrer Haut sitzt.
function tuerBauen(){
  if(m5.tuer || typeof moonBaseObj === 'undefined' || !moonBaseObj) return;                              // global-ok: Engine
  moonBaseObj.updateMatrixWorld(true);
  let kugel = null; moonBaseObj.traverse(o => { if(o.isMesh && /^Icosphere001/.test(o.name)) kugel = kugel ? kugel.union(new THREE.Box3().setFromObject(o)) : new THREE.Box3().setFromObject(o); });
  if(!kugel) return;
  const c = kugel.getCenter(new THREE.Vector3()), r = (kugel.max.x - kugel.min.x) / 2;
  const x = c.x, b = bodenGenau(x, kugel.max.z + 1.5); if(b === null) return;   // vor der Kugel (dort traefe der Strahl ihr Dach)
  let gy = b, dy = gy + TUER.h / 2 - c.y, z = c.z + Math.sqrt(Math.max(1, r * r - dy * dy)) - 0.15;    // auf der Kugelhaut
  // Live-Befund 29.10.2026: die Luke steckte etwas im Boden – die Bodenplatte der Basis steigt zur Kuppel hin an. Darum der hoechste
  // Boden unter Rahmen und Stufe, dann die Lage auf der Kugel noch einmal
  for(const [sx, sz] of [[-0.6, 0], [0, 0], [0.6, 0], [-0.6, 1.2], [0, 1.2], [0.6, 1.2]]){ const h = bodenGenau(x + sx * (TUER.b + 1.2), z + sz); if(h !== null && h > gy) gy = h; }
  dy = gy + TUER.h / 2 - c.y; z = c.z + Math.sqrt(Math.max(1, r * r - dy * dy)) - 0.15;
  // Live-Befund 29.10.2026: die Kugel ist eckig – die Flaeche ueber der Luke ragte vor und verdeckte ihren oberen Teil (sah aus wie
  // halb versunken). Darum die Luke vor die vorderste Stelle der Kugelhaut ueber ihre ganze Hoehe und Breite; der Rahmen reicht als
  // kurzer Gang nach hinten in die Kugel (keine Luecke an der Seite)
  const haut = []; moonBaseObj.traverse(o => { if(o.isMesh && /^Icosphere001/.test(o.name)) haut.push(o); });
  const strahl = new THREE.Raycaster(); let vorn = -Infinity;
  for(const hy of [0.2, TUER.h * 0.5, TUER.h, TUER.h + 0.3]) for(const sx of [-1, 0, 1]){
    strahl.set(new THREE.Vector3(x + sx * (TUER.b / 2 + 0.2), gy + hy, c.z + r + 8), new THREE.Vector3(0, 0, -1));
    const h = strahl.intersectObjects(haut, false)[0]; if(h) vorn = Math.max(vorn, h.point.z); }
  if(vorn > -Infinity && vorn + 0.05 > z) z = vorn + 0.05;
  const g = new THREE.Group(); g.position.set(x, gy, z);
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(TUER.b + 0.4, TUER.h + 0.3, 2.5), new THREE.MeshLambertMaterial({ color: 0x8a9098 }));
  rahmen.position.set(0, (TUER.h + 0.3) / 2, -1.0); g.add(rahmen);                                // Vorderkante wie vorher bei +0,25
  const licht = new THREE.Mesh(new THREE.PlaneGeometry(TUER.b, TUER.h), new THREE.MeshBasicMaterial({ color: 0x9fd8ff }));
  licht.position.set(0, TUER.h / 2 + 0.05, 0.26); g.add(licht);
  const stufe = new THREE.Mesh(new THREE.BoxGeometry(TUER.b + 1.2, 0.18, 1.2), new THREE.MeshLambertMaterial({ color: 0x6c7178 }));
  stufe.position.set(0, 0.09, 0.7); g.add(stufe);
  story.welt(5).add(g); m5.tuer = g;
  // Y am Eingang. Seit dem 28.10.2026 erst nach dem Umschauen: X (Fuchsi) markiert die Basis, hier an ihrem Eingang. Das Y
  // steht ueber der Luke; seine Hoehe rechnet story.js ab ISLAND_Y, der Mondboden liegt woanders
  m5.inter = story.interaktion(g, { name: 'Mondbasis', welt: 5, x, z: z + 1.4, r: 1.0, yx: x, yz: z + 0.4, yHoehe: gy - ISLAND_Y + TUER.h + 0.7, aktion: rein });   // global-ok: Engine
  // Fuchsi markiert die Basis mit X, ein Y gibt es hier nicht – hinein geht es einfach durch die Luke (Live-Wunsch 29.10.2026, lukePruefen)
  if(m5.inter) m5.inter.nurX = true;
  m5.platteY = gy; bodenCache.clear();                        // die Hoehe der Plattform der Basis (bodenGenau); vorher Gemerktes neu
  draussenBauen();
}
// Hinein in die Mondbasis (mondbasis_innen.js): durch die Luke laufen (lukePruefen) oder Y – sonst vorerst "Fortsetzung folgt"
function rein(o){
  if(story.e5InDieBasis){ story.e5InDieBasis(); return; }
  if(m5.drin) return; m5.drin = true;
  if(o) o.erledigt = true;
  if(story.fortsetzungFolgt) story.spaeter(0.4, () => story.fortsetzungFolgt('🌙', TEXT_FOLGT));
}

// ---- Draussen: Boden, Weg, Holzscheit, Strahler, Steine (Live-Wunsch 28.10.2026) --------------------------------------
function draussenBauen(){
  if(m5.draussenGebaut || !m5.tuer || !m5.ziel) return; m5.draussenGebaut = true;
  // Der Extra-Boden der Basis (ihre grosse Platte, Plane_Material001) war heller und fleckiger als der Mondboden ringsum –
  // gleich hell gefaerbt (gemessen am Bild: 79 gegen 49), die eigene Textur bleibt
  moonBaseObj.traverse(o => { if(o.isMesh && /^Plane_Material001/.test(o.name)){ o.material = o.material.clone(); o.material.color.setHex(BASIS_BODEN); } });   // global-ok: Engine
  const T = m5.tuer.position, Z = m5.ziel, dx = Z.x - T.x, dz = Z.z - T.z, L = Math.hypot(dx, dz);
  m5.weg = { ux: dx / L, uz: dz / L, L: L - 9 };                       // Richtung Landeplatz; die Platten legt erst das Aussteigen
  scheitLegen(); strahlerBauen(); steineHinlegen();
  if(eva) wegBauen(eva.group.position.x, eva.group.position.z);         // global-ok: Engine (schon ausgestiegen)
}
// Weg: flache Steinplatten vom Eingang bis vor Joshis Fuesse, wo er aus dem X-Wing steigt (ex, ez), je auf dem Boden darunter;
// keine Grenze
function wegBauen(ex, ez){
  if(m5.wegGruppe || !m5.tuer) return;
  const T = m5.tuer.position, dx = ex - T.x, dz = ez - T.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
  const mat = new THREE.MeshLambertMaterial({ color: 0x5f636b }), g = new THREE.Group();   // etwas heller als der Boden, nicht leuchtend
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for(let d = 2.2; d < L - 1.2; d += 1.25){                               // bis kurz vor Joshi
    for(const q of [-0.45, 0.45]){
      const x = T.x + ux * d - uz * (q + (rnd() - 0.5) * 0.2), z = T.z + uz * d + ux * (q + (rnd() - 0.5) * 0.2);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42 + rnd() * 0.12, 0.46 + rnd() * 0.12, 0.08, 7), mat);
      p.position.set(x, bodenY(x, z) + 0.02, z); p.rotation.y = rnd() * 3; p.userData.deko = true; g.add(p);
    }
  }
  story.welt(5).add(g); m5.wegGruppe = g;
  // der Holzscheit neben den Weg, wie er wirklich liegt (Live-Befund 29.10.2026: nach der Richtung zum Landeplatz gelegt lag er
  // manchmal mitten auf den Platten) – auf halber Strecke, 1,5 m daneben
  const S = m5.scheit, d = L * 0.5, sx = T.x + ux * d + uz * 1.5, sz = T.z + uz * d - ux * 1.5;
  const neben = () => { if(S && S.obj){ S.obj.position.set(sx, bodenY(sx, sz), sz); if(story.dingNeu) story.dingNeu(S); } };
  if(S){ if(S.obj) neben(); else if(S.bereit) S.bereit.then(neben); }
}
// Holzscheit neben dem Weg, auf halber Strecke (Live-Wunsch 28.10.2026: am Anfang liegt er nur da)
function scheitLegen(){
  if(!story.setze || !m5.weg) return;
  const T = m5.tuer.position, W = m5.weg, d = W.L * 0.5, x = T.x + W.ux * d + W.uz * 1.9, z = T.z + W.uz * d - W.ux * 1.9;
  const s = story.setze('holzscheit', 5, { x, z, y: bodenY(x, z), dreh: 0.9, fest: true });
  if(s){ s.ort = 'moon'; m5.scheit = s; }                               // Grenze nur auf dem Mond (objekte.js aktiv)
}
// Strahler neben dem Eingang: ein Mast mit einem grossen Scheinwerfer, schraeg zum Himmel (zur Erde); er morst "HALLO",
// Buchstabe fuer Buchstabe abwechselnd rot und blau (wie im Teleskop), mit einem Lichtkegel in den Himmel
function strahlerBauen(){
  const T = m5.tuer.position, x = T.x + STRAHLER.dx, z = T.z + STRAHLER.dz, y = bodenY(x, z);
  const metall = new THREE.MeshLambertMaterial({ color: 0x9aa1aa, emissive: 0x1c2026 }), dunkel = new THREE.MeshLambertMaterial({ color: 0x4a4f57, emissive: 0x101216 });
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = -0.5;
  const fuss = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.6, 0.6, 16), dunkel); fuss.position.y = 0.3; g.add(fuss);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, STRAHLER.h, 12), metall); mast.position.y = 0.6 + STRAHLER.h / 2; g.add(mast);
  for(let i = 0; i < 3; i++){ const st = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.12), metall); const a = i / 3 * Math.PI * 2;
    st.position.set(Math.cos(a) * 0.75, 1.8, Math.sin(a) * 0.75); st.rotation.set(Math.sin(a) * 0.38, 0, -Math.cos(a) * 0.38); g.add(st); }
  // Kopf: Gabel und Scheinwerfer-Trommel, 50 Grad nach oben geneigt
  const kopf = new THREE.Group(); kopf.position.y = 0.6 + STRAHLER.h + 0.3; g.add(kopf);
  const gabel = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 0.4), dunkel); kopf.add(gabel);
  const trommel = new THREE.Group(); trommel.position.y = 0.9; trommel.rotation.x = -0.9; kopf.add(trommel);
  const huelle = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.8, 1.5, 24, 1, true), metall); huelle.material = metall.clone(); huelle.material.side = THREE.DoubleSide; trommel.add(huelle);
  const boden = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), dunkel); boden.rotation.x = Math.PI / 2; boden.position.y = -0.75; trommel.add(boden);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.09, 8, 32), dunkel); ring.rotation.x = Math.PI / 2; ring.position.y = 0.75; trommel.add(ring);
  const glas = new THREE.Mesh(new THREE.CircleGeometry(0.95, 32), new THREE.MeshBasicMaterial({ color: 0x30343a })); glas.rotation.x = -Math.PI / 2; glas.position.y = 0.7; trommel.add(glas);
  // Lichtkegel: lang, nach oben weiter, durchscheinend und additiv; nur sichtbar, wenn er gerade leuchtet
  const KL = 80, kegel = new THREE.Mesh(new THREE.CylinderGeometry(6, 0.95, KL, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  kegel.position.y = 0.7 + KL / 2; kegel.userData.deko = true; kegel.renderOrder = 5; trommel.add(kegel);
  const schein = new THREE.Sprite(new THREE.SpriteMaterial({ map: scheinTex(), color: 0xff3b30, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  schein.position.y = 0.9; schein.scale.setScalar(4.5); schein.renderOrder = 6; trommel.add(schein);
  g.traverse(o => { if(o.isMesh) o.castShadow = true; });
  story.welt(5).add(g);
  m5.strahler = { g, kopf, trommel, glas, kegel, schein, x, z, y, text: 'HALLO' };
  m5.strahlerInter = story.interaktion(g, { name: 'Strahler', welt: 5, x, z, r: 1.6, yHoehe: y - ISLAND_Y + 2.4, aktion: strahlerY });   // global-ok: Engine
  skizzeUndErde(); strahlerZurErde();
  g.updateMatrixWorld(true); if(story.ding){ const d = story.ding(g, { welt: 5, typ: 'strahler' }); if(d) d.ort = 'moon'; }   // fest (objekte.js story.dingSperrt)
}
// Der Lichtkegel zeigt zur Erde (Live-Wunsch 29.10.2026; vorher fest 50 Grad nach oben): Kopf drehen, Trommel neigen, bis ihre
// Achse (+y) auf die Erde zeigt
function strahlerZurErde(){
  const S = m5.strahler, E = m5.erde; if(!S || !E) return;
  S.g.updateMatrixWorld(true); const von = S.trommel.getWorldPosition(new THREE.Vector3());
  const d = E.position.clone().sub(von).normalize().applyQuaternion(S.g.quaternion.clone().invert());   // in der Lage des Masts
  S.kopf.rotation.y = Math.atan2(-d.x, -d.z); S.trommel.rotation.x = -Math.acos(Math.max(-1, Math.min(1, d.y)));
}
// Skizzenring (notizbuch.js 'strahler_skizze', Live-Wunsch 28.10.2026): gut 30 m vor dem Eingang neben dem Weg (auf der Seite
// gegenueber dem Strahler). Das Bild: der Mondboden mit der ganzen Basis, dahinter am Himmel die Erde und ueber der Basis eine
// Sternschnuppe (nur bei der Aufnahme). Die Erde steht in Blickrichtung hinter der Basis, ERDE.hoch Grad ueber dem Horizont – und
// damit auch sonst immer am Mondhimmel.
const ERDE = { weit: 1250, r: 80, hoch: 32, links: 14 };   // Live-Wunsch 29.10.2026: naeher an die Basis (vorher 27 / 18) – sicher im Bild            // Grad ueber dem Horizont (ueber der Kuppel), Grad links der Basis
function skizzeUndErde(){
  const T = m5.tuer.position, B = m5.basis, W = m5.weg || { ux: 0, uz: 1 };
  const kx = T.x + W.ux * 30 - W.uz * 5, kz = T.z + W.uz * 30 + W.ux * 5, ky = bodenY(kx, kz);
  const mx = (T.x + B.x) / 2, mz = (T.z + B.z) / 2, yaw = Math.atan2(-(mx - kx), -(mz - kz));
  if(story.stelleSetzen) story.stelleSetzen('strahler_skizze', kx, kz, { x: kx, y: ky + 1.7, z: kz, yaw, pitch: 0.33, fov: 58 });   // pitch 0,33 (vorher 0,1, dann 0,24): die Basis tiefer im Bild
  const dx = mx - kx, dz = mz - kz, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, wl = ERDE.links * Math.PI / 180;
  const ex = ux * Math.cos(wl) + uz * Math.sin(wl), ez = uz * Math.cos(wl) - ux * Math.sin(wl);                    // ein Stueck nach links gedreht
  m5.skizze = { kx, ky, kz, mx, mz, ux, uz, l };
  if(!window.PLANET_ERDE_GLB || !story.ladeGlb || m5.erde) return;
  m5.erde = new THREE.Group(); m5.erde.position.set(kx + ex * ERDE.weit, ky + Math.tan(ERDE.hoch * Math.PI / 180) * ERDE.weit, kz + ez * ERDE.weit);
  m5.erde.userData.deko = true; story.welt(5).add(m5.erde);
  story.ladeGlb(window.PLANET_ERDE_GLB, 'Erde', (gl) => {
    const o = gl.scene; o.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(o), r = (bb.max.x - bb.min.x) / 2 || 1;
    o.traverse(m => { if(m.isMesh){ const alt = m.material; m.material = new THREE.MeshBasicMaterial({ map: alt.map, color: 0xffffff, fog: false }); m.frustumCulled = false; } });   // leuchtet selbst (Erdschein); ohne Nebel (Live-Befund 29.10.2026: sonst fehlte sie im Bild)
    o.position.sub(bb.getCenter(new THREE.Vector3())); const h = new THREE.Group(); h.add(o); h.scale.setScalar(ERDE.r / r); h.rotation.z = 0.41; m5.erde.add(h); m5.erdeKugel = h;
  });
}
// Sternschnuppe ueber der Basis: ein langer, schmaler Leuchtstreif (Kopf hell, Schweif verblassend), schraeg nach unten
function sternschnuppe(an){
  const S = m5.skizze; if(!S) return;
  // gemalt wie ein Bilderbuch-Stern (Live-Wunsch 29.10.2026, nach einem Beispielbild): gelber Stern mit dickem Rand, dahinter ein
  // geschwungener Schweif, Tempo-Striche und ein paar Punkte – auf der Bleistift-Skizze bleiben die Umrisse
  if(!m5.schnuppe){
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    g.lineJoin = g.lineCap = 'round'; g.strokeStyle = '#1b1b1b'; g.lineWidth = 16;
    g.beginPath(); g.moveTo(330, 120); g.quadraticCurveTo(120, 160, 30, 480); g.quadraticCurveTo(60, 330, 150, 250);
    g.lineTo(130, 300); g.quadraticCurveTo(230, 210, 360, 170); g.closePath(); g.fillStyle = '#f2c21b'; g.fill(); g.stroke();   // Schweif
    const stern = (x, y, R, r) => { g.beginPath(); for(let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); };
    stern(400, 112, 92, 42); g.fillStyle = '#ffe31a'; g.fill(); g.stroke();                                    // Stern
    g.lineWidth = 13; for(const [x0, y0, x1, y1, x2, y2] of [[270, 104, 200, 106, 170, 120], [128, 160, 108, 172, 98, 182], [235, 290, 180, 340, 155, 380], [118, 380, 105, 405, 98, 425]]){
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); }                         // Tempo-Striche
    g.fillStyle = '#1b1b1b'; for(const [x, y] of [[345, 40], [455, 42], [490, 146], [470, 182], [400, 210]]){ g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }   // Punkte
    m5.schnuppe = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false }));   // ohne Nebel (er verschluckte sie)
    m5.schnuppe.userData.deko = true; story.welt(5).add(m5.schnuppe);
    // weiter weg und kleiner; rechts oben ueber dem Strahler, nicht an ihm (Live-Wuensche 29.10.2026). Seitlich gespiegelt (die Textur –
    // ein Sprite nimmt kein negatives scale): der Kopf vorn links, der Bogen des Schweifs zeigt nach oben
    const d = S.l + 230; m5.schnuppe.position.set(S.kx + S.ux * d - S.uz * 150, S.ky + 185, S.kz + S.uz * d + S.ux * 150); m5.schnuppe.scale.set(62, 62, 1);
    const tx = m5.schnuppe.material.map; tx.repeat.x = -1; tx.offset.x = 1; tx.needsUpdate = true;
  }
  m5.schnuppe.visible = an;
}
function scheinTex(){
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
// Y am Strahler: der Satz
function strahlerY(o){
  o.spricht = true;
  story.sprich(TEXT_STRAHLER, () => { o.spricht = false; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false; m5.strahlerGeschaut = true; });
}
// Der Skizzenring erst am Ende (Live-Wunsch 29.10.2026: nicht schon, wenn man dem Eichhoernchen mit den Steinen hilft): nach dem
// Fest, wenn Joshi wieder draussen ist und zum Raumschiff geht – der Suchblick (X) findet ihn dann
story.e5StelleFrei = (id) => id === 'strahler_skizze' && !!(story.e5FestFertig && story.e5FestFertig()) && !(story.mondbasis && story.mondbasis.drin);
// fuer die Skizze: eine Sternschnuppe, der Strahler ohne seinen Leuchtpunkt (Live-Wunsch 29.10.2026)
// Live-Wunsch 29.10.2026 (zweiter Durchgang): auch ohne Lichtkegel – dafuer die Erde (sie steht ohnehin am Himmel)
story.e5StrahlerAufnahme = (an) => { m5.strahlerFest = false; sternschnuppe(an); m5.ohneSchein = an; if(m5.strahler){ m5.strahler.schein.visible = !an; if(an) m5.strahler.kegel.visible = false; } };
// Morsezeichen (fuer HALLO und spaeter KOMMT ALLE): Takt MORSE_T s, Punkt 1, Strich 3, Luecke im Buchstaben 1, zwischen
// Buchstaben 3, zwischen Woertern 7, am Ende 9 Takte Pause; je Buchstabe abwechselnd rot und blau
const MORSE_T = 0.22, MORSE_FARBE = [0xff3b30, 0x3b7bff];
const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
const morseCache = {};
function morsePlan(text){
  if(morseCache[text]) return morseCache[text];
  const an = []; let t = 0, b = 0;
  for(const ch of text){
    if(ch === ' '){ t += 4; continue; }                                  // 3 nach dem Buchstaben + 4 = 7
    const z = MORSE[ch]; if(!z) continue;
    for(let i = 0; i < z.length; i++){ const d = z[i] === '-' ? 3 : 1; an.push({ von: t, bis: t + d, farbe: MORSE_FARBE[b % 2] }); t += d + 1; }
    t += 2; b++;
  }
  return morseCache[text] = { an, dauer: t + 9 };
}
story.morseLicht = function(text, t){                                      // -> Farbe oder null (aus)
  const P = morsePlan(text), u = (t / MORSE_T) % P.dauer;
  for(const e of P.an) if(u >= e.von && u < e.bis) return e.farbe;
  return null;
};
function strahlerTakt(){
  const S = m5.strahler; if(!S) return;
  const f = m5.strahlerFest ? MORSE_FARBE[0] : story.morseLicht(S.text, performance.now() / 1000);
  S.kegel.visible = S.schein.visible = f !== null; if(m5.ohneSchein) S.kegel.visible = S.schein.visible = false;   // Skizze: ohne Lichtkegel und Leuchtpunkt
  if(f !== null){ S.kegel.material.color.setHex(f); S.schein.material.color.setHex(f); S.glas.material.color.setHex(f); }
  else S.glas.material.color.setHex(0x30343a);
}

// ---- Steine fuer das Eichhoernchen (mondbasis_innen.js: es bittet darum) ----------------------------------------------------
// Sie liegen von Anfang an vor der Basis (Live-Wunsch 28.10.2026), entdecken kann man sie erst nach seiner Bitte
// (e5SteineAuslegen meldet sie an); X: Fuchsi zeigt sie, Y: aufheben – sie kommen als Haeufchen ins Inventar (erst einer,
// dann zwei ...). Bei fuenf: eine Skizze des Steinhaufens ins Notizbuch und ein kleiner Stein ins Regal der Huette. Lage
// relativ zur Luke (Blick hinaus = +z)
const STEINE = [{ x: -8, z: 6 }, { x: 13, z: 17 }, { x: -3, z: 16 }, { x: 17, z: 9 }, { x: -12, z: 13 }];   // mind. 4 m neben dem Weg
const TEXT_LETZTER = ['Das war der letzte Stein!'];   // vorher still; wohin damit, sagt die Hinweis-Taste
const st5 = { liste: [], geholt: 0, ausgelegt: false, gelegt: false };
const steinMat = () => new THREE.MeshLambertMaterial({ color: 0x9aa0b4, emissive: 0x1e2a44 });
function steinForm(i, mat){ const s = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.05, 0), mat); s.scale.y = 0.75; s.rotation.set(i, i * 1.3, 0.4); return s; }
function steineHinlegen(){
  if(st5.gelegt || !m5.tuer) return; st5.gelegt = true;
  const T0 = m5.tuer.position, mat = steinMat();
  STEINE.forEach((q, i) => {
    const x = T0.x + q.x, z = T0.z + q.z, y = bodenY(x, z);
    const g = new THREE.Group(); g.position.set(x, y, z);
    const s = steinForm(i, mat); s.position.y = 0.12; g.add(s);
    story.welt(5).add(g); st5.liste.push({ g, o: null, x, y, z });
  });
}
story.e5SteineAuslegen = function(){
  if(st5.ausgelegt) return; steineHinlegen(); if(!st5.gelegt) return; st5.ausgelegt = true;
  for(const e of st5.liste) if(e.g.parent) e.o = story.interaktion(e.g, { name: 'Mondstein', welt: 5, x: e.x, z: e.z, r: 0.6, yHoehe: e.y - ISLAND_Y + 1.0, aktion: aufheben });   // global-ok: Engine
};
function aufheben(o){
  if(o.erledigt) return; o.erledigt = true; if(o.zeichen) o.zeichen.visible = false;
  const e = st5.liste.find(q => q.o === o); if(e && e.g.parent) e.g.parent.remove(e.g);
  st5.geholt++;
  if(story.ausruestung){ story.ausruestung.steine = st5.geholt; if(story.steineNeu) story.steineNeu(); }   // ausruestung.js: Inventar
  if(st5.geholt < STEINE.length) return;
  if(story.notizSeiteDazu) story.notizSeiteDazu({ art: 'skizze', bild: story.mitSignatur ? story.mitSignatur(steinSkizze()) : steinSkizze(), name: 'Die Mondsteine', ort: 'mond' });
  if(story.huetteMondstein) story.huetteMondstein();
  story.sprich(TEXT_LETZTER);
}
story.e5SteineAlle = () => st5.ausgelegt && st5.geholt >= STEINE.length;
story.e5SteineAnzahl = () => STEINE.length;
// Inventar (ausruestung.js SACHEN.steine): so viele Steine, wie Joshi hat, als kleines Haeufchen
story.e5SteineModell = function(){
  const g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ color: 0x7c818c }), n = Math.max(1, st5.geholt);   // im hellen Inventar ohne Eigenleuchten
  const P = [[0, 0, 0], [0.42, 0, 0.1], [-0.4, 0, 0.12], [0.05, 0, -0.38], [0.02, 0.3, 0.02]];
  for(let i = 0; i < n; i++){ const s = steinForm(i, mat); s.position.set(P[i][0], 0.13 + P[i][1], P[i][2]); g.add(s); }
  return g;
};
// Skizze des Steinhaufens auf dem Mondboden: Bleistift auf weissem Grund (1200 x 800 wie die anderen Seiten) – Horizont mit
// Kraterhuegeln, Sterne, die Erde, vorn der Haufen aus fuenf Steinen mit Schraffur und Schatten
function steinSkizze(){
  const c = document.createElement('canvas'); c.width = 1200; c.height = 800; const g = c.getContext('2d');
  g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, 1200, 800);   // Papierton wie alle Skizzen (war weiss)
  let s = 31; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const strich = (w, a) => { g.lineWidth = w; g.strokeStyle = 'rgba(55,55,60,' + a + ')'; g.lineCap = 'round'; g.lineJoin = 'round'; };
  // Horizont: wellige Linie, dahinter ein paar Krater-Huegel
  strich(3, 0.75); g.beginPath(); g.moveTo(0, 430); for(let x = 0; x <= 1200; x += 40) g.lineTo(x, 430 + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 6); g.stroke();
  strich(2, 0.5); for(const [x, w] of [[180, 160], [760, 220], [1040, 120]]){ g.beginPath(); g.ellipse(x, 432, w, 26, 0, Math.PI, 0); g.stroke(); }
  // Sterne und die Erde
  strich(2, 0.55); for(let i = 0; i < 40; i++){ const x = rnd() * 1200, y = rnd() * 380; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.moveTo(x, y - 5); g.lineTo(x, y + 5); g.stroke(); }
  strich(3, 0.8); g.beginPath(); g.arc(980, 150, 62, 0, 7); g.stroke();
  strich(2, 0.5); g.beginPath(); g.ellipse(960, 135, 24, 16, 0.4, 0, 7); g.moveTo(1010, 170); g.ellipse(995, 170, 15, 12, -0.3, 0, 7); g.stroke();
  // Kraterchen im Vordergrund
  strich(2, 0.4); for(const [x, y, r] of [[160, 600, 46], [1000, 560, 34], [300, 720, 28], [880, 700, 52]]){ g.beginPath(); g.ellipse(x, y, r, r * 0.32, 0, 0, 7); g.stroke(); }
  // der Haufen: Schatten, dann fuenf eckige Steine von hinten nach vorn
  g.fillStyle = 'rgba(60,60,66,.16)'; g.beginPath(); g.ellipse(610, 618, 230, 42, 0, 0, 7); g.fill();
  const stein = (cx, cy, r, n, a0) => {
    const pts = []; for(let j = 0; j < n; j++){ const a = a0 + j / n * Math.PI * 2, rr = r * (0.8 + rnd() * 0.3); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.72]); }
    g.fillStyle = '#ffffff'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
    strich(3.2, 0.85); g.stroke();
    g.save(); g.clip(); strich(1.6, 0.35); for(let k = -r * 2; k < r * 2; k += 11){ g.beginPath(); g.moveTo(cx + k, cy + r * 0.1); g.lineTo(cx + k + r * 0.7, cy + r); g.stroke(); } g.restore();   // Schraffur unten
    strich(1.8, 0.55); g.beginPath(); g.moveTo(pts[0][0] * 0.6 + cx * 0.4, pts[0][1] * 0.6 + cy * 0.4); g.lineTo(cx, cy - r * 0.15); g.lineTo(pts[2][0] * 0.6 + cx * 0.4, pts[2][1] * 0.6 + cy * 0.4); g.stroke();   // Kante
  };
  stein(520, 560, 78, 7, 0.3); stein(700, 565, 84, 6, 1.1); stein(610, 470, 74, 7, 2.0); stein(450, 610, 62, 6, 0.8); stein(770, 615, 66, 7, 1.7);
  return c;
}

// ---- Mondstaub (Live-Wunsch 28.10.2026: draussen gern, drinnen nicht – und schoener) -----------------------------------------
// Die Engine setzt auf Mond und Mars 90 helle 10-cm-Kugeln in einen 52-m-Wuerfel um die Kamera (updateDrift) – das sah aus
// wie Schneetreiben. Hier statt dessen: feine, weiche, graue Koernchen dicht ueber dem Boden (bis 2,5 m), verschieden gross,
// die ganz langsam treiben und leicht flimmern; in der Mondbasis gar keiner. Die Engine-Partikel sind auf dem Mond aus (hookMond).
const STAUB = { n: 260, box: 22, hoch: 2.5 };
const staub = { pts: null, pos: null, ph: null, t: 0 };
function staubTex(){ const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(225,222,215,1)'); gr.addColorStop(0.4, 'rgba(200,197,190,.55)'); gr.addColorStop(1, 'rgba(200,197,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); }
function staubSetzen(i, c){ const x = c.x + (Math.random() * 2 - 1) * STAUB.box, z = c.z + (Math.random() * 2 - 1) * STAUB.box, b = bodenY(x, z);
  staub.pos[i * 3] = x; staub.pos[i * 3 + 1] = b + 0.05 + Math.pow(Math.random(), 1.8) * STAUB.hoch; staub.pos[i * 3 + 2] = z; }
function staubTakt(dt){
  const an = e5() && locale === 'moon' && eva && !(story.mondbasis && story.mondbasis.drin) && !(story.e5Rakete && story.e5Rakete());   // global-ok: Engine
  if(!an){ if(staub.pts) staub.pts.visible = false; return; }
  const c = eva.group.position;
  if(!staub.pts){
    staub.pos = new Float32Array(STAUB.n * 3); staub.ph = new Float32Array(STAUB.n); for(let i = 0; i < STAUB.n; i++){ staubSetzen(i, c); staub.ph[i] = Math.random() * 6.3; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(staub.pos, 3));
    staub.pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: staubTex(), size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false, color: 0xc9c6bf }));
    staub.pts.frustumCulled = false; staub.pts.userData.deko = true; story.welt(5).add(staub.pts);
  }
  staub.pts.visible = true; staub.t += dt;
  const L = STAUB.box * 2;
  for(let i = 0; i < STAUB.n; i++){
    let x = staub.pos[i * 3] + Math.sin(staub.t * 0.13 + staub.ph[i]) * 0.04 * dt + 0.05 * dt, y = staub.pos[i * 3 + 1] + Math.sin(staub.t * 0.4 + staub.ph[i]) * 0.03 * dt, z = staub.pos[i * 3 + 2] + 0.02 * dt;
    if(x - c.x > STAUB.box) x -= L; else if(x - c.x < -STAUB.box) x += L;
    if(z - c.z > STAUB.box) z -= L; else if(z - c.z < -STAUB.box) z += L;
    if(Math.abs(staub.pos[i * 3] - x) > 1 || Math.abs(staub.pos[i * 3 + 2] - z) > 1){ const b = bodenY(x, z); y = b + 0.05 + Math.pow(Math.random(), 1.8) * STAUB.hoch; }   // neu eingewandert: auf den Boden dort
    staub.pos[i * 3] = x; staub.pos[i * 3 + 1] = y; staub.pos[i * 3 + 2] = z;
  }
  staub.pts.geometry.attributes.position.needsUpdate = true;
  staub.pts.material.opacity = 0.42 + Math.sin(staub.t * 1.7) * 0.06;                                     // leichtes Flimmern
}

// ---- Anflug ---------------------------------------------------------------------------------------------------------
// Das Flugzeug der Engine wird zum X-Wing und steht am Anfang der Bahn: ANFLUG.weit m vor dem Landeplatz (in +z, die Basis
// liegt also voraus), ANFLUG.hoch m darueber
function vorbereiten(){
  const idx = MODEL_NAMES.indexOf('XWing');                                                               // global-ok: Engine
  if(idx >= 0 && currentModel !== idx){ currentModel = idx; buildModel('XWing'); spec = PLANE_SPECS.XWing || DEFAULT_SPEC; }   // global-ok: Engine
  if(eva) clearEva();                                                                                     // global-ok: Engine
  state.crashed = false; state.falling = false;                                                           // global-ok: Engine
  if(locale !== 'moon') enterGround('moon');                                                              // global-ok: Engine
  placeGroundBase();                    // Basis an ihren Platz (lud sie erst nach enterGround, stand sie noch am Ursprung) // global-ok: Engine
  const B = m5.basis = basis();
  const zx = B.x + LANDUNG.dx, zz = B.z + LANDUNG.dz;
  m5.ziel = { x: zx, y: surfaceY(zx, zz), z: zz };                                                        // global-ok: Engine
  m5.start = { x: zx, y: m5.ziel.y + ANFLUG.hoch, z: zz + ANFLUG.weit };
  m5.yaw = Math.atan2(-(m5.ziel.x - m5.start.x), -(m5.ziel.z - m5.start.z));                               // Nase zum Landeplatz (-z voraus)
  state.pos.set(m5.start.x, m5.start.y, m5.start.z); state.quat.setFromEuler(new THREE.Euler(0, m5.yaw, 0, 'YXZ'));
  state.vel.set(0, 0, -80); state.onGround = false; state.throttle = 0.4;
  planeGroup.visible = true; planeGroup.position.copy(state.pos); planeGroup.quaternion.copy(state.quat);  // global-ok: Engine
  if(typeof snapCamera === 'function') snapCamera();                                                      // global-ok: Engine
  m5.t = 0; m5.ausgestiegen = false; m5.drin = false; m5.bereit = true;
}
// Nach einem Neuladen sind Mondboden und Mondbasis der Engine noch nicht fertig (Live-Test 26.10.2026: Landehoehe und Eingang
// wurden ohne sie berechnet und lagen falsch) – erst vorbereiten, wenn beide da sind
const geladen = () => typeof moonBaseObj !== 'undefined' && !!moonBaseObj && !!(GROUNDS.moon && GROUNDS.moon.tpl);   // global-ok: Engine
function vorbereitenWenn(){ if(!e5() || m5.bereit) return; if(geladen()){ vorbereiten(); starte(); return; } setTimeout(vorbereitenWenn, 200); }
// Anflug beginnen, sobald beides da ist: vorbereitet und gewuenscht (nach dem Globus sofort, nach dem Neuladen mit dem Start)
function starte(){
  if(!m5.bereit || !m5.los || m5.phase !== 'warten') return;
  m5.phase = 'anflug'; m5.t = 0;
}
const _e = new THREE.Euler();
function anflugSchritt(dt){
  m5.t += dt;
  const u = Math.min(1, m5.t / ANFLUG.dauer), S = m5.start, Z = m5.ziel;
  const bz = bodenGenau(Z.x, Z.z); Z.y = bz !== null ? bz : surfaceY(Z.x, Z.z);   // jedes Bild neu: der Boden dort steht erst, wenn er nah genug ist  // global-ok: Engine
  const h = 1 - (1 - u) * (1 - u);                     // waagerecht: immer langsamer, am Ende steht er
  const v = Math.pow(1 - u, 1.7);                      // senkrecht: erst flach, zum Schluss sachte bis auf die Schwebehoehe
  const zy = Z.y + ANFLUG.schweben;
  const x = S.x + (Z.x - S.x) * h, y = zy + (S.y - zy) * v, z = S.z + (Z.z - S.z) * h;
  if(dt > 0) state.vel.set((x - state.pos.x) / dt, (y - state.pos.y) / dt, (z - state.pos.z) / dt);
  state.pos.set(x, y, z);
  state.quat.setFromEuler(_e.set(0.06 * Math.sin(u * Math.PI), m5.yaw, 0, 'YXZ'));   // unterwegs die Nase leicht hoch, am Ende waagerecht
  state.onGround = false; state.throttle = 0.2 + 0.25 * (1 - u);
  planeGroup.position.copy(state.pos); planeGroup.quaternion.copy(state.quat);   // sonst fuehrt das die Engine-Physik nach  // global-ok: Engine
  // Am Ende schwebt er ueber dem Landeplatz: jetzt landet die Engine selbst – wie im Flugspiel und in Trip to Japan mit 10 % Schub
  // (VTOL_LAND: der X-Wing sinkt senkrecht und setzt auf; ihr Bodenkontakt kennt den Boden genau)
  if(u >= 1){ state.vel.set(0, 0, 0); m5.phase = 'sinken'; }
}
function landen(){
  state.vel.set(0, 0, 0); state.throttle = 0;
  m5.phase = 'gelandet';
}

// ---- Etappe ---------------------------------------------------------------------------------------------------------
// Vom X-Wing ueber der Oase (observatorium_innen.js xfEnde -> Globus): ohne Neuladen gleich im Anflug
story.e5Wechsel = function(){
  story.etappe = 5; story.ziel = null;
  if(story.etappeWechsel) story.etappeWechsel(5);
  if(story.spielstandMerken) story.spielstandMerken(5);            // neu geladen geht es hier weiter
  m5.phase = 'warten'; m5.bereit = false; m5.los = true; vorbereitenWenn();
};
// Neu geladen in Etappe 5: der X-Wing wartet am Anfang der Bahn, los geht es mit dem Start (e5Los)
story.e5StartSzene = function(){ m5.phase = 'warten'; m5.bereit = false; m5.los = false; vorbereitenWenn(); };
story.e5Los = function(){ m5.los = true; starte(); };
// Hinweis-Taste draussen (Live-Wunsch 28.10.2026): vor dem Umschauen "Schau dich mal um", erst danach der Satz zur Basis
story.e5Hinweis = () => {
  if(story.e5BasisHinweis && story.mondbasis && story.mondbasis.drin) return story.e5BasisHinweis();
  if(m5.drin) return null;
  if(!eva) return m5.phase === 'gelandet' ? TEXT_HINWEIS_JET : null;
  if(st5.ausgelegt) return story.e5SteineAlle() ? ['Bring die Steine zum Eichhörnchen in die Mondbasis.'] : ['Drück X, dann zeigt dir Fuchsi die Steine. Mit Y hebst du sie auf.'];
  if(m5.inter && !m5.inter.entdeckt && !m5.inter.frei) return TEXT_HINWEIS_X;
  return TEXT_HINWEIS;
};
// Durch die Luke hineingehen wie durch jede Tuer (Live-Wunsch 29.10.2026: nicht erst Y druecken) – waehrend einer Aktion ist sie zu
function lukePruefen(){
  const T = m5.tuer; if(!T || !eva || locale !== 'moon' || m5.drin || (story.mondbasis && (story.mondbasis.drin || story.mondbasis.wechsel || story.mondbasis.sperre > 0))) return;   // global-ok: Engine
  const p = eva.group.position, q = T.position;
  if(Math.abs(p.x - q.x) < TUER.b / 2 && p.z > q.z - 0.2 && p.z < q.z + 0.9 && !(story.aktionLaeuft && story.aktionLaeuft())) rein(m5.inter);
}
story.updateE5 = function(dt){
  if(!e5()) return;
  lukePruefen();
  if(story.updateMondbasis) story.updateMondbasis(dt || 0);
  // den Eingang erst nach der Landung: vorher ist der Boden dort noch nicht berechnet (surfaceY lieferte 0)
  if(!m5.tuer && (m5.phase === 'gelandet' || m5.phase === 'zuFuss')) tuerBauen();
  strahlerTakt(); yUeberJet(); staubTakt(dt || 0);
  if(m5.erdeKugel) m5.erdeKugel.rotation.y += (dt || 0) * 0.02;
};
// Gelandet, Joshi sitzt noch im X-Wing: ein Y darueber (wie an den Dingen), wippend
function yUeberJet(){
  const an = m5.phase === 'gelandet' && !eva && story.yErlaubt();                                          // Y-Standard (story.js)
  if(an && !m5.yJet && story.knopfTextur){ m5.yJet = new THREE.Sprite(new THREE.SpriteMaterial({ map: story.knopfTextur('Y'), transparent: true, depthTest: false, depthWrite: false }));
    m5.yJet.renderOrder = 999; m5.yJet.scale.setScalar(1.6); m5.yJet.userData.deko = true; story.welt(5).add(m5.yJet); }
  if(!m5.yJet) return;
  m5.yJet.visible = an;
  if(an) m5.yJet.position.set(planeGroup.position.x, planeGroup.position.y + 5.5 + Math.sin(performance.now() / 330) * 0.15, planeGroup.position.z);   // global-ok: Engine
}

// ---- Einhaengen -----------------------------------------------------------------------------------------------------
// ---- Mondboden ohne Raycaster (Live-Befund 29.10.2026: auf dem Mond ruckelte es) ----------------------------------------
// stepGroundExact der Engine misst die genaue Bodenhoehe mit bis zu fuenf Raycasts je Bild gegen die Bodenkachel; jeder warf
// gemessen ~85 KB Muell ab (zusammen ~25 MB/s), und die Muellabfuhr hielt das Spiel alle paar Sekunden 60..130 ms an. Hier
// dasselbe ohne Raycaster: je Kachel einmal ein Raster ihrer Dreiecke (Welt-x/z), die Abfrage prueft nur die Dreiecke der
// Rasterzelle unter dem Punkt und nimmt den hoechsten (= der erste Treffer des senkrechten Strahls von oben). Die Mondbasis
// der Engine (moonBaseObj) bleibt beim Raycast wie bisher – dort fiel nichts an (die Huellkugel verfehlt ihn meist).
const BODEN_N = 48;
// Das Raster liegt in den EIGENEN Koordinaten der Kachel (Live-Befund 29.10.2026: in Weltkoordinaten wurde es beim Laufen und
// Springen staendig neu gebaut – 1,2 GB Muell in 4,5 s; die Engine verschiebt die Kacheln mit). Eine Kachel ist nur verschoben und
// gespiegelt (updateGroundTiles: scale +-1, keine Drehung) – senkrecht bleibt senkrecht, die Abfrage rechnet den Punkt nur um.
// Auch fuer die Mondbasis (gedreht um die Senkrechte, feineres Raster N): ihr Modell hat 38.000 Dreiecke, ein Raycast warf je
// Abfrage gut 1 MB Muell (Live-Befund 29.10.2026)
// ohne (optional): Teile, die nicht zaehlen (RegExp auf den Mesh-Namen); jede Variante hat ihren eigenen Speicherplatz
function kachelRaster(tile, Nwunsch, ohne){
  const platz = ohne ? 'bodenRasterOhne' : 'bodenRaster';
  if(tile.userData[platz]) return tile.userData[platz];
  tile.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(tile.matrixWorld).invert(), m = new THREE.Matrix4(), tri = [], v = new THREE.Vector3();
  tile.traverse(o => { if(!o.isMesh || (ohne && ohne.test(o.name))) return; m.multiplyMatrices(inv, o.matrixWorld); const p = o.geometry.attributes.position, ix = o.geometry.index, n = ix ? ix.count : p.count;
    for(let i = 0; i < n; i++){ v.fromBufferAttribute(p, ix ? ix.getX(i) : i).applyMatrix4(m); tri.push(v.x, v.y, v.z); } });
  const P = new Float32Array(tri), nt = P.length / 9, N = Nwunsch || BODEN_N;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for(let i = 0; i < P.length; i += 3){ x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); z0 = Math.min(z0, P[i + 2]); z1 = Math.max(z1, P[i + 2]); }
  const gx = (x1 - x0) / N || 1, gz = (z1 - z0) / N || 1, zelle = (w, a, g) => Math.max(0, Math.min(N - 1, Math.floor((w - a) / g)));
  const bereich = (t) => { const a = P[t], b = P[t + 3], c = P[t + 6], d = P[t + 2], e = P[t + 5], f = P[t + 8];
    return [zelle(Math.min(a, b, c), x0, gx), zelle(Math.max(a, b, c), x0, gx), zelle(Math.min(d, e, f), z0, gz), zelle(Math.max(d, e, f), z0, gz)]; };
  const start = new Int32Array(N * N + 1);
  for(let t = 0; t < nt; t++){ const [a, b, c, d] = bereich(t * 9); for(let iz = c; iz <= d; iz++) for(let ix = a; ix <= b; ix++) start[iz * N + ix + 1]++; }
  for(let i = 0; i < N * N; i++) start[i + 1] += start[i];
  const liste = new Int32Array(start[N * N]), voll = start.slice(0, N * N);
  for(let t = 0; t < nt; t++){ const [a, b, c, d] = bereich(t * 9); for(let iz = c; iz <= d; iz++) for(let ix = a; ix <= b; ix++) liste[voll[iz * N + ix]++] = t; }
  return (tile.userData[platz] = { P, x0, z0, gx, gz, start, liste, tile, N, inv: new THREE.Matrix4().copy(tile.matrixWorld).invert(), m: tile.matrixWorld.elements.slice() });
}
// bis (optional, Welt-y): nur Flaechen darunter (die Basis: Plattform und Stufen, nicht das Kuppeldach)
// unten: die tiefste Flaeche statt der hoechsten (die Platte der Basis)
function kachelHoehe(R, wx, wz, bis, unten){
  const me = R.tile.matrixWorld.elements, m = R.m;
  if(me[0] !== m[0] || me[2] !== m[2] || me[10] !== m[10] || me[12] !== m[12] || me[13] !== m[13] || me[14] !== m[14]){ R.inv.copy(R.tile.matrixWorld).invert(); for(let i = 0; i < 16; i++) m[i] = me[i]; }
  const ie = R.inv.elements, x = ie[0] * wx + ie[8] * wz + ie[12], z = ie[2] * wx + ie[10] * wz + ie[14];   // in die eigenen Koordinaten
  const lokalBis = bis === undefined ? Infinity : (bis - me[13]) / me[5];                          // (gedreht nur um die Senkrechte)
  const N = R.N, ix = Math.floor((x - R.x0) / R.gx), iz = Math.floor((z - R.z0) / R.gz);
  if(ix < 0 || iz < 0 || ix >= N || iz >= N) return null;
  const P = R.P, c = iz * N + ix; let best = null;
  for(let k = R.start[c]; k < R.start[c + 1]; k++){ const t = R.liste[k] * 9;
    const ax = P[t], ay = P[t + 1], az = P[t + 2], bx = P[t + 3], by = P[t + 4], bz = P[t + 5], cx = P[t + 6], cy = P[t + 7], cz = P[t + 8];
    const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if(Math.abs(d) < 1e-12) continue;
    const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d, l3 = 1 - l1 - l2;
    if(l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
    const y = l1 * ay + l2 * by + l3 * cy; if(y <= lokalBis && (best === null || (unten ? y < best : y > best))) best = y; }
  return best === null ? null : me[1] * x + me[5] * best + me[9] * z + me[13];
}
story.mondKachelHoehe = (x, z) => { const G = GROUNDS.moon, t = G && G.tiles.get(Math.round(x / G.tile) + ',' + Math.round(z / G.tile)); return t ? kachelHoehe(kachelRaster(t), x, z) : null; };   // global-ok: Engine
function bodenOhneRaycast(){
  const exaktOrig = stepGroundExact, ray = new THREE.Raycaster(), von = new THREE.Vector3(), ab = new THREE.Vector3(0, -1, 0);   // global-ok: Engine
  stepGroundExact = function(){                                                                                       // global-ok: Engine
    if(locale !== 'moon') return exaktOrig.apply(this, arguments);                                                    // global-ok: Engine
    groundHitY = null;                                                                                                // global-ok: Engine
    const G = GROUNDS[locale]; if(!G || !G.tpl) return;                                                               // global-ok: Engine
    const F = worldFocus(), approx = groundHeightAt(locale, F.x, F.z); if(F.y - approx > 300) return;               // global-ok: Engine
    const T = G.tile, extra = moonBaseObj, proben = eva ? GROUND_PROBES_FOOT : GROUND_PROBES; let best = null;       // global-ok: Engine
    for(let i = 0; i < proben.length; i++){ const px = F.x + proben[i][0], pz = F.z + proben[i][1];
      const tile = G.tiles.get(Math.round(px / T) + ',' + Math.round(pz / T));
      if(tile){ const y = kachelHoehe(kachelRaster(tile), px, pz); if(y !== null && (best === null || y > best)) best = y; }
      if(extra && extra.visible){ const yb = kachelHoehe(kachelRaster(extra, 160), px, pz); if(yb !== null && (best === null || yb > best)) best = yb; }
    }
    if(best !== null){ groundHitY = best; groundHitX = F.x; groundHitZ = F.z; }                                      // global-ok: Engine
  };
}
// ---- Die Morsezeichen am Mond, von der Huettenwelt aus (Live-Wunsch 29.10.2026) -------------------------------------------
// In Etappe 1 blinkt auf der Mondscheibe am Nachthimmel ein kleines Licht – derselbe Strahler, der auf dem Mond HALLO morst
// (story.morseLicht, rot und blau). Nicht auf Fotos und Skizzen (notizbuch.js story.nichtImBild).
const HIMMEL_MORSE = { r: 0.22, auf: 0.32, seit: 0.22, hell: 1.35 };   // Groesse und Lage auf der Scheibe, in Mondradien
let himmelMorse = null;
function himmelMorseTakt(){
  const M = nightMoon.obj, an = !!(M && M.visible && skyMode === 'night' && locale === 'earth' && story.etappe === 1 && !story.heimkehr);   // global-ok: Engine
  if(!an){ if(himmelMorse) himmelMorse.visible = false; return; }
  if(!himmelMorse){
    himmelMorse = new THREE.Sprite(new THREE.SpriteMaterial({ map: scheinTex(), color: 0xff3b30, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    himmelMorse.renderOrder = 1; himmelMorse.frustumCulled = false; scene.add(himmelMorse);                         // global-ok: Engine
    story.nichtImBild = (story.nichtImBild || []).concat(himmelMorse);
  }
  const f = story.morseLicht('HALLO', performance.now() / 1000); himmelMorse.visible = f !== null; if(f === null) return;
  himmelMorse.material.color.setHex(f).multiplyScalar(f === MORSE_FARBE[0] ? HIMMEL_MORSE.hell : HIMMEL_MORSE.hell * 1.4);   // heller (Blau ging auf dem grauen Mond unter)
  const R = NIGHT.moon.r, d = _skyDir, rechts = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize(), hoch = new THREE.Vector3().crossVectors(rechts, d);   // global-ok: Engine
  himmelMorse.position.copy(M.position).addScaledVector(d, -R * 1.05).addScaledVector(hoch, R * HIMMEL_MORSE.auf).addScaledVector(rechts, R * HIMMEL_MORSE.seit);
  himmelMorse.scale.setScalar(R * HIMMEL_MORSE.r * 2);
}
function hookMond(){
  bodenOhneRaycast();
  const nachtOrig = updateNightSky;                                                                                   // global-ok: Engine
  updateNightSky = function(){ const r = nachtOrig.apply(this, arguments); himmelMorseTakt(); return r; };          // global-ok: Engine
  // Anflug: keine Flugphysik, die Bahn fuehrt (vor dem Start steht er still)
  const physOrig = stepPhysics;                                                                          // global-ok: Engine
  const still = { pitch: 0, roll: 0, yaw: 0 };
  stepPhysics = function(dt, inp){
    if(e5() && !eva && (m5.phase === 'anflug' || m5.phase === 'warten')){ if(m5.phase === 'anflug' && !(story.pause && story.pause())) anflugSchritt(dt); return; }
    // Sinken: die Engine fliegt, Schub fest auf VTOL_LAND, der Stick zaehlt nicht; setzt er auf, ist er gelandet
    if(e5() && !eva && m5.phase === 'sinken'){
      state.throttle = typeof VTOL_LAND !== 'undefined' ? VTOL_LAND : 0.1;                                // global-ok: Engine
      const r = physOrig.call(this, dt, Object.assign({}, inp, still));
      if(state.onGround) landen();
      return r;
    }
    return physOrig.apply(this, arguments);
  };
  // Kamera beim Anflug (Live-Wunsch 26.10.2026): einmal 360 Grad um den X-Wing herum, am Ende steht sie genau hinter ihm wie sonst.
  // Die Engine-Kamera laeuft dafuer unveraendert weiter (eigener Stand, sie glaettet von Bild zu Bild); ihr Bild wird nur als
  // Ganzes um die senkrechte Achse durch den X-Wing gedreht – bei 360 Grad ist es genau das normale.
  const SCHWENK = 7;                                                                                     // s fuer die 360 Grad
  const camOrig = updateCamera, _cp = new THREE.Vector3(), _cq = new THREE.Quaternion(), _qa = new THREE.Quaternion(), _y = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
  let camEigen = false;                                                                                   // _cp/_cq: Stand der Engine-Kamera
  updateCamera = function(){
    // Live-Wunsch 29.10.2026: der Anflug zeigt die Basis (die Kamera bleibt hinter dem X-Wing); erst wenn er steht und absinkt,
    // einmal 360 Grad herum (SCHWENK s, auch wenn er schon aufgesetzt hat)
    const jetzt = performance.now() / 1000; if(m5.phase === 'sinken' && m5.schwenk0 === undefined) m5.schwenk0 = jetzt;
    const su = m5.schwenk0 !== undefined ? Math.min(1, (jetzt - m5.schwenk0) / SCHWENK) : 0;
    const schwenk = e5() && !eva && (m5.phase === 'sinken' || m5.phase === 'gelandet') && m5.schwenk0 !== undefined && su < 1;
    if(!schwenk){ if(camEigen){ camera.position.copy(_cp); camera.quaternion.copy(_cq); camEigen = false; } return camOrig.apply(this, arguments); }   // global-ok: Engine
    if(camEigen){ camera.position.copy(_cp); camera.quaternion.copy(_cq); }                              // global-ok: Engine
    const r = camOrig.apply(this, arguments);
    _cp.copy(camera.position); _cq.copy(camera.quaternion); camEigen = true;                              // global-ok: Engine
    const k = su * su * (3 - 2 * su), a = k * Math.PI * 2;
    _qa.setFromAxisAngle(_y, a);
    _d.copy(_cp).sub(state.pos).applyQuaternion(_qa);
    camera.position.copy(state.pos).add(_d); camera.quaternion.copy(_cq).premultiply(_qa);                  // global-ok: Engine
    return r;
  };
  // Leuchtsaeule der Engine ueber der Mondbasis: entfaellt (Live-Wunsch 26.10.2026, wie in Trip to Japan seit 18.10.2026)
  const beaconOrig = showBeacon;                                                                          // global-ok: Engine
  showBeacon = function(){ const r = beaconOrig.apply(this, arguments); if(typeof beaconObj !== 'undefined' && beaconObj) beaconObj.visible = false; return r; };   // global-ok: Engine
  // Mondstaub der Engine aus (eigener, feinerer: staubTakt); drinnen in der Basis ohnehin keiner
  if(typeof driftKindNow === 'function'){ const driftOrig = driftKindNow;                                   // global-ok: Engine
    driftKindNow = function(){ if(e5() && locale === 'moon') return null; return driftOrig.apply(this, arguments); }; }   // global-ok: Engine
  // Keine anderen Raumschiffe, die neben der Basis landen und starten (Engine: Landeplaetze, Live-Wunsch 28.10.2026)
  const padsOrig = updatePads;                                                                            // global-ok: Engine
  updatePads = function(){ if(e5() && locale === 'moon'){ if(typeof pads !== 'undefined') for(const p of pads) if(p.obj) p.obj.visible = false; return; }   // global-ok: Engine
    return padsOrig.apply(this, arguments); };
  // Fuesse auf dem Mond: genau (bodenGenau), sonst wie die Engine
  // Dinge (Holzscheit, Steine …) sind auch auf dem Mond fest (objekte.js story.dingSperrt; Live-Befund 29.10.2026)
  const solidM = evaSolid;                                                                                // global-ok: Engine
  evaSolid = function(x, z){ if(e5() && locale === 'moon' && story.dingSperrt && story.dingSperrt(x, z)) return false; return solidM.apply(this, arguments); };   // global-ok: Engine
  const fussOrig = evaFootY;                                                                              // global-ok: Engine
  evaFootY = function(x, z){ if(locale === 'moon'){ const y = bodenGenau(x, z); if(y !== null) return y; } return fussOrig.apply(this, arguments); };
  // waehrend des Anflugs kein Aussteigen und kein Schleudersitz (B); den X-Wing wieder besteigen erst spaeter
  const yOrig = buttonY;                                                                                  // global-ok: Engine
  buttonY = function(){ if(e5() && !eva && m5.phase !== 'gelandet') return; return yOrig.apply(this, arguments); };   // auch nicht im Sinken
  const bOrig = buttonB;                                                                                  // global-ok: Engine
  buttonB = function(){ if(e5() && !eva) return; return bOrig.apply(this, arguments); };
  const boardOrig = evaCanBoard;                                                                          // global-ok: Engine
  evaCanBoard = function(){ if(e5() && !story.e5DarfFliegen) return false; return boardOrig.apply(this, arguments); };
  // Aussteigen: Fuchsi springt hinterher, die Erzaehlerin sagt, wo man ist (einmal); danach erscheinen Hut und blaues X von selbst
  // (notizbuch.js: Basis und Strahler sind noch unentdeckt und liegen im Suchradius)
  const exitOrig = evaExit;                                                                               // global-ok: Engine
  evaExit = function(){
    const r = exitOrig.apply(this, arguments);
    if(e5() && eva && m5.phase === 'gelandet'){
      m5.phase = 'zuFuss';
      // Blick den Weg entlang zur Basis, die Kamera gleich dahinter; Fuchsi daneben, ebenfalls zur Basis
      const p = eva.group.position, T = m5.tuer && m5.tuer.position;
      if(T){ eva.yaw = Math.atan2(-(T.x - p.x), -(T.z - p.z)); if(typeof snapCamera === 'function') snapCamera(); }               // global-ok: Engine
      wegBauen(p.x, p.z);
      const sx = Math.cos(eva.yaw) * 1.3, sz = -Math.sin(eva.yaw) * 1.3;                                                          // rechts neben Joshi
      if(story.fuchsAbsetzenAuf) story.fuchsAbsetzenAuf({ x: p.x + sx, z: p.z + sz, blick: eva.yaw, modus: 'streifen', sitzt: false, warte: 1 });
      if(!m5.ausgestiegen){ m5.ausgestiegen = true; story.einleitung(1.2, TEXT_AUSGESTIEGEN); }
    }
    return r;
  };
}
const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookMond(); };
})();
