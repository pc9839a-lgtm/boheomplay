const KAKAO_URL = 'https://open.kakao.com/o/sjY0EnDi';
const MARKER = 'data-qa-compliance="required-v1"';

const REQUIRED_BLOCK = `
<section ${MARKER} style="margin:26px 0 0">
  <div style="padding:19px 20px;border:1px solid #e3e3e3;background:#fafafa;color:#444;font-size:14px;line-height:1.75">
    본 답변은 일반적인 정보 제공 목적입니다. 기존 보험 해지 전에는 보장 공백과 재가입 가능성을 함께 확인해야 합니다.
  </div>
  <div style="margin-top:22px;padding:21px 22px;background:#111;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:18px">
    <strong style="font-size:16px">내 보험 기준으로 바로 묻기</strong>
    <a href="${KAKAO_URL}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;border-radius:999px;background:#fff;color:#111;text-decoration:none;font-weight:900;white-space:nowrap">일반 보험 질문 문의</a>
  </div>
  <div style="margin-top:22px;padding:19px 20px;border:1px solid #e3e3e3;background:#fafafa;color:#444;font-size:14px;line-height:1.75">
    본 답변은 질문에 기재된 제한된 내용을 기준으로 제공되는 일반적인 정보입니다. 특정 보험상품의 가입 권유나 계약 체결을 위한 설명이 아니며, 보험 가입·변경·해지 전에는 해당 상품의 약관과 상품설명서를 확인해야 합니다.<br>
    보험협회 고유번호: 20260217401069<br>
    <strong style="display:block;margin-top:8px;color:#333">보험모집종사자: 김도윤 · 소속: 지에이코리아주식회사 · 보험협회 고유번호: 20260217401069</strong>
  </div>
</section>`;

function alreadyHasRequiredBlock(html) {
  return html.includes(MARKER) || (
    html.includes('본 답변은 일반적인 정보 제공 목적입니다.') &&
    html.includes('내 보험 기준으로 바로 묻기') &&
    html.includes('일반 보험 질문 문의') &&
    html.includes('보험모집종사자: 김도윤') &&
    html.includes('지에이코리아주식회사') &&
    html.includes('20260217401069')
  );
}

function injectRequiredBlock(html) {
  if (alreadyHasRequiredBlock(html)) return html;
  if (!html.includes('</article>')) return html;
  return html.replace('</article>', `${REQUIRED_BLOCK}</article>`);
}

export async function onRequest(context) {
  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || response.status >= 400) return response;

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  const html = injectRequiredBlock(await response.text());

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
