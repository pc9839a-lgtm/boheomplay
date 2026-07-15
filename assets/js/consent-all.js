(function () {
  function install() {
    const box = document.querySelector('.compliance-consents');
    if (!box || document.getElementById('allConsent')) return;

    const label = document.createElement('label');
    label.className = 'compliance-check compliance-all';
    label.innerHTML = '<input type="checkbox" id="allConsent" /><span><strong>전체 동의</strong><small>현재 질문 등록에 필요한 필수 항목에 모두 동의합니다.</small></span>';
    box.insertBefore(label, box.firstChild);

    const all = document.getElementById('allConsent');
    const inputs = ['privacyConsent', 'sensitiveConsent', 'publicConsent']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    function requiredInputs() {
      return inputs.filter((input) => input.id !== 'publicConsent' || input.closest('.compliance-public')?.classList.contains('is-active'));
    }

    function syncAll() {
      const required = requiredInputs();
      all.checked = required.length > 0 && required.every((input) => input.checked);
      all.indeterminate = required.some((input) => input.checked) && !all.checked;
    }

    all.addEventListener('change', () => {
      requiredInputs().forEach((input) => {
        input.checked = all.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      syncAll();
    });

    inputs.forEach((input) => input.addEventListener('change', syncAll));
    document.querySelectorAll('input[name="visibility"]').forEach((input) => {
      input.addEventListener('change', () => setTimeout(syncAll, 0));
    });

    const style = document.createElement('style');
    style.textContent = '.compliance-all{padding-bottom:12px;border-bottom:1px solid #dedbd5;margin-bottom:2px}.compliance-all strong{font-size:15px}';
    document.head.appendChild(style);
    syncAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
