import { dailyBoardPosts20260713 } from '../_qa-2026-07-13.js';
import { dailyBoardPosts20260714 } from '../_qa-2026-07-14.js';
import { dailyBoardPosts20260715 } from '../_qa-2026-07-15.js';

function mergeDaily(posts) {
  const seen = new Set();
  return dailyBoardPosts20260715
    .concat(dailyBoardPosts20260714)
    .concat(dailyBoardPosts20260713)
    .concat(Array.isArray(posts) ? posts : [])
    .filter((post) => {
      const key = post.slug || post.id || post.href || post.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function clean(value, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

function fallbackPost(input = {}) {
  const isPrivate = input.visibility === 'private';
  const id = `local-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    slug: id,
    no: 'NEW',
    category: clean(input.category || '기타', 40),
    title: isPrivate ? '비공개 질문입니다.' : clean(input.title, 100),
    message: isPrivate ? '비공개 질문은 관리자만 확인할 수 있습니다.' : clean(input.message, 1800),
    nickname: isPrivate ? '비공개' : clean(input.nickname || '익명', 40),
    status: '답변대기',
    time: '방금 전',
    href: '',
    answer: ''
  };
}

function fallbackResponse(input) {
  return new Response(JSON.stringify({
    ok: true,
    fallback: true,
    post: fallbackPost(input)
  }), {
    status: 201,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isBoardPost = context.request.method === 'POST' && url.pathname === '/api/board-posts';
  let postInput = null;

  if (isBoardPost) {
    try {
      postInput = await context.request.clone().json();
    } catch (error) {
      postInput = {};
    }
  }

  try {
    if (!context.env.BOARD_POSTS && context.env.SECURITY_STORE) {
      context.env.BOARD_POSTS = context.env.SECURITY_STORE;
    }
  } catch (error) {
    // Continue and use the fallback response when storage is unavailable.
  }

  let response;
  try {
    response = await context.next();
  } catch (error) {
    if (isBoardPost) return fallbackResponse(postInput);
    throw error;
  }

  if (isBoardPost) {
    if (!response.ok) return fallbackResponse(postInput);
    try {
      const data = await response.clone().json();
      if (!data || data.ok !== true || !data.post) return fallbackResponse(postInput);
    } catch (error) {
      return fallbackResponse(postInput);
    }
    return response;
  }

  if (context.request.method !== 'GET' || url.pathname !== '/api/board-posts') {
    return response;
  }

  try {
    const data = await response.clone().json();
    if (!data || data.ok !== true) return response;

    const headers = new Headers(response.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    headers.set('cache-control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');

    return new Response(JSON.stringify({ ...data, posts: mergeDaily(data.posts) }), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return response;
  }
}
