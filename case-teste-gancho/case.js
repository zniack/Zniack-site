(() => {
  const controls = document.querySelectorAll('[data-period]');
  const panels = document.querySelectorAll('[data-chart-period]');
  controls.forEach(button => button.addEventListener('click', () => {
    controls.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.chartPeriod !== button.dataset.period; });
  }));
  document.querySelectorAll('[data-enhancement]').forEach(element => { element.hidden = false; });

  const dialog = document.getElementById('creative-dialog');
  const player = document.getElementById('case-video');
  const title = document.getElementById('dialog-title');
  const status = document.getElementById('case-video-status');
  let revision = 0;
  if (!dialog || !player) return;
  const stop = () => {
    revision++;
    player.pause();
    player.removeAttribute('src');
    player.load();
    status.hidden = true;
  };
  document.querySelectorAll('[data-play]').forEach(button => button.addEventListener('click', () => {
    const variant = button.dataset.play;
    if (!['a', 'b', 'c'].includes(variant)) return;
    stop();
    const current = revision;
    title.textContent = `Criativo completo · Gancho ${variant.toUpperCase()}`;
    player.poster = `assets/gancho-${variant}-first.webp`;
    player.src = `assets/gancho-${variant}.mp4`;
    status.textContent = 'Carregando vídeo…';
    status.hidden = false;
    dialog.showModal();
    const request = player.play();
    if (request) request.catch(error => {
      if (current !== revision || !dialog.open || error.name === 'AbortError') return;
      status.textContent = 'Use o botão de reprodução do vídeo para começar.';
      status.hidden = false;
    });
  }));
  document.getElementById('close-video').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', stop);
  player.addEventListener('playing', () => { status.hidden = true; });
  player.addEventListener('error', () => {
    if (!dialog.open || !player.getAttribute('src')) return;
    status.textContent = 'O vídeo não carregou. Feche e abra novamente para tentar.';
    status.hidden = false;
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); });
})();
