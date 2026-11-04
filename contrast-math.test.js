// Egna tester för kontrastformlerna i contrast.js, så att contrast.test.js inte kan bli
// för snäll utan att det märks. Referensvärden från WCAG 2.x. Kör: node --test contrast-math.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parse, over, lum, ratio } = require('./contrast');

const near = (got, want, eps = 1e-6) => assert.ok(Math.abs(got - want) < eps, `fick ${got}, väntade ${want}`);

test('parse läser hex, rgb() och rgb() med alfa', () => {
  assert.deepEqual(parse('#0a1b2c'), [10, 27, 44, 1]);
  assert.deepEqual(parse('#FFffFF'), [255, 255, 255, 1]);
  assert.deepEqual(parse('rgb(1 22 255)'), [1, 22, 255, 1]);
  assert.deepEqual(parse('rgb(  1   22  255  )'), [1, 22, 255, 1]);
  assert.deepEqual(parse('rgb(10 20 30 / 0.25)'), [10, 20, 30, 0.25]);
  assert.deepEqual(parse('rgb(10 20 30/.5)'), [10, 20, 30, 0.5]);
});

test('parse vägrar okända format i stället för att gissa', () => {
  for (const s of ['red', 'rgb(1, 2, 3)', 'rgba(1 2 3 / 0.5)', 'hsl(0 0% 0%)', 'rgb(1 2)', 'xrgb(1 2 3)', 'rgb(1 2 3) x', 'rgb(1 2 3 x)', 'rgb(1 2 3 / 0.5 x)',
    '#abc', '#11223344', '#1122334', ' #112233', '#11223g', 'color-mix(in srgb, rgb(1 2 3) 50%, #000000)']) {
    assert.throws(() => parse(s), /okänt färgformat/, s);
  }
});

test('over blandar förgrund med alfa över bakgrunden', () => {
  assert.deepEqual(over([200, 100, 50, 1], [0, 0, 0]), [200, 100, 50]);
  assert.deepEqual(over([200, 100, 50, 0], [10, 20, 30]), [10, 20, 30]);
  assert.deepEqual(over([255, 255, 255, 0.5], [0, 0, 0]), [127.5, 127.5, 127.5]);
  assert.deepEqual(over([0, 0, 0, 0.25], [100, 200, 40]), [75, 150, 30]);
});

test('lum: svart 0, vitt 1, kanalvikterna 0,2126 / 0,7152 / 0,0722', () => {
  near(lum([0, 0, 0]), 0);
  near(lum([255, 255, 255]), 1);
  near(lum([255, 0, 0]), 0.2126);
  near(lum([0, 255, 0]), 0.7152);
  near(lum([0, 0, 255]), 0.0722);
});

test('lum: linjär del under 0,04045 och gammakurvan över', () => {
  near(lum([1, 1, 1]), 1 / 255 / 12.92, 1e-12); // linjära delen
  near(lum([10, 10, 10]), 10 / 255 / 12.92, 1e-12);
  near(lum([128, 128, 128]), ((128 / 255 + 0.055) / 1.055) ** 2.4, 1e-12); // kurvan
  near(lum([119, 119, 119]), 0.18447, 1e-5);
});

test('ratio ger WCAG:s referensvärden', () => {
  near(ratio('#000000', '#ffffff'), 21);
  near(ratio('#ffffff', '#ffffff'), 1);
  near(ratio('#777777', '#ffffff'), 4.478, 1e-3); // klassiska gränsfallet, strax under 4,5:1
  near(ratio('#767676', '#ffffff'), 4.542, 1e-3); // ljusaste grå som klarar 4,5:1 på vitt
});

test('ratio är densamma oavsett vilken färg som är ljusast', () => {
  near(ratio('#ffffff', '#000000'), 21);
  near(ratio('#222222', '#eeeeee'), ratio('#eeeeee', '#222222'));
  near(ratio('rgb(30 30 30)', '#c0c0c0'), ratio('#c0c0c0', 'rgb(30 30 30)'));
});

test('ratio räknar förgrundens alfa mot bakgrunden', () => {
  near(ratio('rgb(255 255 255 / 0)', '#000000'), 1); // osynlig text har ingen kontrast
  near(ratio('rgb(255 255 255 / 0.5)', '#000000'), (lum([127.5, 127.5, 127.5]) + 0.05) / 0.05);
  near(ratio('rgb(0 0 0 / 0.5)', '#ffffff'), 1.05 / (lum([127.5, 127.5, 127.5]) + 0.05));
});
