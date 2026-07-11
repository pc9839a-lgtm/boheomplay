const DEFAULT_BODY_LIMIT = 12_000;

function getStore(env) {
  return env.SECURITY_STORE || env.BOARD_POSTS || null;
}

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function clientIp(request) {
  return String(
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown'
  ).split(',')[0].trim().slice(0, 64);
}

export async function hashValue(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(value)));
  return encodeBase64Url(new Uint8Array(digest));
}

export async function clientKey(request) {
  return (await hashValue(clientIp(request))).slice(0, 32);
}

export function constantTimeEqual(left, right) {
  const a = new TextEncoder().encode(String(left || ''));
  const b = new TextEncoder().encode(String(right || ''));
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let index = 0; index < max; index += 1) {
    diff |= (a[index] || 0) ^ (b[index] || 0);
  }
  return diff === 0;
}

export function isSameOrigin(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const method = String(request.method || 'GET').toUpperCase();
  const isUnsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  if (isUnsafeMethod && !origin) return false;
  if (origin && origin !== url.origin) return false;

  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;

  return true;
}

export async function readJsonBody(request, maxBytes = DEFAULT_BODY_LIMIT) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('UNSUPPORTED_MEDIA_TYPE');
  }

  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) throw new Error('PAYLOAD_TOO_LARGE');

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error('PAYLOAD_TOO_LARGE');
  }

  try {
    const parsed = JSON.parse(text || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch (error) {
    throw new Error('INVALID_JSON');
  }
}

export async function consumeRateLimit(env, namespace, identifier, limit, windowSeconds) {
  const store = getStore(env);
  if (!store) return { allowed: true, retryAfter: 0 };

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `security:rate:${namespace}:${identifier}`;
  let timestamps = [];

  try {
    const raw = await store.get(key);
    if (raw) timestamps = JSON.parse(raw);
    if (!Array.isArray(timestamps)) timestamps = [];
  } catch (error) {
    timestamps = [];
  }

  timestamps = timestamps
    .map(Number)
    .filter((value) => Number.isFinite(value) && now - value < windowMs);

  if (timestamps.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - timestamps[0])) / 1000));
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  await store.put(key, JSON.stringify(timestamps), {
    expirationTtl: Math.max(60, windowSeconds + 60)
  });

  return { allowed: true, retryAfter: 0 };
}

export async function clearRateLimit(env, namespace, identifier) {
  const store = getStore(env);
  if (!store) return;
  await store.delete(`security:rate:${namespace}:${identifier}`);
}

export async function claimDuplicate(env, namespace, value, ttlSeconds) {
  const store = getStore(env);
  if (!store) return true;

  const digest = (await hashValue(value)).slice(0, 43);
  const key = `security:duplicate:${namespace}:${digest}`;
  const exists = await store.get(key);
  if (exists) return false;

  await store.put(key, '1', { expirationTtl: Math.max(60, ttlSeconds) });
  return true;
}

export function stripUnsafeControls(value = '') {
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
}

export function spamReason(title, message) {
  const combined = `${title}\n${message}`;
  const urls = combined.match(/(?:https?:\/\/|www\.)\S+/gi) || [];
  if (urls.length > 1) return 'TOO_MANY_LINKS';
  if (/(.)\1{14,}/u.test(combined)) return 'REPEATED_CHARACTERS';
  if (/카지노|바카라|토토|사설도박|성인광고|조건만남|코인리딩|수익보장/iu.test(combined)) {
    return 'SPAM_KEYWORD';
  }
  return '';
}

export function safeJsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
