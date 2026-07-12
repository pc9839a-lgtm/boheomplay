const SITE_URL = 'https://boheomplay.pagero.kr';
const SITE_NAME = '보험플레이';
const KLIA_MEMBER_URL = 'https://www.klia.or.kr/klia/company/member/list.do';

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

const safeJson = (value) => JSON.stringify(value)
  .replace(/&/g, '\\u0026')
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e');

const absolute = (path) => `${SITE_URL}${path}`;

export const lifeCompanies = [
  { slug: 'hanwha-life', name: '한화생명', officialUrl: 'https://www.hanwhalife.com' },
  { slug: 'abl-life', name: 'ABL생명', officialUrl: 'https://www.abllife.co.kr' },
  { slug: 'samsung-life', name: '삼성생명', officialUrl: 'https://www.samsunglife.com' },
  { slug: 'heungkuk-life', name: '흥국생명', officialUrl: 'https://www.heungkuklife.co.kr' },
  { slug: 'kyobo-life', name: '교보생명', officialUrl: 'https://www.kyobo.com' },
  { slug: 'im-life', name: 'iM라이프생명', officialUrl: 'https://www.dgbfnlife.com' },
  { slug: 'miraeasset-life', name: '미래에셋생명', officialUrl: 'https://life.miraeasset.com' },
  { slug: 'kdb-life', name: 'KDB생명', officialUrl: 'https://www.kdblife.co.kr' },
  { slug: 'db-life', name: 'DB생명', officialUrl: 'https://www.idblife.com' },
  { slug: 'tongyang-life', name: '동양생명', officialUrl: 'https://www.myangel.co.kr' },
  { slug: 'metlife-korea', name: '메트라이프생명', officialUrl: 'https://www.metlife.co.kr' },
  { slug: 'kb-life', name: 'KB라이프생명', officialUrl: 'https://www.kblife.co.kr' },
  { slug: 'shinhan-life', name: '신한라이프생명', officialUrl: 'https://www.shinhanlife.co.kr' },
  { slug: 'chubb-life', name: '처브라이프생명', officialUrl: 'https://www.chubblife.co.kr' },
  { slug: 'hana-life', name: '하나생명', officialUrl: 'https://www.hanalife.co.kr' },
  { slug: 'bnp-paribas-cardif-life', name: 'BNP파리바카디프생명', officialUrl: 'https://www.cardif.co.kr' },
  { slug: 'fubon-hyundai-life', name: '푸본현대생명', officialUrl: 'https://www.fubonhyundai.com' },
  { slug: 'lina-life', name: '라이나생명', officialUrl: 'https://www.lina.co.kr' },
  { slug: 'aia-life', name: 'AIA생명', officialUrl: 'https://www.aia.co.kr' },
  { slug: 'nh-life', name: 'NH농협생명', officialUrl: 'https://www.nhlife.co.kr' },
  { slug: 'ibk-pension', name: 'IBK연금보험', officialUrl: 'https://www.ibki.co.kr' },
  { slug: 'kyobo-lifeplanet', name: '교보라이프플래닛', officialUrl: 'https://www.lifeplanet.co.kr' }
];

export const insuranceProducts = [];

function pageLayout({ title, description, canonicalPath, body, schema }) {
  const canonical = absolute(canonicalPath);
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="website"/><meta property="og:site_name" content="${SITE_NAME}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><meta property="og:image" content="${SITE_URL}/og-image"/><meta name="twitter:card" content="summary_large_image"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260712-company-product"/><style>body{background:#f6f6f4;color:#111}.directory{padding:58px 0 88px}.directory-wrap{max-width:1040px;margin:auto;padding:0 20px}.directory-hero{padding:38px;border:1px solid #dfdcd6;border-radius:28px;background:#fff}.directory-hero h1{margin:0;font-size:clamp(34px,5vw,58px);line-height:1.08;letter-spacing:-.065em}.directory-hero p{max-width:760px;margin:20px 0 0;color:#555;font-size:17px;line-height:1.8}.directory-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:28px}.directory-card{display:block;padding:22px;border:1px solid #e0ddd7;border-radius:20px;background:#fff;color:#111;text-decoration:none}.directory-card strong{display:block;font-size:20px}.directory-card span{display:block;margin-top:7px;color:#666;font-size:13px;line-height:1.6}.directory-section{margin-top:30px;padding:30px;border:1px solid #e0ddd7;border-radius:24px;background:#fff}.directory-section h2{margin:0 0 16px;font-size:24px}.directory-section p,.directory-section li{color:#444;font-size:15px;line-height:1.85}.directory-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.directory-links a{padding:11px 14px;border:1px solid #111;color:#111;text-decoration:none;font-weight:800}.directory-note{margin-top:26px;padding:18px;border:1px solid #e0ddd7;background:#faf9f7;color:#555;font-size:13px;line-height:1.75}@media(max-width:820px){.directory-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.directory{padding:34px 0 64px}.directory-hero,.directory-section{padding:24px 19px}.directory-grid{grid-template-columns:1fr}}</style><script type="application/ld+json">${safeJson(schema)}</script></head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${SITE_NAME}</a><nav class="nav"><a href="/company/">생명보험회사</a><a href="/product/">보험상품</a><a href="/#board">질문게시판</a></nav></div></header>${body}<footer class="footer"><div class="wrap footer-inner"><p><strong>WAYZI(보험플레이)</strong> · 대표 김도윤 · 사업자번호 538-42-01450</p><nav><a href="/insurance-notice/">보험정보 이용안내</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer></body></html>`;
}

export function renderCompanyIndex() {
  const title = `생명보험회사 목록과 보험상품 정보 | ${SITE_NAME}`;
  const description = '국내 생명보험회사 이름으로 보험상품과 관련 질문을 찾을 수 있는 정보 페이지입니다.';
  const body = `<main class="directory"><div class="directory-wrap"><section class="directory-hero"><h1>생명보험회사별<br/>보험정보 찾기</h1><p>회사명을 누르면 해당 생명보험회사와 관련해 확인할 항목, 공식 홈페이지, 등록된 상품명 정보 페이지를 볼 수 있습니다.</p></section><section class="directory-grid">${lifeCompanies.map((company) => `<a class="directory-card" href="/company/${company.slug}"><strong>${esc(company.name)}</strong><span>${esc(company.name)} 보험상품과 질문 확인</span></a>`).join('')}</section><div class="directory-note">보험회사명은 생명보험협회 회원사 안내를 기준으로 작성했습니다. 보험플레이는 각 보험회사의 공식 사이트가 아니며 제휴·추천 관계를 의미하지 않습니다.</div></div></main>`;
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: absolute('/company/'), mainEntity: { '@type': 'ItemList', itemListElement: lifeCompanies.map((company, index) => ({ '@type': 'ListItem', position: index + 1, name: company.name, url: absolute(`/company/${company.slug}`) })) } };
  return pageLayout({ title, description, canonicalPath: '/company/', body, schema });
}

export function renderCompanyPage(company) {
  const products = insuranceProducts.filter((product) => product.companySlug === company.slug);
  const title = `${company.name} 보험상품 질문과 확인사항 | ${SITE_NAME}`;
  const description = `${company.name} 보험상품을 검색할 때 확인할 공식 정보, 약관, 상품 상태와 관련 질문을 안내합니다.`;
  const productHtml = products.length ? products.map((product) => `<a class="directory-card" href="/product/${product.slug}"><strong>${esc(product.name)}</strong><span>${esc(product.category || '생명보험상품')} · 확인일 ${esc(product.verifiedAt || '')}</span></a>`).join('') : `<div class="directory-note">현재 등록된 ${esc(company.name)} 상품명 페이지가 없습니다. 공식 자료로 판매 여부와 정확한 상품명을 확인한 뒤 순차적으로 추가합니다.</div>`;
  const body = `<main class="directory"><div class="directory-wrap"><section class="directory-hero"><h1>${esc(company.name)}<br/>보험상품 정보</h1><p>${esc(company.name)} 회사명이나 상품명을 검색한 이용자가 공식 자료를 확인하기 쉽게 만든 정보 페이지입니다.</p><div class="directory-links"><a href="${esc(company.officialUrl)}" target="_blank" rel="noopener noreferrer nofollow">${esc(company.name)} 공식 홈페이지</a><a href="${KLIA_MEMBER_URL}" target="_blank" rel="noopener noreferrer nofollow">생명보험협회 회원사 확인</a></div></section><section class="directory-section"><h2>${esc(company.name)} 보험상품을 볼 때</h2><ul><li>현재 판매 중인 상품인지 공식 홈페이지와 상품공시실에서 확인합니다.</li><li>상품명만 같아도 가입 시점과 계약형태에 따라 약관과 보장내용이 다를 수 있습니다.</li><li>보험료와 가입 가능 여부는 연령, 직업, 병력, 납입기간과 심사 기준에 따라 달라집니다.</li><li>기존 보험을 해지하고 바꾸기 전에는 보장 공백과 재가입 가능성을 확인합니다.</li></ul></section><section class="directory-section"><h2>${esc(company.name)} 상품명 페이지</h2><div class="directory-grid">${productHtml}</div></section><div class="directory-note">이 페이지는 일반 정보 제공용이며 ${esc(company.name)}의 공식 광고·상품설명서가 아닙니다. 계약 전에는 해당 보험회사의 공식 상품설명서와 약관을 확인하세요.</div></div></main>`;
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: absolute(`/company/${company.slug}`), about: { '@type': 'Organization', name: company.name, url: company.officialUrl } };
  return pageLayout({ title, description, canonicalPath: `/company/${company.slug}`, body, schema });
}

export function renderProductIndex() {
  const title = `생명보험 상품명 검색 정보 | ${SITE_NAME}`;
  const description = '공식 자료로 확인한 생명보험 상품명과 관련 질문을 모아 제공하는 페이지입니다.';
  const list = insuranceProducts.length ? insuranceProducts.map((product) => {
    const company = lifeCompanies.find((item) => item.slug === product.companySlug);
    return `<a class="directory-card" href="/product/${product.slug}"><strong>${esc(product.name)}</strong><span>${esc(company?.name || '')} · ${esc(product.category || '')}</span></a>`;
  }).join('') : '<div class="directory-note">공식 보험회사 자료에서 현재 상품명과 판매 상태를 확인한 페이지가 순차적으로 추가됩니다.</div>';
  const body = `<main class="directory"><div class="directory-wrap"><section class="directory-hero"><h1>보험상품명으로<br/>정보 찾기</h1><p>상품명 검색 결과에서 회사 공식 자료, 확인일, 주요 확인사항과 관련 질문을 찾을 수 있도록 제공합니다.</p></section><section class="directory-grid">${list}</section><div class="directory-note">상품명 페이지는 공식 보험회사 홈페이지 또는 공시 자료로 이름과 상태를 확인한 경우에만 게시합니다.</div></div></main>`;
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, description, url: absolute('/product/') };
  return pageLayout({ title, description, canonicalPath: '/product/', body, schema });
}

export function renderProductPage(product) {
  const company = lifeCompanies.find((item) => item.slug === product.companySlug);
  const title = `${product.name} 상품정보와 확인사항 | ${SITE_NAME}`;
  const description = `${company?.name || ''} ${product.name} 검색 시 공식 자료와 약관에서 확인할 항목을 안내합니다.`;
  const questions = Array.isArray(product.questions) ? product.questions : [];
  const body = `<main class="directory"><div class="directory-wrap"><section class="directory-hero"><h1>${esc(product.name)}</h1><p>${esc(company?.name || '')}의 ${esc(product.name)} 상품명을 검색한 이용자를 위한 일반 정보 페이지입니다.</p><div class="directory-links"><a href="/company/${esc(company?.slug || '')}">${esc(company?.name || '보험회사')} 정보</a>${product.officialUrl ? `<a href="${esc(product.officialUrl)}" target="_blank" rel="noopener noreferrer nofollow">공식 상품 페이지</a>` : ''}</div></section><section class="directory-section"><h2>확인된 정보</h2><ul><li>보험회사: ${esc(company?.name || '')}</li><li>상품명: ${esc(product.name)}</li><li>상품 분류: ${esc(product.category || '확인 필요')}</li><li>공식 자료 확인일: ${esc(product.verifiedAt || '확인 필요')}</li><li>판매 상태: ${esc(product.status || '공식 확인 필요')}</li></ul><p>${esc(product.summary || '가입 전 공식 상품설명서와 약관을 확인해야 합니다.')}</p></section><section class="directory-section"><h2>상품명 검색 시 확인할 점</h2><ul>${(product.checks || ['정확한 상품명과 가입 시점', '주계약과 특약의 보장 범위', '갱신 여부와 보험료 변동 가능성', '면책기간과 감액기간', '해지환급금과 기존 계약 변경 위험']).map((item) => `<li>${esc(item)}</li>`).join('')}</ul></section>${questions.length ? `<section class="directory-section"><h2>관련 질문</h2><div class="directory-grid">${questions.map((item) => `<a class="directory-card" href="/q/${esc(item.slug)}"><strong>${esc(item.title)}</strong><span>${esc(item.summary || '')}</span></a>`).join('')}</div></section>` : ''}<div class="directory-note">이 페이지는 해당 보험회사나 상품의 공식 광고가 아니며 특정 상품 가입을 권유하지 않습니다. 실제 보장, 보험료, 가입 가능 여부는 공식 상품설명서·약관과 개별 심사 결과를 기준으로 확인하세요.</div></div></main>`;
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: absolute(`/product/${product.slug}`), about: { '@type': 'Product', name: product.name, brand: { '@type': 'Brand', name: company?.name || '' } } };
  return pageLayout({ title, description, canonicalPath: `/product/${product.slug}`, body, schema });
}
