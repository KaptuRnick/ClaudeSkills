#!/usr/bin/env node
// Zakładka „Do sprawdzenia” strony sesji (pierwsza): ostatnie wgranie na test. Z do-sprawdzenia.json karty ze zrzutami
// i stałym miejscem odpowiedzi przy każdej (sprawdzenie-karty.mjs, Andrzej 2026-11-23: widok ma pokazywać, nie opisywać);
// z .md lista tekstowa (sprawdzenie-md.mjs). Pod listą „Dodatkowe uwagi” i jeden przycisk wysyłki (sprawdzenie-skrypt.mjs).
// Użycie: node sprawdzenie.mjs <do-sprawdzenia.json|.md> <out.html>
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { kartyHtml } from './sprawdzenie-karty.mjs';
import { STYL_DECYZJI } from './sprawdzenie-decyzje.mjs';
import { mdNaHtml } from './sprawdzenie-md.mjs';
import { SKRYPT } from './sprawdzenie-skrypt.mjs';
import { STYL } from './sprawdzenie-styl.mjs';

const [src, out] = process.argv.slice(2);
if (!src || !out) { console.error('Użycie: sprawdzenie.mjs <plik.json|plik.md> <out.html>'); process.exit(2); }
const tresc = src.endsWith('.json') ? kartyHtml(JSON.parse(readFileSync(src, 'utf8')), dirname(src)) : mdNaHtml(readFileSync(src, 'utf8'));

writeFileSync(out, `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Do sprawdzenia</title><style>${STYL}${STYL_DECYZJI}</style></head><body><form class="wrap" id="odp-f">
${tresc}
<section class="uwagi" aria-labelledby="uwagi-h">
<h2 id="uwagi-h">Dodatkowe uwagi</h2>
<p>Obserwacje spoza samych zmian, ważne dla sprintu (trafiają do backlogu).</p>
<textarea id="uwagi-t" rows="3" aria-labelledby="uwagi-h"></textarea>
</section>
<div class="wysylka"><button type="submit">Wyślij odpowiedzi</button><span id="odp-s" role="status"></span></div>
</form>
<script>${SKRYPT}</script></body></html>`);
console.log(`OK ${out}`);
