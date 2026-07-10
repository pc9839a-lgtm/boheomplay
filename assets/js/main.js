(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.APP_CONFIG || {};
  const STORAGE_KEY = 'boheomplay_board_posts_v2';
  const openedAt = Date.now();

  const menuButton = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  const questionForm = $('#questionForm');
  const result = $('#questionResult');
  const boardList = $('#boardList');
  const boardTabs = $('#boardTabs');
  const privateFields = $('#privateFields');
  const privateNameInput = $('#privateNameInput');
  const privatePhoneInput = $('#privatePhoneInput');
  let activeFilter = '전체';
  let openPostId = '';
  let remotePosts = [];

  const seedPosts = [
    { id: 'seed-1007', no: 1007, category: '실비보험', title: '실비보험료가 갑자기 올랐는데 유지해야 할까요?', message: '예전 실비라서 유지가 좋다는 말도 있고, 보험료가 부담돼서 고민입니다.', nickname: '익명', status: '답변완료', time: '방금 전', href: '/q/silbi-premium-increase-cancel' },
    { id: 'seed-1006', no: 1006, category: '유병자보험', title: '당뇨약 복용 중인데 보험 가입 가능한가요?', message: '약은 계속 먹고 있고 최근 입원은 없습니다. 일반 보험도 가능한지 궁금합니다.', nickname: '익명', status: '답변대기', time: '3분 전', href: '/q/diabetes-insurance-available' },
    { id: 'seed-1005', no: 1005, category: '부모님 보험', title: '부모님 보험료가 너무 비싼데 뭘 줄여야 하나요?', message: '실비는 있는 것 같고 암보험이 여러 개 있습니다. 해지해도 되는 보험을 알고 싶습니다.', nickname: '익명', status: '답변완료', time: '8분 전', href: '/q/parents-insurance-review-order' },
    { id: 'seed-1004', no: 1004, category: '암보험', title: '30대인데 암보험 진단비를 얼마로 봐야 할까요?', message: '기존 보험에 암진단비가 조금 들어있는데 충분한지 모르겠습니다.', nickname: '익명', status: '답변대기', time: '12분 전', href: '/q/cancer-insurance-30s-needed' },
    { id: 'seed-1003', no: 1003, category: '보험료', title: '보험료를 줄이고 싶은데 어떤 특약부터 봐야 하나요?', message: '월 보험료가 부담됩니다. 해지 말고 줄일 수 있는 방법이 있는지 궁금합니다.', nickname: '익명', status: '답변완료', time: '20분 전', href: '/q/reduce-insurance-premium' }
  ];

  init();

  function init() {
    bindMenu();
    bindSmoothScroll();
    bindFilters();
    bindBoardToggle();
    bindVisibilityToggle();
    fillTrackingFields();
    renderBoard();
    loadRemotePosts();
    bindQuestionForm();
  }

  function bindMenu() {
    menuButton?.addEventListener('click', () => {
      nav?.classList.toggle('is-open');
      menuButton.classList.toggle('is-open');
    });
  }

  function bindSmoothScroll() {
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const target = $(anchor.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        nav?.classList.remove('is-open');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function bindFilters() {
    boardTabs?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter || '전체';
      openPostId = '';
      $$('#boardTabs button').forEach((item) => item.classList.toggle('is-active', item === button));
      renderBoard();
    });
  }

  function bindBoardToggle() {
    boardList?.addEventListener('click', (event) => {
      const row = event.target.closest('[data-post-toggle]');
      if (!row) return;
      const id = row.dataset.postToggle;
      openPostId = openPostId === id ? '' : id;
      renderBoard();
    });
  }

  function bindVisibilityToggle() {
    $$('input[name="visibility"]').forEach((input) => {
      input.addEventListener('change', updatePrivateFields);
    });
    privatePhoneInput?.addEventListener('input', () => {
      privatePhoneInput.value = privatePhoneInput.value.replace(/[^0-9]/g, '').slice(0, 11);
    });
    updatePrivateFields();
  }

  function updatePrivateFields() {
    const isPrivate = getVisibility() === 'private';
    if (privateFields) privateFields.hidden = !isPrivate;
    if (privateNameInput) privateNameInput.required = isPrivate;
    if (privatePhoneInput) privatePhoneInput.required = isPrivate;
  }

  function getVisibility() {
    return questionForm?.querySelector('input[name="visibility"]:checked')?.value || 'public';
  }

  async function loadRemotePosts() {
    try {
      const response = await fetch('/api/board-posts', { method: 'GET' });
      if (!response.ok) throw new Error('board api failed');
      const data = await response.json();
      if (!data.ok || !Array.isArray(data.posts)) return;
      remotePosts = data.posts;
      renderBoard();
    } catch (error) {
      console.warn('[boheomplay] remote board list failed', error);
    }
  }

  function bindQuestionForm() {
    questionForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      updatePrivateFields();

      if (!questionForm.checkValidity()) {
        questionForm.reportValidity();
        return;
      }

      const formData = new FormData(questionForm);
      if ((formData.get('website') || '').trim()) return;

      if (Date.now() - openedAt < 1200) {
        setResult('잠시 후 다시 등록해주세요.', 'error');
        return;
      }

      const payload = buildPayload(formData);
      setResult('게시글을 저장 중입니다.', 'pending');

      try {
        const response = await fetch('/api/board-posts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok || !data.post) throw new Error(data.error || '게시글 저장 실패');

        remotePosts.unshift(data.post);
        activeFilter = '전체';
        openPostId = data.post.href ? '' : data.post.id;
        $$('#boardTabs button').forEach((item) => item.classList.toggle('is-active', item.dataset.filter === '전체'));
        renderBoard();
        questionForm.reset();
        updatePrivateFields();
        fillTrackingFields();
        sendBackupToAppsScript(payload);

        if (data.post.href) {
          window.location.href = data.post.href;
          return;
        }

        setResult('비공개 질문이 등록되었습니다.', 'success');
        document.getElementById('board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        console.error('[boheomplay] board save failed', error);
        setResult('게시글 저장소 설정이 필요합니다. 관리자에게 문의해주세요.', 'error');
      }
    });
  }

  function buildPayload(formData) {
    return {
      visibility: String(formData.get('visibility') || 'public'),
      category: String(formData.get('category') || '기타'),
      title: String(formData.get('title') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      nickname: String(formData.get('nickname') || '').trim() || '익명',
      private_name: String(formData.get('private_name') || '').trim(),
      private_phone: String(formData.get('private_phone') || '').trim()
    };
  }

  async function sendBackupToAppsScript(payload) {
    try {
      if (!config.apiUrl) return;
      const apiData = new FormData();
      apiData.append('action', 'board_question');
      apiData.append('site_name', '보험플레이');
      apiData.append('source', '보험질문게시판');
      Object.entries(payload).forEach(([key, value]) => apiData.append(key, value));
      apiData.append('page_url', window.location.href);
      apiData.append('referrer', document.referrer || 'direct');
      await submitWithTimeout(config.apiUrl, apiData, config.submitTimeout || 30000);
    } catch (error) {
      console.warn('[boheomplay] backup submit failed', error);
    }
  }

  function renderBoard() {
    if (!boardList) return;
    const posts = getFilteredPosts().slice(0, 30);

    if (!posts.length) {
      boardList.innerHTML = '<div class="board-empty">등록된 질문이 없습니다.</div>';
      return;
    }

    boardList.innerHTML = posts.map((post) => {
      const answered = post.status === '답변완료' || Boolean(post.answer);
      const rowContent = `
        <span class="board-no">${escapeHtml(post.no)}</span>
        <span class="board-category">${escapeHtml(post.category)}</span>
        <span class="board-title">${escapeHtml(post.title)}</span>
        <span class="board-status ${answered ? '' : 'waiting'}">${answered ? '답변완료' : '답변대기'}</span>
        <span class="board-date">${escapeHtml(post.time)}</span>
      `;

      if (post.href) {
        return `<article class="board-item"><a class="board-row" href="${escapeHtml(post.href)}">${rowContent}</a></article>`;
      }

      const isOpen = openPostId === post.id;
      return `
        <article class="board-item ${isOpen ? 'is-open' : ''}">
          <button class="board-row" type="button" data-post-toggle="${escapeHtml(post.id)}" aria-expanded="${isOpen ? 'true' : 'false'}">${rowContent}</button>
          <div class="board-detail">
            <div class="detail-label">질문 내용</div>
            <p class="detail-text">${escapeHtml(post.message)}</p>
            <div class="answer-block">
              <div class="detail-label">답변</div>
              ${post.answer ? `<p class="detail-text">${escapeHtml(post.answer)}</p>` : '<p class="detail-text answer-empty">아직 답변이 등록되지 않았습니다.</p>'}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function getFilteredPosts() {
    const posts = getAllPosts();
    if (activeFilter === '전체') return posts;
    if (activeFilter === '보험료') return posts.filter((post) => post.category === '보험료' || post.category === '보험료 줄이기');
    if (activeFilter === '태아보험') return posts.filter((post) => post.category === '태아보험' || post.category === '태아·어린이보험');
    return posts.filter((post) => post.category === activeFilter);
  }

  function getAllPosts() {
    const seen = new Set();
    return remotePosts.concat(getLocalPosts(), seedPosts).filter((post) => {
      const key = post.id || post.slug || post.href || post.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getLocalPosts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

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

  function setValue(selector, value) {
    const input = $(selector);
    if (input) input.value = value;
  }

  function setResult(message, type) {
    if (!result) return;
    result.textContent = message;
    result.dataset.type = type;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[char]));
  }
})();
