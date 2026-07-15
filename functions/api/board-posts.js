const STORE_KEY = 'board:all-posts:v2';
const MAX_POSTS = 100;
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

const ALLOWED_CATEGORIES = new Set(Object.keys(CATEGORY_PREFIX));

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      'x-board-version': 'direct-kv-v9',
      ...headers
    }
  });
}

function clean(value, max = 1000) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

function cleanBody(value, max = 1800) {
  return clean(value, max)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function agreed(value) {
  return value === true || value === 'true' || value === '1' || value === 'yes';
}

function makeSlug(category) {
  const prefix = CATEGORY_PREFIX[category] || 'question';
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePosts(value) {
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
    .slice(0, MAX_POSTS);
}

async function readPosts(kv) {
  const raw = await kv.get(STORE_KEY);
  if (!raw) return [];
  try {
    return normalizePosts(JSON.parse(raw));
  } catch (error) {
    return [];
  }
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

function errorResponse(code, status, detail = '') {
  const messages = {
    BOARD_STORE_NOT_CONFIGURED: '질문 저장소가 연결되지 않았습니다.',
    INVALID_JSON: '질문 데이터를 읽지 못했습니다.',
    CONSENT_REQUIRED: '개인정보 및 건강정보 처리 동의가 필요합니다.',
    PUBLIC_CONSENT_REQUIRED: '공개 게시 및 검색 노출 동의가 필요합니다.',
    INVALID_CATEGORY: '분류를 다시 선택해주세요.',
    TITLE_TOO_SHORT: '제목을 5자 이상 입력해주세요.',
    MESSAGE_TOO_SHORT: '질문 내용을 15자 이상 입력해주세요.',
    INVALID_NAME: '이름을 정확히 입력해주세요.',
    INVALID_PHONE: '전화번호를 정확히 입력해주세요.',
    BOARD_STORE_WRITE_FAILED: '질문 저장에 실패했습니다.'
  };
  return json({ ok: false, code, detail, error: messages[code] || '질문 저장에 실패했습니다.' }, status);
}

export async function onRequestGet({ env }) {
  const kv = env?.BOARD_POSTS || env?.SECURITY_STORE || null;
  if (!kv) return errorResponse('BOARD_STORE_NOT_CONFIGURED', 503);

  try {
    const posts = await readPosts(kv);
    return json({
      ok: true,
      stored: true,
      storageKey: STORE_KEY,
      userPostCount: posts.length,
      posts: posts
        .filter((post) => post.visibility !== 'private')
        .map(publicPost)
    });
  } catch (error) {
    return errorResponse('BOARD_STORE_WRITE_FAILED', 500, `${error?.name || 'Error'}: ${error?.message || 'GET_FAILED'}`);
  }
}

export async function onRequestPost({ request, env }) {
  const kv = env?.BOARD_POSTS || env?.SECURITY_STORE || null;
  if (!kv) return errorResponse('BOARD_STORE_NOT_CONFIGURED', 503);

  let raw;
  try {
    raw = await request.json();
  } catch (error) {
    return errorResponse('INVALID_JSON', 400, `${error?.name || 'Error'}: ${error?.message || 'INVALID_JSON'}`);
  }

  const input = {
    visibility: raw.visibility === 'private' ? 'private' : 'public',
    category: clean(raw.category || '기타', 40),
    title: clean(raw.title, 100),
    message: cleanBody(raw.message, 1800),
    nickname: clean(raw.nickname || '익명', 40) || '익명',
    privateName: clean(raw.private_name || raw.privateName, 40),
    privatePhone: String(raw.private_phone || raw.privatePhone || '').replace(/\D/g, '').slice(0, 11),
    privacyConsent: agreed(raw.privacy_consent),
    sensitiveConsent: agreed(raw.sensitive_consent),
    publicConsent: agreed(raw.public_consent),
    consentVersion: clean(raw.consent_version || '2026-07-12-v1', 40)
  };

  if (!input.privacyConsent || !input.sensitiveConsent) return errorResponse('CONSENT_REQUIRED', 400);
  if (input.visibility === 'public' && !input.publicConsent) return errorResponse('PUBLIC_CONSENT_REQUIRED', 400);
  if (!ALLOWED_CATEGORIES.has(input.category)) return errorResponse('INVALID_CATEGORY', 400);
  if (input.title.length < 5) return errorResponse('TITLE_TOO_SHORT', 400);
  if (input.message.length < 15) return errorResponse('MESSAGE_TOO_SHORT', 400);
  if (input.visibility === 'private' && input.privateName.length < 2) return errorResponse('INVALID_NAME', 400);
  if (input.visibility === 'private' && !/^01[016789]\d{7,8}$/.test(input.privatePhone)) return errorResponse('INVALID_PHONE', 400);

  try {
    const current = await readPosts(kv);
    const maxNo = current.reduce((max, post) => Math.max(max, Number(post.no) || 0), BASE_NO);
    const createdAt = new Date().toISOString();
    const post = {
      slug: makeSlug(input.category),
      no: maxNo + 1,
      visibility: input.visibility,
      category: input.category,
      title: input.title,
      message: input.message,
      nickname: input.nickname,
      privateName: input.visibility === 'private' ? input.privateName : '',
      privatePhone: input.visibility === 'private' ? input.privatePhone : '',
      answer: '',
      createdAt,
      updatedAt: createdAt,
      deleted: false,
      consent: {
        privacy: input.privacyConsent,
        sensitive: input.sensitiveConsent,
        publicPosting: input.publicConsent,
        version: input.consentVersion,
        consentedAt: createdAt
      }
    };

    const next = normalizePosts([post, ...current]);
    await kv.put(STORE_KEY, JSON.stringify(next));

    return json({
      ok: true,
      stored: true,
      storageKey: STORE_KEY,
      post: input.visibility === 'private'
        ? {
            id: post.slug,
            slug: post.slug,
            no: post.no,
            category: post.category,
            title: '비공개 질문입니다.',
            message: '비공개 질문은 관리자만 확인할 수 있습니다.',
            nickname: '비공개',
            status: '답변대기',
            time: '방금 전',
            href: ''
          }
        : publicPost(post)
    }, 201);
  } catch (error) {
    return errorResponse(
      'BOARD_STORE_WRITE_FAILED',
      500,
      `${error?.name || 'Error'}: ${error?.message || 'KV_PUT_FAILED'}`.slice(0, 500)
    );
  }
}
