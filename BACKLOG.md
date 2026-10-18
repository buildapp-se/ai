# Backlog

## Rester från flytten till buildapp.se

- [x] `og.png` omgjord 2026-08-27. Rubriken är nu sidans faktiska, "Every name, in
  the right order", och märket är kartans ryggrad. Den gamla bilden hade röstpil,
  bock och kickern "Curated · Ranked · Voted", alltså tre påståenden om funktioner
  som inte finns kvar. Renderingskommandot står i `og.source.html`.
- [ ] Byt kontaktmailen från `kontakt@orgutveckling.se` i topbar och footer när en
  ny adress finns. Footern byggs i JS längst ner i `index.html`.

## Innehåll

- [ ] Fler resurser i den kurerade listan.

## Quiz (`quiz.html`)

- [ ] `resultText()` i `quiz.html`: rubrik och text på resultatsidan efter poäng (Patrik skriver).
- [x] Länka quizet från `index.html`: toppfältet (dolt på mobil) och sidfoten. Gjort 2026-10-18.
- [x] Pedagogisk förklaring per felval i flervalsfrågorna (`notes`). Gjort 2026-10-16.
- [x] Terminalkommandonas namn (`cd` = change directory) visas efter varje omgång. Gjort 2026-10-16.
- [ ] Programspråk och backend: para ihop-delarna saknar förklaring efter omgången. Förkortningar som HTML, CSS, SQL, API, CDN och VPS kan få samma namnlista som kommandona (tredje fältet i paret).
- [ ] Dubbletter mellan quizen: Kontextfönster (Grunder steg 6 och Tekniska ord), Databas och API (Backend och Tekniska ord, nästan ordagrant), commit-texten i Tekniska ord upprepas i git-förklaringen. Skriv om Tekniska ord så att de kompletterar (granskning 2026-10-17).
- [ ] Illustrationer till frågorna (till exempel hur en token delar upp ett ord, eller hur frontend, API och databas hänger ihop).
- [ ] Engelsk version, som resten av sidan (`data-sv`-mönstret).

## Spelet

Flyttat till `buildapp-se/terminal` 2026-10-17, backloggen där. Kvar här:

- [x] Länka spelet `buildapp.se/terminal/` från `index.html` (kort under station 03) och quizets toppfält. Gjort 2026-10-17.

## Granskning 2026-10-06

Fynd från den automatiska sviten (aifabriken `tools/audit-suite.ts`: headers, npm audit, secrets, Actions, markup, axe). Mätvärdena står som `(automated)`-rader under `## Audits` i CONTEXT.md.

- [x] `[P3]` Markup: en `<link>` i `<head>` behåller `as`-attributet efter att `rel` bytts från `preload` till `stylesheet` (html-validate `attribute-misuse`, renderad DOM, `head > link:nth-child(21)`). Ofarligt, men ger fail i kolumnen: ta bort `as` i onload-bytet. Gjort 2026-10-06 (1b1cfa9): renderad DOM har `rel=stylesheet` utan `as`, html-validate `attribute-misuse` 0. Grenen `batch/2026-10-06` mergad till `main` och deployad 2026-10-07 på Patriks order.
- [x] `[P3]` WCAG: axe hittar 0 fel men kan inte avgöra kontrasten på 135 element. Manuell kontrastkontroll återstår. De 61 externa länkarna kontrolleras inte av sviten.
  Gjort 2026-10-06: beräknad kontrast för all synlig text (274 till 325 element per läge) i sv/en, kort/lista, 390 och 1280 px, efter att animationerna kört klart. Enda fyndet var kortens pil `→` (1,29:1), ren dekor, nu `aria-hidden`. Inte täckt: hover- och fokuslägen, tangentbordsgenomgång. Externa länkar: 62 unika, 60 svarar 200, `claude.ai` och `openai.com/codex` svarar 403 på skript (botskydd, inte trasiga).
