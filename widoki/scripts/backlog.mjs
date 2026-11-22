#!/usr/bin/env node
// Generuje widok HTML backlogu z pliku .md (lista `- [ ] **KOD — tytuł** ... · K · _typ_`).
// Użycie: node backlog.mjs <backlog.md> <out.html> [--title "Tytuł"] [--css <style.css>]
// Zero zależności. Plik wynikowy jest samowystarczalny (CSS inline).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : d; };
const here = dirname(fileURLToPath(import.meta.url));
const title = flag('--title', 'Backlog');
const cssPath = flag('--css', resolve(here, '../assets/style.css'));
const [src, out] = args;
if (!src || !out) { console.error('Użycie: backlog.mjs <backlog.md> <out.html> [--title T] [--css plik.css]'); process.exit(2); }

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = s => esc(s)
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:]|$)/g, '$1<i>$2</i>');

const lines = readFileSync(src, 'utf8').split('\n');
const sections = []; let cur = null; let h2 = '', h3 = '', item = null;
const flush = () => { if (item && cur) cur.items.push(item); item = null; };
for (const ln of lines) {
  const h = /^(#{2,3})\s+(.*)$/.exec(ln);
  if (h) {
    flush();
    if (h[1] === '##') { h2 = h[2]; h3 = ''; } else h3 = h[2];
    cur = { name: [h2, h3].filter(Boolean).join(' › '), items: [] };
    sections.push(cur); continue;
  }
  const m = /^- \[( |x|X)\]\s+(.*)$/.exec(ln);
  if (m && cur) {
    flush();
    const body = m[2];
    const t = /^\*\*([^*]+?)\*\*\s*(.*)$/.exec(body);
    let head = t ? t[1] : body, rest = t ? t[2] : '';
    let code = '', name = head;
    const cm = /^([^\s—–-]+(?:-[^\s—–]+)*)\s*[—–]\s*(.*)$/.exec(head);
    if (cm) { code = cm[1]; name = cm[2]; }
    item = { done: m[1] !== ' ', code, name, rest, kryt: '', typ: '' };
  } else if (item && /^\s+\S/.test(ln)) item.rest += ' ' + ln.trim();
  else if (item && ln.trim() === '') flush();
}
flush();

// Tryb „wpisy”: `# Grupa` + `## #NN [Priorytet] Tytuł` + pola `**Kontekst:** …` (np. Lumenu).
const entryMode = !sections.some(s => s.items.length) && lines.some(l => /^## #\d+/.test(l));
if (entryMode) {
  sections.length = 0; let g = null, e = null, field = '';
  const push = () => { if (e && g) g.items.push(e); e = null; };
  for (const ln of lines) {
    const g1 = /^# (?!#)(.*)$/.exec(ln);
    if (g1 && !/^# Backlog/.test(ln)) { push(); g = { name: g1[1], items: [] }; sections.push(g); continue; }
    const h = /^## (#\d+\w*)\s+(.*)$/.exec(ln);
    if (h && g) {
      push(); field = '';
      let name = h[2], typ = '';
      const pm = /^\*{0,2}\[(MUST do startu|Potrzebne|Może poczekać)\]\*{0,2}\s*/.exec(name);
      if (pm) { typ = pm[1]; name = name.slice(pm[0].length); }
      e = { done: false, code: h[1], name, rest: '', kryt: typ === 'MUST do startu' ? 'K' : '', typ, fields: [] };
      continue;
    }
    if (!e) continue;
    const f = /^\*\*([^*]+?):\*\*\s*(.*)$/.exec(ln);
    if (f) { field = f[1]; e.fields.push([field, f[2]]); if (/^Co zrobić/.test(field)) e.rest = f[2]; }
    else if (ln.trim() && e.fields.length) e.fields[e.fields.length - 1][1] += ' ' + ln.trim();
  }
  push();
}

for (const s of sections) if (!entryMode) for (const it of s.items) {
  const k = /·\s*\*{0,2}\s*(K|N)\s*\*{0,2}\s*·/.exec(it.rest);
  if (k) { it.kryt = k[1]; it.rest = it.rest.replace(k[0], ' '); }
  const ty = /_(błąd\/funkcja|błąd\/ulepszenie|błąd|funkcja|ulepszenie)_/i.exec(it.rest);
  if (ty) { it.typ = ty[1]; it.rest = it.rest.replace(ty[0], ' '); }
  it.rest = it.rest.replace(/\s*·\s*(?=·|$)/g, ' ').replace(/^[\s·.]+/, '').trim();
}
const secs = sections.filter(s => s.items.length);
const all = secs.flatMap(s => s.items);
const open = all.filter(i => !i.done);
const kCount = open.filter(i => i.kryt === 'K').length;
const typs = [...new Set(all.map(i => i.typ).filter(Boolean))].filter(t => !(entryMode && t === 'MUST do startu'));

const card = it => {
  const long = it.rest.length > 280;
  const d = it.fields ? `<div class="desc"><details><summary>${inline(it.rest.slice(0, 200) || it.fields[0]?.[1].slice(0, 200) || '')}… szczegóły</summary>${it.fields.map(([k, v]) => `<p><b>${esc(k)}:</b> ${inline(v)}</p>`).join('')}</details></div>`
    : long
    ? `<div class="desc"><details><summary>${inline(it.rest.slice(0, 160))}… pokaż całość</summary>${inline(it.rest)}</details></div>`
    : it.rest ? `<div class="desc">${inline(it.rest)}</div>` : '';
  const tags = [it.kryt && `<span class="tag ${it.kryt === 'K' ? 'k' : 'n'}">${entryMode ? 'MUST' : it.kryt === 'K' ? '💣 krytyczny' : 'niekrytyczny'}</span>`,
                it.typ && !(entryMode && it.kryt === 'K') && `<span class="tag">${esc(it.typ)}</span>`].filter(Boolean).join('');
  return `<div class="card${it.done ? ' done' : ''}" data-k="${it.kryt}" data-t="${esc(it.typ)}" data-q="${esc((it.code + ' ' + it.name + ' ' + it.rest).toLowerCase())}">
<span class="code">${esc(it.code || '·')}</span><span class="title">${inline(it.name)}</span>${d}${tags ? `<div class="tags">${tags}</div>` : ''}</div>`;
};

const css = readFileSync(cssPath, 'utf8');
const date = new Date().toISOString().slice(0, 10);
const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${css}</style></head><body><div class="wrap">
<h1>${esc(title)}</h1><div class="sub">Widok generowany z <code>${esc(src.split('/').slice(-2).join('/'))}</code> · ${date} · źródło prawdy: plik .md</div>
<div class="stats"><div class="stat"><b>${open.length}</b>otwarte</div><div class="stat"><b>${kCount}</b>${entryMode ? 'MUST do startu' : 'krytyczne'}</div><div class="stat"><b>${open.length - kCount}</b>${entryMode ? 'pozostałe' : 'niekrytyczne'}</div></div>
<div class="bar"><input id="q" type="search" placeholder="Szukaj: kod, tytuł, opis…">
<button class="chip" data-f="k" aria-pressed="false">${entryMode ? '💣 tylko MUST' : '💣 tylko krytyczne'}</button>
${typs.map(t => `<button class="chip" data-f="t:${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>
${secs.map(s => `<section class="sec"><h2>${esc(s.name)} <span class="sub">(${s.items.length})</span></h2>${s.items.map(card).join('\n')}</section>`).join('\n')}
<div class="foot">widoki · widok tylko do odczytu. Zmiany rób w pliku .md, widok odświeży się po regeneracji.</div></div>
<script>
const q=document.getElementById('q'),chips=[...document.querySelectorAll('.chip')];
function apply(){const t=q.value.toLowerCase().trim(),on=chips.filter(c=>c.getAttribute('aria-pressed')==='true').map(c=>c.dataset.f);
document.querySelectorAll('.card').forEach(c=>{let ok=!t||c.dataset.q.includes(t);
if(on.includes('k')&&c.dataset.k!=='K')ok=false;
on.filter(f=>f.startsWith('t:')).forEach(f=>{if(c.dataset.t!==f.slice(2))ok=false});
c.classList.toggle('hidden',!ok)});
document.querySelectorAll('.sec').forEach(s=>s.classList.toggle('hidden',!s.querySelector('.card:not(.hidden)')))}
q.addEventListener('input',apply);chips.forEach(c=>c.onclick=()=>{c.setAttribute('aria-pressed',c.getAttribute('aria-pressed')==='true'?'false':'true');apply()});
window.lavish?.setDocumentMeta?.({title:${JSON.stringify(title)}});
</script></body></html>`;
mkdirSync(dirname(resolve(out)), { recursive: true });
writeFileSync(out, html);
console.log(`OK ${out}: ${all.length} pozycji (${open.length} otwartych, ${kCount} K), ${secs.length} sekcji`);
