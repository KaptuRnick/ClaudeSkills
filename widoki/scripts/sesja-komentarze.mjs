// Niebieska ramka na elementach skomentowanych w Lavishu, jeszcze nierozliczonych (Andrzej 2026-11-23: widać, gdzie dał
// komentarz). Źródło: komentarze.done (most i lavish-watch.sh), tylko wpisy nowsze od ostatniego zapisu listy
// do-sprawdzenia.(json|md) — po poprawce agent zapisuje nową listę i ramki znikają. Selektory dotyczą strony sesji.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Pola linii w formacie Lavisha: "uid","prompt",selector,tag,"text" (cudzysłowy z \" w środku albo bez). */
function pola(linia) {
  const out = []; let i = 0;
  while (i < linia.length) {
    if (linia[i] === '"') {
      let j = i + 1, s = '';
      while (j < linia.length && linia[j] !== '"') { if (linia[j] === '\\') j++; s += linia[j]; j++; }
      out.push(s); i = j + 2;
    } else { const j = linia.indexOf(',', i); out.push(linia.slice(i, j < 0 ? undefined : j)); i = j < 0 ? linia.length : j + 1; }
  }
  return out;
}

function selektory(tekst, od) {
  const wynik = new Set();
  for (const blok of tekst.split(/^--- /m).slice(1)) {
    const kiedy = new Date(blok.slice(0, 19).replace(' ', 'T'));
    if (!(kiedy > od)) continue;
    for (const l of blok.split('\n').slice(2)) {
      const yaml = /^\s+selector: *"?(.+?)"?$/.exec(l);
      const s = yaml ? yaml[1] : /^\s+"?\d+"?,/.test(l) ? pola(l.trim())[2] : null;
      if (s && !/[{}<]/.test(s) && !/^form#/.test(s)) wynik.add(s.replace(/&gt;/g, '>'));
    }
  }
  return [...wynik];
}

export function stylKomentarzy(katalog) {
  const plik = join(katalog, 'komentarze.done');
  if (!existsSync(plik)) return '';
  const listy = ['do-sprawdzenia.json', 'do-sprawdzenia.md'].map((f) => join(katalog, f)).filter(existsSync);
  const od = listy.length ? new Date(Math.max(...listy.map((f) => statSync(f).mtimeMs))) : new Date(0);
  const s = selektory(readFileSync(plik, 'utf8'), od);
  return s.length ? `${s.join(',\n')}{outline:3px solid #2f80ed!important;outline-offset:3px;border-radius:6px}` : '';
}
