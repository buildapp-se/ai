// Grilla: copy buttons and the chat demo.
// ponytail: one copy handler for every [data-copy] button on the page (verifiera uses it too).
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const text = document.getElementById(btn.dataset.copy).textContent.trim();
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Kopierad ✓'; }
  catch { getSelection().selectAllChildren(document.getElementById(btn.dataset.copy)); btn.textContent = 'Markerad, tryck Ctrl+C'; }
  btn.classList.add('is-done');
  setTimeout(() => { btn.textContent = 'Kopiera'; btn.classList.remove('is-done'); }, 2200);
});

(() => {
  const sec = document.getElementById('grilla');
  if (!sec || matchMedia('(prefers-reduced-motion: reduce)').matches) return; // reduced motion: no playback
  const items = [...sec.querySelectorAll('.g-log > li')];
  const log = sec.querySelector('.g-log');
  const bar = sec.querySelector('.g-progress');
  const replay = sec.querySelector('.g-replay');
  const typing = Object.assign(document.createElement('li'), { className: 'g-typing', innerHTML: '<i></i><i></i><i></i>' });
  typing.setAttribute('aria-hidden', 'true');
  let run = 0;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function play() {
    const me = ++run;
    replay.hidden = true;
    sec.classList.add('is-playing');
    items.forEach((li) => li.classList.remove('is-in'));
    bar.style.setProperty('--p', '0%');
    for (const [i, li] of items.entries()) {
      if (li.classList.contains('g-ai') || li.classList.contains('g-plan')) {
        log.insertBefore(typing, li);
        await wait(li.classList.contains('g-plan') ? 1400 : 900);
        typing.remove();
      } else await wait(i === 0 ? 200 : 650);
      if (me !== run) return;
      li.classList.add('is-in');
      bar.style.setProperty('--p', `${((i + 1) / items.length) * 100}%`);
    }
    replay.textContent = 'Spela igen';
    replay.hidden = false;
  }

  // The whole dialogue stays visible until it plays, so it never sits as an empty box; it plays once when the chat scrolls into view.
  replay.hidden = false;
  replay.addEventListener('click', play);
  const seen = new IntersectionObserver(([e]) => { if (e.isIntersecting) { seen.disconnect(); play(); } }, { threshold: 0.35 });
  seen.observe(log);
})();

