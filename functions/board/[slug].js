import { getBoardPost, renderBoardPost, html } from '../_board.js';
import { renderNotFound } from '../_render.js';
import { stripUnsafeControls } from '../_security.js';

function safeStoredText(value = '', max = 3_000) {
  return stripUnsafeControls(value)
    .replace(/[<>]/g, '')
    .slice(0, max);
}

export async function onRequest(context) {
  try {
    const slug = String(context.params.slug || '').toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{8,100}$/.test(slug)) return html(renderNotFound(), 404);

    const post = await getBoardPost(context.env, slug, { includePrivate: false });
    if (!post) return html(renderNotFound(), 404);

    const safePost = {
      ...post,
      category: safeStoredText(post.category, 40),
      title: safeStoredText(post.title, 100),
      message: safeStoredText(post.message, 1_800),
      nickname: safeStoredText(post.nickname || '익명', 40),
      answer: safeStoredText(post.answer || '', 3_000)
    };

    return html(renderBoardPost(safePost));
  } catch (error) {
    return html(renderNotFound(), 404);
  }
}
