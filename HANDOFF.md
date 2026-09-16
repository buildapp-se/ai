---
schemaVersion: 1
status: active
currentGoal: Hålla AI-resurssidan aktuell och åtgärda de två kvarvarande resterna från flytten till buildapp.se
nextAction: Verifiera på buildapp.se/ai/ att ikonerna laddar lokalt och att policyn visar version 2.2. Därefter fler resurser i listan enligt BACKLOG.md
blockers: []
reviewedAt: 2026-09-16
---

# Handoff: AI-resurssidan

## Läget

Sidan är live på `buildapp.se/ai/` och fungerar. Den har två delar: kartan med
elva stationer i fyra faser, som är sidans tes, och den kurerade Claude
Code-listan med röstning. Arkitektur och designresonemang står i `PROJECT.md`.

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

- `node contrast.test.js` kontrollerar att palettens fem fasfärger klarar
  WCAG-kontrast mot bottnen. Kör den innan en färg ändras.

## Unresolved details

- `og.png` visar gammal design och gammal rubrik.
- Kontaktmailen är fortfarande `kontakt@orgutveckling.se` i topbar och footer.
  Footern byggs i JS längst ner i `index.html`.
- `/vote` saknar dedupe. Allowlisten stoppar nya skräpnycklar men inte upprepade
  röster på en känd länk. Medvetet val; Turnstile är nästa steg om det blir ett
  problem i praktiken.
- Ingen ratelimit på `/suggest`. Cloudflares egna regler täcker det utan kod.

## Resume here

Börja med `og.png`. Den påverkar hur varje delad länk ser ut i Messenger, Facebook
och Slack, och är den enda kvarvarande punkten som syns utåt.

## Granskning 2026-09-16

Cross-project audit run from elwyn-dash (session 5 in the daily note). Results written to `## Audits` in CONTEXT.md, findings appended to BACKLOG.md under `## Granskning 2026-09-16`. Headers on buildapp.se and the TLS grade are zone-level and are fixed once in Cloudflare, not here.
