(function () {
  const config = window.APP_CONFIG || {};
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

  init();

  async function init() {
    bindStaticEvents();
    setTrackingFields();

    const payload = config.useMockOnly
      ? normalizeData(window.MOCK_BOOTSTRAP_DATA || {})
      : await getBootstrapWithFallback();

    hydrate(payload);
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
      reviewViewport.addEventListener('touchstart', stopReviewAuto, { passive: true });
      reviewViewport.addEventListener('touchend', () => setupReviewSlider((state.bootstrap.reviews || []).length), { passive: true });
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

        if (!formData.get('name')?.trim()) return updateFormResult('성함을 입력해주세요.', 'error');
        const phone = formData.get('phone')?.replace(/\D+/g, '').trim();
        if (!phone) return updateFormResult('연락처를 입력해주세요.', 'error');
        if (!formData.get('consultation_type_id')?.trim()) return updateFormResult('상담 분야를 선택해주세요.', 'error');
        if (!formData.get('age_band')?.trim()) return updateFormResult('연령대를 선택해주세요.', 'error');

        const privacyAgreeInput = document.getElementById('privacyAgreeInput');
        if (privacyAgreeInput && !privacyAgreeInput.checked) return updateFormResult('개인정보 수집 및 이용 동의가 필요합니다.', 'error');

        if (phoneInput) phoneInput.value = phone;

        const extraLines = [];
        [['gender', '성별'], ['region_detail', '거주지역'], ['consultation_goal', '상담목적'], ['existing_insurance', '현재 보험 가입 상태'], ['contact_time', '상담 가능 시간대']]
          .forEach(([key, label]) => {
            const value = String(formData.get(key) || '').trim();
            if (value) extraLines.push(`${label}: ${value}`);
          });

        const originalMessage = String(formData.get('message') || '').trim();
        if (originalMessage) extraLines.push(`문의내용: ${originalMessage}`);

        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.value = extraLines.join('\n');

        setSubmitState(true);
        updateFormResult('상담 내용을 접수하고 있습니다...', 'pending');

        try {
          const response = await fetch(config.apiUrl, { method: 'POST', body: formData });
          const data = await response.json();
          if (data.success) {
            updateFormResult(data.data || data.message || '상담 신청이 정상 접수되었습니다.', 'success');
            form.reset();
            setTrackingFields();
          } else {
            updateFormResult(data.message || '오류가 발생했습니다.', 'error');
          }
        } catch (error) {
          updateFormResult('통신 중 문제가 발생했습니다. 다시 시도해주세요.', 'error');
        } finally {
          setSubmitState(false);
        }
      });
    }
  }

  async function getBootstrapWithFallback() {
    try {
      const apiPayload = await loadBootstrapFromApi();
      return normalizeData(apiPayload);
    } catch (error) {
      return normalizeData(window.MOCK_BOOTSTRAP_DATA || {});
    }
  }

  function loadBootstrapFromApi() {
    return new Promise(function (resolve, reject) {
      const callbackName = '__insuranceJsonpCallback_' + Date.now();
      const params = new URLSearchParams(window.location.search);
      params.set('action', 'bootstrap');
      params.set('callback', callbackName);

      const script = document.createElement('script');
      const requestUrl = config.apiUrl + '?' + params.toString();
      let finished = false;
      let timeoutId = null;

      window[callbackName] = function (payload) {
        if (finished) return;
        finished = true;
        cleanup(true);
        resolve(payload && payload.data ? payload.data : payload);
      };

      script.onerror = function () {
        if (finished) return;
        finished = true;
        cleanup(false);
        reject(new Error('bootstrap-load-failed'));
      };

      timeoutId = window.setTimeout(function () {
        if (finished) return;
        finished = true;
        cleanup(false);
        reject(new Error('bootstrap-timeout'));
      }, 8000);

      function cleanup(success) {
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
      products: ensureArray(safe.products, fb.products),
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
    const displayBrand = '보험플레이';
    const footerBrand = 'WAYZI(보험플레이)';
    const footerDescription = '대표 김도윤 · 사업자번호 538-42-01450';
    const heroImage = settings.hero_image || settings.hero_bg || '';

    setText('siteName', displayBrand);
    setText('footerSiteName', footerBrand);
    setText('siteNameInput', displayBrand, 'value');
    setText('footerDescription', footerDescription);
    setText('heroTag1', settings.hero_tag_1 || '무료 보장분석');
    setText('heroTag2', settings.hero_tag_2 || '맞춤 설계');
    setText('heroTag3', settings.hero_tag_3 || '1:1 상담');
    setHtml('heroTitle', convertLineBreaks(escapeHtml(settings.hero_title || '보험 비교 상담,\n복잡하게 비교하지 마세요.')));
    setHtml('heroSubtitle', convertLineBreaks(escapeHtml(settings.hero_subtitle || '지금 필요한 보장부터 기존 보험 점검까지\n한 번에 정리해드리는 상담 페이지입니다.')));
    setHtml('identityTitle', (() => {
      const text = settings.identity_title || '특정 상품만 권하는 곳이 아니라\n상황에 맞게 정리하는 상담입니다.';
      const parts = text.split('\n');
      return parts.length > 1 ? `${escapeHtml(parts[0])}<br><span>${escapeHtml(parts.slice(1).join(' '))}</span>` : `<span>${escapeHtml(text)}</span>`;
    })());
    setHtml('identityDesc', convertLineBreaks(escapeHtml(settings.identity_desc || '신규 가입만 보는 상담이 아닙니다.\n기존 보험 리모델링, 가족 보장 점검, 실손·암·운전자·종신 등\n현재 상황에 맞춰 우선순위를 정리하는 상담 페이지입니다.')));

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
      const label = category === 'ALL' ? '전체 상담' : category;
      return `<button type="button" class="filter-chip${isActive}" data-category="${escapeAttribute(category)}">${escapeHtml(label)}</button>`;
    }).join('');
  }

  function renderProducts() {
    if (!productGrid) return;
    const products = (state.bootstrap.products || []).filter(item => state.activeCategory === 'ALL' || item.category === state.activeCategory);

    if (!products.length) {
      productGrid.innerHTML = `<div class="section-empty">현재 준비된 상담 분야가 없습니다. 바로 상담 신청을 남겨주시면 순차적으로 안내드립니다.</div>`;
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
                <span class="product-badge">${escapeHtml(product.category || '보험상담')}</span>
                ${product.subtitle ? `<span class="product-badge">${escapeHtml(product.subtitle)}</span>` : ''}
              </div>
              <h3 class="product-title">${escapeHtml(product.title || '보험 상담')}</h3>
            </div>
          </div>
          <div class="product-content">
            <p class="product-summary">${escapeHtml(product.summary || '')}</p>
            <div class="product-meta">
              ${metaItem('추천대상', product.target || '-')}
              ${metaItem('상담포인트', product.point || '-')}
            </div>
            <div class="product-actions">
              <a href="#contact" class="btn" data-select-product="${escapeAttribute(product.product_id)}">상담 신청</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderReviews() {
    if (!reviewGrid) return;
    const reviews = state.bootstrap.reviews || [];
    if (!reviews.length) {
      reviewGrid.innerHTML = `<div class="section-empty">준비 중인 후기가 곧 업데이트됩니다.</div>`;
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
            <h3>${escapeHtml(review.title || '상담 후기')}</h3>
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
      targetGrid.innerHTML = `<div class="section-empty">준비 중입니다.</div>`;
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
      faqList.innerHTML = `<div class="section-empty">준비 중입니다.</div>`;
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
    consultationTypeSelect.innerHTML = `<option value="">선택해주세요</option>` +
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
          ${metaBox('추천대상', product.target || '-')}
          ${metaBox('상담포인트', product.point || '-')}
          ${metaBox('상담방향', product.subtitle || '-')}
        </div>
        ${(product.point_1 || product.point_2 || product.point_3) ? `
          <ul class="modal-points">
            ${[product.point_1, product.point_2, product.point_3].filter(Boolean).map(point => `<li>${escapeHtml(point)}</li>`).join('')}
          </ul>` : ''}
        <div class="modal-action">
          <a href="#contact" class="btn" data-select-product="${escapeAttribute(product.product_id)}">이 분야로 상담 신청</a>
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

    prev?.classList.remove('is-hidden');
    next?.classList.remove('is-hidden');
    if (reviewDots) reviewDots.className = 'review-dots';

    const gap = 22;
    const viewportWidth = reviewViewport ? reviewViewport.clientWidth : 0;
    const cardWidth = (viewportWidth - gap) / perView;
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
    button.textContent = isSubmitting ? '접수 중...' : '상담 신청하기';
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
