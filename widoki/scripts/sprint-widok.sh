#!/usr/bin/env bash
# Jedno polecenie dla skilli sprintu: backlog.html + strona sesji w docs/html/ bieżącego repo.
# Użycie (z korzenia repo): sprint-widok.sh <backlog.md> "<Projekt>"
# Zakładki Plan i Sesja dochodzą same, gdy istnieją docs/html/plans/*.html i docs/html/reports/*.html (najnowsze).
# Nigdy nie blokuje sprintu: błąd = jedna linia „widok HTML pominięty: <powód>”, kod 0.
. "$(dirname "$0")/env.sh"
S="$(cd "$(dirname "$0")/.." && pwd)"
BACKLOG="$1"; PROJ="${2:-Projekt}"
skip() { echo "widok HTML pominięty: $1"; exit 0; }
[ -f "$BACKLOG" ] || skip "brak pliku backlogu ($BACKLOG)"
NODE=node; command -v node >/dev/null 2>&1 || skip "brak Node (ani w PATH, ani w nvm/volta/brew)"
mkdir -p docs/html/backlog docs/html/plans docs/html/reports docs/html/sessions || skip "mkdir"
if [ -f .gitignore ]; then
  for d in docs/html/backlog/ docs/html/sessions/; do
    grep -qxF "$d" .gitignore || { echo "$d" >> .gitignore; echo "dopisano $d do .gitignore"; }
  done
fi
"$NODE" "$S/scripts/backlog.mjs" "$BACKLOG" docs/html/backlog/backlog.html --title "$PROJ — Backlog" >/dev/null || skip "backlog.mjs"
TABS=()
# „Do sprawdzenia” (ostatnie wgranie na test: podsumowanie i lista) jako pierwsza zakładka, gdy agent zapisał listę.
DS=docs/html/sessions/do-sprawdzenia.md
if [ -f "$DS" ] && "$NODE" "$S/scripts/sprawdzenie.mjs" "$DS" docs/html/sessions/do-sprawdzenia.html >/dev/null; then
  TABS+=(--tab "Do sprawdzenia=docs/html/sessions/do-sprawdzenia.html")
fi
TABS+=(--tab "Backlog=docs/html/backlog/backlog.html")
P="$(ls -t docs/html/plans/*.html 2>/dev/null | head -1)"; [ -n "$P" ] && TABS+=(--tab "Plan=$P")
R="$(ls -t docs/html/reports/*.html 2>/dev/null | head -1)"; [ -n "$R" ] && TABS+=(--tab "Sesja=$R")
"$NODE" "$S/scripts/sesja.mjs" docs/html/sessions/sesja.html --title "Sesja $PROJ" "${TABS[@]}" >/dev/null || skip "sesja.mjs"
echo "widok HTML: file://$(pwd)/docs/html/sessions/sesja.html"
# Komentarze i adnotacje daje tylko edytor Lavish (adres http://127.0.0.1…), nie goły plik file://.
# Jedna strona sesji z zakładkami (Do sprawdzenia, Backlog, Plan, Sesja) jest jedynym adresem z komentarzami.
# --reopen: sesja zamknięta w przeglądarce wraca przy każdym odświeżeniu (Andrzej 2026-11-23: widok ma być zawsze aktualny).
if [ "${WIDOKI_LAVISH:-1}" != "0" ] && command -v npx >/dev/null 2>&1; then
  LV="$(timeout 40 "$S/scripts/lavish.sh" docs/html/sessions/sesja.html --reopen 2>/dev/null | sed -n 's/^ *url: *"\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"
  if [ -n "$LV" ]; then
    echo "widok HTML z komentarzami (Lavish): $LV"
    "$S/scripts/lavish-bridge.sh" start docs/html/sessions/sesja.html && echo "most komentarzy uruchomiony: Lavish pokaże „agent listening”; komentarze trafią do czatu przy Twojej następnej wiadomości"
  else
    echo "Lavish nie wystartował: komentarzy brak, widok działa tylko do odczytu"
  fi
fi
