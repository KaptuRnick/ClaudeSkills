# widoki

Skill dla Claude Code: widoki HTML (backlog, plany, raporty, strona sesji) do pracy human-in-the-loop, otwierane w przeglądarce przez [Lavish](https://github.com/kunchenguid/lavish-axi).

- Pliki `.md` zostają źródłem prawdy, HTML to widok generowany.
- Lavish **nie jest bundlowany**: skill woła `npx -y lavish-axi@<przypięta wersja>` (wymaga Node 22+). Bez Node HTML otwiera się jako zwykły plik.
- `share` Lavisha jest zablokowany w wrapperze (publiczny upload).
- Zero zależności własnych.

Instalacja: skopiuj folder do `~/.claude/skills/widoki/`.

Status: etap 1 (rdzeń + widok backlogu). Zob. `SKILL.md`.

Licencja MIT. Styl i podejście wzorowane na [anthropics/html-effectiveness](https://github.com/anthropics/html-effectiveness) (MIT), zob. `NOTICE`.
