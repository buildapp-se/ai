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

const { ratio: contrast } = require('./contrast');
const ratio = (fgName, bgName) => contrast(tok[fgName], tok[bgName]);

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
