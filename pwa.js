// Das Geheimland – App-Installation und Offline (PWA), wie in "Reise nach Japan". Laedt direkt nach story.js.
// Registriert sw.js und prueft jede Minute auf eine neue Version. Ist eine neue aktiv: am Startbildschirm sofort neu laden
// (kein Strg+F5 noetig), mitten im Spiel nur ein kleiner Hinweis – ein laufendes Spiel wird nicht abgebrochen.
(function(){
'use strict';
const story = window.STORY;
let neueVersion = false;
function zeigeUpdateHinweis(){
  if(document.getElementById('updatehinweis')) return;
  const el = document.createElement('div'); el.id = 'updatehinweis';
  el.style.cssText = 'position:absolute;right:16px;bottom:40px;padding:6px 12px;border-radius:8px;'
    + 'background:rgba(0,0,0,.55);color:#cfe;font:13px system-ui,sans-serif;z-index:40;pointer-events:none;';
  el.textContent = 'Neue Version bereit – wird beim nächsten Start geladen';
  document.body.appendChild(el);
}
function versionNeuLaden(){
  if(story && story.gestartet){ zeigeUpdateHinweis(); return; }
  location.reload();
}
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  window.addEventListener('load', () => {
    // Erste Installation: der SW uebernimmt die Seite per clients.claim() – das ist kein Update. Jede weitere schon.
    let warSchonGesteuert = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
      setInterval(() => reg.update().catch(() => {}), 60000);
    }).catch((e) => console.warn('Service Worker:', e));
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if(!warSchonGesteuert){ warSchonGesteuert = true; return; }
      if(neueVersion) return;
      neueVersion = true;
      versionNeuLaden();
    });
  });
}
})();
