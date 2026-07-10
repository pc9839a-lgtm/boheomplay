import { SITE, categories, questions, cases } from './_content.js';

const KAKAO_URL = 'https://open.kakao.com/o/sjY0EnDi';
const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
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
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260710-answer-upgrade"/><style>
.thread-page{background:#fff}.thread-view{padding:58px 0 82px}.thread-wrap{max-width:920px}.thread-breadcrumb{margin-bottom:28px;color:#777;font-size:13px;font-weight:700}.thread-breadcrumb a{text-decoration:none;color:#555}.question-post{padding:0 0 34px;border-bottom:1px solid #e5e5e5}.thread-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;color:#777;font-size:13px}.thread-meta span{display:inline-flex;align-items:center}.question-post h1{margin:0;font-size:clamp(34px,5.2vw,58px);line-height:1.12;letter-spacing:-.07em}.question-body{margin-top:30px;color:#222;font-size:18px;line-height:1.9;white-space:normal}.thread-actions{display:flex;justify-content:space-between;align-items:center;margin-top:34px;color:#222;font-size:15px}.thread-actions-left,.thread-actions-right{display:flex;gap:18px;align-items:center}.answer-post{display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px;margin-top:36px;padding:0 0 0 16px}.answer-avatar{width:42px;height:42px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:14px;font-weight:900}.answer-meta{margin-bottom:14px}.answer-meta strong{display:block;font-size:15px}.answer-meta span{display:block;margin-top:3px;color:#777;font-size:13px}.answer-content{color:#111;font-size:17px;line-height:1.9}.answer-content p{margin:0 0 18px}.answer-content ul{margin:0 0 22px;padding-left:20px}.answer-content li{margin:6px 0}.answer-point{margin:22px 0;padding:18px 20px;border:1px solid #e5e5e5;background:#f8f8f8;font-weight:800}.answer-note{margin-top:26px;padding:16px 18px;background:#f7f7f7;border:1px solid #e5e5e5;color:#555;font-size:14px;line-height:1.7}.answer-contact{margin-top:20px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;border:1px solid #111;background:#111;color:#fff}.answer-contact strong{font-size:16px}.answer-contact a{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;border-radius:999px;background:#fff;color:#111;padding:12px 16px;font-weight:900;text-decoration:none}.thread-related{margin-top:54px;padding-top:30px;border-top:1px solid #e5e5e5}.thread-related h2{margin:0 0 16px;font-size:22px}.thread-related-list{display:grid;gap:10px}.thread-related-list a{display:block;padding:15px 16px;border:1px solid #e5e5e5;font-weight:750}.thread-related-list a:hover{background:#f7f7f7}@media(max-width:720px){.thread-view{padding:40px 0 64px}.answer-post{grid-template-columns:1fr;padding-left:0}.answer-avatar{width:38px;height:38px}.thread-actions{align-items:flex-start;gap:18px}.question-body,.answer-content{font-size:16px}.answer-contact{display:block}.answer-contact a{margin-top:14px;width:100%}}
</style>${schemaScripts}</head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${esc(SITE.name)}</a><button class="menu-btn" type="button" aria-label="메뉴 열기" data-menu-toggle><span></span><span></span><span></span></button><nav class="nav" data-nav><a href="/#board">질문게시판</a><a href="/#write">질문남기기</a></nav></div></header>${body}<footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer><script src="/assets/js/main.js?v=20260710-answer-upgrade"></script></body></html>`;
}

function breadcrumb(items) {
  return `<div class="thread-breadcrumb"><a href="/">홈</a> / ${items.map((item) => item.href ? `<a href="${item.href}">${esc(item.name)}</a>` : esc(item.name)).join(' / ')}</div>`;
}

function relatedQuestions(current) {
  return questions.filter((item) => item.slug !== current.slug).sort((a, b) => (a.category === current.category ? -1 : 1) - (b.category === current.category ? -1 : 1)).slice(0, 6);
}

const curated = {
  'silbi-premium-increase-cancel': {
    question: '예전 실비라 보장은 괜찮다고 들었는데 보험료가 갑자기 부담될 정도로 올랐습니다.\n해지하면 다시 가입이 어려울까 봐 고민입니다. 무조건 유지하는 게 맞을까요?',
    lead: '보험료가 올랐다고 바로 해지부터 보면 위험합니다. 특히 오래된 실비는 다시 같은 조건으로 돌아가기 어렵습니다.',
    point: '해지 판단은 보험료가 아니라 재가입 가능성과 보장 공백부터 봐야 합니다.',
    bullets: ['최근 병원 진료·검사·약 복용 이력이 있으면 새 실비 심사가 불리해질 수 있습니다.', '비급여 치료를 자주 쓰는 편이라면 기존 실비가 여전히 유리할 수 있습니다.', '보험료 부담은 실비 하나보다 다른 갱신형 특약·중복 담보까지 같이 봐야 줄일 수 있습니다.'],
    close: '결론은 유지 또는 해지 중 하나로 단정하기보다, 현재 실비 세대와 최근 병력, 전체 보험료를 같이 놓고 판단하는 쪽이 안전합니다.'
  },
  'diabetes-insurance-available': {
    question: '당뇨약은 계속 복용 중이고 최근 입원이나 수술은 없습니다.\n유병자보험만 가능한지, 일반보험 심사도 볼 수 있는지 궁금합니다.',
    lead: '당뇨 이력이 있다고 무조건 유병자보험만 가능한 것은 아닙니다. 다만 혈당 조절 상태와 합병증 여부가 중요합니다.',
    point: '핵심은 당뇨약 복용 자체보다 최근 수치, 치료 기간, 합병증 여부입니다.',
    bullets: ['최근 당화혈색소 수치와 약 복용 기간을 먼저 확인해야 합니다.', '입원·수술·합병증 이력이 있으면 일반심사보다 유병자 플랜이 현실적일 수 있습니다.', '암·뇌·심장 진단비는 보험사별 심사 차이가 커서 한 곳 기준으로 판단하면 안 됩니다.'],
    close: '가능하면 일반심사 가능성을 먼저 보고, 어렵다면 유병자보험으로 범위를 좁히는 순서가 좋습니다.'
  },
  'parents-insurance-review-order': {
    question: '부모님 보험료가 매달 너무 많이 나갑니다.\n실비는 있는 것 같고 암보험, 종합보험이 여러 개 있는데 어디부터 줄여야 할지 모르겠습니다.',
    lead: '부모님 보험은 보험료만 보고 줄이면 안 됩니다. 연령 때문에 다시 가입하기 어려운 보장이 많습니다.',
    point: '먼저 남길 보험과 줄일 보험을 나눠야 합니다.',
    bullets: ['실비보험은 해지 전 재가입 가능성을 가장 먼저 봐야 합니다.', '암·뇌·심장 진단비는 중복 금액과 보장 범위를 확인해야 합니다.', '갱신형 특약, 입원일당, 수술비처럼 보험료를 키우는 항목을 따로 분리해서 봐야 합니다.'],
    close: '부모님 보험은 “비싼 보험부터 해지”가 아니라 “다시 못 들어가는 보장부터 보호”하는 순서가 맞습니다.'
  },
  'cancer-insurance-30s-needed': {
    question: '기존 보험에 암진단비가 조금 들어 있는데 충분한지 모르겠습니다.\n가족력이 조금 있어서 추가로 준비해야 할지 궁금합니다.',
    lead: '30대 암보험은 무조건 크게 준비하는 것보다 기존 진단비와 월 보험료 균형이 중요합니다.',
    point: '진단비는 치료비만이 아니라 쉬는 기간의 생활비까지 같이 봅니다.',
    bullets: ['기존 일반암·유사암·소액암 보장 금액을 나눠서 확인해야 합니다.', '가족력이 있다면 최근 검진 이상 소견과 고지 항목도 함께 봐야 합니다.', '갱신형으로 싸게 넣을지, 비갱신형으로 오래 가져갈지에 따라 총 보험료가 달라집니다.'],
    close: '진단비가 부족한지는 “3천이면 충분/부족”이 아니라 기존 보장과 소득, 가족력, 유지 가능한 보험료를 같이 보고 결정해야 합니다.'
  },
  'reduce-insurance-premium': {
    question: '실비, 암보험, 종합보험을 합치니 월 보험료가 너무 큽니다.\n해지는 무섭고 계속 내기는 부담인데 어떤 순서로 봐야 할까요?',
    lead: '보험료를 줄일 때 가장 위험한 방식은 부담되는 보험부터 바로 해지하는 것입니다.',
    point: '줄일 때도 순서가 있습니다. 실비, 진단비, 중복 특약을 따로 봐야 합니다.',
    bullets: ['실비처럼 다시 가입이 어려운 보장은 먼저 보호해야 합니다.', '중복 진단비, 과한 입원일당, 낮은 우선순위 특약부터 확인합니다.', '갱신형 특약이 많으면 지금보다 앞으로 더 부담될 수 있어 따로 표시해야 합니다.'],
    close: '보험료 절감은 해지보다 정리가 먼저입니다. 남길 것과 줄일 것을 나눠야 보험료도 줄이고 보장 공백도 피할 수 있습니다.'
  }
};

function buildAnswer(question) {
  const item = curated[question.slug];
  if (item) return item;
  return {
    question: `${question.title}\n\n${question.audience} 기준으로 어떤 점을 먼저 봐야 하는지 궁금합니다.`,
    lead: `${question.title}는 상품명 하나로 판단하기보다 현재 가입 상태와 병력, 보험료 부담을 같이 봐야 합니다.`,
    point: question.summary[0],
    bullets: question.summary.concat(question.checks).slice(0, 5),
    close: '보험은 나이, 병력, 기존 계약 조건에 따라 결과가 달라질 수 있으므로 현재 조건 기준으로 확인하는 것이 좋습니다.'
  };
}

export function renderQuestionPage(question) {
  const category = findCategory(question.category);
  const path = `/q/${question.slug}`;
  const title = `${question.title} | ${SITE.name}`;
  const answer = buildAnswer(question);
  const description = `${answer.lead} ${question.keyword} 관련 질문과 답변을 보험플레이에서 확인하세요.`;
  const related = relatedQuestions(question);
  const answerBody = `${answer.lead}\n\n${answer.point}\n\n${answer.bullets.map((item) => `- ${item}`).join('\n')}\n\n${answer.close}`;
  const schema = [{
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.title,
      text: answer.question,
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

  const body = `<main class="thread-page"><section class="thread-view"><div class="wrap thread-wrap">${breadcrumb([{name:'질문게시판',href:'/#board'},{name:category.name},{name:question.title}])}<article class="question-post"><div class="thread-meta"><span>${esc(category.name)}</span><span>익명</span><span>업데이트 ${esc(SITE.lastUpdated)}</span></div><h1>${esc(question.title)}</h1><div class="question-body">${nl(answer.question)}</div><div class="thread-actions"><div class="thread-actions-left"><span>♡ 0</span><span>💬 1</span></div><div class="thread-actions-right"><span>공유</span><span>저장</span></div></div></article><article class="answer-post"><div class="answer-avatar">보</div><div><div class="answer-meta"><strong>${esc(SITE.name)} 답변</strong><span>업데이트 ${esc(SITE.lastUpdated)}</span></div><div class="answer-content"><p>${nl(answer.lead)}</p><div class="answer-point">${esc(answer.point)}</div><ul>${answer.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><p>${nl(answer.close)}</p><div class="answer-note">본 답변은 일반적인 정보 제공 목적입니다. 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 함께 확인해야 합니다.</div><div class="answer-contact"><strong>내 보험 기준으로 바로 묻기</strong><a href="${KAKAO_URL}" target="_blank" rel="noopener noreferrer">오픈카톡 문의</a></div></div></div></article><section class="thread-related"><h2>관련 질문</h2><div class="thread-related-list">${related.map((item) => `<a href="/q/${item.slug}">${esc(item.title)}</a>`).join('')}</div></section></div></section></main>`;
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