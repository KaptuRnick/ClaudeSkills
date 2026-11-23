#!/usr/bin/env bash
# Wrapper na Lavish z przypiętą wersją. Blokuje `share` (publiczny upload na ht-ml.app).
# Przed startem łatka chowa „Send & End”, „End session” i „Publish link” (lavish-latka.sh).
# W sesji VSCode (env.sh → WIDOKI_VSCODE=1) otwarcie widoku idzie do wbudowanej przeglądarki VSCode zamiast systemowej.
. "$(dirname "$0")/env.sh"
# Użycie: lavish.sh <argumenty lavish-axi>   np.  lavish.sh docs/html/backlog/backlog.html
LAVISH_VERSION="${LAVISH_VERSION:-0.1.98}"
for a in "$@"; do
  if [ "$a" = "share" ]; then
    echo "widoki: 'share' zablokowane (domyślnie publiczny upload). Użyj prywatnego artefaktu claude.ai." >&2; exit 3
  fi
done
command -v node >/dev/null || { echo "widoki: brak Node. Plik HTML otwórz zwykłą przeglądarką." >&2; exit 4; }
"$(dirname "$0")/lavish-latka.sh" "$LAVISH_VERSION"
case "$1" in *.html|*.htm) OTWARCIE=1 ;; *) OTWARCIE=0 ;; esac
if [ "$WIDOKI_VSCODE" != "1" ] || [ "$OTWARCIE" != "1" ] || [ "${LAVISH_AXI_NO_OPEN:-}" = "1" ] || [[ " $* " == *" --no-open "* ]]; then
  exec npx -y "lavish-axi@${LAVISH_VERSION}" "$@"
fi
OUT="$(LAVISH_AXI_NO_OPEN=1 npx -y "lavish-axi@${LAVISH_VERSION}" "$@")"; KOD=$?
printf '%s\n' "$OUT"
URL="$(printf '%s\n' "$OUT" | sed -n 's/^ *url: *"\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"
if [ "$KOD" = 0 ] && [ -n "$URL" ] && printf '%s\n' "$OUT" | grep -q '^ *status: *"\{0,1\}opened'; then
  code --open-url "$URL" >/dev/null 2>&1 || echo "widoki: nie udało się otworzyć w VSCode, adres: $URL" >&2
fi
exit "$KOD"
