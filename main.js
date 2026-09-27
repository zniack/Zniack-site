// Cada gancho mostra o criativo completo; somente o selecionado recebe uma fonte de vídeo.
const variants = {
  a: {
    slot: 'GANCHO A',
    mechanism: 'CONTRASTE',
    angle: 'VALOR PERCEBIDO',
    hook: 'Seu produto é bom. Mas o seu anúncio consegue mostrar isso?',
    video: 'media/gancho-a.mp4?v=20260927-final-crf20',
    poster: 'media/gancho-a-first.webp?v=20260927-final-crf20'
  },
  b: {
    slot: 'GANCHO B',
    mechanism: 'CONTEXTO',
    angle: 'MUDANÇA DE MERCADO',
    hook: 'A forma de anunciar mudou. Hoje, as plataformas automatizam cada vez mais quem vê seus anúncios. Por isso, o que você mostra passou a importar ainda mais.',
    video: 'media/gancho-b.mp4?v=20260927-final-crf20',
    poster: 'media/gancho-b-first.webp?v=20260927-final-crf20'
  },
  c: {
    slot: 'GANCHO C',
    mechanism: 'DIAGNÓSTICO',
    angle: 'EFICIÊNCIA DA VERBA',
    hook: 'Antes de aumentar sua verba, vale perguntar: seu anúncio está dando um motivo para alguém parar?',
    video: 'media/gancho-c.mp4?v=20260927-final-crf20',
    poster: 'media/gancho-c-first.webp?v=20260927-final-crf20'
  }
};
let selectedHook = 'a';
const variantButtons = document.querySelectorAll('[data-variant]');
const video = document.getElementById('creative-video');
const playButton = document.getElementById('video-play');
const videoStatus = document.getElementById('video-status');
let videoVisible = true;

// Pausa ao sair completamente da tela, preservando o ponto de reprodução.
// Voltar à seção não inicia o vídeo sem uma nova ação do visitante.
if (typeof IntersectionObserver !== 'undefined') {
  const visibilityObserver = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.target === video);
    if (!entry) return;
    videoVisible = entry.isIntersecting && entry.intersectionRatio > 0;
    if (!videoVisible) {
      video.pause();
      videoStatus.hidden = true;
    }
  }, { threshold: 0 });
  visibilityObserver.observe(video);
}

function prepareSelectedVideo() {
  if (video.dataset.hook === selectedHook) return;
  video.preload = 'auto';
  video.src = variants[selectedHook].video;
  video.dataset.hook = selectedHook;
  video.load();
}

function renderVariant() {
  const selected = variants[selectedHook];
  variantButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === selectedHook)));
  document.getElementById('variant-label').textContent = `${selected.slot} · ${selected.mechanism} · ${selected.angle}`;
  video.pause();
  video.removeAttribute('src');
  video.load();
  video.dataset.hook = '';
  video.preload = 'none';
  video.poster = selected.poster;
  video.controls = false;
  video.setAttribute('aria-label', `Criativo completo, ${selected.slot}`);
  video.setAttribute('aria-hidden', 'true');
  playButton.setAttribute('aria-label', `Reproduzir ${selected.slot}`);
  playButton.hidden = false;
  videoStatus.hidden = true;
}
variantButtons.forEach(button => button.addEventListener('click', () => {
  if (!variants[button.dataset.variant] || button.dataset.variant === selectedHook) return;
  selectedHook = button.dataset.variant;
  renderVariant();
}));

playButton.addEventListener('click', () => {
  prepareSelectedVideo();
  video.preload = 'auto';
  video.controls = true;
  video.removeAttribute('aria-hidden');
  playButton.hidden = true;
  videoStatus.textContent = 'Carregando vídeo…';
  videoStatus.hidden = false;
  const requestedHook = selectedHook;
  const playRequest = video.play();
  if (playRequest) playRequest.catch(error => {
    if (selectedHook !== requestedHook) return;
    if (error.name === 'AbortError') {
      videoStatus.hidden = true;
      return;
    }
    playButton.hidden = false;
    videoStatus.textContent = 'Não foi possível iniciar. Toque para tentar novamente.';
  });
});
video.addEventListener('playing', () => {
  videoStatus.hidden = true;
  if (!videoVisible) video.pause();
});
video.addEventListener('error', () => {
  playButton.hidden = false;
  videoStatus.textContent = 'Não foi possível carregar este vídeo.';
  videoStatus.hidden = false;
});

// Links de WhatsApp funcionam sem JavaScript. Nenhuma tag de rastreamento está ativa nesta prévia.
