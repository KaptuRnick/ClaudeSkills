// Wysyłka odpowiedzi z zakładki „Do sprawdzenia” (Lavish): punkty z włączonym „OK”, wybory „Do Twojej decyzji” i „Dodatkowe uwagi” w jednej wiadomości,
// razem z komentarzami Lavisha (pole „Nie ok” przy karcie komentuje się jak resztę strony; sendQueuedPrompts wysyła wszystko).
export const SKRYPT = `
document.getElementById('odp-f').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = document.getElementById('odp-s');
  const ok = [...document.querySelectorAll('[data-nr]')].filter((k) => k.querySelector('.odp-ok')?.checked).map((k) => k.dataset.nr);
  const decyzje = [...document.querySelectorAll('[data-decyzja]')].map((k) => { const w = k.querySelector('input:checked'); return w ? { id: k.dataset.decyzja, opcja: w.value, tekst: w.dataset.tekst } : null; }).filter(Boolean);
  const dodatkowe = document.getElementById('uwagi-t').value.trim();
  if (!window.lavish?.queuePrompt) { s.textContent = 'Wysyłka działa tylko w Lavishu (adres http://127.0.0.1…).'; return; }
  const linie = [];
  if (ok.length) linie.push('OK: ' + ok.join(', '));
  for (const d of decyzje) linie.push('Decyzja ' + d.id + ': ' + d.opcja + '. ' + d.tekst);
  if (dodatkowe) linie.push('Dodatkowe uwagi (spoza zmian): ' + dodatkowe);
  if (linie.length) window.lavish.queuePrompt('Odpowiedzi „Do sprawdzenia” (OK → GO; komentarze przy „Nie ok” → poprawka; decyzje → wykonać):\\n' + linie.join('\\n'),
    { tag: 'odpowiedzi-sprawdzenia', text: linie.join(' | '), element: e.currentTarget, data: { ok, decyzje, dodatkowe } });
  window.lavish.sendQueuedPrompts?.();
  s.textContent = 'Wysłane' + (ok.length ? ' (OK: ' + ok.join(', ') + ')' : '') + '.';
});
`;
