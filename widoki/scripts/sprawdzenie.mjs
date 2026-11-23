#!/usr/bin/env node
// Zakładka „Do sprawdzenia” strony sesji: podsumowanie ostatniego wgrania na test i numerowana lista (akcja → wynik)
// z pliku Markdown, który agent zapisuje po każdym wgraniu (docs/html/sessions/do-sprawdzenia.md). Obsługuje nagłówki,
// akapity, listy numerowane (numery zostają jak w pliku) i punktowane, **pogrubienie**, `kod`, [link](adres) i gołe adresy.
// Użycie: node sprawdzenie.mjs <do-sprawdzenia.md> <out.html>
import { readFileSync, writeFileSync } from 'node:fs';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('Użycie: sprawdzenie.mjs <plik.md> <out.html>'); process.exit(2); }
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

const html = [];
let lista = null;
const zamknij = () => { if (lista) { html.push(`</${lista}>`); lista = null; } };
for (const linia of readFileSync(src, 'utf8').split('\n')) {
  const h = /^(#{1,3})\s+(.*)$/.exec(linia);
  const ol = /^\s*(\d+)\.\s+(.*)$/.exec(linia);
  const ul = /^\s*[-*]\s+(.*)$/.exec(linia);
  if (h) { zamknij(); const n = h[1].length; html.push(`<h${n}>${inline(h[2])}</h${n}>`); }
  else if (ol) { if (lista !== 'ol') { zamknij(); html.push('<ol>'); lista = 'ol'; } html.push(`<li value="${ol[1]}">${inline(ol[2])}</li>`); }
  else if (ul) { if (lista !== 'ul') { zamknij(); html.push('<ul>'); lista = 'ul'; } html.push(`<li>${inline(ul[1])}</li>`); }
  else if (linia.trim()) { zamknij(); html.push(`<p>${inline(linia)}</p>`); }
  else zamknij();
}
zamknij();

writeFileSync(out, `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Do sprawdzenia</title><style>
:root{--ivory:#FAF9F5;--slate:#141413;--clay:#D97757;--oat:#E3DACC;--mute:#8a877f}
*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--slate);font:16px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:24px 20px 60px}
h1{font-size:24px;margin:0 0 12px}h2{font-size:19px;margin:28px 0 8px;padding-top:12px;border-top:1px solid var(--oat)}h3{font-size:16px;margin:18px 0 6px}
ol,ul{padding-left:28px}ol li{margin:10px 0;padding:10px 12px;background:#fff;border:1px solid var(--oat);border-radius:8px}
ol li::marker{font-weight:700;color:var(--clay)}ul li{margin:4px 0}
code{font:13.5px ui-monospace,monospace;background:#efe9df;padding:0 4px;border-radius:3px}a{color:#b5552f}
</style></head><body><div class="wrap">
${html.join('\n')}
</div></body></html>`);
console.log(`OK ${out}`);
