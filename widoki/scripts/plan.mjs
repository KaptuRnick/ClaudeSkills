#!/usr/bin/env node
// Widok HTML planu sprintu z pliku .md.
// Użycie: node plan.mjs <plan.md> <out.html> [--backlog BACKLOG.md] [--title T] [--css plik.css]
// Format planu: `# Tytuł`, `**Cel:** zdanie`, sekcje `## …` z listami, tabelami, akapitami.
// Pozycje `- #NN uwagi` dostają tytuł i priorytet z backlogu (--backlog). `- [ ]` to lista odhaczana na stronie.
// Zero zależności, CSS inline.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const here = dirname(fileURLToPath(import.meta.url));
const backlogPath = flag('--backlog', '');
const cssPath = flag('--css', resolve(here, '../assets/style.css'));
let title = flag('--title', '');
const [src, out] = args;
if (!src || !out) { console.error('Użycie: plan.mjs <plan.md> <out.html> [--backlog B.md] [--title T] [--css c.css]'); process.exit(2); }

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = s => esc(s)
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:]|$)/g, '$1<i>$2</i>');

// Backlog: #NN -> { name, typ } (obsługa formatu `## #NN [Priorytet] Tytuł`).
const bl = {};
if (backlogPath) for (const ln of readFileSync(backlogPath, 'utf8').split('\n')) {
  const h = /^## (#\d+\w*)\s+(.*)$/.exec(ln); if (!h) continue;
  const pm = /^\*{0,2}\[([^\]]+)\]\*{0,2}\s*/.exec(h[2]);
  bl[h[1]] = { name: (pm ? h[2].slice(pm[0].length) : h[2]).replace(/\s*\((odłożone|do omówienia|do zgody|przeniesione)[^)]*\)\s*$/i, ''), typ: pm ? pm[1] : '' };
}

const lines = readFileSync(src, 'utf8').split('\n');
let goal = '', body = [], sec = null, n = 0;
const secs = [];
for (let i = 0; i < lines.length; i++) {
  const ln = lines[i];
  const h1 = /^# (?!#)(.*)$/.exec(ln); if (h1) { if (!title) title = h1[1]; continue; }
  const g = /^\*\*Cel:\*\*\s*(.*)$/.exec(ln); if (g && !sec) { goal = g[1]; continue; }
  const h2 = /^## (.*)$/.exec(ln); if (h2) { sec = { name: h2[1], lines: [] }; secs.push(sec); continue; }
  if (sec) sec.lines.push(ln);
}
if (!title) title = 'Plan sprintu';

function render(ls) {
  const o = []; let i = 0;
  while (i < ls.length) {
    const ln = ls[i];
    if (!ln.trim()) { i++; continue; }
    const h3 = /^###\s+(.*)$/.exec(ln); if (h3) { o.push(`<h3>${inline(h3[1])}</h3>`); i++; continue; }
    if (/^```/.test(ln)) { const b = []; i++; while (i < ls.length && !/^```/.test(ls[i])) b.push(ls[i++]); i++; o.push(`<pre>${esc(b.join('\n'))}</pre>`); continue; }
    if (/^\|/.test(ln)) {
      const rows = []; while (i < ls.length && /^\|/.test(ls[i])) rows.push(ls[i++]);
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]), data = rows.slice(/^\|[\s:|-]+\|?$/.test(rows[1] || '') ? 2 : 1).map(cells);
      o.push(`<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${data.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`); continue;
    }
    if (/^\s*([-*]|\d+\.)\s/.test(ln)) {
      const items = [];
      while (i < ls.length && (/^\s*([-*]|\d+\.)\s/.test(ls[i]) || (/^\s+\S/.test(ls[i]) && items.length))) {
        if (/^\s*([-*]|\d+\.)\s/.test(ls[i])) items.push(ls[i].replace(/^\s*([-*]|\d+\.)\s+/, '')); else items[items.length - 1] += ' ' + ls[i].trim();
        i++;
      }
      o.push('<ul class="plan">' + items.map(t => {
        const c = /^\[( |x|X)\]\s+(.*)$/.exec(t);
        if (c) { n++; return `<li class="chk"><label><input type="checkbox" data-id="c${n}"${c[1] !== ' ' ? ' checked' : ''}> <span>${inline(c[2])}</span></label></li>`; }
        const r = /^(#\d+\w*)\s*(?:[—–-]\s*)?(.*)$/.exec(t);
        if (r) { const b = bl[r[1]]; return `<li class="ref"><span class="code">${esc(r[1])}</span><span class="title">${inline(b ? b.name : r[2].split(' · ')[0])}</span>${b?.typ ? `<span class="tag ${b.typ === 'MUST do startu' ? 'k' : ''}">${esc(b.typ)}</span>` : ''}${b && r[2] ? `<div class="desc">${inline(r[2])}</div>` : (!b && r[2].includes(' · ') ? `<div class="desc">${inline(r[2].split(' · ').slice(1).join(' · '))}</div>` : '')}</li>`; }
        return `<li>${inline(t)}</li>`;
      }).join('') + '</ul>'); continue;
    }
    const p = []; while (i < ls.length && ls[i].trim() && !/^(\||```|###|\s*([-*]|\d+\.)\s)/.test(ls[i])) p.push(ls[i++]);
    o.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return o.join('\n');
}

const css = readFileSync(cssPath, 'utf8');
const date = new Date().toISOString().slice(0, 10);
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${css}
.goal{background:var(--oat);border-left:4px solid var(--clay);padding:14px 18px;border-radius:6px;font-size:1.15em;margin:12px 0 20px}
.goal small{display:block;text-transform:uppercase;letter-spacing:.06em;opacity:.7;margin-bottom:4px}
ul.plan{list-style:none;padding:0;margin:8px 0}ul.plan li{padding:8px 0;border-bottom:1px solid var(--oat)}
li.ref{display:grid;grid-template-columns:auto 1fr auto;gap:2px 12px}li.ref .desc{grid-column:2/4}
li.chk label{cursor:pointer;display:flex;gap:8px}li.chk input:checked+span{opacity:.55;text-decoration:line-through}
table{border-collapse:collapse;width:100%;margin:8px 0}th,td{border:1px solid var(--oat);padding:6px 10px;text-align:left}th{background:var(--oat)}
pre{background:var(--slate);color:var(--ivory);padding:10px;border-radius:6px;overflow:auto}
</style></head><body><div class="wrap">
<h1>${esc(title)}</h1><div class="sub">Widok generowany z <code>${esc(src.split('/').slice(-2).join('/'))}</code> · ${date} · źródło prawdy: plik .md · odhaczenia zapamiętuje przeglądarka</div>
${goal ? `<div class="goal"><small>Cel sprintu</small>${inline(goal)}</div>` : ''}
${secs.map(s => `<section class="sec"><h2>${esc(s.name)}</h2>${render(s.lines)}</section>`).join('\n')}
<div class="foot">widoki · plan sprintu, widok tylko do odczytu. Zmiany rób w pliku .md i wygeneruj ponownie.</div></div>
<script>
const K='widoki:'+location.pathname;let st={};try{st=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
document.querySelectorAll('input[data-id]').forEach(c=>{if(c.dataset.id in st)c.checked=st[c.dataset.id];c.onchange=()=>{st[c.dataset.id]=c.checked;try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}}});
window.lavish?.setDocumentMeta?.({title:${JSON.stringify(title)}});
</script></body></html>`;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`OK ${out}: cel ${goal ? 'tak' : 'brak'}, ${secs.length} sekcji, ${Object.keys(bl).length} wpisów backlogu w słowniku`);
