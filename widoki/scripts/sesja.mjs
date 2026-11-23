#!/usr/bin/env node
// Strona sesji: jedna strona z zakładkami, każda zakładka to wygenerowany wcześniej widok HTML.
// Użycie: node sesja.mjs <out.html> --tab "Sesja=raport.html" --tab "Backlog=backlog.html" --tab "Plan=nowy.html,starszy.html" [--title T]
// Kilka plików w zakładce (po przecinku) = wybór u góry zakładki (plany: data, tytuł, status; sesja-plany.mjs).
// Widoki leżą w jednym dokumencie (sekcje, bez iframe), bo Lavish przypina komentarze tylko do elementów głównego
// dokumentu. Izolację stylów, identyfikatorów i skryptów robi sesja-widok.mjs. Po zmianie widoku uruchom ponownie.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { stylKomentarzy } from './sesja-komentarze.mjs';
import { etykietaPlanu } from './sesja-plany.mjs';
import { skladajWidok, SKRYPT_ZAKRESU } from './sesja-widok.mjs';

const args = process.argv.slice(2);
const tabs = []; let title = 'Sesja';
for (let i = 0; i < args.length;) {
  if (args[i] === '--tab') { const [n, ...f] = args[i + 1].split('='); tabs.push([n, f.join('=')]); args.splice(i, 2); }
  else if (args[i] === '--title') { title = args[i + 1]; args.splice(i, 2); } else i++;
}
const [out] = args;
if (!out || !tabs.length) { console.error('Użycie: sesja.mjs <out.html> --tab "Nazwa=plik.html" … [--title T]'); process.exit(2); }

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
let k = 0;
const zakladki = tabs.map(([n, f]) => ({ n, widoki: f.split(',').filter(Boolean).map((plik) => {
  const html = readFileSync(plik, 'utf8');
  return { etykieta: etykietaPlanu(html, plik), ...skladajWidok(html, k++) };
}) }));
const panels = zakladki.flatMap((z) => z.widoki);
const glowa = [...new Set(panels.flatMap((p) => p.glowa.split('\n')).filter(Boolean))].join('\n');
const widok = (p, i, ukryty) => `<div data-widok="${i}"${p.klasa ? ` class="${esc(p.klasa)}"` : ''}${ukryty ? ' hidden' : ''}>\n${p.body}\n</div>`;
let nr = 0;
const tresc = zakladki.map((z, n) => {
  const od = nr; nr += z.widoki.length;
  const wybor = z.widoki.length > 1 ? `<div class="sesja-wybor"><select data-wybor="${n}" aria-label="${esc(z.n)}">${z.widoki.map((p, j) => `<option value="${od + j}">${esc(p.etykieta)}</option>`).join('')}</select></div>` : '';
  return `<section data-zakladka="${n}" aria-label="${esc(z.n)}" hidden>${wybor}\n${z.widoki.map((p, j) => widok(p, od + j, j > 0)).join('\n')}\n</section>`;
}).join('\n');
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
${glowa}
<style>
html,body{margin:0}
nav.sesja-zakladki{position:sticky;top:0;z-index:1000;display:flex;align-items:center;gap:4px;padding:8px 14px;background:#141413;font:15px system-ui,-apple-system,"Segoe UI",sans-serif}
nav.sesja-zakladki b{color:#FAF9F5;margin-right:14px;font-size:14px}
nav.sesja-zakladki button{font:inherit;font-size:14px;color:#cfcac0;background:none;border:0;border-radius:6px;padding:6px 14px;cursor:pointer}
nav.sesja-zakladki button:hover{background:#2b2a27}
nav.sesja-zakladki button[aria-selected=true]{background:#D97757;color:#fff;font-weight:600}
section[data-zakladka]{display:block;min-height:calc(100vh - 48px)}
section[data-zakladka][hidden],div[data-widok][hidden]{display:none!important}
.sesja-wybor{position:sticky;top:48px;z-index:999;padding:8px 14px;background:#2b2a27;font:14px system-ui,sans-serif}
.sesja-wybor select{font:inherit;max-width:100%;padding:4px 8px;border-radius:6px}
/* Komentarz w kolejce Lavisha (jeszcze niewysłany): ta sama niebieska ramka co komentarz czekający na poprawkę. */
[data-lavish-w-kolejce]{outline:3px solid #2f80ed!important;outline-offset:3px;border-radius:6px}
</style>
${panels.map((p) => `<style>\n${p.css}\n</style>`).join('\n')}
<style>
/* Komentarze z Lavisha czekające na poprawkę (sesja-komentarze.mjs) */
${stylKomentarzy(dirname(resolve(out)))}
</style>
</head><body>
<nav class="sesja-zakladki" role="tablist"><b>${esc(title)}</b>${zakladki.map((z, i) => `<button role="tab" data-i="${i}" aria-selected="false">${esc(z.n)}</button>`).join('')}</nav>
${tresc}
<script>
${SKRYPT_ZAKRESU}
const bs=[...document.querySelectorAll('nav.sesja-zakladki button')],ss=[...document.querySelectorAll('section[data-zakladka]')];
document.querySelectorAll('[data-wybor]').forEach((w)=>w.onchange=()=>w.closest('section').querySelectorAll(':scope > [data-widok]').forEach((d)=>{d.hidden=d.dataset.widok!==w.value}));
function show(i){bs.forEach((b,n)=>b.setAttribute('aria-selected',n===i));ss.forEach((s,n)=>{s.hidden=n!==i});try{history.replaceState(null,'','#'+encodeURIComponent(bs[i].textContent))}catch(e){}}
bs.forEach((b,n)=>b.onclick=()=>show(n));
// Lavish podaje stronie selektory komentarzy w kolejce (lavish:queuedAnchors): ramka od razu po dodaniu komentarza.
addEventListener('message',(e)=>{const m=e.data;if(!m||m.type!=='lavish:queuedAnchors')return;
document.querySelectorAll('[data-lavish-w-kolejce]').forEach((el)=>el.removeAttribute('data-lavish-w-kolejce'));
for(const s of Array.isArray(m.selectors)?m.selectors:[]){try{document.querySelectorAll(String(s)).forEach((el)=>el.setAttribute('data-lavish-w-kolejce',''))}catch(_){}}});
const h=decodeURIComponent(location.hash.slice(1)),k=bs.findIndex(b=>b.textContent===h);show(k>=0?k:0);
${panels.map((p) => p.js).join('\n')}
window.lavish?.setDocumentMeta?.({title:${JSON.stringify(title)}});
</script></body></html>`;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`OK ${out}: ${panels.length} zakładek (${panels.map((p) => p.n).join(', ')})`);
