import { SITE } from './_content.js';

const INDEX_KEY = 'board:index';
const POST_PREFIX = 'board:post:';
const MAX_LIST = 100;

const CATEGORY_PREFIX = {
  '실비보험': 'silbi',
  '암보험': 'cancer',
  '보험료': 'premium',
  '보험료 줄이기': 'premium',
  '유병자보험': 'chronic',
  '부모님 보험': 'parents',
  '태아보험': 'baby',
  '태아·어린이보험': 'baby',
  '운전자보험': 'driver',
  '치아보험': 'dental',
  '기타': 'question'
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export function html(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=120'
    }
  });
}

export function esc(value = '') {
  return String(value).replace(/[&<>\"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\"': '&quot;'
  }[char]));
}

function store(env) {
  return env.BOARD_POSTS || null;
}

function postKey(slug) {
  return `${POST_PREFIX}${slug}`;
}

async function readJson(kv, key, fallback) {
  const raw = await kv.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function writeJson(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

function clean(value = '', max = 1000) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function bodyClean(value = '', max = 1800) {
  return String(value || '').trim().replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').slice(0, max);
}

function makeSlug(category) {
  const prefix = CATEGORY_PREFIX[category] || 'question';
  const time = Date.now().toString(36);
  const rand = crypto.randomUUID().slice(0, 8);
  return `${prefix}-${time}-${rand}`;
}

function displayTime(createdAt) {
  if (!createdAt) return '방금 전';
  const diff = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const date = new Date(createdAt);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function publicPost(post) {
  const isPrivate = post.visibility === 'private';
  return {
    id: post.slug,
    slug: post.slug,
    no: post.no,
    category: post.category,
    title: isPrivate ? '비공개 질문입니다.' : post.title,
    message: isPrivate ? '비공개 질문은 관리자만 확인할 수 있습니다.' : post.message,
    nickname: isPrivate ? '비공개' : (post.nickname || '익명'),
    status: post.answer ? '답변완료' : '답변대기',
    time: displayTime(post.createdAt),
    href: isPrivate ? '' : `/board/${post.slug}`,
    answer: isPrivate ? '' : (post.answer || '')
  };
}

function adminPost(post) {
  return {
    ...post,
    id: post.slug,
    status: post.answer ? '답변완료' : '답변대기',
    time: displayTime(post.createdAt),
    href: post.visibility === 'private' ? '' : `/board/${post.slug}`
  };
}

export async function createBoardPost(env, input) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_POSTS binding is not configured');

  const visibility = clean(input.visibility || 'public', 20) === 'private' ? 'private' : 'public';
  const category = clean(input.category || '기타', 40) || '기타';
  const title = clean(input.title, 100);
  const message = bodyClean(input.message, 1800);
  const nickname = clean(input.nickname || '익명', 40) || '익명';
  const privateName = clean(input.private_name || input.privateName || '', 40);
  const privatePhone = clean(input.private_phone || input.privatePhone || '', 20).replace(/[^0-9]/g, '').slice(0, 11);

  if (!title || !message) throw new Error('제목과 질문 내용을 입력해주세요.');
  if (visibility === 'private' && (!privateName || !privatePhone)) throw new Error('비공개 질문은 이름과 전화번호가 필요합니다.');

  const slug = makeSlug(category);
  const createdAt = new Date().toISOString();
  const index = await readJson(kv, INDEX_KEY, []);
  const no = 1000 + index.length + 1;

  const post = {
    slug,
    no,
    visibility,
    category,
    title,
    message,
    nickname,
    privateName: visibility === 'private' ? privateName : '',
    privatePhone: visibility === 'private' ? privatePhone : '',
    answer: '',
    createdAt,
    updatedAt: createdAt,
    deleted: false
  };

  await writeJson(kv, postKey(slug), post);
  const nextIndex = [slug].concat(index.filter((item) => item !== slug)).slice(0, MAX_LIST);
  await writeJson(kv, INDEX_KEY, nextIndex);
  return post;
}

export async function getBoardPost(env, slug, { includePrivate = false } = {}) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_POSTS binding is not configured');
  const post = await readJson(kv, postKey(slug), null);
  if (!post || post.deleted) return null;
  if (!includePrivate && post.visibility === 'private') return null;
  return post;
}

export async function listBoardPosts(env, { publicOnly = true } = {}) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_POSTS binding is not configured');
  const index = await readJson(kv, INDEX_KEY, []);
  const posts = [];
  for (const slug of index.slice(0, MAX_LIST)) {
    const post = await readJson(kv, postKey(slug), null);
    if (!post || post.deleted) continue;
    posts.push(publicOnly ? publicPost(post) : adminPost(post));
  }
  return posts;
}

export async function answerBoardPost(env, slug, answer) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_POSTS binding is not configured');
  const post = await readJson(kv, postKey(slug), null);
  if (!post || post.deleted) return null;
  post.answer = bodyClean(answer, 3000);
  post.answeredAt = new Date().toISOString();
  post.updatedAt = post.answeredAt;
  await writeJson(kv, postKey(slug), post);
  return post;
}

export async function deleteBoardPost(env, slug) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_POSTS binding is not configured');
  const post = await readJson(kv, postKey(slug), null);
  if (!post) return false;
  post.deleted = true;
  post.updatedAt = new Date().toISOString();
  await writeJson(kv, postKey(slug), post);
  return true;
}

export function renderBoardPost(post) {
  const path = `/board/${post.slug}`;
  const canonical = `${SITE.url}${path}`;
  const description = `${post.message}`.replace(/\s+/g, ' ').slice(0, 150);
  const title = `${post.title} | ${SITE.name}`;
  const hasAnswer = Boolean(post.answer);
  const schema = {
    '@context': 'https://schema.org',
    '@type': hasAnswer ? 'QAPage' : 'Article',
    mainEntity: hasAnswer ? {
      '@type': 'Question',
      name: post.title,
      text: post.message,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: post.answer,
        dateCreated: post.answeredAt || post.updatedAt || post.createdAt
      }
    } : undefined,
    headline: post.title,
    description,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { '@type': 'Person', name: post.nickname || '익명' },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: canonical
  };

  const schemaClean = JSON.stringify(schema, (key, value) => value === undefined ? undefined : value);

  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${esc(title)}</title><meta name="description" content="${esc(description)}"/><meta name="robots" content="index,follow,max-image-preview:large"/><link rel="canonical" href="${canonical}"/><meta property="og:locale" content="ko_KR"/><meta property="og:type" content="article"/><meta property="og:site_name" content="${esc(SITE.name)}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${canonical}"/><link rel="preconnect" href="https://cdn.jsdelivr.net"/><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"/><link rel="stylesheet" href="/assets/css/styles.css?v=20260709-private-board-v2"/><script type="application/ld+json">${schemaClean}</script></head><body><header class="site-header"><div class="wrap header-inner"><a class="brand" href="/">${esc(SITE.name)}</a><nav class="nav"><a href="/#board">질문게시판</a><a href="/#write">질문남기기</a></nav></div></header><main><section class="content-hero"><div class="wrap"><div class="breadcrumb"><a href="/">홈</a> / <a href="/#board">질문게시판</a> / ${esc(post.category)}</div><h1>${esc(post.title)}</h1><p>${esc(description)}</p><div class="pill-row"><span>${esc(post.category)}</span><span>${esc(post.answer ? '답변완료' : '답변대기')}</span><span>${esc(displayTime(post.createdAt))}</span></div></div></section><div class="wrap content-layout"><article class="article-card"><h2>질문 내용</h2><p>${esc(post.message).replace(/\n/g, '<br/>')}</p><h2>답변</h2>${hasAnswer ? `<p>${esc(post.answer).replace(/\n/g, '<br/>')}</p>` : '<p>아직 답변이 등록되지 않았습니다.</p>'}<div class="notice">본 게시글은 보험플레이 질문 게시판에 등록된 내용입니다. 보험료와 가입 가능 여부는 개인 조건에 따라 달라질 수 있습니다.</div></article><aside class="side-card"><h3>다른 보험 질문 보기</h3><p>비슷한 질문을 더 확인하거나 새 질문을 남겨보세요.</p><a class="btn" href="/#board">질문게시판으로 이동</a><a class="btn" href="/#write" style="margin-top:10px;background:#fff;color:#111">질문 남기기</a></aside></div></main><footer class="footer"><div class="wrap footer-inner"><p><strong>${esc(SITE.company)}</strong> · 대표 ${esc(SITE.owner)} · 사업자번호 ${esc(SITE.businessNumber)}</p><nav><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></nav></div></footer></body></html>`;
}
