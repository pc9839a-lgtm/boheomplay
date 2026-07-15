import { requireAdmin, json } from '../_admin-auth.js';

const STORE_KEY = 'board:all-posts:v2';

function displayTime(createdAt) {
  if (!createdAt) return '방금 전';
  const diff = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const date = new Date(createdAt);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function toAdmin(post) {
  return {
    ...post,
    id: post.slug,
    status: post.answer ? '답변완료' : '답변대기',
    time: displayTime(post.createdAt),
    href: post.visibility === 'private' ? '' : `/board/${post.slug}`
  };
}

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false, error: '관리자 로그인이 만료되었습니다.' }, 401);
  }

  const kv = env?.BOARD_POSTS || env?.SECURITY_STORE || null;
  if (!kv) {
    return json({
      ok: false,
      code: 'BOARD_STORE_NOT_CONFIGURED',
      error: '게시판 KV 저장소가 연결되지 않았습니다.',
      posts: []
    }, 503);
  }

  try {
    const raw = await kv.get(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const posts = (Array.isArray(parsed) ? parsed : [])
      .filter((post) => post && !post.deleted && post.slug)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .map(toAdmin);

    return json({
      ok: true,
      storageConfigured: true,
      storageKey: STORE_KEY,
      postCount: posts.length,
      posts
    });
  } catch (error) {
    return json({
      ok: false,
      code: 'BOARD_STORE_READ_FAILED',
      detail: String(error?.message || 'UNKNOWN_ERROR'),
      error: '게시판 저장소에서 질문 목록을 읽지 못했습니다.',
      posts: []
    }, 500);
  }
}
