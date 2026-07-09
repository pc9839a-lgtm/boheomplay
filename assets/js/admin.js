(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const STORAGE_KEY = 'boheomplay_board_posts_v2';

  const gate = $('#adminGate');
  const panel = $('#adminPanel');
  const loginForm = $('#adminLoginForm');
  const passwordInput = $('#adminPasswordInput');
  const loginResult = $('#adminLoginResult');
  const logoutButton = $('#adminLogoutButton');
  const boardList = $('#adminBoardList');

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

  async function init() {
    bindLogin();
    bindLogout();
    bindBoardActions();
    const ok = await checkAdmin();
    setAdminState(ok);
  }

  function bindLogin() {
    loginForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = passwordInput?.value || '';
      setLoginResult('확인 중입니다.', 'pending');
      try {
        const response = await fetch('/api/admin-login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ password })
        });
        if (!response.ok) throw new Error('login failed');
        passwordInput.value = '';
        setLoginResult('', 'success');
        setAdminState(true);
      } catch (error) {
        setLoginResult('로그인에 실패했습니다. Cloudflare 환경변수 ADMIN_PASSWORD 설정을 확인하세요.', 'error');
      }
    });
  }

  function bindLogout() {
    logoutButton?.addEventListener('click', async () => {
      await fetch('/api/admin-logout', { method: 'POST' }).catch(() => null);
      setAdminState(false);
    });
  }

  function bindBoardActions() {
    boardList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const postId = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'delete') deletePost(postId);
      if (action === 'answer') openAnswerEditor(postId);
      if (action === 'cancel-answer') renderBoard();
      if (action === 'save-answer') saveAnswer(postId);
    });
  }

  async function checkAdmin() {
    try {
      const response = await fetch('/api/admin-check', { method: 'GET' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  function setAdminState(isLoggedIn) {
    if (gate) gate.hidden = isLoggedIn;
    if (panel) panel.hidden = !isLoggedIn;
    if (isLoggedIn) renderBoard();
  }

  function renderBoard() {
    if (!boardList) return;
    const posts = getAllPosts().slice(0, 30);
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
          <div class="admin-actions">
            <button type="button" data-action="answer" data-id="${escapeHtml(post.id)}">${post.answer ? '답변 수정' : '답변 작성'}</button>
            <button type="button" class="danger" data-action="delete" data-id="${escapeHtml(post.id)}">질문 삭제</button>
          </div>
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

  function openAnswerEditor(postId) {
    const post = findPost(postId);
    const article = boardList?.querySelector(`[data-post-id="${cssEscape(postId)}"] .post-main`);
    if (!post || !article) return;
    article.querySelector('.answer-editor')?.remove();
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
    upsertPost(postId, { answer, status: '답변 완료', answeredAt: '방금 전' });
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

  function getDeletedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + '_deleted');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function setLoginResult(message, type) {
    if (!loginResult) return;
    loginResult.textContent = message;
    loginResult.dataset.type = type;
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
