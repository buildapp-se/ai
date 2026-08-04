---
schemaVersion: 1
status: active
currentGoal: Hålla AI-resurssidan aktuell och åtgärda de två kvarvarande resterna från flytten till buildapp.se
nextAction: Gör om og.png, som fortfarande visar den gamla designen och den gamla rubriken så att delade länkar ser fel ut; og.source.html finns bara i grammat-repot och behöver skrivas från grunden här
blockers: []
reviewedAt: 2026-07-26
---

# Handoff: AI-resurssidan

## Läget

Sidan är live på `buildapp.se/ai/` och fungerar. Den har två delar: kartan med
elva stationer i fyra faser, som är sidans tes, och den kurerade Claude
Code-listan med röstning. Arkitektur och designresonemang står i `PROJECT.md`.

## Recent work

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
