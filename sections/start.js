// Sortable tables: any <table data-sortable> on the page. Click a header: ascending, again: descending.
// ponytail: lives in start.js because start is the first section with such a table; benchmarks keeps its own range-aware sorter.
(() => {
  const RANK = { Ja: 2, 'Ej officiellt': 1, Nej: 0 }; // verifiera's support matrix
  const key = (cell) => {
    const t = cell.textContent.trim();
    if (t in RANK) return RANK[t];
    const n = t.match(/\d+(?:,\d+)?/);
    return n ? +n[0].replace(',', '.') : t;
  };
  for (const table of document.querySelectorAll('table[data-sortable]')) {
    const heads = [...table.tHead.rows[0].cells];
    heads.forEach((th, col) => {
      if (!th.textContent.trim()) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 't-sort';
      b.append(...th.childNodes);
      th.append(b);
      b.addEventListener('click', () => {
        const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        heads.forEach((h) => h.removeAttribute('aria-sort'));
        th.setAttribute('aria-sort', dir);
        const sign = dir === 'ascending' ? 1 : -1, body = table.tBodies[0];
        [...body.rows]
          .sort((a, c) => {
            const x = key(a.cells[col]), y = key(c.cells[col]);
            return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'sv'));
          })
          .forEach((r) => body.append(r));
      });
    });
  }
})();
