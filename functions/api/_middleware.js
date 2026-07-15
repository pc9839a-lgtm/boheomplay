import { dailyBoardPosts20260713 } from '../_qa-2026-07-13.js';
import { dailyBoardPosts20260714 } from '../_qa-2026-07-14.js';
import { dailyBoardPosts20260715 } from '../_qa-2026-07-15.js';

function mergeDaily(posts) {
  const seen = new Set();
  return (Array.isArray(posts) ? posts : [])
    .concat(dailyBoardPosts20260715)
    .concat(dailyBoardPosts20260714)
    .concat(dailyBoardPosts20260713)
    .filter((post) => {
      const key = post?.slug || post?.id || post?.href || post?.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  try {
    if (!context.env.BOARD_POSTS && context.env.SECURITY_STORE) {
      context.env.BOARD_POSTS = context.env.SECURITY_STORE;
    }
  } catch (error) {
    // The endpoint itself returns the real storage configuration error.
  }

  const response = await context.next();

  // Never replace POST failures with a fake success response.
  if (context.request.method !== 'GET' || url.pathname !== '/api/board-posts') {
    return response;
  }

  try {
    const data = await response.clone().json();
    if (!response.ok || !data || data.ok !== true) return response;

    const headers = new Headers(response.headers);
    headers.set('content-type', 'application/json; charset=utf-8');
    headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');

    return new Response(JSON.stringify({ ...data, posts: mergeDaily(data.posts) }), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    return response;
  }
}
