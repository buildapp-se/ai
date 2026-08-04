# Backlog

## Rester från flytten till buildapp.se

- [ ] Gör om `og.png`. Den visar gammal design och gammal rubrik, så delade länkar
  ser fel ut. `og.source.html` finns bara i grammat-repot och behöver skrivas här.
- [ ] Byt kontaktmailen från `kontakt@orgutveckling.se` i topbar och footer när en
  ny adress finns. Footern byggs i JS längst ner i `index.html`.

## Innehåll

- [ ] Fler resurser i den kurerade listan.

## Om spam blir ett problem

- [ ] Röstskydd som håller för mer än localStorage.
- [ ] Dedupe på `/vote`. Allowlisten stoppar nya skräpnycklar men inte upprepade
  röster på en känd länk.
- [ ] Cloudflare Turnstile eller rate limiting på `/suggest`.
