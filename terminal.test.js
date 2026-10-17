// Rättningen i terminal.html. Kör: node terminal.test.js
// Läser den rena logiken mellan pure:start och pure:end ur sidan.
const assert = require('assert');
const fs = require('fs');

const html = fs.readFileSync(__dirname + '/terminal.html', 'utf8');
const src = html.slice(html.indexOf('/* pure:start'), html.indexOf('/* pure:end */'));
const {TASKS, POOLS, tokenize, segments, units, canon, same, fill} =
  new Function(src + '; return {TASKS, POOLS, tokenize, segments, units, canon, same, fill};')();

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

console.log(`ok: ${TASKS.length} uppgifter, ${n} svar kontrollerade`);
