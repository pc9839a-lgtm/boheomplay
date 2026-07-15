import { requireAdmin, json } from '../_admin-auth.js';
import { listBoardPosts } from '../_board.js';

const RECENT_COOKIE = 'bp_recent_board';
const POST_PREFIX = 'board:post:';

function getCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('=') || '');
  }
  return '';
}

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

async function readRecent(request, env) {
  const slug = getCookie(request, RECENT_COOKIE);
  if (!slug || !env.BOARD_POSTS) return null;
  try {
    const raw = await env.BOARD_POSTS.get(`${POST_PREFIX}${slug}`);
    const post = raw ? JSON.parse(raw) : null;
    return post && !post.deleted ? toAdmin(post) : null;
  } catch (error) {
    return null;
  }
}

function mergePosts(recent, posts) {
  const seen = new Set();
  return [recent, ...(Array.isArray(posts) ? posts : [])].filter((post) => {
    const key = post?.slug || post?.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) {
    return json({ ok: false, error: '관리자 로그인이 만료되었습니다.' }, 401);
  }

  if (!env.BOARD_POSTS) {
    return json({
      ok: false,
      code: 'BOARD_STORE_NOT_CONFIGURED',
      error: '게시판 KV 저장소가 연결되지 않았습니다.',
      posts: []
    }, 503);
  }

  const recent = await readRecent(request, env);

  try {
    const posts = await listBoardPosts(env, { publicOnly: false });
    return json({
      ok: true,
      storageConfigured: true,
      posts: mergePosts(recent, posts)
    });
  } catch (error) {
    if (recent) {
      return json({ ok: true, storageConfigured: true, posts: [recent] });
    }
    return json({
      ok: false,
      code: String(error?.message || 'BOARD_STORE_READ_FAILED'),
      error: '게시판 저장소에는 연결됐지만 질문 목록을 읽지 못했습니다.',
      posts: []
    }, 500);
  }
}
