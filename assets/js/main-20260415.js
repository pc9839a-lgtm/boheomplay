(function () {
  const config = window.APP_CONFIG || {};
  const CACHE_KEY = 'boheomplay_bootstrap_cache_v20260414_05';
  const CACHE_META_KEY = 'boheomplay_bootstrap_cache_meta_v20260414_05';

  const state = {
    bootstrap: {
      settings: {}, products: [], reviews: [], targets: [], faqs: []
    },
    activeCategory: 'ALL',
    reviewPage: 0
  };

  const productGrid = document.getElementById('productGrid');
  const productFilters = document.getElementById('productFilters');
  const reviewGrid = document.getElementById('reviewGrid');
  const reviewDots = document.getElementById('reviewDots');
  const reviewViewport = document.getElementById('reviewViewport');
  const faqList = document.getElementById('faqList');
  const targetGrid = document.getElementById('targetGrid');
  const form = document.getElementById('contactForm');
  const formResult = document.getElementById('formResult');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const phoneInput = document.getElementById('phoneInput');
  const consultationTypeSelect = document.getElementById('consultationTypeSelect');
  const modal = document.getElementById('productModal');
  const modalBody = document.getElementById('productModalBody');
  const privacyPopup = document.getElementById('privacyPopup');
  const openPrivacyPopupButton = document.getElementById('openPrivacyPopup');

  let reviewAutoTimer = null;
  let productAutoTimer = null;
  let reviewTouchStartX = 0;

  init();

  async function init() {
    bindStaticEvents();
    setTrackingFields();

    const payload = await resolveBootstrapPayload();
    hydrate(payload);
    exposeManualRefresh();
  }

  async function resolveBootstrapPayload() {
    if (config.useMockOnly) {
      return normalizeData(window.MOCK_BOOTSTRAP_DATA || {});
    }

    const forceRefresh = shouldForceRefreshFromUrl();
    const cachedPayload = getCachedBootstrap();

    if (cachedPayload && !forceRefresh) {
      return cachedPayload;
    }

    try {
      const remotePayload = await loadBootstrapFromApi();
      const normalized = normalizeData(remotePayload);
      saveCachedBootstrap(normalized);
      clearRefreshParamsFromUrl();
      return normalized;
    } catch (error) {
      if (cachedPayload) {
        return cachedPayload;
      }
      return normalizeData(window.MOCK_BOOTSTRAP_DATA || {});
    }
  }

  function exposeManualRefresh() {
    window.BOHEOMPLAY_FORCE_REFRESH = async function () {
      const fresh = await refreshBootstrapNow();
      return fresh;
    };
    window.BOHEOMPLAY_CLEAR_CACHE = function () {
      try {
        localStorage.removeItem('boheomplay_bootstrap_cache_v1');
        localStorage.removeItem('boheomplay_bootstrap_cache_meta_v1');
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_META_KEY);
      } catch (error) {}
    };
  }

  async function refreshBootstrapNow() {
    if (config.useMockOnly) {
      const mockPayload = normalizeData(window.MOCK_BOOTSTRAP_DATA || {});
      hydrate(mockPayload);
      return mockPayload;
    }

    const remotePayload = await loadBootstrapFromApi();
    const normalized = normalizeData(remotePayload);
    saveCachedBootstrap(normalized);
    hydrate(normalized);
    return normalized;
  }

  function shouldForceRefreshFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const candidates = [
      params.get('refresh'),
      params.get('sync'),
      params.get('reload_data')
    ].map(function (value) {
      return String(value || '').trim().toLowerCase();
    });

    return candidates.some(function (value) {
      return ['1', 'true', 'y', 'yes'].includes(value);
    });
  }

  function clearRefreshParamsFromUrl() {
    const url = new URL(window.location.href);
    const before = url.search;
    url.searchParams.delete('refresh');
    url.searchParams.delete('sync');
    url.searchParams.delete('reload_data');

    if (before !== url.search) {
      window.history.replaceState({}, '', url.toString());
    }
  }

  function getCachedBootstrap() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return normalizeData(JSON.parse(raw));
    } catch (error) {
      return null;
    }
  }

  function saveCachedBootstrap(payload) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      localStorage.setItem(CACHE_META_KEY, JSON.stringify({
        updated_at: new Date().toISOString()
      }));
    } catch (error) {
      // localStorage       ㅽ뙣    議곗슜    듦낵
    }
  }

  function bindStaticEvents() {
    if (mobileMenuToggle && mainNav) {
      mobileMenuToggle.addEventListener('click', () => mainNav.classList.toggle('is-open'));
    }

    if (openPrivacyPopupButton) {
      openPrivacyPopupButton.addEventListener('click', openPrivacyPopup);
    }

    document.addEventListener('click', (event) => {
      const target = event.target;

      const filterButton = target.closest('[data-category]');
      if (filterButton) {
        state.activeCategory = filterButton.getAttribute('data-category') || 'ALL';
        renderFilters();
        renderProducts();
        return;
      }

      const selectButton = target.closest('[data-select-product]');
      if (selectButton) {
        event.preventDefault();
        const productId = selectButton.getAttribute('data-select-product');
        if (consultationTypeSelect) consultationTypeSelect.value = productId || '';
        scrollToSection('contact');
        closeModal();
        return;
      }

      const openCard = target.closest('[data-open-product]');
      if (openCard) {
        openProduct(openCard.getAttribute('data-open-product'));
        return;
      }

      const reviewNav = target.closest('[data-review-nav]');
      if (reviewNav) {
        moveReviews(reviewNav.getAttribute('data-review-nav'));
        return;
      }

      const reviewDot = target.closest('[data-review-dot]');
      if (reviewDot) {
        state.reviewPage = Number(reviewDot.getAttribute('data-review-dot') || 0);
        setupReviewSlider((state.bootstrap.reviews || []).length);
        return;
      }

      if (target.closest('[data-close-modal]')) {
        closeModal();
      }

      if (target.closest('[data-close-privacy]')) {
        closePrivacyPopup();
      }
    });

    window.addEventListener('resize', () => {
      setupReviewSlider((state.bootstrap.reviews || []).length);
      setupMobileProductSlider();
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
        closePrivacyPopup();
      }
    });

    if (reviewViewport) {
      reviewViewport.addEventListener('mouseenter', stopReviewAuto);
      reviewViewport.addEventListener('mouseleave', () => setupReviewSlider((state.bootstrap.reviews || []).length));

      reviewViewport.addEventListener('touchstart', (event) => {
        stopReviewAuto();
        reviewTouchStartX = event.changedTouches && event.changedTouches[0]
          ? event.changedTouches[0].clientX
          : 0;
      }, { passive: true });

      reviewViewport.addEventListener('touchend', (event) => {
        const endX = event.changedTouches && event.changedTouches[0]
          ? event.changedTouches[0].clientX
          : 0;
        const deltaX = endX - reviewTouchStartX;

        if (Math.abs(deltaX) > 40) {
          moveReviews(deltaX > 0 ? 'prev' : 'next');
        } else {
          setupReviewSlider((state.bootstrap.reviews || []).length);
        }
      }, { passive: true });
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        phoneInput.value = String(phoneInput.value || '').replace(/\D+/g, '').slice(0, 11);
      });
    }

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        if (!formData.get('name')?.trim()) return updateFormResult(' 깊븿    낅젰 댁＜ 몄슂.', 'error');
        const phone = formData.get('phone')?.replace(/\D+/g, '').trim();
        if (!phone) return updateFormResult(' 곕씫泥섎   낅젰 댁＜ 몄슂.', 'error');
        if (!formData.get('consultation_type_id')?.trim()) return updateFormResult(' 곷떞 遺꾩빞瑜   좏깮 댁＜ 몄슂.', 'error');
        if (!formData.get('age_band')?.trim()) return updateFormResult(' 곕졊  瑜   좏깮 댁＜ 몄슂.', 'error');

        const privacyAgreeInput = document.getElementById('privacyAgreeInput');
        if (privacyAgreeInput && !privacyAgreeInput.checked) return updateFormResult('媛쒖씤 뺣낫  섏쭛 諛   댁슜  숈쓽媛   꾩슂 ⑸땲  .', 'error');

        if (phoneInput) phoneInput.value = phone;

        const extraLines = [];
        [['gender', ' 깅퀎'], ['consultation_goal', ' 곷떞紐⑹쟻'], ['contact_time', ' 곷떞 媛     쒓컙  ']]
          .forEach(([key, label]) => {
            const value = String(formData.get(key) || '').trim();
            if (value) extraLines.push(`${label}: ${value}`);
          });

        const originalMessage = String(formData.get('message') || '').trim();
        if (originalMessage) extraLines.push(`臾몄쓽 댁슜: ${originalMessage}`);

        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.value = extraLines.join('\n');

        setSubmitState(true);
        updateFormResult(' 곷떞  댁슜    묒닔 섍퀬  덉뒿 덈떎...', 'pending');

        try {
          const response = await fetch(config.apiUrl, { method: 'POST', body: formData });
          const data = await response.json();
          if (data.success) {
            updateFormResult(data.data || data.message || ' 곷떞  좎껌    뺤긽  묒닔 섏뿀 듬땲  .', 'success');
            form.reset();
            setTrackingFields();
          } else {
            updateFormResult(data.message || ' ㅻ쪟媛  諛쒖깮 덉뒿 덈떎.', 'error');
          }
        } catch (error) {
          updateFormResult(' 듭떊 以  臾몄젣媛  諛쒖깮 덉뒿 덈떎.  ㅼ떆  쒕룄 댁＜ 몄슂.', 'error');
        } finally {
          setSubmitState(false);
        }
      });
    }
  }

  async function loadBootstrapFromApi() {
    return new Promise(function (resolve, reject) {
      const callbackName = '__insuranceJsonpCallback_' + Date.now();
      const params = new URLSearchParams();
      params.set('action', 'bootstrap');
      params.set('callback', callbackName);

      const script = document.createElement('script');
      const requestUrl = config.apiUrl + '?' + params.toString();
      let finished = false;
      let timeoutId = null;

      window[callbackName] = function (payload) {
        if (finished) return;
        finished = true;
        cleanup();
        resolve(payload && payload.data ? payload.data : payload);
      };

      script.onerror = function () {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error('bootstrap-load-failed'));
      };

      timeoutId = window.setTimeout(function () {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error('bootstrap-timeout'));
      }, 8000);

      function cleanup() {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[callbackName]; } catch (e) {}
      }

      script.src = requestUrl;
      script.async = true;
      document.body.appendChild(script);
    });
  }

  function hydrate(data) {
    state.bootstrap = normalizeData(data);
    renderSettings();
    renderFilters();
    renderProducts();
    renderReviews();
    renderTargets();
    renderFaqs();
    populateConsultationTypes();
  }

  function normalizeData(data) {
    const safe = data || {};
    const fb = window.MOCK_BOOTSTRAP_DATA || {};
    return {
      settings: safe.settings || fb.settings || {},
      products: ensureArray(safe.products || safe.insurance_products, fb.products),
      reviews: ensureArray(safe.reviews, fb.reviews),
      targets: ensureArray(safe.targets, fb.targets),
      faqs: ensureArray(safe.faqs, fb.faqs)
    };
  }

  function ensureArray(primary, fallback) {
    return Array.isArray(primary) ? primary : (Array.isArray(fallback) ? fallback : []);
  }

  function renderSettings() {
    const settings = state.bootstrap.settings || {};
    const displayBrand = '蹂댄뿕 뚮젅  ';
    const footerBrand = 'WAYZI(蹂댄뿕 뚮젅  )';
    const footerDescription = '     源  꾩쑄 쨌  ъ뾽 먮쾲   538-42-01450';
    const heroImage = settings.hero_image || settings.hero_bg || '';

    setText('siteName', displayBrand);
    setText('footerSiteName', footerBrand);
    setText('siteNameInput', displayBrand, 'value');
    setText('footerDescription', footerDescription);
    setText('heroTag1', settings.hero_tag_1 || '湲곗〈 蹂댄뿕  먭 ');
    setText('heroTag2', settings.hero_tag_2 || '臾대즺 蹂댁옣遺꾩꽍');
    setText('heroTag3', settings.hero_tag_3 || '1:1 留욎땄  곷떞');
    setHtml('heroTitle', convertLineBreaks(escapeHtml(settings.hero_title || '蹂댄뿕猷뚮뒗 怨꾩냽  섍  붾뜲,\n萸먭      ㅼ뼱媛   덈뒗吏   룰컝由ъ떆 섏슂?')));
    setHtml('heroSubtitle', convertLineBreaks(escapeHtml(settings.hero_subtitle || '湲곗〈 蹂댄뿕       ㅼ뼱媛   덈뒗吏  癒쇱   먭  섍퀬,\n遺 議깊븳 蹂댁옣留      곹솴   留욊쾶  뺣━ 대뱶由쎈땲  .')));
    setHtml('identityTitle', (() => {
      const text = settings.identity_title || '蹂댄뿕 뚮젅 대뒗\n 곹뭹   諛  대꽔湲곕낫   癒쇱   뺣━ 섎뒗  곷떞    ⑸땲  .';
      const parts = text.split('\n');
      return parts.length > 1 ? `${escapeHtml(parts[0])}<br><span>${escapeHtml(parts.slice(1).join(' '))}</span>` : `<span>${escapeHtml(text)}</span>`;
    })());
    setHtml('identityDesc', convertLineBreaks(escapeHtml(settings.identity_desc || '蹂댄뿕  곷떞    대젮    댁쑀    곹뭹   留롮븘 쒓   꾨땲  ,\n   蹂댄뿕   吏 湲   대뼡  곹깭 몄   뚭린  대졄湲   뚮Ц 낅땲  .\n\n蹂댄뿕 뚮젅 대뒗 湲곗〈 蹂댄뿕    덈떎硫  以묐났怨  遺 議깆쓣 癒쇱  蹂닿퀬,\n 덈줈 以 鍮꾪빐    쒕떎硫  瑗   꾩슂   蹂댁옣遺     곗꽑 쒖쐞瑜   뺣━ 대뱶由쎈땲  .')));

    const heroBg = document.getElementById('heroBg');
    if (heroBg && heroImage) {
      heroBg.style.backgroundImage = `linear-gradient(180deg, rgba(7, 25, 57, 0.12), rgba(7, 25, 57, 0.4)), url("${heroImage.replace(/"/g, '\\"')}")`;
    }
  }

  function renderFilters() {
    if (!productFilters) return;
    const categories = ['ALL', ...new Set((state.bootstrap.products || []).map(item => item.category).filter(Boolean))];
    productFilters.innerHTML = categories.map(category => {
      const isActive = state.activeCategory === category ? ' is-active' : '';
      const label = category === 'ALL' ? ' 꾩껜  곷떞' : category;
      return `<button type="button" class="filter-chip${isActive}" data-category="${escapeAttribute(category)}">${escapeHtml(label)}</button>`;
    }).join('');
  }

  function renderProducts() {
    if (!productGrid) return;
    const products = (state.bootstrap.products || []).filter(item => state.activeCategory === 'ALL' || item.category === state.activeCategory);

    if (!products.length) {
      productGrid.innerHTML = `<div class="section-empty"> 꾩옱 以 鍮꾨맂  곷떞 遺꾩빞媛   놁뒿 덈떎. 諛붾줈  곷떞  좎껌    ④꺼二쇱떆硫   쒖감 곸쑝濡   덈궡 쒕┰ 덈떎.</div>`;
      return;
    }

    productGrid.innerHTML = products.map(product => {
      const imageUrl = product.thumbnail_url || '';
      return `
        <article class="product-card" data-open-product="${escapeAttribute(product.product_id)}">
          <div class="product-visual">
            ${imageUrl ? `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(product.title || '')}" />` : ''}
            <div class="product-visual-inner">
              <div class="product-badges">
                <span class="product-badge">${escapeHtml(product.category || '蹂댄뿕 곷떞')}</span>
                ${product.subtitle ? `<span class="product-badge">${escapeHtml(product.subtitle)}</span>` : ''}
              </div>
              <h3 class="product-title">${escapeHtml(product.title || '蹂댄뿕  곷떞')}</h3>
            </div>
          </div>
          <div class="product-content">
            <p class="product-summary">${escapeHtml(product.summary || '')}</p>
            <div class="product-meta">
              ${metaItem('異붿쿇    ', product.target || '-')}
              ${metaItem(' 곷떞 ъ씤  ', product.point || '-')}
            </div>
            <div class="product-actions">
              <a href="#contact" class="btn" data-select-product="${escapeAttribute(product.product_id)}"> 곷떞  좎껌</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    setupMobileProductSlider();
  }

  function renderReviews() {
    if (!reviewGrid) return;
    const reviews = state.bootstrap.reviews || [];
    if (!reviews.length) {
      reviewGrid.innerHTML = `<div class="section-empty">以 鍮  以묒씤  꾧린媛  怨   낅뜲 댄듃 ⑸땲  .</div>`;
      if (reviewDots) reviewDots.innerHTML = '';
      return;
    }

    reviewGrid.innerHTML = reviews.map(review => {
      const imageUrl = review.thumbnail_url || '';
      return `
        <article class="review-card">
          <div class="review-thumb">
            ${imageUrl ? `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(review.title || '')}" />` : ''}
          </div>
          <div class="review-body">
            ${review.category ? `<span class="review-region">${escapeHtml(review.category)}</span>` : ''}
            <h3>${escapeHtml(review.title || ' 곷떞  꾧린')}</h3>
            <p>${escapeHtml(review.summary || '')}</p>
          </div>
        </article>
      `;
    }).join('');

    setupReviewSlider(reviews.length);
  }

  function renderTargets() {
    if (!targetGrid) return;
    const items = state.bootstrap.targets || [];
    if (!items.length) {
      targetGrid.innerHTML = `<div class="section-empty">以 鍮  以묒엯 덈떎.</div>`;
      return;
    }
    targetGrid.innerHTML = items.map(item => `
      <article class="extra-card">
        ${item.badge ? `<div class="extra-chip">${escapeHtml(item.badge)}</div>` : ''}
        <h3>${escapeHtml(item.title || '')}</h3>
        <p>${escapeHtml(item.description || '')}</p>
      </article>
    `).join('');
  }

  function renderFaqs() {
    if (!faqList) return;
    const items = state.bootstrap.faqs || [];
    if (!items.length) {
      faqList.innerHTML = `<div class="section-empty">以 鍮  以묒엯 덈떎.</div>`;
      return;
    }
    faqList.innerHTML = items.map(item => `
      <details class="faq-item">
        <summary>${escapeHtml(item.question || '')}</summary>
        <div class="faq-answer">${escapeHtml(item.answer || '')}</div>
      </details>
    `).join('');
  }

  function populateConsultationTypes() {
    if (!consultationTypeSelect) return;
    consultationTypeSelect.innerHTML = `<option value=""> 좏깮 댁＜ 몄슂</option>` +
      (state.bootstrap.products || []).map(item => `<option value="${escapeAttribute(item.product_id)}">${escapeHtml(item.title || item.product_id)}</option>`).join('');
  }

  function openProduct(productId) {
    const product = (state.bootstrap.products || []).find(item => String(item.product_id).trim() === String(productId).trim());
    if (!product || !modalBody || !modal) return;

    modalBody.innerHTML = `
      <section class="modal-card">
        <div class="modal-badge-row">
          ${product.category ? `<span class="modal-badge">${escapeHtml(product.category)}</span>` : ''}
          ${product.subtitle ? `<span class="modal-badge">${escapeHtml(product.subtitle)}</span>` : ''}
        </div>
        <h3>${escapeHtml(product.title || '')}</h3>
        <p>${escapeHtml(product.description || product.summary || '')}</p>
        <div class="modal-meta-grid">
          ${metaBox('異붿쿇    ', product.target || '-')}
          ${metaBox(' 곷떞 ъ씤  ', product.point || '-')}
          ${metaBox(' 곷떞諛⑺뼢', product.subtitle || '-')}
        </div>
        ${(product.point_1 || product.point_2 || product.point_3) ? `
          <ul class="modal-points">
            ${[product.point_1, product.point_2, product.point_3].filter(Boolean).map(point => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>` : ''}
        <div class="modal-action">
          <a href="#contact" class="btn" data-select-product="${escapeAttribute(product.product_id)}">   遺꾩빞濡   곷떞  좎껌</a>
        </div>
      </section>
    `;

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal?.setAttribute('aria-hidden', 'true');
    if (privacyPopup?.getAttribute('aria-hidden') === 'false') return;
    document.body.style.overflow = '';
  }

  function getReviewPerView() {
    return window.innerWidth <= 720 ? 1 : 2;
  }

  function setupReviewSlider(total) {
    if (!reviewGrid) return;
    const perView = getReviewPerView();
    const maxPage = Math.max(0, total - perView);
    state.reviewPage = Math.min(state.reviewPage, maxPage);

    const prev = document.querySelector('[data-review-nav="prev"]');
    const next = document.querySelector('[data-review-nav="next"]');

    if (total <= perView) {
      reviewGrid.style.transform = '';
      prev?.classList.add('is-hidden');
      next?.classList.add('is-hidden');
      if (reviewDots) {
        reviewDots.className = 'review-dots is-hidden';
        reviewDots.innerHTML = '';
      }
      stopReviewAuto();
      return;
    }

    if (window.innerWidth <= 720) {
      prev?.classList.add('is-hidden');
      next?.classList.add('is-hidden');
    } else {
      prev?.classList.remove('is-hidden');
      next?.classList.remove('is-hidden');
    }

    if (reviewDots) reviewDots.className = 'review-dots';

    const viewportWidth = reviewViewport ? reviewViewport.clientWidth : 0;
    const isMobile = window.innerWidth <= 720;
    const gap = isMobile ? 0 : 22;
    const cardWidth = isMobile ? viewportWidth : (viewportWidth - gap) / perView;

    reviewGrid.style.transform = `translateX(-${state.reviewPage * (cardWidth + gap)}px)`;

    if (reviewDots) {
      reviewDots.innerHTML = Array.from({ length: maxPage + 1 }).map((_, idx) =>
        `<button type="button" class="review-dot ${idx === state.reviewPage ? 'is-active' : ''}" data-review-dot="${idx}" aria-label="후기 ${idx + 1}"></button>`
      ).join('');
    }

    startReviewAuto(total);
  }

  function moveReviews(direction) {
    const total = (state.bootstrap.reviews || []).length;
    const maxPage = Math.max(0, total - getReviewPerView());
    state.reviewPage = direction === 'prev'
      ? (state.reviewPage <= 0 ? maxPage : state.reviewPage - 1)
      : (state.reviewPage >= maxPage ? 0 : state.reviewPage + 1);
    setupReviewSlider(total);
  }

  function startReviewAuto(total) {
    stopReviewAuto();
    if (total > getReviewPerView()) reviewAutoTimer = window.setInterval(() => moveReviews('next'), 3600);
  }

  function stopReviewAuto() {
    if (reviewAutoTimer) {
      window.clearInterval(reviewAutoTimer);
      reviewAutoTimer = null;
    }
  }

  function setupMobileProductSlider() {
    stopProductAuto();
    if (!productGrid) return;

    if (window.innerWidth > 768) {
      productGrid.scrollLeft = 0;
      return;
    }

    const cards = productGrid.querySelectorAll('.product-card');
    if (!cards.length || cards.length <= 1) return;

    if (!productGrid.dataset.mobileSliderBound) {
      productGrid.dataset.mobileSliderBound = 'Y';

      productGrid.addEventListener('touchstart', stopProductAuto, { passive: true });
      productGrid.addEventListener('mouseenter', stopProductAuto);
      productGrid.addEventListener('mouseleave', () => startProductAuto());
      productGrid.addEventListener('touchend', () => startProductAuto(), { passive: true });
    }

    startProductAuto();
  }

  function startProductAuto() {
    stopProductAuto();
    if (!productGrid || window.innerWidth > 768) return;

    const cards = Array.from(productGrid.querySelectorAll('.product-card'));
    if (cards.length <= 1) return;

    productAutoTimer = window.setInterval(() => {
      const currentLeft = productGrid.scrollLeft;
      let currentIndex = 0;

      cards.forEach((card, index) => {
        if (Math.abs(card.offsetLeft - currentLeft) < Math.abs(cards[currentIndex].offsetLeft - currentLeft)) {
          currentIndex = index;
        }
      });

      const nextIndex = currentIndex >= cards.length - 1 ? 0 : currentIndex + 1;
      productGrid.scrollTo({
        left: cards[nextIndex].offsetLeft,
        behavior: 'smooth'
      });
    }, 4200);
  }

  function stopProductAuto() {
    if (productAutoTimer) {
      window.clearInterval(productAutoTimer);
      productAutoTimer = null;
    }
  }

  function openPrivacyPopup() {
    if (!privacyPopup) return;
    privacyPopup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePrivacyPopup() {
    if (!privacyPopup) return;
    privacyPopup.setAttribute('aria-hidden', 'true');
    if (modal?.getAttribute('aria-hidden') === 'false') return;
    document.body.style.overflow = '';
  }

  function setTrackingFields() {
    const params = new URLSearchParams(window.location.search);
    setInputValue('agentCodeInput', params.get('agent') || '');
    setInputValue('utmSourceInput', params.get('utm_source') || '');
    setInputValue('utmMediumInput', params.get('utm_medium') || '');
    setInputValue('utmCampaignInput', params.get('utm_campaign') || '');
    setInputValue('landingPageInput', window.location.href);
    setInputValue('referrerInput', document.referrer || '');
  }

  function updateFormResult(message, type) {
    if (!formResult) return;
    formResult.textContent = message;
    formResult.className = `form-result${type ? ` is-${type}` : ''}`;
  }

  function setSubmitState(isSubmitting) {
    const button = document.getElementById('formSubmitButton');
    if (!button) return;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? ' 묒닔 以 ...' : ' 곷떞  좎껌 섍린';
  }

  function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setText(id, value, mode) {
    const el = document.getElementById(id);
    if (!el || value == null) return;
    mode === 'value' ? el.value = value : el.textContent = value;
  }

  function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function metaItem(label, value) {
    return `<div class="product-meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`;
  }

  function metaBox(label, value) {
    return `<div class="modal-meta-box"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`;
  }

  function convertLineBreaks(value) {
    return String(value || '').replace(/\n/g, '<br>');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[match]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
