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
story.huetteRaumBauen = (art) => baueRaum(art);   // kinderzimmer.js: dieselbe Einrichtung als Joshis Zimmer

// Texturen (Tapete, Dielen, Verkleidung, Strassenteppich) kommen gemeinsam aus texturen.js (story.tex)
function canvasTex(w, h, mal){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  mal(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// ---- Raum bauen ------------------------------------------------------------------------------
// zimmer: dieselbe Einrichtung als Joshis Kinderzimmer (kinderzimmer.js) – ohne Tisch und Stuehle, groesserer Spielteppich,
// Spielsachen statt des Bagger-Bords; dann nur { g, R } zurueck (R statt innen: die Huette bleibt unberuehrt)
function baueRaum(zimmer){
  if(!zimmer && innen.gruppe) return;
  const R = zimmer ? {} : innen;
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
  boden.rotation.x = -Math.PI / 2; boden.position.y = 0.01; boden.userData.begehbar = true; g.add(boden);
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
  // In der Tueroeffnung ein Bild von draussen bei Nacht (Live-Befund 26.10.2026: man sah nur Schwarz – eine dunkelblaue Flaeche, die
  // der Nebel im schwebenden Raum noch schluckte): Sterne und Mond, das Meer, Sand, eine Palme, der Schein des Lagerfeuers.
  // Ohne Nebel, ein Stueck hinter der Wand und groesser als die Oeffnung – die Wand verdeckt die Raender.
  const draussen = canvasTex(128, 224, (c, w, h) => {
    const hg = c.createLinearGradient(0, 0, 0, h * 0.55); hg.addColorStop(0, '#0a1430'); hg.addColorStop(1, '#1a2c58'); c.fillStyle = hg; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; for(let i = 0; i < 26; i++) c.fillRect(4 + (i * 41) % (w - 8), 6 + (i * 29) % 104, 2, 2);   // nicht am Rand: der Kasten zieht ihn nach vorn
    c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(90, 36, 12, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0f1b3c'; c.beginPath(); c.arc(96, 31, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#16305a'; c.fillRect(0, 122, w, 34);                                         // Meer
    c.fillStyle = 'rgba(255,246,200,.25)'; for(let i = 0; i < 6; i++) c.fillRect(70 + i * 6, 128 + i * 4, 18, 2);   // Mondglitzern
    c.fillStyle = '#c8b07a'; c.fillRect(0, 156, w, h - 156);                                   // Sand
    const fg = c.createRadialGradient(34, 176, 2, 34, 176, 46); fg.addColorStop(0, 'rgba(255,170,70,.85)'); fg.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = fg; c.fillRect(0, 120, 90, 104);   // Feuer
    c.fillStyle = '#ffd27a'; c.beginPath(); c.moveTo(30, 182); c.lineTo(34, 168); c.lineTo(38, 182); c.fill();
    c.strokeStyle = '#1a140e'; c.lineWidth = 5; c.beginPath(); c.moveTo(104, 200); c.quadraticCurveTo(100, 140, 112, 96); c.stroke();   // Palme
    c.fillStyle = '#1a140e'; for(const a of [-2.6, -2.0, -1.2, -0.5, 0.2]){ c.beginPath(); c.ellipse(112 + Math.cos(a) * 16, 96 + Math.sin(a) * 9, 18, 4, a, 0, 7); c.fill(); }
  });
  // als Kasten hinter der Oeffnung (story.tuerKasten), die Kanten knapp hinter dem Rahmen
  const nacht = story.tuerKasten(draussen, TUER_B + 0.04, TUER_H + 0.03, 1.0);
  nacht.position.set(0, 0, T / 2); g.add(nacht);
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
  decke.rotation.x = Math.PI / 2; decke.position.y = H; decke.userData.keinKoerper = true; g.add(decke);
  for(let x = -B / 2 + 1; x < B / 2; x += 1.6){
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, T), dunkel); b.position.set(x, H - 0.11, 0); g.add(b);
  }
  // Moebel: Bett (links hinten), Tisch mit Laterne (rechts), Regal (Rueckwand), Strassen-Spielteppich
  const bett = new THREE.Group(); bett.position.set(-B / 2 + 0.66, 0, -T / 2 + 1.17);   // Kopfteil und Laengsseite an der Wand (Live-Wuensche 29.10.2026: vorher 35 bzw. 40 cm davor)
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 2.2), holz); rahmen.position.y = 0.2; bett.add(rahmen);
  const kopf = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.9, 0.1), dunkel); kopf.position.set(0, 0.45, -1.1); bett.add(kopf);
  // Matratze mit hellem Laken; darauf die Decke als weiches Tuch (kinderzimmer.js bettDeckeBauen) und ein rundes, weiches Kissen
  // (Live-Wunsch 29.10.2026: vorher Kisten – die Decke wirkte wie eine Platte)
  const dk = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.1, 2.08), new THREE.MeshLambertMaterial({ color: 0xebe7dc })); dk.position.set(0, 0.45, 0.01); dk.name = 'matratze'; bett.add(dk);
  const ki = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14), new THREE.MeshLambertMaterial({ color: 0xf2efe6 })); ki.scale.set(0.4, 0.075, 0.2); ki.position.set(0, 0.555, -0.76); bett.add(ki);
  g.add(bett);
  if(story.bettDeckeBauen) story.bettDeckeBauen(bett);
  let tisch = null;
  if(!zimmer){
  tisch = new THREE.Group(); tisch.position.set(B / 2 - 1.4, 0, -0.6);
  const platte = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.07, 0.9), holz); platte.position.y = 0.78; tisch.add(platte);
  for(const sx of [-1, 1]) for(const sz of [-1, 1]){ const bn = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.07), dunkel); bn.position.set(sx * 0.6, 0.375, sz * 0.36); tisch.add(bn); }
  const lat = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.26, 10), new THREE.MeshBasicMaterial({ color: 0xffd27a })); lat.position.set(0.35, 0.95, 0); tisch.add(lat);
  // Lupe, Kompass, Taschenmesser, Stift, Kamera: Modelle aus dem Katalog (ausruestung.js) – hier nur die Gruppe dafuer
  R.tischGruppe = new THREE.Group(); tisch.add(R.tischGruppe);
  R.tisch = tisch; R.tischPlatte = platte;
  g.add(tisch);
  // zwei Stuehle an den Tisch, je an eine Laengsseite, leicht schraeg herausgezogen
  const stuehle = [];
  for(const [sx, sz, rot] of [[-0.3, 0.75, Math.PI + 0.12], [0.35, -0.72, -0.1]]){
    const s = baueStuhl(holz, dunkel); s.position.set(tisch.position.x + sx, 0, tisch.position.z + sz); s.rotation.y = rot; g.add(s); stuehle.push(s);
  }
  R.stuehle = stuehle;
  }
  // Regal mit EIGENEN Materialien: beim Leuchten (Interaktionsobjekt) leuchteten sonst Bett, Leisten und alles andere
  // aus demselben Holz mit
  const regalHolz = holz.clone(), regalDunkel = dunkel.clone();
  const regal = new THREE.Group(); regal.position.set(0.3, 0, -T / 2 + 0.25);
  R.regalBretter = [];
  for(let i = 0; i < 3; i++){ const br = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.32), regalHolz); br.position.y = 0.5 + i * 0.55; regal.add(br); R.regalBretter.push(br); }
  for(const sx of [-1, 1]){ const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.32), regalDunkel); s.position.set(sx * 1.0, 0.85, 0); regal.add(s); }
  baueBuecher(regal);
  g.add(regal);
  R.regal = regal;                                  // spaeter: Trophaeen
  // Strassen-Spielteppich (2,7 x 1,8 m) vor dem Bett – bedeckt nur einen Teil des Bodens
  const teppich = zimmer ? story.tex.teppichMesh(4.8, 3.2) : story.tex.teppichMesh(2.7, 1.8); teppich.position.set(zimmer ? 1.65 : 0.3, 0.03, zimmer ? 0.2 : 0.9); teppich.userData.begehbar = true; g.add(teppich);   // im Zimmer bis in die Spielecke
  // gelber Spielzeug-Bagger auf einem kleinen Wandbord (rechte Wand, 1,1 m hoch) – auf dem Teppich stand er im Weg
  if(zimmer){ const bagger = baueBagger(); bagger.position.set(B / 2 - 1.5, 0.03, -0.9); bagger.rotation.y = -0.6; g.add(bagger); R.bagger = bagger;
    if(story.zimmerSpielsachen) story.zimmerSpielsachen(g, { x: B / 2 - 1.4, z: -0.6 }); }
  const bord = new THREE.Group(); bord.position.set(B / 2 - 0.2, 1.1, 1.6); if(!zimmer) g.add(bord);
  const brett = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 0.7), holz.clone()); bord.add(brett);
  for(const sz of [-0.28, 0.28]){ const k = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.04), dunkel); k.position.set(0.13, -0.09, sz); k.rotation.z = 0.5; bord.add(k); }
  if(!zimmer){ const bagger = baueBagger(); bagger.position.set(-0.02, 0.018, 0); bagger.rotation.y = Math.PI / 2 + 0.25; bord.add(bagger);   // Arm zum Raum
  R.bagger = bagger; }
  // Licht: Laterne warm + gedimmtes Grundlicht (hemiLight ist nachts schwach)
  const ll = new THREE.PointLight(0xffc070, 1.0, 12, 1.6);   // Laterne (die Tischplatte gluehte sonst orange) ll.position.set(B / 2 - 1.05, 1.6, -0.6); g.add(ll);
  const grund = new THREE.PointLight(0xffe6c0, 0.9, 16, 1.2); grund.position.set(0, H - 0.4, 0.5); g.add(grund);
  // Bucher im Regal liegen auf den Brettern (die Bretter sind die Grenze) – Deko ohne eigene Masse
  regal.children.forEach(c => { if(c.isGroup) c.userData.keinKoerper = true; });
  R.bett = bett;
  if(zimmer) return { g, R };
  g.position.set(RAUM.x, BODEN_Y, RAUM.z);
  story.welt(1).add(g);
  R.gruppe = g; g.visible = !!R.drin;                       // von aussen unsichtbar (schwebt hoch ueber dem Meer)
  // Moebel, Waende, Tuerrahmen, Bord mit Bagger: jedes Bauteil in seiner Form (objekte.js). Unter der Tischplatte und
  // dem Bord passt der Fuchs durch, Joshi nicht.
  R.ding = story.ding(g, { welt: 1, typ: 'huette_innen' });
  // Interaktionsobjekte im Raum (innen: true): Buecherregal (Notizbuch) und der Tisch (alle Sachen darauf als EIN
  // Objekt, ausruestung.js blendet sie nacheinander ein). Der Bagger ist ein einfaches Objekt (nur Grenze).
  R.interRegal = story.interaktion(regal, { name: 'Bücherregal', x: RAUM.x + regal.position.x, z: RAUM.z + regal.position.z, r: 1.0, yHoehe: 2.0, welt: 1, innen: true });
  R.interTisch = story.interaktion(R.tischGruppe, { name: 'Tisch', x: RAUM.x + tisch.position.x, z: RAUM.z + tisch.position.z, r: 0.7, yHoehe: 1.35, welt: 1, innen: true });
  if(story.raumGebaut) story.raumGebaut(innen);         // ausruestung.js: Notizbuch ins Regal, Sachen auf den Tisch
}

// ---- Einrichtung: Buecher, Tisch-Sachen, Bagger (aus Grundformen) -------------------------------------------
const BUCH_FARBEN = [0xb8433a, 0x3f6fb5, 0x4f9a4a, 0xe0b23c, 0x7a4fa0, 0xd8743a, 0x2f7a8a, 0x9a3a5a, 0xe8e0c8, 0x5a4a3a];
// Viele Buecher in jedem Fach: unterschiedlich breit und hoch, ab und zu eins schraeg angelehnt, mit hellem Ruecken-Streifen
function baueBuecher(regal){
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const papier = new THREE.MeshLambertMaterial({ color: 0xf2ead2 });
  for(let fach = 0; fach < 3; fach++){
    const yBoden = 0.5 + fach * 0.55 + 0.025;
    let x = -0.95;
    while(x < 0.9){
      if(fach === 1 && x > 0.47 && x < 0.75){ x = 0.75; continue; }   // Platz fuer das Notizbuch (ausruestung.js)
      const b = 0.03 + rnd() * 0.035, h = 0.24 + rnd() * 0.18, tief = 0.2 + rnd() * 0.06;
      if(rnd() < 0.08){ x += 0.06; continue; }                    // kleine Luecke
      const farbe = BUCH_FARBEN[Math.floor(rnd() * BUCH_FARBEN.length)];
      const buch = new THREE.Group();
      buch.add(new THREE.Mesh(new THREE.BoxGeometry(b, h, tief), new THREE.MeshLambertMaterial({ color: farbe })));
      const seiten = new THREE.Mesh(new THREE.BoxGeometry(b * 0.8, h * 0.94, 0.005), papier); seiten.position.z = -tief / 2 - 0.001; buch.add(seiten);
      const streifen = new THREE.Mesh(new THREE.BoxGeometry(b * 1.02, 0.018, 0.004), new THREE.MeshLambertMaterial({ color: 0xf0d27a }));
      streifen.position.set(0, h * 0.28, tief / 2 + 0.001); buch.add(streifen);
      const schraeg = rnd() < 0.12 && x > -0.85;
      buch.position.set(x + b / 2, yBoden + h / 2, 0.02);
      if(schraeg){ buch.rotation.z = -0.32; buch.position.x += 0.04; buch.position.y -= 0.02; }
      regal.add(buch);
      x += b + 0.004 + (schraeg ? 0.06 : 0);
    }
  }
}
// Stuhl (0,44 x 0,44 m, Sitz 0,46 m hoch, Lehne nach -z) aus Holz
function baueStuhl(holz, dunkel){
  const s = new THREE.Group();
  const sitz = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.44), holz); sitz.position.y = 0.46; s.add(sitz);
  for(const x of [-0.19, 0.19]) for(const z of [-0.19, 0.19]){ const b = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.46, 0.045), dunkel); b.position.set(x, 0.23, z); s.add(b); }
  for(const x of [-0.19, 0.19]){ const p = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.48, 0.045), dunkel); p.position.set(x, 0.72, -0.19); s.add(p); }
  for(const y of [0.66, 0.86]){ const q = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.03), holz); q.position.set(0, y, -0.19); s.add(q); }
  s.traverse(o => { if(o.isMesh) o.castShadow = true; });
  return s;
}
// Gelber Spielzeug-Bagger (~0,45 m lang): Kettenlaufwerk, Drehkranz, Oberwagen mit Kabine, Ausleger, Stiel, Loeffel
function baueBagger(){
  const g = new THREE.Group();
  const gelb = new THREE.MeshLambertMaterial({ color: 0xf2b705 }), dunkel = new THREE.MeshLambertMaterial({ color: 0x2b2b2b });
  const grau = new THREE.MeshLambertMaterial({ color: 0x6b6b6b }), glas = new THREE.MeshLambertMaterial({ color: 0x8fc6e8 });
  // Laufwerk: zwei Ketten
  for(const sz of [-1, 1]){
    const kette = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.055, 0.06), dunkel); kette.position.set(0, 0.028, sz * 0.075); g.add(kette);
    for(const sx of [-1, 1]){ const r = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.062, 14), dunkel); r.rotation.x = Math.PI / 2; r.position.set(sx * 0.15, 0.028, sz * 0.075); g.add(r); }
    for(let i = -2; i <= 2; i++){ const rad = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.064, 8), grau); rad.rotation.x = Math.PI / 2; rad.position.set(i * 0.055, 0.026, sz * 0.075); g.add(rad); }
  }
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.11), grau); rahmen.position.y = 0.06; g.add(rahmen);
  // Oberwagen auf Drehkranz
  const ober = new THREE.Group(); ober.position.y = 0.08; g.add(ober);
  ober.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 18), dunkel));   // Drehkranz
  const koerper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.15), gelb); koerper.position.set(-0.02, 0.045, 0); ober.add(koerper);
  const heck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.15), gelb); heck.position.set(-0.12, 0.04, 0); ober.add(heck);
  const kabine = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.07), gelb); kabine.position.set(0.035, 0.125, -0.035); ober.add(kabine);
  for(const [w, h, x, y, z, ry] of [[0.07, 0.06, 0.081, 0.13, -0.035, Math.PI / 2], [0.06, 0.06, 0.035, 0.13, -0.071, 0], [0.06, 0.06, 0.035, 0.13, 0.001, 0]]){
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glas); f.position.set(x, y, z); f.rotation.y = ry; ober.add(f);
  }
  const dach = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.08), dunkel); dach.position.set(0.035, 0.175, -0.035); ober.add(dach);
  const auspuff = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8), dunkel); auspuff.position.set(-0.09, 0.1, 0.05); ober.add(auspuff);
  // Ausleger (schraeg hoch), Stiel (runter), Loeffel – rechts neben der Kabine
  const arm = new THREE.Group(); arm.position.set(0.07, 0.07, 0.035); ober.add(arm);
  const ausleger = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.032, 0.03), gelb); ausleger.geometry.translate(0.1, 0, 0); ausleger.rotation.z = 0.75; arm.add(ausleger);
  const knick = new THREE.Group(); knick.position.set(Math.cos(0.75) * 0.2, Math.sin(0.75) * 0.2, 0); arm.add(knick);
  const stiel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.026, 0.026), gelb); stiel.geometry.translate(0.075, 0, 0); stiel.rotation.z = -1.25; knick.add(stiel);
  const zylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), stahlFarbe()); zylinder.position.set(0.05, 0.03, 0.02); zylinder.rotation.z = -0.75; arm.add(zylinder);
  const spitze = new THREE.Group(); spitze.position.set(Math.cos(-1.25) * 0.15, Math.sin(-1.25) * 0.15, 0); knick.add(spitze);
  const loeffel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.06), dunkel); loeffel.position.set(0.02, -0.015, 0); loeffel.rotation.z = -0.4; spitze.add(loeffel);
  for(let i = -1; i <= 1; i++){ const zahn = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.018, 4), grau); zahn.position.set(0.045, -0.04, i * 0.02); zahn.rotation.z = -Math.PI / 2 - 0.4; spitze.add(zahn); }
  ober.rotation.y = 0.35;                                       // Oberwagen etwas gedreht – sieht nach Spielen aus
  g.traverse(o => { if(o.isMesh){ o.castShadow = true; } });
  return g;
}
function stahlFarbe(){ return new THREE.MeshLambertMaterial({ color: 0xc8ccd2 }); }

// ---- Laufen im Raum --------------------------------------------------------------------------
const KOERPER = 0.3;
// Huelle um den Raum (15 m Rand, mehr als EVA_WATER_REACH = 9 m): darin gilt nur raumFrei. Die Engine sucht an
// einer Wand bis 9 m voraus nach Wasser und haette sonst hinter der Rueckwand das Schwimmen gestartet.
const HUELLE = 15;
function imRaum(x, z){ return Math.abs(x - RAUM.x) < RAUM.B / 2 + HUELLE && Math.abs(z - RAUM.z) < RAUM.T / 2 + HUELLE; }
// Wie tief steckt (x, z) in den Waenden (m, 0 = frei)? Moebel: Grenzen in ihrer Form ueber objekte.js
function raumTiefe(x, z){
  const lx = x - RAUM.x, lz = z - RAUM.z;
  let t = Math.max(0, Math.abs(lx) - (RAUM.B / 2 - KOERPER), -RAUM.T / 2 + KOERPER - lz);
  // nur durch die Tuer – und die ist zu, solange eine Aktion laeuft (story.aktionLaeuft, Live-Wunsch 23.10.2026)
  const tuerAuf = !(story.aktionLaeuft && story.aktionLaeuft());
  if(lz > RAUM.T / 2 - KOERPER && !(tuerAuf && Math.abs(lx) < TUER_B / 2 - 0.15 && lz < RAUM.T / 2 + 0.6)) t = Math.max(t, lz - (RAUM.T / 2 - KOERPER), 1e-3);
  return t;
}
function raumFrei(x, z){
  const t = raumTiefe(x, z);
  if(t <= 0) return true;
  // Live-Befund (Bagger): wer schon IN einer Grenze steckt, kam nicht mehr los. Joshis Schritt, der ihn nicht tiefer
  // hineinbringt, ist frei – hinaus geht es also immer.
  const von = story.schrittVon && story.schrittVon();
  return !!von && t <= raumTiefe(von.x, von.z) + 1e-6;
}
function hookInnen(){
  const solidOrig = evaSolid, fussOrig = evaFootY, hitsOrig = hitsBuilding;
  // nur, wenn Joshi drin ist (oder gerade hineingeht): sonst ist dort draussen nichts
  const hier = (x, z) => locale === 'earth' && (innen.drin || !!innen.wechsel) && imRaum(x, z);
  evaSolid = function(x, z){ if(hier(x, z)) return raumFrei(x, z); return solidOrig.apply(this, arguments); };
  evaFootY = function(x, z){ if(hier(x, z)) return BODEN_Y; return fussOrig.apply(this, arguments); };
  hitsBuilding = function(x, y, z){ if(hier(x, z)) return !raumFrei(x, z); return hitsOrig.apply(this, arguments); };
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
    if(!(innen.drin && eva) || innen.wo === 'hoehle') return camOrig.apply(this, arguments);   // die Hoehle hat ihre eigene Kamera
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
    innen.drin = true; innen.warDrin = true; if(innen.gruppe) innen.gruppe.visible = true;
  } else {
    // ein Stueck vor der Huette (etwa wie beim Spielstart am Feuer), damit die Kamera hinter Joshi nicht in der Huette
    // haengt; seitlich versetzt, damit er nicht im Lagerfeuer steht (das liegt genau vor der Tuer)
    // (Live-Wunsch 29.10.2026, gilt fuer jedes Gebaeude: so weit draussen, dass die Kamera hinter Joshi nicht im Gebaeude haengt)
    const { x, z } = story.freierPlatz(H.x - 1.8, H.z + H.T / 2 + 7.0, 'joshi');
    g.position.set(x, evaFootY(x, z), z);
    eva.yaw = Math.PI;                                    // Blick zum Strand (+z)
    innen.drin = false; if(innen.gruppe) innen.gruppe.visible = false;
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
    // in der Tueroeffnung der Huette (aussen) -> hinein; waehrend einer Aktion bleibt er davor stehen (die Tuer ist zu)
    if(Math.abs(p.x - H.x) < 0.5 && p.z < H.z + H.T / 2 + 0.05 && p.z > H.z + H.T / 2 - 0.6){
      if(story.aktionLaeuft && story.aktionLaeuft()) p.z = H.z + H.T / 2 + 0.05; else wechsle('innen'); }
  } else {
    // innen durch die Tuer hinaus
    if(Math.abs(p.x - RAUM.x) < 0.6 && p.z > RAUM.z + RAUM.T / 2 - 0.05 && !(story.aktionLaeuft && story.aktionLaeuft())) wechsle('aussen');
  }
}
story.updateInnen = updateInnen;

const hookVorher = window.STORY_HOOK;
window.STORY_HOOK = function(){ if(hookVorher) hookVorher(); hookInnen(); };
})();
