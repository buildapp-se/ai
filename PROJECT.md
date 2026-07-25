# AI-resurssidan — buildapp.se/ai

Överblick över hela verktygslandskapet för att bygga med AI, plus en kurerad
länklista för att lära sig Claude Code. Eget repo, serveras som GitHub Pages
project site under buildapp.se/ai/.

Sidan har två delar:
1. **Kartan** (`.map`) — byggordningen som en ryggrad: 11 stationer i 4 faser,
   plus ett band för säkerhet & juridik som gäller hela vägen. Sidans tes.
2. **Fördjupningen** (`.deep`) — den kurerade Claude Code-listan med röstning.

## Arkitektur
- `index.html` — hela sidan (HTML + CSS + JS i en fil)
- `contrast.test.js` — kontrollerar att palettens fem fasfärger klarar
  WCAG-kontrast mot bottnen. Kör `node contrast.test.js` innan du ändrar en färg.
- `worker/` — Cloudflare Worker + KV, upvote-API på https://api.orgutveckling.se
- Checkmarks: localStorage, per besökare
- Upvotes: delas av alla, sparas i Cloudflare KV
- Förslag: nya förslag sparas som `pending:<url>` i KV och visas först efter
  godkännande. Godkända förslag sparas som `sug:<url>`.
- Moderering: dold panel i `index.html`, öppnas med Ctrl+Alt+M eller `#moderera`.
  Admin-API skyddas med Worker-hemligheten `MOD_TOKEN`.

## Design
Palett lånad från syntaxfärgning i en kodeditor. De fem hue:arna är inte dekor:
var och en märker ut en fas, så färgen säger var på vägen läsaren är.
`--p1` violett (före du börjar), `--p2` grön (vad som byggs), `--p3` bärnsten
(ut på nätet), `--p4` blå (när appen växer), `--p5` röd (säkerhet & juridik).
Typsnitt: Bricolage Grotesque (display), Public Sans (brödtext), JetBrains Mono
(nummer, etiketter, siffror).

Ryggraden är två linjer ovanpå varandra per station: `::before` prickad = vägen
kvar, `::after` fylld i fasfärgen = `transform:scaleY(0)` som skalas till 1 när
klassen `.lit` sätts. En enda IntersectionObserver sätter `.lit`, uppdaterar
`.map[data-p]` (vilket byter accentfärg på den kvarstående rubriken) och skriver
fasnamnet i `#mapHere`. Ingen scroll-lyssnare. Utan JS syns allt innehåll ändå.

## Språk
Engelska är grundspråk i HTML (styr Google + FB-förhandsvisning).
Svenska ligger i `data-sv`-attribut på varje översatt element; JS byter vid
svensk webbläsare eller manuellt val (SV/EN-knapp, sparas i localStorage).
Ny länk = skriv engelsk text + `data-sv="svensk text"` på title/sub/area.
**Ny länk måste också seedas i KV**, annars går den inte att rösta på (se Deploy).

`data-sv` får aldrig sitta på ett element som innehåller andra element, eftersom
språkbytet skriver `textContent` och då raderar barnen. Därför har t.ex.
`.tool-when` attributet på sin `<b>` och sin `<span>` var för sig, inte på `<p>`.
Kartans verktygskort ligger utanför röstningen och behöver ingen KV-seed.

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
- [x] Bort med COU-avsändaren (topbar + footer + JSON-LD) efter flytt till buildapp.se
- [x] Kartan: 11 stationer i 4 faser + säkerhetsband, egen palett och typografi
- [ ] **`og.png` visar gamla designen och gamla rubriken.** Delade länkar ser fel
      ut tills den görs om. `og.source.html` finns inte i det här repot (bara i
      `recept/`), så den behöver skrivas från grunden.
- [ ] Kontaktmailen är fortfarande `kontakt@orgutveckling.se` i topbar och footer
      (footern bygger den i JS längst ner i `index.html`). Byt när ny adress finns.
- [ ] Fler resurser
- [ ] Röstskydd om spam blir ett problem (kräver mer än localStorage)
- [ ] Om spam ökar: lägg till Cloudflare Turnstile eller rate limiting på `/suggest`
