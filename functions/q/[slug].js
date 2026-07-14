import { questions, renderQuestionPage, renderNotFound, htmlResponse } from '../_render.js';
import { extraQuestions, renderExtraQuestionPage } from '../_extra-qa.js';
import { dailyQuestions20260713, renderDailyQuestionPage20260713 } from '../_qa-2026-07-13.js';
import { dailyQuestions20260714, renderDailyQuestionPage20260714 } from '../_qa-2026-07-14.js';
import { dailyQuestions20260715, renderDailyQuestionPage20260715 } from '../_qa-2026-07-15.js';

export async function onRequest(context) {
  const slug = String(context.params.slug || '').trim();

  const dailyQuestion20260715 = dailyQuestions20260715.find((item) => item.slug === slug);
  if (dailyQuestion20260715) return htmlResponse(renderDailyQuestionPage20260715(dailyQuestion20260715));

  const dailyQuestion20260714 = dailyQuestions20260714.find((item) => item.slug === slug);
  if (dailyQuestion20260714) return htmlResponse(renderDailyQuestionPage20260714(dailyQuestion20260714));

  const dailyQuestion20260713 = dailyQuestions20260713.find((item) => item.slug === slug);
  if (dailyQuestion20260713) return htmlResponse(renderDailyQuestionPage20260713(dailyQuestion20260713));

  const extraQuestion = extraQuestions.find((item) => item.slug === slug);
  if (extraQuestion) return htmlResponse(renderExtraQuestionPage(extraQuestion));

  const question = questions.find((item) => item.slug === slug);
  if (!question) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderQuestionPage(question));
}
