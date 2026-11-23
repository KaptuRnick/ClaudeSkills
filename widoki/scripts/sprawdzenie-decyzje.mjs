// Sekcja „Do Twojej decyzji” zakładki „Do sprawdzenia” (Andrzej 2026-11-23: decyzje nie mogą zostawać tylko w czacie).
// do-sprawdzenia.json → "decyzje": [{ "id": "D1", "pytanie": "…", "kontekst": "…", "opcje": ["…", "…"], "rekomendacja": 0 }]
// Karta: pytanie, kontekst, wybór jednej opcji (rekomendowana podpisana, nic nie jest zaznaczone z góry) i pole „Inaczej?”
// do skomentowania w Lavishu. Wybory wysyła ten sam przycisk co odpowiedzi (sprawdzenie-skrypt.mjs).
import { esc, inline } from './sprawdzenie-md.mjs';

function karta(d) {
  const opcje = (d.opcje ?? []).map((o, i) => `<label class="opcja"><input type="radio" name="dec-${esc(d.id)}" value="${i + 1}" data-tekst="${esc(o)}"><span>${inline(o)}${i === d.rekomendacja ? ' <b class="rek">rekomenduję</b>' : ''}</span></label>`).join('');
  return `<article class="karta decyzja" id="decyzja-${esc(d.id)}" data-decyzja="${esc(d.id)}"><header><span class="nr">${esc(d.id)}</span><span class="akcja">${inline(d.pytanie)}</span></header>${d.kontekst ? `<div class="opis"><p>${inline(d.kontekst)}</p></div>` : ''}<div class="odp"><div class="opcje">${opcje}</div><div class="nie-ok">Inaczej? Skomentuj to pole w Lavishu (decyzja ${esc(d.id)}).</div></div></article>`;
}

export function decyzjeHtml(decyzje) {
  if (!decyzje?.length) return '';
  return `<section class="decyzje" aria-labelledby="decyzje-h"><h2 id="decyzje-h">Do Twojej decyzji</h2><div class="karty">${decyzje.map(karta).join('\n')}</div></section>`;
}

export const STYL_DECYZJI = `
.decyzje{margin:8px 0 26px}.decyzje h2{margin:0 0 10px}
.karta.decyzja{border-color:#e6c27a}.karta.decyzja .nr{background:#c7962c;width:auto;min-width:32px;padding:0 8px;border-radius:16px}
.opcje{display:grid;gap:8px;margin:8px 0 12px}
.opcja{display:flex;gap:10px;align-items:flex-start;padding:8px 12px;border:1px solid var(--oat);border-radius:8px;cursor:pointer}
.opcja input{margin-top:4px;accent-color:var(--ok)}.opcja:has(input:checked){border-color:var(--ok);background:#f1f7ef}
.rek{font-size:12px;color:#fff;background:var(--ok);padding:1px 7px;border-radius:10px;margin-left:6px}
.karta.decyzja:has(input:checked) .nie-ok{opacity:.45}
`;
