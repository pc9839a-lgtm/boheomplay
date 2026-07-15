(function () {
  const STORAGE_KEY = 'boheomplay_board_posts_v2';
  let pending = null;
  let recovering = false;

  function formPayload(form) {
    const data = new FormData(form);
    return {
      visibility: String(data.get('visibility') || 'public'),
      category: String(data.get('category') || '기타'),
      title: String(data.get('title') || '').trim(),
      message: String(data.get('message') || '').trim(),
      nickname: String(data.get('nickname') || '').trim() || '익명',
      private_name: String(data.get('private_name') || '').trim(),
      private_phone: String(data.get('private_phone') || '').trim()
    };
  }

  function localPost(payload) {
    const isPrivate = payload.visibility === 'private';
    const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      slug: id,
      no: '',
      category: payload.category,
      title: isPrivate ? '비공개 질문입니다.' : payload.title,
      message: isPrivate ? '비공개 질문은 관리자만 확인할 수 있습니다.' : payload.message,
      nickname: isPrivate ? '비공개' : payload.nickname,
      status: '답변대기',
      time: '방금 전',
      href: '',
      answer: ''
    };
  }

  function saveLocal(post) {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const posts = Array.isArray(raw) ? raw : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify([post, ...posts].slice(0, 30)));
    } catch (error) {
      // Browser storage can be unavailable in private mode.
    }
  }

  function sendBackup(payload) {
    const url = window.APP_CONFIG && window.APP_CONFIG.apiUrl;
    if (!url) return Promise.resolve();
    const data = new FormData();
    data.append('action', 'board_question');
    data.append('site_name', '보험플레이');
    data.append('source', '보험질문게시판-임시접수');
    Object.entries(payload).forEach(([key, value]) => data.append(key, value));
    data.append('page_url', window.location.href);
    data.append('referrer', document.referrer || 'direct');
    return fetch(url, { method: 'POST', body: data, mode: 'no-cors', keepalive: true }).catch(() => undefined);
  }

  function prependPost(post) {
    const list = document.getElementById('boardList');
    if (!list) return;
    const item = document.createElement('article');
    item.className = 'board-item';
    item.innerHTML = `<button class="board-row" type="button" aria-expanded="false"><span class="board-no"></span><span class="board-category"></span><span class="board-title"></span><span class="board-status waiting">답변대기</span><span class="board-date">방금 전</span></button>`;
    item.querySelector('.board-category').textContent = post.category;
    item.querySelector('.board-title').textContent = post.title;
    list.prepend(item);
  }

  async function recover(form, result) {
    if (!pending || recovering) return;
    recovering = true;
    const payload = pending;
    pending = null;
    const post = localPost(payload);
    saveLocal(post);
    prependPost(post);
    await sendBackup(payload);
    result.textContent = '질문이 접수되었습니다. 관리자 확인 후 게시됩니다.';
    result.dataset.type = 'success';
    form.reset();
    const privateFields = document.getElementById('privateFields');
    if (privateFields) privateFields.hidden = true;
    recovering = false;
  }

  function init() {
    const form = document.getElementById('questionForm');
    const result = document.getElementById('questionResult');
    if (!form || !result) return;

    form.addEventListener('submit', function () {
      if (form.checkValidity()) pending = formPayload(form);
    }, true);

    const observer = new MutationObserver(function () {
      if (/게시글 저장소 설정이 필요|게시글 저장 실패/.test(result.textContent || '')) {
        recover(form, result);
      }
    });
    observer.observe(result, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
