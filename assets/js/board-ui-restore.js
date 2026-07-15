(function () {
  const PAGE_SIZE = 20;
  let visibleCount = PAGE_SIZE;
  let activeFilter = '전체';
  let posts = [];
  let boardList = null;
  let boardTabs = null;
  let reloadTimer = null;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function normalize(post = {}) {
    return {
      id: String(post.id || post.slug || post.href || post.title || ''),
      slug: String(post.slug || ''),
      no: String(post.no ?? ''),
      category: String(post.category || '기타'),
      title: String(post.title || ''),
      message: String(post.message || ''),
      answer: String(post.answer || ''),
      nickname: String(post.nickname || '익명'),
      status: String(post.status || (post.answer ? '답변완료' : '답변대기')),
      time: String(post.time || ''),
      href: String(post.href || '')
    };
  }

  function mergePosts(...groups) {
    const seen = new Set();
    return groups.flat().map(normalize).filter((post) => {
      const key = post.slug || post.id || post.href || post.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function readDomPosts(list) {
    return Array.from(list.querySelectorAll('.board-item')).map((item) => {
      const row = item.querySelector('.board-row');
      if (!row) return null;
      const href = row.tagName === 'A' ? row.getAttribute('href') || '' : '';
      return normalize({
        id: href || item.querySelector('.board-title')?.textContent || '',
        no: item.querySelector('.board-no')?.textContent || '',
        category: item.querySelector('.board-category')?.textContent || '기타',
        title: item.querySelector('.board-title')?.textContent || '',
        status: item.querySelector('.board-status')?.textContent || '답변대기',
        time: item.querySelector('.board-date')?.textContent || '',
        href,
        message: item.querySelector('.board-detail > .detail-text')?.textContent || '',
        answer: item.querySelector('.answer-block .detail-text:not(.answer-empty)')?.textContent || ''
      });
    }).filter(Boolean);
  }

  function filteredPosts() {
    if (activeFilter === '전체') return posts;
    if (activeFilter === '보험료') return posts.filter((post) => post.category === '보험료' || post.category === '보험료 줄이기');
    if (activeFilter === '태아보험') return posts.filter((post) => post.category === '태아보험' || post.category === '태아·어린이보험');
    return posts.filter((post) => post.category === activeFilter);
  }

  function row(post) {
    const answered = post.status === '답변완료' || Boolean(post.answer);
    const content = `<span class="board-no">${esc(post.no)}</span><span class="board-category">${esc(post.category)}</span><span class="board-title">${esc(post.title)}</span><span class="board-status ${answered ? '' : 'waiting'}">${answered ? '답변완료' : '답변대기'}</span><span class="board-date">${esc(post.time)}</span>`;

    if (post.href) {
      return `<article class="board-item"><a class="board-row" href="${esc(post.href)}">${content}</a></article>`;
    }

    return `<article class="board-item"><button class="board-row" type="button" data-restored-toggle="${esc(post.id)}" aria-expanded="false">${content}</button><div class="board-detail"><div class="detail-label">질문 내용</div><p class="detail-text">${esc(post.message)}</p><div class="answer-block"><div class="detail-label">답변</div>${post.answer ? `<p class="detail-text">${esc(post.answer)}</p>` : '<p class="detail-text answer-empty">아직 답변이 등록되지 않았습니다.</p>'}</div></div></article>`;
  }

  function ensureMoreButton() {
    let wrap = document.getElementById('boardMoreWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'boardMoreWrap';
      wrap.className = 'board-more-wrap';
      wrap.innerHTML = '<button id="boardMoreButton" class="board-more-button" type="button">더보기</button>';
      const target = boardList.closest('.board-table') || boardList;
      target.insertAdjacentElement('afterend', wrap);
      wrap.addEventListener('click', (event) => {
        if (!event.target.closest('#boardMoreButton')) return;
        visibleCount += PAGE_SIZE;
        render();
      });
    }
    return wrap;
  }

  function render() {
    if (!boardList) return;
    const selected = filteredPosts();
    const visible = selected.slice(0, visibleCount);
    boardList.innerHTML = visible.length ? visible.map(row).join('') : '<div class="board-empty">등록된 질문이 없습니다.</div>';

    const wrap = ensureMoreButton();
    wrap.hidden = visible.length >= selected.length;
  }

  async function reloadBoard() {
    try {
      const response = await fetch(`/api/board-feed?ts=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { accept: 'application/json' }
      });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.posts)) throw new Error('BOARD_FEED_FAILED');
      posts = mergePosts(data.posts, posts);
      render();
    } catch (error) {
      console.error('[boheomplay] restored board feed failed', error);
      render();
    }
  }

  function scheduleReloads() {
    clearTimeout(reloadTimer);
    activeFilter = '전체';
    visibleCount = PAGE_SIZE;
    boardTabs?.querySelectorAll('[data-filter]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.filter === '전체');
    });
    [350, 1000, 2200].forEach((delay) => {
      setTimeout(reloadBoard, delay);
    });
  }

  function addStyles() {
    if (document.getElementById('boardRestoreStyles')) return;
    const style = document.createElement('style');
    style.id = 'boardRestoreStyles';
    style.textContent = '.board-more-wrap{display:flex;justify-content:center;padding:28px 0 0}.board-more-wrap[hidden]{display:none!important}.board-more-button{min-width:210px;height:56px;padding:0 28px;border:1px solid #111;border-radius:999px;background:#fff;color:#111;font:inherit;font-size:16px;font-weight:900;cursor:pointer}.board-more-button:hover{background:#111;color:#fff}@media(max-width:640px){.board-more-button{width:100%;height:54px}}';
    document.head.appendChild(style);
  }

  function install() {
    const originalList = document.getElementById('boardList');
    if (!originalList || originalList.dataset.restoreReady === 'true') return;

    const initial = readDomPosts(originalList);
    boardList = originalList.cloneNode(false);
    boardList.dataset.restoreReady = 'true';
    originalList.replaceWith(boardList);

    const originalTabs = document.getElementById('boardTabs');
    if (originalTabs) {
      boardTabs = originalTabs.cloneNode(true);
      originalTabs.replaceWith(boardTabs);
      boardTabs.addEventListener('click', (event) => {
        const button = event.target.closest('[data-filter]');
        if (!button) return;
        activeFilter = button.dataset.filter || '전체';
        visibleCount = PAGE_SIZE;
        boardTabs.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
        render();
      });
    }

    boardList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-restored-toggle]');
      if (!button) return;
      const article = button.closest('.board-item');
      const isOpen = article?.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    addStyles();
    posts = mergePosts(initial);
    render();
    reloadBoard();

    const form = document.getElementById('questionForm');
    form?.addEventListener('submit', () => {
      if (!form.checkValidity()) return;
      scheduleReloads();
    });

    window.addEventListener('focus', reloadBoard);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
