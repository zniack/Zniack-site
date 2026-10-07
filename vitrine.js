(() => {
  const root = document.documentElement;
  const showcase = document.querySelector('.hero-showcase');
  if (!showcase) return;
  const grid = root.dataset.vitrine === 'grade';
  const formats = ['motion', 'narrado', 'ugc'];
  const names = { motion: 'Motion', ugc: 'Estilo UGC', narrado: 'Narrado' };
  const panels = [...showcase.querySelectorAll('[data-panel]')];
  const picks = [...showcase.querySelectorAll('[data-showcase-format]')];
  const videos = [...showcase.querySelectorAll(grid ? '[data-grid-video]' : '[data-showcase-video]')].filter(video => video.dataset.src?.trim());
  const pauseButton = showcase.querySelector(grid ? '[data-grid-pause]' : '[data-showcase-pause]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const constrained = !!navigator.connection?.saveData;
  showcase.dataset.playbackPreference = reduced.matches ? 'reduced-motion' : constrained ? 'save-data' : 'automatic';
  let selected = 'motion';
  let ready = false;
  let inView = false;
  let pausedByUser = false;
  // A prévia com motion=on é uma escolha explícita de avaliar o movimento.
  let explicitPlayback = root.classList.contains('motion-preview');
  const unavailable = new Set();
  const covers = [...showcase.querySelectorAll(grid ? '.showcase-card-film img' : '.showcase-panel:not([hidden]) img')];
  // Uma capa indisponível não deve impedir a reprodução dos vídeos.
  const coversReady = Promise.all(covers.map(image => image.decode().catch(() => undefined)));
  const pausedForPreference = () => !explicitPlayback && (reduced.matches || constrained || root.classList.contains('motion-off'));
  const allowed = () => ready && inView && !document.hidden && !root.classList.contains('hook-demo-open') && !pausedByUser && !pausedForPreference();
  const activeVideos = () => grid ? videos : videos.filter(v => v.dataset.showcaseVideo === selected);
  const stopped = () => pausedByUser || pausedForPreference() || activeVideos().every(video => unavailable.has(video));

  function renderControl() {
    pauseButton.hidden = videos.length === 0;
    const isStopped = stopped();
    pauseButton.setAttribute('aria-pressed', String(isStopped));
    pauseButton.setAttribute('aria-label', grid ? `${isStopped ? 'Retomar' : 'Pausar'} animações` : `${isStopped ? 'Reproduzir' : 'Pausar'} prévia`);
    pauseButton.firstElementChild.textContent = isStopped ? '▷' : 'Ⅱ';
    pauseButton.querySelector('.showcase-pause-text').textContent = isStopped ? (grid ? 'Retomar' : 'Reproduzir') : 'Pausar';
  }

  async function play(video) {
    if (!allowed() || unavailable.has(video)) return;
    if (!video.hasAttribute('src')) {
      video.src = video.dataset.src;
      video.preload = 'auto';
      video.load();
    }
    try { await video.play(); }
    catch (error) {
      if (error.name === 'AbortError' || !activeVideos().includes(video) || !allowed()) return;
      unavailable.add(video);
      video.classList.remove('is-playing');
      renderControl();
    }
  }

  function syncPlayback() {
    const active = activeVideos();
    videos.forEach(video => {
      video.autoplay = allowed() && active.includes(video) && !unavailable.has(video);
      if (!allowed() || !active.includes(video)) video.pause();
      else void play(video);
    });
    renderControl();
  }

  function choose(format) {
    if (!formats.includes(format)) return;
    const changed = selected !== format;
    selected = format;
    panels.forEach(panel => panel.hidden = panel.dataset.panel !== selected);
    picks.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.showcaseFormat === selected)));
    document.getElementById('showcase-name').textContent = names[selected];
    document.getElementById('showcase-counter').textContent = `0${formats.indexOf(selected) + 1} / 03`;
    if (changed) {
      document.getElementById('showcase-progress').style.width = '0%';
      const video = activeVideos()[0];
      if (video?.hasAttribute('src')) video.currentTime = 0;
    }
    syncPlayback();
  }

  videos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.addEventListener('playing', () => {
      if (!allowed() || !activeVideos().includes(video)) { video.pause(); return; }
      video.classList.add('is-playing');
    });
    video.addEventListener('error', () => {
      video.classList.remove('is-playing');
      unavailable.add(video);
      renderControl();
    });
    if (!grid) {
      video.addEventListener('timeupdate', () => {
        if (video.dataset.showcaseVideo === selected && video.duration) {
          document.getElementById('showcase-progress').style.width = `${Math.min(100, video.currentTime / video.duration * 100)}%`;
        }
      });
      video.addEventListener('ended', () => {
        if (allowed() && video.dataset.showcaseVideo === selected) choose(formats[(formats.indexOf(selected) + 1) % formats.length]);
      });
    }
  });
  picks.forEach(button => button.addEventListener('click', () => choose(button.dataset.showcaseFormat)));
  pauseButton.addEventListener('click', () => {
    if (stopped()) {
      explicitPlayback = true;
      pausedByUser = false;
      unavailable.forEach(video => video.load());
      unavailable.clear();
    }
    else pausedByUser = true;
    syncPlayback();
  });
  reduced.addEventListener('change', () => { explicitPlayback = false; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('landing:demo-visibility', syncPlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .12;
      syncPlayback();
    }, { threshold: [0, .12] }).observe(showcase);
  } else { inView = true; }
  root.classList.add('showcase-ready');
  renderControl();
  // Primeiro, texto e capas decodificadas; depois, duas pinturas antes do download.
  async function scheduleMedia() {
    await coversReady;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ready = true;
      syncPlayback();
    }));
  }
  if (root.classList.contains('fonts-ready')) scheduleMedia();
  else if (document.body.dataset.application === 'principal') {
    const fontReady = document.fonts?.load('400 14px Manrope') || Promise.resolve();
    Promise.resolve(fontReady).then(scheduleMedia, scheduleMedia);
  }
  else window.addEventListener('landing:fonts-ready', scheduleMedia, { once: true });
})();
