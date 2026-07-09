function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function parseCookie(cookieHeader = '') {
  return Object.fromEntries(cookieHeader.split(';').map((part) => {
    const [key, ...valueParts] = part.trim().split('=');
    return [key, decodeURIComponent(valueParts.join('=') || '')];
  }).filter(([key]) => key));
}

function getSessionSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

export async function onRequestGet({ request, env }) {
  const sessionSecret = getSessionSecret(env);
  if (!sessionSecret) return json({ ok: false }, 500);

  const cookies = parseCookie(request.headers.get('cookie') || '');
  if (cookies.bp_admin !== sessionSecret) return json({ ok: false }, 401);

  return json({ ok: true });
}
