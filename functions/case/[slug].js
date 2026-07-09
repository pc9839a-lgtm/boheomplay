import { cases, renderCasePage, renderNotFound, htmlResponse } from '../_render.js';

export async function onRequest(context) {
  const slug = context.params.slug;
  const item = cases.find((caseItem) => caseItem.slug === slug);
  if (!item) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderCasePage(item));
}
