#!/usr/bin/env node
// Pieczęć zatwierdzenia planu i „Historia uzgodnień” (Andrzej 2026-11-23: zatwierdzony plan z komentarzami ma zostać w repo).
// Wstawia do pliku planu: <meta name="widoki-plan" content="zatwierdzony;DATA;WERSJA"> (status w wyborze planów strony
// sesji), baner pod <h1> i sekcję z komentarzami Andrzeja z Lavisha i tym, jak je uwzględniono. Powtórne wywołanie podmienia.
// Użycie: node plan-zatwierdz.mjs <plan.html> <historia.json>
// historia.json: { "wersja": "v5", "data": "2026-11-23", "kto": "Andrzej",
//   "uzgodnienia": [{ "wersja": "v1→v2", "element": "Cel", "komentarz": "…", "odpowiedz": "…" }] }
import { readFileSync, writeFileSync } from 'node:fs';

const [plik, zrodlo] = process.argv.slice(2);
if (!plik || !zrodlo) { console.error('Użycie: plan-zatwierdz.mjs <plan.html> <historia.json>'); process.exit(2); }
const h = JSON.parse(readFileSync(zrodlo, 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let s = readFileSync(plik, 'utf8')
  .replace(/<meta name="widoki-plan"[^>]*>\n?/g, '')
  .replace(/<p class="widoki-pieczec"[\s\S]*?<\/p>\n?/g, '')
  .replace(/<section id="historia-uzgodnien"[\s\S]*?<\/section>\n?/g, '');

const meta = `<meta name="widoki-plan" content="zatwierdzony;${esc(h.data)};${esc(h.wersja)}">`;
const pieczec = `<p class="widoki-pieczec" style="display:inline-block;margin:6px 0 10px;padding:4px 12px;border-radius:14px;background:#eef2e8;border:1px solid #788C5D;color:#3d5a2a;font-weight:600">✓ Zatwierdzony ${esc(h.data)} · wersja ${esc(h.wersja)} · ${esc(h.kto ?? 'Andrzej')}</p>`;
const wiersze = (h.uzgodnienia ?? []).map((u) => `<tr><td>${esc(u.wersja)}</td><td>${esc(u.element)}</td><td>„${esc(u.komentarz)}”</td><td>${esc(u.odpowiedz)}</td></tr>`).join('\n');
const sekcja = `<section id="historia-uzgodnien" style="margin-top:40px;padding-top:14px;border-top:1px solid #E3DACC">
<h2 style="font-size:19px;margin:0 0 6px">Historia uzgodnień</h2>
<p style="color:#8a877f;margin:0 0 10px">Komentarze z Lavisha do kolejnych wersji planu i to, jak zostały uwzględnione.</p>
<table style="width:100%;border-collapse:collapse;font-size:13.5px"><thead><tr style="text-align:left;color:#8a877f;font-size:12px;text-transform:uppercase"><th style="padding:6px">Wersja</th><th style="padding:6px">Czego dotyczył</th><th style="padding:6px">Komentarz</th><th style="padding:6px">Jak uwzględniono</th></tr></thead>
<tbody>
${wiersze}
</tbody></table>
<style>#historia-uzgodnien td{padding:6px;border-bottom:1px solid #E3DACC;vertical-align:top}</style>
</section>
`;
s = s.replace(/<head>/i, `<head>\n${meta}`).replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/i, `$1\n${pieczec}`);
s = /<div class="foot">/.test(s) ? s.replace(/<div class="foot">/, `${sekcja}<div class="foot">`) : s.replace(/<\/body>/i, `${sekcja}</body>`);
writeFileSync(plik, s);
console.log(`OK ${plik}: zatwierdzony ${h.data} ${h.wersja}, uzgodnień: ${(h.uzgodnienia ?? []).length}`);
