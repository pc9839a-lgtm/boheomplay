import { categories, questions, cases } from './_content.js';
import { extraQuestions } from './_extra-qa.js';
import { dailyQuestions } from './_daily-questions.js';
import { lifeCompanies, insuranceProducts } from './_insurance-directory.js';
import { listBoardPosts } from './_board.js';

const SITE_URL = 'https://boheomplay.pagero.kr';
const LAST_UPDATED = '2026-07-26';
const escXml = (value) => String(value).replace(/[&<>\"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));
const url = (path) => `${SITE_URL}${path}`;

function uniqueEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    if (!entry.loc || seen.has(entry.loc)) return false;
    seen.add(entry.loc);
    return true;
  });
}

export async function onRequest(context) {
  let boardEntries = [];
  try {
    const posts = await listBoardPosts(context.env, { publicOnly: true });
    boardEntries = posts.filter((post) => post.href).map((post) => ({ loc: url(post.href), priority: '0.7', changefreq: 'daily' }));
  } catch (error) {
    boardEntries = [];
  }

  const entries = uniqueEntries([
    { loc: url('/'), priority: '1.0', changefreq: 'daily' },
    { loc: url('/about/'), priority: '0.5', changefreq: 'monthly' },
    { loc: url('/contact/'), priority: '0.8', changefreq: 'monthly' },
    { loc: url('/company/'), priority: '0.9', changefreq: 'weekly' },
    { loc: url('/product/'), priority: '0.9', changefreq: 'daily' },
    { loc: url('/insurance-notice/'), priority: '0.5', changefreq: 'monthly' },
    { loc: url('/privacy/'), priority: '0.4', changefreq: 'monthly' },
    { loc: url('/terms/'), priority: '0.4', changefreq: 'monthly' },
    ...lifeCompanies.map((item) => ({ loc: url(`/company/${item.slug}`), priority: '0.85', changefreq: 'weekly' })),
    ...insuranceProducts.map((item) => ({ loc: url(`/product/${item.slug}`), priority: '0.8', changefreq: 'weekly' })),
    ...categories.map((item) => ({ loc: url(`/insurance/${item.slug}`), priority: '0.9', changefreq: 'weekly' })),
    ...cases.map((item) => ({ loc: url(`/case/${item.slug}`), priority: '0.8', changefreq: 'weekly' })),
    ...dailyQuestions.map((item) => ({ loc: url(`/q/${item.slug}`), priority: '0.8', changefreq: 'weekly' })),
    ...questions.map((item) => ({ loc: url(`/q/${item.slug}`), priority: '0.75', changefreq: 'weekly' })),
    ...extraQuestions.map((item) => ({ loc: url(`/q/${item.slug}`), priority: '0.75', changefreq: 'weekly' })),
    ...boardEntries
  ]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${escXml(entry.loc)}</loc><lastmod>${LAST_UPDATED}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
