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
// Update im Hintergrund (Live-Wunsch 26.10.2026: "das Flugspiel zieht sich die Aenderungen beim Start selber"): solange die
// neue Version laedt, steht im Startmenue ein Hinweis und Starten wartet (story.updateLaedt) – ist sie da, laedt die Seite neu
// (controllerchange). Haengt es, geht es nach 30 s trotzdem los.
let ladeT = 0;
function updateBeobachten(w){
  if(!w || !navigator.serviceWorker.controller) return;           // erste Installation: kein Update
  story.updateLaedt = true; clearTimeout(ladeT); ladeT = setTimeout(updateFertig, 30000);
  if(!story.gestartet) zeigeLadeHinweis();
  w.addEventListener('statechange', () => { if(w.state === 'redundant') updateFertig(); });   // fehlgeschlagen: weiter mit der alten
}
function updateFertig(){ story.updateLaedt = false; const el = document.getElementById('updatelaedt'); if(el) el.remove(); }
function zeigeLadeHinweis(){
  if(document.getElementById('updatelaedt')) return;
  const el = document.createElement('div'); el.id = 'updatelaedt';
  el.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);padding:8px 18px;border-radius:10px;'
    + 'background:rgba(0,0,0,.6);color:#fff;font:600 16px system-ui,sans-serif;z-index:60;pointer-events:none;';
  el.textContent = 'Neue Version wird geladen …';
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
      updateBeobachten(reg.installing || reg.waiting);             // die Registrierung prueft beim Laden selbst – laeuft es schon?
      reg.addEventListener('updatefound', () => updateBeobachten(reg.installing));
      setInterval(() => reg.update().catch(() => {}), 60000);
      // App aus dem Hintergrund geholt (Tablet/Handy: kein echter Neustart, kein load): gleich pruefen, nicht erst nach einer Minute
      document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') reg.update().catch(() => {}); });
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
