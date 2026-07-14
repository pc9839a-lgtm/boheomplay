(function () {
  const PAGE_SIZE = 20;
  let visibleCount = PAGE_SIZE;
  let activeFilter = '전체';
  let allPosts = [];
  let observer = null;
  let refreshTimer = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function normalizePost(post = {}) {
    return {
      id: String(post.id || post.slug || post.href || post.title || ''),
      slug: String(post.slug || ''),
      no: post.no || '',
      category: String(post.category || '기타'),
      title: String(post.title || ''),
      message: String(post.message || ''),
      answer: String(post.answer || ''),
      status: String(post.status || (post.answer ? '답변완료' : '답변대기')),
      time: String(post.time || ''),
      href: String(post.href || '')
    };
  }

  function postKey(post) {
    return post.slug || post.id || post.href || post.title;
  }

  function mergePosts(primary, secondary) {
    const seen = new Set();
    return primary.concat(secondary).map(normalizePost).filter((post) => {
      const key = postKey(post);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function parseCurrentRows() {
    const list = $('#boardList');
    if (!list) return [];

    return $$('.board-item', list).map((item) => {
      const row = $('.board-row', item);
      if (!row) return null;
      const href = row.tagName === 'A' ? row.getAttribute('href') || '' : '';
      return normalizePost({
        id: row.dataset.postToggle || href || $('.board-title', row)?.textContent,
        no: $('.board-no', row)?.textContent?.trim() || '',
        category: $('.board-category', row)?.textContent?.trim() || '기타',
        title: $('.board-title', row)?.textContent?.trim() || '',
        status: $('.board-status', row)?.textContent?.trim() || '답변대기',
        time: $('.board-date', row)?.textContent?.trim() || '',
        href,
        message: $('.detail-text', item)?.textContent?.trim() || '',
        answer: $('.answer-block .detail-text:not(.answer-empty)', item)?.textContent?.trim() || ''
      });
    }).filter(Boolean);
  }

  function filteredPosts() {
    if (activeFilter === '전체') return allPosts;
    if (activeFilter === '보험료') {
      return allPosts.filter((post) => post.category === '보험료' || post.category === '보험료 줄이기');
    }
    if (activeFilter === '태아보험') {
      return allPosts.filter((post) => post.category === '태아보험' || post.category === '태아·어린이보험');
    }
    return allPosts.filter((post) => post.category === activeFilter);
  }

  function rowHtml(post) {
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

    return `
      <article class="board-item">
        <button class="board-row" type="button" data-post-toggle="${escapeHtml(post.id)}" aria-expanded="false">${rowContent}</button>
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
  }

  function ensureControls() {
    const list = $('#boardList');
    if (!list) return null;
    let wrap = $('#boardMoreWrap');
    if (wrap) return wrap;

    wrap = document.createElement('div');
    wrap.id = 'boardMoreWrap';
    wrap.className = 'board-more-wrap';
    wrap.innerHTML = '<button id="boardMoreButton" class="board-more-button" type="button">더보기 <span id="boardMoreCount"></span></button>';
    const table = list.closest('.board-table') || list;
    table.insertAdjacentElement('afterend', wrap);
    return wrap;
  }

  function renderBoard() {
    const list = $('#boardList');
    if (!list) return;

    const posts = filteredPosts();
    const visible = posts.slice(0, visibleCount);
    observer?.disconnect();

    if (!visible.length) {
      list.innerHTML = '<div class="board-empty">등록된 질문이 없습니다.</div>';
    } else {
      list.innerHTML = visible.map(rowHtml).join('');
    }

    const wrap = ensureControls();
    const button = $('#boardMoreButton');
    const count = $('#boardMoreCount');
    const remaining = Math.max(posts.length - visible.length, 0);

    if (wrap) wrap.hidden = remaining === 0;
    if (button) button.disabled = remaining === 0;
    if (count) count.textContent = remaining > 0 ? `(${Math.min(PAGE_SIZE, remaining)}개 추가)` : '';

    if (observer) observer.observe(list, { childList: true });
  }

  function scheduleDomSync() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      const current = parseCurrentRows();
      allPosts = mergePosts(current, allPosts);
      renderBoard();
    }, 40);
  }

  async function loadAllPosts() {
    const current = parseCurrentRows();
    try {
      const response = await fetch('/api/board-posts', { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('board api failed');
      const data = await response.json();
      const remote = data.ok && Array.isArray(data.posts) ? data.posts : [];
      allPosts = mergePosts(remote, current);
    } catch (error) {
      allPosts = mergePosts(current, allPosts);
    }
    renderBoard();
  }

  function bind() {
    const list = $('#boardList');
    const tabs = $('#boardTabs');
    if (!list) return;

    const style = document.createElement('style');
    style.textContent = `
      .board-more-wrap{display:flex;justify-content:center;padding:28px 0 0}
      .board-more-wrap[hidden]{display:none!important}
      .board-more-button{min-width:210px;height:56px;padding:0 28px;border:1px solid #111;border-radius:999px;background:#fff;color:#111;font:inherit;font-size:16px;font-weight:900;cursor:pointer;transition:background .18s ease,color .18s ease,transform .18s ease}
      .board-more-button:hover{background:#111;color:#fff;transform:translateY(-2px)}
      .board-more-button span{margin-left:5px;font-size:12px;font-weight:750;opacity:.65}
      @media(max-width:640px){.board-more-wrap{padding-top:22px}.board-more-button{width:100%;height:54px}}
    `;
    document.head.appendChild(style);

    ensureControls();
    $('#boardMoreButton')?.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderBoard();
    });

    tabs?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter || '전체';
      visibleCount = PAGE_SIZE;
      window.setTimeout(renderBoard, 0);
    });

    observer = new MutationObserver(scheduleDomSync);
    observer.observe(list, { childList: true });
    loadAllPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once: true });
  } else {
    bind();
  }
})();
