(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.APP_CONFIG || {};
  const STORAGE_KEY = 'boheomplay_board_posts_v2';
  const ADMIN_KEY = 'boheomplay_admin_session_v1';
  const openedAt = Date.now();

  const menuButton = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  const questionForm = $('#questionForm');
  const result = $('#questionResult');
  const boardList = $('#boardList');
  const adminLoginForm = $('#adminLoginForm');
  const adminPasswordInput = $('#adminPasswordInput');
  const adminActive = $('#adminActive');
  const adminLogoutButton = $('#adminLogoutButton');

  const seedPosts = [
    {
      id: 'seed-1007',
      no: 1007,
      category: '실비보험',
      title: '실비보험료가 갑자기 올랐는데 유지해야 할까요?',
      message: '예전 실비라서 유지가 좋다는 말도 있고, 보험료가 부담돼서 고민입니다.',
      nickname: '익명',
      age_band: '40대',
      status: '답변 완료',
      time: '방금 전',
      answer: '기존 실비는 해지 전 재가입 가능성과 보장 공백을 먼저 확인해야 합니다. 보험료가 부담된다면 실비만 보지 말고 전체 보험료 중 중복 특약이 있는지 같이 보는 게 좋습니다.',
      answeredAt: '관리자 답변'
    },
    {
      id: 'seed-1006',
      no: 1006,
      category: '유병자보험',
      title: '당뇨약 복용 중인데 보험 가입 가능한가요?',
      message: '약은 계속 먹고 있고 최근 입원은 없습니다. 일반 보험도 가능한지 궁금합니다.',
      nickname: '익명',
      age_band: '50대',
      status: '답변 대기',
      time: '3분 전'
    },
    {
      id: 'seed-1005',
      no: 1005,
      category: '부모님 보험',
      title: '부모님 보험료가 너무 비싼데 뭘 줄여야 하나요?',
      message: '실비는 있는 것 같고 암보험이 여러 개 있습니다. 해지해도 되는 보험을 알고 싶습니다.',
      nickname: '익명',
      age_band: '30대',
      status: '답변 완료',
      time: '8분 전',
      answer: '부모님 보험은 실비 유지 여부를 먼저 보고, 그 다음 암·뇌·심장 진단비와 간병 보장을 나눠서 확인하는 순서가 좋습니다. 오래된 보험은 무조건 해지하지 말고 유지 가치가 있는 담보인지 먼저 확인해야 합니다.',
      answeredAt: '관리자 답변'
    },
    {
      id: 'seed-1004',
      no: 1004,
      category: '암보험',
      title: '30대인데 암보험 진단비를 얼마로 봐야 할까요?',
      message: '기존 보험에 암진단비가 조금 들어있는데 충분한지 모르겠습니다.',
      nickname: '익명',
      age_band: '30대',
      status: '답변 대기',
      time: '12분 전'
    }
  ];

  init();

  function init() {
    bindMenu();
    bindSmoothScroll();
    bindAdmin();
    bindBoardActions();
    fillTrackingFields();
    renderBoard();
    renderAdminState();
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

    $$('[data-admin-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        document.getElementById('board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => adminPasswordInput?.focus(), 450);
      });
    });
  }

  function bindAdmin() {
    adminLoginForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = adminPasswordInput?.value || '';
      if (input === config.adminPassword) {
        localStorage.setItem(ADMIN_KEY, '1');
        adminPasswordInput.value = '';
        renderAdminState();
        renderBoard();
      } else {
        alert('관리자 비밀번호가 맞지 않습니다.');
      }
    });

    adminLogoutButton?.addEventListener('click', () => {
      localStorage.removeItem(ADMIN_KEY);
      renderAdminState();
      renderBoard();
    });
  }

  function bindBoardActions() {
    boardList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button || !isAdmin()) return;
      const postId = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'delete') deletePost(postId);
      if (action === 'answer') openAnswerEditor(postId);
      if (action === 'cancel-answer') renderBoard();
      if (action === 'save-answer') saveAnswer(postId);
    });
  }

  function bindQuestionForm() {
    questionForm?.addEventListener('submit', async (event) => {
      event.preventDefault();

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

      const post = {
        id: 'local-' + Date.now(),
        no: getNextNo(),
        category: String(formData.get('category') || '기타'),
        title: String(formData.get('title') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        nickname: String(formData.get('nickname') || '').trim() || '익명',
        age_band: String(formData.get('age_band') || '').trim(),
        status: '답변 대기',
        time: '방금 전'
      };

      saveLocalPost(post);
      renderBoard();
      questionForm.reset();
      fillTrackingFields();
      setResult('게시글이 등록되었습니다.', 'success');
      document.getElementById('board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      try {
        if (config.apiUrl) {
          const apiData = new FormData();
          apiData.append('action', 'board_question');
          apiData.append('site_name', '보험플레이');
          apiData.append('source', '보험질문게시판');
          apiData.append('category', post.category);
          apiData.append('title', post.title);
          apiData.append('message', post.message);
          apiData.append('nickname', post.nickname);
          apiData.append('age_band', post.age_band);
          apiData.append('page_url', window.location.href);
          apiData.append('referrer', document.referrer || 'direct');
          await submitWithTimeout(config.apiUrl, apiData, config.submitTimeout || 30000);
        }
      } catch (error) {
        console.warn('[boheomplay] board post remote save failed', error);
      }
    });
  }

  function renderBoard() {
    if (!boardList) return;
    const admin = isAdmin();
    const posts = getAllPosts().slice(0, 12);
    boardList.innerHTML = posts.map((post) => `
      <article class="post-card ${post.answer ? 'has-answer' : ''}" data-post-id="${escapeHtml(post.id)}">
        <div class="post-no">NO.${escapeHtml(post.no)}</div>
        <div class="post-main">
          <strong>${escapeHtml(post.title)}</strong>
          <p>${escapeHtml(post.message)}</p>
          <div class="post-meta">
            <span>${escapeHtml(post.category)}</span>
            <span>${escapeHtml(post.nickname)}</span>
            ${post.age_band ? `<span>${escapeHtml(post.age_band)}</span>` : ''}
            <span>${escapeHtml(post.time)}</span>
          </div>
          ${post.answer ? renderAnswer(post) : ''}
          ${admin ? renderAdminActions(post) : ''}
        </div>
        <div class="post-status ${post.answer ? 'is-answered' : ''}">${escapeHtml(post.answer ? '답변 완료' : post.status)}</div>
      </article>
    `).join('');
  }

  function renderAnswer(post) {
    return `
      <div class="answer-box">
        <div class="answer-head"><span>관리자 답변</span><em>${escapeHtml(post.answeredAt || '답변 완료')}</em></div>
        <p>${escapeHtml(post.answer)}</p>
      </div>
    `;
  }

  function renderAdminActions(post) {
    return `
      <div class="admin-actions">
        <button type="button" data-action="answer" data-id="${escapeHtml(post.id)}">${post.answer ? '답변 수정' : '답변 작성'}</button>
        <button type="button" class="danger" data-action="delete" data-id="${escapeHtml(post.id)}">질문 삭제</button>
      </div>
    `;
  }

  function openAnswerEditor(postId) {
    const post = findPost(postId);
    const article = boardList?.querySelector(`[data-post-id="${cssEscape(postId)}"] .post-main`);
    if (!post || !article) return;
    const oldEditor = article.querySelector('.answer-editor');
    if (oldEditor) oldEditor.remove();
    article.insertAdjacentHTML('beforeend', `
      <div class="answer-editor">
        <textarea rows="4" placeholder="관리자 답변을 입력하세요.">${escapeHtml(post.answer || '')}</textarea>
        <div>
          <button type="button" data-action="save-answer" data-id="${escapeHtml(post.id)}">답변 저장</button>
          <button type="button" data-action="cancel-answer" data-id="${escapeHtml(post.id)}">취소</button>
        </div>
      </div>
    `);
  }

  function saveAnswer(postId) {
    const article = boardList?.querySelector(`[data-post-id="${cssEscape(postId)}"]`);
    const textarea = article?.querySelector('.answer-editor textarea');
    const answer = (textarea?.value || '').trim();
    if (!answer) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    upsertPost(postId, {
      answer,
      status: '답변 완료',
      answeredAt: '방금 전'
    });
    renderBoard();
  }

  function deletePost(postId) {
    if (!confirm('이 질문을 삭제할까요?')) return;
    const deleted = getDeletedIds();
    if (!deleted.includes(postId)) deleted.push(postId);
    localStorage.setItem(STORAGE_KEY + '_deleted', JSON.stringify(deleted));
    const posts = getLocalPosts().filter((post) => post.id !== postId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    renderBoard();
  }

  function renderAdminState() {
    const admin = isAdmin();
    if (adminLoginForm) adminLoginForm.hidden = admin;
    if (adminActive) adminActive.hidden = !admin;
  }

  function isAdmin() {
    return localStorage.getItem(ADMIN_KEY) === '1';
  }

  function getAllPosts() {
    const deleted = getDeletedIds();
    const mergedSeeds = seedPosts.map((seed) => {
      const override = getLocalPosts().find((post) => post.id === seed.id);
      return override || seed;
    });
    const localOnly = getLocalPosts().filter((post) => !String(post.id).startsWith('seed-'));
    return localOnly.concat(mergedSeeds).filter((post) => !deleted.includes(post.id));
  }

  function findPost(postId) {
    return getAllPosts().find((post) => post.id === postId);
  }

  function upsertPost(postId, patch) {
    const localPosts = getLocalPosts();
    const localIndex = localPosts.findIndex((post) => post.id === postId);
    if (localIndex >= 0) {
      localPosts[localIndex] = { ...localPosts[localIndex], ...patch };
    } else {
      const seed = seedPosts.find((post) => post.id === postId);
      if (!seed) return;
      localPosts.unshift({ ...seed, ...patch });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localPosts.slice(0, 30)));
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

  function saveLocalPost(post) {
    const posts = getLocalPosts();
    posts.unshift(post);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.slice(0, 30)));
  }

  function getDeletedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + '_deleted');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function getNextNo() {
    const posts = getAllPosts();
    const maxNo = posts.reduce((max, post) => Math.max(max, Number(post.no) || 0), 0);
    return Math.max(1008, maxNo + 1);
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

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }
})();
