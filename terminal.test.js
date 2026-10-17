// Rättningen i terminal.html. Kör: node terminal.test.js
// Läser den rena logiken mellan pure:start och pure:end ur sidan.
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync(__dirname + '/terminal.html', 'utf8');
const src = html.slice(html.indexOf('/* pure:start'), html.indexOf('/* pure:end */'));
const {TASKS, POOLS, tokenize, segments, units, canon, same, fill, parts, fake, WORLD} =
  new Function(src + '; return {TASKS, POOLS, tokenize, segments, units, canon, same, fill, parts, fake, WORLD};')();

const key = s => canon(tokenize(s));
const eq = (a, b) => assert.ok(same(key(a), key(b)), `${a}  borde godkännas som  ${b}`);
const ne = (a, b) => assert.ok(!same(key(a), key(b)), `${a}  borde INTE godkännas som  ${b}`);

// Snäll rättning: flaggordning, ihopslagna flaggor, citattecken, ./ och avslutande /
eq('grep -nr TODO .', 'grep -rn TODO .');
eq('grep -r -n TODO .', 'grep -rn TODO .');
eq('git commit -am "fixa menyn"', "git commit -a -m 'fixa menyn'");
eq('git commit -m "fixa menyn" -a', 'git commit -am "fixa menyn"');
eq('mkdir ./musik/', 'mkdir musik');
eq('mv notes.txt docs/', 'mv notes.txt docs');
eq('gh repo create tradgard --push --source . --public', 'gh repo create tradgard --public --source=. --push');
eq('rm -fr demo', 'rm -rf demo');
eq('find . -name *.js', 'find . -name "*.js"');
eq(`curl -d "{\\"namn\\":\\"test\\"}" -H 'Content-Type: application/json' -X POST https://api.example.com/items`,
  `curl -X POST -H "Content-Type: application/json" -d '{"namn":"test"}' https://api.example.com/items`);
eq('echo hej>notes.txt', 'echo hej > notes.txt');

// Men inte för snäll
ne('git commit -m fixa menyn', 'git commit -m "fixa menyn"');
ne('mkdir bilder', 'mkdir musik');
ne('mv a b', 'mv b a');
ne('rm -r demo', 'rm demo');
ne('ls -l', 'ls -a');

// Jokern {any} för fria commit-meddelanden
assert.ok(same(key('git commit -m "vad som helst"'), key('git commit -m {any}')));
assert.ok(!same(key('git commit "vad som helst"'), key('git commit -m {any}')));

// Kedjor och flera argument
assert.deepStrictEqual(segments(tokenize('mkdir a && cd a; ls')).length, 3);
assert.deepStrictEqual(units(['mkdir', '-p', 'a', 'b']), [['mkdir', '-p', 'a'], ['mkdir', '-p', 'b']]);
assert.deepStrictEqual(units(['mv', 'a', 'b']), [['mv', 'a', 'b']]);
assert.deepStrictEqual(segments(tokenize('grep x f | wc -l')).length, 1);
assert.throws(() => tokenize('git commit -m "oavslutat'));

// Varje uppgift: mallarna fylls helt, och varje godkänt svar godkänns mot sig självt
let n = 0;
for (const t of TASKS) {
  for (let i = 0; i < 20; i++) {
    const b = fill(t, a => a[Math.floor(Math.random() * a.length)]);
    assert.ok(!/\{(?!any\})\w+\}/.test(b.text + b.why + b.steps.flat().map(a => a.raw).join()), `ofylld mall i: ${t[2]}`);
    for (const s of b.steps) for (const a of s) {
      assert.ok(same(key(a.raw.replace('{any}', '"x y"')), a.key), `svaret godkänns inte: ${a.raw}`);
      n++;
    }
  }
  assert.ok(['fs', 'git', 'cc'].includes(t[0]) && t[1] >= 1 && t[1] <= 5, `fel paket eller nivå: ${t[2]}`);
  assert.ok(!/—/.test(t[2] + t[4]), `tankstreck i: ${t[2]}`);
}
// {x2} skiljer sig alltid från {x}, även när slumpen alltid väljer det första ordet
for (const t of ['{f} {f2}', '{f2} {f}']) {
  const [a, c] = fill(['fs', 1, t, 'x', ''], a => a[0]).text.split(' ');
  assert.notStrictEqual(a, c);
}
for (const t of TASKS) fill(t, a => a[0]); // får inte hänga sig

// PowerShell: alias, skiftläge, förkortade och namngivna parametrar
const pkey = s => canon(tokenize(s, true), true);
const eqp = (a, b) => assert.ok(same(pkey(a), pkey(b)), `PS: ${a}  borde godkännas som  ${b}
${pkey(a)}
${pkey(b)}`);
const nep = (a, b) => assert.ok(!same(pkey(a), pkey(b)), `PS: ${a}  borde INTE godkännas som  ${b}`);
eqp('ls', 'Get-ChildItem');
eqp('dir', 'Get-ChildItem');
eqp('get-childitem -force', 'Get-ChildItem -Force');
eqp('mkdir musik', 'New-Item -ItemType Directory musik');
eqp('ni musik -Type Directory', 'New-Item -ItemType Directory musik');
eqp('rm demo -r', 'Remove-Item demo -Recurse');
eqp('Remove-Item -Path demo -Recurse -Force', 'Remove-Item demo -Force -Recurse');
eqp('Get-Content app.log -Last 20', 'Get-Content app.log -Tail 20');
eqp('gc app.log -tail 20', 'Get-Content app.log -Tail 20');
eqp('sls TODO notes.txt', 'Select-String TODO notes.txt');
eqp('Select-String -Path notes.txt -Pattern TODO', 'Select-String TODO notes.txt');
eqp(String.raw`cd ~\musik`, 'Set-Location ~/musik');
eqp('kill 4821', 'Stop-Process -Id 4821');
eqp('echo hej > notes.txt', 'Write-Output hej > notes.txt');
eqp('git commit -m "fixa menyn"', "git commit -m 'fixa menyn'");
nep('rm -rf demo', 'Remove-Item demo -Recurse -Force');
nep('ls -la', 'Get-ChildItem -Force');
nep('Select-String notes.txt TODO', 'Select-String TODO notes.txt');
// Varje PowerShell-svar godkänns av sig självt
let np = 0;
for (const t of TASKS) if (t[5]) for (const s of fill(t, a => a[0], true).steps) for (const a of s) {
  assert.ok(same(pkey(a.raw.replace('{any}', '"x y"')), a.key), `PS-svaret godkänns inte: ${a.raw}`); np++;
}

// Hjälpkortet: varje del av varje godkänt svar har en förklaring
const missing = new Set();
for (const t of TASKS) for (const pick of [a => a[0], a => a[a.length - 1]])
  for (const s of fill(t, pick).steps) for (const a of s)
    for (const [p, d] of parts(a.raw)) if (!d || /undefined/.test(d)) missing.add(`${a.raw}  ->  ${p}`);
for (const t of TASKS) if (t[5]) for (const pick of [a => a[0], a => a[a.length - 1]])
  for (const s of fill(t, pick, true).steps) for (const a of s)
    for (const [p, d] of parts(a.raw, true)) if (!d || /undefined/.test(d)) missing.add(`PS ${a.raw}  ->  ${p}`);
assert.ok(!missing.size, `förklaring saknas:\n${[...missing].join('\n')}`);

// Låtsasfilsystemet: samma värld i båda skalen
function shell(ps) {
  const fs = structuredClone(WORLD);
  const sh = s => { const r = fake(fs, sh.cwd, canon(tokenize(s, ps), ps), ps); if (r) sh.cwd = r.cwd; return r; };
  sh.cwd = ['projekt'];
  sh.out = s => sh(s).out.join('\n');
  sh.bad = (s, re) => assert.throws(() => sh(s), re, `${s} borde ge fel`);
  return sh;
}
let sh = shell(false);
assert.ok(/spel/.test(sh.out('ls')) && !/\.env/.test(sh.out('ls')), 'ls visar inte dolda filer');
assert.strictEqual(sh('ls').seen, 'projekt');
assert.ok(/\.env/.test(sh.out('ls -a')) && /\.hemligt/.test(sh.out('ls -la')));
sh('cd spel'); assert.deepStrictEqual(sh.cwd, ['projekt', 'spel']);
assert.ok(/Gissa/.test(sh.out('python spel.py')));
sh('cd ../..'); assert.deepStrictEqual(sh.cwd, []);
assert.ok(/högre upp/.test(sh.out('cd ..')));
assert.ok(sh('cd ~').same, 'cd dit du står ändrar ingenting');
sh('cd projekt');
sh.bad('cat nope.txt', /cat: nope.txt: No such file or directory/);
sh.bad('cd notes.txt', /Not a directory/);
sh('mkdir demo'); sh.bad('mkdir demo', /File exists/);
sh('touch demo/a.txt'); assert.ok(sh('touch demo/a.txt').same);
sh.bad('rm demo', /Is a directory/); sh.bad('rmdir demo', /Directory not empty/);
sh('rm -r demo'); assert.ok(!/demo/.test(sh.out('ls')));
sh('mv notes.txt musik'); assert.ok(/notes\.txt/.test(sh.out('ls musik')));
sh('echo hej > x.txt'); sh('echo da >> x.txt'); assert.strictEqual(sh.out('cat x.txt'), 'hej\nda'); assert.strictEqual(sh.out('wc -l x.txt'), '2 x.txt');
assert.strictEqual(sh('head -n 3 app.log').out.length, 3); assert.strictEqual(sh('tail -5 app.log').out.length, 5);
sh.bad('rm -rf /', /dangerous/);
sh('mkdir -p a/b/c'); sh('cd a/b/c'); assert.deepStrictEqual(sh.cwd, ['projekt', 'a', 'b', 'c']);
sh('rm -r ../../../a'); assert.deepStrictEqual(sh.cwd, ['projekt'], 'mappen du stod i togs bort');
sh('cd ~/recept'); assert.deepStrictEqual(sh.cwd, ['recept']);

sh = shell(true);
assert.ok(/\.env/.test(sh.out('Get-ChildItem')) && !/\.hemligt/.test(sh.out('gci')), 'på Windows är .env inte dold, .hemligt är det');
assert.ok(/\.hemligt/.test(sh.out('gci -Force')));
sh.bad('ls -la', /Get-ChildItem : A parameter cannot be found that matches parameter name 'la'/);
sh('Set-Location SPEL'); assert.deepStrictEqual(sh.cwd, ['projekt', 'spel'], 'PowerShell hittar det riktiga namnet');
sh('cd ..');
sh.bad('Set-Location nope', /Error: Set-Location : Cannot find path 'C:\\Users\\du\\projekt\\nope' because it does not exist\.$/);
sh.bad('Remove-Item musik', /has children and the Recurse parameter was not specified/);
assert.ok(/demo/.test(sh.out('New-Item -ItemType Directory demo'))); sh.bad('mkdir demo', /already exists/);
sh.bad('Rename-Item notes.txt todo.md', /Cannot create a file when that file already exists/);
assert.strictEqual(sh('Get-Content app.log -Tail 3').out.length, 3);
sh('Remove-Item musik -Recurse'); assert.ok(!/musik/.test(sh.out('ls')));

// Fynd från testagenterna 2026-10-17
for (const w of ['toString -a', 'constructor', '__proto__', 'hasOwnProperty -x']) for (const ps of [false, true]) canon(tokenize(w, ps), ps); // får inte kasta
sh = shell(false);
assert.strictEqual(sh('mkdir'), null, 'mkdir utan argument: MISSING-texten i spelet');
sh.bad('mv notes.txt', /missing destination file operand/);
sh.bad('echo hej >', /unexpected token `newline'/);
sh.bad('rm -r .', /refusing to remove/); sh.bad('rm -rf ~', /hemmapp/);
sh.bad('mv spel spel/inne', /subdirectory of itself/); sh.bad('cp -r musik musik', /into itself/);
sh.bad('mkdir -p notes.txt/a', /Not a directory/);
sh('mkdir __proto__'); assert.ok(/__proto__/.test(sh.out('ls')), '__proto__ är en vanlig mapp');
assert.deepStrictEqual(segments(tokenize('cd x && ls || pwd')).map(g => g.op), [undefined, '&&', '||']);
sh = shell(true);
assert.strictEqual(sh('touch x.txt'), null, 'touch finns inte i PowerShell');
sh.bad('Remove-Item', /Supply values for the following parameters:\nPath\[0\]:/);
sh.bad('rm -f notes.txt', /ambiguous. Possible matches include: -Filter -Force/);
sh.bad('rm -rf spel', /parameter name 'rf'\./);
assert.ok(/\.hemligt/.test(sh.out('gci -fo')), '-fo är -Force, inte tvetydigt');
assert.ok(sh('cd').same && sh.cwd.length, 'cd utan argument står kvar i PowerShell 5.1');

// Varje uppgift i Filer & mappar går att köra mot världen utan att skalet kraschar
for (const ps of [false, true]) for (const t of TASKS) if (t[0] === 'fs' && (!ps || t[5])) for (const pick of [a => a[0], a => a[a.length - 1]]) {
  const s = shell(ps);
  for (const st of fill(t, pick, ps).steps) try { s(st[0].raw.replace('{any}', 'x')); }
  catch (e) { assert.ok(!/undefined|TypeError/.test(e.message + e.name), `${st[0].raw}: ${e.message}`); }
}

console.log(`ok: ${TASKS.length} uppgifter, ${n} bash-svar och ${np} PowerShell-svar kontrollerade, låtsasskalet i båda skalen`);
