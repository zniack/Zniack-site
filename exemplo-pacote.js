(() => {
  const dialog = document.getElementById('exemplos');
  const opener = document.querySelector('[data-open-hook-demo]');
  if (!dialog || !opener) return;
  const root = document.documentElement;
  const video = document.getElementById('creative-video');

  function openDemo() {
    if (dialog.open) return;
    dialog.showModal();
    dialog.scrollTop = 0;
    root.classList.add('hook-demo-open');
    document.dispatchEvent(new Event('landing:demo-visibility'));
  }

  opener.addEventListener('click', event => {
    event.preventDefault();
    openDemo();
  });
  dialog.querySelector('[data-close-hook-demo]').addEventListener('click', () => dialog.close());
  // O clique precisa começar e terminar no fundo, evitando fechar ao arrastar o player.
  let backdropPress = false;
  dialog.addEventListener('pointerdown', event => {
    const rect = dialog.getBoundingClientRect();
    backdropPress = event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (backdropPress && event.target === dialog && outside) dialog.close();
    backdropPress = false;
  });
  dialog.addEventListener('close', () => {
    video.pause();
    root.classList.remove('hook-demo-open');
    document.dispatchEvent(new Event('landing:demo-visibility'));
    if (location.hash === '#exemplos') history.replaceState(null, '', location.pathname + location.search + '#pacotes');
    opener.focus({ preventScroll: true });
  });

  function openFromPreviousLink() {
    if (location.hash !== '#exemplos') return;
    opener.scrollIntoView({ block: 'center', behavior: 'instant' });
    openDemo();
  }
  window.addEventListener('hashchange', openFromPreviousLink);
  openFromPreviousLink();
})();
