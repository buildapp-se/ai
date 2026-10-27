// Benchmarks quadrant chart. Data: Artificial Analysis leaderboard, fetched 2026-10-27 (see benchmarks.sources.md).
// Each point: [setting, Intelligence Index, cost per index task in USD]. Points of one model are joined low -> max.
const BENCH = [
  { m: 'Claude Opus 5.5', c: 'anthropic', p: [['low', 42, 0.55], ['medium', 51, 1.34], ['high', 54, 1.82], ['xhigh', 56, 3.46], ['max', 58, 5.98]] },
  { m: 'Claude Sonnet 5.5', c: 'anthropic', p: [['low', 36, 0.35], ['medium', 41, 0.48], ['high', 47, 0.88], ['xhigh', 52, 2.01], ['max', 56, 5.46]] },
  { m: 'Kimi K3.1 Pro', c: 'moonshot', p: [['standard', 55, 2.11]] },
  { m: 'Claude Fable 5.1', c: 'anthropic', p: [['low', 47, 2.37], ['medium', 49, 2.98], ['high', 51, 3.91], ['xhigh', 53, 5.98], ['max', 53, 7.63]] },
  { m: 'GPT-6 Astra', c: 'openai', l: 'bl', dy: 30, p: [['low', 46, 0.82], ['medium', 50, 1.54], ['high', 51, 1.73], ['xhigh', 52, 2.31], ['max', 53, 3.26]] },
  { m: 'Gemini 4 Argon', c: 'google', p: [['high', 53, 1.62]], from: ['Gemini 3.1 Pro Preview', 30, 1.44] },
  { m: 'GPT-6.1 Sol', c: 'openai', p: [['low', 42, 0.13], ['medium', 48, 0.21], ['high', 50, 0.32], ['xhigh', 51, 0.39], ['max', 52, 0.72]] },
  { m: 'Muse Wonder', c: 'meta', l: 'br', p: [['max', 52, 3.27]] },
  { m: 'GPT-6.1 Terra', c: 'openai', p: [['low', 36, 0.05], ['medium', 41, 0.10], ['high', 44, 0.13], ['xhigh', 45, 0.19], ['max', 48, 0.40]] },
  { m: 'Grok 4.7', c: 'xai', p: [['low', 42, 1.03], ['high', 46, 2.36], ['xhigh', 46, 3.24]] },
  { m: 'Qwen3.8-Max', c: 'qwen', p: [['0902', 45, 5.41]] },
  { m: 'DeepSeek-V4.1-Flash', c: 'deepseek', p: [['max', 45, 0.26]], from: ['DeepSeek-V4-Pro (0813)', 36, 0.67] },
  { m: 'Claude Haiku 5.5', c: 'anthropic', p: [['low', 29, 0.02], ['medium', 34, 0.05], ['high', 38, 0.08], ['xhigh', 41, 0.12], ['max', 43, 0.21]] },
  { m: 'Gemini 3.8 Flash', c: 'google', p: [['medium', 40, 2.59], ['high', 41, 3.49]] },
  { m: 'Muse Spark Open', c: 'meta', p: [['xhigh', 39, 0.84]] },
  { m: 'Mistral Large 4 (förhandsversion)',
 c: 'mistral', p: [['standard', 38, 1.61]] },
  { m: 'GPT-6 Luna', c: 'openai', p: [['medium', 30, 0.02], ['high', 33, 0.03], ['xhigh', 35, 0.04], ['max', 38, 0.07]] },
  { m: 'Qwen3.8-27B', c: 'qwen', p: [['medium', 28, 1.27], ['xhigh', 34, 1.15]] },
];
// company colours: --bm-<id> in benchmarks.css (planet colours from src/main.js LOOKS)
// OpenAI, xAI and Moonshot all have near-white colours, so two of them get their own marker shape.
const SHAPE = { moonshot: 'square', xai: 'diamond' };

const SPLIT = { idx: 45, usd: 1 }; // where the quadrants divide (our choice, not the source's)

if (typeof document !== 'undefined') (() => {
  const box = document.getElementById('bm-chart');
  if (!box) return;
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (n) => String(n).replace('.', ',');
  const el = (tag, attrs, text) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  };
  // a point marker: circle, or square/diamond of about the same visual weight
  const mark = (shape, x, y, r, cls) => {
    if (!shape) return el('circle', { cx: x, cy: y, r, class: cls });
    const d = shape === 'square' ? r * 0.9 : r * 1.3;
    const pts = shape === 'square' ? [[-d, -d], [d, -d], [d, d], [-d, d]] : [[0, -d], [d, 0], [0, d], [-d, 0]];
    return el('polygon', { points: pts.map(([a, b]) => `${x + a},${y + b}`).join(' '), class: cls });
  };

  function draw() {
    const W = Math.max(300, box.clientWidth);
    const narrow = W < 560;
    const H = narrow ? 600 : 560;
    const pad = { l: 36, r: narrow ? 10 : 24, t: 16, b: 44 };
    const lx = Math.log10(0.015), hx = Math.log10(10); // x: log scale, 0,015 to 10 USD
    const ly = 25, hy = 60;
    const X = (usd) => pad.l + ((Math.log10(usd) - lx) / (hx - lx)) * (W - pad.l - pad.r);
    const Y = (i) => pad.t + (1 - (i - ly) / (hy - ly)) * (H - pad.t - pad.b);

    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-labelledby': 'bm-svg-title bm-svg-desc' });
    svg.append(el('title', { id: 'bm-svg-title' }, 'AI-modeller efter förmåga och kostnad'));
    svg.append(el('desc', { id: 'bm-svg-desc' }, 'Spridningsdiagram. Lodrät axel: Artificial Analysis Intelligence Index. Vågrät axel: genomsnittlig kostnad i USD för en uppgift i testet, logaritmisk skala. Linjer binder ihop samma modell med olika lång betänketid. Kimi visas med fyrkant och Grok med romb. Samma siffror finns i tabellen under diagrammet.'));

    // quadrants: each is a click target that highlights the models with a point inside it
    const qx = X(SPLIT.usd), qy = Y(SPLIT.idx);
    const zr = { goodcheap: [pad.l, pad.t, qx, qy], goodexp: [qx, pad.t, W - pad.r, qy], cheapweak: [pad.l, qy, qx, H - pad.b], expweak: [qx, qy, W - pad.r, H - pad.b] };
    for (const [z, [x1, y1, x2, y2]] of Object.entries(zr)) {
      const r = el('rect', { x: x1, y: y1, width: x2 - x1, height: y2 - y1, class: `bm-zone${z === 'goodcheap' ? ' bm-good' : ''}`, 'data-zone': z });
      r.addEventListener('click', () => setZone(zone === z ? null : z));
      svg.append(r);
    }
    const ql = [
      ['Bra och billig', pad.l + 6, pad.t + 16, 'start'],
      ['Bra men dyr', W - pad.r - 6, pad.t + 16, 'end'],
      ['Billig men svagare', pad.l + 6, H - pad.b - 8, 'start'],
      ['Dyr och svagare', W - pad.r - 6, H - pad.b - 8, 'end'],
    ];
    for (const [t, x, y, a] of ql) svg.append(el('text', { x, y, 'text-anchor': a, class: 'bm-q' }, t));

    // grid + axes
    for (const v of [0.02, 0.1, 1, 10]) {
      svg.append(el('line', { x1: X(v), x2: X(v), y1: pad.t, y2: H - pad.b, class: v === SPLIT.usd ? 'bm-split' : 'bm-grid' }));
      svg.append(el('text', { x: X(v), y: H - pad.b + 16, 'text-anchor': v === 10 ? 'end' : 'middle', class: 'bm-tick' }, sv(v)));
    }
    for (const v of [30, 40, 50, 60]) {
      svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: Y(v), y2: Y(v), class: 'bm-grid' }));
      svg.append(el('text', { x: pad.l - 6, y: Y(v) + 4, 'text-anchor': 'end', class: 'bm-tick' }, v));
    }
    svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: qy, y2: qy, class: 'bm-split' }));
    svg.append(el('text', { x: (pad.l + W - pad.r) / 2, y: H - 6, 'text-anchor': 'middle', class: 'bm-axis' }, 'USD per uppgift i testet (billigare åt vänster)'));

    // series
    BENCH.forEach((s, rank) => {
      const g = el('g', { style: `--c:var(--bm-${s.c})`, class: 'bm-series', 'data-i': rank });
      g.addEventListener('click', () => toggle(rank));
      g.addEventListener('pointerenter', () => rows[rank]?.classList.add('is-hover'));
      g.addEventListener('pointerleave', () => rows[rank]?.classList.remove('is-hover'));
      if (s.from) {
        const [fn, fi, fu] = s.from, [, ti, tu] = s.p[0];
        g.append(el('line', { x1: X(fu), y1: Y(fi), x2: X(tu), y2: Y(ti), class: 'bm-gen' }));
        g.append(mark(SHAPE[s.c], X(fu), Y(fi), 3.5, 'bm-old'));
        g.lastChild.append(el('title', {}, `${fn}: index ${fi}, ${fu.toFixed(2).replace('.', ',')} USD per uppgift`));
      }
      if (s.p.length > 1) g.append(el('polyline', { points: s.p.map(([, i, u]) => `${X(u)},${Y(i)}`).join(' '), class: 'bm-trail' }));
      s.p.forEach(([set, i, u], k) => {
        const last = k === s.p.length - 1;
        const dot = mark(SHAPE[s.c], X(u), Y(i), last ? 5 : 3, 'bm-dot');
        dot.append(el('title', {}, `${s.m} (${set}): index ${i}, ${u.toFixed(2).replace('.', ',')} USD per uppgift`));
        g.append(dot);
      });
      const [, ti, tu] = s.p[s.p.length - 1];
      // narrow: the table's rank number instead of the name. Desktop: name, nudged by s.l (b = below, l/r = side) and s.dy (px down).
      const l = narrow ? '' : (s.l ?? '');
      const right = l ? l.includes('l') : X(tu) > W * 0.72;
      const dy = !narrow && s.dy != null ? s.dy : l.includes('b') ? 16 : narrow ? 4 : -6;
      g.append(el('text', { x: X(tu) + (right ? -8 : 8), y: Y(ti) + dy, 'text-anchor': right ? 'end' : 'start', class: 'bm-label' }, narrow ? rank + 1 : s.m));
      svg.append(g);
    });
    const parts = [svg];
    if (narrow) parts.push(Object.assign(document.createElement('p'), { className: 'bm-key', textContent: 'Siffrorna i diagrammet är modellens nummer i tabellen nedan.' }));
    box.replaceChildren(...parts);
    apply();
  }

  // ---------- highlighting: a quadrant (button or click in the chart) or picked models (table rows, chart lines) ----------
  const ZONES = [[null, 'Alla'], ['goodcheap', 'Bra och billig'], ['goodexp', 'Bra men dyr'], ['cheapweak', 'Billig men svagare'], ['expweak', 'Dyr och svagare']];
  const inZone = (z, [, i, u]) => (z.startsWith('good') ? i >= SPLIT.idx : i < SPLIT.idx) && (z.endsWith('cheap') || z === 'cheapweak' ? u <= SPLIT.usd : u > SPLIT.usd);
  let zone = null;
  const picked = new Set();
  const section = box.closest('section') ?? document;
  const rows = [...section.querySelectorAll('.bm-table tbody tr')];
  const bar = Object.assign(document.createElement('div'), { className: 'bm-filter', role: 'group' });
  bar.setAttribute('aria-label', 'Markera modeller');
  const btns = ZONES.map(([z, label]) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: label });
    b.addEventListener('click', () => setZone(z));
    bar.append(b);
    return [z, b];
  });
  box.before(bar);
  rows.forEach((tr, i) => {
    // the model name becomes a button, so a row can be picked by keyboard too
    const th = tr.querySelector('th');
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'bm-pick' });
    b.append(...th.childNodes);
    th.append(b);
    b.addEventListener('click', () => toggle(i));
  });
  // Sortable table: click a header for ascending, again for descending. Ranges ("42–58") sort by their
  // best end: highest score, lowest price.
  const tbody = section.querySelector('.bm-table tbody');
  const heads = [...section.querySelectorAll('.bm-table thead th')];
  const nums = (t) => (t.match(/\d+(?:,\d+)?/g) ?? []).map((n) => +n.replace(',', '.'));
  const KEYS = [
    (tr) => +tr.cells[0].textContent,
    (tr) => tr.cells[1].textContent.trim(),
    (tr) => tr.cells[2].textContent.trim(),
    (tr) => Math.max(...nums(tr.cells[3].textContent)),
    (tr) => Math.min(...nums(tr.cells[4].textContent)),
  ];
  heads.forEach((th, col) => {
    if (!KEYS[col]) return;
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'bm-sort' });
    b.append(...th.childNodes);
    th.append(b);
    b.addEventListener('click', () => {
      const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
      heads.forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', dir);
      const key = KEYS[col], sign = dir === 'ascending' ? 1 : -1;
      const sorted = [...tbody.rows].sort((a, c) => {
        const x = key(a), y = key(c);
        return sign * (typeof x === 'string' ? x.localeCompare(y, 'sv') : x - y);
      });
      tbody.append(...sorted);
    });
  });

  function setZone(z) { zone = z; picked.clear(); apply(); }
  function toggle(i) { zone = null; picked.has(i) ? picked.delete(i) : picked.add(i); apply(); }
  function apply() {
    const on = (i) => (picked.size ? picked.has(i) : zone ? BENCH[i].p.some((pt) => inZone(zone, pt)) : true);
    const active = picked.size > 0 || zone !== null;
    box.querySelectorAll('.bm-series').forEach((g) => {
      const i = +g.dataset.i;
      g.classList.toggle('is-dim', active && !on(i));
      g.classList.toggle('is-on', active && on(i));
    });
    box.querySelectorAll('.bm-zone').forEach((r) => r.classList.toggle('is-on', r.dataset.zone === zone));
    rows.forEach((tr, i) => {
      tr.classList.toggle('is-dim', active && !on(i));
      tr.classList.toggle('is-on', active && on(i));
      tr.querySelector('.bm-pick')?.setAttribute('aria-pressed', String(picked.has(i)));
    });
    for (const [z, b] of btns) b.setAttribute('aria-pressed', String(!picked.size && z === zone));
  }
  draw();
  let w = box.clientWidth;
  new ResizeObserver(() => { if (box.clientWidth !== w) { w = box.clientWidth; draw(); } }).observe(box);
})();
