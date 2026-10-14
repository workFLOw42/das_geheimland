// Das Geheimland – gemeinsame Canvas-Texturen (Tapete, Holzverkleidung, Dielen, Strassen-Spielteppich).
// Laedt nach story.js, vor insel.js und huette_innen.js: Aussen-Huette und Innenraum sehen damit gleich aus.
(function(){
'use strict';
const story = window.STORY;

function canvasTex(w, h, mal){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  mal(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
// Tapete: warmes Gelb mit Streifen und kleinen Sternen (Kinderzimmer-Stimmung)
function tapete(){
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#f3dfa2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9cf86'; for(let x = 0; x < w; x += 64) g.fillRect(x, 0, 28, h);
    g.fillStyle = '#c98a3a';
    for(let y = 32; y < h; y += 64) for(let x = 46; x < w; x += 64){
      const s = 7; g.beginPath();
      for(let i = 0; i < 10; i++){ const r = i % 2 ? s * 0.45 : s, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
      g.closePath(); g.fill();
    }
  });
}
// Dielen: laengs, mit Fugen und Maserung
function dielen(){
  return canvasTex(256, 256, (g, w, h) => {
    const farben = ['#9a6b3d', '#8d6035', '#a57444', '#93663a'];
    for(let i = 0; i < 8; i++){
      g.fillStyle = farben[i % 4]; g.fillRect(i * 32, 0, 32, h);
      g.fillStyle = 'rgba(60,35,15,.25)';
      for(let k = 0; k < 6; k++) g.fillRect(i * 32 + 4 + ((k * 7 + i * 3) % 24), 0, 1, h);
      g.fillStyle = '#4a2e14'; g.fillRect(i * 32, 0, 2, h);
      g.fillRect(i * 32, (i * 53) % h, 32, 2);
    }
  });
}
// Holzverkleidung (unten an der Wand): senkrechte Bretter, dunkler als der Boden
function verkleidung(){
  return canvasTex(256, 64, (g, w, h) => {
    for(let i = 0; i < 16; i++){ g.fillStyle = i % 2 ? '#6e4423' : '#7a4c28'; g.fillRect(i * 16, 0, 16, h); g.fillStyle = '#3e2410'; g.fillRect(i * 16, 0, 1, h); }
    g.fillStyle = '#4a2c14'; g.fillRect(0, 0, w, 4);
  });
}
// Strassen-Spielteppich: gruene Wiese, graue Strassen mit weissen Mittelstreifen, Kreuzung, Kreisel,
// Zebrastreifen, kleine Haeuser, Baeume und ein Teich – wie der Spielteppich im Kinderzimmer. Seitenverhaeltnis 3:2.
function strassenteppich(){
  const c = document.createElement('canvas'); c.width = 768; c.height = 512;
  const g = c.getContext('2d'), W = 768, H = 512, S = 46;   // S = Strassenbreite
  g.fillStyle = '#5fae4c'; g.fillRect(0, 0, W, H);
  // Wiesen-Flecken
  for(let i = 0; i < 60; i++){ g.fillStyle = i % 2 ? 'rgba(80,160,60,.6)' : 'rgba(120,190,80,.5)'; g.beginPath(); g.arc((i * 137) % W, (i * 89) % H, 10 + (i % 5) * 4, 0, 7); g.fill(); }
  // Teich
  g.fillStyle = '#4aa3d8'; g.beginPath(); g.ellipse(640, 400, 70, 45, 0.3, 0, 7); g.fill();
  g.strokeStyle = '#d8c48a'; g.lineWidth = 6; g.stroke();
  const strasse = (x0, y0, x1, y1) => {
    g.strokeStyle = '#6b6b6b'; g.lineWidth = S; g.lineCap = 'square'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.setLineDash([16, 14]); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.setLineDash([]);
  };
  strasse(0, 170, W, 170);              // waagerecht
  strasse(260, 0, 260, H);              // senkrecht
  strasse(260, 360, 520, 360);          // Abzweig
  strasse(520, 170, 520, 360);
  // Kreisel an der Ecke rechts unten
  g.strokeStyle = '#6b6b6b'; g.lineWidth = S; g.beginPath(); g.arc(520, 360, 46, 0, 7); g.stroke();
  g.fillStyle = '#5fae4c'; g.beginPath(); g.arc(520, 360, 24, 0, 7); g.fill();
  g.fillStyle = '#e4594a'; g.beginPath(); g.arc(520, 360, 8, 0, 7); g.fill();
  // Kreuzung (ohne Mittelstreifen) + Zebrastreifen
  g.fillStyle = '#6b6b6b'; g.fillRect(260 - S / 2, 170 - S / 2, S, S);
  g.fillStyle = '#ffffff';
  for(let i = 0; i < 6; i++) g.fillRect(300 + i * 9, 170 - S / 2 + 3, 5, S - 6);
  for(let i = 0; i < 6; i++) g.fillRect(260 - S / 2 + 3, 210 + i * 9, S - 6, 5);
  // Haeuser (Dach + Wand) und Baeume
  const haus = (x, y, farbe) => {
    g.fillStyle = farbe; g.fillRect(x, y, 44, 34);
    g.fillStyle = '#b8433a'; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 22, y - 22); g.lineTo(x + 50, y); g.closePath(); g.fill();
    g.fillStyle = '#5b3a1f'; g.fillRect(x + 17, y + 14, 10, 20);
    g.fillStyle = '#9fd3ff'; g.fillRect(x + 5, y + 8, 8, 8); g.fillRect(x + 31, y + 8, 8, 8);
  };
  haus(60, 80, '#f2d27a'); haus(140, 76, '#f0a7a0'); haus(330, 82, '#a8d0f0'); haus(600, 84, '#f2d27a');
  haus(80, 260, '#c7e6a8'); haus(330, 252, '#f2d27a');
  const baum = (x, y) => { g.fillStyle = '#6e4423'; g.fillRect(x - 3, y, 6, 12); g.fillStyle = '#2f7a33'; g.beginPath(); g.arc(x, y - 4, 13, 0, 7); g.fill(); };
  for(const [x, y] of [[40, 230], [190, 250], [400, 440], [700, 260], [180, 440], [600, 250], [440, 260], [90, 450]]) baum(x, y);
  // Rand
  g.strokeStyle = '#2d5a8a'; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14);
  const t = new THREE.CanvasTexture(c);
  return t;
}
// Teppich-Mesh (B x T Meter, flach auf y = 0), mit leichtem Rand
function teppichMesh(B, T){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(B, T), new THREE.MeshLambertMaterial({ map: strassenteppich() }));
  m.rotation.x = -Math.PI / 2;
  return m;
}
story.tex = { tapete, dielen, verkleidung, strassenteppich, teppichMesh };
})();
