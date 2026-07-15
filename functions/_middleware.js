const SITE='https://boheomplay.pagero.kr';
const OG=`${SITE}/og-image`;
const CORE_SCRIPTS='<script src="/assets/js/compliance.js?v=20260712-v4"></script><script src="/assets/js/agent-info.js?v=20260712-v1"></script><script src="/assets/js/board-submit-recovery.js?v=20260715-v2"></script>';
const BOARD_SCRIPT='<script src="/assets/js/board-pagination.js?v=20260715-v2"></script><script src="/assets/js/board-detail-fix.js?v=20260715-v1"></script>';
const NOTICE='<section class="site-compliance-notice"><div class="site-compliance-inner"><strong>보험정보 이용안내</strong>보험플레이의 게시글과 답변은 일반적인 보험정보 제공을 위한 것이며 특정 보험상품의 가입 권유, 보험계약 체결 또는 중개를 위한 설명이 아닙니다.<div class="site-compliance-registration">보험모집종사자: 김도윤 · 소속: 지에이코리아주식회사 · 보험협회 고유번호: 20260217401069 · 조회 기준일: 2026.07.12</div><div class="site-compliance-links"><a href="/company/">생명보험회사 목록</a><a href="/product/">보험상품명 정보</a><a href="https://www.e-cleanins.or.kr/" target="_blank" rel="noopener noreferrer">이클린보험서비스에서 정보 확인</a><a href="/insurance-notice/">보험정보 이용안내</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></div></div></section>';
const CSP=["default-src 'self'","base-uri 'self'","object-src 'none'","frame-ancestors 'none'","frame-src 'none'","form-action 'self'","img-src 'self' data: https:","font-src 'self' data: https://cdn.jsdelivr.net","style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net","script-src 'self' 'unsafe-inline'","connect-src 'self' https://script.google.com https://script.googleusercontent.com","manifest-src 'self'","worker-src 'none'",'upgrade-insecure-requests'].join('; ');

function patchHtml(html){
  let out=html.replaceAll('https://boheomplay.pages.dev',SITE).replaceAll(`${SITE}/og-image.jpg`,OG);
  if(!out.includes('property="og:image"')) out=out.replace('</head>',`<meta property="og:image" content="${OG}"/><meta property="og:image:secure_url" content="${OG}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:type" content="image/jpeg"/><meta name="twitter:image" content="${OG}"/>${CORE_SCRIPTS}${BOARD_SCRIPT}</head>`);
  else {
    if(!out.includes('/assets/js/agent-info.js')) out=out.replace('</head>',`${CORE_SCRIPTS}</head>`);
    else if(!out.includes('/assets/js/board-submit-recovery.js')) out=out.replace('</head>','<script src="/assets/js/board-submit-recovery.js?v=20260715-v2"></script></head>');
    if(!out.includes('/assets/js/board-pagination.js')) out=out.replace('</head>',`${BOARD_SCRIPT}</head>`);
    else if(!out.includes('/assets/js/board-detail-fix.js')) out=out.replace('</head>','<script src="/assets/js/board-detail-fix.js?v=20260715-v1"></script></head>');
  }
  if(out.includes('<footer')&&!out.includes('class="site-compliance-notice"')) out=out.replace('<footer',`${NOTICE}<footer`);
  return out;
}

function secure(headers,path,method){
  headers.set('x-content-type-options','nosniff');
  headers.set('x-frame-options','DENY');
  headers.set('referrer-policy','strict-origin-when-cross-origin');
  headers.set('permissions-policy','camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  headers.set('content-security-policy',CSP);
  headers.set('cross-origin-opener-policy','same-origin');
  headers.set('strict-transport-security','max-age=31536000; includeSubDomains');
  const api=path.startsWith('/api/');
  const admin=path.startsWith('/admin')||path.startsWith('/api/admin');
  const write=api&&!['GET','HEAD','OPTIONS'].includes(method);
  if(api||admin) headers.set('x-robots-tag','noindex, nofollow, noarchive, nosnippet');
  if(admin||write){headers.set('cache-control','no-store, no-cache, must-revalidate, max-age=0');headers.set('pragma','no-cache');}
  headers.delete('access-control-allow-origin');headers.delete('access-control-allow-credentials');
}

export async function onRequest(context){
  const response=await context.next();
  const url=new URL(context.request.url);
  const headers=new Headers(response.headers);
  secure(headers,url.pathname,context.request.method);
  let body=response.body;
  if((response.headers.get('content-type')||'').includes('text/html')){
    headers.set('content-type','text/html; charset=utf-8');
    if(!url.pathname.startsWith('/admin')) body=patchHtml(await response.text());
  }
  if(response.status===204||response.status===304) body=null;
  return new Response(body,{status:response.status,statusText:response.statusText,headers});
}