# Przewodnik: środowisko testowe projektu (sprint-start krok 1b)

Cel: każda skończona zmiana sprintu trafia od razu tam, gdzie użytkownik może ją sprawdzić, zanim koniec sesji (`end-session`) wyda ją na
produkcję. Przewodnik kończy się sekcją **Środowisko testowe** w `SPRINT.md` (format na dole) i listą prac technicznych.

## Przebieg — jedno pytanie na raz
1. **Typ projektu** — wyczytaj z repo (build, deploy, manifesty), potwierdź jednym zdaniem. Warianty niżej.
2. **Gdzie sprawdzać** — zaproponuj wariant typowy dla typu (z rekomendacją) i zapytaj o adres / nazwę.
3. **Dane** — osobne czy wspólne z produkcją. Nazwij ryzyka wspólnych danych (niżej) i zaproponuj zasady.
4. **Zgody** — czy wgranie pisze w miejscach, na które jest już zgoda (np. ścieżki z CLAUDE.md). Nowe miejsca → zgoda.
5. **Oznaczenie** — jak użytkownik odróżni test od produkcji na pierwszy rzut oka (napis, nazwa aplikacji, ikona).
6. **Komenda** — dokładna komenda wgrania i weryfikacji; zwykle ten sam skrypt co produkcja z parametrem.
7. **Projekt sekcji** — pokaż, zapisz po akceptacji; prace techniczne: pierwszy cel sprintu albo wpis w backlogu.
Użytkownik nie chce albo nie da się → zapisz `brak (powód)`; wróć do tematu, gdy powód zniknie.

## Warianty wg typu projektu
| Typ | Test (rekomendacja) | Uwagi |
|---|---|---|
| Strona / PWA na hostingu | podkatalog `…/<app>/test/` albo subdomena | podkatalog: bez DNS; subdomena: pełna separacja po hoście |
| Usługa w chmurze (Railway, Fly, Render…) | osobne środowisko / usługa z własnym adresem | sekrety osobno; zadania cykliczne tylko na produkcji |
| Aplikacja mobilna | wariant `test`/`debug` z innym id aplikacji (instaluje się obok) | dostawa: plik APK, ścieżka testów wewnętrznych, dystrybucja testowa; backend testowy albo wspólny z zasadami |
| Biblioteka / CLI / skrypty | instalacja z gałęzi lub ścieżki lokalnej w środowisku użytkownika | często wystarcza `brak` + lista po wydaniu |
| Dokumenty, treści | podgląd (strona podglądu, plik do przejrzenia) | „wgranie” = wygenerowanie podglądu |

## Ryzyka wspólnych danych (test i produkcja na jednej bazie / jednym koncie usługi)
- **Zmiany schematu** z niedokończonej pracy działają od razu na produkcji. Zasada: na test tylko zmiany dodające
  (nowa tabela, nowa kolumna z wartością domyślną); usuwające / zmieniające nazwę lub typ — dopiero przy checkpoincie,
  za zgodą. Najlepiej strażnik w skrypcie wgrania, który zatrzymuje się na takiej zmianie.
- **Kod działający na całych danych** (zadania cykliczne, naliczanie, wysyłki masowe) — tylko z produkcji.
- **Skutki zewnętrzne**: e-maile, płatności, powiadomienia do prawdziwych osób. Test nie wykonuje prawdziwych płatności.
- **Konta**: konto założone na teście jest kontem produkcyjnym; testy na koncie, którego dotykanie nie szkodzi.

## Pułapki: test na tej samej domenie co produkcja (podkatalog)
- Wgranie produkcji z `rsync --delete` (albo podobnym) skasuje katalog testu → wykluczenie w skrypcie produkcji.
- Service worker produkcji obejmuje podkatalog testu → pomija go; nazwy pamięci podręcznej rozdzielone.
- `localStorage` / IndexedDB są wspólne dla domeny → prefiks kluczy testu (produkcja bez zmian).
- Ciasteczka produkcji z szerszą ścieżką trafiają też do testu → inna nazwa ciasteczka w teście.
- Manifest PWA: `start_url` / `scope` względne, żeby test instalował się jako osobna aplikacja.
- Wyszukiwarki: nagłówek `X-Robots-Tag: noindex` w teście.

## Format sekcji w `SPRINT.md`
```markdown
## Środowisko testowe
- Gdzie sprawdzać: <adres / sposób instalacji> · oznaczenie: <jak odróżnić od produkcji>
- Wgranie (dokładnie): `<komenda>` → weryfikacja: `<komenda / oczekiwany wynik>`
- Dane: <osobne | wspólne z produkcją> · zasady: <np. tylko zmiany dodające; zadania cykliczne tylko produkcja>
- Konto do testów: <np. konto firmy właściciela> · zgody na zapis: <ścieżki / „jak produkcja”>
```
Albo: `## Środowisko testowe` + `brak (<powód>, <data>)`.
