(function () {
  const PAGE_SIZE = 20;
  const STORAGE_KEY = 'boheomplay_board_posts_v2';
  let visibleCount = PAGE_SIZE;
  let activeFilter = '전체';
  let openPostId = '';
  let posts = [];
  let observer = null;
  let syncTimer = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function normalizePost(post = {}) {
    const rawHref = String(post.href || '');
    return {
      id: String(post.id || post.slug || rawHref || post.title || ''),
      slug: String(post.slug || ''),
      no: String(post.no || '').trim() || 'NEW',
      category: String(post.category || '기타'),
      title: String(post.title || ''),
      message: String(post.message || ''),
      answer: String(post.answer || ''),
      status: String(post.status || (post.answer ? '답변완료' : '답변대기')),
      time: String(post.time || ''),
      href: rawHref === '#board' ? '' : rawHref
    };
  }

  function mergePosts() {
    const seen = new Set();
    return Array.from(arguments).flat().map(normalizePost).filter((post) => {
      const key = post.slug || post.id || post.href || post.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function localPosts() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function rowsFromDom() {
    const list = $('#boardList');
    if (!list) return [];
    return $$('.board-item', list).map((item) => {
      const row = $('.board-row', item);
      if (!row) return null;
      const rawHref = row.tagName === 'A' ? row.getAttribute('href') || '' : '';
      const id = row.dataset.postToggle || rawHref || $('.board-title', row)?.textContent || '';
      if (item.classList.contains('is-open')) openPostId = String(id);
      return normalizePost({
        id,
        slug: row.dataset.slug || '',
        no: $('.board-no', row)?.textContent || '',
        category: $('.board-category', row)?.textContent || '기타',
        title: $('.board-title', row)?.textContent || '',
        status: $('.board-status', row)?.textContent || '답변대기',
        time: $('.board-date', row)?.textContent || '',
        href: rawHref,
        message: $('.board-detail > .detail-text', item)?.textContent || '',
        answer: $('.answer-block .detail-text:not(.answer-empty)', item)?.textContent || ''
      });
    }).filter(Boolean);
  }

  function filteredPosts() {
    if (activeFilter === '전체') return posts;
    if (activeFilter === '보험료') {
      return posts.filter((post) => post.category === '보험료' || post.category === '보험료 줄이기');
    }
    if (activeFilter === '태아보험') {
      return posts.filter((post) => post.category === '태아보험' || post.category === '태아·어린이보험');
    }
    return posts.filter((post) => post.category === activeFilter);
  }

  function rowHtml(post) {
    const answered = post.status === '답변완료' || Boolean(post.answer);
    const content = `
      <span class="board-no${post.no === 'NEW' ? ' is-new' : ''}">${escapeHtml(post.no)}</span>
      <span class="board-category">${escapeHtml(post.category)}</span>
      <span class="board-title">${escapeHtml(post.title)}</span>
      <span class="board-status ${answered ? '' : 'waiting'}">${answered ? '답변완료' : '답변대기'}</span>
      <span class="board-date">${escapeHtml(post.time)}</span>`;

    if (post.href) {
      return `<article class="board-item"><a class="board-row" href="${escapeHtml(post.href)}">${content}</a></article>`;
    }

    const isOpen = openPostId === post.id;
    return `<article class="board-item${isOpen ? ' is-open' : ''}">
      <button class="board-row" type="button" data-post-toggle="${escapeHtml(post.id)}" aria-expanded="${isOpen}">${content}</button>
      <div class="board-detail" aria-hidden="${!isOpen}">
        <div class="detail-label">질문 내용</div>
        <p class="detail-text">${escapeHtml(post.message || '질문이 접수되었습니다. 관리자 확인 후 게시됩니다.')}</p>
        <div class="answer-block">
          <div class="detail-label">답변</div>
          ${post.answer ? `<p class="detail-text">${escapeHtml(post.answer)}</p>` : '<p class="detail-text answer-empty">아직 답변이 등록되지 않았습니다.</p>'}
        </div>
      </div>
    </article>`;
  }

  function ensureMoreButton() {
    const list = $('#boardList');
    if (!list) return null;
    let wrap = $('#boardMoreWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'boardMoreWrap';
      wrap.className = 'board-more-wrap';
      wrap.innerHTML = '<button id="boardMoreButton" class="board-more-button" type="button">더보기</button>';
      (list.closest('.board-table') || list).insertAdjacentElement('afterend', wrap);
    }
    return wrap;
  }

  function render() {
    const list = $('#boardList');
    if (!list) return;
    const filtered = filteredPosts();
    const visible = filtered.slice(0, visibleCount);
    observer?.disconnect();
    list.innerHTML = visible.length ? visible.map(rowHtml).join('') : '<div class="board-empty">등록된 질문이 없습니다.</div>';
    const wrap = ensureMoreButton();
    if (wrap) wrap.hidden = visible.length >= filtered.length;
    observer?.observe(list, { childList: true, subtree: true });
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      posts = mergePosts(rowsFromDom(), posts, localPosts());
      render();
    }, 30);
  }

  async function loadPosts() {
    const initial = rowsFromDom();
    try {
      const response = await fetch('/api/board-posts', { method: 'GET', cache: 'no-store' });
      const data = await response.json();
      const remote = response.ok && data.ok && Array.isArray(data.posts) ? data.posts : [];
      posts = mergePosts(remote, localPosts(), initial);
    } catch (error) {
      posts = mergePosts(localPosts(), initial);
    }
    render();
  }

  function installStyles() {
    const style = document.createElement('style');
    style.id = 'boardControllerStyles';
    style.textContent = `
      #boardList button.board-row{width:100%;text-align:left;cursor:pointer}
      #boardList .board-detail{display:none;padding:24px 28px 28px;border-top:1px solid #ececec;background:#fafafa}
      #boardList .board-item.is-open .board-detail{display:block}
      #boardList .board-item.is-open .board-row{background:#f7f7f5}
      #boardList .detail-label{margin-bottom:8px;color:#777;font-size:12px;font-weight:900;letter-spacing:.08em}
      #boardList .detail-text{margin:0;color:#222;font-size:15px;line-height:1.8;white-space:pre-line}
      #boardList .answer-block{margin-top:22px;padding-top:20px;border-top:1px solid #e4e4e4}
      #boardList .answer-empty{color:#777}
      #boardList .board-no.is-new{font-size:11px;font-weight:950;letter-spacing:.04em}
      .board-more-wrap{display:flex;justify-content:center;padding:28px 0 0}
      .board-more-wrap[hidden]{display:none!important}
      .board-more-button{min-width:210px;height:56px;padding:0 28px;border:1px solid #111;border-radius:999px;background:#fff;color:#111;font:inherit;font-size:16px;font-weight:900;cursor:pointer}
      .board-more-button:hover{background:#111;color:#fff}
      @media(max-width:640px){#boardList .board-detail{padding:20px 18px 24px}.board-more-button{width:100%;height:54px}}
    `;
    document.head.appendChild(style);
  }

  function bind() {
    const list = $('#boardList');
    const tabs = $('#boardTabs');
    if (!list) return;
    installStyles();

    list.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-post-toggle]');
      if (!button || !list.contains(button)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openPostId = openPostId === button.dataset.postToggle ? '' : button.dataset.postToggle;
      render();
    }, true);

    document.addEventListener('click', (event) => {
      if (event.target.closest('#boardMoreButton')) {
        visibleCount += PAGE_SIZE;
        render();
      }
    });

    tabs?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;
      activeFilter = button.dataset.filter || '전체';
      visibleCount = PAGE_SIZE;
      openPostId = '';
      setTimeout(render, 0);
    });

    observer = new MutationObserver(scheduleSync);
    observer.observe(list, { childList: true, subtree: true });
    loadPosts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
