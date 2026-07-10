import { requireAdmin, json } from '../_admin-auth.js';
import { deleteBoardPost } from '../_board.js';

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ ok: false, error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    const slug = String(body.slug || '').trim();
    if (!slug) return json({ ok: false, error: 'slug is required' }, 400);
    const ok = await deleteBoardPost(env, slug);
    if (!ok) return json({ ok: false, error: 'Not found' }, 404);
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
