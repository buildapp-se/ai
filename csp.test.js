// CSP-kontroll för sidornas <meta http-equiv="Content-Security-Policy">. Kör: node csp.test.js
// script-src tillåter inline-skript bara via sha256-hash. Ändras ett inline-skript måste
// hashen i samma sidas meta-CSP bytas, annars blockerar webbläsaren skriptet. Testet räknar
// fram hasharna och skriver ut den rätta om någon inte stämmer.
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const sha = s => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;

for (const file of ['index.html', 'integritet.html']) {
  const html = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  assert.ok(meta, `${file}: meta-CSP saknas`);
  assert.ok(html.indexOf(meta[0]) < html.indexOf('<script'), `${file}: meta-CSP måste stå före första <script>`);
  const dirs = Object.fromEntries(meta[1].split(';').map(d => d.trim().split(/\s+/)).filter(d => d[0]).map(([k, ...v]) => [k, v]));
  for (const d of ['default-src', 'script-src', 'object-src', 'base-uri']) assert.ok(dirs[d], `${file}: ${d} saknas`);
  const src = dirs['script-src'];
  assert.ok(!src.includes("'unsafe-inline'") && !src.includes("'unsafe-eval'"), `${file}: script-src får inte ha unsafe-inline/unsafe-eval`);
  assert.ok(!/\son[a-z]+="/.test(html), `${file}: inline-händelser (onclick= o.d.) blockeras av CSP:n`);

  // Körbara inline-skript: <script> utan src, utan type eller med JavaScript-typ.
  const inline = [...html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs = '']) => !/\ssrc=/.test(attrs) && !/\stype="(?!(text|application)\/javascript|module)/.test(attrs))
    .map(m => sha(m[2]));
  const listed = src.filter(v => v.startsWith("'sha256-"));
  for (const h of inline) assert.ok(listed.includes(h), `${file}: inline-skriptet saknar hash i script-src, lägg till ${h}`);
  for (const h of listed) assert.ok(inline.includes(h), `${file}: ${h} i script-src matchar inget inline-skript längre, ta bort den`);
  console.log(`${file}: ${inline.length} inline-skript, alla hashade`);
}
console.log('\nOK');
