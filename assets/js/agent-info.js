(function () {
  const AGENT_NAME = '김도윤';
  const AGENCY_NAME = '지에이코리아주식회사';
  const UNIQUE_NUMBER = '20260217401069';
  const verifiedLine = `보험모집종사자: ${AGENT_NAME} · 소속: ${AGENCY_NAME} · 보험협회 고유번호: ${UNIQUE_NUMBER}`;

  function apply() {
    document.querySelectorAll('.site-compliance-registration').forEach((element) => {
      element.textContent = verifiedLine;
    });

    document.querySelectorAll('.answer-compliance-note').forEach((element) => {
      if (element.textContent.includes(AGENCY_NAME)) return;
      const line = document.createElement('div');
      line.style.marginTop = '8px';
      line.style.fontWeight = '750';
      line.textContent = verifiedLine;
      element.appendChild(line);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply, { once: true });
  } else {
    apply();
  }
})();
