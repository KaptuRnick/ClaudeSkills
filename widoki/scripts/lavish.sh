#!/usr/bin/env bash
# Wrapper na Lavish z przypiętą wersją. Blokuje `share` (publiczny upload na ht-ml.app).
# Użycie: lavish.sh <argumenty lavish-axi>   np.  lavish.sh docs/html/backlog/backlog.html
LAVISH_VERSION="${LAVISH_VERSION:-0.1.98}"
for a in "$@"; do
  if [ "$a" = "share" ]; then
    echo "widoki: 'share' zablokowane (domyślnie publiczny upload). Użyj prywatnego artefaktu claude.ai." >&2; exit 3
  fi
done
command -v node >/dev/null || { echo "widoki: brak Node. Plik HTML otwórz zwykłą przeglądarką." >&2; exit 4; }
exec npx -y "lavish-axi@${LAVISH_VERSION}" "$@"
