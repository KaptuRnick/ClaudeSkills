#!/usr/bin/env bash
# Audyt długości plików zmienionych od bazy (code-rules: OK do 100 linii · ALARM 101-149 · ZAKAZ od 150). Wymaga: bash, git, awk (bez instalacji).
# Użycie: audyt-dlugosci.sh <baza: commit|tag> '<glob, np. *.kt albo prototyp/js/*.js>' [alarm=100] [sufit=150]
# Wynik: pliki w strefie alarmu i zakazu (strefa, liczba linii, ścieżka) oraz odsetek; kod wyjścia 0 zawsze (brama nieblokująca).
# Progi zgodne ze skillem code-rules (references/limity-i-podzial.md). Skrypt jest samodzielny celowo — bez zależności od innych skilli.
set -euo pipefail
BAZA="${1:?podaj bazę (commit albo tag poprzedniego checkpointu)}"; GLOB="${2:?podaj glob plików}"; ALARM="${3:-100}"; SUFIT="${4:-150}"
cd "$(git rev-parse --show-toplevel)"
WSZYSTKIE=0; ALARMOWE=0; ZAKAZANE=0
while IFS= read -r f; do
  [ -f "$f" ] || continue
  WSZYSTKIE=$((WSZYSTKIE + 1))
  n=$(awk 'END{print NR}' "$f")
  if [ "$n" -ge "$SUFIT" ]; then ZAKAZANE=$((ZAKAZANE + 1)); printf '  ZAKAZ  %5d  %s\n' "$n" "$f"
  elif [ "$n" -gt "$ALARM" ]; then ALARMOWE=$((ALARMOWE + 1)); printf '  ALARM  %5d  %s\n' "$n" "$f"; fi
done < <({ git diff --name-only "$BAZA" HEAD -- "$GLOB"; git diff --name-only -- "$GLOB"; git ls-files --others --exclude-standard -- "$GLOB"; } | sort -u)
PROC=0; [ "$WSZYSTKIE" -gt 0 ] && PROC=$((100 * (ALARMOWE + ZAKAZANE) / WSZYSTKIE))
echo "Plików: $WSZYSTKIE · strefa alarmu ($((ALARM + 1))-$((SUFIT - 1))): $ALARMOWE · zakaz (od $SUFIT): $ZAKAZANE · ponad alarm: $PROC%"
