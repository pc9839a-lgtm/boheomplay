import { renderUnifiedQuestionPage } from './_unified-question.js';

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
  const nextIndex = [slug, ...index.filter((item) => item !== slug)].slice(0, MAX_LIST);
  await writeJson(kv, INDEX_KEY, nextIndex);
  return post;
}

export async function getBoardPost(env, slug, { includePrivate = false } = {}) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  const post = await readJson(kv, postKey(slug), null);
  if (!post || post.deleted) return null;
  if (!includePrivate && post.visibility === 'private') return null;
  return post;
}

export async function listBoardPosts(env, { publicOnly = true } = {}) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  const index = await readJson(kv, INDEX_KEY, []);
  const posts = [];

  for (const slug of index.slice(0, MAX_LIST)) {
    const post = await readJson(kv, postKey(slug), null);
    if (!post || post.deleted) continue;
    if (publicOnly && post.visibility === 'private') continue;
    posts.push(publicOnly ? publicPost(post) : adminPost(post));
  }

  return posts;
}

export async function answerBoardPost(env, slug, answer) {
  const kv = store(env);
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
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
  if (!kv) throw new Error('BOARD_STORE_NOT_CONFIGURED');
  const post = await readJson(kv, postKey(slug), null);
  if (!post) return false;
  post.deleted = true;
  post.updatedAt = new Date().toISOString();
  await writeJson(kv, postKey(slug), post);
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
