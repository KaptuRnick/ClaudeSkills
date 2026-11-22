---
name: sprint-checkpoint
description: >
  Checkpoint sprintu w DOWOLNYM repo: uniwersalny, globalny, lekki. Use when user writes "checkpoint", "zrób
  checkpoint", "oznacz", "zapisz stan" (sygnał w trakcie sesji, można wielokrotnie). Według kontraktu SPRINT.md (korzeń repo)
  oznacza elementy sprintu statusem prod-go / prod-nogo w rejestrze znaczników (zielone / czerwone obwódki 1px i panel
  „Zmiany” na teście), wgrywa rejestr na test i lokalnie commituje zmiany. NIC więcej: bez wersji, bram, buildu,
  dokumentacji, pusha i produkcji. Wydanie na produkcję robi wyłącznie skill end-session ("/end-session", "koniec sesji").
---

# Sprint — checkpoint (znaczniki + commit)

Przebieg sesji: `sprint-start` → praca na teście → **checkpointy** (ten skill, ile razy chcesz) → `end-session`
(wydanie). Checkpoint tylko ocenia gotowość i zapisuje postęp. Mechanizm znaczników:
`../sprint-start/reference/znaczniki.md`. Projektowe ścieżki i komendy: `SPRINT.md` (sekcje **Znaczniki**, **Środowisko
testowe**, **Git**). Komendy z kontraktu uruchamiaj dokładnie.

## Lista kontrolna — skopiuj do odpowiedzi i odhaczaj
```
- [ ] 1. Kontrakt przeczytany; wszystko z sesji jest już na teście
- [ ] 2. Lista elementów z proponowanym statusem (ukryte = GO automatycznie) → decyzja Andrzeja
- [ ] 3. Rejestr zapisany i wgrany na test; wpisy backlogu w całości prod-go zdjęte do „Do wydania”
- [ ] 4. Lokalny commit (bez tagu, bez pusha)
- [ ] 5. Krótkie podsumowanie + pełna tabela backlogu
```

**1.** Przeczytaj `SPRINT.md`: sekcje Znaczniki, Środowisko testowe, Git. Zmiana w kodzie, której Andrzej nie widział na
teście → najpierw wgraj ją i daj listę „Do sprawdzenia” (zasady `../sprint-start/SKILL.md`). Cudze niezatwierdzone
zmiany → nie wciągaj, zgłoś. Brak sekcji **Znaczniki** → statusy i tak zapisz w rejestrze (`znaczniki.json` w korzeniu),
napisz jednym zdaniem, że obwódek i panelu jeszcze nie ma, i zaproponuj wdrożenie mechanizmu jako zadanie sprintu.

**2. Lista do decyzji.** Tabela wszystkich wpisów rejestru ze statusem `prod-go` / `prod-nogo` plus zmiany sesji bez
wpisu (dopisz je: `rodzaj` `ui` albo `ukryta`, `opis` dla ukrytych):

| Kod | Element | Widok | Rodzaj | Teraz | Proponuję |
|---|---|---|---|---|---|

Propozycja: punkt potwierdzony przez Andrzeja z listy „Do sprawdzenia” → `prod-go` (reguła „ok” = GO z
`../sprint-start/SKILL.md`, pkt 7: takie elementy mają już `prod-go` w rejestrze i nie wymagają ponownej zgody); niepotwierdzony, z uwagami albo
nowy → `prod-nogo`. **Zmiany niewidoczne (`rodzaj: ukryta`) → `prod-go` automatycznie** (decyzja Andrzeja 2026-11-21: nie da
się ich obejrzeć na teście, więc nie czekają na „ok”), chyba że Andrzej wprost oznaczył je jako nogo albo zgłosił do nich
uwagę; tak samo `ukryta` z wcześniejszych sesji. Pozostałe wpisy `prod-nogo` z wcześniejszych sesji zostają `nogo`, chyba
że Andrzej potwierdził je w tej.
Zmiana „bez przełącznika” (migracja, dane) → osobny wiersz z ostrzeżeniem. Pod tabelą jedno pytanie: „Potwierdzasz czy
zmieniasz?” Andrzej może też oznaczyć `prod-nogo` element już wydany (`prod`) — wtedy `naProdukcji: true`, a koniec
sesji go wycofa. Element wydany bez przełącznika → powiedz, że wycofanie wymaga rewertu, i dopisz zadanie do backlogu.

**3.** Zapisz statusy w rejestrze (`status`; `naProdukcji` nie zmieniaj). Wgraj rejestr na test komendą z sekcji
**Znaczniki** i sprawdź wynik weryfikacji.
**Backlog (decyzja Andrzeja 2026-11-21): checkpoint kończy sprint dla zatwierdzonych zmian.** Wpis backlogu, którego
wszystkie elementy rejestru mają `prod-go`, znika z backlogu w tym samym checkpoincie; jego opis (kod, co weszło, pole
zgłoszeń) trafia do sekcji `## Do wydania` na górze changelogu (z niej koniec sesji robi wpis wydania). Wpis z choć jednym
`prod-nogo` zostaje w backlogu z dopiskiem, które elementy już są GO. Tabela backlogu w kroku 5 nie pokazuje zakończonych.

**4. Commit lokalny**: `git add` konkretnych plików (kod sesji + rejestr), nie `-A`; format i stopka z sekcji **Git**,
temat `checkpoint: <kody go> go, <kody nogo> nogo`. **Bez** podbijania wersji, tagu, pusha, buildu produkcyjnego,
wpisu wydania w changelogu i dokumentacji (sekcja „Do wydania” z kroku 3 to nie wydanie), nawet gdy kontrakt (pisany przed 2026-11-18) przypisuje je „checkpointowi” — w nowym
przebiegu należą do `end-session`. Pułapki z sekcji Git (np. weryfikacja staged) obowiązują.

**5. Podsumowanie** (krótko): `go:` kody i nazwy · `nogo:` kody i nazwy · do wycofania z produkcji przy końcu sesji ·
hash commita. Listy „Do sprawdzenia” z niepotwierdzonymi punktami nie kasuj — zostaje do kolejnych wgrań.
Pod podsumowaniem **zawsze pełna tabela backlogu** (decyzja Andrzeja 2026-11-18) wg
`../sprint-start/reference/tabela-backlogu.md` i kolumn z kontraktu: cała lista, bez skrótów. Bez pytania „co dalej”.

## Widok HTML (opcjonalny dodatek)
Po zwykłym wyniku w czacie (który zostaje pełny tekstowo) wywołaj skill `widoki` wg jego sekcji „Podpięcie pod sprint-start, checkpoint i end-session” — po kroku 5: regeneracja Backlogu i strony sesji. Brak skilla `widoki` albo Node → pomiń bez słowa; błąd generatora nie blokuje kroku.

## Samodoskonalenie
Krok nie udał się z powodu, którego kontrakt nie opisuje → zaproponuj konkretną regułę do `SPRINT.md`; dopisz po
akceptacji.
