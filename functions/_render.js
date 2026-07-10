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
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260710-answer-longform"/><style>
.thread-page{background:#fff}.thread-view{padding:58px 0 82px}.thread-wrap{max-width:920px}.thread-breadcrumb{margin-bottom:28px;color:#777;font-size:13px;font-weight:700}.thread-breadcrumb a{text-decoration:none;color:#555}.question-post{padding:0 0 34px;border-bottom:1px solid #e5e5e5}.thread-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;color:#777;font-size:13px}.thread-meta span{display:inline-flex;align-items:center}.question-post h1{margin:0;font-size:clamp(34px,5.2vw,58px);line-height:1.12;letter-spacing:-.07em}.question-body{margin-top:30px;color:#222;font-size:18px;line-height:1.95;white-space:normal}.thread-actions{display:flex;justify-content:space-between;align-items:center;margin-top:34px;color:#222;font-size:15px}.thread-actions-left,.thread-actions-right{display:flex;gap:18px;align-items:center}.answer-post{display:grid;grid-template-columns:56px minmax(0,1fr);gap:18px;margin-top:40px;padding:0 0 0 16px}.answer-avatar{width:42px;height:42px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center;font-size:14px;font-weight:900}.answer-meta{margin-bottom:16px}.answer-meta strong{display:block;font-size:15px}.answer-meta span{display:block;margin-top:3px;color:#777;font-size:13px}.answer-content{color:#111;font-size:17px;line-height:1.95}.answer-content p{margin:0 0 20px}.answer-content ul{margin:0 0 24px;padding-left:20px}.answer-content li{margin:8px 0}.answer-point{margin:24px 0;padding:20px 22px;border:1px solid #e5e5e5;background:#f8f8f8;font-weight:850;line-height:1.75}.answer-subtitle{margin:28px 0 12px;font-weight:900;font-size:18px}.answer-note{margin-top:28px;padding:18px 20px;background:#f7f7f7;border:1px solid #e5e5e5;color:#555;font-size:14px;line-height:1.75}.answer-contact{margin-top:22px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border:1px solid #111;background:#111;color:#fff}.answer-contact strong{font-size:16px}.answer-contact a{display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;border-radius:999px;background:#fff;color:#111;padding:12px 16px;font-weight:900;text-decoration:none}.thread-related{margin-top:54px;padding-top:30px;border-top:1px solid #e5e5e5}.thread-related h2{margin:0 0 16px;font-size:22px}.thread-related-list{display:grid;gap:10px}.thread-related-list a{display:block;padding:15px 16px;border:1px solid #e5e5e5;font-weight:750}.thread-related-list a:hover{background:#f7f7f7}@media(max-width:720px){.thread-view{padding:40px 0 64px}.answer-post{grid-template-columns:1fr;padding-left:0}.answer-avatar{width:38px;height:38px}.thread-actions{align-items:flex-start;gap:18px}.question-body,.answer-content{font-size:16px}.answer-contact{display:block}.answer-contact a{margin-top:14px;width:100%}}
</style>${schemaScripts}</head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${esc(SITE.name)}</a><button class="menu-btn" type="button" aria-label="메뉴 열기" data-menu-toggle><span></span><span></span><span></span></button><nav class="nav" data-nav><a href="/#board">질문게시판</a><a href="/#write">질문남기기</a></nav></div></header>${body}<footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer><script src="/assets/js/main.js?v=20260710-answer-longform"></script></body></html>`;
}

function breadcrumb(items) {
  return `<div class="thread-breadcrumb"><a href="/">홈</a> / ${items.map((item) => item.href ? `<a href="${item.href}">${esc(item.name)}</a>` : esc(item.name)).join(' / ')}</div>`;
}

function relatedQuestions(current) {
  return questions.filter((item) => item.slug !== current.slug).sort((a, b) => (a.category === current.category ? -1 : 1) - (b.category === current.category ? -1 : 1)).slice(0, 6);
}

const curated = {
  'silbi-premium-increase-cancel': {
    question: '예전 실비보험이라 보장은 괜찮다고 들었는데, 이번 갱신 때 보험료가 거의 두 배 가까이 올랐습니다.\n처음에는 그냥 유지하려고 했는데 매달 빠져나가는 금액이 부담돼서 해지도 고민 중입니다.\n다만 최근에 병원 진료를 몇 번 받았고, 예전에 가입한 실비는 다시 가입하기 어렵다는 이야기도 들어서 결정이 쉽지 않습니다.\n보험료가 오른 상태에서도 계속 유지하는 게 맞는지, 아니면 4세대 실비로 전환하거나 해지해도 되는지 궁금합니다.',
    lead: '실비보험은 보험료만 보고 바로 해지하면 손해가 커질 수 있습니다. 특히 오래전에 가입한 실비는 지금 판매되는 실비와 자기부담금, 비급여 보장, 갱신 방식이 다를 수 있어서 단순히 “비싸다”는 이유만으로 없애기 어렵습니다.\n\n다만 보험료가 생활비를 압박할 정도라면 그대로 방치하는 것도 좋은 답은 아닙니다. 실비를 유지할지, 전환할지, 다른 특약을 먼저 줄일지 따로 봐야 합니다.',
    point: '실비보험 해지 여부는 보험료보다 “다시 가입 가능한 몸 상태인지”와 “해지 후 의료비를 감당할 수 있는지”가 먼저입니다.',
    bullets: [
      '최근 3개월 안에 진료, 검사, 약 처방, 추가검사 권유가 있었다면 새 실비 가입 심사에서 불리하게 작용할 수 있습니다.',
      '1세대·2세대·3세대 실비는 비급여 이용이 많은 사람에게 여전히 유리한 부분이 있을 수 있습니다. 병원 이용 패턴을 먼저 봐야 합니다.',
      '4세대 실비 전환은 보험료가 낮아 보일 수 있지만, 비급여 이용이 많으면 자기부담금과 향후 보험료 할인·할증을 같이 봐야 합니다.',
      '실비보험료가 부담된다면 실비부터 자르기보다 암·수술비·입원일당·갱신형 특약 중 중복되거나 우선순위가 낮은 항목을 먼저 확인하는 편이 안전합니다.',
      '해지 후 다시 가입이 안 되면 의료비를 온전히 본인이 부담해야 하므로, 해지 전에 대체 보장이 있는지 확인해야 합니다.'
    ],
    close: '결론적으로 현재 실비가 어떤 세대인지, 최근 병원 이력이 있는지, 월 보험료 전체에서 실비가 차지하는 비중이 얼마인지 먼저 봐야 합니다. 실비가 비싸졌다고 바로 없애기보다 “실비 유지 + 다른 특약 조정”이 더 나은 경우도 많습니다.\n\n현재 증권과 최근 진료 이력을 같이 보면 유지, 전환, 감액 중 어떤 선택지가 현실적인지 더 정확하게 볼 수 있습니다.'
  },
  'diabetes-insurance-available': {
    question: '당뇨약을 몇 년째 복용 중입니다. 최근에는 입원이나 수술은 없고, 병원에서 정기적으로 약만 받아 먹고 있습니다.\n보험 상담을 받아보면 어떤 곳은 유병자보험만 가능하다고 하고, 어떤 곳은 일반보험도 심사해볼 수 있다고 해서 헷갈립니다.\n암보험이나 뇌·심장 진단비도 준비하고 싶은데 당뇨가 있으면 가입 자체가 어려운지 궁금합니다.\n최근 당화혈색소 수치가 아주 나쁘지는 않은데, 이런 경우 일반심사도 가능성이 있을까요?',
    lead: '당뇨 이력이 있다고 해서 무조건 유병자보험만 가능한 것은 아닙니다. 보험사는 “당뇨약 복용 여부”만 보는 것이 아니라 현재 수치, 치료 기간, 합병증 여부, 입원·수술 이력, 다른 질환 동반 여부를 함께 봅니다.\n\n같은 당뇨라도 약만 복용하며 안정적으로 관리되는 경우와 합병증, 입원, 인슐린 치료 이력이 있는 경우는 심사 결과가 다르게 나올 수 있습니다.',
    point: '핵심은 당뇨라는 병명 하나가 아니라 최근 수치와 합병증 여부입니다.',
    bullets: [
      '최근 당화혈색소, 공복혈당, 약 복용 기간, 인슐린 사용 여부를 먼저 확인해야 합니다.',
      '당뇨로 인한 신장, 망막, 신경, 심혈관 합병증이 있으면 일반보험 심사는 까다로워질 수 있습니다.',
      '암보험은 당뇨가 있어도 보험사별로 조건이 다를 수 있고, 뇌·심장 담보는 더 민감하게 볼 수 있습니다.',
      '고지사항에 해당하는 진료·검사·투약 내용을 빠뜨리면 나중에 보험금 지급에서 문제가 생길 수 있습니다.',
      '일반심사 가능성을 먼저 보고, 조건이 불리하면 유병자보험으로 범위를 좁히는 방식이 보통 더 낫습니다.'
    ],
    close: '당뇨약을 복용 중이라도 최근 수치가 안정적이고 합병증이나 입원 이력이 없다면 일반보험 심사를 시도해볼 여지는 있습니다. 다만 보험사마다 보는 기준이 다르기 때문에 한 회사 결과만 보고 “안 된다”고 판단할 필요는 없습니다.\n\n현재 복용 약, 최근 검사 수치, 진단 시점, 합병증 여부를 기준으로 일반심사와 유병자보험을 나눠서 보는 것이 좋습니다.'
  },
  'parents-insurance-review-order': {
    question: '부모님이 60대인데 보험료가 매달 너무 많이 나갑니다. 예전에 여기저기서 가입하신 보험이 많아서 실비, 암보험, 종합보험, 운전자보험까지 여러 개가 있습니다.\n보험료를 줄이고 싶은데 어떤 건 오래된 보험이라 해지하면 안 된다고 하고, 어떤 건 중복이라고 해서 헷갈립니다.\n부모님은 병원도 가끔 다니시고 약도 드시는 게 있어서 새로 가입하기 어려울까 봐 걱정됩니다.\n이럴 때는 어떤 보험부터 보고, 어디부터 줄여야 할까요?',
    lead: '부모님 보험은 단순히 비싼 보험부터 해지하면 위험합니다. 60대 이후에는 나이와 병력 때문에 새로 가입하기 어려운 보장이 많고, 예전에 가입한 보험 중에는 지금보다 조건이 좋은 담보도 있을 수 있습니다.\n\n보험료를 줄이더라도 실비, 진단비, 간병·치매, 갱신형 특약, 입원일당 등을 나눠서 봐야 손해를 줄일 수 있습니다.',
    point: '부모님 보험은 줄이기 전에 “다시 가입하기 어려운 보장”부터 골라내야 합니다.',
    bullets: [
      '실비보험은 가장 먼저 확인해야 합니다. 해지 후 재가입이 어려울 수 있고, 병원 이용이 잦은 연령대에서는 활용도가 높을 수 있습니다.',
      '암·뇌·심장 진단비는 각 보험에 흩어져 있을 수 있어 총액과 보장 범위를 합산해서 봐야 합니다.',
      '갱신형 특약이 많으면 현재 보험료뿐 아니라 앞으로 더 오를 가능성까지 봐야 합니다.',
      '입원일당, 수술비, 작은 특약들이 여러 보험에 중복되어 있으면 보험료를 키우는 원인이 될 수 있습니다.',
      '간병보험이나 치매보험은 필요할 수 있지만, 보장 방식과 지급 조건을 확인하지 않으면 보험료만 커질 수 있습니다.'
    ],
    close: '부모님 보험은 “해지할 것”을 먼저 찾기보다 “남겨야 할 것”을 먼저 정하는 편이 안전합니다. 실비와 핵심 진단비처럼 다시 준비하기 어려운 보장을 먼저 남기고, 그다음 중복 특약과 갱신형 부담을 줄이는 방식이 좋습니다.\n\n부모님 연령, 병력, 현재 보험료, 증권 목록을 같이 보면 보험료를 낮추면서도 꼭 필요한 보장은 남길 수 있습니다.'
  },
  'cancer-insurance-30s-needed': {
    question: '30대인데 기존 종합보험 안에 암진단비가 조금 들어 있습니다. 일반암 진단비가 2천만 원인지 3천만 원인지 정확히는 모르겠고, 유사암은 따로 적게 들어 있는 것 같습니다.\n가족 중에 암 진단을 받은 분이 있어서 추가로 암보험을 준비해야 하는지 고민입니다.\n요즘 암보험을 알아보면 진단비를 크게 가져가야 한다는 말도 있고, 보험료를 너무 많이 쓰면 부담된다는 말도 있어서 기준을 모르겠습니다.\n30대 기준으로 암진단비 3천만 원 정도면 괜찮은 건가요?',
    lead: '암보험은 “몇 천만 원이면 충분하다”처럼 한 숫자로 끝내기 어렵습니다. 암진단비는 치료비뿐 아니라 일을 쉬는 기간의 생활비, 대출·고정비, 가족 부양 여부까지 같이 봐야 합니다.\n\n또 일반암, 유사암, 소액암, 고액암의 보장 금액이 다를 수 있어서 총 진단비만 보면 실제 보장과 차이가 생길 수 있습니다.',
    point: '30대 암보험은 진단비 금액보다 기존 보장과 유지 가능한 보험료의 균형이 중요합니다.',
    bullets: [
      '기존 보험에 들어 있는 일반암, 유사암, 소액암 진단비를 먼저 나눠서 확인해야 합니다.',
      '가족력이 있다면 본인의 건강검진 이력, 추가검사 여부, 고지사항 해당 여부를 함께 봐야 합니다.',
      '비갱신형은 보험료가 높을 수 있지만 장기 유지에 유리할 수 있고, 갱신형은 초기 보험료가 낮아도 나중에 부담이 커질 수 있습니다.',
      '진단비를 무리하게 크게 잡으면 유지가 어려워져 중도 해지 가능성이 커집니다.',
      '이미 종합보험 안에 암 보장이 있다면 부족한 부분만 보완하는 방식이 보험료 부담을 줄일 수 있습니다.'
    ],
    close: '30대에게 암진단비 3천만 원이 무조건 부족하거나 충분하다고 말하기는 어렵습니다. 소득, 가족력, 기존 보장, 월 보험료 여력에 따라 달라집니다.\n\n먼저 현재 보험증권에서 암 보장 금액을 정확히 확인하고, 유사암·소액암이 얼마나 되는지 본 뒤 부족한 부분만 추가하는 방식이 좋습니다.'
  },
  'reduce-insurance-premium': {
    question: '실비, 암보험, 종합보험을 합치니 월 보험료가 35만 원 정도 나갑니다. 처음에는 괜찮다고 생각했는데 매달 빠져나가다 보니 부담이 큽니다.\n그렇다고 아무 보험이나 해지했다가 나중에 병원비나 진단비가 부족해질까 봐 걱정됩니다.\n보험료를 줄이고 싶은데 실비부터 줄이면 안 된다는 말도 있고, 종합보험 특약부터 봐야 한다는 말도 있어서 모르겠습니다.\n이런 경우 어떤 항목부터 봐야 하나요?',
    lead: '보험료를 줄일 때 가장 위험한 방법은 부담되는 보험부터 바로 해지하는 것입니다. 보험은 해지하면 끝나는 것이 아니라, 이후 다시 가입이 어려울 수 있고 같은 조건으로 돌아가기 어려울 수 있습니다.\n\n보험료를 낮추려면 실비, 진단비, 갱신형 특약, 중복 담보, 저축성 보험료를 따로 봐야 합니다.',
    point: '보험료 절감은 해지가 아니라 우선순위를 다시 보는 일입니다.',
    bullets: [
      '실비보험은 다시 가입이 어려울 수 있어 가장 조심해서 봐야 합니다.',
      '암·뇌·심장 진단비는 부족하면 위험하지만, 여러 보험에 중복되어 있을 수도 있습니다.',
      '입원일당, 수술비, 골절, 운전자 특약 등 작은 담보가 여러 개 붙어 있으면 보험료가 커질 수 있습니다.',
      '갱신형 특약이 많으면 지금 보험료뿐 아니라 앞으로의 인상 가능성까지 확인해야 합니다.',
      '저축성 또는 환급형 보험료가 섞여 있다면 보장성 보험료와 분리해서 봐야 실제 부담 원인을 알 수 있습니다.'
    ],
    close: '월 보험료가 35만 원이라면 먼저 전체 보험 목록을 펼쳐서 어떤 보험료가 보장성이고 어떤 부분이 적립·환급형인지 봐야 합니다. 그다음 실비와 핵심 진단비는 최대한 보호하고, 중복 특약과 우선순위 낮은 담보를 조정하는 방식이 더 안전합니다.\n\n보험료를 줄이더라도 나중에 가장 크게 필요한 보장이 빠지면 의미가 없습니다. 줄일 항목과 남길 항목을 구분해서 보는 것이 좋습니다.'
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
  const description = `${answer.lead}`.replace(/\s+/g, ' ').slice(0, 150);
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

  const body = `<main class="thread-page"><section class="thread-view"><div class="wrap thread-wrap">${breadcrumb([{name:'질문게시판',href:'/#board'},{name:category.name},{name:question.title}])}<article class="question-post"><div class="thread-meta"><span>${esc(category.name)}</span><span>익명</span><span>업데이트 ${esc(SITE.lastUpdated)}</span></div><h1>${esc(question.title)}</h1><div class="question-body">${nl(answer.question)}</div><div class="thread-actions"><div class="thread-actions-left"><span>♡ 0</span><span>💬 1</span></div><div class="thread-actions-right"><span>공유</span><span>저장</span></div></div></article><article class="answer-post"><div class="answer-avatar">보</div><div><div class="answer-meta"><strong>${esc(SITE.name)} 답변</strong><span>업데이트 ${esc(SITE.lastUpdated)}</span></div><div class="answer-content"><p>${nl(answer.lead)}</p><div class="answer-point">${esc(answer.point)}</div><div class="answer-subtitle">먼저 봐야 할 부분</div><ul>${answer.bullets.map((item) => `<li>${esc(item)}</li>`).join('')}</ul><p>${nl(answer.close)}</p><div class="answer-note">본 답변은 일반적인 정보 제공 목적입니다. 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 함께 확인해야 합니다.</div><div class="answer-contact"><strong>내 보험 기준으로 바로 묻기</strong><a href="${KAKAO_URL}" target="_blank" rel="noopener noreferrer">오픈카톡 문의</a></div></div></div></article><section class="thread-related"><h2>관련 질문</h2><div class="thread-related-list">${related.map((item) => `<a href="/q/${item.slug}">${esc(item.title)}</a>`).join('')}</div></section></div></section></main>`;
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
