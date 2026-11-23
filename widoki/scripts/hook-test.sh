#!/usr/bin/env bash
# PostToolUse (Bash): po wgraniu na test (komenda z SPRINT.md → linia „Wgranie”, pierwszy fragment w `…`) odświeża stronę
# sesji i zostawia znacznik wgrania docs/html/sessions/.wgranie-test. hook-stop.sh nie wypuści agenta z odpowiedzią, dopóki
# po wgraniu nie zapisze listy docs/html/sessions/do-sprawdzenia.md (jej zapis odświeża zakładkę „Do sprawdzenia”).
S="$(cd "$(dirname "$0")" && pwd)"
. "$S/env.sh"
command -v jq >/dev/null 2>&1 || exit 0
IN="$(cat)"
CMD="$(printf '%s' "$IN" | jq -r '.tool_input.command // empty')"
CWD="$(printf '%s' "$IN" | jq -r '.cwd // empty')"
[ -n "$CMD" ] && [ -n "$CWD" ] && cd "$CWD" 2>/dev/null || exit 0
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$ROOT" && [ -f SPRINT.md ] || exit 0
WZ="$(grep -m1 -E '^[-*] *Wgranie' SPRINT.md | grep -o '`[^`]*`' | head -1 | tr -d '`')"
[ -n "$WZ" ] || exit 0
case "$CMD" in *"$WZ"*) ;; *) exit 0 ;; esac
mkdir -p docs/html/sessions && date '+%F %T' > docs/html/sessions/.wgranie-test
B=""; for f in BACKLOG.md docs/BACKLOG.md docs/backlog.md backlog.md; do [ -f "$f" ] && { B="$f"; break; }; done
OUT=""; [ -n "$B" ] && OUT="$("$S/sprint-widok.sh" "$B" "$(basename "$ROOT")" 2>&1)"
if grep -qE '^[-*] *Zrzuty' SPRINT.md; then
  PLIK=docs/html/sessions/do-sprawdzenia.json; JAK="Punkty interfejsu z polem zrzut (ekran, przed, wskaz, akcja, po); zapis sam robi zdjęcia i karty."
else PLIK=docs/html/sessions/do-sprawdzenia.md; JAK="Zapis odświeża zakładkę „Do sprawdzenia”."; fi
jq -n --arg c "HOOK widoki: wykryte wgranie na test ($WZ), strona sesji odświeżona.
WYMAGANE przed odpowiedzią: zapisz narzędziem Write $PLIK ze WSZYSTKIMI niepotwierdzonymi punktami „Do sprawdzenia”, także zmianami ukrytymi (format: skill widoki → „Po wgraniu na test”). $JAK Bez tego hook Stop zatrzyma odpowiedź.
$OUT" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$c}}'
