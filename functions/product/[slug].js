import { insuranceProducts, renderProductPage } from '../_insurance-directory.js';

export async function onRequest(context) {
  const slug = String(context.params.slug || '').toLowerCase();
  const product = insuranceProducts.find((item) => item.slug === slug);
  if (!product) return new Response('Not Found', { status: 404 });
  return new Response(renderProductPage(product), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}
