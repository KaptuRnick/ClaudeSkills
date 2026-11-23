#!/usr/bin/env bash
# Strumień zdarzeń dla narzędzia Monitor: każdy nowy komentarz z Lavisha (kolejka mostu) = linie na stdout
# = powiadomienie budzące agenta od razu. Użycie: lavish-watch.sh <sesja.html>
# Odebrane wpisy trafiają do komentarze.done, więc hook nie wstrzyknie ich drugi raz.
F="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
D="$(cd "$(dirname "$F")/../sessions" 2>/dev/null && pwd)" || { echo "lavish-watch: brak docs/html/sessions"; exit 1; }
Q="$D/komentarze.queue"; T="$D/komentarze.taken"
echo "lavish-watch: nasłuch komentarzy z Lavisha uruchomiony ($(basename "$F"))"
while true; do
  if [ -s "$Q" ]; then
    mv "$Q" "$T" 2>/dev/null && {
      echo "KOMENTARZ Z LAVISHA (sesja.html) — zastosuj i odpowiedz przez lavish.sh reply:"
      grep -v '^---' "$T" | grep -v '^prompts\['
      cat "$T" >> "$D/komentarze.done"; rm -f "$T"
      # Strona sesji od razu z niebieskimi ramkami na skomentowanych miejscach (bez ponownego otwierania Lavisha).
      R="$(cd "$D/../../.." && pwd)"; B=""; for f in BACKLOG.md docs/BACKLOG.md docs/backlog.md backlog.md; do [ -f "$R/$f" ] && { B="$f"; break; }; done
      [ -n "$B" ] && (cd "$R" && WIDOKI_LAVISH=0 "$(dirname "$0")/sprint-widok.sh" "$B" "$(basename "$R")" >/dev/null 2>&1 &)
    }
  fi
  sleep 1
done
