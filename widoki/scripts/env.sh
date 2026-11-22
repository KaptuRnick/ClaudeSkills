# Wspólne: znajdź node i npx także poza PATH (sandbox VSCode/Flatpak, nvm, volta, fnm, brew).
# Użycie: . "$(dirname "$0")/env.sh"   — po tym `command -v node npx` działa albo ich nie ma w ogóle.
if ! command -v npx >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
  for d in "$HOME"/.nvm/versions/node/*/bin "$HOME/.volta/bin" "$HOME/.fnm/aliases/default/bin" \
           "$HOME/.local/share/fnm/aliases/default/bin" "$HOME/.local/bin" /usr/local/bin \
           /opt/homebrew/bin /home/linuxbrew/.linuxbrew/bin /usr/bin; do
    if [ -x "$d/node" ] && [ -x "$d/npx" ]; then PATH="$d:$PATH"; export PATH; break; fi
  done
fi
