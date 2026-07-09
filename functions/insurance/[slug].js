import { categories, renderCategoryPage, renderNotFound, htmlResponse } from '../_render.js';

export async function onRequest(context) {
  const slug = context.params.slug;
  const category = categories.find((item) => item.slug === slug);
  if (!category) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderCategoryPage(category));
}
