// Etykieta planu w wyborze zakładki „Plan” strony sesji: data z nazwy pliku (RRRR-MM-DD-…), tytuł z <title> i status z
// pieczęci zatwierdzenia (<meta name="widoki-plan" content="zatwierdzony;RRRR-MM-DD;vN">, dopisuje plan-zatwierdz.mjs).
import { basename } from 'node:path';

export function etykietaPlanu(html, plik) {
  const data = /^(\d{4}-\d{2}-\d{2})/.exec(basename(plik))?.[1] ?? '';
  const tytul = (/<title>([^<]*)<\/title>/i.exec(html)?.[1] ?? basename(plik)).replace(/^Plan:\s*/i, '').trim();
  const piecz = /<meta name="widoki-plan" content="zatwierdzony;([^;"]*);([^"]*)">/i.exec(html);
  const status = piecz ? `zatwierdzony ${piecz[1]}${piecz[2] ? ` (${piecz[2]})` : ''}` : 'w trakcie';
  return `${data} · ${tytul} · ${status}`;
}
