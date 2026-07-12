import { questions, renderQuestionPage, renderNotFound, htmlResponse } from '../_render.js';
import { extraQuestions, renderExtraQuestionPage } from '../_extra-qa.js';
import { dailyQuestions20260713, renderDailyQuestionPage20260713 } from '../_qa-2026-07-13.js';

export async function onRequest(context) {
  const slug = String(context.params.slug || '').trim();

  const dailyQuestion = dailyQuestions20260713.find((item) => item.slug === slug);
  if (dailyQuestion) return htmlResponse(renderDailyQuestionPage20260713(dailyQuestion));

  const extraQuestion = extraQuestions.find((item) => item.slug === slug);
  if (extraQuestion) return htmlResponse(renderExtraQuestionPage(extraQuestion));

  const question = questions.find((item) => item.slug === slug);
  if (!question) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderQuestionPage(question));
}
