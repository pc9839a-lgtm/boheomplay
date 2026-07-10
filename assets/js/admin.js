(function () {
  const $ = (selector, root = document) => root.querySelector(selector);

  const gate = $('#adminGate');
  const panel = $('#adminPanel');
  const loginForm = $('#adminLoginForm');
  const passwordInput = $('#adminPasswordInput');
  const loginResult = $('#adminLoginResult');
  const logoutButton = $('#adminLogoutButton');
  const boardList = $('#adminBoardList');
  let posts = [];

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
        setLoginResult('로그인에 실패했습니다. 환경변수 설정을 확인하세요.', 'error');
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
      const slug = button.dataset.id;
      const action = button.dataset.action;
      if (action === 'delete') deletePost(slug);
      if (action === 'answer') openAnswerEditor(slug);
      if (action === 'cancel-answer') renderBoard();
      if (action === 'save-answer') saveAnswer(slug);
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

  async function setAdminState(isLoggedIn) {
    if (gate) gate.hidden = isLoggedIn;
    if (panel) panel.hidden = !isLoggedIn;
    if (isLoggedIn) await loadPosts();
  }

  async function loadPosts() {
    if (!boardList) return;
    boardList.innerHTML = '<div class="board-empty">질문을 불러오는 중입니다.</div>';
    try {
      const response = await fetch('/api/admin-posts', { method: 'GET' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || '질문 목록을 불러오지 못했습니다.');
      posts = data.posts || [];
      renderBoard();
    } catch (error) {
      boardList.innerHTML = `<div class="board-empty">${escapeHtml(error.message)}</div>`;
    }
  }

  function renderBoard() {
    if (!boardList) return;
    if (!posts.length) {
      boardList.innerHTML = '<div class="board-empty">등록된 질문이 없습니다.</div>';
      return;
    }

    boardList.innerHTML = posts.map((post) => {
      const isPrivate = post.visibility === 'private';
      const title = isPrivate ? `[비공개] ${post.title}` : post.title;
      const contact = isPrivate ? `<div class="detail-label">연락처</div><p class="detail-text">${escapeHtml(post.privateName || '')} · ${escapeHtml(post.privatePhone || '')}</p>` : '';
      return `
        <article class="board-item is-open" data-post-id="${escapeHtml(post.slug)}">
          <div class="board-row admin-board-row">
            <span class="board-no">${escapeHtml(post.no)}</span>
            <span class="board-category">${escapeHtml(post.category)}</span>
            <span class="board-title">${escapeHtml(title)}</span>
            <span class="board-status ${post.answer ? '' : 'waiting'}">${post.answer ? '답변완료' : '답변대기'}</span>
            <span class="board-date">${escapeHtml(post.time)}</span>
          </div>
          <div class="board-detail">
            ${post.href ? `<p class="detail-text"><a href="${escapeHtml(post.href)}" target="_blank" rel="noopener">공개 게시글 보기</a></p>` : ''}
            ${contact}
            <div class="detail-label">질문 내용</div>
            <p class="detail-text">${escapeHtml(post.message)}</p>
            <div class="answer-block">
              <div class="detail-label">답변</div>
              ${post.answer ? `<p class="detail-text">${escapeHtml(post.answer)}</p>` : '<p class="detail-text answer-empty">아직 답변이 등록되지 않았습니다.</p>'}
            </div>
            <div class="admin-actions">
              <button type="button" data-action="answer" data-id="${escapeHtml(post.slug)}">${post.answer ? '답변 수정' : '답변 작성'}</button>
              <button type="button" class="danger" data-action="delete" data-id="${escapeHtml(post.slug)}">질문 삭제</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function openAnswerEditor(slug) {
    const post = findPost(slug);
    const detail = boardList?.querySelector(`[data-post-id="${cssEscape(slug)}"] .board-detail`);
    if (!post || !detail) return;
    detail.querySelector('.answer-editor')?.remove();
    detail.insertAdjacentHTML('beforeend', `
      <div class="answer-editor">
        <textarea rows="4" placeholder="관리자 답변을 입력하세요.">${escapeHtml(post.answer || '')}</textarea>
        <div>
          <button type="button" data-action="save-answer" data-id="${escapeHtml(post.slug)}">답변 저장</button>
          <button type="button" data-action="cancel-answer" data-id="${escapeHtml(post.slug)}">취소</button>
        </div>
      </div>
    `);
  }

  async function saveAnswer(slug) {
    const article = boardList?.querySelector(`[data-post-id="${cssEscape(slug)}"]`);
    const textarea = article?.querySelector('.answer-editor textarea');
    const answer = (textarea?.value || '').trim();
    if (!answer) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    try {
      const response = await fetch('/api/admin-answer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, answer })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || '답변 저장 실패');
      await loadPosts();
    } catch (error) {
      alert(error.message);
    }
  }

  async function deletePost(slug) {
    if (!confirm('이 질문을 삭제할까요?')) return;
    try {
      const response = await fetch('/api/admin-delete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || '질문 삭제 실패');
      await loadPosts();
    } catch (error) {
      alert(error.message);
    }
  }

  function findPost(slug) {
    return posts.find((post) => post.slug === slug || post.id === slug);
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
