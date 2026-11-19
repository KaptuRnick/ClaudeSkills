# Szablon kontraktu SPRINT.md

Plik w korzeniu repo, czytany przez `sprint-start`, `sprint-checkpoint` (statusy go/nogo + commit) i `end-session`
(wydanie). Zawiera WSZYSTKO, co projektowe; skille są
wspólne. Polecenia ryzykowne (build, wdrożenie, push, nagrody, płatności) zapisuj jako **dokładne komendy** — skill
uruchamia je bez zmian (niska swoboda). Opisy celów (np. „co przetestować”) mogą być luźne (wysoka swoboda).
Plik > 100 linii → zacznij od spisu treści.

```markdown
# SPRINT — <nazwa projektu>

Spis treści: Dokumenty · Wersja · Zgłoszenia · Środowisko testowe · Znaczniki · Bramy jakości · Build i artefakt · Makieta · Wydanie · Git ·
Domknięcie · Zasady

## Dokumenty
- Backlog: `<ścieżka>` — format: <kody/sekcje albo wpisy opisowe> · zrobione: <znika z backlogu → changelog>
- Changelog: `<ścieżka>` — wpis na koniec sesji: `<szablon nagłówka>`
- Spec: `<ścieżka/katalog>` — aktualizowany przy każdym końcu sesji (end-session, krok 8)
- Dziennik sesji: `<ścieżka>` (opcjonalnie) · Pamięć wydania: `<ścieżka>` (opcjonalnie)

## Wersja
- Brak wersjonowania | plik `<ścieżka>` + komenda podbicia (dokładna) + schemat (np. versionCode = 5000 + index)
- Poprzednie wydanie (baza audytów): <ostatni commit zmieniający plik wersji | tag `wydanie-*`>

## Zgłoszenia
- Źródła: brak | dokładne komendy (panel, issues…) · sekrety: `source <plik>` — nigdy nie wypisuj wartości
- Krytyczność: definicja K / N dla projektu · Wagi: D / Ś / L · Kod: `<format>`
- Nagrody: brak | komenda + wyjątki · Oznaczanie obsłużonych: komenda · Plik tymczasowy triażu: `<ścieżka>`

## Środowisko testowe
(format i przewodnik: `reference/srodowisko-testowe.md`)
- Gdzie sprawdzać: <adres / sposób instalacji> · oznaczenie: <jak odróżnić od produkcji>
- Wgranie (dokładnie): `<komenda>` → weryfikacja: `<komenda / wynik>` · Dane: <osobne | wspólne> + zasady
- albo: brak (<powód>, <data>)

## Znaczniki
(format i wdrożenie: `reference/znaczniki.md`)
- Rejestr: `<ścieżka>/znaczniki.json` · przełącznik: `<plik / funkcja>` · obwódka: `<helper>` · panel: `<komponent>`
- Wgranie rejestru na test (dokładnie): `<komenda>` → weryfikacja: `<komenda / wynik>`
- Produkcja czyta rejestr z: `<ścieżka w artefakcie>`
- albo: brak (<powód>, <data>)

## Bramy jakości
| Brama | Komenda (dokładna) | Blokuje? |
|---|---|---|
| Testy | `<komenda>` | tak |
| Zero tekstów na sztywno (i18n) | `<grep pod stack>` | tak |
| Długość plików (code-rules) | `bash ~/.claude/skills/sprint-checkpoint/scripts/audyt-dlugosci.sh <baza> '<glob>' 100 150` | nie — dowolny plik od 150 linii (ZAKAZ) albo ≥ 20% w strefie alarmu (101–149) → wpis do backlogu |

## Build i artefakt
- Brak buildu | komenda (dokładna), wymagania (np. wolny RAM), weryfikacja, gdzie skopiować artefakt

## Makieta
- [Aplikacja z interfejsem: komenda generująca aktualną makietę HTML i ścieżka wyniku (wsad do Claude Design); uruchamiana przy każdym końcu sesji. Bez interfejsu: `brak (powód)`.]

## Wydanie
- Notatki do wydania: brak | gdzie, limit znaków, styl · Wdrożenie przy końcu sesji: brak | komenda (dokładna)
- Zamrożenie kodu po udanym buildzie: tak | nie dotyczy

## Git
- Gałąź: `<main | gałęzie funkcji>` · Commit: język, format, stopka · Checkpoint: lokalny commit bez tagu i pusha · Koniec sesji: tag + push tak | nie
- Pułapki: (np. OneDrive FUSE — `touch` przed `git add` + weryfikacja staged)

## Domknięcie
- Co pokazać przy końcu sesji: weszło / wycofane / czeka (nogo) + tabela backlogu (kolumny, jeśli inne niż domyślne). Listy
  „Do sprawdzenia” przychodzą w trakcie sprintu po każdym wgraniu na test; przy `brak` testu — lista po wydaniu.

## Zasady projektu
- Odsyłacze do CLAUDE.md / standardów (bez kopiowania treści)
```
