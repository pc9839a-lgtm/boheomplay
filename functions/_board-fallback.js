function clean(value, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

function encodePreview(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function publicFallbackResponse(input = {}) {
  const id = `local-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const category = clean(input.category || '기타', 40);
  const title = clean(input.title, 100);
  const message = clean(input.message, 1800);
  const nickname = clean(input.nickname || '익명', 40) || '익명';
  const token = encodePreview({ id, category, title, message, nickname });

  return new Response(JSON.stringify({
    ok: true,
    fallback: true,
    post: {
      id,
      slug: id,
      no: 'NEW',
      category,
      title,
      message,
      nickname,
      status: '답변대기',
      time: '방금 전',
      href: `/q/local-preview?d=${encodeURIComponent(token)}`,
      answer: ''
    }
  }), {
    status: 201,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}
