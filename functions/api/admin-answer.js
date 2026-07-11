import { requireAdmin, json } from '../_admin-auth.js';
import { answerBoardPost } from '../_board.js';
import { readJsonBody, stripUnsafeControls } from '../_security.js';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{8,100}$/;

export async function onRequestPost({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await readJsonBody(request, 8_000);
    const slug = String(body.slug || '').trim().toLowerCase();
    const answer = stripUnsafeControls(body.answer)
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 3_000);

    if (!SLUG_PATTERN.test(slug) || answer.length < 2) {
      return json({ ok: false, error: '입력값을 확인해주세요.' }, 400);
    }

    const post = await answerBoardPost(env, slug, answer);
    if (!post) return json({ ok: false, error: '게시글을 찾을 수 없습니다.' }, 404);

    return json({ ok: true, post });
  } catch (error) {
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      return json({ ok: false, error: '답변이 너무 깁니다.' }, 413);
    }
    return json({ ok: false, error: '답변 저장에 실패했습니다.' }, 500);
  }
}
