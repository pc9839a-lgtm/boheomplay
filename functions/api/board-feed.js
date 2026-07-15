import { extraBoardPosts } from '../_extra-qa.js';

const STORE_KEY = 'board:all-posts:v2';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      'x-board-feed-version': 'restore-v1'
    }
  });
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

function publicPost(post) {
  return {
    id: post.slug,
    slug: post.slug,
    no: post.no,
    category: post.category,
    title: post.title,
    message: post.message,
    nickname: post.nickname || '익명',
    status: post.answer ? '답변완료' : '답변대기',
    time: displayTime(post.createdAt),
    href: `/board/${post.slug}`,
    answer: post.answer || ''
  };
}

function mergePosts(...groups) {
  const seen = new Set();
  return groups.flat().filter((post) => {
    const key = post?.slug || post?.id || post?.href || post?.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function onRequestGet({ env }) {
  const kv = env?.BOARD_POSTS || env?.SECURITY_STORE || null;
  let userPosts = [];

  if (kv) {
    try {
      const raw = await kv.get(STORE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        userPosts = parsed
          .filter((post) => post && !post.deleted && post.visibility !== 'private')
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .map(publicPost);
      }
    } catch (error) {
      userPosts = [];
    }
  }

  return json({
    ok: true,
    userPostCount: userPosts.length,
    posts: mergePosts(userPosts, extraBoardPosts)
  });
}
