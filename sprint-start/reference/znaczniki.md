# Znaczniki go/nogo — mechanizm (sprint-start, sprint-checkpoint, end-session)

Cel: na produkcję trafia tylko to, czemu Andrzej dał zielone światło, a test pokazuje stan gotowości jednym spojrzeniem.
Wdrażany raz na projekt (pierwsze zadanie sprintu albo wpis w backlogu), opisany w sekcji **Znaczniki** w `SPRINT.md`.

## Statusy
| Status | Kto ustawia | Test | Produkcja |
|---|---|---|---|
| `prod-nogo` | domyślny dla nowego wpisu; checkpoint | działa, czerwona obwódka 1px | wyłączone (a było tam → wycofane przy końcu sesji) |
| `prod-go` | checkpoint (decyzja Andrzeja) | działa, zielona obwódka 1px | jeszcze wyłączone, włącza je koniec sesji |
| `prod` | tylko `end-session` | działa, bez obwódki | działa |

`prod-nogo` nigdy nie znika z testu: przechodzi na kolejne sesje i sprinty z czerwoną obwódką, aż checkpoint da `prod-go`.

## Rejestr — `znaczniki.json` (ścieżka w kontrakcie)
```json
{ "elementy": [
  { "kod": "#41", "nazwa": "Filtr po dacie", "widok": "lista-zamowien", "rodzaj": "ui",
    "status": "prod-go", "naProdukcji": false, "od": "2026-11-18" },
  { "kod": "#42", "nazwa": "Rabat liczony od netto", "widok": "koszyk", "rodzaj": "ukryta",
    "opis": "Rabat od netto zamiast brutto; zaokrąglenie do grosza", "status": "prod-nogo",
    "naProdukcji": false, "od": "2026-11-18" }
] }
```
- `kod` — numer z backlogu (kilka wpisów na jeden kod: `#42a`, `#42b`). `widok` — identyfikator widoku albo okienka.
- `rodzaj`: `ui` (widać w interfejsie → obwódka) | `ukryta` (mechanika, wzór, logika, API, walidacja → panel niżej).
- `naProdukcji` — czy element działa dziś na produkcji (ustawia tylko `end-session`).
- Wpis powstaje **w chwili napisania zmiany**, ze statusem `prod-nogo`. Zmiana bez wpisu nie jest częścią sprintu.
- **Ziarnistość (Andrzej 2026-11-18):** osobny wpis i osobna obwódka dla każdego elementu, który da się osobno przyjąć
  albo odrzucić: karta, sekcja, kafelek, przycisk, akapit opisowy, pozycja listy z własną treścią. Nigdy jedna obwódka na
  kontener z kilkoma takimi elementami. Kontener (np. nowy widok zamiast starego) dostaje wpis tylko na sam fakt zamiany
  i na to, co jest jego własną treścią (nagłówek); elementy w środku mają własne kody (`#42a`, `#42b`…) i własne
  przełączniki. Lista „Do sprawdzenia”: punkt na element, z kodem, żeby „ok” trafiało w jeden wpis.

## Produkcja: tylko realne zmiany (Andrzej 2026-11-18, twarde)
Cały mechanizm oznaczania istnieje **wyłącznie na teście**. Na produkcję nie idą: obwódki, panel „Zmiany”, ich style i
teksty, atrybuty znaczników w HTML, nazwy i opisy zmian ani statusy go/nogo. Produkcja dostaje działające zmiany i samą
listę numerów włączonych elementów (status `prod`), bo z niej czytają przełączniki.
- Build: pełny rejestr tylko w buildzie testu (i w testach automatycznych); build produkcji wstawia listę `{kod, status:
  prod}`. Kod panelu, obwódek, ich style i teksty w osobnym fragmencie ładowanym warunkiem na stałej z buildu (np. Vite:
  `import.meta.env.VITE_X` z kropką — zapis z nawiasem nie jest podmieniany), żeby bundler wyciął go z paczki produkcji.
- Znaczniki elementów (`data-…`) nadawane w kodzie helperem, który na produkcji nic nie robi — nie w szablonach HTML.
- Serwer: na produkcję wgrywany przefiltrowany rejestr (same numery włączonych).
- Weryfikacja przy końcu sesji: w artefakcie produkcji brak klas i tekstów panelu, nazw zmian i statusów `prod-go` /
  `prod-nogo` (grep po paczce).

## Przełącznik w kodzie
`wlaczone(kod)` = środowisko testowe → zawsze `true`; produkcja → `status == "prod"`.
- Nowy element: cały za przełącznikiem. Zmiana istniejącego: stara i nowa ścieżka obok siebie, wybór przełącznikiem.
- Przełącznik zostaje w kodzie także po `prod`, bo umożliwia późniejsze wycofanie. Usuwanie przełączników tylko na
  wyraźne polecenie Andrzeja („posprzątaj znaczniki”); element bez przełącznika da się wycofać już tylko rewertem kodu.
- Produkcja czyta własną kopię rejestru z ostatniego końca sesji; test ma własną, odświeżaną przy każdym checkpoincie.
- Nie da się wyłączyć: migracje schematu, zmiany danych, skutki zewnętrzne. Taki wpis ma w `opis` dopisek
  „bez przełącznika”; jego wycofanie wymaga zgody i osobnej zmiany cofającej.

## Obwódki (tylko test)
Element `rodzaj: ui` oznaczony w kodzie kodem wpisu. Kolor z rejestru: `prod-go` zielony, `prod-nogo` czerwony,
`prod` brak. 1px i **bez zmiany układu**. Kolory jako tokeny motywu (`code-rules`: zero kolorów na sztywno).
- Web: atrybut `data-znacznik="#41"` + `outline: 1px solid var(--znacznik-go|nogo)`; `outline-offset: -1px`.
- Android Compose: `Modifier.znacznik("#41")` rysujący przez `drawWithContent` (nie `border`, bo zmienia rozmiar).
- Produkcja: helper zwraca element bez zmian; kod obwódek nie wykonuje się wcale.

## Panel „Zmiany” (tylko test)
Jeden zwijany panel (domyślnie pasek „Zmiany · N”; w Lumenu na środku stopki, rozwija się do góry), widoczny w każdym
widoku i nad każdym okienkiem (dialog, modal, arkusz, pełnoekranowy kreator) wersji testowej. Decyzja Andrzeja
2026-11-18: jedno miejsce, w którym widać wszystko, co zaszło w sprincie, i status każdej zmiany.
- Lista: **wszystkie niewydane wpisy** rejestru (`prod-go` / `prod-nogo`), najpierw widoczne (`rodzaj: ui`) jako same
  punkty (znaczek statusu, kod jako etykieta, nazwa, bez opisu), pod kreską i małym napisem „Niewidoczne” wpisy `rodzaj: ukryta`
  z `opis`. Znaczek statusu w kolorze (go zielony / nogo czerwony). Pusta część → „Brak zmian widocznych” / „Brak
  zmian niewidocznych”.
- **Kod jako etykieta (Andrzej 2026-11-18):** numer z backlogu (`#42`, `#42a`) to klikalna etykieta; kliknięcie kopiuje go
  do schowka i na chwilę pokazuje „✓”, żeby użytkownik mógł szybko odnieść się do pozycji w czacie.
- Kolor obwódki panelu: na liście nic czerwonego (także pusto) → zielony, część zielona i część czerwona → żółty, same
  `prod-nogo` → czerwony. Panelu nie ma w rejestrze i nigdy nie trafia na produkcję (wyłączony warunkiem środowiska
  testowego, nie statusem).
- Wdrażany raz, jako wspólny komponent ramy aplikacji (rejestr mechanizmów `code-rules`), a nie kopiowany do
  każdego ekranu. Teksty przez system tłumaczeń projektu.

## Sekcja w `SPRINT.md`
```markdown
## Znaczniki
- Rejestr: `<ścieżka>/znaczniki.json` · przełącznik: `<plik / funkcja>` · obwódka: `<helper>` · panel: `<komponent>`
- Wgranie rejestru na test (dokładnie): `<komenda>` → weryfikacja: `<komenda / wynik>`
- Produkcja czyta rejestr z: `<ścieżka w artefakcie>` (pakowany przy końcu sesji)
```
Albo `brak (powód)`, np. projekt bez interfejsu i produkcji. Wtedy statusy żyją tylko w rejestrze, a koniec sesji wydaje
wszystko albo nic (pyta Andrzeja).

## Wdrożenie w projekcie (jedno pytanie na raz)
1. Typ projektu i miejsce rejestru (wyczytaj z repo). 2. Jak kod odróżnia test od produkcji (zmienna, wariant buildu,
ścieżka). 3. Przełącznik, helper obwódki, panel w ramie widoku i okienka. 4. Komenda wgrania rejestru na test.
5. Projekt sekcji → zapis po akceptacji. Elementy już na produkcji bez przełącznika: wpis `prod` tylko gdy Andrzej
chce mieć możliwość ich wycofania (wtedy przełącznik dopisujemy w sprincie).
