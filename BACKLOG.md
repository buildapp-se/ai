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
- P2 OWASP 2026-10-30 (Mistral Large, kontrollerat live av Claude): `Content-Security-Policy` på buildapp.se har ingen `script-src` (bara frame-ancestors, base-uri, object-src), och `index.html` och `integritet.html` har inline-skript. Antingen meta-CSP med hashar per sida eller `script-src` i zonens Transform Rule, som delas med alla sajter under buildapp.se.
