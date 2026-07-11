import { createBoardPost, listBoardPosts, json } from '../_board.js';
import {
  claimDuplicate,
  clientKey,
  consumeRateLimit,
  isSameOrigin,
  readJsonBody,
  spamReason,
  stripUnsafeControls
} from '../_security.js';

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

function validationError(input) {
  if (String(input.website || '').trim()) return 'BOT_DETECTED';
  if (!ALLOWED_CATEGORIES.has(input.category)) return 'INVALID_CATEGORY';
  if (input.title.length < 5) return 'TITLE_TOO_SHORT';
  if (input.message.length < 15) return 'MESSAGE_TOO_SHORT';
  if (input.visibility === 'private' && input.private_name.length < 2) return 'INVALID_NAME';
  if (input.visibility === 'private' && !/^01[016789]\d{7,8}$/.test(input.private_phone)) {
    return 'INVALID_PHONE';
  }
  return spamReason(input.title, input.message);
}

function errorResponse(code, status = 400, headers = {}) {
  const messages = {
    BOT_DETECTED: '등록할 수 없는 요청입니다.',
    INVALID_CATEGORY: '분류를 다시 선택해주세요.',
    TITLE_TOO_SHORT: '제목을 5자 이상 입력해주세요.',
    MESSAGE_TOO_SHORT: '질문 내용을 15자 이상 입력해주세요.',
    INVALID_NAME: '이름을 정확히 입력해주세요.',
    INVALID_PHONE: '전화번호를 정확히 입력해주세요.',
    TOO_MANY_LINKS: '질문에는 링크를 한 개까지만 넣을 수 있습니다.',
    REPEATED_CHARACTERS: '반복 문자를 줄여주세요.',
    SPAM_KEYWORD: '스팸으로 의심되는 내용은 등록할 수 없습니다.',
    DUPLICATE: '같은 질문이 이미 등록되었습니다.',
    RATE_LIMITED: '질문을 너무 자주 등록했습니다. 잠시 후 다시 시도해주세요.'
  };
  return json({ ok: false, error: messages[code] || '요청을 처리할 수 없습니다.' }, status, headers);
}

export async function onRequestGet({ env }) {
  try {
    const posts = await listBoardPosts(env, { publicOnly: true });
    return json({ ok: true, posts }, 200, {
      'cache-control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=60'
    });
  } catch (error) {
    return json({ ok: false, error: '게시글을 불러오지 못했습니다.', posts: [] }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return errorResponse('BOT_DETECTED', 403);

  try {
    const raw = await readJsonBody(request, 12_000);
    const identity = await clientKey(request);

    const shortWindow = await consumeRateLimit(env, 'board-10m', identity, 3, 600);
    if (!shortWindow.allowed) {
      return errorResponse('RATE_LIMITED', 429, { 'retry-after': String(shortWindow.retryAfter) });
    }

    const dailyWindow = await consumeRateLimit(env, 'board-day', identity, 10, 86_400);
    if (!dailyWindow.allowed) {
      return errorResponse('RATE_LIMITED', 429, { 'retry-after': String(dailyWindow.retryAfter) });
    }

    const input = {
      visibility: raw.visibility === 'private' ? 'private' : 'public',
      category: safeText(raw.category || '기타', 40),
      title: safeText(raw.title, 100),
      message: safeText(raw.message, 1800),
      nickname: safeText(raw.nickname || '익명', 40) || '익명',
      private_name: safeText(raw.private_name || raw.privateName, 40),
      private_phone: String(raw.private_phone || raw.privatePhone || '').replace(/\D/g, '').slice(0, 11),
      website: safeText(raw.website, 100)
    };

    const invalid = validationError(input);
    if (invalid) return errorResponse(invalid, invalid === 'BOT_DETECTED' ? 403 : 400);

    const duplicateValue = `${identity}|${input.visibility}|${input.category}|${input.title}|${input.message}`;
    if (!(await claimDuplicate(env, 'board-post', duplicateValue, 21_600))) {
      return errorResponse('DUPLICATE', 409);
    }

    const post = await createBoardPost(env, input);
    return json({
      ok: true,
      post: {
        id: post.slug,
        slug: post.slug,
        no: post.no,
        category: post.category,
        title: post.visibility === 'private' ? '비공개 질문입니다.' : post.title,
        message: post.visibility === 'private' ? '비공개 질문은 관리자만 확인할 수 있습니다.' : post.message,
        nickname: post.visibility === 'private' ? '비공개' : post.nickname,
        status: '답변대기',
        time: '방금 전',
        href: post.visibility === 'private' ? '' : `/board/${post.slug}`
      }
    }, 201);
  } catch (error) {
    if (error.message === 'UNSUPPORTED_MEDIA_TYPE') return errorResponse('', 415);
    if (error.message === 'PAYLOAD_TOO_LARGE') return errorResponse('', 413);
    if (error.message === 'INVALID_JSON') return errorResponse('', 400);
    return json({ ok: false, error: '질문 등록에 실패했습니다.' }, 500);
  }
}
