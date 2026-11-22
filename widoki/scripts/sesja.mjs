#!/usr/bin/env node
// Strona sesji: jedna strona z zakładkami, każda zakładka to wygenerowany wcześniej widok HTML.
// Użycie: node sesja.mjs <out.html> --tab "Sesja=raport.html" --tab "Backlog=backlog.html" --tab "Plan=plan.html" [--title T]
// Każda zakładka siedzi w ramce iframe (srcdoc), więc jej style i skrypty (wyszukiwarka backlogu, odhaczanie) nie kolidują.
// Po zmianie któregokolwiek widoku uruchom generator ponownie.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const tabs = []; let title = 'Sesja';
for (let i = 0; i < args.length;) {
  if (args[i] === '--tab') { const [n, ...f] = args[i + 1].split('='); tabs.push([n, f.join('=')]); args.splice(i, 2); }
  else if (args[i] === '--title') { title = args[i + 1]; args.splice(i, 2); } else i++;
}
const [out] = args;
if (!out || !tabs.length) { console.error('Użycie: sesja.mjs <out.html> --tab "Nazwa=plik.html" … [--title T]'); process.exit(2); }

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const panels = tabs.map(([n, f]) => ({ n, html: readFileSync(f, 'utf8') }));
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>
:root{--ivory:#FAF9F5;--slate:#141413;--clay:#D97757;--oat:#E3DACC;--mute:#8a877f}
*{box-sizing:border-box}html,body{height:100%;margin:0}body{display:flex;flex-direction:column;background:var(--ivory);color:var(--slate);font:15px system-ui,-apple-system,"Segoe UI",sans-serif}
nav{display:flex;align-items:center;gap:4px;padding:8px 14px;background:var(--slate);flex:none}
nav b{color:var(--ivory);margin-right:14px;font-size:14px}
nav button{font:inherit;font-size:14px;color:#cfcac0;background:none;border:0;border-radius:6px;padding:6px 14px;cursor:pointer}
nav button:hover{background:#2b2a27}nav button[aria-selected=true]{background:var(--clay);color:#fff;font-weight:600}
iframe{flex:1;width:100%;border:0;background:var(--ivory);display:none}iframe.on{display:block}
</style></head><body>
<nav role="tablist"><b>${esc(title)}</b>${panels.map((p, i) => `<button role="tab" data-i="${i}" aria-selected="false">${esc(p.n)}</button>`).join('')}</nav>
${panels.map((p, i) => `<iframe data-i="${i}" title="${esc(p.n)}" srcdoc="${esc(p.html)}"></iframe>`).join('\n')}
<script>
const bs=[...document.querySelectorAll('nav button')],fs=[...document.querySelectorAll('iframe')];
function show(i){bs.forEach((b,n)=>b.setAttribute('aria-selected',n===i));fs.forEach((f,n)=>f.classList.toggle('on',n===i));try{history.replaceState(null,'','#'+encodeURIComponent(bs[i].textContent))}catch(e){}}
bs.forEach((b,n)=>b.onclick=()=>show(n));
const h=decodeURIComponent(location.hash.slice(1)),k=bs.findIndex(b=>b.textContent===h);show(k>=0?k:0);
window.lavish?.setDocumentMeta?.({title:${JSON.stringify(title)}});
</script></body></html>`;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`OK ${out}: ${panels.length} zakładek (${panels.map(p => p.n).join(', ')})`);
