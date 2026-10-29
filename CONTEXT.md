# Project context

## Product intent

"Från idé till publicerad sida": en karta över AI-bolagen och deras modeller som
ett solsystem utan sol, och under den avsnitt som tar läsaren från första idé
till en sida på nätet (kom igång, GitHub, andra verktyg, datorns delar, grilla
AI:n, verifiera, koll före publicering, benchmarks, lär dig mer).

## Architecture

- **Sidan byggs i webbverkstad, inte här.** Källan är
  `C:\dev\webbverkstad\runs\ai-solsystem` (riktning `a`, byggs med
  `node runs/ai-solsystem/build.mjs a`). Det här repot innehåller bara den
  byggda sidan. Ändra i webbverkstad, bygg, och driftsätt genom att kopiera
  runtime-filerna från `runs/ai-solsystem/directions/a/` hit:
  `index.html`, `app.js`, `three.js`, `favicon.svg`, `icon-32.png`,
  `apple-touch-icon.png`, `og.png`, `og.source.html`, `integritet.html`,
  `fonts/*.woff2`, och ur `sections/` bara det `index.html` refererar:
  `{andra,benchmarks,datorn,github,grilla,koll,lar,start,verifiera}.css` och
  `{benchmarks,datorn,grilla,start}.js`. Inga avsnittskällor (`*.html`,
  `*.src.js`), tester, förhandsvisningar eller skärmbilder.
  Kontrollera listan mot `grep -oE '(src|href)="[^"#:]+"' index.html integritet.html`
  och `url(` i CSS innan kopiering.
- Serveras som GitHub Pages project site under `buildapp.se/ai/`. Statisk, ingen
  backend. Typsnitten ligger i `fonts/` (inga anrop till Google Fonts).
  Kartan och Datorn-scenen ritas med three.js (WebGL).
- **`localStorage`: ingen.** Sidan sätter inga kakor och sparar ingenting i
  webbläsaren (integritet.html version 3.0). En ny nyckel kräver att
  `integritet.html` uppdateras i webbverkstad. Spelet `./terminal` sparar sina
  `term-*`-nycklar på samma ursprung men redovisar dem i sin egen
  `buildapp.se/terminal/integritet.html`.
- `quiz-data.js` (`QUIZZES`) ligger kvar bara för att spelet `buildapp.se/terminal/`
  läser `/ai/quiz-data.js` till sin bossfråga. Den är inte del av sidan; ändra
  eller ta bort den bara tillsammans med spelet.

## Historik

- Den förra sidan (en fil `index.html` med byggordningskarta i elva stationer och
  en kurerad Claude Code-lista, ljus palett `--p1`..`--p5`) ersattes 2026-10-27 av
  solsystemssidan. `logo.png` föll då bort (inget refererade den längre).
- Quizet `quiz.html` (2026-10-16) togs bort 2026-10-27 på Patriks begäran.
- Workern `orgutveckling-votes` (röstning, förslag) avvecklades 2026-09-16:
  skriptet och KV-namnrymden `VOTES` raderade i Cloudflare, `worker/` borttagen
  ur repot (en lokal, ospårad `worker/.wrangler/` kan finnas kvar på disk).
- Spelet `./terminal` flyttade 2026-10-17 till eget repo `buildapp-se/terminal`
  (`C:\dev\terminal`), live på `buildapp.se/terminal/`.

## Constraints

- Färgtokens i `:root` i `index.html` måste klara WCAG-kontrast mot den mörka
  botten. `node contrast.test.js` läser tokens ur `index.html` och kräver 4,5:1
  för text- och signalfärger och 3:1 för benchmarkfärgerna, mot `--space` och
  `--sheet`.

## Design

Design, färgroller, typsnitt (Unbounded, Familjen Grotesk) och layout står i
`runs/ai-solsystem/directions/a/DESIGN.md` i webbverkstad. Den är källan; här
upprepas den inte.

## Environments and operations

Sidan driftsätts av `git push` till `main`, GitHub Pages bygger automatiskt.
Ingen backend finns att driftsätta.

## Audits
Read by the cockpit Audits tab. One `- Label: YYYY-MM-DD, result` per check; conventions in elwyn-dash `docs/security.md`.

- OWASP Top 10: 2026-07-25, open /vote write primitive fixed with allowlist
- Headers: 2026-09-16, pass, 6 of 6 on buildapp.se via a host-scoped Transform Rule on the zone, measured after the change
- Search Console: 2026-09-16, warn, in the buildapp.se sitemap (9 URLs accepted, 0 errors), per-URL indexing not read
- TLS: 2026-09-16, pass, SSL Labs A+ on buildapp.se, TLS 1.2 minimum and HSTS since today
- Lighthouse: 2026-09-16, pass, a11y 100, best practices 100, SEO 100 (mobile, no perf)
- Markup: 2026-09-16, pass, W3C 0 errors, 0 broken links
- npm audit: 2026-09-24, n/a, no package.json
- Secrets: 2026-09-24, pass, gitleaks 0 findings in 37 commits
- Actions: 2026-09-24, n/a, no GitHub Actions workflows
- WCAG 2.2 AA: 2026-09-24, warn, axe 4.13.0 0 violations on buildapp.se/ai (mobile, one page, after load animations); manual keyboard pass not done
- UX: 2026-09-24, warn, 5 of 6 script checks pass on buildapp.se/ai (no --interact), live after the tap-target fix 85818af; left: two spaced footer links at 15 px (pass WCAG); screenshot review not done
- Headers (automated): 2026-10-27, pass, 6 of 6 on buildapp.se/ai, Observatory B+ on buildapp.se
- npm audit (automated): 2026-10-06, n/a, No package.json in repository; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- Secrets (automated): 2026-10-06, pass, 2 targets; 0 failed, 0 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- Actions (automated): 2026-10-06, n/a, no GitHub Actions workflows; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- Markup (automated): 2026-10-27, blocked, 1 targets; 0 failed, 1 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-27-markup-w/ai.json
- WCAG 2.2 AA (automated): 2026-10-06, blocked, 1 targets; 0 failed, 1 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a2/ai.json
- OG image: 2026-10-27, pass, 1200x630 PNG, https://buildapp.se/ai/og.png (new page)
- Database: 2026-10-27, none, no storage (no cookies, no localStorage since the new page)
- ZAP baseline: 2026-10-27, n/a, static site on GitHub Pages with no server, cookies or forms; headers, TLS and markup are covered by their own columns, so a passive ZAP scan would repeat them
- Dependabot: 2026-10-29, pass, 0 open alerts
