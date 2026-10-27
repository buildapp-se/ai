// Kontrastkontroll för sidans färgtokens. Kör: node contrast.test.js
// Läser :root i index.html, så testet följer sidan i stället för en kopierad palett.
// Mörk sida: text och signalfärger mot --space (botten) och --sheet (paneler).
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const root = html.match(/:root\s*\{([\s\S]*?)\}/)[1];
const tok = {};
for (const [, k, v] of root.matchAll(/--([\w-]+):\s*([^;]+);/g)) tok[k] = v.trim();

// "#rrggbb", "rgb(r g b)" eller "rgb(r g b / a)" -> [r,g,b,a]
const parse = s => {
  if (s.startsWith('#')) return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)).concat(1);
  const m = s.match(/rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+))?\s*\)/);
  assert.ok(m, `okänt färgformat: ${s}`);
  return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
};
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
const lum = rgb => {
  const c = rgb.map(v => v / 255).map(v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (fgName, bgName) => {
  const bg = parse(tok[bgName]);
  const fg = over(parse(tok[fgName]), bg);
  const [hi, lo] = [lum(fg), lum(bg.slice(0, 3))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Brödtext, sekundär text och signalfärger som också bär text: 4.5:1.
const text = ['text', 'muted', 'star', 'cool', 'ok', 'fail'];
// Företagsfärgerna i Benchmarks är staplar och prickar: 3:1 (WCAG 1.4.11).
const marks = Object.keys(tok).filter(k => k.startsWith('bm-'));
assert.ok(marks.length >= 9, 'hittar inte --bm-*-färgerna i :root');

const out = [];
for (const bg of ['space', 'sheet']) {
  for (const fg of text) {
    const r = ratio(fg, bg);
    out.push(`--${fg} på --${bg}  ${r.toFixed(2)}:1  (text, krav 4.5)`);
    assert.ok(r >= 4.5, `--${fg} klarar inte 4.5:1 mot --${bg}, fick ${r.toFixed(2)}`);
  }
  for (const fg of marks) {
    const r = ratio(fg, bg);
    out.push(`--${fg} på --${bg}  ${r.toFixed(2)}:1  (markering, krav 3.0)`);
    assert.ok(r >= 3.0, `--${fg} klarar inte 3:1 mot --${bg}, fick ${r.toFixed(2)}`);
  }
}
console.log(out.join('\n'));
console.log('\nOK');
