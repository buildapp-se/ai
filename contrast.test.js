// Kontrastkontroll för paletten. Kör: node contrast.test.js
// Fasfärgerna används till stor rubriktext (kräver 3:1) och till linjer/prickar.
// Brödtext och små etiketter använder alltid --ink / --ink-2 (kräver 4.5:1).
const assert = require('assert');

const lum = hex => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const paper = '#F4F6F8';
const large = { '--ink': '#14181F', '--ink-2': '#5A6472' };
const phases = {
  '--p1 violett': '#6544E0',
  '--p2 gron': '#1F8A5B',
  '--p3 barnsten': '#9A6100',
  '--p4 bla': '#1C6FE0',
  '--p5 rod': '#C0304A',
};

let out = [];
for (const [name, hex] of Object.entries(large)) {
  const r = ratio(hex, paper);
  out.push(`${name} ${hex}  ${r.toFixed(2)}:1  (brödtext, krav 4.5)`);
  assert.ok(r >= 4.5, `${name} klarar inte 4.5:1 mot ${paper}, fick ${r.toFixed(2)}`);
}
for (const [name, hex] of Object.entries(phases)) {
  const r = ratio(hex, paper);
  out.push(`${name} ${hex}  ${r.toFixed(2)}:1  (stor rubrik, krav 3.0)`);
  assert.ok(r >= 3.0, `${name} klarar inte 3:1 mot ${paper}, fick ${r.toFixed(2)}`);
}
// Vita kort ligger på pappersbotten och måste gå att skilja från den via sin linje.
out.push(`kortlinje #DDE3EA mot vitt  ${ratio('#DDE3EA', '#FFFFFF').toFixed(2)}:1`);

console.log(out.join('\n'));
console.log('\nOK');
