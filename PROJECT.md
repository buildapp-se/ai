# AI-resurssidan — orgutveckling.se/ai

Kurerad länklista för att lära sig Claude Code. Eget repo, serveras som
GitHub Pages project site under orgutveckling.se/ai/.

## Arkitektur
- `index.html` — hela sidan (HTML + CSS + JS i en fil, design lånad från orgutveckling.se)
- `worker/` — Cloudflare Worker + KV, upvote-API på https://api.orgutveckling.se
- Checkmarks: localStorage, per besökare
- Upvotes: delas av alla, sparas i Cloudflare KV

## Deploy
- Sidan: `git push` → GitHub Pages bygger automatiskt
- Workern: `cd worker && npx wrangler deploy`

## Todo
- [x] Verifiera att /ai/ serveras korrekt efter flytt från huvudrepot
- [x] Formulär för förslag (dialog + POST /suggest, ersatte mailto)
- [x] Föreslagna-sektion; >10 röster flyttar kortet till sin kategori (klientside)
- [ ] Fler resurser
- [ ] Ev. sortera alla kort efter röster
- [ ] Röstskydd om spam blir ett problem (kräver mer än localStorage)
- [ ] Moderering av förslag: skräp raderas med `npx wrangler kv key delete --binding VOTES "sug:<url>" --remote`
