---
schemaVersion: 1
status: active
currentGoal: Hålla AI-resurssidan aktuell och åtgärda de två kvarvarande resterna från flytten till buildapp.se
nextAction: Rendera om og.png ur og.source.html, rubriken far inte langre namna omrostning. Besluta darefter om Cloudflare-workern och dess KV-data ska avvecklas, se BACKLOG.md
blockers: []
reviewedAt: 2026-08-27
---

# Handoff: AI-resurssidan

## Läget

Sidan är live på `buildapp.se/ai/` och fungerar. Den har två delar: kartan med
elva stationer i fyra faser, som är sidans tes, och den kurerade Claude
Code-listan med röstning. Arkitektur och designresonemang står i `PROJECT.md`.

## Recent work

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

**Workern är kvar och fortfarande deployad.** Se `BACKLOG.md`, den behöver ett
medvetet beslut om avveckling.



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

- `node contrast.test.js` kontrollerar att palettens fem fasfärger klarar
  WCAG-kontrast mot bottnen. Kör den innan en färg ändras.
- Worker-deploy senast 2026-07-25, version `5562810d-c77c-4ffd-93e3-be26bbc7f5ff`.

## Unresolved details

- `og.png` visar gammal design och gammal rubrik.
- Kontaktmailen är fortfarande `kontakt@orgutveckling.se` i topbar och footer.
  Footern byggs i JS längst ner i `index.html`.
- `/vote` saknar dedupe. Allowlisten stoppar nya skräpnycklar men inte upprepade
  röster på en känd länk. Medvetet val; Turnstile är nästa steg om det blir ett
  problem i praktiken.
- Ingen ratelimit på `/suggest`. Cloudflares egna regler täcker det utan kod.

## Underhållsfälla

⚠️ En ny kurerad länk i `index.html` **måste seedas i KV**, annars får den 404 på
sin första röst eftersom `/vote` har en allowlist. Kör:

```
cd worker && node seed-curated.js --write
```

Skriptet är idempotent och rör aldrig befintliga röstsiffror. Kör utan flagga för
torrkörning.

## Resume here

Börja med `og.png`. Den påverkar hur varje delad länk ser ut i Messenger, Facebook
och Slack, och är den enda kvarvarande punkten som syns utåt.
