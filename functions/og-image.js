const PARTS = [
  'part01.txt',
  'part02.txt',
  'part03.txt',
  'part04.txt',
  'part05.txt',
  'part06a.txt',
  'part06b.txt',
  'part07a.txt',
  'part07b.txt',
  'part08a1.txt',
  'part08b01.txt',
  'part08b02.txt',
  'part08b03.txt',
  'part08b04.txt',
  'part08b05.txt',
  'part08b06.txt'
];

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function onRequest({ request }) {
  try {
    const origin = new URL(request.url).origin;
    const chunks = await Promise.all(PARTS.map(async (name) => {
      const response = await fetch(`${origin}/og-b64/${name}`);
      if (!response.ok) throw new Error(`Missing image part: ${name}`);
      return response.text();
    }));

    const base64 = chunks.join('').replace(/\s+/g, '');
    const bytes = decodeBase64(base64);

    if (bytes.length !== 26207) {
      return new Response('Invalid OG image data', { status: 500 });
    }

    return new Response(bytes, {
      headers: {
        'content-type': 'image/jpeg',
        'content-length': String(bytes.length),
        'cache-control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    return new Response('OG image unavailable', { status: 500 });
  }
}
