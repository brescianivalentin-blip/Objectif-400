/* ===== Démarrage ===== */
function boot() {
  linkGens();
  Store.loadLocal();
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('keydown', onKeydownChat);
  window.addEventListener('hashchange', () => { if (Cur) closeLayer(); else render(); window.scrollTo(0, 0); });
  render();
  AI.init().then(() => { if (!Cur) render(); });
  Store.initCloud().then((changed) => { if (changed && !Cur) render(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') Store.flush();
    else Store.refreshFromCloud().then((ch) => { if (ch && !Cur) render(); });
  });
  window.addEventListener('pagehide', () => Store.flush());
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
