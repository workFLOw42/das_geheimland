// Das Geheimland – Sternbilder am Nachthimmel (Live-Wunsch 14.10.2026). Laedt nach story.js, vor der Engine.
// Echte Sternpositionen (Rektaszension in Stunden, Deklination in Grad, Helligkeit mag) fuer Grosser Wagen, Kleiner
// Wagen mit Polarstern, Kassiopeia und Orion – als hellere Sterne mit feinen Verbindungslinien, damit ein Kind die
// Bilder erkennt (Linien nur ganz dezent). Der Himmel ist fest: Polarstern im Norden (-z, 25 Grad hoch), die Insel liegt bei etwa 25 Grad Nord.
// Spaeter Grundlage fuer das Wissens-Thema "Sternbilder" (Erzaehlstimme zeigt eins nach dem anderen).
(function(){
'use strict';
const story = window.STORY;

// [Name, RA (h), Dek (Grad), mag]
const BILDER = {
  // Grosser Baer: der Grosse Wagen (Sterne 0-6, hell) ist sein Ruecken und Schwanz; Kopf und Beine (7-14, schwaecher)
  // machen aus dem Wagen einen Baeren
  grosserBaer: { name: 'Großer Bär (mit dem Großen Wagen)', sterne: [
    ['Dubhe', 11.062, 61.75, 1.8], ['Merak', 11.031, 56.38, 2.4], ['Phekda', 11.897, 53.69, 2.4], ['Megrez', 12.257, 57.03, 3.3],
    ['Alioth', 12.900, 55.96, 1.8], ['Mizar', 13.399, 54.93, 2.2], ['Alkaid', 13.792, 49.31, 1.9],
    ['Muscida', 8.504, 60.72, 3.4], ['Tau UMa', 9.181, 63.51, 4.7], ['Theta UMa', 9.548, 51.68, 3.2], ['Kappa UMa', 9.061, 47.16, 3.6],
    ['Psi UMa', 11.161, 44.50, 3.0], ['Mu UMa', 10.372, 41.50, 3.1], ['Chi UMa', 11.767, 47.78, 3.7], ['Nu UMa', 11.308, 33.09, 3.5]],
    linien: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6],
             [0, 8], [8, 7], [1, 9], [9, 10], [2, 13], [13, 11], [11, 12], [11, 14]] },
  kleinerBaer: { name: 'Kleiner Bär (Kleiner Wagen, vorn der Polarstern)', sterne: [
    ['Polaris', 2.530, 89.26, 2.0], ['Yildun', 17.537, 86.59, 4.4], ['Epsilon UMi', 16.766, 82.04, 4.2], ['Zeta UMi', 15.734, 77.79, 4.3],
    ['Kochab', 14.845, 74.16, 2.1], ['Pherkad', 15.345, 71.83, 3.0], ['Eta UMi', 16.292, 75.76, 5.0]],
    linien: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
  kassiopeia: { name: 'Kassiopeia', sterne: [
    ['Caph', 0.153, 59.15, 2.3], ['Schedar', 0.675, 56.54, 2.2], ['Gamma Cas', 0.945, 60.72, 2.4], ['Ruchbah', 1.430, 60.24, 2.7], ['Segin', 1.907, 63.67, 3.4]],
    linien: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  orion: { name: 'Orion', sterne: [
    ['Beteigeuze', 5.919, 7.41, 0.5], ['Bellatrix', 5.419, 6.35, 1.6], ['Alnitak', 5.679, -1.94, 1.8], ['Alnilam', 5.604, -1.20, 1.7],
    ['Mintaka', 5.533, -0.30, 2.2], ['Saiph', 5.796, -9.67, 2.1], ['Rigel', 5.242, -8.20, 0.1]],
    linien: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]] },
};
story.sternbilder = BILDER;

// Beobachter: geografische Breite PHI, Sternzeit LST (h) – so stehen Wagen und Kassiopeia gut sichtbar ueber dem
// Horizont und Orion im Osten. Richtung: Hoehe h, Azimut A (0 = Nord, 90 = Ost). Welt: Nord = -z, Ost = +x.
const PHI = 25 * Math.PI / 180, LST = 7.2;   // ausgerechnet: so stehen alle vier Bilder mindestens 13 Grad hoch (Winterabend)
function richtung(ra, dek){
  const H = (LST - ra) * 15 * Math.PI / 180, d = dek * Math.PI / 180;
  const sinh = Math.sin(d) * Math.sin(PHI) + Math.cos(d) * Math.cos(PHI) * Math.cos(H);
  const h = Math.asin(sinh);
  const cosA = (Math.sin(d) - Math.sin(PHI) * sinh) / (Math.cos(PHI) * Math.cos(h));
  let A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  if(Math.sin(H) > 0) A = 2 * Math.PI - A;                      // westlich des Meridians
  return new THREE.Vector3(Math.sin(A) * Math.cos(h), Math.sin(h), -Math.cos(A) * Math.cos(h));
}

// Live-Wunsch: gut zu sehen statt exakt. Jedes Bild wird um seinen Mittelpunkt GROESSER gezogen (ZOOM) und auf
// einen festen Platz am Himmel gesetzt: PLATZ = [Azimut (0 = Nord, 90 = Ost), Hoehe] in Grad.
// Nord = ueber der Huette (dort schaut man beim Start hin), Orion im Sueden ueber dem Meer.
const ZOOM = 2.1;
const PLATZ = { grosserBaer: [-32, 46], kleinerBaer: [14, 50], kassiopeia: [46, 34], orion: [180, 40] };
function platziere(dirs, k){
  const m = dirs.reduce((s, v) => s.add(v), new THREE.Vector3()).normalize();
  const [az, hh] = PLATZ[k], A = az * Math.PI / 180, h = hh * Math.PI / 180;
  const ziel = new THREE.Vector3(Math.sin(A) * Math.cos(h), Math.sin(h), -Math.cos(A) * Math.cos(h));
  // Drehung: Mitte -> Ziel, dabei "oben" (Richtung Zenit) erhalten
  const q = new THREE.Quaternion().setFromUnitVectors(m, ziel);
  return dirs.map(v => {
    const d = v.clone().sub(m).multiplyScalar(ZOOM).add(m).normalize();    // um die Mitte aufziehen
    return d.applyQuaternion(q);
  });
}
const R = 800000;                                               // weit draussen (Kuppel 1,2 Mio. m), vor der Milchstrasse
let gruppe = null;
function sternTextur(){
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,250,235,.95)');
  gr.addColorStop(0.45, 'rgba(200,215,255,.35)'); gr.addColorStop(1, 'rgba(200,215,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
function baue(){
  if(gruppe) return;
  gruppe = new THREE.Group(); gruppe.name = 'sternbilder';
  const tex = sternTextur();
  const linienMat = new THREE.LineBasicMaterial({ color: 0x9fb8ff, transparent: true, opacity: 0.12, fog: false, depthWrite: false });
  for(const k in BILDER){
    const b = BILDER[k], punkte = platziere(b.sterne.map(s => richtung(s[1], s[2])), k).map(v => v.multiplyScalar(R));
    b.punkte = punkte;
    for(let i = 0; i < b.sterne.length; i++){
      const mag = b.sterne[i][3];
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: mag < 1 ? 0xfff2d8 : 0xffffff, fog: false, depthWrite: false, transparent: true }));
      sp.position.copy(punkte[i]);
      sp.scale.setScalar(R * Math.max(0.009, 0.026 - mag * 0.0035));   // heller = groesser (gut sichtbar)
      sp.renderOrder = -1; gruppe.add(sp);
    }
    const pos = [];
    for(const [a, c] of b.linien){ pos.push(...punkte[a].toArray(), ...punkte[c].toArray()); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const l = new THREE.LineSegments(geo, linienMat); l.renderOrder = -1; l.frustumCulled = false; gruppe.add(l);
  }
  gruppe.traverse(o => { o.frustumCulled = false; });
  scene.add(gruppe);                                            // global-ok: Himmel gehoert keiner Welt
}
// Mitwandern mit der Kamera (wie die Sternenkuppel), nur auf der Erde und nicht im Innenraum
story.sternbilderUpdate = function(){
  if(!gruppe) baue();                                           // laeuft aus der Hauptschleife: scene gibt es dann sicher
  gruppe.visible = locale === 'earth' && !(story.innen && story.innen.drin);
  if(gruppe.visible) gruppe.position.copy(camera.position);
};
})();
