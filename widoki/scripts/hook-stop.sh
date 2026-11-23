#!/usr/bin/env bash
# Stop: było wgranie na test (znacznik z hook-test.sh), a lista docs/html/sessions/do-sprawdzenia.md jest starsza albo jej
# brak → zatrzymaj zakończenie odpowiedzi i każ ją zapisać (jej zapis odświeża stronę sesji przez hook-post.sh).
# Jedno zatrzymanie na turę (stop_hook_active), żeby nie zapętlić agenta.
command -v jq >/dev/null 2>&1 || exit 0
IN="$(cat)"
[ "$(printf '%s' "$IN" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0
CWD="$(printf '%s' "$IN" | jq -r '.cwd // empty')"
[ -n "$CWD" ] && cd "$CWD" 2>/dev/null || exit 0
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$ROOT" && [ -f SPRINT.md ] || exit 0
M=docs/html/sessions/.wgranie-test; L=docs/html/sessions/do-sprawdzenia.md
[ -f "$M" ] || exit 0
[ -f "$L" ] && [ "$L" -nt "$M" ] && exit 0
jq -n '{decision:"block",reason:"Po wgraniu na test brakuje aktualnej listy w docs/html/sessions/do-sprawdzenia.md. Zapisz ją narzędziem Write (adres testu, co weszło, numerowana lista „Do sprawdzenia” ze wszystkimi niepotwierdzonymi punktami) — zapis odświeży stronę sesji — i dopiero potem odpowiedz z tą samą listą w czacie."}'
