        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

        const stickyHeader = document.getElementById('sticky-header');
        const capa = document.getElementById('capa');
        const view = document.getElementById('portfolio-view');
        const descElement = document.getElementById('category-desc');
        const contentArea = document.getElementById('portfolio-content-area');

        let currentPlayers = [];
        let lastScrollPosition = 0;

        let hasClickedMenu = false;

        function updateHeaderBlur() {
            const isModalActive = view.classList.contains('active');

            if (isModalActive) {
                stickyHeader.style.setProperty('--blur-val', '2px');
                stickyHeader.style.setProperty('--sat-val', '0.8');
                stickyHeader.style.setProperty('--bg-fade-col', 'rgba(37, 37, 37, 1)');
            } else {
                const capaH = capa.offsetHeight;
                const scrollY = window.scrollY;
                let blur = 0;
                let opacity = 0;

                const startBlurAt = capaH * 0.8;

                if (scrollY > startBlurAt) {
                    const progress = Math.min((scrollY - startBlurAt) / (capaH - startBlurAt), 1);
                    blur = progress * 3;
                    opacity = Math.min(progress * 1.7, 1);
                }

                stickyHeader.style.setProperty('--blur-val', blur + 'px');
                stickyHeader.style.setProperty('--sat-val', blur > 0 ? '0.4' : '1');
                stickyHeader.style.setProperty('--bg-fade-col', `rgba(26, 26, 26, ${opacity})`);
            }

            if (window.innerWidth <= 768) {
                const capaBottom = capa.offsetTop + capa.offsetHeight;
                const triggerPoint = capaBottom - stickyHeader.offsetHeight;

                if (window.scrollY >= triggerPoint || isModalActive) {
                    stickyHeader.classList.add('mobile-fixed');
                    stickyHeader.style.position = '';
                    stickyHeader.style.top = '';
                    stickyHeader.style.transform = '';
                } else {
                    stickyHeader.classList.remove('mobile-fixed');
                    stickyHeader.style.position = 'absolute';
                    stickyHeader.style.top = `${capaBottom}px`;
                    stickyHeader.style.transform = 'translateY(-100%)';
                }
            } else {
                stickyHeader.classList.remove('mobile-fixed');
                stickyHeader.style.position = '';
                stickyHeader.style.top = '';
                stickyHeader.style.transform = '';
            }
        }

        window.addEventListener('scroll', updateHeaderBlur, { passive: true });
        window.addEventListener('resize', updateHeaderBlur, { passive: true });
        updateHeaderBlur();

        view.addEventListener('scroll', () => {
            const viewH = window.innerHeight;
            
            document.querySelectorAll('.inline-video-wrapper').forEach(wrapper => {
                const player = wrapper.plyrInstance;
                if (!player) return;
                
                const rect = wrapper.getBoundingClientRect();
                
                const vidCenter = rect.top + rect.height / 2;
                const viewCenter = viewH / 2;
                const distFromCenter = Math.abs(vidCenter - viewCenter);
                
                const fadeStart = viewH * 0.25;
                const fadeEnd = viewH * 0.6;
                
                if (distFromCenter > fadeStart) {
                    let ratio = 1 - ((distFromCenter - fadeStart) / (fadeEnd - fadeStart));
                    ratio = Math.max(0, Math.min(1, ratio));
                    wrapper.isFading = true;
                    
                    const targetVol = (wrapper.baseVolume || 0.75) * ratio;
                    if (player.playing && Math.abs(player.volume - targetVol) > 0.02) {
                        player.volume = targetVol;
                    }
                } else {
                    if (wrapper.isFading) {
                        player.volume = wrapper.baseVolume || 0.75;
                        wrapper.isFading = false;
                    }
                }
            });
        }, { passive: true });

        const carouselData = {
            'analises-vol': ['wELUjsyy5-8', 'lKtjZ5iy3WM', 'QrmMlRYB4Lo', '7ZmEmWEqsyk', '3AUUWBWmXpE', 'mg33hNaoqO4', 'nmSxCNGAmV8', 'UYXG_CWDNro', 'nUKCw5Ejyao', '0FwPnvvsKkE'],
            'comentados-vol': ['Oacodzw29CE', '9EGPFtDVG3s', 'qxumGqBVclY', 'Hps6cf-9Ld4', '7wYKFmQ7TMc', 'OhN7CmFrkrM', 'OIMWARx6nZA', 'K-HN5rFeDv8', 'ZZAvKcMFano', 'wfrHj0L9ccc', 'E60hFmhy4hk'],
            'noticias-vol': ['AkrpKrpF3dc', 'VNNOvzWHpw8', 'kMDkKOBXsxg', 'xfEOq0u8d8k', '4XrtZ5SD-jI', 'mxD0WFRvt7k', 'KErRxCP2fP0', 'zPP-6cOafdQ', '_z1GkNuudqU', 'QOziuqM_FQA', 'xYxGu5smFOg'],
            'highlights-vol': ['KAKM9mEqtoc', 'w2WLKVPCNxY', 'kT3T1T7pbXU', 'GICsA2s6cDc', 'Rc3IYyWu2wE', 'v_ELfeP2WxY', '6NpgsBK8JPI', 'ILaJ6TaO1X0', '2E97i-ChJVI', 'BsCDkg0lMek'],
            'aberturas-vol': ['7f7FDHkQjuQ']
        };

        const videoStartTimes = {
            '82Ah3XW5Jg4': 4,
            'll3UYdXXhlE': 4,
            'd0d43qkOE7A': 60,
            'ewiL53kmyPI': 52
        };

        const descricoesPortfolio = {
            'Vídeos Diários': 'Vídeos recebidos, editados e entregues em menos de 24 horas.',
            'Highlights': 'Vídeos dinâmicos de melhores momentos.',
            'Produções Documentais': 'Vídeos com foco em narrativa.',
            'Aberturas': 'Aberturas para campeonatos e eventos.',
            'Institucionais': 'Vídeos corporativos e comunicação de marca.'
        };

        const carouselState = {};

        function forceYouTubeHD(container) {
            const t = setInterval(() => {
                const iframe = container.querySelector('iframe');
                if (!iframe) return;
                clearInterval(t);
                const send = () => {
                    if (iframe.contentWindow) {
                        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setPlaybackQualityRange', args: ['hd1080', 'hd1080'] }), '*');
                        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setPlaybackQuality', args: ['hd1080'] }), '*');
                    }
                };
                send(); setTimeout(send, 800); setTimeout(send, 2000);
            }, 100);
        }

        function updateCategoryNav(name) {
            document.querySelectorAll('.category-nav-btn').forEach(btn =>
                btn.classList.toggle('active-cat', btn.textContent.trim() === name)
            );
        }

        function getCarouselMetrics() {
            const m = window.innerWidth <= 768;
            return {
                isMobile: m,
                baseW: m ? 110 : 140, baseH: m ? 62 : 79,
                activeW: m ? 240 : 320, activeH: m ? 135 : 180,
                step: (m ? 110 : 140) + 15,
                diff: (m ? 240 : 320) - (m ? 110 : 140)
            };
        }

        const localThumbs = [
    '4minjPUiGdI', 'O03qeBRocIs', 'G4qpobpXdKo',
    'csh7Z3dcb0g', '82Ah3XW5Jg4',
    'll3UYdXXhlE',
    'd0d43qkOE7A',
    'ewiL53kmyPI', 'f-2xznYjToI',
    'yiK_Z7XGyBA', 'qgXUQirQ7Bk'
];

        function buildInlineVideo(id, description = '') {
            const descHTML = description
                ? `<div class="w-full md:w-1/3 flex flex-col gap-3"><p class="comentario-trabalho">${description}</p></div>`
                : '<div class="w-full md:w-1/3"></div>';
            const safeDesc = description.replace(/'/g, "\\'");
            const startTime = videoStartTimes[id] || 0;

            let coverMediaHTML = `<img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" loading="lazy" class="w-full h-full object-cover absolute inset-0 pointer-events-none">`;

            if (localThumbs.includes(id)) {
                coverMediaHTML = `<video data-src="thumbs/${id}.mp4" loop muted playsinline class="lazy-video w-full h-full object-cover absolute inset-0 pointer-events-none"></video>`;
            }

            return `
<div class="flex flex-col md:flex-row gap-6 w-full items-start inline-video-wrapper mb-24 md:mb-32" data-desc="${safeDesc}" data-start="${startTime}">
    <div class="spotlight-scale-target w-full md:w-2/3 aspect-video bg-[#1a1a1a] ring-1 ring-inset ring-white/10 relative overflow-hidden shrink-0">
   <div class="absolute inset-0 z-10 cursor-pointer group flex items-center justify-center inline-cover transition-opacity duration-500 ease-in-out" data-vid="${id}">            ${coverMediaHTML}
            <div class="w-16 h-16 flex items-center justify-center rounded-full bg-black/40 border border-white/20 opacity-0 group-hover:opacity-50 transition-opacity duration-500 ease-in-out relative z-20 pointer-events-none">
                <svg class="w-6 h-6 fill-white translate-x-[2px]" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
        </div>
        <div class="player-mount w-full h-full absolute inset-0 z-0"></div>
    </div>
    ${descHTML}
</div>`;
        }

        function handleInlineClick(id, coverEl) {
    const wrapper = coverEl.closest('.inline-video-wrapper');
    const desc = wrapper.getAttribute('data-desc');
    const startTime = parseInt(wrapper.getAttribute('data-start') || '0', 10);
    if (window.innerWidth <= 768) { openLightbox(id, desc, startTime); return; }

    if (wrapper.plyrInstance) {
        const player = wrapper.plyrInstance;
        player.play();
        const onPlaying = () => {
            player.off('playing', onPlaying);
            coverEl.style.opacity = '0';
            setTimeout(() => { if (player.playing) coverEl.style.display = 'none'; }, 500);
        };
        player.on('playing', onPlaying);
        return;
    }

    const mount = wrapper.querySelector('.player-mount');
    mount.innerHTML = `<div class="js-player" data-plyr-provider="youtube" data-plyr-embed-id="${id}"></div>`;

    const ytConfig = { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 };
    if (startTime > 0) ytConfig.start = startTime;

    const player = new Plyr(mount.querySelector('.js-player'), {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        settings: ['quality', 'speed'],
        youtube: ytConfig,
        autoplay: true
    });
    player.on('ready', () => {
        player.volume = 0.75;
        forceYouTubeHD(mount);
    });
    const onPlaying = () => {
        player.off('playing', onPlaying);
        coverEl.style.opacity = '0';
        setTimeout(() => { if (player.playing) coverEl.style.display = 'none'; }, 500);
    };
    player.on('playing', onPlaying);
    wrapper.plyrInstance = player;
    wrapper.baseVolume = 0.75;
    currentPlayers.push(player);
}

        function buildCarousel(carouselId) {
            const ids = carouselData[carouselId];
            if (!ids || ids.length === 0) return '';
            const itemsHTML = ids.map(id => `
                <div class="carousel-item" data-vid="${id}" onclick="handleCarouselClick(this,'${carouselId}')">
                    <img src="https://img.youtube.com/vi/${id}/mqdefault.jpg" alt="Vídeo" loading="lazy">
                    <div class="carousel-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                </div>`).join('');
            const loopHTML = ids.length >= 6 ? itemsHTML + itemsHTML : itemsHTML;
            return `
            <div class="vitrine-section w-full">
                <p class="vitrine-label">mais vídeos</p>
                <div class="flex items-center w-full gap-2 md:gap-4 relative group">
                    <button class="carousel-nav-btn shrink-0" onclick="prevCarouselItem('${carouselId}', event)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <div class="carousel-wrapper flex-1 overflow-hidden" id="wrap-${carouselId}"
                         onmouseenter="handleHoverIn('${carouselId}')"
                         onmouseleave="handleHoverOut('${carouselId}')">
                        <div class="carousel-track" id="track-${carouselId}">${loopHTML}</div>
                    </div>
                </div>
            </div>`;
        }

        window.prevCarouselItem = function (id, event) {
            event.stopPropagation();
            const s = carouselState[id];
            if (!s) return;

            const isLoop = s.itemsCount >= 6;
            const items = s.items;

            let currentItem = s.targetEl || items.find(item => item.classList.contains('active'));

            if (currentItem) {
                let domIdx = items.indexOf(currentItem);
                let realIdx = domIdx % s.itemsCount;

                let prevRealIdx = realIdx - 1;
                if (prevRealIdx < 0) prevRealIdx = s.itemsCount - 1;

                const origEl = items[prevRealIdx];
                const cloneEl = isLoop ? items[prevRealIdx + s.itemsCount] : null;

                s.isPaused = true;
                s.isSlidingToItem = true;
                s.isClosing = false;

                const metrics = getCarouselMetrics();

                items.forEach(item => {
                    if (item.classList.contains('active') && item !== origEl && item !== cloneEl) {
                        item.style.width = item.style.width || metrics.activeW + 'px';
                        item.style.height = item.style.height || metrics.activeH + 'px';
                        item.classList.remove('active');
                    }
                    item.style.transition = 'none';
                });

                s.targetEl = origEl;
                s.syncTargetEl = cloneEl;

                let offset = prevRealIdx * metrics.step;
                if (prevRealIdx >= s.itemsCount) offset += metrics.diff;

                let baseX = -offset;

                if (isLoop) {
                    const LW = s.itemsCount * metrics.step + metrics.diff;
                    s.targetX = baseX;
                    while (s.targetX < s.pos + 10) s.targetX += LW;
                    while (s.targetX > s.pos + LW + 10) s.targetX -= LW;
                } else {
                    s.targetX = baseX;
                }
            } else {
                s.currentSpeed = -25;
            }
        };

        function initCarousels() {
            Object.keys(carouselData).forEach(id => {
                const track = document.getElementById('track-' + id);
                if (!track) return;
                if (carouselState[id] && carouselState[id].rafId) cancelAnimationFrame(carouselState[id].rafId);
                const n = carouselData[id].length;
                carouselState[id] = {
                    track,
                    items: Array.from(track.children),
                    pos: 0,
                    baseSpeed: n >= 6 ? 0.7 : 0,
                    currentSpeed: n >= 6 ? 0.7 : 0,
                    isPaused: false, isHovered: false, itemsCount: n,
                    isSlidingToItem: false, isClosing: false,
                    targetEl: null, syncTargetEl: null, targetX: 0, rafId: null
                };
                startTicker(id);
            });
        }

        function startTicker(id) {
            const s = carouselState[id];
            if (!s) return;
            function tick() {
                const isLoop = s.itemsCount >= 6;
                const items = s.items;
                const metrics = getCarouselMetrics();
                let halfW = 0;
                if (isLoop && items[s.itemsCount]) halfW = items[s.itemsCount].offsetLeft;

                if (s.isSlidingToItem && s.targetEl && !s.isClosing) {
                    if (isLoop && halfW > 0) {
                        if (s.pos <= -halfW) { s.pos += halfW; s.targetX += halfW; }
                        else if (s.pos > 0) { s.pos -= halfW; s.targetX -= halfW; }
                    }
                    const diff = s.targetX - s.pos;
                    const spd = Math.max(-25, Math.min(25, diff * 0.08));
                    s.pos = Math.abs(diff) < 0.5 ? s.targetX : s.pos + spd;

                    let sizeOk = false;
                    items.forEach(item => {
                        const isTgt = item === s.targetEl || item === s.syncTargetEl;
                        let cW = parseFloat(item.style.width) || (item.classList.contains('active') ? metrics.activeW : metrics.baseW);
                        let cH = parseFloat(item.style.height) || (item.classList.contains('active') ? metrics.activeH : metrics.baseH);

                        const tW = isTgt ? metrics.activeW : metrics.baseW;
                        const tH = isTgt ? metrics.activeH : metrics.baseH;

                        cW += (tW - cW) * 0.15; cH += (tH - cH) * 0.15;
                        item.style.width = cW + 'px'; item.style.height = cH + 'px';
                        if (isTgt && item === s.targetEl && Math.abs(tW - cW) < 0.5) sizeOk = true;
                    });
                    if (Math.abs(s.targetX - s.pos) < 0.5 && sizeOk) {
                        s.pos = s.targetX; s.currentSpeed = 0; s.isSlidingToItem = false;
                        items.forEach(item => {
                            item.style.width = ''; item.style.height = '';
                            if (item === s.targetEl || item === s.syncTargetEl) item.classList.add('active');
                            else item.classList.remove('active');
                        });
                    }

                } else if (s.isClosing && s.targetEl) {
                    let done = true;
                    items.forEach(item => {
                        if (item === s.targetEl || item === s.syncTargetEl) {
                            let cW = parseFloat(item.style.width) || metrics.activeW;
                            let cH = parseFloat(item.style.height) || metrics.activeH;
                            cW += (metrics.baseW - cW) * 0.08; cH += (metrics.baseH - cH) * 0.08;
                            item.style.width = cW + 'px'; item.style.height = cH + 'px';
                            if (Math.abs(metrics.baseW - cW) > 0.5) done = false;
                        }
                    });
                    const ts = s.isHovered ? s.baseSpeed * 0.5 : s.baseSpeed;
                    s.currentSpeed += (ts - s.currentSpeed) * 0.08;
                    s.pos -= s.currentSpeed;
                    if (isLoop && halfW > 0) {
                        if (s.pos <= -halfW) s.pos += halfW;
                        else if (s.pos > 0) s.pos -= halfW;
                    }
                    if (done) {
                        s.isClosing = false; s.isPaused = false; s.targetEl = null; s.syncTargetEl = null;
                        items.forEach(item => { item.style.transition = ''; item.style.width = ''; item.style.height = ''; item.classList.remove('active'); });
                    }

                } else if (!s.isPaused && isLoop && !s.isClosing) {
                    const ts = s.isHovered ? s.baseSpeed * 0.5 : s.baseSpeed;
                    s.currentSpeed += (ts - s.currentSpeed) * 0.05;
                    s.pos -= s.currentSpeed;
                    if (halfW > 0) {
                        if (s.pos <= -halfW) s.pos += halfW;
                        else if (s.pos > 0) s.pos -= halfW;
                    }
                }

                s.track.style.transform = `translate3d(${s.pos}px,0,0)`;
                s.rafId = requestAnimationFrame(tick);
            }
            s.rafId = requestAnimationFrame(tick);
        }

        function handleHoverIn(id) { if (carouselState[id]) carouselState[id].isHovered = true; }
        function handleHoverOut(id) { if (carouselState[id]) carouselState[id].isHovered = false; }

        function handleCarouselClick(el, id) {
            const s = carouselState[id];
            if (!s) return;
            const isLoop = s.itemsCount >= 6;
            const items = s.items;
            const domIdx = items.indexOf(el);
            const realIdx = domIdx % s.itemsCount;
            const origEl = items[realIdx];
            const cloneEl = isLoop ? items[realIdx + s.itemsCount] : null;

            const videoId = el.dataset.vid;
            const startTime = videoStartTimes[videoId] || 0;

            if (s.targetEl === origEl || s.targetEl === cloneEl) { openLightbox(videoId, '', startTime); return; }

            s.isPaused = true; s.isSlidingToItem = true; s.isClosing = false;
            const metrics = getCarouselMetrics();

            items.forEach(item => {
                if (item.classList.contains('active') && item !== origEl && item !== cloneEl) {
                    item.style.width = item.style.width || metrics.activeW + 'px';
                    item.style.height = item.style.height || metrics.activeH + 'px';
                    item.classList.remove('active');
                }
                item.style.transition = 'none';
            });
            s.targetEl = origEl; s.syncTargetEl = cloneEl;

            let offset = domIdx * metrics.step;
            if (domIdx >= s.itemsCount) offset += metrics.diff;
            let baseX = -offset;

            if (isLoop) {
                const LW = s.itemsCount * metrics.step + metrics.diff;
                s.targetX = baseX;
                while (s.targetX > s.pos + 100) s.targetX -= LW;
                while (s.targetX < s.pos - LW + 100) s.targetX += LW;
            } else { s.targetX = baseX; }
        }

        document.addEventListener('click', e => {
    if (!view.classList.contains('active')) return;
    if (e.target.closest('.carousel-item') || e.target.closest('.carousel-nav-btn') || e.target.closest('.inline-cover')) return;
            const metrics = getCarouselMetrics();

            Object.keys(carouselState).forEach(id => {
                const s = carouselState[id];
                if (s && s.targetEl && !s.isClosing) {
                    s.isClosing = true; s.currentSpeed = 0;
                    s.items.forEach(item => {
                        item.style.transition = 'none';
                        if (item.classList.contains('active')) {
                            item.style.width = item.style.width || metrics.activeW + 'px';
                            item.style.height = item.style.height || metrics.activeH + 'px';
                            item.classList.remove('active');
                        }
                    });
                }
            });
        });

        const fadeObs = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
        document.querySelectorAll('.fade-up').forEach(el => fadeObs.observe(el));

        let heavyDelay = 0;
let heavyTimeout;
const heavyQueue = [];
let heavyRunning = false;

function processHeavyQueue() {
    if (heavyQueue.length === 0) { heavyRunning = false; return; }
    const el = heavyQueue.shift();
    el.style.transitionDelay = '0s';
    setTimeout(() => el.classList.add('is-visible'), 20);
    // espera 90% da duração da transição (1.2s * 0.9 = 1080ms) antes de liberar o próximo
    setTimeout(processHeavyQueue, 580);
}

const listObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            heavyQueue.push(e.target);
            obs.unobserve(e.target);
            if (!heavyRunning) {
                heavyRunning = true;
                processHeavyQueue();
            }
        }
    });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

document.querySelectorAll('.heavy-fade').forEach(el => listObs.observe(el));

        function triggerTransition(cb) {
            const ov = document.getElementById('transition-overlay');
            ov.style.display = 'block';
            requestAnimationFrame(() => {
                ov.style.opacity = '1';
                setTimeout(() => {
                    cb();
                    setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => { ov.style.display = 'none'; }, 200); }, 50);
                }, 200);
            });
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                hasClickedMenu = true;

                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                const wasOpen = view.classList.contains('active');

                const url = new URL(window.location.href);
                url.searchParams.delete('cat');
                history.pushState(null, null, url.pathname + href);

                triggerTransition(() => {
                    if (wasOpen) { view.classList.remove('active'); document.body.style.overflow = ''; currentPlayers.forEach(p => { try { p.pause(); } catch (x) { } }); }
                    window.scrollTo({ top: target.offsetTop, behavior: 'auto' });
                    updateHeaderBlur();
                });
            });
        });

        let lightboxPlayer = null;
        function openLightbox(videoId, description = '', startTime = 0) {
    const lb = document.getElementById('video-lightbox');
    if (lb.classList.contains('active')) return;

    currentPlayers.forEach(p => {
        try {
            p.pause();
            const playerWrapper = p.elements.container.closest('.inline-video-wrapper');
            if (playerWrapper) {
                const otherCover = playerWrapper.querySelector('.inline-cover');
                if (otherCover) { otherCover.style.display = 'flex'; otherCover.style.opacity = '1'; }
            }
        } catch(e) {}
    });
    currentPlayers = [];

    const wrap = document.getElementById('lightbox-player-wrap');
    const descEl = document.getElementById('lightbox-desc');
    wrap.innerHTML = `<div id="lb-plyr" data-plyr-provider="youtube" data-plyr-embed-id="${videoId}"></div>`;

    if (description) {
        descEl.innerHTML = description;
        descEl.classList.remove('hidden', 'fade-in-slow');
        void descEl.offsetWidth;
        descEl.classList.add('fade-in-slow');
    } else {
        descEl.innerHTML = '';
        descEl.classList.add('hidden');
        descEl.classList.remove('fade-in-slow');
    }

    lb.classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const ytConfig = { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 };
        if (startTime > 0) ytConfig.start = startTime;

        lightboxPlayer = new Plyr('#lb-plyr', {
            controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
            settings: ['quality', 'speed'],
            youtube: ytConfig,
            autoplay: true
        });
        lightboxPlayer.on('ready', () => {
            lightboxPlayer.volume = 0.75;
            forceYouTubeHD(wrap);
        });
    }, 50);
}

        function closeLightbox() {
            document.getElementById('video-lightbox').classList.remove('active');
            document.body.style.overflow = view.classList.contains('active') ? 'hidden' : '';

            if (lightboxPlayer) {
                const fadeDuration = 600;
                const steps = 20;
                const stepTime = fadeDuration / steps;
                const volStep = lightboxPlayer.volume / steps;
                let currentVol = lightboxPlayer.volume;
                
                const fadeInterval = setInterval(() => {
                    if (currentVol > volStep) {
                        currentVol -= volStep;
                        try { lightboxPlayer.volume = currentVol; } catch(e) {}
                    } else {
                        clearInterval(fadeInterval);
                        try { lightboxPlayer.pause(); lightboxPlayer.destroy(); } catch (e) { } 
                        lightboxPlayer = null;
                        document.getElementById('lightbox-player-wrap').innerHTML = '';
                    }
                }, stepTime);
            } else {
                document.getElementById('lightbox-player-wrap').innerHTML = '';
            }

            const descEl = document.getElementById('lightbox-desc');
            descEl.innerHTML = '';
            descEl.classList.add('hidden');
            descEl.classList.remove('fade-in-slow');

            const metrics = getCarouselMetrics();
            Object.keys(carouselState).forEach(id => {
                const s = carouselState[id];
                if (s && s.targetEl) {
                    s.isClosing = true; s.currentSpeed = 0;
                    s.items.forEach(item => {
                        item.style.transition = 'none';
                        if (item.classList.contains('active')) {
                            item.style.width = item.style.width || metrics.activeW + 'px';
                            item.style.height = item.style.height || metrics.activeH + 'px';
                            item.classList.remove('active');
                        }
                    });
                }
            });
        }
        document.getElementById('portfolio-view').addEventListener('click', function(e) {
    const cover = e.target.closest('.inline-cover');
    if (!cover) return;
    const id = cover.getAttribute('data-vid');
    if (id) handleInlineClick(id, cover);
});
        document.getElementById('video-lightbox').addEventListener('click', function (e) { if (e.target === this || e.target.classList.contains('lightbox-inner')) closeLightbox(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

        function toggleSubCategory(id, headerEl) {
            const body = document.getElementById('body-' + id);
            if (!body) return;
            const isOpen = body.classList.contains('open');
        const indicator = headerEl.querySelector('.subcat-indicator');
            if (isOpen) {
                const metrics = getCarouselMetrics();
                Object.keys(carouselState).forEach(cId => {
                    const s = carouselState[cId];
                    if (s && s.targetEl && !s.isClosing) {
                        s.isClosing = true; s.currentSpeed = 0;
                        s.items.forEach(item => {
                            item.style.transition = 'none';
                            if (item.classList.contains('active')) {
                                item.style.width = item.style.width || metrics.activeW + 'px';
                                item.style.height = item.style.height || metrics.activeH + 'px';
                                item.classList.remove('active');
                            }
                        });
                    }
                });
            body.classList.remove('open'); 
            headerEl.classList.remove('open');
            if (indicator) indicator.textContent = 'ABRIR';
        } else { 
            body.classList.add('open'); 
            headerEl.classList.add('open'); 
            if (indicator) indicator.textContent = 'FECHAR';
        }
        }

        function buildSubCategory(id, label, videosHTML) {
            return `
            <div class="flex flex-col w-full border-b border-white/5 pb-4">
                <div class="subcat-header" onclick="toggleSubCategory('${id}',this)">
                    <span class="subcat-title">${label}</span>
                    <span class="subcat-indicator">ABRIR</span>
                </div>
                <div class="subcat-body" id="body-${id}">
                    <div class="subcat-body-inner">
                        <div class="subcat-body-inner-pad">${videosHTML}</div>
                    </div>
                </div>
            </div>`;
        }

        const spotlightItems = new Map();
let spotlightRaf = null;

function tickSpotlight() {
    spotlightItems.forEach((state, el) => {
        const target = state.inSpotlight ? 1 : 0.15;
        const targetScale = state.inSpotlight ? 1 : 0.95;

        state.opacity += (target - state.opacity) * 0.08;
        state.scale += (targetScale - state.scale) * 0.08;

        el.style.opacity = state.opacity;
       const scaleEl = el.querySelector('.spotlight-scale-target');
if (scaleEl) scaleEl.style.transform = `scale(${state.scale})`;

        const player = el.plyrInstance;
        const coverEl = el.querySelector('.inline-cover');

        if (!state.inSpotlight) {
            // Cenário A: O vídeo já está pausado. Retorna a capa instantaneamente.
            if (player && !player.playing) {
                if (coverEl && coverEl.style.opacity !== '1') {
                    coverEl.style.display = 'flex';
                    coverEl.style.opacity = '1';
                }
            } 
            // Cenário B: O vídeo está rodando. Deixa encolher tocando e pausa só no final.
            else if (state.opacity < 0.16) {
                if (player && player.playing) {
                    player.pause();
                    if (coverEl) {
                        coverEl.style.display = 'flex';
                        void coverEl.offsetWidth; // Força reflow para a transição
                        coverEl.style.opacity = '1';
                    }
                }
            }
        }
    });
    spotlightRaf = requestAnimationFrame(tickSpotlight);
}

const spotlightObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        const state = spotlightItems.get(e.target);
        if (state) state.inSpotlight = e.isIntersecting;
    });
}, { root: document.getElementById('portfolio-view'), rootMargin: '-30% 0px -30% 0px', threshold: 0 });

const lazyVidObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        const vid = e.target;
        if (e.isIntersecting) {
            if (!vid.src && vid.dataset.src) {
                vid.src = vid.dataset.src;
                vid.load();
            }
            vid.play().catch(()=>{});
        } else {
            if (!vid.paused) vid.pause();
        }
    });
}, { root: document.getElementById('portfolio-view'), rootMargin: '100px', threshold: 0.05 });

        function openCategory(name, isLoad = false) {
            if (!view.classList.contains('active') && !isLoad) lastScrollPosition = window.scrollY;
            if (!isLoad) {
                const url = new URL(window.location);
                url.searchParams.set('cat', name);
                history.pushState({ cat: name }, '', url);
            }
            currentPlayers.forEach(p => { try { p.pause(); } catch (e) { } });
            currentPlayers = [];
            Object.keys(carouselState).forEach(id => { if (carouselState[id] && carouselState[id].rafId) cancelAnimationFrame(carouselState[id].rafId); });

            const setupCategory = () => {
                descElement.innerText = descricoesPortfolio[name] || '';
                updateCategoryNav(name);
                document.body.style.overflow = 'hidden';
                updateHeaderBlur();

                if (name === 'Vídeos Diários') {
                    contentArea.innerHTML =
                        buildSubCategory('analises', 'Análises',
                            buildInlineVideo('csh7Z3dcb0g', 'Triagem e edição de 5 horas de material bruto não catalogado em uma janela de 7 horas para entrega. Catalogação e montagem em fluxo contínuo.') +
                            buildInlineVideo('82Ah3XW5Jg4', 'Curadoria de mais de 70 horas de material bruto para seleção dos takes utilizados como b-roll. Volume exigiu triagem criteriosa — cada fragmento escolhido serve à construção do vídeo com precisão.') +
                            buildCarousel('analises-vol')) +
                        '<div style="margin-top:6px">' + buildSubCategory('comentados', 'Comentados', buildInlineVideo('ll3UYdXXhlE', 'Estruturação narrativa pautada na alternância entre relatos e acontecimentos. Equilíbrio entre discurso e ação do início ao fim.') + buildCarousel('comentados-vol')) + '</div>' +
                        '<div style="margin-top:6px">' + buildSubCategory('noticias', 'Notícias', buildInlineVideo('d0d43qkOE7A', 'Produção ágil focada na pesquisa de fontes e curadoria de mídias para suporte à narrativa visual. Clareza informativa em janelas de tempo reduzidas.') + buildCarousel('noticias-vol')) + '</div>';

                } else if (name === 'Highlights') {
                    contentArea.innerHTML = `<div class="flex flex-col gap-12 w-full">
                        ${buildInlineVideo('ewiL53kmyPI', 'Edição de materiais brutos de transmissões ao vivo com foco na construção de ritmo e tom.')}
                        ${buildInlineVideo('f-2xznYjToI', 'Processamento de 16 horas de material bruto com alta densidade informativa. Encadeamento de múltiplos eventos para romper a linearidade.')}
                        ${buildCarousel('highlights-vol')}</div>`;

                } else if (name === 'Produções Documentais') {
                    contentArea.innerHTML = `<div class="flex flex-col gap-12 w-full">
                        ${buildInlineVideo('yiK_Z7XGyBA', 'Curadoria visual focada em fragmentos de outras obras que não apenas ilustrassem, mas amplificassem emocionalmente cada trecho da narrativa.')}
                        ${buildInlineVideo('qgXUQirQ7Bk', 'Montagem documental estruturada a partir de 1h30 de material bruto e extensa busca por mídias externas. Integração de referências visuais para conduzir a narrativa.')}</div>`;

                } else if (name === 'Aberturas') {
                    contentArea.innerHTML = `<div class="flex flex-col gap-12 w-full">
                        ${buildInlineVideo('G4qpobpXdKo', 'Cenas inéditas desenvolvidas com IA e treinamento de LoRAs para 14 personagens, superando a escassez de materiais oficiais. Aproximadamente 300 horas entre geração e pós-produção.')}
                        ${buildCarousel('aberturas-vol')}</div>`;

                } else if (name === 'Institucionais') {
                    contentArea.innerHTML = `<div class="flex flex-col gap-12 w-full">
                        ${buildInlineVideo('4minjPUiGdI', 'Execução integral do projeto — da idealização ao roteiro, suprindo a ausência de direcionamento criativo. Curadoria de imagens e locução conduzidas internamente.')}
                        ${buildInlineVideo('O03qeBRocIs', 'Animação e dinâmica de elementos gráficos para uma identidade institucional fictícia via motion design. Fluidez de movimentos e precisão técnica como prioridade.')}</div>`;
                }

                view.scrollTop = 0; view.classList.add('active');
                setTimeout(() => {
                    initCarousels();
                    if (spotlightRaf) cancelAnimationFrame(spotlightRaf);
                    spotlightItems.clear();
                    document.querySelectorAll('.inline-video-wrapper').forEach(el => {
                        el.classList.add('spotlight-item');
                        spotlightItems.set(el, { opacity: 0.15, scale: 0.95, inSpotlight: false });
                        spotlightObs.observe(el);
                    });
                    document.querySelectorAll('.lazy-video').forEach(vid => lazyVidObs.observe(vid));
                    tickSpotlight();
                }, 50);
            };

            if (isLoad) {
                setupCategory();
            } else {
                triggerTransition(setupCategory);
            }
        }

        const capaImg = document.querySelector('.capa-img-full');
        capaImg.addEventListener('load', () => { capaImg.style.opacity = '1'; updateHeaderBlur(); });
if (capaImg.complete) { capaImg.style.opacity = '1'; updateHeaderBlur(); }
        const perfilImg = document.getElementById('perfil-img');
        if (perfilImg) {
            perfilImg.addEventListener('load', () => { perfilImg.classList.remove('opacity-0'); });
            if (perfilImg.complete) perfilImg.classList.remove('opacity-0');
        }

        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');
        if (contactForm) {
            contactForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = contactForm.querySelector('button[type="submit"]');
                const orig = btn.innerText; btn.innerText = 'ENVIANDO...';
                try {
                    const res = await fetch(contactForm.action, { method: contactForm.method, body: new FormData(contactForm), headers: { 'Accept': 'application/json' } });
                    if (res.ok) { formStatus.innerText = 'Obrigado pela mensagem! Entrarei em contato em breve para falarmos sobre o seu projeto.'; formStatus.style.color = '#f3f3f3'; contactForm.reset(); }
                    else { formStatus.innerText = 'Oops! Ocorreu um erro ao enviar sua mensagem.'; formStatus.style.color = '#f87171'; }
                } catch (err) { formStatus.innerText = 'Oops! Ocorreu um erro ao enviar sua mensagem.'; formStatus.style.color = '#f87171'; }
                finally { formStatus.classList.remove('hidden'); btn.innerText = orig; }
            });
        }

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && hasClickedMenu) {
                    const id = entry.target.getAttribute('id');

                    if (id === 'capa') {
                        history.replaceState(null, null, window.location.pathname);
                    } else if (id) {
                        history.replaceState(null, null, `#${id}`);
                    }
                }
            });
        }, {
            threshold: 0.5
        });

        document.querySelectorAll('section[id]').forEach(section => {
            scrollObserver.observe(section);
        });

        // WhatsApp: feedback visual em dispositivos touch (mobile)
        // Em touch, o :hover do CSS não dispara — este script simula o mesmo efeito
        (function () {
            function applyWaTouch() {
                var wa = document.getElementById('wa-link');
                if (!wa) return;
                var svg = wa.querySelector('svg');
                var numEl = wa.querySelector('span:first-of-type');
                var badge = wa.querySelector('span:last-of-type');

                wa.addEventListener('touchstart', function () {
                    wa.style.color = '#f3f3f3';
                    if (svg) svg.style.stroke = '#f3f3f3';
                    if (numEl) numEl.style.transform = 'translateX(4px)';
                    if (badge) {
                        badge.style.opacity = '1';
                        badge.style.color = '#f3f3f3';
                        badge.style.transform = 'translateX(0)';
                    }
                }, { passive: true });

                wa.addEventListener('touchend', function () {
                    setTimeout(function () {
                        wa.style.color = '';
                        if (svg) svg.style.stroke = '';
                        if (numEl) numEl.style.transform = '';
                        if (badge) {
                            badge.style.opacity = '';
                            badge.style.color = '';
                            badge.style.transform = '';
                        }
                    }, 400);
                }, { passive: true });
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', applyWaTouch);
            } else {
                applyWaTouch();
            }
        })();

        // ATUALIZADO: Restaura a categoria via URL ou limpa a URL e vai pro topo
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('cat');
        if (catParam) {
            openCategory(catParam, true);
        } else {
            window.scrollTo(0, 0);
            history.replaceState(null, null, window.location.pathname);
            updateHeaderBlur();
            document.getElementById('sticky-header').style.opacity = '1';
        }

        // --- NOVAS IMPLEMENTAÇÕES (DESIGN & UX) ---

        // 1. Text Reveal Wrap
        document.querySelectorAll('.titulo-secao').forEach(el => {
            const text = el.innerHTML;
            el.innerHTML = `<span class="reveal-wrap"><span class="reveal-text">${text}</span></span>`;
        });

        // 2. Magnetic Buttons (Intensidade reduzida)
        document.querySelectorAll('.category-nav-btn, button[type="submit"]').forEach(btn => {
            btn.classList.add('magnetic-btn');
            btn.addEventListener('mousemove', e => {
                if (window.innerWidth <= 768) return;
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });