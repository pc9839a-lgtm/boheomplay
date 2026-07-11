import { clearAdminCookieHeaders } from '../_admin-auth.js';
import { isSameOrigin } from '../_security.js';

export async function onRequestPost({ request }) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 403,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }

  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  for (const cookie of clearAdminCookieHeaders()) headers.append('set-cookie', cookie);

  return new Response(JSON.stringify({ ok: true }), { headers });
}
