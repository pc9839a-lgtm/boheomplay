import { questions, categories, renderNotFound, htmlResponse } from '../_render.js';
import { extraQuestions } from '../_extra-qa.js';
import { dailyQuestions } from '../_daily-questions.js';
import { renderUnifiedQuestionPage } from '../_unified-question.js';
import { decodePreviewToken } from '../_preview-token.js';

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

function preventDuplicateNotice(html) {
  return html.replace('</head>', '<style>.thread-page .answer-compliance-note{display:none!important}</style></head>');
}

function safeScriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function normalizeBase(item) {
  const summary = Array.isArray(item.summary) ? item.summary.filter(Boolean) : [];
  const checks = Array.isArray(item.checks) ? item.checks.filter(Boolean) : [];
  const category = categories.find((entry) => entry.slug === item.category)?.name || item.category || '보험정보';
  return {
    slug: item.slug,
    title: item.title,
    category,
    question: `${item.title}\n\n${item.audience || '현재 보험을 확인하는 분'} 기준으로 어떤 내용을 먼저 확인해야 하는지 궁금합니다.`,
    lead: summary.slice(0, 2).join('\n\n') || `${item.title}에 관한 일반적인 확인 기준을 살펴봅니다.`,
    point: summary[0] || item.title,
    bullets: checks.concat(summary.slice(1)).slice(0, 5),
    close: summary[2] || '보험 가입·변경·해지 전에는 현재 계약과 약관, 개인 조건을 함께 확인해야 합니다.'
  };
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

function responseFor(item, normalized) {
  return htmlResponse(preventDuplicateNotice(renderUnifiedQuestionPage(normalized, relatedFor(item))));
}

function previewResponse(context) {
  const url = new URL(context.request.url);
  const data = decodePreviewToken(url.searchParams.get('d'));
  const title = String(data?.title || '').trim().slice(0, 100);
  const message = String(data?.message || '').trim().slice(0, 1800);
  if (!data || !title || !message) return htmlResponse(renderNotFound(), 404);

  const category = String(data.category || '기타').slice(0, 40);
  const id = String(data.id || `local-${Date.now().toString(36)}`).slice(0, 80);
  const item = {
    slug: id,
    title,
    category,
    question: message,
    lead: '질문이 정상적으로 접수되었습니다. 아직 답변이 등록되지 않았습니다.',
    point: '관리자 확인 후 답변이 등록되면 이 질문에서 확인할 수 있습니다.',
    bullets: [
      '질문 내용은 공개 게시 기준으로 접수되었습니다.',
      '답변 전에는 특정 보험상품의 가입 가능 여부를 확정할 수 없습니다.',
      '개인정보나 민감정보가 포함됐다면 관리자에게 삭제를 요청하세요.'
    ],
    close: '답변이 등록될 때까지 질문 내용을 다시 확인해 주세요.',
    updatedAt: '방금 전'
  };

  let html = preventDuplicateNotice(renderUnifiedQuestionPage(item, relatedFor(item)))
    .replace('content="index,follow,max-image-preview:large"', 'content="noindex,nofollow"');

  const storedPost = {
    id,
    slug: id,
    no: 'NEW',
    category,
    title,
    message,
    nickname: String(data.nickname || '익명').slice(0, 40),
    status: '답변대기',
    time: '방금 전',
    href: `${url.pathname}${url.search}`,
    answer: ''
  };
  const saveScript = `<script>try{const key='boheomplay_board_posts_v2';const post=${safeScriptJson(storedPost)};const old=JSON.parse(localStorage.getItem(key)||'[]');const list=Array.isArray(old)?old:[];localStorage.setItem(key,JSON.stringify([post,...list.filter(item=>(item.id||item.slug)!==post.id)].slice(0,30)));}catch(error){}</script>`;
  html = html.replace('</body>', `${saveScript}</body>`);

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow, noarchive'
    }
  });
}

export async function onRequest(context) {
  const slug = String(context.params.slug || '').trim();

  if (slug === 'local-preview') return previewResponse(context);

  const daily = dailyQuestions.find((item) => item.slug === slug);
  if (daily) return responseFor(daily, normalizeDaily(daily));

  const extra = extraQuestions.find((item) => item.slug === slug);
  if (extra) return responseFor(extra, normalizeExtra(extra));

  const question = questions.find((item) => item.slug === slug);
  if (!question) return htmlResponse(renderNotFound(), 404);
  return responseFor(question, normalizeBase(question));
}
