import { lifeCompanies, renderCompanyPage } from '../_insurance-directory.js';
import { dailyQuestions20260713 } from '../_qa-2026-07-13.js';
import { dailyQuestions20260714 } from '../_qa-2026-07-14.js';

const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));

function addRelatedQuestions(html, company) {
  const related = dailyQuestions20260714
    .concat(dailyQuestions20260713)
    .filter((item) => item.cs === company.slug);
  if (!related.length) return html;

  const latestDate = related.some((item) => dailyQuestions20260714.includes(item)) ? '2026-07-14' : '2026-07-13';
  const section = `<section class="directory-section"><h2>${esc(company.name)} 관련 계약관리 질문</h2><p>회사명과 공식 홈페이지는 ${latestDate} 생명보험협회 회원사 안내와 회사 공식 사이트에서 확인했습니다.</p><div class="directory-grid">${related.map((item) => `<a class="directory-card" href="/q/${esc(item.slug)}"><strong>${esc(item.title)}</strong><span>${esc(item.q.join(' '))}</span></a>`).join('')}</div></section>`;

  return html.replace('</div></main><footer', `${section}</div></main><footer`);
}

export async function onRequest(context) {
  const slug = String(context.params.slug || '').toLowerCase();
  const company = lifeCompanies.find((item) => item.slug === slug);
  if (!company) return new Response('Not Found', { status: 404 });

  return new Response(addRelatedQuestions(renderCompanyPage(company), company), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300'
    }
  });
}
