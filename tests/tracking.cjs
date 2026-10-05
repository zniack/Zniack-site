const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const project = process.argv[2] || path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(project, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(project, 'tracking.js'), 'utf8');
const links = [...html.matchAll(/data-whatsapp="([^"]+)" href="([^"]+)"/g)];
assert.equal(links.length, 8);
assert(!script.includes('2618110078639649'), 'O Pixel antigo não deve ser inicializado');
function run({hostname = 'criativos.zniack.com', protocol = 'https:', search = '', withClarity = true} = {}) {
  const clarityEvents = [];
  const waLinks = links.map(([, kind, href]) => ({dataset: {whatsapp: kind}, href, addEventListener(event, callback) {this[event] = callback;}}));
  const window = {location: {hostname, protocol, search}};
  if (withClarity) window.clarity = (...args) => clarityEvents.push(args);
  vm.runInNewContext(script, {window, URLSearchParams, document: {
    querySelectorAll() {return waLinks;}, createElement() {return {};},
    getElementsByTagName() {return [{parentNode: {insertBefore() {}}}];}
  }});
  return {window, waLinks, clarityEvents};
}
const publicVisit = run();
const queue = publicVisit.window.fbq.queue;
assert.deepEqual(Array.from(queue[0]), ['set', 'autoConfig', false]);
assert.deepEqual(Array.from(queue[1]), ['init', '4027703487536896']);
assert.deepEqual(Array.from(queue[2]), ['track', 'PageView']);
assert.equal(queue.length, 3, 'Abrir a página registra apenas PageView');
assert.equal(publicVisit.clarityEvents.length, 0, 'Abrir a página não registra clique');
for (const link of publicVisit.waLinks) {
  const before = queue.length;
  link.click();
  assert.equal(queue.length, before + 1, 'Cada CTA registra exatamente um Contact por clique');
  assert.deepEqual(Array.from(queue.at(-1)).slice(0, 2), ['track', 'Contact']);
  assert.equal(queue.at(-1)[2].content_name, link.dataset.whatsapp);
  assert.equal(queue.at(-1)[2].content_category, 'whatsapp');
  assert.deepEqual(publicVisit.clarityEvents.at(-2), ['event', 'whatsapp_click']);
  assert.deepEqual(publicVisit.clarityEvents.at(-1), ['event', 'whatsapp_' + link.dataset.whatsapp]);
  assert.equal(new URL(link.href).pathname, '/5564992907301');
}
assert(!queue.some(args => args[1] === 'Lead'), 'Clique não equivale a mensagem recebida');
const noClarity = run({withClarity: false});
noClarity.waLinks[0].click();
assert.equal(noClarity.window.fbq.queue.at(-1)[1], 'Contact', 'Clarity indisponível não interrompe o contato');
for (const preview of [{hostname: '127.0.0.1'}, {hostname: 'localhost'}, {hostname: '[::1]'}, {protocol: 'file:'}]) {
  const local = run({...preview, search: '?utm_content=gancho-a'});
  assert.equal(local.window.fbq, undefined, 'A prévia não envia eventos à Meta');
  assert.equal(local.clarityEvents.length, 0);
  assert(new URL(local.waLinks[0].href).searchParams.get('text').endsWith(' [ref: gancho-a]'));
}
const attributed = run({search: '?utm_source=meta&utm_content=Gancho%20A%20%3Cv1%3E'});
assert(new URL(attributed.waLinks[0].href).searchParams.get('text').endsWith(' [ref: Gancho A v1]'));
const explicitRef = run({search: '?ref=TG-A&utm_content=outro'});
assert(new URL(explicitRef.waLinks[0].href).searchParams.get('text').endsWith(' [ref: TG-A]'));
console.log('Aprovado: Pixel novo, PageView isolado, 8 CTAs com Contact, eventos Clarity, origem e exclusão de prévias.');

