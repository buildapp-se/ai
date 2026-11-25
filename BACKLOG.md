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
- [x] (inaktuell 2026-11-24: grinden på webbverkstads main ger PASS på `index.html` och `integritet.html`; timeouten finns enligt webbverkstads BACKLOG på grenen `review/candidates-2026-11-04`) `[P3]` Gaten `node C:/dev/webbverkstad/gates/check.mjs` ger ingen PASS för sidan: `waitForMotionEnd` når timeout efter 6 s (kartan animerar hela tiden). Samma på oförändrad `main`, alltså inte orsakat av ändringen ovan. Rättas i webbverkstads gate.

## Buggjakt 2026-11-24

- [x] `[P2]` Tangentbord: med en planet öppen bytte en pil i benchmarks-tabellen planet och flyttade fokus upp till kartans panel, och Esc i Datorn ("Esc visar hela igen") stängde också planeten och flyttade fokus till kartan. Kartans `keydown` lyssnade på hela sidan. Rättat 2026-11-24 i webbverkstad 1f81f47: bara händelser inifrån `#space`, eller från `body` medan kartan syns. `map-keys.test.mjs` (webbverkstad, run-mappen) fäller före och ger PASS efter, lokalt och live (buildapp.se/ai, 6d9e865).
- [x] `[P3]` WCAG 3.1.2: knappen English satte `lang=en` på hela sidan, även på avsnitten som bara finns på svenska. Rättat 2026-11-24 (webbverkstad 1f81f47): avsnitten ligger i en `<div lang="sv">`, sektionernas positioner oförändrade vid 390 och 1440 px.
- [x] `[P3]` Om `three.js` inte laddas (blockerad i testet) kastar `app.js` direkt: listan står öppen men ingressen säger fortfarande "Klicka eller tryck på en planet", och kartans yta står tom. Rättat 2026-11-24 (webbverkstad a29eb4d): sidan får `no-webgl` som utan WebGL, inga skriptfel, även i Datorn. `no-three.test.mjs` (webbverkstad, run-mappen) fäller före och ger PASS efter.
- [x] `[P3]` `integritet.html` sa "Version 2.8 och tidigare" om den förra sidan; den sista var 2.9 (5909159). JSON-LD `dateModified` 2026-10-28 är nu 2026-11-24. Rättat 2026-11-24 (webbverkstad f8a8acd).

## Fart och tillgänglighet 2026-11-25

Mätt live med Playwright (Chromium), 390 px med 4x CPU-strypning och Slow 4G (562,5 ms, 1,4 Mbit/s) samt 1440 px utan strypning, efter scroll genom hela sidan. CLS räknas som största sessionsfönster.

- [x] `[P2]` `integritet.html` hoppade när typsnitten byttes in: CLS 0,24 vid 390 px (stycket och listan under rubriken flyttade sig). Rättat 2026-11-25 (webbverkstad a51fbbb, här 99ab412): `<link rel="preload">` för de tre typsnitt sidan använder. Live efter: CLS 0, LCP 0,78 s före och 1,13 s efter (typsnitten hinner fram före första bilden). 1440 px: CLS 0,002 före, 0 efter.
- [x] `[P3]` `integritet.html` flödade inte om vid smal bredd: rubriken "Integritetspolicy" 5 px för bred vid 320 px och länken "Integritetsskyddsmyndigheten" sköt ut sidan vid 188 px (200 % zoom på 375 px), webbverkstads grind X10 och X9. Rättat i samma commit: rubrikens minsta storlek `min(1.8rem, 8.6vw)` (oförändrad från 390 px och uppåt) och `overflow-wrap: break-word` på `body`. Live: `scrollWidth` 188 vid 188 px och 320 vid 320 px.
- [ ] `[P3]` Grinden `check.mjs` ger nu X3 på `integritet.html`: den öppnar sidan som `file://`, där en font-preload med `crossorigin` blockeras av CORS (origin null). Över http laddas varje typsnitt en gång (4 anrop före och efter). Rättas i grinden (servera över http eller ignorera font-CORS från origin null), inte på sidan.
- [ ] `[P3]` `index.html` hoppar vid 390 px när `app.js` startar: listan står öppen i HTML och fälls ihop när kartan tar plats (sessionsfönster 0,055 till 0,067 live, under gränsen 0,1). Att dölja listan före skriptet kräver ett inline-skript i `<head>` (ny CSP-hash) och en reserv om `app.js` aldrig laddas, annars döljs innehållet. Inte gjort.
- Inte åtgärdat, inget fel: inga `<img>` på sidorna (kartan och Datorn är canvas), 0 renderblockerande anrop, `unbounded-latin-400` används inte av någon text och hämtas inte av besökare (bara när axe kör). Filerna har inga hashar i namnet och GitHub Pages sätter `max-age=600` (HTML) och Cloudflare 14400 (övrigt); längre cache kräver hashade filnamn i webbverkstads bygge.

## Scenariojakt 2026-11-25

Skript i `%TEMP%/aifabriken-lanes/p3-ai/` (Playwright, Chromium), mot en lokal kopia serverad under `/ai/`.

- [x] `[P3]` Smal bredd: `index.html` blev 316 px bred vid 188, 250 och 300 px (200 % zoom på en telefon). De dolda `.bm-long` i benchmarks-tabellen (`position: absolute`) hamnade utanför tabellens scrollruta, diagrammet är minst 300 px, verifiera-tabellens fyra kolumner klämde verktygsnamnen till 0 px, listans faktarad och rubriken var för breda. Rättat 2026-11-25 (webbverkstad 65966cf): `position: relative` på `.bm-table-wrap`, under 316 px scrollar diagrammet och verifiera-tabellen i sig själva och namnet får en egen rad, `.facts` som flex med radbrytning, h1 minst `min(1.7rem, 8.6vw)`, `overflow-wrap: break-word` på `body`. `reflow.test.mjs` (webbverkstad, run-mappen) föll före och ger PASS efter; varje elements ruta identisk vid 390 och 1440 px före och efter; grinden PASS.
- [x] `[P3]` Storleksbyte mitt i en flygning (telefonen vrids under introts 2,8 s, eller fönstret ändras under flygningen tillbaka från en planet) landade i posen för den gamla storleken: efter 390 till 1440 px under introt ritades kartan märkbart mindre än vid en ny laddning. Rättat 2026-11-25 av en parallell session (webbverkstad 12470ac, här 2223b54); `s5-resize-entrance.mjs` från det här passet kört igen efter rättningen, se HANDOFF.
- [x] `[P3]` Efter en driftsättning körde en återkommande besökare upp till 4 timmar ny `index.html` (`max-age=600`) med gamla `app.js`, `three.js` och `sections/*` (`max-age=14400`). Provat med fyra tidigare driftsättningar (aca1c56, 6d9e865, bf0146f, b7e046e): inga skriptfel, kartan och panelen fungerar, men efter b7e046e saknade kartan Microsoft (9 planeter) tills cachen gick ut. Samma sak hos Cloudflares kant: efter driftsättningen av reflow-rättningen ovan svarade `sections/*.css` live med `cf-cache-status: HIT` och den förra versionen, så `reflow.test.mjs` föll live. Rättat 2026-11-25 (webbverkstad 8d119c1): bygget sätter `?v=<innehållshash>` på varje lokal `.js` och `.css` i `index.html`; ombyggnaden är idempotent, alla 17 adresser svarar 200 lokalt, grinden PASS, `npm test` 20 gröna, `no-three.test.mjs` matchar nu `three.js?v=`. CSP:n berörs inte (bara inline-skript har hash).
- Provat utan fel: bredd ändras med en planet öppen (1440 till 390, nästa, tillbaka, 844x390), varje avsnittsskript, `three.js`, typsnitten och CSS blockerade (inga skriptfel; utan `three.js` försvinner bara kartans etiketter, listan är sidan), engelska med en planet öppen, ut till `integritet.html` och tillbaka (sidan laddas om på svenska, som `integritet.html` säger), dold flik, och inga anrop alls efter laddningen, så en flik som står öppen över en driftsättning hämtar inget nytt. Två flikar delar inget: sidan har ingen lagring.

