const MARKER = 'maintenance:user-board-posts-purged:2026-07-15-v2';

export async function purgeUserBoardPostsOnce(env) {
  const store = env.BOARD_POSTS || env.SECURITY_STORE || null;
  if (!store) return;

  try {
    if (await store.get(MARKER)) return;

    let slugs = [];
    try {
      const raw = await store.get('board:index');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) slugs = parsed.slice(0, 500).filter(Boolean);
    } catch (error) {
      slugs = [];
    }

    const tasks = [];
    for (const slug of slugs) {
      tasks.push(store.delete(`board:post:${slug}`));
      tasks.push(store.delete(`board:consent:${slug}`));
    }

    await Promise.allSettled(tasks);
    await store.put('board:index', '[]');
    await store.put(MARKER, new Date().toISOString());
  } catch (error) {
    // Keep the site available if storage is unavailable.
  }
}
