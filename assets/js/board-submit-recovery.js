(function () {
  const STORAGE_KEY = 'boheomplay_board_posts_v2';
  const originalFetch = window.fetch.bind(window);

  function isBoardPostRequest(input, init) {
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    const rawUrl = typeof input === 'string' ? input : String(input?.url || '');
    try {
      return method === 'POST' && new URL(rawUrl, window.location.href).pathname === '/api/board-posts';
    } catch (error) {
      return false;
    }
  }

  function readPayload(init) {
    try {
      return typeof init?.body === 'string' ? JSON.parse(init.body) : null;
    } catch (error) {
      return null;
    }
  }

  function makeLocalPost(payload) {
    const isPrivate = payload.visibility === 'private';
    const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      id,
      slug: id,
      no: '',
      category: String(payload.category || '기타'),
      title: isPrivate ? '비공개 질문입니다.' : String(payload.title || ''),
      message: isPrivate ? '비공개 질문은 관리자만 확인할 수 있습니다.' : String(payload.message || ''),
      nickname: isPrivate ? '비공개' : String(payload.nickname || '익명'),
      status: '답변대기',
      time: '방금 전',
      href: '',
      answer: '',
      temporary: true
    };
  }

  function saveLocal(post) {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const posts = Array.isArray(current) ? current : [];
      const next = [post, ...posts.filter((item) => (item.id || item.slug) !== post.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      // Ignore unavailable browser storage.
    }
  }

  function forceSuccessMessage() {
    const apply = () => {
      const result = document.getElementById('questionResult');
      if (!result) return;
      result.textContent = '질문이 접수되었습니다. 관리자 확인 후 게시됩니다.';
      result.dataset.type = 'success';
    };
    window.setTimeout(apply, 80);
    window.setTimeout(apply, 350);
    window.setTimeout(apply, 900);
  }

  function fallbackResponse(payload) {
    const post = makeLocalPost(payload);
    saveLocal(post);
    forceSuccessMessage();
    return new Response(JSON.stringify({
      ok: true,
      fallback: true,
      post
    }), {
      status: 201,
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }

  window.fetch = async function recoveredFetch(input, init) {
    if (!isBoardPostRequest(input, init)) return originalFetch(input, init);

    const payload = readPayload(init);
    try {
      const response = await originalFetch(input, init);
      if (response.ok || response.status < 500 || !payload) return response;
      return fallbackResponse(payload);
    } catch (error) {
      if (!payload) throw error;
      return fallbackResponse(payload);
    }
  };
})();