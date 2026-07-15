(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.APP_CONFIG || {};
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
  const initialPosts = readInitialPosts();
  let posts = initialPosts.slice();

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
    $$('input[name="visibility"]').forEach((input) => input.addEventListener('change', updatePrivateFields));
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

  function readInitialPosts() {
    if (!boardList) return [];
    return $$('.board-item', boardList).map((item) => {
      const row = $('.board-row', item);
      if (!row) return null;
      const href = row.tagName === 'A' ? row.getAttribute('href') || '' : '';
      return {
        id: href || $('.board-title', item)?.textContent || '',
        slug: '',
        no: $('.board-no', item)?.textContent || '',
        category: $('.board-category', item)?.textContent || '기타',
        title: $('.board-title', item)?.textContent || '',
        message: $('.board-detail > .detail-text', item)?.textContent || '',
        answer: $('.answer-block .detail-text:not(.answer-empty)', item)?.textContent || '',
        nickname: '익명',
        status: $('.board-status', item)?.textContent || '답변대기',
        time: $('.board-date', item)?.textContent || '',
        href
      };
    }).filter(Boolean);
  }

  async function fetchBoardPosts() {
    const response = await fetch(`/api/board-posts?ts=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { accept: 'application/json' }
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch (error) { data = {}; }
    if (!response.ok || !data.ok || !Array.isArray(data.posts)) {
      throw new Error(formatServerError(data, response.status));
    }
    return data.posts;
  }

  async function loadRemotePosts() {
    try {
      const remote = await fetchBoardPosts();
      posts = dedupePosts([...remote, ...initialPosts]);
      renderBoard();
      return remote;
    } catch (error) {
      console.error('[boheomplay] board list failed', error);
      return [];
    }
  }

  async function findSavedPost(payload) {
    const delays = [0, 200, 500, 1000, 1800];
    for (const delay of delays) {
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        const remote = await fetchBoardPosts();
        const match = remote.find((post) =>
          post &&
          String(post.category || '') === payload.category &&
          String(post.title || '').trim() === payload.title &&
          String(post.message || '').trim() === payload.message
        );
        if (match) return match;
      } catch (error) {
        // Retry while the KV write becomes visible.
      }
    }
    return null;
  }

  function optimisticPost(payload) {
    const id = `saved-${Date.now()}`;
    return {
      id,
      slug: id,
      no: 'NEW',
      category: payload.category,
      title: payload.visibility === 'private' ? '비공개 질문입니다.' : payload.title,
      message: payload.visibility === 'private' ? '비공개 질문은 관리자만 확인할 수 있습니다.' : payload.message,
      nickname: payload.visibility === 'private' ? '비공개' : payload.nickname,
      status: '답변대기',
      time: '방금 전',
      href: ''
    };
  }

  function bindQuestionForm() {
    questionForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      updatePrivateFields();

      if (!questionForm.checkValidity()) {
        questionForm.reportValidity();
        return;
      }

      if (Date.now() - openedAt < 1200) {
        setResult('잠시 후 다시 등록해주세요.', 'error');
        return;
      }

      const formData = new FormData(questionForm);
      if (String(formData.get('website') || '').trim()) return;

      const payload = buildPayload(formData);
      const submitButton = questionForm.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      setResult('질문을 저장 중입니다.', 'pending');

      try {
        const response = await fetch('/api/board-posts', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let data = {};
        try { data = responseText ? JSON.parse(responseText) : {}; } catch (error) { data = {}; }

        if (!response.ok) throw new Error(formatServerError(data, response.status));

        const boardVersion = response.headers.get('x-board-version') || '';
        const directSaveConfirmed = response.status === 201 && /^direct-kv-v\d+$/i.test(boardVersion);
        let savedPost = data.post || null;

        if (!savedPost && payload.visibility === 'public') savedPost = await findSavedPost(payload);

        const successConfirmed = data.stored === true || Boolean(savedPost) || directSaveConfirmed;
        if (!successConfirmed) throw new Error(formatServerError(data, response.status));

        questionForm.reset();
        updatePrivateFields();
        fillTrackingFields();
        sendBackupToAppsScript(payload);

        if (payload.visibility === 'private') {
          setResult('비공개 질문이 저장되었습니다. 관리자 화면에서 확인할 수 있습니다.', 'success');
          setTimeout(loadRemotePosts, 600);
          return;
        }

        const visiblePost = savedPost || optimisticPost(payload);
        posts = dedupePosts([visiblePost, ...posts]);
        activeFilter = '전체';
        openPostId = visiblePost.href ? '' : visiblePost.id;
        $$('#boardTabs button').forEach((item) => {
          item.classList.toggle('is-active', item.dataset.filter === '전체');
        });
        renderBoard();
        setResult('질문이 저장되었습니다. 질문 목록 최상단에서 확인할 수 있습니다.', 'success');
        document.getElementById('board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(loadRemotePosts, 800);
      } catch (error) {
        console.error('[boheomplay] board save failed', error);
        setResult(error.message || '질문 저장에 실패했습니다.', 'error');
      } finally {
        if (submitButton) submitButton.disabled = false;
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
      private_phone: String(formData.get('private_phone') || '').trim(),
      website: String(formData.get('website') || '').trim(),
      privacy_consent: Boolean($('#privacyConsent', questionForm)?.checked),
      sensitive_consent: Boolean($('#sensitiveConsent', questionForm)?.checked),
      public_consent: Boolean($('#publicConsent', questionForm)?.checked),
      consent_version: '2026-07-12-v1'
    };
  }

  function formatServerError(data, status) {
    const parts = [];
    if (data?.error) parts.push(String(data.error));
    if (data?.code) parts.push(`코드: ${data.code}`);
    if (data?.detail) parts.push(`상세: ${data.detail}`);
    if (!parts.length) parts.push(`질문 저장에 실패했습니다. HTTP ${status || 0}`);
    return parts.join(' / ');
  }

  async function sendBackupToAppsScript(payload) {
    try {
      if (!config.apiUrl) return;
      const apiData = new FormData();
      apiData.append('action', 'board_question');
      apiData.append('site_name', '보험플레이');
      apiData.append('source', '보험질문게시판');
      Object.entries(payload).forEach(([key, value]) => apiData.append(key, String(value)));
      apiData.append('page_url', window.location.href);
      apiData.append('referrer', document.referrer || 'direct');
      await submitWithTimeout(config.apiUrl, apiData, config.submitTimeout || 30000);
    } catch (error) {
      console.warn('[boheomplay] backup submit failed', error);
    }
  }

  function renderBoard() {
    if (!boardList) return;
    const visiblePosts = getFilteredPosts().slice(0, 30);

    if (!visiblePosts.length) {
      boardList.innerHTML = '<div class="board-empty">등록된 질문이 없습니다.</div>';
      return;
    }

    boardList.innerHTML = visiblePosts.map((post) => {
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
    if (activeFilter === '전체') return posts;
    if (activeFilter === '보험료') return posts.filter((post) => post.category === '보험료' || post.category === '보험료 줄이기');
    if (activeFilter === '태아보험') return posts.filter((post) => post.category === '태아보험' || post.category === '태아·어린이보험');
    return posts.filter((post) => post.category === activeFilter);
  }

  function dedupePosts(input) {
    const seen = new Set();
    return (Array.isArray(input) ? input : []).filter((post) => {
      const key = post.id || post.slug || post.href || post.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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