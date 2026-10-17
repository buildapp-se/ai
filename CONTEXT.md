# Project context

## Product intent

En överblick över hela verktygslandskapet för att bygga med AI, plus en kurerad
länklista för att lära sig Claude Code. Sidan ska svara på frågan i vilken ordning
saker byggs, inte vara en uttömmande katalog.

## Architecture

- `index.html` innehåller hela sidan: HTML, CSS och JS i en fil, inget byggsteg.
  Serveras som GitHub Pages project site under `buildapp.se/ai/`.
- **Sidan är helt statisk sedan 2026-08-27.** Ingen backend, inga nätverksanrop
  utom Google Fonts. `localStorage` används bara till `lang`, `view`,
  quizets `quiz-mastered` och `quiz-results` (senaste och bästa resultat per
  quiz) och spelets `term-highscores`, `term-sound` och `term-shell`. En ny nyckel kräver att `integritet.html` uppdateras.
  Ikonerna (`logo.png`, `favicon.svg`) ligger i repot sedan 2026-09-16; fram
  till dess hotlinkades de från orgutveckling.se, vilket motsade policyn. Sedan
  2026-10-16 är de sidans egna: terminalprompt `>_` på violett `--p1`.
  `logo.png` (512 px) är renderad från `favicon.svg`; ändras den ena, rendera om
  den andra.
- Workern `orgutveckling-votes` (röstning, förslag, moderering, borttagna ur
  sidan 2026-08-27) **avvecklades 2026-09-16**: skriptet och KV-namnrymden
  `VOTES` raderade i Cloudflare, `worker/` borttagen ur repot. KV innehöll 25
  röstsiffror per länk och ett testförslag, inga personuppgifter.

- `quiz.html` (sedan 2026-10-16) är ett fristående quiz, också en enda fil utan
  byggsteg, bara svenska. Allt innehåll ligger som data i `QUIZZES`: flerval
  (`q`), para ihop (`pairs`) och ordkort (`groups`, felsvar läggs sist i högen som
  i Quizlet). Ordkorten ligger i grupper av närliggande ord och felalternativen
  tas ur samma grupp, så att man inte kan utesluta sig fram; två betydelser i en
  grupp får därför aldrig båda stämma. Svår nivå ligger i `hardGroups`, samma
  grupper i samma ordning; reglaget i menyn väljer Lätt, Blandat eller Svår, och
  felalternativen tas alltid ur ordets egen nivå. Nivån sparas inte (det skulle
  kräva en ny `localStorage`-nyckel). 20 ord per runda, okända först; ord rätt på första
  försöket sparas i `quiz-mastered`, ett felsvar tar bort ordet igen. Ännu inte
  länkad från `index.html`, se `BACKLOG.md`.

- `terminal.html` (sedan 2026-10-17) är spelet `./terminal`: uppgifter faller som
  tetrisblock i en kopia av VS Code:s terminal, spelaren skriver kommandot. En fil
  utan byggsteg, bara svenska. Uppgifterna ligger som data i `TASKS`
  (`[paket, svårighet 1–5, uppgift, svar, förklaring, PowerShell-svar, PowerShell-förklaring]`,
  paketen `fs`, `git`, `cc`; PowerShell-svaret `'='` betyder samma som bash, saknas det
  visas uppgiften bara i bash),
  med mallord som `{d}` och `{f2}` ur `POOLS`. Ett svar kan vara en lista med
  varianter, en kedja (lista av listor, ett steg per kommando) och innehålla jokern
  `{any}`. Rättningen normaliserar i stället för att jämföra strängar: flaggordning,
  ihopslagna flaggor (`-rn`), citattecken, `./` och avslutande `/` spelar ingen roll,
  men ordet i ett argument måste stämma. `&&`, `;` och flera argument till
  `mkdir`/`touch`/`rm` rensar flera block (kombo). Den rena logiken står mellan
  `pure:start` och `pure:end` och testas av `terminal.test.js` (`node terminal.test.js`),
  som också kräver en förklaring i `GLOSS` för varje del av varje svar (hjälpkortet).
  Skalet väljs vid första besöket (förval PowerShell på Windows), byts med `s` i menyn,
  under inställningar (kugghjulet eller Ctrl+,) och låses när rundan startar (`S.ps`).
  PowerShell rättas med alias (`PSALIAS`), skiftlägesokänsligt, förkortade och
  positionella parametrar (`PSPARAMS`, `PSPOS`) och ger PowerShells egna felmeddelanden.
  Testet
  som också kör varje svar i `TASKS` mot sig självt. Ljudet ligger i
  `terminal-ljud.js`; `?ljud=gemini` laddar `terminal-ljud-gemini.js` i stället, samma
  gränssnitt, för att jämföra de två. Ännu inte länkat från `index.html`.

## Constraints

- `data-sv` får aldrig sitta på ett element som innehåller andra element, eftersom
  språkbytet skriver `textContent` och då raderar barnen.
- Palettens fem fasfärger måste klara WCAG-kontrast. `contrast.test.js` bevakar det.

## Sidans två delar

1. **Kartan** (`.map`) är sidans tes: byggordningen som en ryggrad, elva stationer
   i fyra faser plus ett band för säkerhet och juridik som gäller hela vägen.
2. **Fördjupningen** (`.deep`) är den kurerade Claude Code-listan. Ordningen är
   handplockad och ändras bara genom att redigera `index.html`.

## Design

Paletten är lånad från syntaxfärgning i en kodeditor. `--p1` violett för före du
börjar, `--p2` grön för vad som byggs, `--p3` bärnsten för ut på nätet, `--p4` blå
för när appen växer, `--p5` röd för säkerhet och juridik.

Typsnitt: Bricolage Grotesque för display, Public Sans för brödtext, JetBrains Mono
för nummer, etiketter och siffror.

Ryggraden är två linjer ovanpå varandra per station. `::before` prickad är vägen
kvar, `::after` fylld i fasfärgen är `transform:scaleY(0)` som skalas till 1 när
klassen `.lit` sätts.

## Important decisions

- Färgerna är inte dekor. Var och en av de fem hue:arna märker ut en fas, så färgen
  säger var på vägen läsaren är.
- Engelska är grundspråk i HTML eftersom det styr Google och förhandsvisningen på
  Facebook. Svenska ligger i `data-sv`-attribut och byts av JS.
- Ryggraden animeras av en enda IntersectionObserver, ingen scroll-lyssnare. Utan JS
  syns allt innehåll ändå.

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
- Headers (automated): 2026-10-06, fail, 1 targets; 1 failed, 0 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- npm audit (automated): 2026-10-06, n/a, No package.json in repository; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- Secrets (automated): 2026-10-06, pass, 2 targets; 0 failed, 0 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- Actions (automated): 2026-10-06, n/a, no GitHub Actions workflows; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a/ai.json
- Markup (automated): 2026-10-06, fail, 1 targets; 1 failed, 0 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a2/ai.json
- WCAG 2.2 AA (automated): 2026-10-06, blocked, 1 targets; 0 failed, 1 blocked; evidence C:/dev/aifabriken/.runs/audits/2026-10-06-batch-a2/ai.json
