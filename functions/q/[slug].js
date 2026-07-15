import { questions, renderQuestionPage, renderNotFound, htmlResponse } from '../_render.js';
import { extraQuestions } from '../_extra-qa.js';
import { dailyQuestions } from '../_daily-questions.js';
import { renderUnifiedQuestionPage } from '../_unified-question.js';

const KLIA = 'https://www.klia.or.kr/klia/company/member/list.do';

function relatedFor(current) {
  const seen = new Set([current.slug]);
  return dailyQuestions
    .concat(extraQuestions)
    .concat(questions)
    .filter((item) => {
      if (!item?.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .sort((a, b) => {
      const aCompany = current.cs && a.cs === current.cs ? 2 : 0;
      const bCompany = current.cs && b.cs === current.cs ? 2 : 0;
      const aCategory = (a.category || a.cn) === (current.category || current.cn) ? 1 : 0;
      const bCategory = (b.category || b.cn) === (current.category || current.cn) ? 1 : 0;
      return (bCompany + bCategory) - (aCompany + aCategory);
    })
    .slice(0, 6)
    .map((item) => ({ slug: item.slug, title: item.title }));
}

function normalizeExtra(item) {
  return {
    slug: item.slug,
    title: item.title,
    category: item.category || '보험정보',
    question: item.question,
    lead: item.lead,
    point: item.point,
    bullets: item.bullets || [],
    close: item.close,
    updatedAt: '2026-07-12'
  };
}

function normalizeDaily(item) {
  return {
    slug: item.slug,
    title: item.title,
    category: item.cn || '생명보험',
    question: Array.isArray(item.q) ? item.q.join('\n\n') : String(item.q || ''),
    lead: Array.isArray(item.a) ? item.a.join('\n\n') : String(item.a || ''),
    point: item.p || '',
    bullets: Array.isArray(item.c) ? item.c : [],
    close: item.z || '',
    updatedAt: item.updatedAt,
    companyName: item.cn,
    companySlug: item.cs,
    sources: [
      item.url ? { label: `${item.cn} 공식 홈페이지`, url: item.url } : null,
      { label: '생명보험협회 회원사 안내', url: KLIA }
    ].filter(Boolean)
  };
}

export async function onRequest(context) {
  const slug = String(context.params.slug || '').trim();

  const daily = dailyQuestions.find((item) => item.slug === slug);
  if (daily) {
    return htmlResponse(renderUnifiedQuestionPage(normalizeDaily(daily), relatedFor(daily)));
  }

  const extra = extraQuestions.find((item) => item.slug === slug);
  if (extra) {
    return htmlResponse(renderUnifiedQuestionPage(normalizeExtra(extra), relatedFor(extra)));
  }

  const question = questions.find((item) => item.slug === slug);
  if (!question) return htmlResponse(renderNotFound(), 404);
  return htmlResponse(renderQuestionPage(question));
}
