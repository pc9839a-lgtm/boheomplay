import { SITE } from './_content.js';

const BASE = 'https://boheomplay.pagero.kr';
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const nl = (value = '') => esc(value).replace(/\n/g, '<br/>');
const safeJson = (value) => JSON.stringify(value)
  .replace(/&/g, '\u0026')
  .replace(/</g, '\u003c')
  .replace(/>/g, '\u003e');

export function renderUnifiedQuestionPage(item, related = []) {
  const path = item.path || `/q/${item.slug}`;
  const canonical = `${BASE}${path}`;
  const updatedAt = item.updatedAt || SITE.lastUpdated;
  const hasAnswer = item.hasAnswer !== false;
  const statusLabel = item.statusLabel || (hasAnswer ? '답변완료' : '답변대기');
  const description = String(item.lead || item.question || item.title).replace(/\s+/g, ' ').slice(0, 155);
  const answerText = [item.lead, item.point, ...(item.bullets || []), item.close].filter(Boolean).join('\n\n');
  const schemas = [{
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: item.title,
      text: item.question,
      answerCount: hasAnswer ? 1 : 0,
      ...(hasAnswer ? {
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerText,
          dateCreated: updatedAt,
          author: { '@type': 'Organization', name: SITE.name }
        }
      } : {})
    }
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: '질문게시판', item: `${BASE}/#board` },
      { '@type': 'ListItem', position: 3, name: item.title, item: canonical }
    ]
  }];

  const sourceBlock = Array.isArray(item.sources) && item.sources.length
    ? `<div class="answer-sources"><strong>공식 경로 확인</strong><div>${item.sources.map((source) => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer nofollow">${esc(source.label)}</a>`).join('<span>·</span>')}</div><small>확인일: ${esc(updatedAt)}</small></div>`
    : '';
  const companyLink = item.companySlug && item.companyName
    ? `<a class="company-link" href="/company/${esc(item.companySlug)}">${esc(item.companyName)} 정보 페이지</a>`
    : '';
  const pointBlock = item.point ? `<div class="answer-point">${nl(item.point)}</div>` : '';
  const bulletBlock = Array.isArray(item.bullets) && item.bullets.length
    ? `<div class="answer-subtitle">먼저 봐야 할 부분</div><ul>${item.bullets.map((bullet) => `<li>${nl(bullet)}</li>`).join('')}</ul>`
    : '';
  const closeBlock = item.close ? `<p>${nl(item.close)}</p>` : '';
  const answerBlock = hasAnswer
    ? `<p>${nl(item.lead)}</p>${pointBlock}${bulletBlock}${closeBlock}${sourceBlock}`
    : `<p>${nl(item.lead || '질문이 정상적으로 접수되었습니다. 아직 답변이 등록되지 않았습니다.')}</p>${pointBlock}${bulletBlock}${closeBlock}`;
  const relatedBlock = related.length
    ? `<section class="thread-related"><h2>관련 질문</h2><div class="thread-related-list">${related.map((entry) => `<a href="${esc(entry.href || `/q/${entry.slug}`)}">${esc(entry.title)}</a>`).join('')}</div></section>`
    : '';

  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${esc(item.title)} | ${esc(SITE.name)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(item.title)} | ${esc(SITE.name)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta property="og:image" content="${BASE}/og-image"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260715-unified-question-v3"/><style>
.thread-page{background:#fff}.thread-view{padding:58px 0 82px}.thread-wrap{max-width:920px}.thread-breadcrumb{margin-bottom:28px;color:#777;font-size:13px;font-weight:700}.thread-breadcrumb a{text-decoration:none;color:#555}.question-post{padding:0 0 34px;border-bottom:1px solid #e5e5e5}.thread-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;color:#777;font-size:13px}.thread-meta span{display:inline-flex;align-items:center}.question-post h1{margin:0;font-size:clamp(34px,5.2vw,58px);line-height:1.12;letter-spacing:-.07em}.question-body{margin-top:30px;color:#222;font-size:18px;line-height:1.95}.company-link{display:inline-flex;margin-top:22px;padding:11px 14px;border:1px solid #ddd;color:#111;text-decoration:none;font-size:14px;font-weight:850}.thread-actions{display:flex;justify-content:space-between;align-items:center;margin-top:34px;color:#222;font-size:15px}.thread-actions-left,.thread-actions-right{display:flex;gap:18px;align-items:center}.answer-post{display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px;margin-top:40px;padding:0 0 0 16px}.answer-post>article{min-width:0}.answer-avatar{width:42px;height:42px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:14px;font-weight:900}.answer-meta{margin-bottom:16px}.answer-meta strong{display:block;font-size:15px}.answer-meta span{display:block;margin-top:3px;color:#777;font-size:13px}.answer-content{color:#111;font-size:17px;line-height:1.95}.answer-content p{margin:0 0 20px}.answer-content ul{margin:0 0 24px;padding-left:20px}.answer-content li{margin:8px 0}.answer-point{margin:24px 0;padding:20px 22px;border:1px solid #e5e5e5;background:#f8f8f8;font-weight:850;line-height:1.75}.answer-subtitle{margin:28px 0 12px;font-weight:900;font-size:18px}.answer-sources{margin:26px 0 0;padding:18px 20px;border:1px solid #e5e5e5;background:#fafafa;color:#555;font-size:14px;line-height:1.7}.answer-sources strong{display:block;margin-bottom:8px;color:#111}.answer-sources div{display:flex;gap:8px;flex-wrap:wrap}.answer-sources a{color:#111;font-weight:800;text-underline-offset:3px}.answer-sources small{display:block;margin-top:8px;color:#777}.thread-related{margin-top:54px;padding-top:30px;border-top:1px solid #e5e5e5}.thread-related h2{margin:0 0 16px;font-size:22px}.thread-related-list{display:grid;gap:10px}.thread-related-list a{display:block;padding:15px 16px;border:1px solid #e5e5e5;color:#111;text-decoration:none;font-weight:750}.thread-related-list a:hover{background:#f7f7f7}@media(max-width:720px){.thread-view{padding:40px 0 64px}.answer-post{grid-template-columns:1fr;padding-left:0}.answer-avatar{width:38px;height:38px}.thread-actions{align-items:flex-start;gap:18px}.question-body,.answer-content{font-size:16px}}
</style>${schemas.map((value) => `<script type="application/ld+json">${safeJson(value)}</script>`).join('')}</head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${esc(SITE.name)}</a><button class="menu-btn" type="button" aria-label="메뉴 열기" data-menu-toggle><span></span><span></span><span></span></button><nav class="nav" data-nav><a href="/#board">질문게시판</a><a href="/#write">질문남기기</a></nav></div></header><main class="thread-page"><section class="thread-view"><div class="wrap thread-wrap"><div class="thread-breadcrumb"><a href="/">홈</a> / <a href="/#board">질문게시판</a> / ${esc(item.category || '보험정보')}</div><section class="question-post"><div class="thread-meta"><span>${esc(item.category || '보험정보')}</span><span>${esc(item.nickname || '익명')}</span><span>업데이트 ${esc(updatedAt)}</span><span>${esc(statusLabel)}</span></div><h1>${esc(item.title)}</h1><div class="question-body">${nl(item.question)}</div>${companyLink}<div class="thread-actions"><div class="thread-actions-left"><span>♡ 0</span><span>💬 ${hasAnswer ? '1' : '0'}</span></div><div class="thread-actions-right"><span>공유</span><span>저장</span></div></div></section><div class="answer-post"><div class="answer-avatar">보</div><article><div class="answer-meta"><strong>${esc(SITE.name)} 답변</strong><span>업데이트 ${esc(updatedAt)}</span></div><div class="answer-content">${answerBlock}</div></article></div>${relatedBlock}</div></section></main><footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/insurance-notice/">보험정보 이용안내</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer><script src="/assets/js/main.js?v=20260715-unified-question-v3"></script></body></html>`;
}
