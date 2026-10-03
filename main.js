        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

        const stickyHeader = document.getElementById('sticky-header');
        const capa = document.getElementById('capa');



        function updateHeaderBlur() {
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
            if (window.innerWidth <= 768) {
                const capaBottom = capa.offsetTop + capa.offsetHeight;
                const triggerPoint = capaBottom - stickyHeader.offsetHeight;

                if (window.scrollY >= triggerPoint) {
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

        function triggerTransition(cb, options = {}) {
            if (window.ZniackFlow) { window.ZniackFlow.transition(cb, options); return; }
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

        let navigationRevision = 0;
        function restoreRouteFromUrl(options = {}) {
            const revision = ++navigationRevision;
            const url = new URL(window.location.href);
            // The creative portfolio is not part of this public release.
            const hadCategory = url.searchParams.has('cat');
            url.searchParams.delete('cat');
            let sectionId = '';
            try { sectionId = decodeURIComponent(url.hash.slice(1)); } catch (_) {}
            const candidate = document.getElementById(sectionId);
            const target = candidate && candidate.tagName === 'SECTION' ? candidate : capa;
            if (sectionId === 'portfolio') url.hash = '';
            if (hadCategory || url.href !== window.location.href) history.replaceState(history.state, '', url);
            const smoothTravel = options.smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (options.smooth && window.ZniackFlow) window.ZniackFlow.travel(target.offsetTop);
            else window.scrollTo({ top: target.offsetTop, behavior: smoothTravel ? 'smooth' : 'instant' });
            updateHeaderBlur();
            stickyHeader.style.opacity = '1';
            requestAnimationFrame(() => {
                if (revision !== navigationRevision || options.smooth) return;
                window.scrollTo({ top: target.offsetTop, behavior: 'instant' });
                updateHeaderBlur();
            });
        }
        document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const url = new URL(window.location.href);
                url.searchParams.delete('cat');
                url.hash = this.getAttribute('href');
                if (url.href !== window.location.href) history.pushState(null, '', url);
                const revision = ++navigationRevision;
                triggerTransition(() => {
                    if (revision === navigationRevision) restoreRouteFromUrl({smooth:true});
                });
            });
        });
        window.addEventListener('popstate', restoreRouteFromUrl);
        window.addEventListener('hashchange', restoreRouteFromUrl);

        const capaImg = document.querySelector('.capa-img-full');
        capaImg.addEventListener('load', () => { capaImg.style.opacity = '1'; updateHeaderBlur(); });
if (capaImg.complete) { capaImg.style.opacity = '1'; updateHeaderBlur(); }
        const perfilImg = document.getElementById('perfil-img');
        if (perfilImg) {
            perfilImg.addEventListener('load', () => { perfilImg.classList.remove('opacity-0'); });
            if (perfilImg.complete) perfilImg.classList.remove('opacity-0');
        }

        const copyEmailButton = document.getElementById('copy-email');
        const copyEmailStatus = document.getElementById('copy-email-status');
        let copyEmailTimer;
        if (copyEmailButton) {
            copyEmailButton.addEventListener('click', async () => {
                clearTimeout(copyEmailTimer);
                copyEmailStatus.textContent = '';
                try {
                    await navigator.clipboard.writeText('contato@zniack.com');
                    copyEmailStatus.textContent = 'Copiado';
                    copyEmailTimer = setTimeout(() => { copyEmailStatus.textContent = ''; }, 2500);
                } catch (_) {
                    copyEmailStatus.textContent = 'Não foi possível copiar. Selecione o endereço para copiar manualmente.';
                }
            });
        }

        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');
        if (contactForm) {
            contactForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = contactForm.querySelector('button[type="submit"]');
                if (btn.disabled) return;
                const orig = btn.innerText;
                btn.disabled = true;
                contactForm.setAttribute('aria-busy', 'true');
                formStatus.classList.remove('hidden');
                formStatus.textContent = '';
                btn.innerText = 'ENVIANDO...';
                try {
                    const res = await fetch(contactForm.action, { method: contactForm.method, body: new FormData(contactForm), headers: { 'Accept': 'application/json' } });
                    if (res.ok) { formStatus.innerText = 'Obrigado pela mensagem! Entrarei em contato em breve para falarmos sobre o seu projeto.'; formStatus.style.color = '#f3f3f3'; contactForm.reset(); }
                    else { formStatus.innerText = 'Oops! Ocorreu um erro ao enviar sua mensagem.'; formStatus.style.color = '#f87171'; }
                } catch (err) { formStatus.innerText = 'Oops! Ocorreu um erro ao enviar sua mensagem.'; formStatus.style.color = '#f87171'; }
                finally { btn.disabled = false; contactForm.removeAttribute('aria-busy'); btn.innerText = orig; }
            });
        }

        // History entries describe explicit navigation; scrolling does not rewrite them.

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

        restoreRouteFromUrl();
        window.addEventListener('load', () => {
            // Image/font loading can affect section offsets on direct links.
            restoreRouteFromUrl();
        }, { once: true });

        // --- NOVAS IMPLEMENTAÇÕES (DESIGN & UX) ---

        // 1. Text Reveal Wrap
        function initRevealText(container) {
            container.querySelectorAll('.titulo-secao:not(.reveal-processed)').forEach(el => {
                el.classList.add('reveal-processed');
                const text = el.innerHTML;
                el.innerHTML = `<span class="reveal-wrap"><span class="reveal-text">${text}</span></span>`;
            });
        }
        initRevealText(document);

        // 2. Magnetic Buttons (Intensidade reduzida)
        document.querySelectorAll('button[type="submit"]').forEach(btn => {
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
