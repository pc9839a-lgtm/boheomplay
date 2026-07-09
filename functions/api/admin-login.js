function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

function getSessionSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

export async function onRequestPost({ request, env }) {
  const expectedPassword = env.ADMIN_PASSWORD;
  const sessionSecret = getSessionSecret(env);

  if (!expectedPassword || !sessionSecret) {
    return json({ ok: false, error: 'ADMIN_PASSWORD is not configured' }, 500);
  }

  let password = '';
  try {
    const body = await request.json();
    password = String(body.password || '');
  } catch (error) {
    return json({ ok: false, error: 'Invalid request body' }, 400);
  }

  if (password !== expectedPassword) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  return json({ ok: true }, 200, {
    'set-cookie': `bp_admin=${encodeURIComponent(sessionSecret)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  });
}
