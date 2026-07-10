export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function parseCookie(cookieHeader = '') {
  return Object.fromEntries(cookieHeader.split(';').map((part) => {
    const [key, ...valueParts] = part.trim().split('=');
    return [key, decodeURIComponent(valueParts.join('=') || '')];
  }).filter(([key]) => key));
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

async function isValidToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return false;
  const [expires, random, signature] = parts;
  if (!expires || !random || !signature) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = await sign(`${expires}.${random}`, secret);
  return signature === expected;
}

export async function requireAdmin(request, env) {
  const secret = env.ADMIN_SESSION_SECRET || '';
  if (!secret) return false;
  const cookies = parseCookie(request.headers.get('cookie') || '');
  return isValidToken(cookies.bp_admin, secret);
}
