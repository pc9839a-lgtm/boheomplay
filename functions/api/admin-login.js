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
  return env.ADMIN_SESSION_SECRET || '';
}

function base64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64Url(signature);
}

async function createToken(secret) {
  const expires = Date.now() + 1000 * 60 * 60 * 8;
  const random = crypto.randomUUID();
  const payload = `${expires}.${random}`;
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

export async function onRequestPost({ request, env }) {
  const expectedPassword = env.ADMIN_PASSWORD;
  const sessionSecret = getSessionSecret(env);

  if (!expectedPassword || !sessionSecret) {
    return json({ ok: false, error: 'Admin env is not configured' }, 500);
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

  const token = await createToken(sessionSecret);

  return json({ ok: true }, 200, {
    'set-cookie': `bp_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
  });
}
