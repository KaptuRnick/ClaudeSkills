---
name: sprint-start
description: >
  Start sprintu w DOWOLNYM repo — uniwersalny, globalny. Use when user writes "zaczynamy sesję", "zaczynamy nową sesję",
  "sesja startuje", "startujemy sesję", "start sprintu", "nowy sprint" or any variant of starting a work session on an app.
  Czyta kontrakt projektu SPRINT.md (korzeń repo), pokazuje stan (backlog, wersja, ostatnie zmiany), triażuje nowe
  zgłoszenia jedno po drugim, pokazuje pełną tabelę backlogu (zawsze, przed pytaniem o cel) i ustala cel sprintu. Bez SPRINT.md — tworzy go z szablonu.
  Sprawdza środowisko testowe i mechanizm znaczników go/nogo (sekcje kontraktu), prowadzi przez ich przygotowanie, gdy
  ich brak; pokazuje elementy prod-nogo czekające z poprzednich sesji; wypisuje zasady pracy w sprincie: każda skończona
  zmiana od razu na test z listą „Do sprawdzenia” i wpisem w rejestrze znaczników.
---

# Sprint — start

Sesja = **start** (ten skill) → praca na **środowisku testowym** → **checkpointy** (skill `sprint-checkpoint`: statusy
prod-go / prod-nogo + lokalny commit, dowolnie często) → **koniec sesji** (skill `end-session`, `/end-session`: wydanie
na produkcję tylko elementów `prod-go`, wycofanie `prod-nogo`). Wszystko, co zależy od projektu
(ścieżki, źródła zgłoszeń, reguły triażu, format backlogu), żyje w **`SPRINT.md` w korzeniu repo** — ten skill jest
wspólny dla wszystkich projektów i niczego projektowego nie zakłada.

Modele: pisany i sprawdzany na Opus / Sonnet; dla Haiku kroki są w liście kontrolnej, a ryzykowne polecenia — w `SPRINT.md`
jako dokładne komendy.

## Referencje (czytaj tylko gdy krok ich wymaga)
- `reference/szablon-sprint.md` — szablon kontraktu `SPRINT.md` (krok 1, gdy go brak).
- `reference/srodowisko-testowe.md` — przewodnik przygotowania środowiska testowego (krok 1b, gdy sekcji brak).
- `reference/znaczniki.md` — mechanizm go/nogo: rejestr, przełącznik, obwódki, panel „Zmiany” (krok 1c, praca).
- `reference/triaz.md` — procedura triażu zgłoszeń (krok 3).
- `reference/tabela-backlogu.md` — format i sortowanie tabeli backlogu (krok 5; używają też sprint-checkpoint i end-session).

## Lista kontrolna — skopiuj do odpowiedzi i odhaczaj

```
- [ ] 1. Kontrakt: SPRINT.md znaleziony (albo utworzony i zatwierdzony)
- [ ] 1b. Środowisko testowe: sekcja kompletna (albo przygotowana z użytkownikiem / świadome „brak”)
- [ ] 1c. Znaczniki: sekcja kompletna (albo wdrożenie automatycznie jako pierwsze zadanie sesji / świadome „brak”)
- [ ] 2. Stan: backlog, wersja, ostatnie zmiany, git, elementy prod-go / prod-nogo z rejestru
- [ ] 2b. Widok HTML: `sprint-widok.sh` uruchomiony i adres strony podany (PRZED triażem i przed każdym pytaniem)
- [ ] 3. Zgłoszenia: zebrane, przefiltrowane, striażowane po jednym (albo: brak źródeł)
- [ ] 4. Pełna tabela backlogu + zasady pracy w sprincie (w TEJ SAMEJ odpowiedzi co pytanie o cel, tabela pierwsza)
- [ ] 5. Cel sprintu: pytanie o jedno zdanie pod tabelą (ustnie, nie do backlogu)
- [ ] 6. Plan celu: po ustaleniu celu plan jako zakładka „Plan” strony sesji (plik w `docs/html/plans/`), NIE jako tekst w czacie
```

**1. Kontrakt.** Znajdź korzeń repo (`git rev-parse --show-toplevel`) i przeczytaj `SPRINT.md` w całości (ma spis
treści). Brak pliku → zaproponuj utworzenie: przeczytaj `reference/szablon-sprint.md`, zbierz odpowiedzi w krótkim
wywiadzie (jedno pytanie na raz; to, co da się wyczytać z repo — wyczytaj sam), pokaż projekt pliku, zapisz po akceptacji.
Sprawdź też `BLITZ.md` — gdy ON, wypisz `⚡ BLITZ: ON` (skill `blitzscaling`).

**1b. Środowisko testowe.** Sekcja **Środowisko testowe** kontraktu musi podawać: gdzie sprawdzać (adres / sposób
instalacji), dokładną komendę wgrania z weryfikacją i zasady danych — albo `brak (powód)` po świadomej decyzji
użytkownika. Kompletna → dalej. Brak lub niepełna → przeprowadź użytkownika przez przygotowanie wg
`reference/srodowisko-testowe.md` (jedno pytanie na raz), pokaż projekt sekcji, zapisz po akceptacji. Prace techniczne
(skrypt wgrania, konfiguracja) stają się pierwszym celem sprintu albo wpisem w backlogu — decyduje użytkownik.

**1c. Znaczniki.** Sekcja **Znaczniki** kontraktu (format: `reference/znaczniki.md`) podaje rejestr, przełącznik,
obwódkę, panel „Zmiany” i komendę wgrania rejestru na test — albo `brak (powód)`. **Brak → wdrożenie jest
automatycznie pierwszym zadaniem sesji** (decyzja Andrzeja 2026-11-18), bez pytania „czy” i przed celem, który wybierze
użytkownik: napisz jednym zdaniem, że mechanizm wchodzi najpierw, a cel sprintu realizujesz po nim. Projekt mechanizmu
dla tego projektu (wg „Wdrożenie w projekcie” w `reference/znaczniki.md`, to, co da się wyczytać z repo — wyczytaj sam)
pokaż do akceptacji przed kodem. Mechanizm z założenia żyje tylko na teście: produkcja nie dostaje obwódek, panelu,
statusów ani nazw zmian (`reference/znaczniki.md` → Produkcja). `brak (powód)` tylko gdy projekt nie ma interfejsu ani produkcji i użytkownik to
potwierdził. Kontrakt sprzed 2026-11-18 (wydanie / push / tag przypisane „checkpointowi”) → poprawka słownictwa
wchodzi w tym samym wdrożeniu: te kroki należą teraz do „końca sesji”; projekt zmian w kontrakcie razem z mechanizmem.

**2. Stan.** Uruchom polecenia z sekcji **Dokumenty** i **Wersja** kontraktu (równolegle): backlog, ostatnie wpisy
changelogu, bieżąca wersja, `git log --oneline -5`, bieżąca gałąź i niezatwierdzone zmiany. Niezatwierdzone cudze zmiany
w repo — zgłoś Andrzejowi, nie ruszaj ich. Rejestr znaczników: wypisz `prod-go` (czeka na koniec sesji) i `prod-nogo`
(czeka w teście, z poprzednich sesji) — kod, nazwa, widok; zaznacz te z `naProdukcji: true` (do wycofania).

**2b. Widok HTML — OBOWIĄZKOWY, tu, a nie na końcu.** Zaraz po kroku 2, w tej samej turze, **przed triażem i przed jakimkolwiek pytaniem** (triaż i pytanie o cel kończą turę, więc krok „po” nigdy by się nie wykonał). Jeśli w kontekście jest linia „HOOK widoki …”, hook zrobił to już za Ciebie: przepisz adres, **od razu uruchom narzędzie Monitor wg linii „WYMAGANE TERAZ” z hooka** (komentarze z Lavisha budzą Cię na żywo; bez tego użytkownik widzi „agent not listening”) i idź dalej. Inaczej jedno polecenie z korzenia repo:
```bash
~/.claude/skills/widoki/scripts/sprint-widok.sh <ścieżka backlogu z kontraktu> "<Projekt>"
```
Skrypt sam tworzy `docs/html/…`, dopisuje do `.gitignore`, generuje backlog i stronę sesji i drukuje jedną linię z adresem — przepisz ją do odpowiedzi. Błąd skryptu to jedna linia „widok HTML pominięty: …” (kod 0), nie blokuje sprintu. Czat zostaje pełny tekstowo (tabela itd.); strona to dodatek, ale jej **uruchomienie nie jest opcjonalne**. Po wyniku triażu i ustaleniu celu uruchom skrypt ponownie (backlog się zmienił).

**3. Zgłoszenia.** Sekcja **Zgłoszenia** kontraktu podaje źródła (np. panel błędów, issues) i reguły. Brak źródeł → krok
pominięty, napisz to. Są źródła → procedura z `reference/triaz.md`: zbierz, odfiltruj (już w backlogu / naprawione),
scal pokrewne, **każde zgłoszenie osobno** przez okna pytań, zapis do backlogu, nagrody i oznaczenie obsłużonych —
komendami z kontraktu (to kroki o niskiej swobodzie: uruchom dokładnie, bez zmian w poleceniach).

**4+5. Tabela i cel — w jednej odpowiedzi, tabela ZAWSZE pierwsza.** Kolejność jest twarda: najpierw pełna tabela
backlogu, pod nią blok **Zasady pracy w sprincie** (3 linie), a na samym końcu pytanie o cel. **Tabela nigdy nie
czeka na odpowiedź o celu** — Andrzej wybiera cel właśnie patrząc na tabelę; pytanie o cel bez tabeli w tej samej
odpowiedzi jest błędem skilla. Jeśli cel podał już w poleceniu, tabela i tak się pokazuje (z celem w nagłówku).
- **Tabela:** pełny backlog wg `reference/tabela-backlogu.md` i kolumn z kontraktu. Cała lista, bez skrótów,
  bez „TOP 10”, bez „pokażę po wyborze celu”; nie pytaj „co dalej”.
- **Cel:** jedno zdanie (przy BLITZ: filtr ścieżki krytycznej — minimalny zbiór działań, reszta do backlogu). Możesz
  dodać krótką rekomendację celu, ale pod tabelą, nie zamiast niej. Wybór zadań jest ustny — nie zapisuj go w backlogu.

## Zasady pracy w sprincie (obowiązują od startu do końca sesji)
1. Zmiana skończona, gdy działa i przechodzą szybkie bramy z kontraktu (testy, typy). Od razu ma wpis w rejestrze
   znaczników (`prod-nogo`; `rodzaj` `ui` albo `ukryta` z `opis`) i siedzi za przełącznikiem (`reference/znaczniki.md`).
   Wpis na każdy osobno akceptowalny element (karta, sekcja, kafelek, akapit), nie jeden na cały kontener
   (`reference/znaczniki.md` → Ziarnistość).
   Zmiana mechaniki, wzoru czy logiki bez śladu w interfejsie → wpis `ukryta` z widokiem, którego dotyczy (panel).
2. Wtedy **od razu, bez pytania** wgraj ją na test komendą z sekcji **Środowisko testowe** i sprawdź wgranie.
3. Zaraz potem numerowana lista **„Do sprawdzenia”** z adresem testu: akcja → oczekiwany wynik, po punkcie na zmianę.
4. Uwagi użytkownika → poprawki → ponowne wgranie → nowa lista (tylko punkty, których dotyczyła poprawka).
   **Niesprawdzone zawsze w całości:** w każdej odpowiedzi, w której jest lista „Do sprawdzenia”, wypisz WSZYSTKIE punkty,
   które użytkownik jeszcze nie potwierdził (także z poprzednich wgrań), a nie tylko nowe. Odhaczone usuwaj dopiero po
   jego potwierdzeniu; numeruj tak, żeby numery się nie zmieniały między odpowiedziami.
5. Commit tylko przy checkpoincie (lokalny), produkcja tylko przy końcu sesji. „Checkpoint” → `sprint-checkpoint`
   (statusy go/nogo + commit); „koniec sesji” / `/end-session` → `end-session` (wydanie, tag, push).
6. Zasady danych testu z kontraktu (np. wspólna baza → tylko zmiany dodające) są twarde; zmiana, której test nie
   może bezpiecznie przyjąć, czeka na koniec sesji i zgodę użytkownika.
7. **„ok” = GO (decyzja Andrzeja 2026-11-18):** „ok” przy punkcie listy „Do sprawdzenia” to `prod-go` elementu, którego
   dotyczy. Element dostaje `prod-go`, gdy wszystkie jego punkty mają „ok”; uwaga albo „ok, ale…” → zostaje `prod-nogo`
   i wraca na listę po poprawce. Status wpisz do rejestru od razu i wgraj z najbliższym wgraniem na test.
   Zmiany niewidoczne (`ukryta`) checkpoint oznacza `prod-go` sam, bez „ok” (decyzja Andrzeja 2026-11-21), chyba że
   Andrzej wprost da im nogo albo uwagę.
8. `prod-nogo` nie znika z testu: przechodzi na kolejne sesje z czerwoną obwódką, aż checkpoint da `prod-go`.
Kontrakt z `brak` w sekcji testu: pkt 2–4 nie obowiązują, lista „co przetestować” przychodzi po wydaniu w końcu sesji.

## Gdy coś nie pasuje do kontraktu
Krok się nie udał z powodu, którego `SPRINT.md` nie opisuje (np. zmieniona ścieżka, nowe źródło zgłoszeń) → na końcu
zaproponuj konkretną poprawkę kontraktu; zapisz ją dopiero po akceptacji Andrzeja.

**6. Plan celu (po ustaleniu celu, przed kodem).** Plan NIGDY nie idzie do czatu jako tekst. Skopiuj
`<S>/assets/szablon-plan.html` do `docs/html/plans/<data>-<temat>.html`, wypełnij go (zasady i bloki: skill `widoki`,
etap „Plan”) i zapisz narzędziem Write. Zapis uruchamia hook PostToolUse (`hook-post.sh`), który sam odświeża stronę
sesji i dodaje zakładkę „Plan”. Użytkownikowi podaj wyłącznie adres strony sesji (jedna strona z zakładkami
Backlog / Plan / Sesja), nigdy osobny link do pliku planu. W czacie zostaje najwyżej jedno zdanie streszczenia.
Nie otwieraj planu osobno przez `lavish.sh`. Brak hooka w kontekście po zapisie → uruchom `sprint-widok.sh` ręcznie.
