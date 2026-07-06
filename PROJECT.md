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
- [ ] Verifiera att /ai/ serveras korrekt efter flytt från huvudrepot
- [ ] Fler resurser (föreslå via mailto-knappen)
- [ ] Ev. formulär istället för mailto (Formspree) om förslag börjar komma
- [ ] Ev. sortera kort efter röster
- [ ] Röstskydd om spam blir ett problem (kräver mer än localStorage)
