// Lista „Do sprawdzenia” jako karty (do-sprawdzenia.json): zmiana widoczna = numer, akcja, zrzut „tu stuknij” (ramka na
// miejscu do kliknięcia) i zrzut „ma się pokazać”; zmiana ukryta = co się zmieniło, jak sprawdzić, reguła do potwierdzenia.
// Zdjęcia z <katalog JSON>/zrzuty/NN-przed.png i NN-po.png (robi je skrypt projektu, SPRINT.md → Zrzuty), wklejone base64.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline } from './sprawdzenie-md.mjs';

const nr = (n) => String(n).padStart(2, '0');
function zdjecie(kat, n, rodzaj, alt) {
  const p = join(kat, 'zrzuty', `${nr(n)}-${rodzaj}.png`);
  return existsSync(p) ? `<img alt="${esc(alt)}" src="data:image/png;base64,${readFileSync(p).toString('base64')}">` : '';
}

function kartaUi(p, kat) {
  const przed = zdjecie(kat, p.nr, 'przed', `Punkt ${p.nr}: ${p.akcja}`);
  const po = zdjecie(kat, p.nr, 'po', `Punkt ${p.nr}: ${p.wynik ?? ''}`);
  const fig = (img, opis) => `<figure>${img}<figcaption>${opis}</figcaption></figure>`;
  const zr = przed && po ? `<div class="zr">${fig(przed, 'tu stuknij')}<span class="strz">→</span>${fig(po, `ma się pokazać: ${inline(p.wynik ?? '')}`)}</div>`
    : przed ? `<div class="zr jeden">${fig(przed, `ma być: ${inline(p.wynik ?? '')}`)}</div>`
      : `<p class="wynik">→ ${inline(p.wynik ?? '')}</p>`;
  return `<article class="karta" id="punkt-${p.nr}"><header><span class="nr">${p.nr}</span><span class="akcja">${inline(p.akcja)}</span><span class="kod">${esc(p.kod ?? '')}</span></header>${zr}<footer>odpowiedz: „${p.nr} ok” albo uwaga</footer></article>`;
}

function kartaUkryta(p) {
  const pole = (etykieta, w) => (w ? `<p><b>${etykieta}</b> ${inline(w)}</p>` : '');
  return `<article class="karta ukryta" id="punkt-${p.nr}"><header><span class="nr">${p.nr}</span><span class="akcja">${inline(p.akcja)}</span><span class="kod">${esc(p.kod ?? '')} · zmiana ukryta</span></header><div class="opis">${pole('Co się zmieniło:', p.zmiana)}${pole('Jak sprawdzić:', p.jak)}${pole('Albo potwierdź regułę:', p.regula)}</div><footer>odpowiedz: „${p.nr} ok”, „${p.nr} tak ma działać” albo uwaga</footer></article>`;
}

export function kartyHtml(lista, kat) {
  const adres = lista.adres ? `<p class="adres"><a href="${esc(lista.adres)}" target="_blank" rel="noopener">${esc(lista.adres)}</a></p>` : '';
  const pods = lista.podsumowanie ? `<p class="pods">${inline(lista.podsumowanie)}</p>` : '';
  const karty = (lista.punkty ?? []).map((p) => (p.ukryta ? kartaUkryta(p) : kartaUi(p, kat))).join('\n');
  return `<h1>Do sprawdzenia</h1>${adres}${pods}<div class="karty">${karty}</div>`;
}
