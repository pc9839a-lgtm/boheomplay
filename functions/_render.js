import { SITE, categories, questions, cases } from './_content.js';

const esc = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const nl = (value = '') => esc(value).replace(/\n/g, '<br/>');
const findCategory = (slug) => categories.find((item) => item.slug === slug) || categories[0];
const absolute = (path = '/') => `${SITE.url}${path === '/' ? '/' : path}`;
const topicQuery = (topic) => encodeURIComponent(topic || '보험 상담');
const contactHref = (topic) => `/?topic=${topicQuery(topic)}#write`;

export function htmlResponse(html, status = 200, type = 'text/html; charset=utf-8') {
  return new Response(html, { status, headers: { 'content-type': type, 'cache-control': 'public, max-age=120' } });
}

function layout({ title, description, path, body, schema = [] }) {
  const canonical = absolute(path);
  const schemaScripts = schema.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n');
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260709-thread-view"/><style>
.thread-page{background:#fff}.thread-view{padding:58px 0 82px}.thread-wrap{max-width:920px}.thread-breadcrumb{margin-bottom:28px;color:#777;font-size:13px;font-weight:700}.thread-breadcrumb a{text-decoration:none;color:#555}.question-post{padding:0 0 34px;border-bottom:1px solid #e5e5e5}.thread-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;color:#777;font-size:13px}.thread-meta span{display:inline-flex;align-items:center}.question-post h1{margin:0;font-size:clamp(34px,5.2vw,58px);line-height:1.12;letter-spacing:-.07em}.question-body{margin-top:30px;color:#222;font-size:18px;line-height:1.9;white-space:normal}.thread-actions{display:flex;justify-content:space-between;align-items:center;margin-top:34px;color:#222;font-size:15px}.thread-actions-left,.thread-actions-right{display:flex;gap:18px;align-items:center}.answer-post{display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px;margin-top:36px;padding:0 0 0 16px}.answer-avatar{width:42px;height:42px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:14px;font-weight:900}.answer-meta{margin-bottom:14px}.answer-meta strong{display:block;font-size:15px}.answer-meta span{display:block;margin-top:3px;color:#777;font-size:13px}.answer-content{color:#111;font-size:17px;line-height:1.9}.answer-content p{margin:0 0 18px}.answer-content ul{margin:0 0 22px;padding-left:20px}.answer-content li{margin:5px 0}.answer-note{margin-top:26px;padding:16px 18px;background:#f7f7f7;border:1px solid #e5e5e5;color:#555;font-size:14px;line-height:1.7}.thread-related{margin-top:54px;padding-top:30px;border-top:1px solid #e5e5e5}.thread-related h2{margin:0 0 16px;font-size:22px}.thread-related-list{display:grid;gap:10px}.thread-related-list a{display:block;padding:15px 16px;border:1px solid #e5e5e5;font-weight:750}.thread-related-list a:hover{background:#f7f7f7}@media(max-width:720px){.thread-view{padding:40px 0 64px}.answer-post{grid-template-columns:1fr;padding-left:0}.answer-avatar{width:38px;height:38px}.thread-actions{align-items:flex-start;gap:18px}.question-body,.answer-content{font-size:16px}}
</style>${schemaScripts}</head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${esc(SITE.name)}</a><button class="menu-btn" type="button" aria-label="메뉴 열기" data-menu-toggle><span></span><span></span><span></span></button><nav class="nav" data-nav><a href="/#board">질문게시판</a><a href="/#write">질문남기기</a></nav></div></header>${body}<footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer><script src="/assets/js/main.js?v=20260709-thread-view"></script></body></html>`;
}

function breadcrumb(items) {
  return `<div class="thread-breadcrumb"><a href="/">홈</a> / ${items.map((item) => item.href ? `<a href="${item.href}">${esc(item.name)}</a>` : esc(item.name)).join(' / ')}</div>`;
}

function relatedQuestions(current) {
  return questions.filter((item) => item.slug !== current.slug).sort((a, b) => (a.category === current.category ? -1 : 1) - (b.category === current.category ? -1 : 1)).slice(0, 6);
}

export function renderQuestionPage(question) {
  const category = findCategory(question.category);
  const path = `/q/${question.slug}`;
  const title = `${question.title} | ${SITE.name}`;
  const description = `${question.summary[0]} ${question.keyword} 관련 질문과 답변을 보험플레이에서 확인하세요.`;
  const related = relatedQuestions(question);
  const questionText = `${question.title}\n\n${question.audience} 기준으로 어떤 점을 먼저 봐야 하는지 궁금합니다.`;
  const answerIntro = `안녕하세요. 보험플레이 답변입니다.\n\n${question.title}에 대해서는 아래 기준으로 먼저 보는 것이 좋습니다.`;
  const answerBody = `${answerIntro}\n\n${question.summary.join('\n')}\n\n상담 전에는 다음 항목을 확인해보세요.\n${question.checks.map((item) => `- ${item}`).join('\n')}\n\n보험은 나이, 병력, 기존 계약 조건에 따라 결과가 달라질 수 있으므로 가입 가능 여부나 보험료를 단정하기보다 현재 조건 기준으로 확인해야 합니다.`;
  const schema = [{
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: questionText,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerBody,
        dateCreated: SITE.lastUpdated,
        author: { '@type': 'Organization', name: SITE.name }
      }
    }
  },{
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'홈',item:absolute('/')},
      {'@type':'ListItem',position:2,name:'질문게시판',item:absolute('/#board')},
      {'@type':'ListItem',position:3,name:question.title,item:absolute(path)}
    ]
  }];

  const body = `<main class="thread-page"><section class="thread-view"><div class="wrap thread-wrap">${breadcrumb([{name:'질문게시판',href:'/#board'},{name:category.name},{name:question.title}])}<article class="question-post"><div class="thread-meta"><span>${esc(category.name)}</span><span>익명</span><span>업데이트 ${esc(SITE.lastUpdated)}</span></div><h1>${esc(question.title)}</h1><div class="question-body">${nl(questionText)}</div><div class="thread-actions"><div class="thread-actions-left"><span>♡ 0</span><span>💬 1</span></div><div class="thread-actions-right"><span>공유</span><span>저장</span></div></div></article><article class="answer-post"><div class="answer-avatar">보</div><div><div class="answer-meta"><strong>${esc(SITE.name)} 답변</strong><span>업데이트 ${esc(SITE.lastUpdated)}</span></div><div class="answer-content"><p>${nl(answerIntro)}</p><ul>${question.summary.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><p>상담 전에는 다음 항목을 확인해보세요.</p><ul>${question.checks.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><p>보험은 나이, 병력, 기존 계약 조건에 따라 결과가 달라질 수 있으므로 가입 가능 여부나 보험료를 단정하기보다 현재 조건 기준으로 확인해야 합니다.</p><div class="answer-note">본 답변은 일반적인 정보 제공 목적입니다. 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 함께 확인해야 합니다.</div></div></div></article><section class="thread-related"><h2>관련 질문</h2><div class="thread-related-list">${related.map((item) => `<a href="/q/${item.slug}">${esc(item.title)}</a>`).join('')}</div></section></div></section></main>`;
  return layout({ title, description, path, body, schema });
}

export function renderCategoryPage(category) {
  const path = `/insurance/${category.slug}`;
  const title = `${category.name} 질문 모음 | ${SITE.name}`;
  const description = `${category.description} 자주 묻는 질문을 확인해보세요.`;
  const items = questions.filter((item) => item.category === category.slug);
  const schema = [{ '@context':'https://schema.org','@type':'CollectionPage',name:title,description,url:absolute(path) }];
  const body = `<main><section class="content-hero"><div class="wrap">${breadcrumb([{name:category.name}])}<h1>${esc(category.name)} 질문 모음</h1><p>${esc(description)}</p></div></section><section class="section"><div class="wrap content-layout"><article class="article-card"><h2>${esc(category.name)} 질문</h2><div class="list-grid">${items.map((item) => `<a href="/q/${item.slug}">${esc(item.title)}<small>${esc(item.keyword)} · ${esc(item.audience)}</small></a>`).join('')}</div></article><aside class="side-card"><h3>질문 남기기</h3><p>내 상황에 맞는 질문을 남겨보세요.</p><a class="btn" href="${contactHref(category.topic)}">질문 남기기</a></aside></div></section></main>`;
  return layout({ title, description, path, body, schema });
}

export function renderCasePage(item) {
  const path = `/case/${item.slug}`;
  const title = `${item.title} | ${SITE.name}`;
  const description = `${item.description} 보험 질문 전 확인해야 할 기준을 정리했습니다.`;
  const related = questions.filter((q) => q.category === categories.find((c) => c.topic === item.topic)?.slug).slice(0, 5);
  const body = `<main><section class="content-hero"><div class="wrap">${breadcrumb([{name:'상황별 보험 질문'},{name:item.title}])}<h1>${esc(item.title)}</h1><p>${esc(description)}</p></div></section><div class="wrap content-layout"><article class="article-card"><h2>확인할 것</h2><ul>${item.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul><p>${esc(item.description)}</p><div class="notice">보험료와 가입 가능 여부는 개인 조건에 따라 달라질 수 있습니다. 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 확인해야 합니다.</div></article><aside class="side-card"><h3>관련 질문</h3><div class="related-list">${related.map((q) => `<a href="/q/${q.slug}">${esc(q.title)}</a>`).join('')}</div></aside></div></main>`;
  return layout({ title, description, path, body, schema: [{ '@context':'https://schema.org','@type':'Article',name:item.title,description,url:absolute(path) }] });
}

export function renderNotFound() {
  const body = `<main class="not-found"><div class="wrap"><h1>페이지를 찾을 수 없습니다</h1><p>보험 질문 게시판에서 필요한 내용을 다시 확인해보세요.</p><a class="btn" href="/">홈으로 이동</a></div></main>`;
  return layout({ title:`페이지를 찾을 수 없습니다 | ${SITE.name}`, description:'요청하신 보험플레이 페이지를 찾을 수 없습니다.', path:'/404', body });
}

export { categories, questions, cases, SITE };
