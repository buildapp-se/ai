// Upvote-API för orgutveckling.se/ai
// GET  /votes         -> { "<länk-url>": antal, ... }
// POST /vote {id,dir} -> { id, votes }  (dir: 1 = upp, -1 = ångra)
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
      for (const k of list.keys) out[k.name] = Number(await env.VOTES.get(k.name)) || 0;
      return Response.json(out, { headers: cors });
    }

    if (req.method === 'POST' && url.pathname === '/vote') {
      const body = await req.json().catch(() => ({}));
      const { id, dir } = body;
      if (typeof id !== 'string' || !id.startsWith('http') || id.length > 300 || ![1, -1].includes(dir)) {
        return new Response('bad request', { status: 400, headers: cors });
      }
      // ponytail: KV är inte atomiskt, samtidiga röster kan tappa enstaka klick.
      // Durable Objects om exakt räkning nån gång spelar roll.
      const n = Math.max(0, (Number(await env.VOTES.get(id)) || 0) + dir);
      await env.VOTES.put(id, String(n));
      return Response.json({ id, votes: n }, { headers: cors });
    }

    return new Response('not found', { status: 404, headers: cors });
  },
};
