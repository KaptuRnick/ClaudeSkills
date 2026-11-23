// Wysyłka odpowiedzi z zakładki „Do sprawdzenia” (Lavish): punkty z włączonym „OK” i „Dodatkowe uwagi” w jednej wiadomości,
// razem z komentarzami Lavisha (pole „Nie ok” przy karcie komentuje się jak resztę strony; sendQueuedPrompts wysyła wszystko).
export const SKRYPT = `
document.getElementById('odp-f').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = document.getElementById('odp-s');
  const ok = [...document.querySelectorAll('[data-nr]')].filter((k) => k.querySelector('.odp-ok')?.checked).map((k) => k.dataset.nr);
  const dodatkowe = document.getElementById('uwagi-t').value.trim();
  if (!window.lavish?.queuePrompt) { s.textContent = 'Wysyłka działa tylko w Lavishu (adres http://127.0.0.1…).'; return; }
  const linie = [];
  if (ok.length) linie.push('OK: ' + ok.join(', '));
  if (dodatkowe) linie.push('Dodatkowe uwagi (spoza zmian): ' + dodatkowe);
  if (linie.length) window.lavish.queuePrompt('Odpowiedzi „Do sprawdzenia” (OK → GO; komentarze przy „Nie ok” → poprawka):\\n' + linie.join('\\n'),
    { tag: 'odpowiedzi-sprawdzenia', text: linie.join(' | '), element: e.currentTarget, data: { ok, dodatkowe } });
  window.lavish.sendQueuedPrompts?.();
  s.textContent = 'Wysłane' + (ok.length ? ' (OK: ' + ok.join(', ') + ')' : '') + '.';
});
`;
