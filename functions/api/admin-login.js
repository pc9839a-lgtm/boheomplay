import { adminCookie, createAdminToken, json } from '../_admin-auth.js';
import {
  clearRateLimit,
  clientKey,
  constantTimeEqual,
  consumeRateLimit,
  isSameOrigin,
  readJsonBody
} from '../_security.js';

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return json({ ok: false, error: '로그인할 수 없습니다.' }, 403);
  }

  const expectedPassword = String(env.ADMIN_PASSWORD || '');
  const sessionSecret = String(env.ADMIN_SESSION_SECRET || '');
  if (expectedPassword.length < 12 || sessionSecret.length < 32) {
    return json({ ok: false, error: '관리자 보안 설정이 필요합니다.' }, 503);
  }

  const identity = await clientKey(request);
  const rate = await consumeRateLimit(env, 'admin-login', identity, 5, 900);
  if (!rate.allowed) {
    return json(
      { ok: false, error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      429,
      { 'retry-after': String(rate.retryAfter) }
    );
  }

  let password = '';
  try {
    const body = await readJsonBody(request, 2_048);
    password = String(body.password || '').slice(0, 256);
  } catch (error) {
    const status = error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400;
    return json({ ok: false, error: '요청을 확인해주세요.' }, status);
  }

  if (!constantTimeEqual(password, expectedPassword)) {
    return json({ ok: false, error: '비밀번호가 올바르지 않습니다.' }, 401);
  }

  await clearRateLimit(env, 'admin-login', identity);
  const token = await createAdminToken(sessionSecret);
  return json({ ok: true }, 200, { 'set-cookie': adminCookie(token) });
}
