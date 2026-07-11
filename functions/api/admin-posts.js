import { requireAdmin, json } from '../_admin-auth.js';
import { listBoardPosts } from '../_board.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const posts = await listBoardPosts(env, { publicOnly: false });
    return json({ ok: true, posts });
  } catch (error) {
    return json({ ok: false, error: '게시글을 불러오지 못했습니다.', posts: [] }, 500);
  }
}
