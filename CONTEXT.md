# Project context

## Product intent

En överblick över hela verktygslandskapet för att bygga med AI, plus en kurerad
länklista för att lära sig Claude Code. Sidan ska svara på frågan i vilken ordning
saker byggs, inte vara en uttömmande katalog.

## Architecture

- `index.html` innehåller hela sidan: HTML, CSS och JS i en fil, inget byggsteg.
  Serveras som GitHub Pages project site under `buildapp.se/ai/`.
- `worker/` är en Cloudflare Worker med KV som håller röst-API:t på
  `api.orgutveckling.se`.
- Checkmarks sparas i localStorage per besökare. Upvotes delas av alla och ligger i KV.
- Förslag sparas som `pending:<url>` och visas först efter godkännande. Godkända
  sparas som `sug:<url>`.
- Modereringspanelen är dold i `index.html` och öppnas med Ctrl+Alt+M eller
  `#moderera`. Admin-API:t skyddas av worker-hemligheten `MOD_TOKEN`.

## Constraints

- Ny kurerad länk måste seedas i KV, annars ger första rösten 404. Se `HANDOFF.md`.
- `data-sv` får aldrig sitta på ett element som innehåller andra element, eftersom
  språkbytet skriver `textContent` och då raderar barnen.
- Palettens fem fasfärger måste klara WCAG-kontrast. `contrast.test.js` bevakar det.

## Important decisions

- Färgerna är inte dekor. Var och en av de fem hue:arna märker ut en fas, så färgen
  säger var på vägen läsaren är.
- Engelska är grundspråk i HTML eftersom det styr Google och förhandsvisningen på
  Facebook. Svenska ligger i `data-sv`-attribut och byts av JS.
- Ryggraden animeras av en enda IntersectionObserver, ingen scroll-lyssnare. Utan JS
  syns allt innehåll ändå.

## Environments and operations

Sidan driftsätts av `git push` till `main`, GitHub Pages bygger automatiskt. Workern
driftsätts med `cd worker && npx wrangler deploy`. Admin-token sätts med
`npx wrangler secret put MOD_TOKEN`.
