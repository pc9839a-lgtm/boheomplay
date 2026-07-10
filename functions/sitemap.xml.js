import { SITE, categories, questions, cases } from './_content.js';
import { listBoardPosts } from './_board.js';

const escXml = (value) => String(value).replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const url = (path) => `${SITE.url}${path}`;

export async function onRequest(context) {
  let boardEntries = [];
  try {
    const posts = await listBoardPosts(context.env, { publicOnly: true });
    boardEntries = posts.filter((post) => post.href).map((post) => ({ loc: url(post.href), priority: '0.7', changefreq: 'daily' }));
  } catch (error) {
    boardEntries = [];
  }

  const entries = [
    { loc: url('/'), priority: '1.0', changefreq: 'daily' },
    { loc: url('/about/'), priority: '0.5', changefreq: 'monthly' },
    { loc: url('/contact/'), priority: '0.8', changefreq: 'monthly' },
    ...categories.map((item) => ({ loc: url(`/insurance/${item.slug}`), priority: '0.9', changefreq: 'weekly' })),
    ...cases.map((item) => ({ loc: url(`/case/${item.slug}`), priority: '0.8', changefreq: 'weekly' })),
    ...questions.map((item) => ({ loc: url(`/q/${item.slug}`), priority: '0.75', changefreq: 'weekly' })),
    ...boardEntries
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${escXml(entry.loc)}</loc><lastmod>${SITE.lastUpdated}</lastmod><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`).join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
