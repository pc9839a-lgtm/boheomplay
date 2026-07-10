import { requireAdmin, json } from '../_admin-auth.js';
import { answerBoardPost } from '../_board.js';

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) return json({ ok: false, error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    const slug = String(body.slug || '').trim();
    const answer = String(body.answer || '').trim();
    if (!slug || !answer) return json({ ok: false, error: 'slug and answer are required' }, 400);
    const post = await answerBoardPost(env, slug, answer);
    if (!post) return json({ ok: false, error: 'Not found' }, 404);
    return json({ ok: true, post });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
