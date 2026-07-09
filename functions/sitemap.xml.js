import { SITE, categories, questions, cases } from './_content.js';

const escXml = (value) => String(value).replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const url = (path) => `${SITE.url}${path}`;

export async function onRequest() {
  const entries = [
    { loc: url('/'), priority: '1.0', changefreq: 'daily' },
    { loc: url('/about/'), priority: '0.5', changefreq: 'monthly' },
    { loc: url('/contact/'), priority: '0.8', changefreq: 'monthly' },
    ...categories.map((item) => ({ loc: url(`/insurance/${item.slug}`), priority: '0.9', changefreq: 'weekly' })),
    ...cases.map((item) => ({ loc: url(`/case/${item.slug}`), priority: '0.8', changefreq: 'weekly' })),
    ...questions.map((item) => ({ loc: url(`/q/${item.slug}`), priority: '0.75', changefreq: 'weekly' }))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${escXml(entry.loc)}</loc><lastmod>${SITE.lastUpdated}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
