# Triaż zgłoszeń — procedura (sprint-start, krok 3)

Źródła, filtry, definicje krytyczności i wag, format kodów, nagrody i oznaczanie obsłużonych podaje `SPRINT.md`
(sekcja **Zgłoszenia**). Tu — przebieg wspólny dla wszystkich projektów.

## 1. Zbierz
Uruchom polecenia źródeł z kontraktu. Z każdego zgłoszenia wyłuskaj: identyfikator (do oznaczenia obsłużonych), autora,
datę, wersję / urządzenie, treść, załącznik.

## 2. Odfiltruj (nie idą do okien pytań)
- **Już w backlogu** (to samo zagadnienie). Nowe szczegóły (inne urządzenie, ścieżka, zrzut, potwierdzenie) → dopisz do
  istniejącego wpisu, bez nowego kodu; rozważ nagrodę za wartościowe potwierdzenie (jeśli kontrakt przewiduje nagrody).
- **Naprawione albo nieaktualne** (changelog, żywy kod, starsza wersja) → od razu do oznaczenia jako obsłużone.
  Niepewne — sprawdź w kodzie, nie zgaduj.

## 3. Scal pokrewne
To samo zagadnienie (ta sama funkcja / ekran / mechanizm) = jeden wpis triażu; zachowaj **wszystkie** identyfikatory
i **wszystkich** autorów. Tylko tematycznie sąsiadujące = osobne wpisy.

## 4. Okna pytań — jedno zgłoszenie na raz
Każde wywołanie `AskUserQuestion` dotyczy dokładnie jednego zgłoszenia; dopiero po zapisie przejdź do następnego.
- **Okno 1 — czy się zajmujemy?** Najpierw własne, precyzyjne wyjaśnienie: czego dotyczy, co znaczy, jaki ma wpływ
  (sprawdź w kodzie). Opcje: TAK · NIE · INNE. NIE → wpis usunięty, bez nagrody. INNE → burza mózgów (skill
  `brainstorming`), potem Okno 2.
- **Okno 2 — klasyfikacja** (dwa pytania naraz, o to samo zgłoszenie): krytyczność wg definicji z kontraktu (z moją oceną
  i uzasadnieniem) oraz waga (z moją oceną).

## 5. Zapis
Nadaj kod wg formatu z kontraktu, dopisz do backlogu we właściwej sekcji. Błąd w gotowej funkcji = **nowy wpis z nowym
kodem**, nie reaktywacja starego — backlog trzyma tylko to, co przed nami; zrobione idzie do changelogu.
Nagrody (jeśli kontrakt je przewiduje) — komendą z kontraktu, z wyjątkami z kontraktu.

## 6. Sprzątanie
Gdy cała lista obrobiona: oznacz obsłużone **wszystkie** zgłoszenia (przyjęte, odrzucone, odfiltrowane) komendą
z kontraktu i wyczyść plik tymczasowy triażu. Źródło ma zostać puste.
