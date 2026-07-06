// Upvote and suggestion API for orgutveckling.se/ai
// Public:
// GET  /votes
// POST /vote {id,dir}
// GET  /suggestions        -> approved suggestions only
// POST /suggest {title,url,desc,cat} -> pending moderation queue
// Admin, requires Authorization: Bearer <MOD_TOKEN>:
// GET  /admin/health
// GET  /admin/pending
// POST /admin/approve {url}
// POST /admin/reject {url}
const CATS = ['official', 'guide', 'video', 'repo', 'mcp', 'ovrigt'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function isAdmin(req, env) {
  const auth = req.headers.get('Authorization') || '';
  return Boolean(env.MOD_TOKEN) && auth === `Bearer ${env.MOD_TOKEN}`;
}

function scopedKey(scope, url) {
  return `${scope}:${url}`;
}

function validUrl(value) {
  return typeof value === 'string' && value.startsWith('http') && value.length <= 300;
}

async function addVotes(s, env) {
  return { ...s, votes: Number(await env.VOTES.get(s.url)) || 0 };
}

async function readSuggestionList(env, prefix) {
  const list = await env.VOTES.list({ prefix });
  const out = [];
  for (const k of list.keys) {
    const raw = await env.VOTES.get(k.name);
    if (!raw) continue;
    out.push(await addVotes(JSON.parse(raw), env));
  }
  return out;
}

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/votes') {
      const list = await env.VOTES.list();
      const out = {};
      for (const k of list.keys) {
        if (k.name.startsWith('sug:') || k.name.startsWith('pending:')) continue;
        out[k.name] = Number(await env.VOTES.get(k.name)) || 0;
      }
      return Response.json(out, { headers: cors });
    }

    if (req.method === 'POST' && url.pathname === '/vote') {
      const body = await req.json().catch(() => ({}));
      const { id, dir } = body;
      if (!validUrl(id) || ![1, -1, 2, -2].includes(dir)) {
        return new Response('bad request', { status: 400, headers: cors });
      }
      const n = (Number(await env.VOTES.get(id)) || 0) + dir;
      await env.VOTES.put(id, String(n));
      return Response.json({ id, votes: n }, { headers: cors });
    }

    if (req.method === 'GET' && url.pathname === '/suggestions') {
      const out = await readSuggestionList(env, 'sug:');
      return Response.json(out, { headers: cors });
    }

    if (req.method === 'POST' && url.pathname === '/suggest') {
      const b = await req.json().catch(() => ({}));
      const clean = {
        title: typeof b.title === 'string' ? b.title.trim() : '',
        url: typeof b.url === 'string' ? b.url.trim() : '',
        desc: typeof b.desc === 'string' ? b.desc.trim() : '',
        cat: b.cat,
        submittedAt: new Date().toISOString(),
      };
      const ok = clean.title && clean.title.length <= 80
        && validUrl(clean.url)
        && clean.desc.length <= 200
        && CATS.includes(clean.cat);
      if (!ok) return new Response('bad request', { status: 400, headers: cors });

      if (await env.VOTES.get(scopedKey('sug', clean.url))) {
        return Response.json({ ok: true, status: 'already-approved' }, { headers: cors });
      }

      await env.VOTES.put(scopedKey('pending', clean.url), JSON.stringify(clean));
      return Response.json({ ok: true, status: 'pending' }, { headers: cors });
    }

    if (url.pathname.startsWith('/admin/')) {
      if (!isAdmin(req, env)) return new Response('unauthorized', { status: 401, headers: cors });

      if (req.method === 'GET' && url.pathname === '/admin/health') {
        return Response.json({ ok: true }, { headers: cors });
      }

      if (req.method === 'GET' && url.pathname === '/admin/pending') {
        const out = await readSuggestionList(env, 'pending:');
        out.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
        return Response.json(out, { headers: cors });
      }

      if (req.method === 'POST' && (url.pathname === '/admin/approve' || url.pathname === '/admin/reject')) {
        const b = await req.json().catch(() => ({}));
        if (!validUrl(b.url)) return new Response('bad request', { status: 400, headers: cors });

        const pendingKey = scopedKey('pending', b.url);
        const raw = await env.VOTES.get(pendingKey);
        if (!raw) return new Response('not found', { status: 404, headers: cors });

        if (url.pathname === '/admin/approve') {
          const s = JSON.parse(raw);
          await env.VOTES.put(scopedKey('sug', s.url), JSON.stringify({
            title: s.title,
            url: s.url,
            desc: s.desc,
            cat: s.cat,
            approvedAt: new Date().toISOString(),
          }));
        }

        await env.VOTES.delete(pendingKey);
        return Response.json({
          ok: true,
          action: url.pathname === '/admin/approve' ? 'approved' : 'rejected',
          url: b.url,
        }, { headers: cors });
      }
    }

    return new Response('not found', { status: 404, headers: cors });
  },
};
