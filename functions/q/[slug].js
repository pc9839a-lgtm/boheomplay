import { questions, renderQuestionPage, renderNotFound, htmlResponse } from '../_render.js';
import { extraQuestions, renderExtraQuestionPage } from '../_extra-qa.js';

export async function onRequest(context) {
  const slug = String(context.params.slug || '').trim();

  const extraQuestion = extraQuestions.find((item) => item.slug === slug);
  if (extraQuestion) return htmlResponse(renderExtraQuestionPage(extraQuestion));

  const question = questions.find((item) => item.slug === slug);
  if (!question) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderQuestionPage(question));
}
