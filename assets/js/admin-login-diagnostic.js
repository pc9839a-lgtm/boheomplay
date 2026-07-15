(function () {
  function init() {
    const form = document.getElementById('adminLoginForm');
    const input = document.getElementById('adminPasswordInput');
    const result = document.getElementById('adminLoginResult');
    if (!form || !input || !result || form.dataset.diagnosticBound === 'true') return;

    form.dataset.diagnosticBound = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const password = String(input.value || '');
      result.textContent = '확인 중입니다.';
      result.dataset.type = 'pending';

      try {
        const response = await fetch('/api/admin-login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ password }),
          cache: 'no-store'
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.ok !== true) {
          const message = data.error || (
            response.status === 503
              ? '관리자 보안 설정이 필요합니다. ADMIN_PASSWORD와 ADMIN_SESSION_SECRET을 확인해주세요.'
              : '로그인에 실패했습니다.'
          );
          result.textContent = message;
          result.dataset.type = 'error';
          return;
        }

        input.value = '';
        result.textContent = '로그인되었습니다.';
        result.dataset.type = 'success';
        window.location.reload();
      } catch (error) {
        result.textContent = '관리자 로그인 API에 연결하지 못했습니다.';
        result.dataset.type = 'error';
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
