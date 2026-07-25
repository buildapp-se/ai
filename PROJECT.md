# AI-resurssidan — orgutveckling.se/ai

Kurerad länklista för att lära sig Claude Code. Eget repo, serveras som
GitHub Pages project site under orgutveckling.se/ai/.

## Arkitektur
- `index.html` — hela sidan (HTML + CSS + JS i en fil, design lånad från orgutveckling.se)
- `worker/` — Cloudflare Worker + KV, upvote-API på https://api.orgutveckling.se
- Checkmarks: localStorage, per besökare
- Upvotes: delas av alla, sparas i Cloudflare KV
- Förslag: nya förslag sparas som `pending:<url>` i KV och visas först efter
  godkännande. Godkända förslag sparas som `sug:<url>`.
- Moderering: dold panel i `index.html`, öppnas med Ctrl+Alt+M eller `#moderera`.
  Admin-API skyddas med Worker-hemligheten `MOD_TOKEN`.

## Språk
Engelska är grundspråk i HTML (styr Google + FB-förhandsvisning).
Svenska ligger i `data-sv`-attribut på varje översatt element; JS byter vid
svensk webbläsare eller manuellt val (SV/EN-knapp, sparas i localStorage).
Ny länk = skriv engelsk text + `data-sv="svensk text"` på title/sub/area.
**Ny länk måste också seedas i KV**, annars går den inte att rösta på (se Deploy).

## Deploy
- Sidan: `git push` → GitHub Pages bygger automatiskt
- Workern: `cd worker && npx wrangler deploy`
- Admin-token: `cd worker && npx wrangler secret put MOD_TOKEN`
- **Efter ny kurerad länk: `cd worker && node seed-curated.js --write`.**
  `/vote` har en allowlist (bara nycklar som redan finns i KV eller är godkända
  förslag tas emot), så en oseedad länk får 404 på sin första röst. Skriptet är
  idempotent och rör aldrig befintliga röstsiffror, kör utan flagga för torrkörning.
- Senaste worker-deploy: 2026-07-25, version `5562810d-c77c-4ffd-93e3-be26bbc7f5ff`

## Todo

> Tvärprojekt-prio: se `../master-backlog.md`, uppdatera båda vid ändring.
- [x] Verifiera att /ai/ serveras korrekt efter flytt från huvudrepot
- [x] Formulär för förslag (dialog + POST /suggest, ersatte mailto)
- [x] Föreslagna-sektion; >10 röster flyttar kortet till sin kategori (klientside)
- [x] Sortera kort efter röster (per sektion, vid sidladdning)
- [x] Downvotes (netto-poäng, kan bli negativ, dåliga tips sjunker)
- [x] Moderering av förslag: pending-kö + dold adminpanel + approve/reject
- [ ] Fler resurser
- [ ] Röstskydd om spam blir ett problem (kräver mer än localStorage)
- [ ] Om spam ökar: lägg till Cloudflare Turnstile eller rate limiting på `/suggest`
