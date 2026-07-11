import { constantTimeEqual, isSameOrigin } from './_security.js';

export const ADMIN_COOKIE = '__Host-bp_admin';
const LEGACY_COOKIE = 'bp_admin';
const SESSION_SECONDS = 60 * 60 * 4;

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate',
      'x-content-type-options': 'nosniff',
      ...headers
    }
  });
}

function parseCookie(cookieHeader = '') {
  const result = {};
  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (!key) continue;
    try {
      result[key] = decodeURIComponent(valueParts.join('=') || '');
    } catch (error) {
      result[key] = '';
    }
  }
  return result;
}

function base64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64Url(signature);
}

export async function createAdminToken(secret) {
  const issued = Date.now();
  const expires = issued + SESSION_SECONDS * 1000;
  const nonce = crypto.randomUUID();
  const payload = `${issued}.${expires}.${nonce}`;
  return `${payload}.${await sign(payload, secret)}`;
}

async function isValidToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 4) return false;

  const [issuedRaw, expiresRaw, nonce, signature] = parts;
  if (!/^\d{13}$/.test(issuedRaw) || !/^\d{13}$/.test(expiresRaw)) return false;
  if (!/^[0-9a-f-]{36}$/i.test(nonce) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return false;

  const issued = Number(issuedRaw);
  const expires = Number(expiresRaw);
  const now = Date.now();
  if (!Number.isFinite(issued) || !Number.isFinite(expires)) return false;
  if (issued > now + 60_000 || expires <= now || expires - issued > SESSION_SECONDS * 1000 + 60_000) return false;

  const expected = await sign(`${issuedRaw}.${expiresRaw}.${nonce}`, secret);
  return constantTimeEqual(signature, expected);
}

export function adminCookie(token) {
  return `${ADMIN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}; Priority=High`;
}

export function clearAdminCookieHeaders() {
  return [
    `${ADMIN_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    `${LEGACY_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  ];
}

export async function requireAdmin(request, env) {
  const secret = String(env.ADMIN_SESSION_SECRET || '');
  if (secret.length < 32 || !isSameOrigin(request)) return false;

  const cookies = parseCookie(request.headers.get('cookie') || '');
  const token = cookies[ADMIN_COOKIE] || cookies[LEGACY_COOKIE] || '';
  return isValidToken(token, secret);
}
