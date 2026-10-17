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

## Quiz (`quiz.html`)

- [ ] `resultText()` i `quiz.html`: rubrik och text på resultatsidan efter poäng (Patrik skriver).
- [ ] Länka quizet från `index.html` (topbar eller footer) när det är klart att visas.
- [x] Pedagogisk förklaring per felval i flervalsfrågorna (`notes`). Gjort 2026-10-16.
- [x] Terminalkommandonas namn (`cd` = change directory) visas efter varje omgång. Gjort 2026-10-16.
- [ ] Programspråk och backend: para ihop-delarna saknar förklaring efter omgången. Förkortningar som HTML, CSS, SQL, API, CDN och VPS kan få samma namnlista som kommandona (tredje fältet i paret).
- [ ] Illustrationer till frågorna (till exempel hur en token delar upp ett ord, eller hur frontend, API och databas hänger ihop).
- [ ] Engelsk version, som resten av sidan (`data-sv`-mönstret).

## Spelet (`terminal.html`)

- [ ] Patrik spelar och lyssnar: välj ljud bland `terminal-ljud.js`, `?ljud=gemini` och `?ljud=mp3` (bara lokalt, spåren i `_musik/`), radera det som väljs bort.
- [ ] Om mp3 vinner: kolla Lyrias användningsvillkor, ta in `_musik/` i git och kolla att looparna inte hackar i skarven.
- [ ] Länka spelet från `index.html` och quizet när det är klart att visas.
- [ ] Bygg om paketet Som Claude Code från loggdatan (2026-10-17: grep, head, git, curl, uv, ls, tail, node i topp; PowerShell mest för att döda dev-servrar).
- [ ] Paket Terminalvett: hjälp (Get-Help, Get-Command), installera (winget, npm, uv, npx/uvx), processer och portar, miljö (PATH, `$?`), nätverk (ipconfig, ping, Resolve-DnsName, Test-NetConnection), ssh-keygen, zip. Hjälpkortet får raden "begreppet bakom".
- [ ] Paket Cloudflare (wrangler login/dev/deploy/tail/secret put, d1 execute --remote, rollback) och Firebase (login, use, deploy --only hosting, emulators:start).
- [ ] VS Code-ramen gör saker: README.md-flik med instruktioner, menyerna, PROBLEMS med dina fel, OUTPUT med topplistan, kommandopaletten, tooltips. Plus påskäggen (DEBUG CONSOLE-fusk, vim, sl, sudo, Konami, cat .env med flera).
- [ ] Programspråk som egna paket (Python-REPL, JS-konsol, SQL).
- [ ] Delad topplista mellan vänner. Kräver backend och ny integritetstext; bara om ni faktiskt tävlar.

## Granskning 2026-10-06

Fynd från den automatiska sviten (aifabriken `tools/audit-suite.ts`: headers, npm audit, secrets, Actions, markup, axe). Mätvärdena står som `(automated)`-rader under `## Audits` i CONTEXT.md.

- [x] `[P3]` Markup: en `<link>` i `<head>` behåller `as`-attributet efter att `rel` bytts från `preload` till `stylesheet` (html-validate `attribute-misuse`, renderad DOM, `head > link:nth-child(21)`). Ofarligt, men ger fail i kolumnen: ta bort `as` i onload-bytet. Gjort 2026-10-06 (1b1cfa9): renderad DOM har `rel=stylesheet` utan `as`, html-validate `attribute-misuse` 0. Grenen `batch/2026-10-06` mergad till `main` och deployad 2026-10-07 på Patriks order.
- [x] `[P3]` WCAG: axe hittar 0 fel men kan inte avgöra kontrasten på 135 element. Manuell kontrastkontroll återstår. De 61 externa länkarna kontrolleras inte av sviten.
  Gjort 2026-10-06: beräknad kontrast för all synlig text (274 till 325 element per läge) i sv/en, kort/lista, 390 och 1280 px, efter att animationerna kört klart. Enda fyndet var kortens pil `→` (1,29:1), ren dekor, nu `aria-hidden`. Inte täckt: hover- och fokuslägen, tangentbordsgenomgång. Externa länkar: 62 unika, 60 svarar 200, `claude.ai` och `openai.com/codex` svarar 403 på skript (botskydd, inte trasiga).
