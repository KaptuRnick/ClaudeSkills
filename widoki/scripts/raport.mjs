#!/usr/bin/env node
// Raport końca sesji jako widok HTML z sekcji CHANGELOG-u (`## Checkpoint NN — data (opis)`).
// Użycie: node raport.mjs <CHANGELOG.md> <numer, np. 62> <out.html> [--title T]
// Zero zależności. Kafelki liczb, wykres słupkowy pozycji wg numeru backlogu, karty wpisów.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : d; };
let title = flag('--title', '');
const znPath = flag('--znaczniki', '');   // znaczniki.json projektu (status go/nogo/prod)
const szkPath = flag('--szkice', '');     // JSON { "#NN": "<html/svg szkicu>" }
const [src, num, out] = args;
if (!src || !num || !out) { console.error('Użycie: raport.mjs <CHANGELOG.md> <numer> <out.html> [--title T]'); process.exit(2); }

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

const lines = readFileSync(src, 'utf8').split('\n');
const start = lines.findIndex(l => new RegExp(`^## Checkpoint ${Number(num)}\\b`).test(l));
if (start < 0) { console.error(`Brak sekcji Checkpoint ${num}`); process.exit(1); }
let end = lines.findIndex((l, i) => i > start && /^## /.test(l)); if (end < 0) end = lines.length;
const head = lines[start].replace(/^## /, '');
const items = [];
for (const l of lines.slice(start + 1, end)) {
  const m = /^- \*\*(.+?)\*\*:?\s*(.*)$/.exec(l) || /^- (.+)$/.exec(l) && [null, '', /^- (.*)$/.exec(l)[1]];
  if (!m) continue;
  const label = m[1] || '';
  const ids = [...new Set((label + ' ' + m[2]).match(/#\d+[a-z]?/g) || [])];
  items.push({ label, text: m[2] || '', ids, bl: (label.match(/#(\d+)/) || [])[1] || '' });
}
const zn = znPath ? JSON.parse(readFileSync(znPath, 'utf8')).elementy || [] : [];
const szk = szkPath ? JSON.parse(readFileSync(szkPath, 'utf8')) : {};
const STAT = { 'prod': ['Produkcja', '#5b8c4a'], 'prod-go': ['GO, czeka na wydanie', '#788C5D'], 'prod-nogo': ['NOGO', '#c0453a'] };
const axis = (bl) => {
  const els = zn.filter(e => e.kod.replace(/[a-z]+$/, '') === '#' + bl);
  if (!els.length) return '';
  const st = e => (STAT[e.status] || [e.status, '#8a877f']);
  const stage = els.every(e => e.status === 'prod') ? 3 : els.every(e => e.status !== 'prod-nogo') ? 2 : 1;
  const steps = ['Zrobione na teście', 'Zatwierdzone (GO)', 'Na produkcji'].map((t, n) => `<div class="st${n < stage ? ' on' : ''}"><i></i><span>${t}</span></div>`).join('<em></em>');
  const date = els.map(e => e.wydane).filter(Boolean).sort().pop();
  return `<div class="axis">${steps}</div><div class="subs">${els.map(e => `<span class="sub" style="border-color:${st(e)[1]}" title="${esc(e.nazwa)} · ${esc(st(e)[0])}">${esc(e.kod)} <small>${e.rodzaj === 'ukryta' ? 'niewidoczna' : 'widoczna'}</small></span>`).join('')}</div>${date ? `<div class="when">wydane ${esc(date)}</div>` : ''}`;
};
// Pierwsze zdanie widoczne, reszta (bez powtórzenia) pod „więcej”.
const split = t => { const m = /^(.{40,}?[.!?])\s+(.*)$/s.exec(t); return m && m[2].length > 20 ? [m[1], m[2]] : [t, '']; };
const numbers = [...new Set(items.flatMap(i => i.ids.map(x => x.replace(/[a-z]$/, ''))))];
const groups = {};
for (const i of items) { const k = i.bl ? '#' + i.bl : 'inne'; groups[k] = (groups[k] || 0) + 1; }
const bars = Object.entries(groups).sort((a, b) => b[1] - a[1]);
const max = Math.max(1, ...bars.map(b => b[1]));
const back = (l) => (l.match(/Backlog:/) ? 1 : 0);
if (!title) title = `Raport: ${head.split(' — ')[0]}`;

const barSvg = bars.map(([k, v], n) => {
  const y = 10 + n * 30, w = Math.round(v / max * 520);
  return `<g id="b-${esc(k.slice(1) || 'inne')}"><title>${esc(k)}: ${v} wpisów</title><text x="0" y="${y + 16}" font-size="13">${esc(k)}</text><rect x="70" y="${y}" width="${w}" height="20" rx="4" fill="${n === 0 ? '#D97757' : '#E3DACC'}"/><text x="${80 + w}" y="${y + 15}" font-size="12">${v}</text></g>`;
}).join('');

const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>
:root{--ivory:#FAF9F5;--slate:#141413;--clay:#D97757;--oat:#E3DACC;--mute:#8a877f;--card:#fff}
*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--slate);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1100px;margin:0 auto;padding:28px 22px 60px}
h1{font-size:24px;margin:0 0 4px}h2{font-size:18px;margin:34px 0 10px;padding-top:12px;border-top:1px solid var(--oat)}
.lead{color:var(--mute);margin:0 0 6px}
.kpis{display:grid;grid-template-columns:repeat(2,minmax(0,260px));gap:12px;margin:16px 0}
.kpi{background:var(--card);border:1px solid var(--oat);border-radius:10px;padding:14px}
.kpi b{display:block;font-size:30px;line-height:1.1}.kpi span{font-size:12px;color:var(--mute);text-transform:uppercase;letter-spacing:.05em}
.frame{background:var(--card);border:1px solid var(--oat);border-radius:10px;padding:14px}
svg.fig{width:100%;height:auto;display:block}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--oat);border-left:5px solid var(--clay);border-radius:8px;padding:12px 14px}
.card .ids{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.chip{font:600 11.5px ui-monospace,monospace;background:var(--oat);padding:1px 7px;border-radius:9px}
.card p{margin:0;font-size:13.5px}.card b{font-size:14px}
code{font:12.5px ui-monospace,monospace;background:#efe9df;padding:0 4px;border-radius:3px}
.sketch{margin:8px 0;border:1px dashed #d8d2c6;border-radius:8px;padding:8px;background:#fdfcf9}.sketch .cap{display:block;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--mute);margin-bottom:4px}
.axis{display:flex;align-items:center;gap:4px;margin:10px 0 6px;font-size:11px}.axis .st{display:flex;flex-direction:column;align-items:center;gap:3px;flex:none;width:86px;text-align:center;color:var(--mute)}
.axis .st i{width:14px;height:14px;border-radius:50%;background:var(--oat)}.axis .st.on{color:var(--slate)}.axis .st.on i{background:#5b8c4a}.axis em{flex:1;height:2px;background:var(--oat)}
.subs{display:flex;flex-wrap:wrap;gap:4px}.sub{font:600 11px ui-monospace,monospace;border:2px solid;border-radius:9px;padding:0 6px}.sub small{font:400 10px system-ui;color:var(--mute)}
.when{font-size:11px;color:var(--mute);margin-top:4px}
.card details{margin-top:6px;font-size:13px}.card summary{cursor:pointer;color:var(--clay)}
.foot{margin-top:36px;font-size:12px;color:var(--mute)}
@media (max-width:760px){.kpis{grid-template-columns:1fr 1fr}}
</style></head><body><div class="wrap">
<h1>${esc(title)}</h1>
<p class="lead">${esc(head)}</p>
<p class="lead">Co weszło w tym wydaniu, po jednej karcie na zmianę. Pod tytułem krótki opis, po kliknięciu „pełny opis” cały wpis z CHANGELOG-u.</p>
<div class="kpis">
  <div class="kpi"><b>${items.length}</b><span>zmian w tym wydaniu</span></div>
  <div class="kpi"><b>${numbers.length}</b><span>pozycji backlogu, których dotyczą (numery #NN)</span></div>
</div>
<div class="cards">
${items.map(i => `  <div class="card"><div class="ids">${i.ids.map(x => `<span class="chip" title="numer pozycji w backlogu">${esc(x)}</span>`).join('')}</div><p><b>${inline(i.label)}</b></p>${szk['#' + i.bl] ? `<div class="sketch"><span class="cap">Szkic (poglądowy)</span>${szk['#' + i.bl]}</div>` : ''}${i.bl ? axis(i.bl) : ''}${i.text ? (([h, r]) => `<p>${inline(h)}</p>${r ? `<details><summary>więcej</summary><p>${inline(r)}</p></details>` : ''}`)(split(i.text)) : ''}</div>`).join('\n')}
</div>
<div class="foot">widoki · raport z CHANGELOG.md, sekcja Checkpoint ${esc(num)} · zmiany rób w źródle</div>
</div></body></html>`;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`OK ${out}: ${items.length} wpisów, ${numbers.length} numerów, ${Object.keys(groups).length} grup`);
