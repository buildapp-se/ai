# Project context

## Product intent

En överblick över hela verktygslandskapet för att bygga med AI, plus en kurerad
länklista för att lära sig Claude Code. Sidan ska svara på frågan i vilken ordning
saker byggs, inte vara en uttömmande katalog.

## Architecture

- `index.html` innehåller hela sidan: HTML, CSS och JS i en fil, inget byggsteg.
  Serveras som GitHub Pages project site under `buildapp.se/ai/`.
- **Sidan är helt statisk sedan 2026-08-27.** Ingen backend, inga nätverksanrop
  utom Google Fonts. `localStorage` används bara till `lang` och `view`.
  Ikonerna (`logo.png`, `favicon.svg`) ligger i repot sedan 2026-09-16; fram
  till dess hotlinkades de från orgutveckling.se, vilket motsade policyn.
- Workern `orgutveckling-votes` (röstning, förslag, moderering, borttagna ur
  sidan 2026-08-27) **avvecklades 2026-09-16**: skriptet och KV-namnrymden
  `VOTES` raderade i Cloudflare, `worker/` borttagen ur repot. KV innehöll 25
  röstsiffror per länk och ett testförslag, inga personuppgifter.

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
