// Tre frågor, din egen väg. Varje svar visar ett råd under frågan och lägger till avsnitt (data-vag)
// i listan "Din väg genom sidan", i den ordning innehållsmenyn har dem. Inget sparas, inget skickas.
(() => {
  const form = document.getElementById('vag-form');
  if (!form) return;
  const list = document.getElementById('vag-lista'), out = document.getElementById('vag-ut');
  const order = [...document.querySelectorAll('#innehall a')].map((a) => [a.hash.slice(1), a.textContent]);
  const update = () => {
    const picked = [...form.querySelectorAll('input:checked')];
    for (const p of form.querySelectorAll('[data-svar]')) p.hidden = !picked.some((i) => i.id === p.dataset.svar);
    const want = new Set(picked.flatMap((i) => i.dataset.vag.split(' ')));
    list.replaceChildren(...order.filter(([id]) => want.has(id)).map(([id, label]) => {
      const li = document.createElement('li'), a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = label;
      li.append(a);
      return li;
    }));
    out.hidden = !picked.length;
  };
  form.addEventListener('change', update);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => {
    setTimeout(update); // the inputs are cleared after the event
    form.querySelector('input').focus(); // the button disappears with the result, keep focus in the form
  });
  form.closest('section').hidden = false;
  update();
})();
