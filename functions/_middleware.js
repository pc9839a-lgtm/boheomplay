const SITE_URL = 'https://boheomplay.pagero.kr';
const OG_IMAGE = `${SITE_URL}/og-image`;

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

function injectSeo(html) {
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
      body = injectSeo(await response.text());
    }
  }

  if (response.status === 204 || response.status === 304) body = null;

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
