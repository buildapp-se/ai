# Backlog

## Rester från flytten till buildapp.se

- [x] `og.png` omgjord 2026-08-27. Rubriken är nu sidans faktiska, "Every name, in
  the right order", och märket är kartans ryggrad. Den gamla bilden hade röstpil,
  bock och kickern "Curated · Ranked · Voted", alltså tre påståenden om funktioner
  som inte finns kvar. Renderingskommandot står i `og.source.html`.
- [ ] Byt kontaktmailen från `kontakt@orgutveckling.se` i topbar och footer när en
  ny adress finns. Footern byggs i JS längst ner i `index.html`.

## Innehåll

- [ ] Fler resurser i den kurerade listan.

## Workern som blev över

Röstning, avbockning, framstegsräknare, förslagsformulär och modereringspanel togs
bort 2026-08-27. Inget i `index.html` anropar längre `api.orgutveckling.se`.

- [ ] Bestäm om Workern och dess KV-namespace ska avvecklas. Källan ligger kvar i
  `worker/` och Workern är fortfarande **deployad**, alltså nåbar utifrån. Att ta
  bort katalogen avpublicerar den inte, det måste göras i Cloudflare.
- [ ] KV innehåller gamla röstsiffror och inskickade förslag (titel, url,
  beskrivning, kategori, tidpunkt, inga namn eller mejl). Radera dem i samma pass.

De tidigare punkterna om röstskydd, dedupe på `/vote` och Turnstile på `/suggest`
är inte längre aktuella och är borttagna.
