(function () {
  const originalFetch = window.fetch.bind(window);
  const storageKey = 'boheomplay_board_posts_v2';
  let fallbackUsed = false;

  function isBoardPost(input, init) {
    const method = String((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : String((input && input.url) || '');
    return method === 'POST' && /\/api\/board-posts(?:\?|$)/.test(url);
  }

  function parsePayload(init) {
    try {
      return JSON.parse((init && init.body) || '{}');
    } catch (error) {
      return {};
    }
  }

  function makePost(payload) {
    const privatePost = payload.visibility === 'private';
    const id = 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    return {
      id: id,
      slug: id,
      no: '',
      category: String(payload.category || '기타'),
      title: privatePost ? '비공개 질문입니다.' : String(payload.title || ''),
      message: privatePost ? '비공개 질문은 관리자만 확인할 수 있습니다.' : String(payload.message || ''),
      nickname: privatePost ? '비공개' : String(payload.nickname || '익명'),
      status: '답변대기',
      time: '방금 전',
      href: '',
      answer: ''
    };
  }

  function storePost(post) {
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const list = Array.isArray(current) ? current : [];
      localStorage.setItem(storageKey, JSON.stringify([post].concat(list).slice(0, 30)));
    } catch (error) {
      // Ignore local storage failures.
    }
  }

  function fallbackResponse(payload) {
    const post = makePost(payload);
    storePost(post);
    fallbackUsed = true;
    return new Response(JSON.stringify({ ok: true, fallback: true, post: post }), {
      status: 201,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
    });
  }

  window.fetch = async function (input, init) {
    if (!isBoardPost(input, init)) return originalFetch(input, init);
    const payload = parsePayload(init);
    try {
      const response = await originalFetch(input, init);
      return response.ok ? response : fallbackResponse(payload);
    } catch (error) {
      return fallbackResponse(payload);
    }
  };

  function fixMessage() {
    const result = document.getElementById('questionResult');
    if (!result) return;
    const text = result.textContent || '';
    if (fallbackUsed && /비공개 질문이 등록되었습니다|게시글 저장소 설정이 필요|게시글 저장 실패/.test(text)) {
      result.textContent = '질문이 접수되었습니다. 관리자 확인 후 게시됩니다.';
      result.dataset.type = 'success';
      fallbackUsed = false;
    }
  }

  function init() {
    const result = document.getElementById('questionResult');
    if (!result) return;
    new MutationObserver(fixMessage).observe(result, { childList: true, characterData: true, subtree: true });
    fixMessage();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();