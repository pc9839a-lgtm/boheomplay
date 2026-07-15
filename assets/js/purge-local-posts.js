(function () {
  try {
    const marker = 'boheomplay_user_posts_purge_20260715_v1';
    if (localStorage.getItem(marker) === 'done') return;
    localStorage.removeItem('boheomplay_board_posts_v2');
    localStorage.setItem(marker, 'done');
  } catch (error) {
    // Browser storage may be unavailable.
  }
})();
