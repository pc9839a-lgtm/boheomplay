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

export async function onRequest(context) {
  try {
    if (!context.env.BOARD_POSTS && context.env.SECURITY_STORE) {
      context.env.BOARD_POSTS = context.env.SECURITY_STORE;
    }
  } catch (error) {
    // Client fallback handles environments whose binding object is immutable.
  }

  const response = await context.next();
  const url = new URL(context.request.url);

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
