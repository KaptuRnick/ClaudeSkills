// Wysyłka odpowiedzi z zakładki „Do sprawdzenia” (Lavish): ocena OK / Nie ok i uwagi każdej karty plus „Dodatkowe uwagi”
// w jednej wiadomości do agenta (wzór „tracked batch” z playbooka Lavisha: stan lokalny, jedno wysłanie).
export const SKRYPT = `
document.getElementById('odp-f').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = document.getElementById('odp-s');
  const punkty = [...document.querySelectorAll('[data-nr]')].map((k) => ({
    nr: k.dataset.nr, ocena: k.querySelector('.ocena input:checked')?.value ?? '', uwagi: k.querySelector('.odp-uwagi')?.value.trim() ?? '',
  })).filter((x) => x.ocena || x.uwagi);
  const dodatkowe = document.getElementById('uwagi-t').value.trim();
  if (!punkty.length && !dodatkowe) { s.textContent = 'Zaznacz OK / Nie ok albo wpisz uwagę.'; return; }
  if (!window.lavish?.queuePrompt) { s.textContent = 'Wysyłka działa tylko w Lavishu (adres http://127.0.0.1…).'; return; }
  const linie = punkty.map((x) => x.nr + ': ' + (x.ocena || 'bez oceny') + (x.uwagi ? ' — ' + x.uwagi : ''));
  if (dodatkowe) linie.push('Dodatkowe uwagi (spoza zmian): ' + dodatkowe);
  window.lavish.queuePrompt('Odpowiedzi „Do sprawdzenia” (każdy numer rozlicz: ok → GO, nie ok albo uwaga → poprawka):\\n' + linie.join('\\n'),
    { tag: 'odpowiedzi-sprawdzenia', text: linie.join(' | '), element: e.currentTarget, data: { punkty, dodatkowe } });
  window.lavish.sendQueuedPrompts?.();
  s.textContent = 'Wysłane: ' + linie.length + (linie.length === 1 ? ' odpowiedź.' : ' odpowiedzi.');
});
`;
