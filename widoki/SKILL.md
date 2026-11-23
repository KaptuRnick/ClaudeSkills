---
name: widoki
description: Widoki HTML dla pracy human-in-the-loop (backlog, plany, raporty, strona sesji sprintu) otwierane w przeglądarce przez Lavish. Użyj gdy trzeba pokazać człowiekowi backlog, plan, raport lub listę "co sprawdzić" w formie wizualnej, albo gdy user pisze "pokaż backlog w przeglądarce", "plan jako html", "strona sesji", "widok html". Pliki .md zostają źródłem prawdy; HTML to widok generowany lub edytor z eksportem do .md.
---

# widoki

Widok HTML dla człowieka. **Czat nadal podaje wszystko tekstowo jak dotąd; strona to alternatywa.** Plik .md jest źródłem prawdy (parsują go skille, hooki, git), HTML go tylko pokazuje.

## Zasady
1. Pliki: `docs/html/<kategoria>/` (`backlog/`, `plans/`, `reports/`, `sessions/`). Commitowane tylko `plans/` i `reports/`; `backlog/` i `sessions/` do `.gitignore`.
2. Otwieranie zawsze przez `scripts/lavish.sh <plik.html>` (Lavish przypięty do wersji, `npx`, Node 22+). **Nigdy `share`**: wrapper go blokuje (publiczny upload). Do udostępniania służą prywatne artefakty claude.ai. W sesji VSCode (`CLAUDE_CODE_ENTRYPOINT=claude-vscode` albo terminal VSCode; `env.sh` → `WIDOKI_VSCODE=1`) wrapper otwiera Lavish z `--no-open` i stronę przez `code --open-url` we wbudowanej przeglądarce VSCode; wymaga raz ustawienia VSCode `"workbench.browser.openLocalhostLinks": true` i restartu. Poza VSCode: przeglądarka systemowa.
3. Po otwarciu: `lavish.sh poll <plik>` tylko jako śledzony job tła harnessu (run_in_background), nigdy `nohup` / `&`. Bez pollu feedback ze strony czeka na serwerze.
4. Brak Node / Lavish: HTML działa jako zwykły plik w przeglądarce, bez adnotacji.
5. Styl: styl projektu, jeśli ma (makiety ekranów zawsze w stylu projektu), inaczej `assets/style.css`. HTML zaczyna się od `<!doctype html>`, plik samowystarczalny (CSS inline).
6. **Rysuj to, co łatwiej narysować niż opisać; resztę zostaw tekstem.** Do rysunku nadają się: wygląd ekranu przed i po zmianie, zależności i przepływy, kolejność w czasie, układ plików, kształt wykresu, wybór między opcjami. Tekst jest lepszy dla uzasadnień, warunków, wyjątków, krótkich list i wszystkiego, co obraz tylko by rozdmuchał. Obraz ma być szkicem do oceny okiem, nie wiernym projektem. Nie rysuj na siłę (wykres bez osi i podpisów jest gorszy niż zdanie), a każdy rysunek ma podpisy, które go tłumaczą.
7. Przy ręcznym pisaniu HTML najpierw `lavish.sh playbook <id>` (plan, table, comparison, input…).

## Widoki
### Backlog (etap 1, gotowy)
```bash
node <skill>/scripts/backlog.mjs <backlog.md> docs/html/backlog/backlog.html --title "<Projekt> — Backlog"
<skill>/scripts/lavish.sh docs/html/backlog/backlog.html
```
Parser rozpoznaje dwa formaty: listę `- [ ] **KOD — tytuł** … · K · _typ_` pod nagłówkami `##`/`###`. Po zmianie backlogu: uruchom generator ponownie, Lavish odświeży stronę sam. Widok tylko do odczytu, ma wyszukiwarkę i filtry.

Drugi format (np. Lumenu): `# Grupa` + `## #NN [Priorytet] Tytuł` + pola `**Kontekst:**`, `**Co zrobić:**`…; wykrywany sam.

### Plan (etap 2)
Plan to plan jak w trybie planowania: cel, stan obecny i docelowy, podejście, pliki, kroki, weryfikacja, ryzyka i decyzje. **Bez listy „Do sprawdzenia”**: ta powstaje po realizacji. Fakty sprawdzone w kodzie (ścieżki z numerami linii w podpisach).
Strona planu: kopiuj `assets/szablon-plan.html` (bloki: przed/po, diagram, oś czasu kroków, pliki, karty decyzji) do `docs/html/plans/<data>-<temat>.html` i wypełniaj wg zasady 6 oraz playbooków `plan`, `diagram`, `comparison`. Szablon ma przykładowe dane w nawiasach `[…]`, które trzeba podmienić. Typowe bloki: cel (karty), szkic ekranu dziś / po zmianie, diagram zależności, diagram „co zostaje pod spodem”, oś czasu kroków, mapa plików z legendą, karty decyzji z rekomendacją. Każdy węzeł SVG z `id` i `<title>` (adnotacje w Lavish).
**Decyzje a plan** (Andrzej 2026-11-23): *przed startem sprintu* (plan czeka na akceptację) wybór w „Do Twojej decyzji” aktualizuje plan: rozstrzygnięcie wpisane w treść, karta decyzji znika, wpis w „Historii uzgodnień”; to nie jest akceptacja planu, kod dopiero po wyraźnej akceptacji. *W trakcie sprintu na zatwierdzonym planie* decyzje i uwagi z testu (także zmieniające projekt) wdrażasz od razu i oddajesz jako punkty „Do sprawdzenia”; bez powrotu do planu, bez zdejmowania pieczęci i bez pytania o plan v+1.
**Akceptacja planu** (Andrzej: „działamy”, „ok, wdrażamy” itp.): zaraz po niej `node scripts/plan-zatwierdz.mjs <plan.html> <historia.json>` (JSON `{wersja, data, kto, uzgodnienia:[{wersja, element, komentarz, odpowiedz}]}`: każdy komentarz z Lavisha do planu, dosłownie, z tym, jak go rozwiązano; źródło `docs/html/sessions/komentarze.done`). Skrypt dopisuje `<meta name="widoki-plan" content="zatwierdzony;DATA;WERSJA">`, pieczęć pod tytułem i sekcję „Historia uzgodnień” przed stopką; ponowne uruchomienie podmienia. Zatwierdzony plan zostaje w repo (`plans/` jest commitowane) jako zapis tego, na co się umówiliśmy.
`scripts/plan.mjs <plan.md> <out.html> [--backlog B.md]` to tylko szybki podgląd tekstowy planu z .md; nie zastępuje strony wizualnej.

### Raport (etap 3) i strona sesji (etap 4)
- Raport końca sesji: `node scripts/raport.mjs <CHANGELOG.md> <nr> docs/html/reports/checkpoint-<nr>.html [--znaczniki znaczniki.json] [--szkice szkice.json]`. Karty wpisów z pierwszym zdaniem i „więcej”, oś statusów (test → GO → produkcja) z `znaczniki.json`, opcjonalne szkice ekranów (`{"#NN": "<svg/html>"}`, rysowane ręcznie wg zasady 6).
- Strona sesji: `node scripts/sesja.mjs docs/html/sessions/sesja.html --tab "Sesja=raport.html" --tab "Backlog=backlog.html" --tab "Plan=nowy.html,starszy.html"`: jedna strona z paskiem zakładek, widoki jako sekcje jednego dokumentu (bez iframe, bo Lavish komentuje tylko elementy głównego dokumentu). Izolacja w `scripts/sesja-widok.mjs`: style w `@scope` sekcji (`:root`, `html`, `body` → `:scope`), identyfikatory z prefiksem `w<N>-` (także `href="#…"`, `url(#…)`, `for`, `aria-*`), skrypty z `document` zawężonym do sekcji. Kilka plików w zakładce = wybór u góry zakładki (etykieta „data · tytuł · status” z `scripts/sesja-plany.mjs`; `sprint-widok.sh` daje do zakładki Plan 10 najnowszych planów). Po zmianie widoku wygeneruj go i stronę sesji ponownie. Nowy widok: unikaj `@keyframes` w `@scope` (generator wyjmuje je na zewnątrz) i handlerów `onclick="…"` (funkcje skryptu widoku są lokalne).

### Podpięcie pod sprint-start, checkpoint i end-session (etap 5)
Skille sprintu uruchamiają **jedno polecenie**: `<S>/scripts/sprint-widok.sh <backlog.md> "<Projekt>"` (z korzenia repo). Skrypt tworzy `docs/html/{backlog,plans,reports,sessions}/`, dopisuje `docs/html/backlog/` i `docs/html/sessions/` do `.gitignore`, generuje backlog i stronę sesji (zakładki Plan i Sesja dołączają się same, gdy istnieją najnowsze pliki w `plans/` i `reports/`) i drukuje linię z adresem. Brak Node albo błąd generatora → jedna linia „widok HTML pominięty: <powód>”, kod 0.
**Czat zostaje pełny tekstowo; strona to dodatek, ale uruchomienie skryptu jest obowiązkowe.**
Moment wywołania:
- **sprint-start:** krok 2b, zaraz po stanie, PRZED triażem i pytaniami (triaż i pytanie o cel kończą turę; krok po nich nigdy się nie wykonywał). Po ustaleniu celu ponownie (backlog się zmienił). Plan wizualny (zasada 6) zaraz po ustaleniu celu, przed kodem: plik w `plans/`, zapis odświeża stronę sesji hookiem `hook-post.sh` (zakładka „Plan”). Plan nigdy jako tekst w czacie i nigdy jako osobny link.
- **sprint-checkpoint:** po kroku 5, w tej samej turze.
- **end-session:** po kroku 11: `node <S>/scripts/raport.mjs <CHANGELOG> <nr> docs/html/reports/checkpoint-<nr>.html --znaczniki <rejestr>` (szkice ekranów opcjonalnie), potem skrypt. Raport powstaje po commicie wydania i nie jest do niego dodawany.
Otwarcie w Lavish (`lavish.sh` + `poll` jako zadanie tła) tylko na prośbę użytkownika albo gdy chce adnotować; nigdy `share`.

### Po wgraniu na test: zakładka „Do sprawdzenia” jako karty ze zrzutami (od 2026-11-23, wymuszone hookami)
Widok ma pokazywać, nie opisywać (Andrzej 2026-11-23). Po każdym wgraniu na test agent zapisuje narzędziem Write `docs/html/sessions/do-sprawdzenia.json`
(projekt z linią „Zrzuty” w `SPRINT.md`; bez niej zapasowo `.md` z numerowaną listą):
```json
{ "adres": "<adres testu>", "podsumowanie": "<jedno zdanie: co weszło>", "punkty": [
  { "nr": 2, "kod": "#124a", "akcja": "Stuknij „Menu ›”", "wynik": "Otwiera się Menu",
    "zrzut": { "ekran": "<ekran startowy skryptu projektu>", "przed": [{ "kliknij": "<sel>" }], "wskaz": "<sel do obwiedzenia>",
               "akcja": [{ "kliknij": "<sel>" }], "po": true } },
  { "nr": 11, "kod": "#124d", "ukryta": true, "akcja": "<nazwa zmiany>", "zmiana": "<co się zmieniło>", "jak": "<jak sprawdzić>",
    "regula": "<zdanie reguły silnika do potwierdzenia>" } ] }
```
- **„Do Twojej decyzji” zawsze w widoku** (Andrzej 2026-11-23): każde pytanie do Andrzeja z tej tury (decyzje agentów, rozstrzygnięcia przed kolejnym krokiem) idzie do pola `"decyzje": [{ "id": "D1", "pytanie", "kontekst", "opcje": ["…"], "rekomendacja": 0 }]`; sekcja nad kartami, wybór opcji (rekomendowana podpisana, nic zaznaczone z góry), pole „Inaczej?” do komentarza; wybory idą tym samym przyciskiem (linia „Decyzja D1: 2. …”). W czacie te same pytania z tymi samymi identyfikatorami. Rozstrzygnięta decyzja znika z JSON przy kolejnym zapisie. Plik: `sprawdzenie-decyzje.mjs`.
- Każdy niepotwierdzony punkt, **także każda zmiana `ukryta`** (karta bez zdjęć: co, jak sprawdzić, reguła do potwierdzenia „NN tak ma działać”).
- Każda karta ma pod zrzutami wynik jako nagłówek („Ma być: …”, przy ukrytej „Reguła: …”) i **stałe miejsce odpowiedzi**: przełącznik „OK” (domyślnie wyłączony) i obok pole „Nie ok” — zwykły element, który Andrzej komentuje w Lavishu jak resztę strony (Andrzej 2026-11-23). Pod kartami pole **„Dodatkowe uwagi”** (obserwacje spoza zmian) i jeden przycisk „Wyślij odpowiedzi”: jedna wiadomość przez Lavish (tag `odpowiedzi-sprawdzenia`, linia „OK: 16, 20”) razem z komentarzami Lavisha (komentarz przy polu „Nie ok” punktu NN = uwaga do NN). Agent rozlicza każdy numer (OK → GO, komentarz → poprawka), dodatkowe uwagi wpisuje do backlogu w tej samej turze. Wszystko „ok” i brak uwag ⇒ checkpoint (zasada 9 `sprint-start`), nigdy koniec sesji. Pliki: `sprawdzenie-karty.mjs`, `sprawdzenie-styl.mjs`, `sprawdzenie-skrypt.mjs`.
- `zrzut`: `akcja` domyślnie kliknięcie `wskaz`; `"po": false` = tylko zdjęcie „ma być” (stan bez akcji). Brak `zrzut` = karta z samym tekstem.
- Zdjęcia robi skrypt projektu z `SPRINT.md` (linia „Zrzuty”, pierwszy fragment w backtickach) do `docs/html/sessions/zrzuty/NN-przed.png` i `NN-po.png`; `scripts/sprawdzenie.mjs` (+ `sprawdzenie-karty.mjs`, `sprawdzenie-md.mjs`) składa karty z obrazami w środku jako pierwszą zakładkę strony sesji. W czacie zostaje ta sama lista tekstowa (odpowiedzi „NN ok”).
- `hook-test.sh` (PostToolUse, Bash): komenda wgrania z `SPRINT.md` (linia „Wgranie”) → odświeża stronę, zostawia znacznik `docs/html/sessions/.wgranie-test`, każe zapisać listę;
- `hook-post.sh` (PostToolUse, Write|Edit, timeout 300): zapis `.json` → skrypt zrzutów, potem strona sesji; `.md`, planu albo raportu → strona sesji;
- `hook-stop.sh` (Stop): po wgraniu bez nowszej listy zatrzymuje zakończenie odpowiedzi (raz na turę).
**Niebieska ramka na skomentowanych miejscach** (Andrzej 2026-11-23): od razu po dodaniu komentarza (strona sesji słucha komunikatu Lavisha `lavish:queuedAnchors` i oznacza elementy z kolejki atrybutem `data-lavish-w-kolejce`), a po wysłaniu `scripts/sesja-komentarze.mjs` czyta `docs/html/sessions/komentarze.done` i obwodzi elementy z komentarzy nowszych od ostatniego zapisu listy `do-sprawdzenia.(json|md)`; `lavish-watch.sh` po odebraniu komentarza przerysowuje stronę sesji (`WIDOKI_LAVISH=0 sprint-widok.sh`, bez otwierania Lavisha). Zapis nowej listy po poprawce zdejmuje ramki.
Okno Lavisha nie ma „Send & End”, „End session” ani „Publish link” (`scripts/lavish-latka.sh` na przypiętej wersji, wołany przez `lavish.sh`), a `sprint-widok.sh` otwiera sesję z `--reopen`, więc strona sesji zawsze wraca i jest aktualna.

### Triaż i edytory (kolejne etapy)
Zaplanowane, jeszcze niezbudowane: triaż zgłoszeń i edytory z eksportem do .md. Do czasu budowy: nie udawaj, że istnieją.
