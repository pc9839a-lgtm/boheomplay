import { json, requireAdmin } from '../_admin-auth.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false }, 401);
  }
  return json({ ok: true });
}
