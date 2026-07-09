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

  const seedPosts = [
    {
      id: 'seed-1007',
      no: 1007,
      category: '실비보험',
      title: '실비보험료가 갑자기 올랐는데 유지해야 할까요?',
      message: '예전 실비라서 유지가 좋다는 말도 있고, 보험료가 부담돼서 고민입니다.',
      nickname: '익명',
      status: '답변완료',
      time: '방금 전',
      answer: '기존 실비는 해지 전 재가입 가능성과 보장 공백을 먼저 확인해야 합니다. 보험료가 부담된다면 실비만 보지 말고 전체 보험료 중 중복 특약이 있는지 같이 보는 게 좋습니다.'
    },
    {
      id: 'seed-1006',
      no: 1006,
      category: '유병자보험',
      title: '당뇨약 복용 중인데 보험 가입 가능한가요?',
      message: '약은 계속 먹고 있고 최근 입원은 없습니다. 일반 보험도 가능한지 궁금합니다.',
      nickname: '익명',
      status: '답변대기',
      time: '3분 전'
    },
    {
      id: 'seed-1005',
      no: 1005,
      category: '부모님 보험',
      title: '부모님 보험료가 너무 비싼데 뭘 줄여야 하나요?',
      message: '실비는 있는 것 같고 암보험이 여러 개 있습니다. 해지해도 되는 보험을 알고 싶습니다.',
      nickname: '익명',
      status: '답변완료',
      time: '8분 전',
      answer: '부모님 보험은 실비 유지 여부를 먼저 보고, 그 다음 암·뇌·심장 진단비와 간병 보장을 나눠서 확인하는 순서가 좋습니다. 오래된 보험은 무조건 해지하지 말고 유지 가치가 있는 담보인지 먼저 확인해야 합니다.'
    },
    {
      id: 'seed-1004',
      no: 1004,
      category: '암보험',
      title: '30대인데 암보험 진단비를 얼마로 봐야 할까요?',
      message: '기존 보험에 암진단비가 조금 들어있는데 충분한지 모르겠습니다.',
      nickname: '익명',
      status: '답변대기',
      time: '12분 전'
    },
    {
      id: 'seed-1003',
      no: 1003,
      category: '보험료',
      title: '보험료를 줄이고 싶은데 어떤 특약부터 봐야 하나요?',
      message: '월 보험료가 부담됩니다. 해지 말고 줄일 수 있는 방법이 있는지 궁금합니다.',
      nickname: '익명',
      status: '답변완료',
      time: '20분 전',
      answer: '보험료를 줄일 때는 실비처럼 다시 가입이 어려울 수 있는 보장부터 무조건 해지하면 안 됩니다. 중복 담보, 갱신형 특약, 우선순위가 낮은 특약을 먼저 확인하는 방식이 좋습니다.'
    }
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

      const visibility = String(formData.get('visibility') || 'public');
      const isPrivate = visibility === 'private';
      const rawTitle = String(formData.get('title') || '').trim();
      const rawMessage = String(formData.get('message') || '').trim();
      const category = String(formData.get('category') || '기타');
      const nickname = String(formData.get('nickname') || '').trim() || '익명';
      const privateName = String(formData.get('private_name') || '').trim();
      const privatePhone = String(formData.get('private_phone') || '').trim();

      const post = {
        id: 'local-' + Date.now(),
        no: getNextNo(),
        category,
        title: isPrivate ? '비공개 질문입니다.' : rawTitle,
        message: isPrivate ? '비공개 질문은 관리자만 확인할 수 있습니다.' : rawMessage,
        original_title: rawTitle,
        original_message: rawMessage,
        visibility,
        nickname: isPrivate ? '비공개' : nickname,
        status: '답변대기',
        time: '방금 전'
      };

      saveLocalPost(post);
      activeFilter = '전체';
      openPostId = post.id;
      $$('#boardTabs button').forEach((item) => item.classList.toggle('is-active', item.dataset.filter === '전체'));
      renderBoard();
      questionForm.reset();
      updatePrivateFields();
      fillTrackingFields();
      setResult('게시글이 등록되었습니다.', 'success');
      document.getElementById('board')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      try {
        if (config.apiUrl) {
          const apiData = new FormData();
          apiData.append('action', 'board_question');
          apiData.append('site_name', '보험플레이');
          apiData.append('source', '보험질문게시판');
          apiData.append('visibility', visibility);
          apiData.append('category', category);
          apiData.append('title', rawTitle);
          apiData.append('message', rawMessage);
          apiData.append('nickname', nickname);
          apiData.append('private_name', privateName);
          apiData.append('private_phone', privatePhone);
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
    const posts = getFilteredPosts().slice(0, 30);

    if (!posts.length) {
      boardList.innerHTML = '<div class="board-empty">등록된 질문이 없습니다.</div>';
      return;
    }

    boardList.innerHTML = posts.map((post) => {
      const isOpen = openPostId === post.id;
      const answered = Boolean(post.answer);
      return `
        <article class="board-item ${isOpen ? 'is-open' : ''}">
          <button class="board-row" type="button" data-post-toggle="${escapeHtml(post.id)}" aria-expanded="${isOpen ? 'true' : 'false'}">
            <span class="board-no">${escapeHtml(post.no)}</span>
            <span class="board-category">${escapeHtml(post.category)}</span>
            <span class="board-title">${escapeHtml(post.title)}</span>
            <span class="board-status ${answered ? '' : 'waiting'}">${answered ? '답변완료' : '답변대기'}</span>
            <span class="board-date">${escapeHtml(post.time)}</span>
          </button>
          <div class="board-detail">
            <div class="detail-label">질문 내용</div>
            <p class="detail-text">${escapeHtml(post.message)}</p>
            <div class="answer-block">
              <div class="detail-label">답변</div>
              ${answered ? `<p class="detail-text">${escapeHtml(post.answer)}</p>` : '<p class="detail-text answer-empty">아직 답변이 등록되지 않았습니다.</p>'}
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
    const deleted = getDeletedIds();
    const mergedSeeds = seedPosts.map((seed) => {
      const override = getLocalPosts().find((post) => post.id === seed.id);
      return override || seed;
    });
    const localOnly = getLocalPosts().filter((post) => !String(post.id).startsWith('seed-'));
    return localOnly.concat(mergedSeeds).filter((post) => !deleted.includes(post.id));
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
})();
