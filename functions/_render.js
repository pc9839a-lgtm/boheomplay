import { SITE, categories, questions, cases } from './_content.js';

const esc = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const findCategory = (slug) => categories.find((item) => item.slug === slug) || categories[0];
const absolute = (path = '/') => `${SITE.url}${path === '/' ? '/' : path}`;
const topicQuery = (topic) => encodeURIComponent(topic || '보험 상담');
const contactHref = (topic) => `/?topic=${topicQuery(topic)}#contact`;

export function htmlResponse(html, status = 200, type = 'text/html; charset=utf-8') {
  return new Response(html, { status, headers: { 'content-type': type, 'cache-control': 'public, max-age=300' } });
}

function layout({ title, description, path, body, schema = [] }) {
  const canonical = absolute(path);
  const schemaScripts = schema.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join('\n');
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260709-seo"/>${schemaScripts}</head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/"><span class="brand-mark">B</span><strong>${esc(SITE.name)}</strong></a><button class="menu-btn" type="button" aria-label="메뉴 열기" data-menu-toggle><span></span><span></span><span></span></button><nav class="nav" data-nav><a href="/#questions">보험 질문</a><a href="/#categories">카테고리</a><a href="/#contact" class="nav-cta">상담 신청</a></nav></div></header>${body}<footer class="footer"><div class="wrap footer-grid"><div><strong>${esc(SITE.company)}</strong><p>대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><p>본 페이지는 일반적인 보험 정보 및 상담 연결 안내입니다. 특정 상품 가입을 권유하거나 보험료·보장 내용·가입 가능성을 확정하지 않습니다.</p></div><nav><a href="/about/">소개</a><a href="/contact/">상담문의</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer><div class="sticky-cta"><a href="/#contact">보험 상담 신청</a></div><script src="/assets/js/main.js?v=20260709-seo"></script></body></html>`;
}

function breadcrumb(items) {
  return `<div class="breadcrumb"><a href="/">홈</a> / ${items.map((item) => item.href ? `<a href="${item.href}">${esc(item.name)}</a>` : esc(item.name)).join(' / ')}</div>`;
}

function relatedQuestions(current) {
  return questions.filter((item) => item.slug !== current.slug).sort((a, b) => (a.category === current.category ? -1 : 1) - (b.category === current.category ? -1 : 1)).slice(0, 6);
}

export function renderQuestionPage(question) {
  const category = findCategory(question.category);
  const path = `/q/${question.slug}`;
  const title = `${question.title} | ${SITE.name}`;
  const description = `${question.summary[0]} ${question.keyword} 상담 전 확인해야 할 기준을 보험플레이에서 정리했습니다.`;
  const related = relatedQuestions(question);
  const schema = [{
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: question.title,
    description,
    dateModified: SITE.lastUpdated,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: absolute(path)
  },{
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'홈',item:absolute('/')},
      {'@type':'ListItem',position:2,name:category.name,item:absolute(`/insurance/${category.slug}`)},
      {'@type':'ListItem',position:3,name:question.title,item:absolute(path)}
    ]
  }];
  const body = `<main><section class="content-hero"><div class="wrap">${breadcrumb([{name:category.name,href:`/insurance/${category.slug}`},{name:question.title}])}<span class="eyebrow">${esc(category.name)} · ${esc(question.audience)}</span><h1>${esc(question.title)}</h1><p>${esc(description)}</p><div class="pill-row"><span>${esc(question.keyword)}</span><span>${esc(question.audience)}</span><span>업데이트 ${esc(SITE.lastUpdated)}</span></div></div></section><div class="wrap content-layout"><article class="article-card"><div class="summary-box"><strong>3줄 요약</strong><ul>${question.summary.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div><h2>먼저 이렇게 판단하세요</h2><p>${esc(question.title)}라는 질문은 단순히 상품 하나를 고르는 문제가 아니라, 현재 가입 상태와 병력, 보험료 부담, 앞으로의 유지 가능성을 같이 봐야 하는 문제입니다.</p><p>${esc(category.description)}</p><h2>상담 전 체크리스트</h2><ul>${question.checks.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><h2>주의할 점</h2><p>보험은 나이, 직업, 병력, 기존 계약 조건, 보험사 인수 기준에 따라 결과가 달라집니다. 따라서 가입 가능 여부나 보험료를 단정하기보다, 현재 조건을 기준으로 비교하는 과정이 필요합니다.</p><div class="notice">본 내용은 일반 정보 제공 목적입니다. 보험계약 체결 전 상품설명서, 약관, 청약서류를 반드시 확인해야 하며, 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 검토해야 합니다.</div></article><aside class="side-card"><h3>${esc(question.cta)}</h3><p>지금 상황 기준으로 유지, 조정, 신규 가입 필요성을 먼저 확인해보세요.</p><a class="btn btn-primary" href="${contactHref(category.topic)}">상담 신청하기</a><h3 style="margin-top:28px">관련 질문</h3><div class="related-list">${related.map((item) => `<a href="/q/${item.slug}">${esc(item.title)}</a>`).join('')}</div></aside></div></main>`;
  return layout({ title, description, path, body, schema });
}

export function renderCategoryPage(category) {
  const path = `/insurance/${category.slug}`;
  const title = `${category.name} 질문 모음 | ${SITE.name}`;
  const description = `${category.description} 자주 묻는 질문과 상담 전 체크리스트를 확인해보세요.`;
  const items = questions.filter((item) => item.category === category.slug);
  const schema = [{ '@context':'https://schema.org','@type':'CollectionPage',name:title,description,url:absolute(path) }];
  const body = `<main><section class="content-hero"><div class="wrap">${breadcrumb([{name:category.name}])}<span class="eyebrow">CATEGORY HUB</span><h1>${esc(category.name)} 질문 모음</h1><p>${esc(description)}</p></div></section><section class="section"><div class="wrap content-layout"><article class="article-card"><h2>${esc(category.name)} 상담 전 확인할 것</h2><p>${esc(category.description)}</p><p>아래 질문들은 검색 유입과 상담 전환을 동시에 고려해 구성된 페이지입니다. 각 질문 페이지에서 요약, 체크리스트, 주의사항을 확인할 수 있습니다.</p><div class="list-grid">${items.map((item) => `<a href="/q/${item.slug}">${esc(item.title)}<small>${esc(item.keyword)} · ${esc(item.audience)}</small></a>`).join('')}</div></article><aside class="side-card"><h3>${esc(category.name)} 상담 신청</h3><p>질문을 읽어도 내 상황에 맞는 판단이 어렵다면 상담 신청으로 현재 조건을 남겨주세요.</p><a class="btn btn-primary" href="${contactHref(category.topic)}">상담 신청하기</a></aside></div></section></main>`;
  return layout({ title, description, path, body, schema });
}

export function renderCasePage(item) {
  const path = `/case/${item.slug}`;
  const title = `${item.title} | ${SITE.name}`;
  const description = `${item.description} 보험 상담 전 확인해야 할 기준을 정리했습니다.`;
  const related = questions.filter((q) => q.category === categories.find((c) => c.topic === item.topic)?.slug).slice(0, 5);
  const body = `<main><section class="content-hero"><div class="wrap">${breadcrumb([{name:'상황별 보험 상담'},{name:item.title}])}<span class="eyebrow">CASE LANDING</span><h1>${esc(item.title)}</h1><p>${esc(description)}</p></div></section><div class="wrap content-layout"><article class="article-card"><h2>이런 순서로 점검하세요</h2><ul>${item.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul><p>${esc(item.description)}</p><p>상황별 보험 상담은 특정 상품을 먼저 고르는 방식보다 현재 보유 보험, 월 보험료, 가족 구성, 병력, 앞으로의 지출 가능성을 함께 보는 방식이 안전합니다.</p><div class="notice">보험료와 가입 가능 여부는 개인 조건에 따라 달라질 수 있습니다. 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 확인해야 합니다.</div></article><aside class="side-card"><h3>${esc(item.title)} 상담</h3><p>현재 상황을 남기면 필요한 보장과 줄일 수 있는 항목을 함께 점검합니다.</p><a class="btn btn-primary" href="${contactHref(item.topic)}">상담 신청하기</a>${related.length ? `<h3 style="margin-top:28px">관련 질문</h3><div class="related-list">${related.map((q) => `<a href="/q/${q.slug}">${esc(q.title)}</a>`).join('')}</div>` : ''}</aside></div></main>`;
  return layout({ title, description, path, body, schema: [{ '@context':'https://schema.org','@type':'Service',name:item.title,description,url:absolute(path) }] });
}

export function renderNotFound() {
  const body = `<main class="not-found"><div class="wrap"><h1>페이지를 찾을 수 없습니다</h1><p>보험 질문 허브에서 필요한 내용을 다시 확인해보세요.</p><a class="btn btn-primary" href="/">홈으로 이동</a></div></main>`;
  return layout({ title:`페이지를 찾을 수 없습니다 | ${SITE.name}`, description:'요청하신 보험플레이 페이지를 찾을 수 없습니다.', path:'/404', body });
}

export { categories, questions, cases, SITE };
