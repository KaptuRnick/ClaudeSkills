#!/usr/bin/env bash
# Hook UserPromptSubmit. Dwie rzeczy, obie bez zależności od posłuszeństwa modelu:
# 1) na frazy startu / checkpointu / końca sesji uruchamia sprint-widok.sh (widok + Lavish);
# 2) przy KAŻDYM promptie odbiera komentarze z Lavisha (krótki poll), jeśli czekają — dzięki temu
#    „agent not listening” nie blokuje komentarzy: wystarczy napisać cokolwiek w czacie.
# Stdout trafia do kontekstu modelu. Podpięcie: ~/.claude/settings.json → hooks.UserPromptSubmit (zob. README).
IN="$(cat)"
PROMPT="$(printf '%s' "$IN" | jq -r '.prompt // ""' 2>/dev/null | tr '[:upper:]' '[:lower:]')"
CWD="$(printf '%s' "$IN" | jq -r '.cwd // ""' 2>/dev/null)"
[ -n "$CWD" ] && cd "$CWD" 2>/dev/null || exit 0
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$ROOT" || exit 0
[ -f SPRINT.md ] || exit 0
S="$(cd "$(dirname "$0")" && pwd)"
. "$S/env.sh"

# 2) komentarze z Lavisha: most (lavish-bridge.sh) trzyma słuchacza i zapisuje je do kolejki; tu je odbieramy
BH="$ROOT/docs/html/sessions/sesja.html"
Q="$ROOT/docs/html/sessions/komentarze.queue"
if [ -f "$BH" ] && command -v npx >/dev/null 2>&1; then
  if ! "$S/lavish-bridge.sh" status "$BH" | grep -q "działa"; then
    "$S/lavish-bridge.sh" start "$BH" >/dev/null 2>&1; sleep 5   # świeży most od razu odbiera komentarze czekające w Lavishu
  fi
  if [ -s "$Q" ]; then
    echo "HOOK widoki: komentarze użytkownika z Lavisha (sesja.html), odebrane z kolejki:"
    cat "$Q"; : > "$Q"
    echo "Zastosuj je (backlog = plik .md, HTML regeneruj skryptem sprint-widok.sh), potem odpowiedz w Lavishu: $S/lavish.sh reply $BH --agent-reply \"<krótko co zrobiono>\""
  fi
fi

# 1) start / checkpoint / koniec sesji
printf '%s' "$PROMPT" | grep -Eq '(zaczynamy|startujemy|zaczynam|rozpoczynamy) (now[ąa] )?sesj|sesja startuje|start sprintu|nowy sprint|checkpoint|koniec sesji|ko[ńn]czymy sesj|zamykamy sesj|/end-session|/sprint' || exit 0
B=""; for f in BACKLOG.md docs/BACKLOG.md docs/backlog.md backlog.md; do [ -f "$f" ] && { B="$f"; break; }; done
[ -n "$B" ] || exit 0
OUT="$("$S/sprint-widok.sh" "$B" "$(basename "$ROOT")" 2>&1)"
echo "HOOK widoki (wykonany automatycznie, krok 2b sprintu zaliczony):"
echo "$OUT"
echo "Wpisz linie z adresami na początku odpowiedzi (http://127.0.0.1… z komentarzami jako główny; file:// to widok bez komentarzy). NIE uruchamiaj sprint-widok.sh przed triażem — już zrobione; ponów go dopiero po zmianie backlogu."
echo "WYMAGANE TERAZ (komentarze na żywo): uruchom narzędzie Monitor z command=\"$S/lavish-watch.sh $ROOT/docs/html/sessions/sesja.html\", timeout_ms=1800000, description=\"komentarze z Lavisha\". Każde powiadomienie = komentarz użytkownika: zastosuj go i odpowiedz w Lavishu przez lavish.sh reply. Po wygaśnięciu monitora (30 min) uruchom go ponownie. Bez Monitora komentarze dotrą dopiero po następnej wiadomości użytkownika."
