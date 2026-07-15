import { requireAdmin, json } from '../_admin-auth.js';
import { listBoardPosts } from '../_board.js';

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false, error: '관리자 로그인이 만료되었습니다.' }, 401);
  }

  if (!env.BOARD_POSTS && !env.SECURITY_STORE) {
    return json({
      ok: false,
      code: 'BOARD_STORE_NOT_CONFIGURED',
      error: '게시판 KV 저장소가 연결되지 않았습니다. Cloudflare Production의 KV namespace binding에 BOARD_POSTS를 추가한 뒤 재배포해주세요.',
      posts: []
    }, 503);
  }

  try {
    const posts = await listBoardPosts(env, { publicOnly: false });
    return json({ ok: true, storageConfigured: true, posts });
  } catch (error) {
    const code = String(error?.message || '');
    if (code === 'BOARD_STORE_NOT_CONFIGURED') {
      return json({
        ok: false,
        code,
        error: '게시판 KV 저장소가 연결되지 않았습니다. Cloudflare Production의 KV namespace binding에 BOARD_POSTS를 추가한 뒤 재배포해주세요.',
        posts: []
      }, 503);
    }
    return json({
      ok: false,
      code: 'BOARD_STORE_READ_FAILED',
      error: '게시판 저장소에는 연결됐지만 질문 목록을 읽지 못했습니다. KV 바인딩 대상 namespace를 확인해주세요.',
      posts: []
    }, 500);
  }
}
