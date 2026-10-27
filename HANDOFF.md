---
schemaVersion: 1
status: active
currentGoal: Hålla solsystemssidan på buildapp.se/ai aktuell
nextAction: Ändringar görs i webbverkstad runs/ai-solsystem och kopieras hit enligt CONTEXT.md
blockers: []
reviewedAt: 2026-10-27
---

# Handoff: AI-resurssidan

**2026-10-27, ny sida live: "Från idé till publicerad sida".** Den gamla byggordningssidan ersatt av solsystemssidan från webbverkstad `runs/ai-solsystem` (riktning `a`). Kopierat: `index.html`, `app.js`, `three.js`, ikoner, `og.png`, `og.source.html`, `integritet.html` (version 3.0, ingen lagring), `fonts/`, och de avsnittsfiler `index.html` refererar under `sections/`. `logo.png` borttagen (inget refererade den, inte heller buildapp-se.github.io eller terminal). `quiz-data.js` kvar för spelet. `contrast.test.js` omskriven: läser `:root` ur `index.html` och testar den mörka paletten i stället för den gamla ljusa. Lokalt verifierat: alla anrop 200, 0 konsolfel, kartan och Datorn-scenen ritas, integritet öppnas och länkar tillbaka, sidfotens mejl `kontakt@buildapp.se`. Gate `check.mjs` PASS. Avsnitten nedan om kartan med elva stationer, röstning och kontaktadress gäller den gamla sidan.

**2026-10-27, quizet borttaget** på Patriks begäran: `quiz.html` raderad, länkarna i toppfält och sidfot borta, `integritet.html` version 2.9 (bara `lang` och `view` kvar, ändringsstycke om de gamla quiznycklarna). `quiz-data.js` ligger kvar eftersom spelet `buildapp.se/terminal/` läser den till bossfrågan.

**2026-10-17, spelet `./terminal` flyttat** till eget repo `buildapp-se/terminal` (`C:\dev\terminal`, live på `buildapp.se/terminal/`) med historiken kvar; dess handoff och backlog ligger där. Den gamla adressen `terminal.html` är borttagen (ingen länkade till den).

**2026-10-16, `quiz.html`.** Fristående quiz på `buildapp.se/ai/quiz.html`: fyra quiz plus blandat läge, förklaring per felsvar, ordkort med 60 tekniska ord i grupper (20 per runda), svårighetsreglage, klarade ord och resultat per quiz i `localStorage` (`quiz-mastered`, `quiz-results`, båda redovisade i `integritet.html`). Egen favicon och logo. Sista commit `0ecbfdb`; live verifierat 2026-10-17 (200). Struktur i `CONTEXT.md`.

**2026-10-06, nattbatch på grenen `batch/2026-10-06` (mergad till `main` och deployad 2026-10-07 på Patriks order).** Två P3 från granskningen: font-länken tappar nu `as` när `rel` byts till `stylesheet` (html-validate `attribute-misuse` 0 på renderad DOM), och kortens 25 dekorativa pilar är `aria-hidden` efter en kontrastgenomgång av all synlig text (sv/en, kort/lista, 390 och 1280 px, 0 under gränsen). Externa länkar: 60 av 62 svarar 200, två svarar 403 på skript. Kvar för Patrik: ny kontaktadress (finns i `index.html` rad 187 och JS i botten, samt fyra ställen i `integritet.html`) och vilka resurser som ska in i listan.

**2026-09-24, tryckytor (UX-audit från aifabriken).** Filterknapparna (27 px), vy-växlaren (26 px) och SV/EN (22 px) har nu `min-height` 44 px (växlarna även `min-width`). Lokalt kvar bara två inline-länkar i sidfoten som warn (luft runt, klarar WCAG). Filterrad och sidhuvud granskade i skärmbild. axe gav först ett kontrastfel som visade sig vara en inladdningsanimation; efter att animationerna fått köra klart: 0 fel.

## Läget

Sidan är live på `buildapp.se/ai/`: solsystemskartan över AI-bolagen och avsnitten
under den. Källan är webbverkstad `runs/ai-solsystem`; arkitektur och
driftsättning står i `CONTEXT.md`, design i `directions/a/DESIGN.md` där.

## Recent work

**2026-08-27, kväll: Cloudflare Web Analytics på zonen, policy version 2.1.**

- Katalogens Cloudflare-zon injicerar nu `beacon.min.js` i all HTML under
  `buildapp.se`, alltså även här. Sidan gör därmed ett nätverksanrop till
  `static.cloudflareinsights.com` utöver Google Fonts; påståendet "noll
  nätverksanrop" nedan gäller sidans egen kod, inte zonen.
- `integritet.html` sv + en uppdaterad: ny punkt om Web Analytics, rättslig grund
  besöksstatistik, cookieavsnittet omskrivet. Inställningen styrs från
  buildapp-se-repots dashboard, inte härifrån.

**2026-08-27: sidan är nu helt statisk, plus integritetspolicy.**

- **Borttaget:** röstningen (`▲ 0 ▼`), avbockningen, framstegsräknaren,
  förslagsformuläret och den dolda modereringspanelen. De användes inte, alla
  röstetal stod på 0.
- **Fynd på vägen:** `api.orgutveckling.se/suggestions` svarar **302** och
  redirectar till Cloudflare Access. Workern ligger bakom Access, så förslagen
  kunde inte laddas för vanliga besökare ändå. Det felet fanns före den här
  ändringen.
- Sidan gör nu **noll nätverksanrop** utöver Google Fonts. `localStorage` har bara
  `lang` och `view` kvar. Verifierat i webbläsare: 25 kort, 0 röstgrupper, 0
  kryssrutor, 0 dialoger, filter och listvy intakta, inga konsolfel.
- Den automatiska befordran av förslag vid fler än 10 röster föll med röstningen.
  Godkända förslag måste flyttas in i listan för hand.
- Ny `integritet.html` i sidans kortdesign, svenska och engelska med samma
  `lang`-nyckel som listsidan. Version 2.0 säger uttryckligen att röstningen och
  förslagen togs bort, eftersom 1.0 beskrev behandling som inte längre finns.
- Sidfotslänk tillagd i `index.html`.
- `contrast.test.js` grönt.
- **`og.png` omgjord i samma pass.** Den visade röstpil, bock och kickern
  "Curated · Ranked · Voted", vilket blev falskt när funktionerna togs bort.
  Nu sidans faktiska rubrik och kartans ryggrad som märke.

**2026-09-16: workern avvecklad.** `orgutveckling-votes` och KV `VOTES`
raderade i Cloudflare, `worker/` borttagen. Ikonerna flyttade till repot
(hotlink från orgutveckling.se motsade policyns "enda tredjeparten").
Policyn 2.2 säger båda sakerna i ändringsstycket.



**2026-08-27: integritetspolicy, sidan saknade informationsplikt.**

- Ny `integritet.html` i sidans egen kort- och kartdesign. Beskriver rösterna
  (bara en siffra i KV, inget om vem som röstat), inskickade förslag (titel, url,
  beskrivning, kategori, tidpunkt, inga namn eller mejl), `localStorage`-nycklarna
  och att Google Fonts får besökarens IP.
- Sidfotslänk tillagd i `index.html`.
- Ingen cookiebanner: `localStorage` här är nödvändigt för funktioner besökaren
  själv begär, och då triggas inte samtyckeskravet i lagen om elektronisk
  kommunikation. GDPR:s informationsplikt gäller ändå, och det är den policyn
  fyller.


- Kartan byggd: elva stationer i fyra faser plus ett band för säkerhet och juridik,
  med egen palett och typografi.
- Röstning med nettopoäng, sortering efter röster och en modererad förslagskö med
  dold adminpanel.
- Avsändaren Centrum för Organisations-Utveckling borttagen ur topbar, footer och
  JSON-LD efter flytten till buildapp.se.
- Säkerhetsfix 2026-07-25: `POST /vote` tog emot vilken http-sträng som helst som
  `id` och skrev den som ny KV-nyckel. Nu gäller en allowlist och okänd URL ger 404.

## Verification

- `node contrast.test.js` läser färgtokens ur `:root` i `index.html` och kräver
  4,5:1 för text- och signalfärger, 3:1 för benchmarkfärgerna, mot `--space`
  och `--sheet`. Kör den efter varje ny kopiering från webbverkstad.
- `node C:/dev/webbverkstad/gates/check.mjs C:/dev/ai/index.html` ska ge PASS.

## Resume here

Ny sida live 2026-10-27. Nästa ändring görs i webbverkstad och kopieras hit.

## Granskning 2026-09-16

Cross-project audit run from elwyn-dash (session 5 in the daily note). Results written to `## Audits` in CONTEXT.md, findings appended to BACKLOG.md under `## Granskning 2026-09-16`. Headers on buildapp.se and the TLS grade are zone-level and are fixed once in Cloudflare, not here.

## Automated audit batch, 2026-10-06

Cross-project run from elwyn-dash with aifabriken `tools/audit-suite.ts` (headers, npm audit, secrets, Actions, markup, axe at one mobile viewport; TLS and Lighthouse not run). Results are the `(automated)` lines under `## Audits` in CONTEXT.md, findings under `## Granskning 2026-10-06` in BACKLOG.md. Markup fail on one rendered `<link as>`; axe 0 violations with 135 contrast nodes left for manual review. Headers fail is the shared buildapp.se CSP without `script-src` (zone Transform Rule, owned by elwyn-dash `docs/security.md` §Open 11), not something this repository can fix. No application code or deployment changed. `reviewedAt` was left alone: the goal and next action above were not reviewed.
