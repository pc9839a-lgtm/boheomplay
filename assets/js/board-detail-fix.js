(function () {
  function installStyles() {
    if (document.getElementById('boardDetailFixStyles')) return;
    const style = document.createElement('style');
    style.id = 'boardDetailFixStyles';
    style.textContent = `
      #boardList button.board-row{width:100%;text-align:left;cursor:pointer}
      #boardList .board-item .board-detail{display:none;padding:24px 28px 28px;border-top:1px solid #ececec;background:#fafafa}
      #boardList .board-item.is-open .board-detail{display:block}
      #boardList .board-item.is-open .board-row{background:#f7f7f5}
      #boardList .board-detail .detail-label{margin-bottom:8px;color:#777;font-size:12px;font-weight:900;letter-spacing:.08em}
      #boardList .board-detail .detail-text{margin:0;color:#222;font-size:15px;line-height:1.8;white-space:pre-line}
      #boardList .board-detail .answer-block{margin-top:22px;padding-top:20px;border-top:1px solid #e4e4e4}
      #boardList .board-detail .answer-empty{color:#777}
      #boardList .board-no.is-new{font-size:11px;font-weight:950;letter-spacing:.04em}
      @media(max-width:640px){#boardList .board-item .board-detail{padding:20px 18px 24px}}
    `;
    document.head.appendChild(style);
  }

  function enhanceRows(root) {
    root.querySelectorAll('.board-item').forEach((item) => {
      const row = item.querySelector('.board-row');
      const number = item.querySelector('.board-no');
      const detail = item.querySelector('.board-detail');
      if (number && !number.textContent.trim()) {
        number.textContent = 'NEW';
        number.classList.add('is-new');
      }
      if (row && row.matches('button[data-post-toggle]')) {
        const open = item.classList.contains('is-open');
        row.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (detail) detail.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
    });
  }

  function init() {
    const list = document.getElementById('boardList');
    if (!list) return;
    installStyles();
    enhanceRows(list);

    list.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-post-toggle]');
      if (!button || !list.contains(button)) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const item = button.closest('.board-item');
      const detail = item && item.querySelector('.board-detail');
      if (!item) return;
      const willOpen = !item.classList.contains('is-open');

      list.querySelectorAll('.board-item.is-open').forEach((opened) => {
        if (opened === item) return;
        opened.classList.remove('is-open');
        opened.querySelector('button[data-post-toggle]')?.setAttribute('aria-expanded', 'false');
        opened.querySelector('.board-detail')?.setAttribute('aria-hidden', 'true');
      });

      item.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      if (detail) detail.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
    }, true);

    const observer = new MutationObserver(() => enhanceRows(list));
    observer.observe(list, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();