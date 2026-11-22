#!/usr/bin/env bash
# Most Lavish → kolejka plikowa. Trzyma w Lavishu stałego słuchacza (status „agent listening”),
# a komentarze zapisuje do docs/html/sessions/komentarze.queue; hook-sesja.sh wstrzykuje je modelowi
# przy najbliższym prompcie w czacie. Użycie: lavish-bridge.sh start|stop|status <sesja.html>
# Uczciwie: to nie jest natychmiastowy agent — Lavish dostaje odpowiedź o tym wprost.
S="$(cd "$(dirname "$0")" && pwd)"
. "$S/env.sh"
LV="${LAVISH_BIN:-$S/lavish.sh}"
CMD="$1"; F="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
D="$(dirname "$F")/../sessions"; mkdir -p "$D"; D="$(cd "$D" && pwd)"
PIDF="$D/bridge.pid"; Q="$D/komentarze.queue"
alive() { [ -f "$PIDF" ] && kill -0 "$(cat "$PIDF")" 2>/dev/null; }
case "$CMD" in
  stop) if alive; then pkill -P "$(cat "$PIDF")" 2>/dev/null; kill "$(cat "$PIDF")"; fi; rm -f "$PIDF"; exit 0 ;;
  status) alive && echo "bridge działa (pid $(cat "$PIDF"))" || echo "bridge nie działa"; exit 0 ;;
  start) alive && exit 0
     setsid nohup "$0" run "$F" >/dev/null 2>&1 < /dev/null & exit 0 ;;
  run) ;;
  *) echo "użycie: $0 start|stop|status <sesja.html>" >&2; exit 2 ;;
esac
echo $$ > "$PIDF"; trap 'rm -f "$PIDF"' EXIT
REPLY=""; FAILS=0
while true; do
  if [ -n "$REPLY" ]; then OUT="$("$LV" poll "$F" --owner most-hook --takeover --agent-reply "$REPLY" 2>&1)"; else OUT="$("$LV" poll "$F" --owner most-hook --takeover 2>&1)"; fi
  REPLY=""
  if printf '%s' "$OUT" | grep -q '^  status: feedback'; then
    { echo "--- $(date '+%F %T')"; printf '%s\n' "$OUT" | sed -n '/^prompts\[/,/^next_step:/p' | sed '$d'; } >> "$Q"
    REPLY="Zapisane. Agent odbierze komentarz przy Twojej następnej wiadomości w czacie (nie reaguje na żywo)."; FAILS=0
  elif printf '%s' "$OUT" | grep -Eq 'status: *ended|LISTENER_REPLACED'; then exit 0
  else FAILS=$((FAILS+1)); [ "$FAILS" -gt 30 ] && exit 1; sleep 5; fi
done
