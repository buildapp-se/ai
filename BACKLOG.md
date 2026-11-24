# Backlog

## Rester från flytten till buildapp.se

- [x] `og.png` omgjord 2026-08-27. Rubriken är nu sidans faktiska, "Every name, in
  the right order", och märket är kartans ryggrad. Den gamla bilden hade röstpil,
  bock och kickern "Curated · Ranked · Voted", alltså tre påståenden om funktioner
  som inte finns kvar. Renderingskommandot står i `og.source.html`.
- [x] Byt kontaktmailen från `kontakt@orgutveckling.se`. Löst 2026-10-27 med nya sidan: sidfoten visar `kontakt@buildapp.se`.

## Innehåll

- [x] Fler resurser i den kurerade listan. Stängd 2026-10-27: listan fanns på den gamla sidan, som ersatts. Innehållet i nya sidan ändras i webbverkstad `runs/ai-solsystem` (avsnittet `lar`).

## Quiz

Quizet borttaget 2026-10-27 på Patriks begäran; öppna punkter (resultattext, förklaringar, dubbletter, illustrationer, engelska) stängda med det. `quiz-data.js` kvar för spelets bossfråga.

## Spelet

Flyttat till `buildapp-se/terminal` 2026-10-17, backloggen där. Kvar här:

- [x] Länka spelet `buildapp.se/terminal/` från `index.html` (kort under station 03) och quizets toppfält. Gjort 2026-10-17 (quizet borttaget 2026-10-27).

## Granskning 2026-10-06

Fynd från den automatiska sviten (aifabriken `tools/audit-suite.ts`: headers, npm audit, secrets, Actions, markup, axe). Mätvärdena står som `(automated)`-rader under `## Audits` i CONTEXT.md.

- [x] `[P3]` Markup: en `<link>` i `<head>` behåller `as`-attributet efter att `rel` bytts från `preload` till `stylesheet` (html-validate `attribute-misuse`, renderad DOM, `head > link:nth-child(21)`). Ofarligt, men ger fail i kolumnen: ta bort `as` i onload-bytet. Gjort 2026-10-06 (1b1cfa9): renderad DOM har `rel=stylesheet` utan `as`, html-validate `attribute-misuse` 0. Grenen `batch/2026-10-06` mergad till `main` och deployad 2026-10-07 på Patriks order.
- [x] `[P3]` WCAG: axe hittar 0 fel men kan inte avgöra kontrasten på 135 element. Manuell kontrastkontroll återstår. De 61 externa länkarna kontrolleras inte av sviten.
  Gjort 2026-10-06: beräknad kontrast för all synlig text (274 till 325 element per läge) i sv/en, kort/lista, 390 och 1280 px, efter att animationerna kört klart. Enda fyndet var kortens pil `→` (1,29:1), ren dekor, nu `aria-hidden`. Inte täckt: hover- och fokuslägen, tangentbordsgenomgång. Externa länkar: 62 unika, 60 svarar 200, `claude.ai` och `openai.com/codex` svarar 403 på skript (botskydd, inte trasiga).
- [x] P2 OWASP 2026-10-30 (Mistral Large, kontrollerat live av Claude): `Content-Security-Policy` på buildapp.se har ingen `script-src` (bara frame-ancestors, base-uri, object-src), och `index.html` och `integritet.html` har inline-skript. Antingen meta-CSP med hashar per sida eller `script-src` i zonens Transform Rule, som delas med alla sajter under buildapp.se.
  Åtgärdat 2026-11-04 i PR #1 (mergad 2026-11-04): meta-CSP med hash per sida plus `csp.test.js`. Överfört till webbverkstad 2026-11-05 (4a51ec7).

## UX-audit 2026-11-24

- [x] `[P3]` Fitts: tryckytor under 44 px på telefon (390 px). Sorteringsknapparna i tabellhuvudet i `#start` ("Pris", 34 px bred) och `#verifiera` ("Edge" 30, "Firefox" 42, "Safari" 37), listlänkarna "Arena" och "METR" i `#benchmarks` (42) och "dcg" i `#verktyg` (26), samt fyra guidelänkar i `#hosting` (`.h-guides`, strax under 44 px höga). Gjort 2026-11-24: `min-width`/`min-height: 44px` i källan (webbverkstad f6adce4) och kopierat hit; ux-checks visar inga av dem längre, skärmbilder 390 och 1440 px visuellt oförändrade.
- [ ] `[P3]` Fitts, kvarstår medvetet: MCP-asterisken `.v-star` i `#verifiera` är 28 x 44 px (vald 2026-11-04, klarar WCAG 2.5.8), och textlänkarna "Qwen" och "Llama" i `#andra` (39 och 42 px breda, `inline-block` i löptext) samt två inline-länkar i `#hosting` och `#benchmarks` figcaption. Löptextlänkar omfattas av WCAG:s undantag; bredare yta skulle ändra textflödet. Patrik avgör om asterisken ska bli 44 px.
- [ ] `[P3]` Gaten `node C:/dev/webbverkstad/gates/check.mjs` ger ingen PASS för sidan: `waitForMotionEnd` når timeout efter 6 s (kartan animerar hela tiden). Samma på oförändrad `main`, alltså inte orsakat av ändringen ovan. Rättas i webbverkstads gate.

## Buggjakt 2026-11-24

- [x] `[P2]` Tangentbord: med en planet öppen bytte en pil i benchmarks-tabellen planet och flyttade fokus upp till kartans panel, och Esc i Datorn ("Esc visar hela igen") stängde också planeten och flyttade fokus till kartan. Kartans `keydown` lyssnade på hela sidan. Rättat 2026-11-24 i webbverkstad 1f81f47: bara händelser inifrån `#space`, eller från `body` medan kartan syns. `map-keys.test.mjs` (webbverkstad, run-mappen) fäller före och ger PASS efter lokalt.
- [x] `[P3]` WCAG 3.1.2: knappen English satte `lang=en` på hela sidan, även på avsnitten som bara finns på svenska. Rättat 2026-11-24 (webbverkstad 1f81f47): avsnitten ligger i en `<div lang="sv">`, sektionernas positioner oförändrade vid 390 och 1440 px.
- [ ] `[P3]` Om `three.js` inte laddas (blockerad i testet) kastar `app.js` direkt: listan står öppen men ingressen säger fortfarande "Klicka eller tryck på en planet", och kartans yta står tom. Hittat 2026-11-24 med en blockerad förfrågan i Playwright; inte rättat.
