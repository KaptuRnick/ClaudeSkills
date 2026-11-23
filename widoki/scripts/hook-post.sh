#!/usr/bin/env bash
# PostToolUse (Write|Edit): gdy zapisano plik w docs/html/plans/, docs/html/reports/ albo listę docs/html/sessions/do-sprawdzenia.(json|md)
# (JSON: najpierw zrzuty skryptem projektu), odśwież stronę sesji
# (zakładki Do sprawdzenia / Plan / Sesja) bez polegania na pamięci modelu. Wynik trafia do modelu jako additionalContext.
S="$(cd "$(dirname "$0")" && pwd)"
. "$S/env.sh"
command -v jq >/dev/null 2>&1 || exit 0
IN="$(cat)"
FP="$(printf '%s' "$IN" | jq -r '.tool_input.file_path // empty')"
case "$FP" in */docs/html/plans/*.html|*/docs/html/reports/*.html|*/docs/html/sessions/do-sprawdzenia.md|*/docs/html/sessions/do-sprawdzenia.json) ;; *) exit 0 ;; esac
ROOT="$(cd "$(dirname "$FP")/../../.." 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$ROOT" || exit 0
[ -f SPRINT.md ] || exit 0
B=""; for f in BACKLOG.md docs/BACKLOG.md docs/backlog.md backlog.md; do [ -f "$f" ] && { B="$f"; break; }; done
[ -n "$B" ] || exit 0
# Lista w JSON → najpierw zrzuty skryptem projektu (SPRINT.md, linia „Zrzuty”, pierwszy fragment w `…`), potem strona sesji.
ZR=""
case "$FP" in *do-sprawdzenia.json)
  ZC="$(grep -m1 -E '^[-*] *Zrzuty' SPRINT.md | grep -o '`[^`]*`' | head -1 | tr -d '`')"
  [ -n "$ZC" ] && ZR="$(bash -c "$ZC" 2>&1 | tail -15)" ;;
esac
OUT="$("$S/sprint-widok.sh" "$B" "$(basename "$ROOT")" 2>&1)"
[ -n "$ZR" ] && OUT="Zrzuty: $ZR
$OUT"
jq -n --arg c "HOOK widoki: strona sesji odświeżona po zapisie $(basename "$FP") (zakładki Backlog/Plan/Sesja w jednym widoku). Podaj użytkownikowi TEN adres, nie osobny link do pliku planu:
$OUT" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$c}}'
