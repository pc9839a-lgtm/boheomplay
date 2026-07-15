import { getBoardPost, html } from '../_board.js';
import { renderUnifiedQuestionPage } from '../_unified-question.js';
import { questions, renderNotFound } from '../_render.js';
import { extraQuestions } from '../_extra-qa.js';
import { dailyQuestions } from '../_daily-questions.js';
import { stripUnsafeControls } from '../_security.js';

function safeStoredText(value = '', max = 3_000) {
  return stripUnsafeControls(value)
    .replace(/[<>]/g, '')
    .slice(0, max);
}

function formatDate(value) {
  const date = new Date(value || 0);
  if (!Number.isFinite(date.getTime())) return '방금 전';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function splitLines(value) {
  return String(value || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function stripBullet(value) {
  return value.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, '').trim();
}

function structureAnswer(answer) {
  const raw = String(answer || '').trim();
  if (!raw) {
    return {
      hasAnswer: false,
      lead: '질문이 정상적으로 접수되었습니다. 아직 답변이 등록되지 않았습니다.',
      point: '현재 답변대기 상태입니다.',
      bullets: [
        '관리자가 질문 내용을 확인한 뒤 답변을 등록합니다.',
        '답변 전에는 특정 상품의 가입 가능 여부를 확정할 수 없습니다.'
      ],
      close: '답변이 등록되면 같은 질문 상세페이지에서 확인할 수 있습니다.'
    };
  }

  const lines = splitLines(raw);
  const explicitBullets = lines
    .filter((line) => /^\s*(?:[-*•·]|\d+[.)])\s+/.test(line))
    .map(stripBullet)
    .filter(Boolean)
    .slice(0, 5);
  const prose = lines.filter((line) => !/^\s*(?:[-*•·]|\d+[.)])\s+/.test(line));
  const leadLines = prose.slice(0, Math.min(2, prose.length));
  const remaining = prose.slice(leadLines.length);
  const point = remaining[0] || '';
  const close = remaining.length > 1
    ? remaining[remaining.length - 1]
    : '보험 가입·변경·해지 전에는 현재 계약의 약관과 상품설명서, 개인별 심사 조건을 함께 확인하세요.';
  const middle = remaining.length > 2 ? remaining.slice(1, -1) : [];
  const bullets = explicitBullets.length ? explicitBullets : middle.slice(0, 5);

  return {
    hasAnswer: true,
    lead: leadLines.join('\n\n') || raw,
    point,
    bullets,
    close
  };
}

function categoryOf(item) {
  return item?.category || item?.cn || '보험정보';
}

function relatedFor(post) {
  const seen = new Set([post.slug]);
  return dailyQuestions
    .concat(extraQuestions)
    .concat(questions)
    .filter((item) => {
      if (!item?.slug || seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .sort((a, b) => Number(categoryOf(b) === post.category) - Number(categoryOf(a) === post.category))
    .slice(0, 6)
    .map((item) => ({ slug: item.slug, title: item.title, href: `/q/${item.slug}` }));
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
    const sections = structureAnswer(safePost.answer);

    return html(renderUnifiedQuestionPage({
      slug: safePost.slug,
      path: `/board/${safePost.slug}`,
      title: safePost.title,
      category: safePost.category,
      nickname: safePost.nickname,
      question: safePost.message,
      updatedAt: formatDate(safePost.updatedAt || safePost.createdAt),
      statusLabel: sections.hasAnswer ? '답변완료' : '답변대기',
      ...sections
    }, relatedFor(safePost)));
  } catch (error) {
    return html(renderNotFound(), 404);
  }
}
