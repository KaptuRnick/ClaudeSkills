---
name: end-session
description: >
  Koniec sesji sprintu w DOWOLNYM repo: wydanie na produkcję. Use when user writes "/end-session", "koniec sesji",
  "kończymy sesję", "zamykamy sesję", "wydaj na produkcję", "zrób build", "buduj". Według kontraktu SPRINT.md: elementy
  prod-go włącza na produkcji (status prod, znika znacznik i obwódka), prod-nogo wyłącza i wycofuje z produkcji, jeśli tam
  były (na teście zostają z czerwonymi znacznikami na kolejne sesje); podbija wersję, przechodzi bramy jakości w pętli,
  buduje, dostarcza artefakt z notatkami, zamraża kod, aktualizuje backlog, changelog, dziennik i dokumentację, commituje
  z tagiem i pushem, wdraża i weryfikuje, domyka podsumowaniem i pełną tabelą backlogu. Jedyne miejsce wydania produkcyjnego.
---

# Sprint — koniec sesji (wydanie)

Przebieg: `sprint-start` → praca na teście → checkpointy (`sprint-checkpoint`: statusy go/nogo + commit) → **koniec
sesji** (ten skill). Mechanizm znaczników: `../sprint-start/reference/znaczniki.md`. Projektowe szczegóły w `SPRINT.md`.
Komendy z kontraktu (build, wdrożenie, push, wersja) to niska swoboda: uruchom dokładnie. Opisy — po swojemu.

**Kontrakty pisane przed 2026-11-18** przypisują wydanie słowu „checkpoint” (tag `checkpoint-NN`, „przy każdym
checkpoincie”, „checkpoint kończy się wdrożeniem / pushem”, baza „poprzedni checkpoint”). Czytaj to jako **koniec
sesji**: tagi i bazy działają bez zmian. Na końcu zaproponuj poprawkę słownictwa kontraktu.

## Referencje
- `../sprint-checkpoint/reference/notatki-wydania.md` — notatki do wydania (krok 6).
- `../sprint-checkpoint/scripts/audyt-dlugosci.sh` — audyt długości (krok 4; uruchamiaj, nie czytaj).
- `../sprint-start/reference/tabela-backlogu.md` — tabela backlogu (krok 11).

## Lista kontrolna — skopiuj do odpowiedzi i odhaczaj
```
- [ ] 1. Kontrakt przeczytany; ostatni checkpoint obejmuje wszystko (albo: najpierw checkpoint)
- [ ] 2. Plan wydania: wchodzi (go) / wycofane (nogo na produkcji) / czeka (nogo)
- [ ] 3. Rejestr: go → prod, naProdukcji ustawione; wersja podbita
- [ ] 4. Bramy jakości zielone (blokujące) / dług zarejestrowany (nieblokujące)
- [ ] 5. Build + weryfikacja artefaktu (albo: bez buildu)
- [ ] 6. Artefakt + notatki do wydania OD RAZU; zamrożenie kodu
- [ ] 7. Backlog: wydane usunięte, nowe dopisane
- [ ] 8. Dokumentacja zgodna z kodem i decyzjami + changelog + dziennik / pamięć
- [ ] 8a. Makieta (czysty HTML, bez JS) wygenerowana z kodu wydania na wzorcu i dodana do commita (albo: zbudowana od zera, albo: brak UI)
- [ ] 9. Commit + tag + push / wdrożenie wg kontraktu i weryfikacja produkcji (makieta w commicie)
- [ ] 10. Rejestr wgrany na test (zielone obwódki znikają, czerwone zostają)
- [ ] 11. Domknięcie: podsumowanie + pełna tabela backlogu
```

**1.** Przeczytaj `SPRINT.md` w całości; ustal bazę (poprzednie wydanie wg sekcji **Wersja**). Niezatwierdzone zmiany
sesji albo zmiany bez wpisu w rejestrze → najpierw przeprowadź checkpoint (`sprint-checkpoint`), potem wróć. Cudze
zmiany → nie wciągaj, zgłoś.

**2. Plan wydania** z rejestru, trzy listy: **wchodzi** (`prod-go`), **wycofane** (`prod-nogo` z `naProdukcji: true`),
**czeka** (`prod-nogo`, nigdy niewydane). Pokaż i jedź dalej bez pytania — statusy to decyzje Andrzeja z checkpointów.
Pytaj tylko o: wpisy „bez przełącznika” (migracja, dane), wycofanie elementu bez przełącznika (potrzebny rewert), zmiany
odłożone przez zasady danych testu. Brak sekcji **Znaczniki** (mechanizmu nie ma) → nie da się wydać części: zapytaj
„wydać wszystko czy nic?”, przy `nogo` w planie ostrzeż.

**3.** Rejestr: `prod-go` → `prod` + `naProdukcji: true` + `wydane: <data>`; wycofane → `naProdukcji: false` (status
`prod-nogo` zostaje). `prod-nogo` **nie usuwaj** z rejestru ani z testu. Przełączników nie usuwaj (tylko na wyraźne
polecenie). Potem podbij wersję komendą z kontraktu (jeśli jest).

**4. Bramy — pętla.** Każdą bramę z kontraktu uruchom; blokująca czerwona → popraw → ponownie, aż przejdzie. Brama
nieblokująca tylko mierzy: przekroczony próg → wpis do backlogu w kroku 7 (plik od 150 linii, strefa ZAKAZ
`code-rules`, zawsze). Nie refaktoryzuj teraz.

**5.** Projekt bez buildu → kroki 5–6 pomijasz. Build i weryfikacja komendami z kontraktu (> 10 min → w tle). Nieudany
→ napraw i buduj ponownie; dokumentacji nie ruszaj przed sukcesem. Sprawdź, że artefakt ma włączone wszystkie elementy
z kroku 3. **Mechanizm oznaczania nie idzie na produkcję** (twarde, Andrzej 2026-11-18): w artefakcie produkcji nie
może być obwódek, panelu „Zmiany”, ich stylów i tekstów, nazw i opisów zmian ani statusów go/nogo — tylko realne zmiany
i lista numerów włączonych (przełączniki). Sprawdź grepem po paczce; ślad mechanizmu = błąd buildu, napraw przed
wydaniem (`../sprint-start/reference/znaczniki.md` → Produkcja).

**6.** Gdy artefakt zweryfikowany, **od razu** podaj ścieżkę i notatki do wydania (tylko pozycje „wchodzi”; wycofane
— tylko gdy widoczne dla użytkowników). **Zamrożenie** od udanego buildu do końca: zero zmian w kodzie i ponownych
buildów; poprawki zgłoszone w trakcie → lista „po końcu sesji”. Wyjątek: build nieudany.

**7.** Backlog wg sekcji **Dokumenty**: wydane (`prod`) usunięte → changelog; `prod-nogo` zostają w backlogu.

**8. Dokumentacja: bezwarunkowo.** Spec i reszta dokumentacji muszą się zgadzać z kodem **na produkcji** i z decyzjami
sesji; plik decyzji nie zastępuje speca.
1. `git log` i `git diff --stat` od bazy + decyzje Andrzeja z rozmowy, także te bez kodu.
2. Przeczytaj każdy dokument z sekcji Dokumenty w części dotyczącej zmian; grep po nazwach rzeczy usuniętych / zmienionych.
3. Popraw rozbieżności. Elementy `prod-nogo` opisz jako „w teście, niewydane” z kodem backlogu; wycofane — jako wycofane.
4. Changelog (wchodzi / wycofane), dziennik, pamięć. Wszystko do commita wydania, przed tagiem. Brak wskazanego speca
   → załóż albo zapytaj, gdzie ma być.

**8a. Makieta: bezwarunkowo, brama blokująca.** Makieta = **czysty HTML bez JavaScriptu**: każdy ekran i okno aplikacji
jako statyczny zrzut ze stylami. Plik, który dopiero w przeglądarce rysuje ekrany skryptem, nie jest makietą: agent ani
pandoc nie wyczytają z niego tekstu (Andrzej 2026-11-19). Krok idzie po ostatniej zmianie kodu sesji (po buildzie; nie
łamie zamrożenia, bo makieta nie jest kodem) i nie pomijasz go, nawet gdy sesja „nie ruszała UI”.

**Makieta istnieje** (kontrakt ma sekcję **Makieta** z komendą) → uruchom komendę dokładnie. Generator korzysta z
zapisanego **wzorca** (wypełniony stan danych przykładowych + lista ekranów w repo), więc trwa minuty, nie godziny.
1. Kod wyjścia ≠ 0 albo ekrany bez zrzutu → popraw listę ekranów albo generator i uruchom ponownie (jak brama z kroku 4).
   Bez aktualnej makiety nie ma wydania.
2. `grep -c '<script' <plik makiety>` musi dać 0; inaczej to nie jest czysty HTML → popraw generator.
3. `git status --short` na plikach makiety i wzorca: zmienione → `git add` w kroku 9 (wzorzec odświeżony przez generator
   też). Makieta bez zmian → dopuszczalne tylko wtedy, gdy `git diff --stat <baza>..HEAD` nie pokazuje zmian w kodzie
   frontu; inaczej wygenerowała się stara wersja, ustal przyczynę i popraw.
4. Sesja dodała ekran, zakładkę albo okno, a lista ekranów generatora go nie ma → dopisz wpis i wygeneruj ponownie.

**Makiety nie ma** (projekt ma UI, a kontrakt nie ma sekcji **Makieta**) → zbuduj ją raz, potem zostaje jako wzorzec:
1. Generator w repo (np. `bin/makieta.sh` + skrypt w narzędziach frontu): aplikacja na danych przykładowych w przeglądarce
   bez okna (Playwright), droga do każdego ekranu i okna, zrzut widocznego DOM bez skryptów, ukrytych elementów i
   atrybutów `on*`, z wpisanymi wartościami pól; style z arkuszy strony; grafiki (SVG, obrazki) do CSS jako tło, żeby
   w treści został sam tekst. Wynik: jeden plik HTML ze spisem ekranów.
2. **Wzorzec**: wypełniony stan danych przykładowych (np. localStorage po kreatorze czy logowaniu) zapisany w repo; kolejne
   uruchomienia startują z niego. Nieaktualny wzorzec generator wykrywa i odbudowuje sam. Lista ekranów (droga do każdego) w osobnym pliku.
3. Dopisz sekcję **Makieta** do `SPRINT.md`: komenda, pliki wynikowe, wzorzec, zasada „nowy ekran = nowy wpis na liście
   ekranów”. Wzór: Lumenu (`~/Projekty/Lumenu/web/narzedzia/makieta-html/`, `SPRINT.md` → Makieta).
4. Projekt bez UI → odnotuj w podsumowaniu „bez makiety (brak UI)”.

**9.** Commit (format i stopka z kontraktu), `git add` konkretnych plików, nie `-A`; placeholdery wypełnij wartościami
z tego wydania. Tag, push i wdrożenie — komendami z kontraktu. Po commicie sprawdź, że weszło (pułapki z sekcji
**Git**); plik makiety zmieniony w 8a musi być w `git show --stat HEAD`. Nie ma go → dołóż (`git commit --amend`)
**przed** tagiem i pushem. Po wdrożeniu — weryfikacja z kontraktu i obecność rejestru z kroku 3 na produkcji.

**10. Czysta karta na test.** Wgraj rejestr na test (komenda z sekcji **Znaczniki**): wydane (`prod`) tracą status
go i obwódkę i znikają z panelu „Zmiany”; zostają tylko `prod-nogo` (czerwone). Sprawdź: bez `nogo` panel pokazuje
„Zmiany · 0” na zielono, a na ekranach nie ma żadnych ramek — nowa sesja zaczyna od czystej karty.

**11. Domknięcie:** **weszło na produkcję** (po punkcie, z kodem) · **wycofane z produkcji** · **czeka w teście (nogo)**
· zaktualizowane dokumenty (plik: co zmieniono) · makieta (plik, liczba ekranów, commit; albo „zbudowana od zera” / „brak UI”) · pełna tabela
backlogu. Bez listy „Do sprawdzenia” (sprawdzono na
teście); wyjątek: `brak` w sekcji **Środowisko testowe** → lista „co przetestować” po wydaniu. Nie pytaj „co dalej”.

## Samodoskonalenie
Krok nie udał się z powodu, którego kontrakt nie opisuje → zaproponuj konkretną regułę do `SPRINT.md`; dopisz po
akceptacji. Następne wydanie już jej przestrzega.
