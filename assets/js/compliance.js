(function () {
  const CONSENT_VERSION = '2026-07-12-v1';
  const ASSOCIATION_UNIQUE_NUMBER = '20260217401069';
  const ECLEAN_URL = 'https://www.e-cleanins.or.kr/';
  const nativeFetch = window.fetch.bind(window);

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
  }

  function consentState() {
    const form = qs('#questionForm');
    return {
      privacy_consent: Boolean(qs('#privacyConsent', form)?.checked),
      sensitive_consent: Boolean(qs('#sensitiveConsent', form)?.checked),
      public_consent: Boolean(qs('#publicConsent', form)?.checked),
      consent_version: CONSENT_VERSION
    };
  }

  window.fetch = function patchedFetch(input, init) {
    const options = init ? { ...init } : {};
    const method = String(options.method || (input && input.method) || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : String(input?.url || '');

    if (method === 'POST' && /\/api\/board-posts(?:\?|$)/.test(url) && typeof options.body === 'string') {
      try {
        const body = JSON.parse(options.body);
        options.body = JSON.stringify({ ...body, ...consentState() });
      } catch (error) {
        // The server will reject malformed JSON.
      }
    }

    return nativeFetch(input, options);
  };

  function injectStyles() {
    if (qs('#insuranceComplianceStyles')) return;
    const style = document.createElement('style');
    style.id = 'insuranceComplianceStyles';
    style.textContent = `
      .compliance-consents{display:grid;gap:10px;margin:2px 0 4px;padding:18px;border:1px solid #e4e1dc;border-radius:18px;background:#faf9f7}
      .compliance-check{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px;align-items:start;cursor:pointer;color:#222;font-size:14px;line-height:1.55}
      .compliance-check input{width:18px;height:18px;margin:2px 0 0;accent-color:#111}
      .compliance-check strong{font-weight:900}.compliance-check small{display:block;margin-top:3px;color:#666;font-size:12px;line-height:1.55}
      .compliance-sensitive-warning{margin:0;padding:14px 16px;border-radius:14px;background:#fff3f1;color:#8c2d20;font-size:13px;line-height:1.65}
      .compliance-public{display:none}.compliance-public.is-active{display:grid}
      .site-compliance-notice{border-top:1px solid #e5e5e5;background:#f7f7f7}
      .site-compliance-inner{max-width:1180px;margin:0 auto;padding:24px 20px;color:#555;font-size:13px;line-height:1.75}
      .site-compliance-inner strong{display:block;margin-bottom:6px;color:#111;font-size:14px}
      .site-compliance-registration{margin-top:10px;color:#333;font-weight:750}
      .site-compliance-links{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px}
      .site-compliance-links a{color:#111;font-weight:800;text-underline-offset:3px}
      .answer-compliance-note{margin-top:22px;padding:17px 18px;border:1px solid #e5e5e5;background:#fafafa;color:#555;font-size:13px;line-height:1.7}
      @media(max-width:640px){.compliance-consents{padding:15px}.site-compliance-inner{padding:20px 18px}}
    `;
    document.head.appendChild(style);
  }

  function updatePublicConsent() {
    const form = qs('#questionForm');
    const block = qs('.compliance-public', form);
    const input = qs('#publicConsent', form);
    const isPublic = qs('input[name="visibility"]:checked', form)?.value !== 'private';
    if (block) block.classList.toggle('is-active', isPublic);
    if (input) {
      input.required = isPublic;
      if (!isPublic) input.checked = false;
    }
  }

  function installConsentControls() {
    const form = qs('#questionForm');
    if (!form || qs('.compliance-consents', form)) return;

    const submit = qs('button[type="submit"]', form);
    if (!submit) return;

    const controls = createElement(`
      <div class="compliance-consents" aria-label="필수 동의">
        <p class="compliance-sensitive-warning">주민등록번호, 계좌번호, 상세 주소, 보험계약 비밀번호는 작성하지 마세요. 질병·진료·투약·검사 내용은 답변에 필요한 범위만 작성해주세요.</p>
        <label class="compliance-check">
          <input type="checkbox" id="privacyConsent" required />
          <span><strong>[필수] 개인정보 수집·이용 동의</strong><small>질문 접수와 답변 제공을 위해 닉네임, 질문 내용, 비공개 질문의 이름·전화번호, 접속기록을 처리합니다. 상세 내용은 개인정보처리방침에서 확인할 수 있습니다.</small></span>
        </label>
        <label class="compliance-check">
          <input type="checkbox" id="sensitiveConsent" required />
          <span><strong>[필수] 건강정보 등 민감정보 처리 동의</strong><small>질문에 포함된 질병, 진료, 투약, 검사, 입원·수술 관련 정보는 보험 질문 확인과 답변 제공 목적으로 처리됩니다.</small></span>
        </label>
        <label class="compliance-check compliance-public">
          <input type="checkbox" id="publicConsent" />
          <span><strong>[필수] 공개 게시 및 검색 노출 동의</strong><small>공개 질문의 제목, 닉네임, 질문 내용은 게시판과 검색엔진에 노출될 수 있습니다. 개인을 식별할 수 있는 내용은 작성하지 마세요.</small></span>
        </label>
        <div class="site-compliance-links"><a href="/privacy/" target="_blank" rel="noopener">개인정보처리방침</a><a href="/insurance-notice/" target="_blank" rel="noopener">보험정보 이용안내</a></div>
      </div>
    `);

    submit.parentNode.insertBefore(controls, submit);
    qsa('input[name="visibility"]', form).forEach((input) => input.addEventListener('change', updatePublicConsent));
    updatePublicConsent();

    form.addEventListener('submit', function (event) {
      const state = consentState();
      const isPublic = qs('input[name="visibility"]:checked', form)?.value !== 'private';
      if (!state.privacy_consent || !state.sensitive_consent || (isPublic && !state.public_consent)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        form.reportValidity();
        const target = !state.privacy_consent ? qs('#privacyConsent', form)
          : !state.sensitive_consent ? qs('#sensitiveConsent', form)
          : qs('#publicConsent', form);
        target?.focus();
      }
    }, true);
  }

  function installCommonNotice() {
    if (qs('.site-compliance-notice')) return;
    const footer = qs('footer');
    if (!footer) return;

    const notice = createElement(`
      <section class="site-compliance-notice" aria-label="보험정보 이용안내">
        <div class="site-compliance-inner">
          <strong>보험정보 이용안내</strong>
          보험플레이의 게시글과 답변은 일반적인 보험정보 제공을 위한 것이며 특정 보험상품의 가입 권유, 보험계약 체결 또는 중개를 위한 설명이 아닙니다. 실제 보험료, 보장내용, 가입 가능 여부는 보험회사·상품·개인의 연령, 직업, 병력 및 인수 기준에 따라 달라질 수 있습니다. 기존 보험을 해지하거나 변경하기 전에는 상품설명서와 약관을 확인하고 등록된 보험모집종사자에게 설명을 받으시기 바랍니다.
          <div class="site-compliance-registration">보험협회 고유번호: ${ASSOCIATION_UNIQUE_NUMBER}</div>
          <div class="site-compliance-links"><a href="${ECLEAN_URL}" target="_blank" rel="noopener noreferrer">이클린보험서비스에서 정보 확인</a><a href="/insurance-notice/">보험정보 이용안내</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관</a></div>
        </div>
      </section>
    `);
    footer.parentNode.insertBefore(notice, footer);
  }

  function installAnswerNotice() {
    const answer = qs('.answer-content') || qs('.answer-body');
    if (!answer || qs('.answer-compliance-note', answer)) return;

    const note = createElement(`
      <div class="answer-compliance-note">본 답변은 질문에 기재된 제한된 내용을 기준으로 제공되는 일반적인 정보입니다. 특정 보험상품의 가입 권유나 계약 체결을 위한 설명이 아니며, 보험 가입·변경·해지 전에는 해당 상품의 약관과 상품설명서를 확인해야 합니다.<br/>보험협회 고유번호: ${ASSOCIATION_UNIQUE_NUMBER}</div>
    `);
    answer.appendChild(note);
  }

  function softenContactLabels() {
    qsa('a[href*="open.kakao.com"]').forEach((anchor) => {
      anchor.textContent = '일반 보험 질문 문의';
      anchor.setAttribute('aria-label', '일반 보험 질문 문의');
    });
  }

  function addFooterLink() {
    const nav = qs('footer nav');
    if (!nav || qs('a[href="/insurance-notice/"]', nav)) return;
    const link = document.createElement('a');
    link.href = '/insurance-notice/';
    link.textContent = '보험정보 이용안내';
    nav.appendChild(link);
  }

  function init() {
    injectStyles();
    installConsentControls();
    installCommonNotice();
    installAnswerNotice();
    softenContactLabels();
    addFooterLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
