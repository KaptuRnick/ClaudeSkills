#!/usr/bin/env node
// Zakładka „Do sprawdzenia” strony sesji (pierwsza): ostatnie wgranie na test. Z do-sprawdzenia.json karty ze zrzutami
// (sprawdzenie-karty.mjs, Andrzej 2026-11-23: widok ma pokazywać, nie opisywać); z .md lista tekstowa (sprawdzenie-md.mjs).
// Użycie: node sprawdzenie.mjs <do-sprawdzenia.json|.md> <out.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { kartyHtml } from './sprawdzenie-karty.mjs';
import { mdNaHtml } from './sprawdzenie-md.mjs';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('Użycie: sprawdzenie.mjs <plik.json|plik.md> <out.html>'); process.exit(2); }
const tresc = src.endsWith('.json') ? kartyHtml(JSON.parse(readFileSync(src, 'utf8')), dirname(src)) : mdNaHtml(readFileSync(src, 'utf8'));

writeFileSync(out, `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Do sprawdzenia</title><style>
:root{--ivory:#FAF9F5;--slate:#141413;--clay:#D97757;--oat:#E3DACC;--mute:#8a877f;--sky:#6A9BCC}
*{box-sizing:border-box}body{margin:0;background:var(--ivory);color:var(--slate);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
.wrap{max-width:1100px;margin:0 auto;padding:24px 20px 60px}
h1{font-size:24px;margin:0 0 4px}h2{font-size:19px;margin:28px 0 8px}.adres{margin:0 0 6px}.pods{color:var(--mute);margin:0 0 18px}
a{color:#b5552f}code{font:13.5px ui-monospace,monospace;background:#efe9df;padding:0 4px;border-radius:3px}
.karty{display:grid;gap:18px}
.karta{background:#fff;border:1px solid var(--oat);border-radius:12px;overflow:hidden}
.karta header{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--oat)}
.karta .nr{flex:none;width:32px;height:32px;border-radius:50%;background:var(--clay);color:#fff;font-weight:700;display:grid;place-items:center}
.karta.ukryta .nr{background:var(--sky)}.karta.ukryta{border-color:#c9daea}
.karta .akcja{font-weight:600}.karta .kod{margin-left:auto;font:12px ui-monospace,monospace;color:var(--mute);white-space:nowrap}
.zr{display:grid;grid-template-columns:minmax(0,360px) auto minmax(0,360px);justify-content:center;gap:14px;align-items:center;padding:14px}
.zr.jeden{grid-template-columns:minmax(0,360px)}
.zr figure{margin:0}.zr img{width:100%;display:block;border:1px solid var(--oat);border-radius:10px}
.zr figcaption{font-size:13px;color:var(--mute);margin-top:6px;text-align:center}
.strz{font-size:30px;color:var(--clay)}
.wynik,.opis{padding:12px 16px;margin:0}.opis p{margin:4px 0}
.karta footer{padding:0 14px 12px;font-size:12px;color:var(--mute)}
ol.md li{margin:10px 0;padding:10px 12px;background:#fff;border:1px solid var(--oat);border-radius:8px}ol.md li::marker{font-weight:700;color:var(--clay)}
@media (max-width:760px){.zr{grid-template-columns:1fr}.strz{transform:rotate(90deg);justify-self:center}}
</style></head><body><div class="wrap">
${tresc}
</div></body></html>`);
console.log(`OK ${out}`);
