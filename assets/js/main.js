(function () {
  const config = window.APP_CONFIG || {};
  const modal = document.getElementById('scheduleModal');
  const modalBody = document.getElementById('scheduleModalBody');
  const scheduleGrid = document.getElementById('scheduleGrid');
  const scheduleFilters = document.getElementById('scheduleFilters');
  const reviewGrid = document.getElementById('reviewGrid');
  const reviewDots = document.getElementById('reviewDots');
  const reviewViewport = document.getElementById('reviewViewport');
  const form = document.getElementById('contactForm');
  const formResult = document.getElementById('formResult');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');
  const phoneInput = document.getElementById('phoneInput');
  const mainContent = document.querySelector('main');
  const stickyInquiryBar = document.getElementById('stickyInquiryBar');
  const footer = document.getElementById('footer');
  const MOBILE_STICKY_HIDE_BREAKPOINT = 768;

  /* ---------------------------------------------------------
     페이지 섹션 순서 설정
     - 숫자만 바꾸면 순서가 바뀝니다.
     - 현재 기본값:
       1 소개문구(히어로 아래)
       2 기초안내
       3 추천 일정
       4 최저가가 아니라면 할인해드립니다.
       5 여행후기
       6 이용대상자
       7 선실비교
       8 예약과정
       9 FAQ
       10 멤버십 안내
       11 가격 문의하기
       12 콘텐츠연결
     --------------------------------------------------------- */
  const SECTION_SEQUENCE = [
    { order: 1, key: 'identitySection' },
    { order: 2, key: 'basicInfoSection' },
    { order: 3, key: 'scheduleSection' },
    { order: 4, key: 'priceGuaranteeSection' },
    { order: 5, key: 'reviewSection' },
    { order: 6, key: 'targetsSection' },
    { order: 7, key: 'cabinsSection' },
    { order: 8, key: 'processSection' },
    { order: 9, key: 'faqSection' },
    { order: 10, key: 'membershipSection' },
    { order: 11, key: 'contactSection' },
    { order: 12, key: 'contentSection' }
  ];

  const state = {
    bootstrap: {
      settings: {}, schedules: [], schedule_days: [], reviews: [],
      targets: [], basic_info: [], process_steps: [], cabins: [],
      faqs: [], trust_points: [], content_links: []
    },
    activeRegion: 'ALL',
    reviewPage: 0,
    basicInfoPage: 0,
    contentLinksOrder: [],
    contentLinksVisibleCount: getInitialContentLinksVisibleCount(),
  };

  let reviewAutoTimer = null;
  let basicInfoAutoTimer = null;
  let isStickyFooterIntersecting = false;
  let stickyFooterObserver = null;

  const BOOTSTRAP_STORAGE_KEY = 'cruiseplay_bootstrap_cache_v1';
  const BOOTSTRAP_STORAGE_TTL = 60 * 60 * 1000;

  function getInitialContentLinksVisibleCount() {
    return window.innerWidth <= 768 ? 4 : 3;
  }

  init();

  async function init() {
    bindStaticEvents();
    setTrackingFields();
    setMembershipLink();
    showInquiryLoadingOverlayIfNeeded();
    syncMobileStickyInquiryVisibility();
    setupStickyInquiryFooterObserver();

    if (config.useMockOnly) {
      const payload = normalizeData(window.MOCK_BOOTSTRAP_DATA || {});
      hydrate(payload);
      handleInitialInquiryNavigation();
      return;
    }

    const cachedPayload = getCachedBootstrapData();
    if (cachedPayload) {
      hydrate(cachedPayload);
      handleInitialInquiryNavigation();
    }

    const payload = await getBootstrapWithFallback();
    hydrate(payload);
    cacheBootstrapData(payload);
    handleInitialInquiryNavigation();
  }

  function bindStaticEvents() {
    if (mobileMenuToggle && mainNav) {
      mobileMenuToggle.addEventListener('click', () => mainNav.classList.toggle('is-open'));
    }

    document.addEventListener('click', (event) => {
      const target = event.target;

      const filterButton = target.closest('[data-region]');
      if (filterButton) {
        state.activeRegion = filterButton.getAttribute('data-region') || 'ALL';
        logDebug('filter.click', { region: state.activeRegion });
        renderFilters();
        renderSchedules();
        return;
      }

      const selectButton = target.closest('[data-select-schedule]');
      if (selectButton) {
        event.stopPropagation();
        const scheduleId = selectButton.getAttribute('data-select-schedule');
        const scheduleSelect = document.getElementById('interestScheduleSelect');
        if (scheduleSelect) scheduleSelect.value = scheduleId || '';
        logDebug('schedule.select', { scheduleId: scheduleId || '' });
        scrollToSection('contact');
        closeModal();
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

      const basicInfoDot = target.closest('[data-basic-info-dot]');
      if (basicInfoDot) {
        const page = Number(basicInfoDot.getAttribute('data-basic-info-dot') || 0);
        scrollBasicInfoToPage(page);
        return;
      }

      const contentMoreButton = target.closest('[data-content-more]');
      if (contentMoreButton) {
        state.contentLinksVisibleCount += getContentLinksStep();
        renderContentLinks();
        return;
      }

      const openCard = target.closest('[data-open-schedule]');
      if (openCard) {
        openSchedule(openCard.getAttribute('data-open-schedule'));
        return;
      }

      if (target.closest('[data-close-modal]')) {
        closeModal();
        return;
      }
    });

    window.addEventListener('resize', () => {
      setupReviewSlider((state.bootstrap.reviews || []).length);
      setupBasicInfoSlider();
      applyScheduleHeaderDesktopFix();
      syncStickyInquiryFooterVisibility();
      requestAnimationFrame(() => scrollBasicInfoToPage(state.basicInfoPage || 0, 'auto'));
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

    if (form && stickyInquiryBar) {
      form.addEventListener('focusin', handleMobileStickyInquiryFocusIn);
      form.addEventListener('focusout', handleMobileStickyInquiryFocusOut);
      window.addEventListener('resize', syncMobileStickyInquiryVisibility);

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncMobileStickyInquiryVisibility);
      }
    }

    // 💡 Fetch API 기반의 모던 폼 제출 (Iframe 해킹 제거)
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        if (!formData.get('name')?.trim()) return updateFormResult('성함을 입력해주세요.', 'error');

        const phone = formData.get('phone')?.replace(/\D+/g, '').trim();
        if (!phone) return updateFormResult('연락처를 입력해주세요.', 'error');
        if (!formData.get('interest_schedule_id')?.trim()) return updateFormResult('문의내용을 선택해주세요.', 'error');
        if (!formData.get('people_count')?.trim()) return updateFormResult('여행 예상 인원수를 선택해주세요.', 'error');

        const privacyAgreeInput = document.getElementById('privacyAgreeInput');
        if (privacyAgreeInput && !privacyAgreeInput.checked) return updateFormResult('개인정보 수집 및 이용 동의가 필요합니다.', 'error');

        if (phoneInput) phoneInput.value = phone;

        const regionDetail = formData.get('region_detail')?.trim();
        const travelReadyStatus = formData.get('travel_ready_status')?.trim();
        const originalMessage = formData.get('message')?.trim();

        const extraLines = [];
        if (regionDetail) extraLines.push(`거주지역: ${regionDetail}`);
        if (travelReadyStatus) extraLines.push(`여권/카드 소지 여부: ${travelReadyStatus}`);
        if (originalMessage) extraLines.push(`문의내용: ${originalMessage}`);

        const messageInput = document.getElementById('messageInput');
        if (messageInput) messageInput.value = extraLines.join('\n');

        setSubmitState(true);
        updateFormResult('문의 내용을 접수하고 있습니다...', 'pending');
        logDebug('form.submit', { schedule_id: formData.get('interest_schedule_id') });

        try {
          const response = await fetch(config.apiUrl, { method: 'POST', body: formData });
          const data = await response.json();

          if (data.success) {
            updateFormResult(data.data || data.message || '문의가 정상 접수되었습니다.', 'success');
            form.reset();
            setTrackingFields();
            syncMobileStickyInquiryVisibility();
          } else {
            updateFormResult(data.message || '오류가 발생했습니다.', 'error');
          }
        } catch (error) {
          updateFormResult('통신 중 문제가 발생했습니다. 다시 시도해주세요.', 'error');
          logDebug('form.result.error', { error: error.message });
        } finally {
          setSubmitState(false);
        }
      });
    }
  }

  function initGlobalDebugHandlers() {
    return;
  }

  function getCachedBootstrapData() {
    try {
      const raw = localStorage.getItem(BOOTSTRAP_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.savedAt || !parsed.data) return null;
      if (Date.now() - Number(parsed.savedAt) > BOOTSTRAP_STORAGE_TTL) return null;

      return normalizeData(parsed.data);
    } catch (error) {
      return null;
    }
  }

  function cacheBootstrapData(payload) {
    try {
      localStorage.setItem(BOOTSTRAP_STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(),
        data: payload
      }));
    } catch (error) {}
  }

  function showInquiryLoadingOverlayIfNeeded() {
    const overlay = document.getElementById('inquiryLoadingOverlay');
    if (!overlay) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('openInquiry') !== '1') return;

    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hideInquiryLoadingOverlay() {
    const overlay = document.getElementById('inquiryLoadingOverlay');
    if (!overlay) return;

    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
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
      const callbackName = '__cruiseJsonpCallback_' + Date.now();
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

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }

        if (success) {
          window[callbackName] = function () {};
          setTimeout(function () {
            try { delete window[callbackName]; } catch (e) {}
          }, 30000);
        } else {
          try { delete window[callbackName]; } catch (e) {}
        }
      }

      script.src = requestUrl;
      script.async = true;
      document.body.appendChild(script);
    });
  }

  function hydrate(data) {
    state.bootstrap = normalizeData(data);
    state.contentLinksOrder = shuffleArray([...(state.bootstrap.content_links || [])]);
    state.contentLinksVisibleCount = getInitialContentLinksVisibleCount();
    logDebug('hydrate.start', getBootstrapDebugSummary(state.bootstrap));
    renderSettings();
    renderFilters();
    startHeroMotion();
    renderSchedules();
    renderReviews();
    populateFormSelects();
    renderExtraSections();
    reorderPageSections();
    applyScheduleHeaderDesktopFix();
    logDebug('hydrate.done', { ok: true });
  }

  function applyScheduleHeaderDesktopFix() {
    const sectionTopline = document.querySelector('#schedule .section-topline');
    const contentBlock = sectionTopline?.querySelector(':scope > div:first-child') || null;
    const moreLink = sectionTopline?.querySelector('.section-more-link') || null;

    if (!sectionTopline || !contentBlock) return;

    if (window.innerWidth <= 768) {
      sectionTopline.style.position = '';
      sectionTopline.style.justifyContent = '';
      sectionTopline.style.textAlign = '';
      contentBlock.style.width = '';
      contentBlock.style.textAlign = '';

      if (moreLink) {
        moreLink.style.position = '';
        moreLink.style.right = '';
        moreLink.style.top = '';
        moreLink.style.transform = '';
      }
      return;
    }

    sectionTopline.style.position = 'relative';
    sectionTopline.style.justifyContent = 'center';
    sectionTopline.style.textAlign = 'center';
    contentBlock.style.width = '100%';
    contentBlock.style.textAlign = 'center';

    if (moreLink) {
      moreLink.style.position = 'absolute';
      moreLink.style.right = '0';
      moreLink.style.top = '50%';
      moreLink.style.transform = 'translateY(-50%)';
    }
  }

  function normalizeData(data) {
    const safe = data || {};
    const fb = window.MOCK_BOOTSTRAP_DATA || {};
    return {
      settings: safe.settings || fb.settings || {},
      schedules: ensureArray(safe.schedules, fb.schedules),
      schedule_days: ensureArray(safe.schedule_days, fb.schedule_days),
      reviews: ensureArray(safe.reviews, fb.reviews),
      targets: ensureArray(safe.targets, fb.targets),
      basic_info: ensureArray(safe.basic_info, fb.basic_info),
      process_steps: ensureArray(safe.process_steps, fb.process_steps),
      cabins: ensureArray(safe.cabins, fb.cabins),
      faqs: ensureArray(safe.faqs, fb.faqs),
      trust_points: ensureArray(safe.trust_points, fb.trust_points),
      content_links: ensureArray(safe.content_links, fb.content_links)
    };
  }

  function ensureArray(primary, fallback) {
    return Array.isArray(primary) ? primary : (Array.isArray(fallback) ? fallback : []);
  }

  function getBootstrapDebugSummary(payload) {
    return Object.keys(payload || {}).reduce((acc, key) => {
      acc[key] = Array.isArray(payload[key]) ? payload[key].length : 0;
      return acc;
    }, {});
  }

  function renderSettings() {
    const settings = state.bootstrap.settings || {};
    const siteName = settings.site_title || settings.site_name || '크루즈 플레이';
    const heroImage = settings.hero_image || settings.hero_bg || '';

    setText('siteName', siteName);
    setText('footerSiteName', 'WAYZI');
    setText('siteNameInput', siteName, 'value');
    setText('heroTag1', settings.hero_tag_1 || '최저가 보장제');
    setText('heroTag2', settings.hero_tag_2 || 'NO 쇼핑·옵션');
    setText('heroTag3', settings.hero_tag_3 || '100% 출발확정');

    setHtml('heroTitle', convertLineBreaks(escapeHtml(settings.hero_title || '크루즈 여행,\n패키지 말고 직구하세요.')));
    setText('heroSubtitle', settings.hero_subtitle || '마음에 드는 일정이 있으면 확인 후 바로 문의해주세요.');
    setText('heroBottomText', settings.hero_bottom_text || '가격보다 일정이 먼저 보이도록, 한눈에 비교되는 구조로 다시 정리했습니다.');

    setHtml('identityTitle', (() => {
      const text = settings.identity_title || '크루즈플레이는\n여행사가 아닙니다.';
      const parts = text.split('\n');
      return parts.length > 1 ? `${escapeHtml(parts[0])}<br><span>${escapeHtml(parts.slice(1).join(' '))}</span>` : `<span>${escapeHtml(text)}</span>`;
    })());

    setHtml('identityDesc', convertLineBreaks(escapeHtml(settings.identity_desc || '쇼핑과 옵션이 포함된 패키지 여행이 아닙니다.\n오직 크루즈 일정과 항해 루트를 투명하게 비교하고 선택하는\n자유여행 중심 안내 플랫폼입니다.')));
    setText('footerDescription', '대표 김도윤 · 사업자번호 538-42-01450');

    const heroBg = document.getElementById('heroBg');
    if (heroBg && heroImage) {
      heroBg.style.backgroundImage = `linear-gradient(180deg, rgba(7, 25, 57, 0.12), rgba(7, 25, 57, 0.4)), url("${heroImage.replace(/"/g, '\\"')}")`;
    }
  }

  function startHeroMotion() {
    document.querySelector('.hero-content')?.classList.add('is-live');
  }

  function renderFilters() {
    if (!scheduleFilters) return;
    const regions = ['ALL', ...new Set(state.bootstrap.schedules.map(item => item.region).filter(Boolean))];

    scheduleFilters.innerHTML = regions.map(region => {
      const isActive = state.activeRegion === region ? ' is-active' : '';
      const label = region === 'ALL' ? '전체 일정' : region;
      return `<button type="button" class="filter-chip${isActive}" data-region="${escapeAttribute(region)}">${escapeHtml(label)}</button>`;
    }).join('');
  }

  function renderSchedules() {
    if (!scheduleGrid) return;
    const schedules = state.bootstrap.schedules.filter(item => state.activeRegion === 'ALL' || item.region === state.activeRegion).slice(0, 6);

    if (!schedules.length) {
      scheduleGrid.innerHTML = `<div class="schedule-empty">현재 준비된 일정이 없습니다. 일정 문의를 남겨주시면 가능한 항차를 안내해드립니다.</div>`;
      return;
    }

    scheduleGrid.innerHTML = schedules.map(schedule => {
      const imageUrl = schedule.thumbnail_url || schedule.schedule_image_url || '';
      return `
        <article class="schedule-card ${String(schedule.highlight_yn || '').trim().toUpperCase() === 'Y' ? 'is-highlighted' : ''}" data-open-schedule="${escapeAttribute(schedule.schedule_id)}">
          <div class="schedule-visual">
            ${imageUrl ? `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(schedule.title || '')}" />` : ''}
            <div class="schedule-visual-inner">
              <div class="schedule-badges">
                <span class="schedule-badge">${escapeHtml(schedule.region || '크루즈')}</span>
                <span class="schedule-badge schedule-badge-month">${escapeHtml(getMonthLabel(schedule.departure_date))} 출발</span>
              </div>
              <h3 class="schedule-title">${highlightMonthText(schedule.title || '크루즈 일정')}</h3>
            </div>
          </div>
          <div class="schedule-content">
            <div class="schedule-meta">
              ${metaItem('선박', schedule.ship_name)}
              ${metaItem('모항지', getHomePort(schedule.schedule_id))}
              ${metaItem('출발', formatDate(schedule.departure_date))}
              ${metaItem('도착', formatDate(schedule.return_date))}
            </div>
            <div class="schedule-actions">
              <a href="#contact" class="btn" data-select-schedule="${escapeAttribute(schedule.schedule_id)}">가격문의</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function getMonthLabel(dateValue) {
    const match = String(dateValue || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${Number(match[2])}월` : '';
  }

  function highlightMonthText(text) {
    return escapeHtml(String(text || '')).replace(/(\d{1,2}월)/g, '<span class="schedule-month-accent">$1</span>');
  }

  function shuffleArray(items) {
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function renderReviews() {
    if (!reviewGrid) return;

    const reviews = shuffleArray([...(state.bootstrap.reviews || [])]);

    if (!reviews.length) {
      reviewGrid.innerHTML = `<div class="schedule-empty">준비 중인 후기가 곧 업데이트됩니다.</div>`;
      if (reviewDots) reviewDots.innerHTML = '';
      return;
    }

    reviewGrid.innerHTML = reviews.map(review => {
      const imageCandidates = [
        review.thumbnail_url,
        review.image_url,
        review.photo_url
      ].filter(Boolean);

      const imageUrl = imageCandidates.length
        ? imageCandidates[Math.floor(Math.random() * imageCandidates.length)]
        : '';

      return `
        <article class="review-card">
          <div class="review-thumb">
            ${imageUrl ? `<img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(review.title || '')}" />` : ''}
          </div>
          <div class="review-body">
            ${review.region ? `<span class="review-region">${escapeHtml(review.region)}</span>` : ''}
            <h3>${escapeHtml(review.title || '크루즈 후기')}</h3>
            <p>${escapeHtml(review.summary || review.content || '')}</p>
          </div>
        </article>
      `;
    }).join('');

    state.reviewPage = 0;
    setupReviewSlider(reviews.length);
  }

  function openSchedule(scheduleId) {
    const schedule = state.bootstrap.schedules.find(item => String(item.schedule_id).trim() === String(scheduleId).trim());
    if (!schedule) return;

    const days = state.bootstrap.schedule_days
      .filter(item => String(item.schedule_id).trim() === String(scheduleId).trim())
      .sort((a, b) => Number(a.day_no || 0) - Number(b.day_no || 0));

    const routeStops = getRouteStops(scheduleId, days);
    const imageUrl = schedule.schedule_image_url || schedule.thumbnail_url || '';

    modalBody.innerHTML = `
      <section class="modal-hero-card">
        <div class="modal-badge-row">
          <span class="modal-badge">${escapeHtml(schedule.region || '크루즈')}</span>
          <span class="modal-badge">${escapeHtml(formatDate(schedule.departure_date))} 출발</span>
        </div>
        <div class="modal-summary-grid">
          <div>
            <h3 class="modal-hero-title">${escapeHtml(schedule.title || '크루즈 일정')}</h3>
            <div class="modal-action">
              <a href="#contact" class="btn" data-select-schedule="${escapeAttribute(schedule.schedule_id)}" data-close-modal>가격문의</a>
            </div>
          </div>
          <div class="modal-meta-grid">
            ${metaBox('선박', schedule.ship_name)}
            ${metaBox('모항지', getHomePort(schedule.schedule_id))}
            ${metaBox('출발', formatDate(schedule.departure_date))}
            ${metaBox('도착', formatDate(schedule.return_date))}
          </div>
        </div>
      </section>
      <section class="modal-route-card">
        <div class="modal-card-head"><h4>항해 루트</h4><p>한눈에 보이는 선형 타임라인으로 정리했습니다.</p></div>
        <div class="route-track">${buildRouteTrack(routeStops)}</div>
      </section>
      <section class="modal-table-card">
        <div class="modal-card-head"><h4>상세 항해 일정</h4><p>일차 · 날짜 · 기항지 · 입항 · 출항을 표로 바로 확인할 수 있습니다.</p></div>
        <div class="table-scroll">${buildItineraryTable(days)}</div>
        <p class="modal-table-note">* 현지 사정 및 기상 상황에 의해 기항지 및 입출항 시간은 변경될 수 있습니다.</p>
      </section>
      ${imageUrl ? `
        <section class="modal-image-card">
          <div class="modal-card-head"><h4>일정표 이미지</h4><p>시트에 등록된 일정표 이미지를 함께 보여줍니다.</p></div>
          <div class="schedule-image-frame"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(schedule.title || '')}" /></div>
        </section>` : ''}
    `;

    if (modal) modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function buildRouteTrack(stops) {
    if (!stops.length) return `<div class="schedule-empty">루트 정보가 아직 등록되지 않았습니다.</div>`;
    return stops.map((stop, index) => {
      const label = index === 0 ? 'DEPARTURE' : (index === stops.length - 1 ? 'ARRIVAL' : `STOP ${index}`);
      return `
        <div class="route-stop">
          <div class="route-pill"><small>${label}</small><strong>${escapeHtml(stop)}</strong></div>
          ${index < stops.length - 1 ? `<div class="route-line">→</div>` : ''}
        </div>`;
    }).join('');
  }

  function buildItineraryTable(days) {
    if (!days.length) return `<div class="schedule-empty" style="margin:18px;">상세 항해일정이 아직 등록되지 않았습니다.</div>`;
    return `
      <table class="itinerary-table">
        <thead><tr><th>일차</th><th>날짜</th><th>기항지 (PORT)</th><th>입항</th><th>출항</th></tr></thead>
        <tbody>
          ${days.map(buildItineraryRow).join('')}
        </tbody>
      </table>`;
  }

  function buildItineraryRow(day) {
    const overnight = /overnight|정박/i.test(String(day.description || '')) ? `<span class="overnight-badge">정박 (Overnight)</span>` : '';
    return `
      <tr class="${isHighlightDay(day) ? 'is-highlight' : ''}">
        <td class="day-cell">Day ${day.day_no || ''}</td>
        <td class="date-cell">${escapeHtml(formatDayDate(day.date))}</td>
        <td>
          <span class="port-name-kr">${escapeHtml(day.port_name || day.city || '-')}${overnight}</span>
          ${day.port_name_en || day.country ? `<span class="port-name-en">${escapeHtml(day.port_name_en || day.country)}</span>` : ''}
        </td>
        ${normalizeTimeCell(day.arrival_time, 'arrival')}
        ${normalizeTimeCell(day.departure_time, 'departure')}
      </tr>`;
  }

  function isHighlightDay(day) {
    return /overnight|정박/i.test(String(day.description || ''));
  }

  function normalizeTimeCell(value, kind) {
    const text = String(value || '').trim();
    if (!text || text === '-' || text === '—') return `<td class="time-cell muted">-</td>`;
    if (kind === 'departure' && /(도착|arrival)/i.test(text)) return `<td class="time-cell arrival">${escapeHtml(text)}</td>`;
    return `<td class="time-cell">${escapeHtml(text)}</td>`;
  }

  function formatDayDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} (${weekdays[date.getDay()]})`;
  }

  function getReviewPerView() { return window.innerWidth <= 768 ? 1 : 2; }

  // =========================================================
  // 2) setupReviewSlider
  // 시작: function setupReviewSlider(total) {
  // 끝  : }
  // =========================================================
  function setupReviewSlider(total) {
    if (!reviewGrid || !reviewViewport) return;

    const mobileMode = window.innerWidth <= 768;
    const prev = document.querySelector('[data-review-nav="prev"]');
    const next = document.querySelector('[data-review-nav="next"]');

    if (mobileMode) {
      if (!reviewViewport.dataset.reviewMobileBound) {
        reviewViewport.addEventListener('scroll', () => {
          const cards = Array.from(reviewGrid.querySelectorAll('.review-card'));
          const viewportCenter = reviewViewport.scrollLeft + (reviewViewport.clientWidth / 2);
          let closestIndex = 0;
          let closestDistance = Infinity;

          cards.forEach((card, idx) => {
            const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
            const distance = Math.abs(cardCenter - viewportCenter);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestIndex = idx;
            }
          });

          state.reviewPage = closestIndex;
        }, { passive: true });

        reviewViewport.dataset.reviewMobileBound = 'true';
      }

      const cards = Array.from(reviewGrid.querySelectorAll('.review-card'));

      reviewGrid.style.transform = '';
      prev?.classList.add('is-hidden');
      next?.classList.add('is-hidden');

      if (reviewDots) {
        reviewDots.className = 'review-dots is-hidden';
        reviewDots.innerHTML = '';
      }

      if (total <= 1) {
        stopReviewAuto();
        return;
      }

      state.reviewPage = Math.min(state.reviewPage, total - 1);

      const targetCard = cards[state.reviewPage];
      if (targetCard) {
        reviewViewport.scrollTo({
          left: targetCard.offsetLeft - ((reviewViewport.clientWidth - targetCard.offsetWidth) / 2),
          behavior: 'smooth'
        });
      }

      startReviewAuto(total);
      return;
    }

    const perView = getReviewPerView();
    const maxPage = Math.max(0, total - perView);
    state.reviewPage = Math.min(state.reviewPage, maxPage);

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
    const viewportWidth = reviewViewport.clientWidth || 0;
    const cardWidth = (viewportWidth - gap) / perView;
    reviewGrid.style.transform = `translateX(-${state.reviewPage * (cardWidth + gap)}px)`;

    if (reviewDots) {
      reviewDots.innerHTML = Array.from({ length: maxPage + 1 }).map((_, idx) =>
        `<button type="button" class="review-dot ${idx === state.reviewPage ? 'is-active' : ''}" data-review-dot="${idx}" aria-label="후기 ${idx + 1}"></button>`
      ).join('');
    }

    startReviewAuto(total);
  }

  // =========================================================
  // 3) moveReviews
  // 시작: function moveReviews(direction) {
  // 끝  : }
  // =========================================================
  function moveReviews(direction) {
    const total = (state.bootstrap.reviews || []).length;
    if (!total) return;

    if (window.innerWidth <= 768) {
      const cards = Array.from(reviewGrid.querySelectorAll('.review-card'));
      if (!cards.length || !reviewViewport) return;

      const maxPage = total - 1;
      state.reviewPage = direction === 'prev'
        ? (state.reviewPage <= 0 ? maxPage : state.reviewPage - 1)
        : (state.reviewPage >= maxPage ? 0 : state.reviewPage + 1);

      const targetCard = cards[state.reviewPage];
      if (targetCard) {
        reviewViewport.scrollTo({
          left: targetCard.offsetLeft - ((reviewViewport.clientWidth - targetCard.offsetWidth) / 2),
          behavior: 'smooth'
        });
      }
      return;
    }

    const maxPage = Math.max(0, total - getReviewPerView());
    state.reviewPage = direction === 'prev'
      ? (state.reviewPage <= 0 ? maxPage : state.reviewPage - 1)
      : (state.reviewPage >= maxPage ? 0 : state.reviewPage + 1);

    setupReviewSlider(total);
  }

  function startReviewAuto(total) {
    stopReviewAuto();
    if (total > 1) {
      reviewAutoTimer = window.setInterval(() => moveReviews('next'), 3600);
    }
  }

  function stopReviewAuto() {
    if (reviewAutoTimer) {
      window.clearInterval(reviewAutoTimer);
      reviewAutoTimer = null;
    }
  }

  function setupBasicInfoSlider() {
    const viewport = document.getElementById('basicInfoViewport');
    const dots = document.getElementById('basicInfoDots');
    const total = (state.bootstrap.basic_info || []).length;

    if (!viewport || !dots) return;

    if (!viewport.dataset.basicInfoScrollBound) {
      viewport.addEventListener('scroll', () => {
        const width = viewport.clientWidth || 1;
        state.basicInfoPage = Math.round(viewport.scrollLeft / width);
        syncBasicInfoDots();
      }, { passive: true });

      viewport.dataset.basicInfoScrollBound = 'true';
    }

    if (!viewport.dataset.basicInfoAutoBound) {
      viewport.addEventListener('mouseenter', stopBasicInfoAuto);
      viewport.addEventListener('mouseleave', () => {
        startBasicInfoAuto((state.bootstrap.basic_info || []).length);
      });

      viewport.addEventListener('touchstart', stopBasicInfoAuto, { passive: true });
      viewport.addEventListener('touchend', () => {
        startBasicInfoAuto((state.bootstrap.basic_info || []).length);
      }, { passive: true });

      viewport.dataset.basicInfoAutoBound = 'true';
    }

    if (total <= 1) {
      stopBasicInfoAuto();
      state.basicInfoPage = 0;
      dots.className = 'sheet-extra-dots is-hidden';
      dots.innerHTML = '';
      return;
    }

    const maxPage = total - 1;
    state.basicInfoPage = Math.min(state.basicInfoPage, maxPage);

    dots.className = 'sheet-extra-dots';
    dots.innerHTML = Array.from({ length: total }).map((_, idx) => `
      <button
        type="button"
        class="sheet-extra-dot ${idx === state.basicInfoPage ? 'is-active' : ''}"
        data-basic-info-dot="${idx}"
        aria-label="기초안내 ${idx + 1}"
      ></button>
    `).join('');

    syncBasicInfoDots();
    startBasicInfoAuto(total);
  }

  function scrollBasicInfoToPage(page, behavior = 'smooth') {
    const viewport = document.getElementById('basicInfoViewport');
    const total = (state.bootstrap.basic_info || []).length;

    if (!viewport || total <= 1) return;

    const safePage = Math.max(0, Math.min(page, total - 1));
    state.basicInfoPage = safePage;

    viewport.scrollTo({
      left: viewport.clientWidth * safePage,
      behavior
    });

    syncBasicInfoDots();
  }

  function moveBasicInfoAuto() {
    const total = (state.bootstrap.basic_info || []).length;
    if (total <= 1) return;

    const nextPage = state.basicInfoPage >= total - 1 ? 0 : state.basicInfoPage + 1;
    scrollBasicInfoToPage(nextPage);
  }

  function startBasicInfoAuto(total) {
    stopBasicInfoAuto();
    if (total > 1) {
      basicInfoAutoTimer = window.setInterval(() => {
        moveBasicInfoAuto();
      }, 3800);
    }
  }

  function stopBasicInfoAuto() {
    if (basicInfoAutoTimer) {
      window.clearInterval(basicInfoAutoTimer);
      basicInfoAutoTimer = null;
    }
  }

  function syncBasicInfoDots() {
    const dotButtons = document.querySelectorAll('#basicInfoDots [data-basic-info-dot]');
    dotButtons.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === state.basicInfoPage);
    });
  }

  function getHomePort(scheduleId) {
    const schedule = state.bootstrap.schedules.find(item => String(item.schedule_id).trim() === String(scheduleId).trim()) || {};
    if (schedule.home_port) return String(schedule.home_port).trim();
    const stops = getRouteStops(scheduleId);
    return stops.length ? stops[0] : '';
  }

  function populateFormSelects() {
    const scheduleSelect = document.getElementById('interestScheduleSelect');
    if (!scheduleSelect) return;
    scheduleSelect.innerHTML =
      `<option value="">선택해주세요</option>` +
      `<option value="membership_inquiry">멤버십 문의</option>` +
      state.bootstrap.schedules.map(s => `<option value="${escapeAttribute(s.schedule_id)}">${escapeHtml(s.title || s.schedule_id)}</option>`).join('');
  }

  function getRouteStops(scheduleId, preloadedDays) {
    const schedule = state.bootstrap.schedules.find(item => String(item.schedule_id).trim() === String(scheduleId).trim()) || {};
    if (schedule.route_ports) return String(schedule.route_ports).split('|').map(cleanStop).filter(Boolean);

    const days = Array.isArray(preloadedDays) ? preloadedDays : state.bootstrap.schedule_days.filter(item => String(item.schedule_id).trim() === String(scheduleId).trim());
    const stops = days.map(day => cleanStop(day.port_name || day.city || ''))
      .filter(Boolean)
      .filter(stop => !['해상일', 'sea day', '인천 출발', '부산 출발'].includes(stop.toLowerCase()));

    return Array.from(new Set(stops));
  }

  function cleanStop(value) {
    return String(value || '').replace(/\s+/g, ' ').replace(/\(.*?\)/g, '').trim();
  }

  /* ---------------------------------------------------------
     섹션 DOM 찾기
     - 기존 구조를 그대로 유지하고 위치만 재정렬
     --------------------------------------------------------- */
  function getSectionNodeByKey(key) {
    const map = {
      identitySection: document.querySelector('.identity-section'),
      scheduleSection: scheduleGrid ? scheduleGrid.closest('section') : document.querySelector('.schedule-section'),
      priceGuaranteeSection: document.querySelector('.price-guarantee-section'),
      reviewSection: reviewGrid ? reviewGrid.closest('section') : document.querySelector('.review-section'),
      contactSection: form ? form.closest('section') : document.querySelector('.contact-section'),
      basicInfoSection: document.getElementById('basicInfoSection'),
      targetsSection: document.getElementById('targetsSection'),
      cabinsSection: document.getElementById('cabinsSection'),
      processSection: document.getElementById('processSection'),
      faqSection: document.getElementById('faqSection'),
      membershipSection: document.getElementById('membershipInquirySection'),
      contentSection: document.getElementById('contentSection'),
      trustSection: document.getElementById('trustSection')
    };
    return map[key] || null;
  }

  /* ---------------------------------------------------------
     페이지 섹션 순서 재정렬
     - 디자인 / 스타일 / 시트 로더는 안 건드림
     - main 바로 아래 섹션 순서만 다시 붙임
     --------------------------------------------------------- */
  function reorderPageSections() {
    if (!mainContent) return;

    const trustSection = getSectionNodeByKey('trustSection');
    if (trustSection) {
      trustSection.style.display = 'none';
    }

    const orderedNodes = SECTION_SEQUENCE
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => getSectionNodeByKey(item.key))
      .filter((node) => node && node.parentNode === mainContent);

    orderedNodes.forEach((node) => {
      mainContent.appendChild(node);
    });
  }

  function renderExtraSections() {
    ensureExtraSectionsScaffold();
    renderBasicInfo();
    renderTargets();
    renderProcessSteps();
    renderCabins();
    renderFaqs();
    renderTrustPoints();
    renderContentLinks();
  }

  function ensureExtraSectionsScaffold() {
    if (!mainContent) return;

    const sections = [
      { id: 'basicInfoSection', title: '크루즈는 어렵지 않아요', label: '크루즈여행', type: 'basicInfo' },
      { id: 'targetsSection', title: '이런 분들께 잘 맞아요', label: '이용대상자', gridId: 'targetsGrid', gridClass: 'sheet-extra-grid' },
      { id: 'processSection', title: '상담부터 탑승까지', label: '예약과정', gridId: 'processGrid', gridClass: 'sheet-extra-grid sheet-extra-grid-steps' },
      { id: 'cabinsSection', title: '선실 타입 비교', label: '선실비교', gridId: 'cabinsGrid', gridClass: 'sheet-extra-grid' },
      { id: 'trustSection', title: '왜 이 구조가 편한지', label: '신뢰요소', gridId: 'trustGrid', gridClass: 'sheet-extra-grid' },
      { id: 'faqSection', title: '자주 묻는 질문', label: 'FAQ', gridId: 'faqList', gridClass: 'sheet-extra-faq-list' },
      { id: 'contentSection', title: '함께 보면 좋은 정보', label: '콘텐츠연결', gridId: 'contentGrid', gridClass: 'sheet-extra-grid' }
    ];

    sections.forEach((sectionInfo) => {
      const { id, title, label, gridId, gridClass, type } = sectionInfo;
      if (document.getElementById(id)) return;

      const bodyHtml = type === 'basicInfo'
        ? `
          <div class="sheet-extra-slider" id="basicInfoSlider">
            <div class="sheet-extra-slider-viewport" id="basicInfoViewport">
              <div id="basicInfoGrid" class="sheet-extra-basic-track"></div>
            </div>
          </div>
          <div class="sheet-extra-dots" id="basicInfoDots"></div>
        `
        : `<div id="${gridId}" class="${gridClass}"></div>`;

      const html = `
        <section class="sheet-extra-section" id="${id}">
          <div class="sheet-extra-wrap">
            <div class="sheet-extra-head">
              <span class="sheet-extra-label">${label}</span>
              <h2 class="sheet-extra-title">${title}</h2>
            </div>
            ${bodyHtml}
          </div>
        </section>
      `;

      const debugPanel = document.getElementById('sheetDebugPanel');
      if (debugPanel && debugPanel.parentNode === mainContent) {
        debugPanel.insertAdjacentHTML('beforebegin', html);
      } else {
        mainContent.insertAdjacentHTML('beforeend', html);
      }
    });
  }

  function renderBasicInfo() {
    const section = document.getElementById('basicInfoSection');
    const grid = document.getElementById('basicInfoGrid');
    const items = state.bootstrap.basic_info || [];

    if (!section || !grid) return;

    if (!items.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';

    grid.innerHTML = items.map(item => {
      const points = [item.point_1, item.point_2, item.point_3].filter(Boolean);
      const hasImage = Boolean(item.image_url);

      return `
        <article class="sheet-extra-card sheet-extra-card-basic ${hasImage ? '' : 'is-no-image'}">
          ${hasImage
            ? `<div class="sheet-extra-media sheet-extra-basic-media">
                 <img src="${escapeAttribute(item.image_url)}" alt="${escapeAttribute(item.title || '')}" />
               </div>`
            : `<div class="sheet-extra-basic-empty"><span>CRUISE GUIDE</span></div>`
          }
          <div class="sheet-extra-card-copy">
            ${item.title ? `<h3>${escapeHtml(item.title)}</h3>` : ''}
            ${item.subtitle ? `<p class="sheet-extra-muted">${escapeHtml(item.subtitle)}</p>` : ''}
            ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ''}
            ${points.length ? `<ul class="sheet-extra-points">${points.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
          </div>
        </article>
      `;
    }).join('');

    setupBasicInfoSlider();
    requestAnimationFrame(() => scrollBasicInfoToPage(state.basicInfoPage || 0, 'auto'));
  }

  function renderTargets() {
    const section = document.getElementById('targetsSection');
    const grid = document.getElementById('targetsGrid');
    const items = state.bootstrap.targets || [];
    if (!section || !grid) return;

    if (!items.length) return section.style.display = 'none';
    section.style.display = '';

    grid.innerHTML = items.map(item => `
      <article class="sheet-extra-card">
        ${item.image_url ? `<div class="sheet-extra-media"><img src="${escapeAttribute(item.image_url)}" alt="${escapeAttribute(item.title || '')}" /></div>` : ''}
        <h3>${escapeHtml(item.title || '')}</h3>
        ${item.subtitle ? `<p class="sheet-extra-muted">${escapeHtml(item.subtitle)}</p>` : ''}
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        ${[item.point_1, item.point_2].filter(Boolean).length ? `<ul class="sheet-extra-points">${[item.point_1, item.point_2].filter(Boolean).map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
        ${item.linked_schedule_id ? `<div class="sheet-extra-action"><a href="#contact" class="btn" data-select-schedule="${escapeAttribute(item.linked_schedule_id)}">${escapeHtml(item.cta_text || '상담 요청')}</a></div>` : ''}
      </article>
    `).join('');
  }

  function renderProcessSteps() {
    const section = document.getElementById('processSection');
    const grid = document.getElementById('processGrid');
    const items = state.bootstrap.process_steps || [];
    if (!section || !grid) return;

    if (!items.length) return section.style.display = 'none';
    section.style.display = '';

    grid.innerHTML = items.map((item, index) => `
      <article class="sheet-extra-card sheet-extra-step-card">
        <span class="sheet-extra-step-no">STEP ${index + 1}</span>
        <h3>${escapeHtml(item.step_title || '')}</h3>
        ${item.step_desc ? `<p>${escapeHtml(item.step_desc)}</p>` : ''}
        ${item.highlight_text ? `<div class="sheet-extra-highlight">${escapeHtml(item.highlight_text)}</div>` : ''}
      </article>
    `).join('');
  }

  function renderCabins() {
    const section = document.getElementById('cabinsSection');
    const grid = document.getElementById('cabinsGrid');
    const items = state.bootstrap.cabins || [];
    if (!section || !grid) return;

    if (!items.length) return section.style.display = 'none';
    section.style.display = '';

    grid.innerHTML = items.map(item => `
      <article class="sheet-extra-card">
        ${item.image_url ? `<div class="sheet-extra-media"><img src="${escapeAttribute(item.image_url)}" alt="${escapeAttribute(item.title || '')}" /></div>` : ''}
        ${item.cabin_type ? `<div class="sheet-extra-chip">${escapeHtml(item.cabin_type)}</div>` : ''}
        <h3>${escapeHtml(item.title || '')}</h3>
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}
        ${[item.best_for, item.point_1, item.point_2].filter(Boolean).length ? `<ul class="sheet-extra-points">${[item.best_for, item.point_1, item.point_2].filter(Boolean).map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>` : ''}
        ${(item.badge_1 || item.badge_2) ? `<div class="sheet-extra-tags">${[item.badge_1, item.badge_2].filter(Boolean).map(b => `<span>${escapeHtml(b)}</span>`).join('')}</div>` : ''}
      </article>
    `).join('');
  }

  function renderTrustPoints() {
    const section = document.getElementById('trustSection');
    const grid = document.getElementById('trustGrid');
    const items = state.bootstrap.trust_points || [];
    if (!section || !grid) return;

    if (!items.length) return section.style.display = 'none';
    section.style.display = '';

    grid.innerHTML = items.map(item => `
      <article class="sheet-extra-card">
        ${item.badge_text ? `<div class="sheet-extra-chip">${escapeHtml(item.badge_text)}</div>` : ''}
        <h3>${escapeHtml(item.title || '')}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
      </article>
    `).join('');
  }

  function renderFaqs() {
    const section = document.getElementById('faqSection');
    const list = document.getElementById('faqList');
    const items = state.bootstrap.faqs || [];
    if (!section || !list) return;

    if (!items.length) return section.style.display = 'none';
    section.style.display = '';

    list.innerHTML = items.map(item => `
      <details class="sheet-extra-faq">
        <summary>${escapeHtml(item.question || '')}</summary>
        <div class="sheet-extra-faq-body">
          ${item.category ? `<div class="sheet-extra-chip">${escapeHtml(item.category)}</div>` : ''}
          <p>${escapeHtml(item.answer || '')}</p>
        </div>
      </details>
    `).join('');
  }

  function renderContentLinks() {
    const section = document.getElementById('contentSection');
    const grid = document.getElementById('contentGrid');
    if (!section || !grid) return;

    const orderedItems = (state.contentLinksOrder && state.contentLinksOrder.length)
      ? state.contentLinksOrder
      : shuffleArray([...(state.bootstrap.content_links || [])]);

    if (!orderedItems.length) return section.style.display = 'none';
    section.style.display = '';

    const visibleCount = Math.max(getInitialContentLinksVisibleCount(), Number(state.contentLinksVisibleCount || getInitialContentLinksVisibleCount()));
    const items = orderedItems.slice(0, visibleCount);

    grid.innerHTML = items.map(item => `
      <article class="sheet-extra-card">
        ${item.thumbnail_url ? `<div class="sheet-extra-media"><img src="${escapeAttribute(item.thumbnail_url)}" alt="${escapeAttribute(item.title || '')}" /></div>` : ''}
        ${item.category ? `<div class="sheet-extra-chip">${escapeHtml(item.category)}</div>` : ''}
        <h3>${escapeHtml(item.title || '')}</h3>
        ${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}
        <div class="sheet-extra-action">
          <span class="${item.tag_text ? 'sheet-extra-inline-tag' : ''}">${escapeHtml(item.tag_text || '')}</span>
          ${item.link_url ? `<a href="${escapeAttribute(item.link_url)}" class="btn" target="_blank" rel="noopener">자세히 보기</a>` : ''}
        </div>
      </article>
    `).join('');

    let moreWrap = section.querySelector('[data-content-more-wrap]');
    if (!moreWrap) {
      moreWrap = document.createElement('div');
      moreWrap.setAttribute('data-content-more-wrap', '');
      moreWrap.style.display = 'flex';
      moreWrap.style.justifyContent = 'center';
      moreWrap.style.marginTop = '20px';
      grid.insertAdjacentElement('afterend', moreWrap);
    }

    if (visibleCount < orderedItems.length) {
      moreWrap.innerHTML = `<button type="button" class="btn btn-secondary" data-content-more>더보기</button>`;
      moreWrap.style.display = 'flex';
    } else {
      moreWrap.innerHTML = '';
      moreWrap.style.display = 'none';
    }
  }

  function getContentLinksStep() {
    return window.innerWidth <= 768 ? 3 : 6;
  }

  function ensureDebugPanel() {
    return;
  }

  function logDebug() {
    return;
  }

  function renderDebugPanel() {
    return;
  }

  function setTrackingFields() {
    const params = new URLSearchParams(window.location.search);
    setInputValue('agentCodeInput', params.get('agent') || '');
    setInputValue('utmSourceInput', params.get('utm_source') || '');
    setInputValue('utmMediumInput', params.get('utm_medium') || '');
    setInputValue('utmCampaignInput', params.get('utm_campaign') || '');
    setInputValue('landingPageInput', window.location.href);
    setInputValue('referrerInput', document.referrer || '');
    const stickyMembershipLink = document.getElementById('stickyMembershipLink');
    const agent = params.get('agent') || '';
    if (stickyMembershipLink) {
      stickyMembershipLink.href = agent
        ? `/membership/?agent=${encodeURIComponent(agent)}`
        : '/membership/';
    }
  }

  function setMembershipLink() {
    const membershipLinkButton = document.getElementById('membershipLinkButton');
    if (!membershipLinkButton) return;

    const params = new URLSearchParams(window.location.search);
    const agentCode = String(params.get('agent') || '').trim();
    const membershipUrl = new URL('https://cruiseplay-dyt.pages.dev/membership/');

    if (agentCode) {
      membershipUrl.searchParams.set('agent', agentCode);
    }

    membershipLinkButton.href = membershipUrl.toString();
  }

  function handleInitialInquiryNavigation() {
    const params = new URLSearchParams(window.location.search);
    const shouldOpenInquiry = params.get('openInquiry') === '1';
    const shouldScrollByHash = window.location.hash === '#contact';
    const inquiryType = String(params.get('inquiryType') || '').trim();

    if (!shouldOpenInquiry && !shouldScrollByHash) return;

    requestAnimationFrame(() => {
      setTimeout(() => {
        const scheduleSelect = document.getElementById('interestScheduleSelect');

        if (scheduleSelect && inquiryType === 'membership') {
          const membershipOption = Array.from(scheduleSelect.options).find((option) => {
            return String(option.value || '').trim() === 'membership_inquiry';
          });

          if (membershipOption) {
            scheduleSelect.value = membershipOption.value;
          }
        }

        scrollToSection('contact');
        setTimeout(() => {
          hideInquiryLoadingOverlay();
        }, 120);
      }, 80);
    });
  }

  function isMobileStickyViewport() {
    return window.innerWidth <= MOBILE_STICKY_HIDE_BREAKPOINT;
  }

  function isContactFieldElement(element) {
    return Boolean(
      element &&
      form &&
      form.contains(element) &&
      element.matches &&
      element.matches('input, select, textarea')
    );
  }

  function setMobileStickyInquiryHidden(hidden) {
    if (!stickyInquiryBar) return;
    stickyInquiryBar.classList.toggle('is-input-active', Boolean(hidden) && isMobileStickyViewport());
  }

  function handleMobileStickyInquiryFocusIn(event) {
    if (!isMobileStickyViewport()) return;
    if (isContactFieldElement(event.target)) {
      setMobileStickyInquiryHidden(true);
    }
  }

  function handleMobileStickyInquiryFocusOut() {
    window.setTimeout(() => {
      const active = document.activeElement;

      if (isMobileStickyViewport() && isContactFieldElement(active)) {
        setMobileStickyInquiryHidden(true);
        return;
      }

      setMobileStickyInquiryHidden(false);
    }, 80);
  }

  function syncMobileStickyInquiryVisibility() {
    if (!stickyInquiryBar) return;

    if (!isMobileStickyViewport()) {
      setMobileStickyInquiryHidden(false);
      syncStickyInquiryFooterVisibility();
      return;
    }

    setMobileStickyInquiryHidden(isContactFieldElement(document.activeElement));
    syncStickyInquiryFooterVisibility();
  }

  function setupStickyInquiryFooterObserver() {
    if (!stickyInquiryBar || !footer) return;

    if (stickyFooterObserver) {
      stickyFooterObserver.disconnect();
      stickyFooterObserver = null;
    }

    if ('IntersectionObserver' in window) {
      stickyFooterObserver = new IntersectionObserver((entries) => {
        const entry = entries && entries[0] ? entries[0] : null;
        isStickyFooterIntersecting = !!(entry && entry.isIntersecting);
        syncStickyInquiryFooterVisibility();
      }, {
        threshold: 0.01
      });

      stickyFooterObserver.observe(footer);
      syncStickyInquiryFooterVisibility();
      return;
    }

    const fallbackSync = () => {
      const rect = footer.getBoundingClientRect();
      isStickyFooterIntersecting = rect.top < window.innerHeight && rect.bottom > 0;
      syncStickyInquiryFooterVisibility();
    };

    window.addEventListener('scroll', fallbackSync, { passive: true });
    window.addEventListener('resize', fallbackSync);
    fallbackSync();
  }

  function syncStickyInquiryFooterVisibility() {
    if (!stickyInquiryBar) return;
    stickyInquiryBar.classList.toggle('is-hidden-by-footer', isMobileStickyViewport() && isStickyFooterIntersecting);
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
    button.textContent = isSubmitting ? '접수 중...' : '문의하기';
  }

  function closeModal() {
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
    return `<div class="schedule-meta-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`;
  }

  function metaBox(label, value) {
    return `<div class="modal-meta-box"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`;
  }

  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
  }

  function pad(num) { return String(num).padStart(2, '0'); }
  function convertLineBreaks(value) { return String(value || '').replace(/\n/g, '<br>'); }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[match]);
  }

  function escapeAttribute(value) { return escapeHtml(value); }
})();
