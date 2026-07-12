import { renderCompanyIndex } from '../_insurance-directory.js';

export async function onRequest() {
  return new Response(renderCompanyIndex(), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}
