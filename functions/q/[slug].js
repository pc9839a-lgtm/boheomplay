import { questions, renderQuestionPage, renderNotFound, htmlResponse } from '../_render.js';

export async function onRequest(context) {
  const slug = context.params.slug;
  const question = questions.find((item) => item.slug === slug);
  if (!question) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderQuestionPage(question));
}
