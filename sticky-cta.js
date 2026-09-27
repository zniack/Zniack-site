// Barra de WhatsApp fixa no celular: aparece depois que o botão da capa sai da tela
// e some quando o fechamento da página aparece, para não repetir o mesmo botão.
(function () {
  var bar = document.getElementById('sticky-cta');
  var heroActions = document.querySelector('.hero .actions');
  var closing = document.querySelector('.closing');
  if (!bar || !heroActions || !closing || !('IntersectionObserver' in window)) return;
  var mobile = window.matchMedia('(max-width: 720px)');
  var heroPassed = false;
  var closingReached = false;
  function update() { bar.hidden = !(mobile.matches && heroPassed && !closingReached); }
  new IntersectionObserver(function (entries) {
    var entry = entries[entries.length - 1];
    heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(heroActions);
  new IntersectionObserver(function (entries) {
    var entry = entries[entries.length - 1];
    closingReached = entry.isIntersecting || entry.boundingClientRect.top < 0;
    update();
  }).observe(closing);
  if (mobile.addEventListener) mobile.addEventListener('change', update);
})();
