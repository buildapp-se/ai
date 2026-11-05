// Innehållsmenyn under kartan ska peka på varje avsnitt, i sidans ordning. Kör: node toc.test.js
// Läggs ett avsnitt till eller byter id utan att menyn följer med blir testet rött.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const sections = [...html.matchAll(/<section id="([\w-]+)" class="sec"/g)].map(m => m[1]);
const nav = html.match(/<nav id="innehall"[\s\S]*?<\/nav>/);
assert.ok(nav, 'nav#innehall saknas');
const links = [...nav[0].matchAll(/href="#([\w-]+)"/g)].map(m => m[1]);

assert.deepStrictEqual(links, sections, 'menyn och avsnitten skiljer sig');
assert.ok(html.indexOf('<nav id="innehall"') < html.indexOf(`<section id="${sections[0]}"`), 'menyn ska stå före första avsnittet');
assert.match(html, /<a class="cue" href="#innehall"/, 'scrollpilen ska peka på menyn');
console.log(`toc OK: ${links.length} avsnitt`);
