#!/usr/bin/env bash
# Łatka na przypiętą wersję Lavisha (wołana przez lavish.sh): chowa w oknie Lavisha przyciski, które psują pracę ze skillem:
# „Send & End” i „End session” (kończą sesję, strona sesji przestaje się odświeżać) oraz „Publish link” (publiczny upload
# na ht-ml.app, zakazany jak `share`). Elementy zostają w HTML (skrypt Lavisha ich szuka), dostają `hidden`.
# Idempotentna (znacznik data-widoki); po nałożeniu zatrzymuje działający serwer Lavisha, żeby nowy start podał poprawione okno.
# Użycie: lavish-latka.sh <wersja>
V="$1"
UKRYJ=' data-widoki="ukryte" hidden style="display:none!important"'
# Ta sama wersja potrafi leżeć w kilku katalogach cache npx (różne środowiska wywołania): łatamy wszystkie.
kopie() { for p in "$HOME"/.npm/_npx/*/node_modules/lavish-axi/package.json; do
  [ -f "$p" ] && grep -q "\"version\": *\"$V\"" "$p" && echo "$(dirname "$p")/dist/cli.mjs"; done; }
[ -n "$(kopie)" ] || npx -y "lavish-axi@$V" --version >/dev/null 2>&1
ZMIANA=0
while IFS= read -r CLI; do
  [ -f "$CLI" ] || continue
  grep -q 'data-widoki="ukryte"' "$CLI" && continue
  sed -i \
    -e "s#<button class=\"button button-danger\" id=\"sendAndEnd\" type=\"button\">#<button class=\"button button-danger\" id=\"sendAndEnd\" type=\"button\"$UKRYJ>#" \
    -e "s#<button class=\"menu-item danger\" id=\"end\" type=\"button\">#<button class=\"menu-item danger\" id=\"end\" type=\"button\"$UKRYJ>#" \
    -e "s#<button class=\"menu-item\" id=\"shareArtifact\" type=\"button\">#<button class=\"menu-item\" id=\"shareArtifact\" type=\"button\"$UKRYJ>#" \
    "$CLI"
  N="$(grep -o 'data-widoki="ukryte"' "$CLI" | wc -l)"
  [ "$N" -ge 3 ] || echo "widoki: łatka Lavisha nałożona częściowo ($N/3) w $CLI — sprawdź wersję $V" >&2
  ZMIANA=1
done <<< "$(kopie)"
[ "$ZMIANA" = 1 ] && { npx -y "lavish-axi@$V" stop >/dev/null 2>&1 || true; }
exit 0
