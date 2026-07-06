// Upvote- och förslags-API för orgutveckling.se/ai
// GET  /votes         -> { "<länk-url>": antal, ... }  (netto: upp minus ner, kan vara negativt)
// POST /vote {id,dir} -> { id, votes }  (dir: delta -2..2, t.ex. +1 upp, -1 ångra/ner, +2 ner->upp)
// GET  /suggestions   -> [ {title,url,desc,cat,votes}, ... ]
// POST /suggest {title,url,desc,cat} -> { ok: true }
const CATS = ['official', 'guide', 'video', 'repo', 'mcp'];

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/votes') {
      const list = await env.VOTES.list();
      const out = {};
      for (const k of list.keys) {
        if (k.name.startsWith('sug:')) continue;
        out[k.name] = Number(await env.VOTES.get(k.name)) || 0;
      }
      return Response.json(out, { headers: cors });
    }

    if (req.method === 'POST' && url.pathname === '/vote') {
      const body = await req.json().catch(() => ({}));
      const { id, dir } = body;
      if (typeof id !== 'string' || !id.startsWith('http') || id.length > 300 || ![1, -1, 2, -2].includes(dir)) {
        return new Response('bad request', { status: 400, headers: cors });
      }
      // ponytail: KV är inte atomiskt, samtidiga röster kan tappa enstaka klick.
      // Durable Objects om exakt räkning nån gång spelar roll.
      const n = (Number(await env.VOTES.get(id)) || 0) + dir;
      await env.VOTES.put(id, String(n));
      return Response.json({ id, votes: n }, { headers: cors });
    }

    if (req.method === 'GET' && url.pathname === '/suggestions') {
      const list = await env.VOTES.list({ prefix: 'sug:' });
      const out = [];
      for (const k of list.keys) {
        const s = JSON.parse(await env.VOTES.get(k.name));
        s.votes = Number(await env.VOTES.get(s.url)) || 0;
        out.push(s);
      }
      return Response.json(out, { headers: cors });
    }

    if (req.method === 'POST' && url.pathname === '/suggest') {
      const b = await req.json().catch(() => ({}));
      const ok = typeof b.title === 'string' && b.title.trim() && b.title.length <= 80
        && typeof b.url === 'string' && b.url.startsWith('http') && b.url.length <= 300
        && typeof b.desc === 'string' && b.desc.length <= 200
        && CATS.includes(b.cat);
      if (!ok) return new Response('bad request', { status: 400, headers: cors });
      // Nyckel = URL, så samma länk kan inte föreslås två gånger
      await env.VOTES.put('sug:' + b.url, JSON.stringify({
        title: b.title.trim(), url: b.url, desc: b.desc.trim(), cat: b.cat,
      }));
      return Response.json({ ok: true }, { headers: cors });
    }

    return new Response('not found', { status: 404, headers: cors });
  },
};
