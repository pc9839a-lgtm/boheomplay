const PARTS = [
  'part01.txt', 'part02.txt', 'part03.txt', 'part04.txt', 'part05.txt',
  'part06a.txt', 'part06b.txt', 'part07a.txt', 'part07b.txt', 'part08a1.txt',
  'part08b01.txt', 'part08b02.txt', 'part08b03.txt', 'part08b04.txt',
  'part08b05.txt', 'part08b06.txt'
];

const EXPECTED_SHA256 = '733c1f029fa1d571eee41e651699ad1c03a0459806660d96112b78555e9f790f';

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function onRequest({ request, env }) {
  try {
    const origin = new URL(request.url).origin;
    const chunks = await Promise.all(PARTS.map(async (name) => {
      const assetRequest = new Request(`${origin}/og-b64/${name}`);
      const response = env?.ASSETS?.fetch
        ? await env.ASSETS.fetch(assetRequest)
        : await fetch(assetRequest);
      if (!response.ok) throw new Error(`Missing image part: ${name}`);
      return response.text();
    }));

    const bytes = decodeBase64(chunks.join('').replace(/\s+/g, ''));
    const digest = toHex(await crypto.subtle.digest('SHA-256', bytes));

    if (bytes.length !== 26207 || digest !== EXPECTED_SHA256) {
      return new Response('Invalid OG image data', { status: 500 });
    }

    return new Response(bytes, {
      headers: {
        'content-type': 'image/jpeg',
        'cache-control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return new Response('OG image unavailable', { status: 500 });
  }
}
