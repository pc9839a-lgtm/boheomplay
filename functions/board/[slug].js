import { getBoardPost, renderBoardPost, renderBoardPost as render, html } from '../_board.js';
import { renderNotFound } from '../_render.js';

export async function onRequest(context) {
  try {
    const slug = context.params.slug;
    const post = await getBoardPost(context.env, slug, { includePrivate: false });
    if (!post) return html(renderNotFound(), 404);
    return html(render(post));
  } catch (error) {
    return html(renderNotFound(), 404);
  }
}
