// Lista „Do sprawdzenia” jako karty (do-sprawdzenia.json): zmiana widoczna = numer, akcja, zrzut „tu stuknij” (ramka na
// miejscu do kliknięcia) i zrzut „ma się pokazać”; zmiana ukryta = co się zmieniło, jak sprawdzić, reguła do potwierdzenia.
// Pod każdą kartą wynik jako nagłówek i stałe miejsce odpowiedzi: przełącznik OK / Nie ok i pole Uwagi (Andrzej 2026-11-23).
// Zdjęcia z <katalog JSON>/zrzuty/NN-przed.png i NN-po.png (robi je skrypt projektu, SPRINT.md → Zrzuty), wklejone base64.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { esc, inline } from './sprawdzenie-md.mjs';

const nr = (n) => String(n).padStart(2, '0');
function zdjecie(kat, n, rodzaj, alt) {
  const p = join(kat, 'zrzuty', `${nr(n)}-${rodzaj}.png`);
  return existsSync(p) ? `<img alt="${esc(alt)}" src="data:image/png;base64,${readFileSync(p).toString('base64')}">` : '';
}

/** Wynik (nagłówek) i odpowiedź: przełącznik OK / Nie ok, po prawej uwagi; wysyła je przycisk pod listą (sprawdzenie-skrypt.mjs). */
function odpowiedz(p, wynik) {
  const n = `ocena-${p.nr}`;
  return `<div class="odp">${wynik ? `<h3 class="ma-byc">${wynik}</h3>` : ''}<div class="odp-rzad"><div class="ocena" role="radiogroup" aria-label="Ocena punktu ${p.nr}"><label class="tak"><input type="radio" name="${n}" value="ok">OK</label><label class="nie"><input type="radio" name="${n}" value="nie ok">Nie ok</label></div><textarea class="odp-uwagi" rows="2" placeholder="Uwagi do punktu ${p.nr}" aria-label="Uwagi do punktu ${p.nr}"></textarea></div></div>`;
}

function kartaUi(p, kat) {
  const przed = zdjecie(kat, p.nr, 'przed', `Punkt ${p.nr}: ${p.akcja}`);
  const po = zdjecie(kat, p.nr, 'po', `Punkt ${p.nr}: ${p.wynik ?? ''}`);
  const fig = (img, opis) => `<figure>${img}<figcaption>${opis}</figcaption></figure>`;
  const zr = przed && po ? `<div class="zr">${fig(przed, 'tu stuknij')}<span class="strz">→</span>${fig(po, 'ma się pokazać')}</div>`
    : przed ? `<div class="zr jeden">${fig(przed, 'tak ma być')}</div>` : '';
  return `<article class="karta" id="punkt-${p.nr}" data-nr="${p.nr}"><header><span class="nr">${p.nr}</span><span class="akcja">${inline(p.akcja)}</span><span class="kod">${esc(p.kod ?? '')}</span></header>${zr}${odpowiedz(p, `Ma być: ${inline(p.wynik ?? '')}`)}</article>`;
}

function kartaUkryta(p) {
  const pole = (etykieta, w) => (w ? `<p><b>${etykieta}</b> ${inline(w)}</p>` : '');
  return `<article class="karta ukryta" id="punkt-${p.nr}" data-nr="${p.nr}"><header><span class="nr">${p.nr}</span><span class="akcja">${inline(p.akcja)}</span><span class="kod">${esc(p.kod ?? '')} · zmiana ukryta</span></header><div class="opis">${pole('Co się zmieniło:', p.zmiana)}${pole('Jak sprawdzić:', p.jak)}</div>${odpowiedz(p, p.regula ? `Reguła: ${inline(p.regula)}` : '')}</article>`;
}

export function kartyHtml(lista, kat) {
  const adres = lista.adres ? `<p class="adres"><a href="${esc(lista.adres)}" target="_blank" rel="noopener">${esc(lista.adres)}</a></p>` : '';
  const pods = lista.podsumowanie ? `<p class="pods">${inline(lista.podsumowanie)}</p>` : '';
  const karty = (lista.punkty ?? []).map((p) => (p.ukryta ? kartaUkryta(p) : kartaUi(p, kat))).join('\n');
  return `<h1>Do sprawdzenia</h1>${adres}${pods}<div class="karty">${karty}</div>`;
}
