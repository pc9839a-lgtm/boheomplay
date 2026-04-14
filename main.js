(function () {
  const content = window.LANDING_CONTENT;
  const app = document.getElementById("app");

  document.title = content.seo.title;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", content.seo.description);
  }

  function renderTopbar() {
    return `
      <header class="topbar">
        <div class="topbar-inner">
          <a href="#top" class="brand" aria-label="${content.brand.name}">
            <div class="brand-badge">${content.brand.badge}</div>
            <div class="brand-text">
              <strong>${content.brand.name}</strong>
              <span>${content.brand.subText}</span>
            </div>
          </a>
          <button class="nav-cta js-scroll-form">${content.hero.primaryCta}</button>
        </div>
      </header>
    `;
  }

  function renderHero() {
    return `
      <section class="hero" id="top">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="eyebrow">${content.hero.eyebrow}</div>
            <h1>${content.hero.title}</h1>
            <p class="hero-desc">${content.hero.description}</p>

            <div class="hero-actions">
              <button class="btn btn-primary js-scroll-form">${content.hero.primaryCta}</button>
              <button class="btn btn-secondary js-scroll-process">${content.hero.secondaryCta}</button>
            </div>

            <div class="hero-points">
              ${content.hero.points
                .map((point) => `<span class="pill">${point}</span>`)
                .join("")}
            </div>
          </div>

          <div class="hero-card">
            <div class="hero-card-header">
              <div>
                <div class="hero-card-title">${content.hero.cardTitle}</div>
                <p class="hero-card-sub">${content.hero.cardText}</p>
              </div>
            </div>

            <div class="stat-grid">
              ${content.hero.stats
                .map(
                  (stat) => `
                    <div class="stat-box">
                      <div class="stat-label">${stat.label}</div>
                      <div class="stat-value">${stat.value}</div>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderSectionHead(data) {
    return `
      <div class="section-head">
        <div class="tag">${data.tag}</div>
        <h2>${data.title}</h2>
        <p>${data.description}</p>
      </div>
    `;
  }

  function renderTrust() {
    return `
      <section class="section">
        <div class="container">
          ${renderSectionHead(content.trust)}
          <div class="card-grid">
            ${content.trust.items
              .map(
                (item) => `
                  <article class="info-card">
                    <div class="info-icon">${item.icon}</div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderCategories() {
    return `
      <section class="section">
        <div class="container">
          ${renderSectionHead(content.categories)}
          <div class="card-grid">
            ${content.categories.items
              .map(
                (item) => `
                  <article class="category-card">
                    <div class="category-icon">${item.icon}</div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="category-list">
                      ${item.chips
                        .map((chip) => `<span class="category-chip">${chip}</span>`)
                        .join("")}
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderBenefits() {
    return `
      <section class="section">
        <div class="container">
          ${renderSectionHead(content.benefits)}
          <div class="card-grid">
            ${content.benefits.items
              .map(
                (item) => `
                  <article class="benefit-card">
                    <div class="benefit-icon">${item.icon}</div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderProcess() {
    return `
      <section class="section" id="process">
        <div class="container">
          ${renderSectionHead(content.process)}
          <div class="steps">
            ${content.process.steps
              .map(
                (step) => `
                  <article class="step-card">
                    <div class="step-number">${step.number}</div>
                    <h3>${step.title}</h3>
                    <p>${step.description}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderCtaBanner() {
    return `
      <section class="section">
        <div class="container">
          <div class="cta-banner">
            <div>
              <h3>${content.ctaBanner.title}</h3>
              <p>${content.ctaBanner.description}</p>
            </div>
            <div>
              <button class="btn btn-primary js-scroll-form">${content.ctaBanner.button}</button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderField(field) {
    if (field.type === "select") {
      return `
        <div class="field ${field.type === "textarea" ? "full" : ""}">
          <label class="label" for="${field.name}">${field.label}${field.required ? " *" : ""}</label>
          <select class="select" id="${field.name}" name="${field.name}" ${field.required ? "required" : ""}>
            ${field.options
              .map((option, index) => {
                const disabled = index === 0 ? "disabled selected" : "";
                return `<option value="${index === 0 ? "" : option}" ${disabled}>${option}</option>`;
              })
              .join("")}
          </select>
        </div>
      `;
    }

    if (field.type === "textarea") {
      return `
        <div class="field full">
          <label class="label" for="${field.name}">${field.label}${field.required ? " *" : ""}</label>
          <textarea class="textarea" id="${field.name}" name="${field.name}" placeholder="${field.placeholder || ""}" ${field.required ? "required" : ""}></textarea>
        </div>
      `;
    }

    return `
      <div class="field">
        <label class="label" for="${field.name}">${field.label}${field.required ? " *" : ""}</label>
        <input
          class="input"
          id="${field.name}"
          name="${field.name}"
          type="${field.type}"
          placeholder="${field.placeholder || ""}"
          ${field.required ? "required" : ""}
        />
      </div>
    `;
  }

  function renderForm() {
    return `
      <section class="section" id="consult-form">
        <div class="container">
          <div class="form-wrap">
            <aside class="form-info">
              <h3>${content.form.infoTitle}</h3>
              <p>${content.form.infoDescription}</p>

              <div class="form-info-list">
                ${content.form.infoItems
                  .map(
                    (item) => `
                      <div class="form-info-item">
                        <div class="check">✓</div>
                        <div>${item}</div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </aside>

            <div class="form-card">
              <h3>${content.form.title}</h3>
              <p>${content.form.description}</p>

              <form id="leadForm">
                <div class="form-grid">
                  ${content.form.fields.map(renderField).join("")}
                </div>

                <label class="agree-box">
                  <input type="checkbox" id="agree" required />
                  <span>${content.form.agreeText}</span>
                </label>

                <button type="submit" class="btn btn-primary submit-btn">
                  ${content.form.submitText}
                </button>

                <div class="toast" id="toast">${content.form.successMessage}</div>
                <div class="form-note">${content.form.note}</div>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderFaq() {
    return `
      <section class="section">
        <div class="container">
          ${renderSectionHead(content.faq)}
          <div class="faq-list">
            ${content.faq.items
              .map(
                (item, index) => `
                  <article class="faq-item ${index === 0 ? "active" : ""}">
                    <button class="faq-question" type="button">
                      <span>${item.question}</span>
                      <span>${index === 0 ? "−" : "+"}</span>
                    </button>
                    <div class="faq-answer-wrap">
                      <p class="faq-answer">${item.answer}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderFooter() {
    return `
      <footer class="footer">
        <div class="footer-inner">
          <strong>${content.footer.company}</strong><br />
          ${content.footer.text}<br />
          ${content.footer.copyright}
        </div>
      </footer>
    `;
  }

  function renderFloatingCta() {
    return `
      <div class="floating-cta">
        <button type="button" class="js-scroll-form">${content.hero.primaryCta}</button>
      </div>
    `;
  }

  app.innerHTML = `
    ${renderTopbar()}
    ${renderHero()}
    ${renderTrust()}
    ${renderCategories()}
    ${renderBenefits()}
    ${renderProcess()}
    ${renderCtaBanner()}
    ${renderForm()}
    ${renderFaq()}
    ${renderFooter()}
    ${renderFloatingCta()}
  `;

  function scrollToSection(id) {
    const target = document.querySelector(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".js-scroll-form").forEach((button) => {
    button.addEventListener("click", function () {
      scrollToSection("#consult-form");
    });
  });

  document.querySelectorAll(".js-scroll-process").forEach((button) => {
    button.addEventListener("click", function () {
      scrollToSection("#process");
    });
  });

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", function () {
      const currentItem = this.closest(".faq-item");
      const isActive = currentItem.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
        const symbol = item.querySelector(".faq-question span:last-child");
        if (symbol) symbol.textContent = "+";
      });

      if (!isActive) {
        currentItem.classList.add("active");
        const currentSymbol = currentItem.querySelector(".faq-question span:last-child");
        if (currentSymbol) currentSymbol.textContent = "−";
      }
    });
  });

  const leadForm = document.getElementById("leadForm");
  const toast = document.getElementById("toast");

  if (leadForm) {
    leadForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const agree = document.getElementById("agree");
      if (!agree.checked) return;

      toast.style.display = "block";
      leadForm.reset();

      setTimeout(function () {
        toast.style.display = "none";
      }, 5000);
    });
  }

  const yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
})();