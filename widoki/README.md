# widoki

Skill dla Claude Code: widoki HTML (backlog, plany, raporty, strona sesji) do pracy human-in-the-loop, otwierane w przeglądarce przez [Lavish](https://github.com/kunchenguid/lavish-axi).

- Pliki `.md` zostają źródłem prawdy, HTML to widok generowany.
- Lavish **nie jest bundlowany**: skill woła `npx -y lavish-axi@<przypięta wersja>` (wymaga Node 22+). Bez Node HTML otwiera się jako zwykły plik.
- `share` Lavisha jest zablokowany w wrapperze (publiczny upload).
- Zero zależności własnych.

Instalacja: skopiuj folder do `~/.claude/skills/widoki/`.

## Co potrafi
| Widok | Polecenie |
|---|---|
| Backlog (lista `- [ ] **KOD — tytuł**` albo wpisy `## #NN [Priorytet] Tytuł` z polami `**Kontekst:**`; format wykrywany sam) | `node scripts/backlog.mjs BACKLOG.md docs/html/backlog/backlog.html --title "Backlog"` |
| Plan (szybki podgląd z .md; plan wizualny: kopia `assets/szablon-plan.html`) | `node scripts/plan.mjs plan.md out.html [--backlog BACKLOG.md]` |
| Raport wydania z sekcji CHANGELOG-u, oś statusów z rejestru znaczników, opcjonalne szkice ekranów | `node scripts/raport.mjs CHANGELOG.md 62 out.html [--znaczniki znaczniki.json] [--szkice szkice.json]` |
| Strona sesji: jedna strona z zakładkami (sekcje jednego dokumentu, komentarze Lavish w treści) | `node scripts/sesja.mjs out.html --tab "Backlog=backlog.html" --tab "Plan=plan.html"` |
| Jedno polecenie dla skilli sprintu: backlog + strona sesji, bez zbędnych kroków | `scripts/sprint-widok.sh BACKLOG.md "Projekt"` |
| Otwarcie w przeglądarce z adnotacjami (Lavish, `share` zablokowany) | `scripts/lavish.sh <plik.html>` |

Każdy plik wynikowy jest samowystarczalny (CSS inline), działa też otwarty dwuklikiem bez Lavisha.

## Skille sprintu
`sprint-start` (krok 2b, przed triażem i pytaniami), `sprint-checkpoint` i `end-session` uruchamiają `scripts/sprint-widok.sh` jako obowiązkowy krok. Skrypt nigdy nie blokuje sprintu.

## Hook (najpewniejsze wywołanie)
`scripts/hook-sesja.sh` jako hook `UserPromptSubmit` odpala `sprint-widok.sh` sam, na frazy „zaczynamy sesję”, „checkpoint”, „koniec sesji” itp., zanim model zacznie odpowiadać (wymaga `SPRINT.md` i backlogu w repo, `jq`). `hook-post.sh` (`PostToolUse` na Write/Edit) po zapisie pliku w `docs/html/plans/` lub `reports/` sam odświeża stronę sesji, więc plan i raport lądują w zakładkach jednej strony. W `~/.claude/settings.json`:
```json
{"hooks":{"UserPromptSubmit":[{"hooks":[{"type":"command","command":"bash ~/.claude/skills/widoki/scripts/hook-sesja.sh","timeout":60}]}],
"PostToolUse":[{"matcher":"Write|Edit","hooks":[{"type":"command","command":"bash ~/.claude/skills/widoki/scripts/hook-post.sh","timeout":60}]},{"matcher":"Bash","hooks":[{"type":"command","command":"bash ~/.claude/skills/widoki/scripts/hook-test.sh","timeout":90}]}],
"Stop":[{"hooks":[{"type":"command","command":"bash ~/.claude/skills/widoki/scripts/hook-stop.sh","timeout":10}]}]}}
```

## Komentarze
Komentarze i adnotacje daje tylko edytor Lavish (adres `http://127.0.0.1:…`), nie plik otwarty jako `file://`. `sprint-widok.sh` otwiera Lavish na widoku backlogu (`WIDOKI_LAVISH=0` wyłącza) i podaje polecenie `poll`, które agent uruchamia jako zadanie tła; bez pollu komentarze czekają na serwerze. Strona sesji z zakładkami (iframe) jest do czytania.

## Komentarze na żywo
Hook podaje agentowi polecenie uruchomienia `Monitor` z `scripts/lavish-watch.sh`: most (`lavish-bridge.sh`) trzyma słuchacza w Lavishu i zapisuje komentarze do kolejki, a Monitor zamienia każdy wpis w powiadomienie budzące agenta. To jedyna oficjalna droga obudzenia agenta z zewnątrz; wymaga, by agent uruchomił Monitor (hook tego nie zrobi sam) i ponowił go co 30 min. Bez Monitora komentarze trafiają do czatu przy następnej wiadomości użytkownika.

## Zasada
Rysuj to, co łatwiej narysować niż opisać (ekran przed i po, zależności, oś czasu, układ plików); resztę zostaw tekstem. Szkice, nie wierne projekty, zawsze z podpisami.

Licencja MIT. Styl i podejście wzorowane na [anthropics/html-effectiveness](https://github.com/anthropics/html-effectiveness) (MIT), zob. `NOTICE`.
