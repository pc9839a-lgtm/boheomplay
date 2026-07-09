(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.APP_CONFIG || {};

  const menuButton = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  const form = $('#contactForm');
  const result = $('#formResult');
  const phoneInput = $('#phoneInput');
  const privacyModal = $('#privacyModal');

  menuButton?.addEventListener('click', () => {
    nav?.classList.toggle('is-open');
    menuButton.classList.toggle('is-open');
  });

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      nav?.classList.remove('is-open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '').slice(0, 11);
  });

  $$('[data-privacy-open]').forEach((button) => button.addEventListener('click', openPrivacy));
  $$('[data-privacy-close]').forEach((button) => button.addEventListener('click', closePrivacy));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePrivacy();
  });

  fillTrackingFields();
  prefillTopicFromUrl();

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    formData.append('action', 'lead');
    formData.append('site_name', '보험플레이');

    setResult('접수 중입니다. 잠시만 기다려주세요.', 'pending');
    if (submitButton) submitButton.disabled = true;

    try {
      if (!config.apiUrl) throw new Error('상담 접수 URL이 설정되지 않았습니다.');
      await submitWithTimeout(config.apiUrl, formData, config.submitTimeout || 30000);
      form.reset();
      fillTrackingFields();
      setResult('상담 신청이 접수되었습니다. 확인 후 순차적으로 연락드리겠습니다.', 'success');
    } catch (error) {
      console.error('[boheomplay] form submit failed', error);
      setResult('접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  function submitWithTimeout(url, body, timeout) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    return fetch(url, { method: 'POST', body, mode: 'no-cors', signal: controller.signal })
      .finally(() => window.clearTimeout(timer));
  }

  function fillTrackingFields() {
    setValue('#landingPageInput', window.location.href);
    setValue('#referrerInput', document.referrer || 'direct');
    const params = new URLSearchParams(window.location.search);
    setValue('#utmSourceInput', params.get('utm_source') || '');
    setValue('#utmMediumInput', params.get('utm_medium') || '');
    setValue('#utmCampaignInput', params.get('utm_campaign') || '');
  }

  function prefillTopicFromUrl() {
    const select = $('#topicSelect');
    if (!select) return;
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    if (!topic) return;
    Array.from(select.options).forEach((option) => {
      if (option.value === topic || option.textContent === topic) select.value = option.value || option.textContent;
    });
  }

  function setValue(selector, value) {
    const input = $(selector);
    if (input) input.value = value;
  }

  function setResult(message, type) {
    if (!result) return;
    result.textContent = message;
    result.dataset.type = type;
  }

  function openPrivacy() {
    privacyModal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closePrivacy() {
    privacyModal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
})();
