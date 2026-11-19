# Tabela backlogu — format (sprint-start krok 5, end-session domknięcie)

Kolumny i oznaczenia priorytetu podaje `SPRINT.md` (sekcja **Domknięcie** / **Zgłoszenia**). Domyślne, gdy kontrakt nic
nie mówi:

| Kryt. | Prio | Kod | Opis | Typ | Rekomendacja |
|---|---|---|---|---|---|

- **Kryt.** — 💣 K (krytyczny) / ⚪ N (niekrytyczny) — 💣, nie 🔴, żeby nie mylić z wagą.
- **Prio** — waga: 🔴 duża / 🟠 średnia / 🟢 lekka.
- **Typ** — B błąd / F funkcja / U ulepszenie.
- **Rekomendacja** — jedno zdanie uzasadnienia (blokuje inne, szybki fix, czeka na decyzję, ryzyko regresji…).

Sortowanie: krytyczne najpierw, potem niekrytyczne; w bloku waga duża → średnia → lekka; w wadze błędy → funkcje →
ulepszenia. Pozycje „przed produkcją” (jeśli kontrakt je wyróżnia) — osobno na dole.

Zawsze **cała lista** z backlogu, bez skrótu „TOP 10”. Backlog bez kodów i wag (np. wpisy opisowe) → kolumny wg kontraktu,
a brakujące oceny oznacz „?” zamiast zgadywać.

Nagłówek nad tabelą:
```
## Stan projektu — [data]
Wersja: [z kontraktu albo „bez wersjonowania”] · Cel sprintu: [jedno zdanie, jeśli ustalony]
Nowe z triażu: [kody przyjęte w tej sesji]
```
