import { renderUnifiedQuestionPage } from './_unified-question.js';

const INDEX_KEY = 'board:index';
const LIST_KEY = 'board:posts:v2';
const POST_PREFIX = 'board:post:';
const MAX_LIST = 100;
const BASE_NO = 1017;

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

export function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=120'
    }
  });
}

export function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function store(env) {
  return env.BOARD_POSTS || env.SECURITY_STORE || null;
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

async function writeJson(kv, key, value, options) {
  await kv.put(key, JSON.stringify(value), options);
}

function clean(value = '', max = 1000) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function bodyClean(value = '', max = 1800) {
  return String(value || '')
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, max);
}

function makeSlug(category) {
  const prefix = CATEGORY_PREFIX[category] || 'question';
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

function displayTime(createdAt) {
  if (!createdAt) return '방금 전';
  const diff = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const date = new Date(createdAt);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeStoredPosts(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .filter((post) => post && typeof post === 'object' && post.slug && !post.deleted)
    .filter((post) => {
      if (seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, MAX_LIST);
}

async function recoverStoredPosts(kv) {
  const indexedSlugs = await readJson(kv, INDEX_KEY, []);
  const slugs = Array.isArray(indexedSlugs) ? indexedSlugs.filter(Boolean) : [];

  try {
    const listed = await kv.list({ prefix: POST_PREFIX, limit: 1000 });
    for (const key of listed.keys || []) {
      const slug = String(key.name || '').slice(POST_PREFIX.length);
      if (slug && !slugs.includes(slug)) slugs.push(slug);
    }
  } catch (error) {
    // Index-based recovery still works when list is unavailable.
  }

  const posts = [];
  for (const slug of slugs.slice(0, MAX_LIST)) {
    const post = await readJson(kv, postKey(slug), null);
    if (post && !post.deleted) posts.push(post);
  }
  return normalizeStoredPosts(posts);
}

async function readStoredPosts(kv) {
  const stored = normalizeStoredPosts(await readJson(kv, LIST_KEY, []));
  if (stored.length) return stored;

  const recovered = await recoverStoredPosts(kv);
  if (recovered.length) {
    try {
      await writeJson(kv, LIST_KEY, recovered);
      await writeJson(kv, INDEX_KEY, recovered.map((post) => post.slug));
    } catch (error) {
      // Reading must remain available even if repair writes fail.
    }
  }
  return recovered;
}

async function persistStoredPosts(kv, posts) {
  const normalized = normalizeStoredPosts(posts);
  await writeJson(kv, LIST_KEY, normalized);
  await writeJson(kv, INDEX_KEY, normalized.map((post) => post.slug));
  return normalized;
}

function publicPost(post) {
  return {
    id: post.slug,
    slug: post.slug,
    no: post.no,
    category: post.category,
    title: post.title,
    message: post.message,
    nickname: post.nickname || '익명',
    status: post.answer ? '답변완료' : '답변대기',
    time: displayTime(post.createdAt),
    href: `/board/${post.slug}`,
    answer: post.answer || ''
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
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');

  const visibility = clean(input.visibility || 'public', 20) === 'private' ? 'private' : 'public';
  const category = clean(input.category || '기타', 40) || '기타';
  const title = clean(input.title, 100);
  const message = bodyClean(input.message, 1800);
  const nickname = clean(input.nickname || '익명', 40) || '익명';
  const privateName = clean(input.private_name || input.privateName || '', 40);
  const privatePhone = clean(input.private_phone || input.privatePhone || '', 20)
    .replace(/[^0-9]/g, '')
    .slice(0, 11);

  if (!title || !message) throw new Error('INVALID_POST');
  if (visibility === 'private' && (!privateName || !privatePhone)) throw new Error('PRIVATE_CONTACT_REQUIRED');

  const currentPosts = await readStoredPosts(kv);
  const maxNo = currentPosts.reduce((max, post) => Math.max(max, Number(post.no) || 0), BASE_NO);
  const slug = makeSlug(category);
  const createdAt = new Date().toISOString();

  const post = {
    slug,
    no: maxNo + 1,
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
  await persistStoredPosts(kv, [post, ...currentPosts]);
  return post;
}

export async function getBoardPost(env, slug, { includePrivate = false } = {}) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  let post = await readJson(kv, postKey(slug), null);
  if (!post) {
    const posts = await readStoredPosts(kv);
    post = posts.find((item) => item.slug === slug) || null;
  }
  if (!post || post.deleted) return null;
  if (!includePrivate && post.visibility === 'private') return null;
  return post;
}

export async function listBoardPosts(env, { publicOnly = true } = {}) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  const posts = await readStoredPosts(kv);
  return posts
    .filter((post) => !(publicOnly && post.visibility === 'private'))
    .map((post) => publicOnly ? publicPost(post) : adminPost(post));
}

export async function answerBoardPost(env, slug, answer) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  const posts = await readStoredPosts(kv);
  const index = posts.findIndex((item) => item.slug === slug);
  let post = index >= 0 ? posts[index] : await readJson(kv, postKey(slug), null);
  if (!post || post.deleted) return null;

  post = {
    ...post,
    answer: bodyClean(answer, 3000),
    answeredAt: new Date().toISOString()
  };
  post.updatedAt = post.answeredAt;

  const nextPosts = index >= 0
    ? posts.map((item, itemIndex) => itemIndex === index ? post : item)
    : [post, ...posts];

  await writeJson(kv, postKey(slug), post);
  await persistStoredPosts(kv, nextPosts);
  return post;
}

export async function deleteBoardPost(env, slug) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  const posts = await readStoredPosts(kv);
  const post = posts.find((item) => item.slug === slug) || await readJson(kv, postKey(slug), null);
  if (!post) return false;

  const deletedPost = {
    ...post,
    deleted: true,
    updatedAt: new Date().toISOString()
  };
  await writeJson(kv, postKey(slug), deletedPost);
  await persistStoredPosts(kv, posts.filter((item) => item.slug !== slug));
  return true;
}

export function renderBoardPost(post) {
  const hasAnswer = Boolean(post.answer);
  return renderUnifiedQuestionPage({
    slug: post.slug,
    title: post.title,
    category: post.category,
    question: post.message,
    lead: hasAnswer
      ? post.answer
      : '질문이 정상적으로 접수되었습니다. 아직 답변이 등록되지 않았습니다.',
    point: hasAnswer
      ? '본 답변은 질문에 기재된 내용을 기준으로 제공되었습니다.'
      : '현재 답변대기 상태입니다.',
    bullets: hasAnswer ? [] : [
      '관리자가 질문 내용을 확인한 뒤 답변을 등록합니다.',
      '답변 전에는 특정 상품의 가입 가능 여부를 확정할 수 없습니다.'
    ],
    close: hasAnswer
      ? '보험 가입·변경·해지 전에는 해당 계약의 약관과 상품설명서를 함께 확인하세요.'
      : '답변이 등록되면 같은 질문 상세페이지에서 확인할 수 있습니다.',
    updatedAt: post.updatedAt || post.createdAt
  }, []);
}
