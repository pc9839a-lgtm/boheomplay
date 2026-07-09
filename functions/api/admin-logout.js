export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': 'bp_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    }
  });
}
