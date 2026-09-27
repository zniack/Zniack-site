// Rastreamento para anúncios no Meta.
// 1) Origem na conversa: se o link do anúncio tiver ?ref=... ou utm_content=..., o código
//    é acrescentado ao fim da mensagem do WhatsApp, por exemplo "[ref: gancho-a]".
// 2) Pixel do Meta: fica desligado até META_PIXEL_ID ser preenchido. Com o ID, registra
//    PageView ao abrir a página e o evento padrão Contact em cada clique para o WhatsApp.
//    Antes de ligar, publique o aviso de privacidade da página.
(function () {
  var META_PIXEL_ID = ''; // ex.: '123456789012345'

  var links = Array.prototype.slice.call(document.querySelectorAll('a[data-whatsapp]'));
  var params = new URLSearchParams(window.location.search);
  var ref = (params.get('ref') || params.get('utm_content') || '')
    .replace(/[^\p{L}\p{N}\-_. ]/gu, '')
    .trim()
    .slice(0, 40);
  if (ref) {
    links.forEach(function (link) {
      if (link.href.indexOf('text=') === -1) return;
      link.href = link.href + encodeURIComponent(' [ref: ' + ref + ']');
    });
  }

  if (!META_PIXEL_ID) return;
  /* Código base do Pixel do Meta */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      window.fbq('track', 'Contact', { content_name: link.dataset.whatsapp, content_category: 'whatsapp' });
    });
  });
})();
