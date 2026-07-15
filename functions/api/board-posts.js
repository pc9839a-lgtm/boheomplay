import { createBoardPost, listBoardPosts, json } from '../_board.js';
import { extraBoardPosts } from '../_extra-qa.js';
import {
  clientKey,
  isSameOrigin,
  readJsonBody,
  spamReason,
  stripUnsafeControls
} from '../_security.js';

const CONSENT_VERSION = '2026-07-12-v1';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const ALLOWED_CATEGORIES = new Set([
  '실비보험',
  '암보험',
  '보험료',
  '보험료 줄이기',
  '유병자보험',
  '부모님 보험',
  '태아보험',
  '태아·어린이보험',
  '운전자보험',
  '치아보험',
  '기타'
]);

function safeText(value, max) {
  return stripUnsafeControls(value)
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

function bodyText(value, max) {
  return stripUnsafeControls(value)
    .replace(/[<>]/g, '')
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, max);
}

function isAgreed(value) {
  return value === true || value === 'true' || value === 'yes' || value === '1';
}

function validationError(input, consent) {
  if (String(input.website || '').trim()) return 'BOT_DETECTED';
  if (!consent.privacy || !consent.sensitive) return 'CONSENT_REQUIRED';
  if (input.visibility === 'public' && !consent.publicPosting) return 'PUBLIC_CONSENT_REQUIRED';
  if (!ALLOWED_CATEGORIES.has(input.category)) return 'INVALID_CATEGORY';
  if (input.title.length < 5) return 'TITLE_TOO_SHORT';
  if (input.message.length < 15) return 'MESSAGE_TOO_SHORT';
  if (input.visibility === 'private' && input.private_name.length < 2) return 'INVALID_NAME';
  if (input.visibility === 'private' && !/^01[016789]\d{7,8}$/.test(input.private_phone)) return 'INVALID_PHONE';
  return spamReason(input.title, input.message);
}

function errorResponse(code, status = 400, headers = {}) {
  const messages = {
    BOT_DETECTED: '등록할 수 없는 요청입니다.',
    CONSENT_REQUIRED: '개인정보 및 건강정보 처리 동의가 필요합니다.',
    PUBLIC_CONSENT_REQUIRED: '공개 질문은 게시판 및 검색 노출 동의가 필요합니다.',
    INVALID_CATEGORY: '분류를 다시 선택해주세요.',
    TITLE_TOO_SHORT: '제목을 5자 이상 입력해주세요.',
    MESSAGE_TOO_SHORT: '질문 내용을 15자 이상 입력해주세요.',
    INVALID_NAME: '이름을 정확히 입력해주세요.',
    INVALID_PHONE: '전화번호를 정확히 입력해주세요.',
    TOO_MANY_LINKS: '질문에는 링크를 한 개까지만 넣을 수 있습니다.',
    REPEATED_CHARACTERS: '반복 문자를 줄여주세요.',
    SPAM_KEYWORD: '스팸으로 의심되는 내용은 등록할 수 없습니다.',
    BOARD_STORE_NOT_CONFIGURED: '질문 저장소가 연결되지 않았습니다.',
    BOARD_STORE_WRITE_FAILED: '질문 저장에 실패했습니다. 잠시 후 다시 등록해주세요.'
  };
  return json({ ok: false, code, error: messages[code] || '요청을 처리할 수 없습니다.' }, status, headers);
}

function mergeBoardPosts(posts) {
  const seen = new Set();
  return (Array.isArray(posts) ? posts : []).concat(extraBoardPosts).filter((post) => {
    const key = post?.slug || post?.id || post?.href || post?.title;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function recordConsent(env, post, consent, identity, request) {
  const kv = env.BOARD_POSTS;
  if (!kv) return;
  await kv.put(`board:consent:${post.slug}`, JSON.stringify({
    postSlug: post.slug,
    visibility: post.visibility,
    privacyConsent: consent.privacy,
    sensitiveConsent: consent.sensitive,
    publicPostingConsent: consent.publicPosting,
    consentVersion: consent.version,
    consentedAt: new Date().toISOString(),
    clientKey: identity,
    userAgent: safeText(request.headers.get('user-agent') || '', 220)
  }), { expirationTtl: ONE_YEAR_SECONDS });
}

function responsePost(post) {
  const isPrivate = post.visibility === 'private';
  return {
    id: post.slug,
    slug: post.slug,
    no: post.no,
    category: post.category,
    title: isPrivate ? '비공개 질문입니다.' : post.title,
    message: isPrivate ? '비공개 질문은 관리자만 확인할 수 있습니다.' : post.message,
    nickname: isPrivate ? '비공개' : post.nickname,
    status: '답변대기',
    time: '방금 전',
    href: isPrivate ? '' : `/board/${post.slug}`
  };
}

export async function onRequestGet({ env }) {
  if (!env.BOARD_POSTS) return errorResponse('BOARD_STORE_NOT_CONFIGURED', 503);

  try {
    const posts = await listBoardPosts(env, { publicOnly: true });
    return json({
      ok: true,
      storageConfigured: true,
      userPostCount: posts.length,
      posts: mergeBoardPosts(posts)
    }, 200, {
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
  } catch (error) {
    return json({
      ok: false,
      code: String(error?.message || 'BOARD_STORE_READ_FAILED'),
      error: '질문 목록을 불러오지 못했습니다.',
      posts: extraBoardPosts
    }, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!isSameOrigin(request)) return errorResponse('BOT_DETECTED', 403);
  if (!env.BOARD_POSTS) return errorResponse('BOARD_STORE_NOT_CONFIGURED', 503);

  try {
    const raw = await readJsonBody(request, 12_000);
    const identity = await clientKey(request);

    const input = {
      visibility: raw.visibility === 'private' ? 'private' : 'public',
      category: safeText(raw.category || '기타', 40),
      title: safeText(raw.title, 100),
      message: bodyText(raw.message, 1800),
      nickname: safeText(raw.nickname || '익명', 40) || '익명',
      private_name: safeText(raw.private_name || raw.privateName, 40),
      private_phone: String(raw.private_phone || raw.privatePhone || '').replace(/\D/g, '').slice(0, 11),
      website: safeText(raw.website, 100)
    };

    const consent = {
      privacy: isAgreed(raw.privacy_consent),
      sensitive: isAgreed(raw.sensitive_consent),
      publicPosting: isAgreed(raw.public_consent),
      version: safeText(raw.consent_version || CONSENT_VERSION, 40) || CONSENT_VERSION
    };

    const invalid = validationError(input, consent);
    if (invalid) return errorResponse(invalid, invalid === 'BOT_DETECTED' ? 403 : 400);

    const post = await createBoardPost(env, input);

    const consentTask = recordConsent(env, post, consent, identity, request).catch(() => undefined);
    if (typeof context.waitUntil === 'function') context.waitUntil(consentTask);

    return json({
      ok: true,
      stored: true,
      storageKey: 'board:all-posts:v1',
      post: responsePost(post)
    }, 201);
  } catch (error) {
    const code = String(error?.message || 'BOARD_STORE_WRITE_FAILED');
    if (code === 'UNSUPPORTED_MEDIA_TYPE') return errorResponse('', 415);
    if (code === 'PAYLOAD_TOO_LARGE') return errorResponse('', 413);
    if (code === 'INVALID_JSON') return errorResponse('', 400);
    if (code === 'BOARD_STORE_NOT_CONFIGURED') return errorResponse(code, 503);
    return json({
      ok: false,
      code: 'BOARD_STORE_WRITE_FAILED',
      detail: code,
      error: '질문 저장에 실패했습니다. 잠시 후 다시 등록해주세요.'
    }, 500);
  }
}
