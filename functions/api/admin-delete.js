import { requireAdmin, json } from '../_admin-auth.js';
import { deleteBoardPost } from '../_board.js';
import { readJsonBody } from '../_security.js';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{8,100}$/;

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await readJsonBody(request, 2_048);
    const slug = String(body.slug || '').trim().toLowerCase();
    if (!SLUG_PATTERN.test(slug)) {
      return json({ ok: false, error: '잘못된 게시글 식별자입니다.' }, 400);
    }

    const ok = await deleteBoardPost(env, slug);
    if (!ok) return json({ ok: false, error: '게시글을 찾을 수 없습니다.' }, 404);
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: '삭제 요청을 처리하지 못했습니다.' }, 500);
  }
}
