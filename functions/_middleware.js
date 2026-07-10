const SITE_URL = 'https://boheomplay.pagero.kr';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

function injectSeo(html) {
  let output = html.replaceAll('https://boheomplay.pages.dev', SITE_URL);

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

export async function onRequest(context) {
  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  const url = new URL(context.request.url);

  if (!type.includes('text/html') || url.pathname.startsWith('/admin')) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');

  return new Response(injectSeo(await response.text()), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
