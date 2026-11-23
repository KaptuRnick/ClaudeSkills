#!/usr/bin/env node
// Strona sesji: jedna strona z zakładkami, każda zakładka to wygenerowany wcześniej widok HTML.
// Użycie: node sesja.mjs <out.html> --tab "Sesja=raport.html" --tab "Backlog=backlog.html" --tab "Plan=plan.html" [--title T]
// Widoki leżą w jednym dokumencie (sekcje, bez iframe), bo Lavish przypina komentarze tylko do elementów głównego
// dokumentu. Izolację stylów, identyfikatorów i skryptów robi sesja-widok.mjs. Po zmianie widoku uruchom ponownie.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { stylKomentarzy } from './sesja-komentarze.mjs';
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
const panels = tabs.map(([n, f], i) => ({ n, ...skladajWidok(readFileSync(f, 'utf8'), i) }));
const glowa = [...new Set(panels.flatMap((p) => p.glowa.split('\n')).filter(Boolean))].join('\n');
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
section[data-widok]{display:block;min-height:calc(100vh - 48px)}
section[data-widok][hidden]{display:none!important}
</style>
${panels.map((p) => `<style>\n${p.css}\n</style>`).join('\n')}
<style>
/* Komentarze z Lavisha czekające na poprawkę (sesja-komentarze.mjs) */
${stylKomentarzy(dirname(resolve(out)))}
</style>
</head><body>
<nav class="sesja-zakladki" role="tablist"><b>${esc(title)}</b>${panels.map((p, i) => `<button role="tab" data-i="${i}" aria-selected="false">${esc(p.n)}</button>`).join('')}</nav>
${panels.map((p, i) => `<section data-widok="${i}" aria-label="${esc(p.n)}"${p.klasa ? ` class="${esc(p.klasa)}"` : ''} hidden>\n${p.body}\n</section>`).join('\n')}
<script>
${SKRYPT_ZAKRESU}
const bs=[...document.querySelectorAll('nav.sesja-zakladki button')],ss=[...document.querySelectorAll('section[data-widok]')];
function show(i){bs.forEach((b,n)=>b.setAttribute('aria-selected',n===i));ss.forEach((s,n)=>{s.hidden=n!==i});try{history.replaceState(null,'','#'+encodeURIComponent(bs[i].textContent))}catch(e){}}
bs.forEach((b,n)=>b.onclick=()=>show(n));
const h=decodeURIComponent(location.hash.slice(1)),k=bs.findIndex(b=>b.textContent===h);show(k>=0?k:0);
${panels.map((p) => p.js).join('\n')}
window.lavish?.setDocumentMeta?.({title:${JSON.stringify(title)}});
</script></body></html>`;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`OK ${out}: ${panels.length} zakładek (${panels.map((p) => p.n).join(', ')})`);
