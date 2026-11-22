---
name: widoki
description: Widoki HTML dla pracy human-in-the-loop (backlog, plany, raporty, strona sesji sprintu) otwierane w przeglądarce przez Lavish. Użyj gdy trzeba pokazać człowiekowi backlog, plan, raport lub listę "co sprawdzić" w formie wizualnej, albo gdy user pisze "pokaż backlog w przeglądarce", "plan jako html", "strona sesji", "widok html". Pliki .md zostają źródłem prawdy; HTML to widok generowany lub edytor z eksportem do .md.
---

# widoki

Widok HTML dla człowieka. **Czat nadal podaje wszystko tekstowo jak dotąd; strona to alternatywa.** Plik .md jest źródłem prawdy (parsują go skille, hooki, git), HTML go tylko pokazuje.

## Zasady
1. Pliki: `docs/html/<kategoria>/` (`backlog/`, `plans/`, `reports/`, `sessions/`). Commitowane tylko `plans/` i `reports/`; `backlog/` i `sessions/` do `.gitignore`.
2. Otwieranie zawsze przez `scripts/lavish.sh <plik.html>` (Lavish przypięty do wersji, `npx`, Node 22+). **Nigdy `share`**: wrapper go blokuje (publiczny upload). Do udostępniania służą prywatne artefakty claude.ai.
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
`scripts/plan.mjs <plan.md> <out.html> [--backlog B.md]` to tylko szybki podgląd tekstowy planu z .md; nie zastępuje strony wizualnej.

### Raport (etap 3) i strona sesji (etap 4)
- Raport końca sesji: `node scripts/raport.mjs <CHANGELOG.md> <nr> docs/html/reports/checkpoint-<nr>.html [--znaczniki znaczniki.json] [--szkice szkice.json]`. Karty wpisów z pierwszym zdaniem i „więcej”, oś statusów (test → GO → produkcja) z `znaczniki.json`, opcjonalne szkice ekranów (`{"#NN": "<svg/html>"}`, rysowane ręcznie wg zasady 6).
- Strona sesji: `node scripts/sesja.mjs docs/html/sessions/sesja.html --tab "Sesja=raport.html" --tab "Backlog=backlog.html" --tab "Plan=plan.html"`: jedna strona z paskiem zakładek, widoki w ramkach iframe. Po zmianie widoku wygeneruj go i stronę sesji ponownie. Ograniczenie: adnotacje Lavish w ramkach mogą nie działać; do adnotowania otwórz pojedynczy widok.

### Podpięcie pod sprint-start, checkpoint i end-session (etap 5)
Skille sprintu uruchamiają **jedno polecenie**: `<S>/scripts/sprint-widok.sh <backlog.md> "<Projekt>"` (z korzenia repo). Skrypt tworzy `docs/html/{backlog,plans,reports,sessions}/`, dopisuje `docs/html/backlog/` i `docs/html/sessions/` do `.gitignore`, generuje backlog i stronę sesji (zakładki Plan i Sesja dołączają się same, gdy istnieją najnowsze pliki w `plans/` i `reports/`) i drukuje linię z adresem. Brak Node albo błąd generatora → jedna linia „widok HTML pominięty: <powód>”, kod 0.
**Czat zostaje pełny tekstowo; strona to dodatek, ale uruchomienie skryptu jest obowiązkowe.**
Moment wywołania:
- **sprint-start:** krok 2b, zaraz po stanie, PRZED triażem i pytaniami (triaż i pytanie o cel kończą turę; krok po nich nigdy się nie wykonywał). Po ustaleniu celu ponownie (backlog się zmienił). Plan wizualny (zasada 6) zaraz po ustaleniu celu, przed kodem: plik w `plans/`, zapis odświeża stronę sesji hookiem `hook-post.sh` (zakładka „Plan”). Plan nigdy jako tekst w czacie i nigdy jako osobny link.
- **sprint-checkpoint:** po kroku 5, w tej samej turze.
- **end-session:** po kroku 11: `node <S>/scripts/raport.mjs <CHANGELOG> <nr> docs/html/reports/checkpoint-<nr>.html --znaczniki <rejestr>` (szkice ekranów opcjonalnie), potem skrypt. Raport powstaje po commicie wydania i nie jest do niego dodawany.
Otwarcie w Lavish (`lavish.sh` + `poll` jako zadanie tła) tylko na prośbę użytkownika albo gdy chce adnotować; nigdy `share`.

### Triaż i edytory (kolejne etapy)
Zaplanowane, jeszcze niezbudowane: triaż zgłoszeń i edytory z eksportem do .md. Do czasu budowy: nie udawaj, że istnieją.
