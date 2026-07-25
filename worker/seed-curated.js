// Seedar KV med de kurerade länkarna från index.html så att de går att rösta på.
// Sedan allowlisten i worker.js finns kan bara kända nycklar ta emot röster, så en
// NY kurerad länk i index.html måste seedas innan den kan få sin första röst.
//
//   node seed-curated.js            # visar vad som saknas
//   node seed-curated.js --write    # skriver bulk-fil + kör wrangler
//
// Idempotent: rör aldrig nycklar som redan finns (skulle nolla riktiga röstsiffror).
const fs = require('fs');
const { execFileSync } = require('child_process');

const NAMESPACE = 'd6fc8ed9180545b1a8ff192b9c9915e3';
const API = 'https://api.orgutveckling.se';

const html = fs.readFileSync(new URL('../index.html', `file://${__filename}`), 'utf8');
const curated = [...new Set(
  (html.match(/href="(https?:\/\/[^"]+)"[^>]*class="link-card"/g) || [])
    .map(m => m.match(/href="(https?:\/\/[^"]+)"/)[1]),
)];

(async () => {
  const live = await fetch(`${API}/votes`).then(r => r.json());
  const missing = curated.filter(u => !(u in live));

  console.log(`kurerade länkar: ${curated.length}, redan i KV: ${curated.length - missing.length}, saknas: ${missing.length}`);
  if (!missing.length) return console.log('inget att seeda.');
  missing.forEach(u => console.log('  + ' + u));

  if (!process.argv.includes('--write')) return console.log('\nkör med --write för att seeda.');

  const file = 'seed-bulk.json';
  fs.writeFileSync(file, JSON.stringify(missing.map(key => ({ key, value: '0' })), null, 2));
  execFileSync('npx', ['wrangler', 'kv', 'bulk', 'put', file, `--namespace-id=${NAMESPACE}`, '--remote'],
    { stdio: 'inherit', shell: true });
  fs.unlinkSync(file);
  console.log(`seedade ${missing.length} länkar.`);
})();
