const SITE_URL = 'https://boheomplay.pagero.kr';
const OG_IMAGE = `${SITE_URL}/og-image`;
const COMPLIANCE_SCRIPT = '<script src="/assets/js/compliance.js?v=20260712-v3"></script>';
const COMMON_NOTICE = `<section class="site-compliance-notice" aria-label="보험정보 이용안내" style="border-top:1px solid #e5e5e5;background:#f7f7f7"><div class="site-compliance-inner" style="max-width:1180px;margin:0 auto;padding:24px 20px;color:#555;font-size:13px;line-height:1.75"><strong style="display:block;margin-bottom:6px;color:#111;font-size:14px">보험정보 이용안내</strong>보험플레이의 게시글과 답변은 일반적인 보험정보 제공을 위한 것이며 특정 보험상품의 가입 권유, 보험계약 체결 또는 중개를 위한 설명이 아닙니다. 실제 보험료, 보장내용과 가입 가능 여부는 보험회사·상품·개인의 연령, 직업, 병력 및 인수 기준에 따라 달라질 수 있습니다. 기존 보험을 해지하거나 변경하기 전에는 상품설명서와 약관을 확인하고 등록된 보험모집종사자에게 설명을 받으시기 바랍니다.<div style="margin-top:10px;color:#333;font-weight:750">보험협회 고유번호: 20260217401069</div><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:10px"><a href="https://www.e-cleanins.or.kr/" target="_blank" rel="noopener noreferrer" style="color:#111;font-weight:800">이클린보험서비스에서 정보 확인</a><a href="/insurance-notice/" style="color:#111;font-weight:800">보험정보 이용안내</a><a href="/privacy/" style="color:#111;font-weight:800">개인정보처리방침</a><a href="/terms/" style="color:#111;font-weight:800">이용약관</a></div></div></section>`;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://script.google.com https://script.googleusercontent.com",
  "manifest-src 'self'",
  "worker-src 'none'",
  'upgrade-insecure-requests'
].join('; ');

function injectSeoAndCompliance(html) {
  let output = html
    .replaceAll('https://boheomplay.pages.dev', SITE_URL)
    .replaceAll(`${SITE_URL}/og-image.jpg`, OG_IMAGE);

  if (!output.includes('property="og:image"')) {
    const tags = `
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:image:secure_url" content="${OG_IMAGE}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:alt" content="보험플레이 보험? 무엇이든 물어보세요" />
<meta name="twitter:image" content="${OG_IMAGE}" />`;
    output = output.replace('</head>', `${tags}\n</head>`);
  }

  if (!output.includes('/assets/js/compliance.js')) {
    output = output.replace('</head>', `${COMPLIANCE_SCRIPT}\n</head>`);
  }

  if (output.includes('<footer') && !output.includes('class="site-compliance-notice"')) {
    output = output.replace('<footer', `${COMMON_NOTICE}<footer`);
  }

  return output;
}

function applySecurityHeaders(headers, pathname, method) {
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'DENY');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  headers.set('content-security-policy', CONTENT_SECURITY_POLICY);
  headers.set('cross-origin-opener-policy', 'same-origin');
  headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  headers.set('x-xss-protection', '0');

  const isApi = pathname.startsWith('/api/');
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isUnsafeApi = isApi && !['GET', 'HEAD', 'OPTIONS'].includes(String(method || 'GET').toUpperCase());

  if (isApi || isAdmin) {
    headers.set('x-robots-tag', 'noindex, nofollow, noarchive, nosnippet');
  }

  if (isAdmin || isUnsafeApi) {
    headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
    headers.set('pragma', 'no-cache');
  }

  headers.delete('access-control-allow-origin');
  headers.delete('access-control-allow-credentials');
}

export async function onRequest(context) {
  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  const url = new URL(context.request.url);
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers, url.pathname, context.request.method);

  let body = response.body;
  if (type.includes('text/html')) {
    headers.set('content-type', 'text/html; charset=utf-8');
    if (!url.pathname.startsWith('/admin')) {
      body = injectSeoAndCompliance(await response.text());
    }
  }

  if (response.status === 204 || response.status === 304) body = null;

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
