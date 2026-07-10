import { createBoardPost, listBoardPosts, json } from '../_board.js';

async function readInput(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function onRequestGet({ env }) {
  try {
    const posts = await listBoardPosts(env, { publicOnly: true });
    return json({ ok: true, posts });
  } catch (error) {
    return json({ ok: false, error: error.message, posts: [] }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const input = await readInput(request);
    const post = await createBoardPost(env, input);
    return json({
      ok: true,
      post: {
        id: post.slug,
        slug: post.slug,
        no: post.no,
        category: post.category,
        title: post.visibility === 'private' ? '비공개 질문입니다.' : post.title,
        message: post.visibility === 'private' ? '비공개 질문은 관리자만 확인할 수 있습니다.' : post.message,
        nickname: post.visibility === 'private' ? '비공개' : post.nickname,
        status: '답변대기',
        time: '방금 전',
        href: post.visibility === 'private' ? '' : `/board/${post.slug}`
      }
    });
  } catch (error) {
    return json({ ok: false, error: error.message }, 400);
  }
}
