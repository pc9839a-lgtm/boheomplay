(function () {
  let lastSignature = '';
  let checking = false;

  function currentSignature() {
    return Array.from(document.querySelectorAll('#adminBoardList [data-post-id]'))
      .map((item) => item.getAttribute('data-post-id') || '')
      .join('|');
  }

  async function checkForChanges() {
    const panel = document.getElementById('adminPanel');
    if (!panel || panel.hidden || checking) return;
    checking = true;

    try {
      const response = await fetch(`/api/admin-posts?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { accept: 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !Array.isArray(data.posts)) return;

      const nextSignature = data.posts.map((post) => post.slug || post.id || '').join('|');
      const displayedSignature = currentSignature();

      if (!lastSignature) lastSignature = displayedSignature;
      if (nextSignature !== displayedSignature && nextSignature !== lastSignature) {
        window.location.reload();
        return;
      }
      lastSignature = nextSignature;
    } catch (error) {
      // The existing admin error UI remains the source of truth.
    } finally {
      checking = false;
    }
  }

  window.setInterval(checkForChanges, 4000);
})();
