(function () {
  const app = window.FinReadyApp;
  if (!app || app.__dashboardModuleRegistered) {
    return;
  }

  app.__dashboardModuleRegistered = true;

  const COURSE_TOPICS = ["fundamentals", "risk", "prompt", "accounting", "analytics"];
  const COURSE_LEVELS = ["beginner", "intermediate", "advanced"];
  const COURSE_DURATION_BUCKETS = ["short", "mid", "long"];
  const COURSE_FORMATS = ["selfpaced", "cohort", "live"];
  const COURSE_CERT_TYPES = ["finready", "university", "cpe"];
  const TOOL_PLAN_TIERS = ["free", "pro", "enterprise"];
  const DEFAULT_COURSE_RELEASE_YEAR = new Date().getFullYear();

  const DEFAULT_MANAGED_COURSES = [
    {
      id: "course-ai-fundamentals",
      slug: "ai-fundamentals-financial-literacy",
      title: "AI Fundamentals for Financial Literacy",
      summary: "Core AI and finance literacy foundations for modern teams.",
      instructor: "FinReady Academy",
      topic: "fundamentals",
      level: "beginner",
      durationHours: 6,
      durationBucket: "mid",
      format: "selfpaced",
      certType: "finready",
      rating: 4.8,
      enrollCount: 2100,
      releaseYear: 2026,
      priceUsd: 0,
      isPublished: true,
      displayOrder: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "course-ml-risk-modeling",
      slug: "ml-risk-modeling-finance",
      title: "ML for Risk Modeling in Finance",
      summary: "Advanced machine learning pipelines for risk scenarios and controls.",
      instructor: "Dr. Omar Reed",
      topic: "risk",
      level: "advanced",
      durationHours: 12,
      durationBucket: "long",
      format: "cohort",
      certType: "cpe",
      rating: 4.9,
      enrollCount: 890,
      releaseYear: 2026,
      priceUsd: 249,
      isPublished: true,
      displayOrder: 1,
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "course-prompt-finance",
      slug: "prompt-engineering-finance-teams",
      title: "Prompt Engineering for Finance Teams",
      summary: "Prompt patterns for analysts, controllers, and finance operators.",
      instructor: "Neha Iyer",
      topic: "prompt",
      level: "intermediate",
      durationHours: 4,
      durationBucket: "mid",
      format: "selfpaced",
      certType: "finready",
      rating: 4.6,
      enrollCount: 1200,
      releaseYear: 2025,
      priceUsd: 79,
      isPublished: true,
      displayOrder: 2,
      createdAt: "2026-01-03T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "course-ai-accounting-workflows",
      slug: "ai-accounting-workflows",
      title: "AI for Accounting Workflows",
      summary: "Automation workflows for reconciliation, close, and reporting.",
      instructor: "Maria Gomez",
      topic: "accounting",
      level: "intermediate",
      durationHours: 7,
      durationBucket: "mid",
      format: "live",
      certType: "cpe",
      rating: 4.7,
      enrollCount: 980,
      releaseYear: 2026,
      priceUsd: 149,
      isPublished: true,
      displayOrder: 3,
      createdAt: "2026-01-04T00:00:00.000Z",
      updatedAt: "2026-01-04T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "course-data-literacy",
      slug: "data-literacy-non-analysts",
      title: "Data Literacy for Non-Analysts",
      summary: "Practical analytics literacy for business and finance stakeholders.",
      instructor: "Metro Business School",
      topic: "analytics",
      level: "beginner",
      durationHours: 2,
      durationBucket: "short",
      format: "selfpaced",
      certType: "university",
      rating: 4.5,
      enrollCount: 2500,
      releaseYear: 2026,
      priceUsd: 39,
      isPublished: true,
      displayOrder: 4,
      createdAt: "2026-01-05T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "course-finance-foundations-students",
      slug: "finance-foundations-students",
      title: "Finance Foundations for Students",
      summary: "Structured starter track for students entering finance careers.",
      instructor: "Arjun Malhotra",
      topic: "fundamentals",
      level: "beginner",
      durationHours: 5,
      durationBucket: "mid",
      format: "cohort",
      certType: "finready",
      rating: 4.8,
      enrollCount: 1300,
      releaseYear: 2025,
      priceUsd: 59,
      isPublished: true,
      displayOrder: 5,
      createdAt: "2026-01-06T00:00:00.000Z",
      updatedAt: "2026-01-06T00:00:00.000Z",
      source: "static-default"
    }
  ];

  const DEFAULT_MANAGED_TOOLS = [
    {
      id: "tool-cash-flow-forecaster",
      slug: "cash-flow-forecaster",
      name: "Cash Flow Forecaster",
      category: "forecasting",
      summary: "Predict cash positions using real-time invoices, payroll, and spend signals.",
      planTier: "free",
      iconCode: "CF",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-expense-anomaly-detector",
      slug: "expense-anomaly-detector",
      name: "Expense Anomaly Detector",
      category: "analysis",
      summary: "Detect unusual transactions and policy exceptions before approvals.",
      planTier: "pro",
      iconCode: "EA",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 1,
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-budget-planning-assistant",
      slug: "budget-planning-assistant",
      name: "Budget Planning Assistant",
      category: "budgeting",
      summary: "Create adaptive budget models by department with AI scenario generation.",
      planTier: "pro",
      iconCode: "BP",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 2,
      createdAt: "2026-01-03T00:00:00.000Z",
      updatedAt: "2026-01-03T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-payroll-intelligence-copilot",
      slug: "payroll-intelligence-copilot",
      name: "Payroll Intelligence Copilot",
      category: "payroll",
      summary: "Automate payroll variance checks and lower monthly processing risk.",
      planTier: "enterprise",
      iconCode: "PY",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 3,
      createdAt: "2026-01-04T00:00:00.000Z",
      updatedAt: "2026-01-04T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-recruitment-services-ai",
      slug: "recruitment-services-ai",
      name: "Recruitment Services AI",
      category: "recruitment",
      summary: "Score finance candidates using competency fit and role readiness benchmarks.",
      planTier: "enterprise",
      iconCode: "RQ",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail#recruitment",
      isActive: true,
      displayOrder: 4,
      createdAt: "2026-01-05T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-tax-readiness-navigator",
      slug: "tax-readiness-navigator",
      name: "Tax Readiness Navigator",
      category: "tax",
      summary: "Surface filing obligations and optimization opportunities in one dashboard.",
      planTier: "pro",
      iconCode: "TX",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 5,
      createdAt: "2026-01-06T00:00:00.000Z",
      updatedAt: "2026-01-06T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-compliance-audit-assistant",
      slug: "compliance-audit-assistant",
      name: "Compliance Audit Assistant",
      category: "compliance",
      summary: "Generate audit trails and risk summaries for regulated operations.",
      planTier: "enterprise",
      iconCode: "CA",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 6,
      createdAt: "2026-01-07T00:00:00.000Z",
      updatedAt: "2026-01-07T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-financial-literacy-coach",
      slug: "financial-literacy-coach",
      name: "Financial Literacy Coach",
      category: "analysis",
      summary: "Explain finance concepts in plain language for students and employees.",
      planTier: "free",
      iconCode: "FL",
      ctaLabel: "Try It",
      ctaHref: "/courses",
      isActive: true,
      displayOrder: 7,
      createdAt: "2026-01-08T00:00:00.000Z",
      updatedAt: "2026-01-08T00:00:00.000Z",
      source: "static-default"
    },
    {
      id: "tool-ap-ar-predictor",
      slug: "ap-ar-predictor",
      name: "AP & AR Predictor",
      category: "forecasting",
      summary: "Forecast receivable delays and vendor bottlenecks before month-end closes.",
      planTier: "pro",
      iconCode: "AP",
      ctaLabel: "Try It",
      ctaHref: "/tool-detail",
      isActive: true,
      displayOrder: 8,
      createdAt: "2026-01-09T00:00:00.000Z",
      updatedAt: "2026-01-09T00:00:00.000Z",
      source: "static-default"
    }
  ];

  function createSaveButton(label, type, id) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost save-item-btn";
    button.dataset.saveType = type;
    button.dataset.saveId = id;
    button.textContent = `Save ${label}`;
    return button;
  }

  function getSavedItems(type) {
    const key = type === "tool" ? app.STORAGE_KEYS.savedTools : app.STORAGE_KEYS.savedCourses;
    return app.safeReadJson(key, []);
  }

  function setSavedItems(type, list) {
    const key = type === "tool" ? app.STORAGE_KEYS.savedTools : app.STORAGE_KEYS.savedCourses;
    app.safeWriteJson(key, list);
  }

  function toggleSaved(type, id) {
    const list = getSavedItems(type);
    if (list.includes(id)) {
      setSavedItems(
        type,
        list.filter((value) => value !== id)
      );
      return false;
    }

    list.push(id);
    setSavedItems(type, list);
    return true;
  }

  function syncSaveButtonStates() {
    const tools = getSavedItems("tool");
    const courses = getSavedItems("course");

    document.querySelectorAll(".save-item-btn").forEach((btn) => {
      const type = btn.dataset.saveType;
      const id = btn.dataset.saveId || "";
      const saved = type === "tool" ? tools.includes(id) : courses.includes(id);
      btn.classList.toggle("active", saved);
      btn.textContent = saved ? "Saved" : "Save";
    });
  }

  function initSaveActions() {
    const attachSaveButton = (selector, type, headingSelector) => {
      document.querySelectorAll(selector).forEach((card) => {
        if (card.querySelector(".save-item-btn")) {
          return;
        }

        const title = card.querySelector(headingSelector)?.textContent || `${type}-item`;
        const id = card.dataset[`${type}Id`] || app.slugify(title);
        const button = createSaveButton(type === "tool" ? "Tool" : "Course", type, id);
        const target = card.querySelector(".course-content") || card;
        target.appendChild(button);
      });
    };

    attachSaveButton(".tool-card", "tool", "h3");
    attachSaveButton(".course-card", "course", "h3");

    document.querySelectorAll(".save-item-btn").forEach((button) => {
      if (button.dataset.boundSave === "1") {
        return;
      }

      button.dataset.boundSave = "1";
      button.addEventListener("click", () => {
        const session = app.getSession();
        if (!session) {
          app.navigateTo(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }

        toggleSaved(button.dataset.saveType || "tool", button.dataset.saveId || "");
        syncSaveButtonStates();
      });
    });

    syncSaveButtonStates();
  }

  function initDashboardProgress() {
    const cards = Array.from(document.querySelectorAll(".progress-card[data-course-id]"));
    if (!cards.length) {
      return;
    }

    const progressMap = app.safeReadJson(app.STORAGE_KEYS.progress, {});

    const render = () => {
      let total = 0;

      cards.forEach((card) => {
        const courseId = card.dataset.courseId;
        const defaultProgress = Number(card.dataset.defaultProgress || 0);
        const progress = Number(progressMap[courseId] ?? defaultProgress);
        const safeProgress = Math.max(0, Math.min(100, progress));

        const bar = card.querySelector(".bar > span");
        const label = card.querySelector("[data-progress-label]");

        if (bar) {
          bar.style.width = `${safeProgress}%`;
        }

        if (label) {
          label.textContent = `${safeProgress}% complete`;
        }

        total += safeProgress;
      });

      const avg = cards.length ? Math.round(total / cards.length) : 0;
      const avgEl = document.getElementById("learningCompletionAvg");
      if (avgEl) {
        avgEl.textContent = `${avg}%`;
      }
    };

    cards.forEach((card) => {
      card.querySelector("[data-progress-increment]")?.addEventListener("click", () => {
        const courseId = card.dataset.courseId;
        const current = Number(progressMap[courseId] ?? Number(card.dataset.defaultProgress || 0));
        progressMap[courseId] = Math.min(100, current + 10);
        app.safeWriteJson(app.STORAGE_KEYS.progress, progressMap);
        render();
      });
    });

    render();
  }

  function initCertificatesWidget() {
    const holder = document.getElementById("certificateList");
    if (!holder) {
      return;
    }

    let certs = app.safeReadJson(app.STORAGE_KEYS.certs, []);
    if (!certs.length) {
      certs = [
        { id: "cert-ai-fund", title: "AI Fundamentals", status: "Issued", date: "2026-01-19" },
        { id: "cert-fin-analytics", title: "Finance Analytics", status: "Issued", date: "2026-02-11" },
        { id: "cert-prompt-eng", title: "Prompt Engineering", status: "In Progress", date: "2026-03-02" }
      ];
      app.safeWriteJson(app.STORAGE_KEYS.certs, certs);
    }

    holder.innerHTML = certs
      .map(
        (cert) =>
          `<li><strong>${escapeHtml(cert.title)}</strong> - ${escapeHtml(cert.status)} <small>(${escapeHtml(cert.date)})</small></li>`
      )
      .join("");
  }

  function initThankYouMessage() {
    const el = document.getElementById("thankYouMessage");
    if (!el) {
      return;
    }

    const type = new URLSearchParams(window.location.search).get("type") || "general";
    const map = {
      demo: "Your demo request is confirmed. Our enterprise team will contact you with scheduling options.",
      newsletter: "Thanks for subscribing. You will receive product and learning updates.",
      contact: "Thanks for reaching out. Our support team will get back to you shortly.",
      consultation: "Your consultation request is in. We will follow up with a tailored plan.",
      payroll: "Your payroll AI request is in. Our team will share the next steps shortly.",
      recruitment: "Your recruitment AI request is in. Our specialists will contact you soon."
    };

    el.textContent = map[type] || "Our team will reach out shortly with the next steps.";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeDate(value) {
    const date = new Date(value || Date.now());
    return Number.isFinite(date.getTime()) ? date : new Date();
  }

  function formatDay(value) {
    const date = normalizeDate(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;
  }

  function formatDateLabel(value) {
    const date = normalizeDate(value);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit"
    });
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString();
  }

  function toLabel(value) {
    return String(value || "")
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function toSafeSlug(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function choose(value, allowed, fallback) {
    const normalized = String(value || "").toLowerCase().trim();
    return allowed.includes(normalized) ? normalized : fallback;
  }

  function sortCatalogItems(items) {
    return items.slice().sort((a, b) => {
      const orderA = Number(a.displayOrder || 0);
      const orderB = Number(b.displayOrder || 0);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return normalizeDate(b.updatedAt || b.createdAt).getTime() - normalizeDate(a.updatedAt || a.createdAt).getTime();
    });
  }

  function normalizeCourseRecord(raw, index = 0) {
    const title = String(raw?.title || `Untitled Course ${index + 1}`).trim();
    const slug = toSafeSlug(raw?.slug || app.slugify(title) || `course-${index + 1}`);
    return {
      id: String(raw?.id || `course-${slug || index + 1}`),
      slug,
      title,
      summary: String(raw?.summary || "").trim(),
      instructor: String(raw?.instructor || "FinReady Academy").trim(),
      topic: choose(raw?.topic, COURSE_TOPICS, "fundamentals"),
      level: choose(raw?.level, COURSE_LEVELS, "beginner"),
      durationHours: Math.max(0, Number((raw?.durationHours ?? (raw?.durationMins ? raw.durationMins / 60 : 0)) || 0)),
      durationBucket: choose(raw?.durationBucket, COURSE_DURATION_BUCKETS, "mid"),
      format: choose(raw?.format, COURSE_FORMATS, "selfpaced"),
      certType: choose(raw?.certType, COURSE_CERT_TYPES, "finready"),
      rating: Math.max(0, Math.min(5, Number(raw?.rating || 0))),
      enrollCount: Math.max(0, Number(raw?.enrollCount || 0)),
      releaseYear: Math.max(2000, Math.min(2100, Number(raw?.releaseYear || DEFAULT_COURSE_RELEASE_YEAR))),
      priceUsd: Math.max(0, Number(raw?.priceUsd || 0)),
      isPublished: raw?.isPublished !== false,
      displayOrder: Math.max(0, Number(raw?.displayOrder || index)),
      createdAt: raw?.createdAt || new Date().toISOString(),
      updatedAt: raw?.updatedAt || new Date().toISOString(),
      source: raw?.source || "catalog"
    };
  }

  function normalizeToolRecord(raw, index = 0) {
    const name = String(raw?.name || `Untitled Tool ${index + 1}`).trim();
    const slug = toSafeSlug(raw?.slug || app.slugify(name) || `tool-${index + 1}`);
    const category = toSafeSlug(raw?.category || "analysis") || "analysis";
    return {
      id: String(raw?.id || `tool-${slug || index + 1}`),
      slug,
      name,
      category,
      summary: String(raw?.summary || "").trim(),
      planTier: choose(raw?.planTier, TOOL_PLAN_TIERS, "pro"),
      iconCode: String(raw?.iconCode || "AI")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 4),
      ctaLabel: String(raw?.ctaLabel || "Try It").trim().slice(0, 40),
      ctaHref: String(raw?.ctaHref || "/tool-detail").trim().slice(0, 200),
      isActive: raw?.isActive !== false,
      displayOrder: Math.max(0, Number(raw?.displayOrder || index)),
      createdAt: raw?.createdAt || new Date().toISOString(),
      updatedAt: raw?.updatedAt || new Date().toISOString(),
      source: raw?.source || "catalog"
    };
  }

  function readLocalManagedCourses() {
    const existing = app.safeReadJson(app.STORAGE_KEYS.managedCourses, null);
    const base = Array.isArray(existing) && existing.length ? existing : DEFAULT_MANAGED_COURSES;
    const normalized = sortCatalogItems(base.map((item, index) => normalizeCourseRecord(item, index)));
    app.safeWriteJson(app.STORAGE_KEYS.managedCourses, normalized);
    return normalized;
  }

  function readLocalManagedTools() {
    const existing = app.safeReadJson(app.STORAGE_KEYS.managedTools, null);
    const base = Array.isArray(existing) && existing.length ? existing : DEFAULT_MANAGED_TOOLS;
    const normalized = sortCatalogItems(base.map((item, index) => normalizeToolRecord(item, index)));
    app.safeWriteJson(app.STORAGE_KEYS.managedTools, normalized);
    return normalized;
  }

  function writeLocalManagedCourses(list) {
    const normalized = sortCatalogItems((Array.isArray(list) ? list : []).map((item, index) => normalizeCourseRecord(item, index)));
    app.safeWriteJson(app.STORAGE_KEYS.managedCourses, normalized);
    return normalized;
  }

  function writeLocalManagedTools(list) {
    const normalized = sortCatalogItems((Array.isArray(list) ? list : []).map((item, index) => normalizeToolRecord(item, index)));
    app.safeWriteJson(app.STORAGE_KEYS.managedTools, normalized);
    return normalized;
  }

  async function requestJson(url, init) {
    const response = await fetch(url, init);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
      throw new Error(data?.message || `Request failed (${response.status})`);
    }
    return data;
  }

  async function fetchCatalogCourses(adminMode = false) {
    if (app.isStaticMode) {
      const local = readLocalManagedCourses();
      return adminMode ? local : local.filter((item) => item.isPublished);
    }

    const endpoint = adminMode ? "/api/admin/courses?all=1" : "/api/catalog/courses";
    const data = await requestJson(endpoint, { credentials: "same-origin" });
    const items = Array.isArray(data.items) ? data.items : [];
    return sortCatalogItems(items.map((item, index) => normalizeCourseRecord(item, index)));
  }

  async function fetchCatalogTools(adminMode = false) {
    if (app.isStaticMode) {
      const local = readLocalManagedTools();
      return adminMode ? local : local.filter((item) => item.isActive);
    }

    const endpoint = adminMode ? "/api/admin/tools?all=1" : "/api/catalog/tools";
    const data = await requestJson(endpoint, { credentials: "same-origin" });
    const items = Array.isArray(data.items) ? data.items : [];
    return sortCatalogItems(items.map((item, index) => normalizeToolRecord(item, index)));
  }

  async function createCourse(payload) {
    const normalized = normalizeCourseRecord(payload);
    if (app.isStaticMode) {
      const list = readLocalManagedCourses();
      const created = {
        ...normalized,
        id: `course-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "local"
      };
      return writeLocalManagedCourses([created, ...list]).find((item) => item.id === created.id) || created;
    }

    const data = await requestJson("/api/admin/courses", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized)
    });
    return normalizeCourseRecord(data.item || normalized);
  }

  async function updateCourse(id, payload) {
    const normalized = normalizeCourseRecord(payload);
    if (app.isStaticMode) {
      const list = readLocalManagedCourses();
      const next = list.map((item) =>
        item.id === id
          ? {
              ...item,
              ...normalized,
              id,
              updatedAt: new Date().toISOString(),
              source: "local"
            }
          : item
      );
      return writeLocalManagedCourses(next).find((item) => item.id === id) || null;
    }

    const data = await requestJson(`/api/admin/courses/${encodeURIComponent(id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized)
    });
    return normalizeCourseRecord(data.item || normalized);
  }

  async function deleteCourse(id) {
    if (app.isStaticMode) {
      const list = readLocalManagedCourses();
      writeLocalManagedCourses(list.filter((item) => item.id !== id));
      return true;
    }

    await requestJson(`/api/admin/courses/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin"
    });
    return true;
  }

  async function createTool(payload) {
    const normalized = normalizeToolRecord(payload);
    if (app.isStaticMode) {
      const list = readLocalManagedTools();
      const created = {
        ...normalized,
        id: `tool-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "local"
      };
      return writeLocalManagedTools([created, ...list]).find((item) => item.id === created.id) || created;
    }

    const data = await requestJson("/api/admin/tools", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized)
    });
    return normalizeToolRecord(data.item || normalized);
  }

  async function updateTool(id, payload) {
    const normalized = normalizeToolRecord(payload);
    if (app.isStaticMode) {
      const list = readLocalManagedTools();
      const next = list.map((item) =>
        item.id === id
          ? {
              ...item,
              ...normalized,
              id,
              updatedAt: new Date().toISOString(),
              source: "local"
            }
          : item
      );
      return writeLocalManagedTools(next).find((item) => item.id === id) || null;
    }

    const data = await requestJson(`/api/admin/tools/${encodeURIComponent(id)}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized)
    });
    return normalizeToolRecord(data.item || normalized);
  }

  async function deleteTool(id) {
    if (app.isStaticMode) {
      const list = readLocalManagedTools();
      writeLocalManagedTools(list.filter((item) => item.id !== id));
      return true;
    }

    await requestJson(`/api/admin/tools/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "same-origin"
    });
    return true;
  }

  function fieldValue(item, keys, fallback = "-") {
    const fields = item?.fields || item?.payload?.fields || {};
    for (const key of keys) {
      if (fields[key]) {
        return String(fields[key]);
      }
    }
    return fallback;
  }

  function statusPill(status) {
    const normalized = String(status || "open").toLowerCase();
    return `<span class="status-pill ${escapeHtml(normalized)}">${escapeHtml(normalized.replace(/_/g, " "))}</span>`;
  }

  async function fetchLeads(limit) {
    const safeLimit = Math.max(1, Math.min(500, Number(limit || 100)));

    if (app.isStaticMode) {
      return app.getLocalSubmissions().slice(0, safeLimit);
    }

    const response = await fetch(`/api/forms?limit=${safeLimit}`, { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error("Lead request failed");
    }

    const data = await response.json();
    if (data.ok && Array.isArray(data.items)) {
      return data.items;
    }

    throw new Error("Invalid lead response");
  }

  function staticRequestsByKeyword(keyword, limit) {
    const safeLimit = Math.max(1, Math.min(500, Number(limit || 100)));
    return app
      .getLocalSubmissions()
      .filter((item) => String(item.formName || "").toLowerCase().includes(keyword))
      .slice(0, safeLimit)
      .map((item) => ({
        id: item.id || `${keyword}-${Math.random().toString(36).slice(2, 10)}`,
        organization: item.fields?.company || "-",
        status: "open",
        payload: { fields: item.fields || {} },
        createdAt: item.submittedAt || item.createdAt || new Date().toISOString()
      }));
  }

  async function fetchPayrollRequests(limit) {
    if (app.isStaticMode) {
      return staticRequestsByKeyword("payroll", limit);
    }

    const response = await fetch(`/api/payroll-requests?limit=${Math.max(1, Number(limit || 100))}`, {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Payroll request fetch failed");
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async function fetchRecruitmentRequests(limit) {
    if (app.isStaticMode) {
      return staticRequestsByKeyword("recruitment", limit);
    }

    const response = await fetch(`/api/recruitment-requests?limit=${Math.max(1, Number(limit || 100))}`, {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Recruitment request fetch failed");
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  async function fetchUsers(limit) {
    const safeLimit = Math.max(1, Math.min(500, Number(limit || 150)));

    if (app.isStaticMode) {
      const users = app.safeReadJson(app.STORAGE_KEYS.users, []);
      const hasAdmin = users.some((item) => String(item.email || "").toLowerCase() === "admin@finready.ai");
      const seed = hasAdmin
        ? users
        : [
            {
              id: "u-admin",
              fullName: "FinReady Admin",
              email: "admin@finready.ai",
              role: "admin",
              createdAt: new Date().toISOString()
            },
            ...users
          ];

      return seed.slice(-safeLimit).reverse().map((user) => ({
        id: user.id || `u-${Math.random().toString(36).slice(2, 10)}`,
        fullName: user.fullName || "FinReady User",
        email: String(user.email || "").toLowerCase(),
        role: String(user.role || "professional").toLowerCase(),
        createdAt: user.createdAt || new Date().toISOString(),
        enrollments: 0,
        certificates: 0,
        toolRuns: 0
      }));
    }

    const response = await fetch(`/api/admin/users?limit=${safeLimit}`, { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error("User list request failed");
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items : [];
  }

  function aggregateLeads(items) {
    const byForm = {};
    const byPage = {};
    const byDay = {};

    items.forEach((item) => {
      const formName = String(item.formName || "unknown").toLowerCase();
      const page = String(item.page || "unknown");
      const day = formatDay(item.submittedAt || item.createdAt);

      byForm[formName] = (byForm[formName] || 0) + 1;
      byPage[page] = (byPage[page] || 0) + 1;
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      total: items.length,
      byForm,
      byPage,
      byDay
    };
  }

  function countByKeyword(items, keyword) {
    const key = String(keyword || "").toLowerCase();
    return items.filter((item) => String(item.formName || "").toLowerCase().includes(key)).length;
  }

  function sortedEntries(record) {
    return Object.entries(record || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  }

  function getRecentSeries(byDay, days) {
    const now = new Date();
    const series = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const key = formatDay(date);
      series.push({
        key,
        label: formatDateLabel(date),
        value: Number(byDay[key] || 0)
      });
    }

    return series;
  }

  function renderBars(container, series) {
    if (!container) {
      return;
    }

    const list = Array.isArray(series) ? series : [];
    if (!list.length) {
      container.innerHTML = "<p class=\"muted\">No trend data available.</p>";
      return;
    }

    const max = Math.max(...list.map((item) => Number(item.value || 0)), 1);
    container.innerHTML = list
      .map((item) => {
        const value = Number(item.value || 0);
        const height = Math.max(14, Math.round((value / max) * 146));
        return `<div class="admin-bar" data-label="${escapeHtml(String(item.label || ""))}" style="height:${height}px" title="${escapeHtml(`${item.label}: ${value}`)}"></div>`;
      })
      .join("");
  }

  function renderRankedList(holder, entries, formatter) {
    if (!holder) {
      return;
    }

    const rows = Array.isArray(entries) ? entries : [];
    if (!rows.length) {
      holder.innerHTML = "<li>No data yet.</li>";
      return;
    }

    holder.innerHTML = rows
      .map((entry, index) => {
        const content = formatter ? formatter(entry, index) : `${entry[0]} (${entry[1]})`;
        return `<li>${content}</li>`;
      })
      .join("");
  }

  function csvDownload(fileName, headers, rows) {
    const safeHeaders = headers.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",");
    const safeRows = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`${safeHeaders}\n${safeRows}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function buildStaticSummary() {
    const submissions = app.getLocalSubmissions();
    const savedTools = app.safeReadJson(app.STORAGE_KEYS.savedTools, []);
    const savedCourses = app.safeReadJson(app.STORAGE_KEYS.savedCourses, []);
    const certificates = app.safeReadJson(app.STORAGE_KEYS.certs, []);
    const progressMap = app.safeReadJson(app.STORAGE_KEYS.progress, {});

    const progressValues = Object.values(progressMap)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    const avgProgress = progressValues.length
      ? `${Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)}%`
      : "0%";

    const payrollCount = countByKeyword(submissions, "payroll");
    const recruitmentCount = countByKeyword(submissions, "recruitment");
    const demoCount = countByKeyword(submissions, "demo");
    const contactCount = countByKeyword(submissions, "contact");

    return {
      ok: true,
      role: "guest",
      storageMode: "local",
      scopes: {
        default: [
          { title: "Saved Tools", value: String(savedTools.length), detail: "Bookmarked in browser" },
          { title: "Saved Courses", value: String(savedCourses.length), detail: "Bookmarked in browser" },
          { title: "Local Requests", value: String(submissions.length), detail: "Captured in local storage" },
          { title: "Avg Progress", value: avgProgress, detail: "From local learning data" }
        ],
        admin: [
          { title: "Leads", value: String(submissions.length), detail: "Local captured submissions" },
          { title: "Demo Requests", value: String(demoCount), detail: "From local forms" },
          { title: "Contact Requests", value: String(contactCount), detail: "From local forms" },
          { title: "Certificates", value: String(certificates.length), detail: "Local certificate records" }
        ],
        team: [
          { title: "Open Payroll Cases", value: String(payrollCount), detail: "Pending payroll requests" },
          { title: "Open Hiring Cases", value: String(recruitmentCount), detail: "Pending recruitment requests" },
          { title: "Saved Tools", value: String(savedTools.length), detail: "Team-relevant bookmarked tools" },
          { title: "Avg Completion", value: avgProgress, detail: "Local progress baseline" }
        ],
        payroll: [
          { title: "Open Payroll Requests", value: String(payrollCount), detail: "Pending review" },
          { title: "Total Form Submissions", value: String(submissions.length), detail: "All captured requests" },
          { title: "Demo Requests", value: String(demoCount), detail: "Sales-qualified demand" },
          { title: "Avg Learning Progress", value: avgProgress, detail: "Upskilling signal" }
        ],
        recruitment: [
          { title: "Open Hiring Requests", value: String(recruitmentCount), detail: "Pending hiring actions" },
          { title: "Total Form Submissions", value: String(submissions.length), detail: "All captured requests" },
          { title: "Contact Requests", value: String(contactCount), detail: "Inbound assistance requests" },
          { title: "Avg Learning Progress", value: avgProgress, detail: "Readiness indicator" }
        ],
        reports: [
          { title: "Total Requests", value: String(submissions.length), detail: "Across all local forms" },
          { title: "Demo Volume", value: String(demoCount), detail: "From local forms" },
          { title: "Contact Volume", value: String(contactCount), detail: "From local forms" },
          { title: "Avg Completion", value: avgProgress, detail: "Local progress data" }
        ],
        personal: [
          { title: "My Saved Tools", value: String(savedTools.length), detail: "Pinned AI tools" },
          { title: "My Saved Courses", value: String(savedCourses.length), detail: "Pinned learning tracks" },
          { title: "My Certificates", value: String(certificates.length), detail: "Issued and in-progress" },
          { title: "My Completion", value: avgProgress, detail: "Average course progress" }
        ]
      }
    };
  }

  async function fetchDashboardSummary() {
    if (app.isStaticMode) {
      return buildStaticSummary();
    }

    const response = await fetch("/api/dashboard/summary", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Dashboard request failed (${response.status})`);
    }

    const data = await response.json();
    if (data?.ok) {
      return data;
    }

    throw new Error("Invalid dashboard response");
  }

  function renderSummaryCards(container, cards) {
    if (!container) {
      return;
    }

    if (!Array.isArray(cards) || !cards.length) {
      container.innerHTML =
        '<article class="card"><h3>No metrics yet</h3><p>Data will appear as activity grows.</p></article>';
      return;
    }

    container.innerHTML = cards
      .map(
        (card) =>
          `<article class="card"><p class="muted">${escapeHtml(card.title)}</p><h3>${escapeHtml(
            card.value
          )}</h3><p>${escapeHtml(card.detail || "")}</p></article>`
      )
      .join("");
  }

  async function initRoleDashboardCards() {
    const holders = Array.from(document.querySelectorAll("[data-dashboard-cards]"));
    if (!holders.length) {
      return;
    }

    try {
      const data = await fetchDashboardSummary();
      holders.forEach((holder) => {
        const scope = holder.dataset.dashboardCards || "default";
        const cards = data?.scopes?.[scope] || data?.scopes?.default || [];
        renderSummaryCards(holder, cards);
      });
    } catch (error) {
      holders.forEach((holder) => renderSummaryCards(holder, []));
    }
  }

  function renderAdminDashboard(items) {
    const tableBody = document.querySelector("#adminLeadsTable tbody");
    const leadCount = document.getElementById("adminLeadCount");
    const demoCount = document.getElementById("adminDemoCount");
    const contactCount = document.getElementById("adminContactCount");
    const themes = document.getElementById("adminTopThemes");

    if (!tableBody) {
      return;
    }

    const rows = items.slice(0, 100).map((item) => {
      const email = fieldValue(item, ["work_email", "email"], "-");
      const company = fieldValue(item, ["company", "organization"], "-");
      const page = String(item.page || "-");
      const date = formatDateLabel(item.submittedAt || item.createdAt);

      return `<tr><td>${escapeHtml(date)}</td><td>${escapeHtml(item.formName || "-")}</td><td>${escapeHtml(
        email
      )}</td><td>${escapeHtml(company)}</td><td>${escapeHtml(page)}</td></tr>`;
    });

    tableBody.innerHTML = rows.length ? rows.join("") : '<tr><td colspan="5">No submissions yet.</td></tr>';

    if (leadCount) {
      leadCount.textContent = String(items.length);
    }
    if (demoCount) {
      demoCount.textContent = String(countByKeyword(items, "demo"));
    }
    if (contactCount) {
      contactCount.textContent = String(countByKeyword(items, "contact"));
    }

    if (themes) {
      const counts = {};
      items.forEach((item) => {
        const goal = fieldValue(item, ["primary_goal", "requirements", "challenge"], "General");
        const key = String(goal).slice(0, 34);
        counts[key] = (counts[key] || 0) + 1;
      });

      const top = sortedEntries(counts).slice(0, 5);
      themes.innerHTML = top.length
        ? top.map(([name, count]) => `<li>${escapeHtml(name)} (${count})</li>`).join("")
        : "<li>Not enough data yet.</li>";
    }
  }

  async function initAdminDashboard() {
    const pageTable = document.getElementById("adminLeadsTable");
    if (!pageTable) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session)) {
      const body = pageTable.querySelector("tbody");
      if (body) {
        body.innerHTML =
          '<tr><td colspan="5">Access denied. Login with admin account (admin@finready.ai).</td></tr>';
      }
      return;
    }

    try {
      const items = await fetchLeads(250);
      renderAdminDashboard(items);
    } catch (error) {
      const body = pageTable.querySelector("tbody");
      if (body) {
        body.innerHTML = '<tr><td colspan="5">Unable to load leads right now.</td></tr>';
      }
    }
  }

  function setRequestStatus(form, text, state) {
    let status = form.querySelector(".form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      form.appendChild(status);
    }

    status.textContent = text;
    status.dataset.state = state || "info";
  }

  async function submitRequestForm(form) {
    const endpoint = form.dataset.endpoint || "/api/forms";
    const data = new FormData(form);
    const fields = {};
    data.forEach((value, key) => {
      fields[key] = String(value || "").trim();
    });

    const payload = {
      organization: fields.company || "",
      page: window.location.pathname,
      message: form.dataset.requestMessage || "",
      fields
    };

    const writeLocalFallback = () => {
      const submissions = app.getLocalSubmissions();
      submissions.unshift({
        formName: `${form.dataset.requestForm || "request"}_request`,
        page: payload.page,
        message: payload.message,
        fields: payload.fields,
        source: "local-request-fallback",
        submittedAt: new Date().toISOString()
      });
      app.safeWriteJson(app.STORAGE_KEYS.localSubmissions, submissions.slice(0, 400));
      return { ok: true, storedLocally: true };
    };

    if (app.isStaticMode) {
      return writeLocalFallback();
    }

    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.message || `Request failed (${response.status})`);
    }

    return result;
  }

  function initRequestForms() {
    document.querySelectorAll("form[data-request-form]").forEach((form) => {
      if (form.dataset.requestBound === "1") {
        return;
      }

      form.dataset.requestBound = "1";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
        }

        setRequestStatus(form, "Submitting...", "loading");

        try {
          await submitRequestForm(form);
          setRequestStatus(form, form.dataset.requestMessage || "Request submitted successfully.", "success");
          form.reset();
        } catch (error) {
          setRequestStatus(
            form,
            error instanceof Error ? error.message : "Unable to submit request.",
            "error"
          );
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
          }
        }
      });
    });
  }

  function initAdminWorkspaceNav() {
    const current = String(document.body.dataset.adminPage || "").toLowerCase();
    if (!current) {
      return;
    }

    document.querySelectorAll(".admin-nav-link[data-admin-tab]").forEach((link) => {
      link.classList.toggle("active", String(link.dataset.adminTab || "").toLowerCase() === current);
    });
  }

  async function initAdminOverviewPanels() {
    const leadsTrend = document.getElementById("adminLeadsTrend");
    const topPages = document.getElementById("adminTopPages");
    const liveLeads = document.getElementById("adminLiveLeads");
    const livePayroll = document.getElementById("adminLivePayroll");
    const liveRecruitment = document.getElementById("adminLiveRecruitment");

    if (!leadsTrend && !topPages && !liveLeads && !livePayroll && !liveRecruitment) {
      return;
    }

    try {
      const [leads, payroll, recruitment] = await Promise.all([
        fetchLeads(500),
        fetchPayrollRequests(250),
        fetchRecruitmentRequests(250)
      ]);

      const leadAgg = aggregateLeads(leads);

      if (liveLeads) {
        liveLeads.textContent = formatNumber(leads.length);
      }
      if (livePayroll) {
        livePayroll.textContent = formatNumber(payroll.filter((item) => String(item.status || "open") === "open").length);
      }
      if (liveRecruitment) {
        liveRecruitment.textContent = formatNumber(
          recruitment.filter((item) => String(item.status || "open") === "open").length
        );
      }

      if (leadsTrend) {
        renderBars(leadsTrend, getRecentSeries(leadAgg.byDay, 10));
      }

      if (topPages) {
        renderRankedList(topPages, sortedEntries(leadAgg.byPage).slice(0, 6), ([page, count]) => {
          return `<strong>${escapeHtml(page)}</strong> <span class=\"muted\">(${count})</span>`;
        });
      }
    } catch (error) {
      if (leadsTrend) {
        leadsTrend.innerHTML = "<p class=\"muted\">Unable to load lead trend right now.</p>";
      }
      if (topPages) {
        topPages.innerHTML = "<li>Unable to load pages.</li>";
      }
    }
  }

  function renderPagination(holder, page, totalPages, onClick) {
    if (!holder) {
      return;
    }

    if (totalPages <= 1) {
      holder.innerHTML = "";
      return;
    }

    const buttons = [];
    for (let i = 1; i <= totalPages; i += 1) {
      buttons.push(`<button type=\"button\" data-page=\"${i}\" class=\"${i === page ? "active" : ""}\">${i}</button>`);
    }

    holder.innerHTML = buttons.join("");
    holder.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => onClick(Number(btn.dataset.page || 1)));
    });
  }

  async function initAdminLeadsWorkbench() {
    const table = document.getElementById("adminLeadsWorkbenchTable");
    if (!table) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session)) {
      const body = table.querySelector("tbody");
      if (body) {
        body.innerHTML = '<tr><td colspan="6">Access denied. Login as admin to view leads.</td></tr>';
      }
      return;
    }

    const tableBody = table.querySelector("tbody");
    const searchInput = document.getElementById("adminLeadSearch");
    const formFilter = document.getElementById("adminLeadFormFilter");
    const rangeFilter = document.getElementById("adminLeadRangeFilter");
    const exportBtn = document.getElementById("adminLeadExport");
    const pagination = document.getElementById("adminLeadsPagination");
    const emptyState = document.getElementById("adminLeadEmptyState");

    const statTotal = document.getElementById("leadWorkbenchTotal");
    const statDemo = document.getElementById("leadWorkbenchDemo");
    const statContact = document.getElementById("leadWorkbenchContact");
    const statPayroll = document.getElementById("leadWorkbenchPayroll");
    const statRecruitment = document.getElementById("leadWorkbenchRecruitment");
    const statFiltered = document.getElementById("leadWorkbenchFiltered");

    let page = 1;
    const pageSize = 12;
    let all = [];
    let filtered = [];

    const applyFilters = () => {
      const query = String(searchInput?.value || "").trim().toLowerCase();
      const form = String(formFilter?.value || "all").toLowerCase();
      const range = String(rangeFilter?.value || "all").toLowerCase();

      const now = Date.now();
      const msByRange = {
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "90d": 90 * 24 * 60 * 60 * 1000
      };

      filtered = all.filter((item) => {
        const formName = String(item.formName || "").toLowerCase();
        const email = fieldValue(item, ["work_email", "email"], "").toLowerCase();
        const company = fieldValue(item, ["company", "organization"], "").toLowerCase();
        const pagePath = String(item.page || "").toLowerCase();
        const haystack = `${formName} ${email} ${company} ${pagePath}`;

        const matchesForm = form === "all" || formName.includes(form);
        const matchesQuery = !query || haystack.includes(query);

        let matchesRange = true;
        if (msByRange[range]) {
          const ts = normalizeDate(item.submittedAt || item.createdAt).getTime();
          matchesRange = now - ts <= msByRange[range];
        }

        return matchesForm && matchesQuery && matchesRange;
      });

      page = 1;
      render();
    };

    const render = () => {
      if (!tableBody) {
        return;
      }

      if (statFiltered) {
        statFiltered.textContent = formatNumber(filtered.length);
      }

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, totalPages);

      const offset = (page - 1) * pageSize;
      const rows = filtered.slice(offset, offset + pageSize);

      tableBody.innerHTML = rows.length
        ? rows
            .map((item) => {
              const date = formatDateLabel(item.submittedAt || item.createdAt);
              const formName = String(item.formName || "-");
              const email = fieldValue(item, ["work_email", "email"], "-");
              const company = fieldValue(item, ["company", "organization"], "-");
              const pagePath = String(item.page || "-");
              const source = String(item.source || (app.isStaticMode ? "local" : "api"));

              return `<tr><td>${escapeHtml(date)}</td><td>${escapeHtml(formName)}</td><td>${escapeHtml(
                email
              )}</td><td>${escapeHtml(company)}</td><td>${escapeHtml(pagePath)}</td><td>${escapeHtml(
                source
              )}</td></tr>`;
            })
            .join("")
        : '<tr><td colspan="6">No results found.</td></tr>';

      if (emptyState) {
        emptyState.style.display = rows.length ? "none" : "block";
      }

      renderPagination(pagination, page, totalPages, (nextPage) => {
        page = nextPage;
        render();
      });
    };

    try {
      all = await fetchLeads(500);

      if (statTotal) {
        statTotal.textContent = formatNumber(all.length);
      }
      if (statDemo) {
        statDemo.textContent = formatNumber(countByKeyword(all, "demo"));
      }
      if (statContact) {
        statContact.textContent = formatNumber(countByKeyword(all, "contact"));
      }
      if (statPayroll) {
        statPayroll.textContent = formatNumber(countByKeyword(all, "payroll"));
      }
      if (statRecruitment) {
        statRecruitment.textContent = formatNumber(countByKeyword(all, "recruitment"));
      }

      filtered = all.slice();
      render();
    } catch (error) {
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6">Unable to load leads right now.</td></tr>';
      }
    }

    searchInput?.addEventListener("input", applyFilters);
    formFilter?.addEventListener("change", applyFilters);
    rangeFilter?.addEventListener("change", applyFilters);

    exportBtn?.addEventListener("click", () => {
      const rows = filtered.map((item) => [
        formatDay(item.submittedAt || item.createdAt),
        item.formName || "",
        fieldValue(item, ["work_email", "email"], ""),
        fieldValue(item, ["company", "organization"], ""),
        item.page || "",
        item.source || (app.isStaticMode ? "local" : "api")
      ]);

      csvDownload(
        `finready-leads-${formatDay(new Date())}.csv`,
        ["Date", "Form", "Email", "Company", "Page", "Source"],
        rows
      );
    });
  }

  async function initAdminUsersDirectory() {
    const table = document.getElementById("adminUsersTable");
    if (!table) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session)) {
      const body = table.querySelector("tbody");
      if (body) {
        body.innerHTML = '<tr><td colspan="7">Access denied. Login as admin to view users.</td></tr>';
      }
      return;
    }

    const body = table.querySelector("tbody");
    const search = document.getElementById("adminUserSearch");
    const roleFilter = document.getElementById("adminUserRoleFilter");
    const pagination = document.getElementById("adminUsersPagination");

    const totalEl = document.getElementById("adminUsersTotal");
    const adminsEl = document.getElementById("adminUsersAdmins");
    const enterpriseEl = document.getElementById("adminUsersEnterprise");
    const learnersEl = document.getElementById("adminUsersLearners");

    let users = [];
    let filtered = [];
    let page = 1;
    const pageSize = 10;

    const applyFilters = () => {
      const q = String(search?.value || "").trim().toLowerCase();
      const role = String(roleFilter?.value || "all").toLowerCase();

      filtered = users.filter((user) => {
        const name = String(user.fullName || "").toLowerCase();
        const email = String(user.email || "").toLowerCase();
        const userRole = String(user.role || "professional").toLowerCase();
        const matchesRole = role === "all" || userRole === role;
        const matchesQuery = !q || name.includes(q) || email.includes(q);
        return matchesRole && matchesQuery;
      });

      page = 1;
      render();
    };

    const render = () => {
      if (!body) {
        return;
      }

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, totalPages);
      const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

      body.innerHTML = pageRows.length
        ? pageRows
            .map((user) => {
              return `<tr>
                <td>${escapeHtml(user.fullName || "-")}</td>
                <td>${escapeHtml(user.email || "-")}</td>
                <td>${statusPill(user.role || "professional")}</td>
                <td>${formatNumber(user.enrollments || 0)}</td>
                <td>${formatNumber(user.certificates || 0)}</td>
                <td>${formatNumber(user.toolRuns || 0)}</td>
                <td>${escapeHtml(formatDateLabel(user.createdAt))}</td>
              </tr>`;
            })
            .join("")
        : '<tr><td colspan="7">No users match your filter.</td></tr>';

      renderPagination(pagination, page, totalPages, (next) => {
        page = next;
        render();
      });
    };

    try {
      users = await fetchUsers(500);

      if (totalEl) {
        totalEl.textContent = formatNumber(users.length);
      }
      if (adminsEl) {
        adminsEl.textContent = formatNumber(users.filter((user) => user.role === "admin").length);
      }
      if (enterpriseEl) {
        enterpriseEl.textContent = formatNumber(users.filter((user) => user.role === "enterprise").length);
      }
      if (learnersEl) {
        learnersEl.textContent = formatNumber(
          users.filter((user) => user.role === "student" || user.role === "professional").length
        );
      }

      filtered = users.slice();
      render();
    } catch (error) {
      if (body) {
        body.innerHTML = '<tr><td colspan="7">Unable to load users right now.</td></tr>';
      }
    }

    search?.addEventListener("input", applyFilters);
    roleFilter?.addEventListener("change", applyFilters);
  }

  function renderOpsTable(tableId, items, type) {
    const table = document.getElementById(tableId);
    const body = table?.querySelector("tbody");
    if (!body) {
      return;
    }

    const rows = items.slice(0, 100).map((item) => {
      const fields = item.payload?.fields || item.fields || {};
      const date = formatDateLabel(item.createdAt || item.submittedAt);
      const org = String(item.organization || fields.company || "-");
      const status = String(item.status || "open").toLowerCase();
      const volume =
        type === "payroll"
          ? String(fields.monthly_payroll_volume || fields.payroll_volume || "-")
          : String(fields.open_roles || fields.active_roles || "-");
      const challenge = String(
        type === "payroll"
          ? fields.challenge || fields.main_payroll_challenge || "-"
          : fields.challenge || fields.main_recruitment_challenge || "-"
      );

      return `<tr><td>${escapeHtml(date)}</td><td>${escapeHtml(org)}</td><td>${statusPill(
        status
      )}</td><td>${escapeHtml(volume)}</td><td>${escapeHtml(challenge)}</td></tr>`;
    });

    body.innerHTML = rows.length ? rows.join("") : '<tr><td colspan="5">No requests yet.</td></tr>';
  }

  async function initAdminOperationsBoard() {
    const payrollTable = document.getElementById("payrollRequestsTable");
    const recruitmentTable = document.getElementById("recruitmentRequestsTable");
    if (!payrollTable && !recruitmentTable) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session) && !app.isStaticMode) {
      [payrollTable, recruitmentTable].forEach((table) => {
        const body = table?.querySelector("tbody");
        if (body) {
          body.innerHTML = '<tr><td colspan="5">Access denied. Login as admin to view operations.</td></tr>';
        }
      });
      return;
    }

    const payrollOpen = document.getElementById("opPayrollOpen");
    const payrollTotal = document.getElementById("opPayrollTotal");
    const recruitmentOpen = document.getElementById("opRecruitmentOpen");
    const recruitmentTotal = document.getElementById("opRecruitmentTotal");
    const combinedOpen = document.getElementById("opCombinedOpen");
    const timeline = document.getElementById("operationsTimeline");

    try {
      const [payroll, recruitment] = await Promise.all([
        fetchPayrollRequests(250),
        fetchRecruitmentRequests(250)
      ]);

      renderOpsTable("payrollRequestsTable", payroll, "payroll");
      renderOpsTable("recruitmentRequestsTable", recruitment, "recruitment");

      const payrollOpenCount = payroll.filter((item) => String(item.status || "open") === "open").length;
      const recruitmentOpenCount = recruitment.filter((item) => String(item.status || "open") === "open").length;

      if (payrollOpen) {
        payrollOpen.textContent = formatNumber(payrollOpenCount);
      }
      if (payrollTotal) {
        payrollTotal.textContent = formatNumber(payroll.length);
      }
      if (recruitmentOpen) {
        recruitmentOpen.textContent = formatNumber(recruitmentOpenCount);
      }
      if (recruitmentTotal) {
        recruitmentTotal.textContent = formatNumber(recruitment.length);
      }
      if (combinedOpen) {
        combinedOpen.textContent = formatNumber(payrollOpenCount + recruitmentOpenCount);
      }

      if (timeline) {
        const events = [
          ...payroll.map((item) => ({
            type: "Payroll",
            date: normalizeDate(item.createdAt || item.submittedAt),
            org: item.organization || item.payload?.fields?.company || "Unknown org",
            status: item.status || "open"
          })),
          ...recruitment.map((item) => ({
            type: "Recruitment",
            date: normalizeDate(item.createdAt || item.submittedAt),
            org: item.organization || item.payload?.fields?.company || "Unknown org",
            status: item.status || "open"
          }))
        ]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 8);

        timeline.innerHTML = events.length
          ? events
              .map(
                (event) =>
                  `<li><strong>${escapeHtml(event.type)}</strong> - ${escapeHtml(event.org)} <small>${escapeHtml(
                    formatDateLabel(event.date)
                  )}, ${escapeHtml(String(event.status).replace(/_/g, " "))}</small></li>`
              )
              .join("")
          : "<li>No activity yet.</li>";
      }
    } catch (error) {
      [payrollTable, recruitmentTable].forEach((table) => {
        const body = table?.querySelector("tbody");
        if (body) {
          body.innerHTML = '<tr><td colspan="5">Unable to load operation queues right now.</td></tr>';
        }
      });

      if (timeline) {
        timeline.innerHTML = "<li>Unable to load activity stream.</li>";
      }
    }
  }

  async function initAdminAnalytics() {
    const funnel = document.getElementById("analyticsFunnel");
    const dayBars = document.getElementById("analyticsDayBars");
    const topPages = document.getElementById("analyticsTopPages");
    const mix = document.getElementById("analyticsMix");
    const insights = document.getElementById("analyticsInsights");

    if (!funnel && !dayBars && !topPages && !mix && !insights) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session) && !app.isStaticMode) {
      if (funnel) {
        funnel.innerHTML = "<p class=\"muted\">Admin session required.</p>";
      }
      return;
    }

    const leadsTotal = document.getElementById("analyticsLeadsTotal");
    const demoRate = document.getElementById("analyticsDemoRate");
    const opsRate = document.getElementById("analyticsOpsRate");

    try {
      const [leads, payroll, recruitment] = await Promise.all([
        fetchLeads(500),
        fetchPayrollRequests(250),
        fetchRecruitmentRequests(250)
      ]);

      const agg = aggregateLeads(leads);
      const total = Math.max(agg.total, 1);
      const demo = countByKeyword(leads, "demo");
      const ops = payroll.length + recruitment.length;
      const demoPct = Math.round((demo / total) * 100);
      const opsPct = Math.round((ops / total) * 100);

      if (leadsTotal) {
        leadsTotal.textContent = formatNumber(agg.total);
      }
      if (demoRate) {
        demoRate.textContent = `${demoPct}%`;
      }
      if (opsRate) {
        opsRate.textContent = `${opsPct}%`;
      }

      if (funnel) {
        const stages = [
          { label: "Leads", value: agg.total, pct: 100 },
          { label: "Demo Requests", value: demo, pct: demoPct },
          { label: "Ops Requests", value: ops, pct: opsPct }
        ];

        funnel.innerHTML = stages
          .map(
            (stage) =>
              `<div class="admin-funnel-step">
                <div class="meta"><strong>${escapeHtml(stage.label)}</strong><span>${formatNumber(
                stage.value
              )} (${stage.pct}%)</span></div>
                <div class="track"><div class="fill" style="width:${Math.max(stage.pct, 4)}%"></div></div>
              </div>`
          )
          .join("");
      }

      if (dayBars) {
        renderBars(dayBars, getRecentSeries(agg.byDay, 14));
      }

      if (topPages) {
        renderRankedList(topPages, sortedEntries(agg.byPage).slice(0, 8), ([page, count], index) => {
          return `${index + 1}. <strong>${escapeHtml(page)}</strong> <span class=\"muted\">(${count})</span>`;
        });
      }

      if (mix) {
        const mixRows = sortedEntries(agg.byForm).slice(0, 8);
        renderRankedList(mix, mixRows, ([name, count], index) => {
          const pct = Math.round((count / total) * 100);
          return `${index + 1}. <strong>${escapeHtml(name)}</strong> - ${count} (${pct}%)`;
        });
      }

      if (insights) {
        const pageEntries = sortedEntries(agg.byPage);
        const topPage = pageEntries[0]?.[0] || "n/a";
        const topForm = sortedEntries(agg.byForm)[0]?.[0] || "n/a";
        const insightsRows = [
          `Top entry page: ${topPage}`,
          `Highest volume form: ${topForm}`,
          `Demo conversion rate: ${demoPct}%`,
          `Combined payroll + recruitment conversion: ${opsPct}%`
        ];

        insights.innerHTML = insightsRows.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      }
    } catch (error) {
      if (funnel) {
        funnel.innerHTML = "<p class=\"muted\">Unable to load funnel data.</p>";
      }
      if (dayBars) {
        dayBars.innerHTML = "<p class=\"muted\">Unable to load trend data.</p>";
      }
      if (topPages) {
        topPages.innerHTML = "<li>Unable to load page ranking.</li>";
      }
      if (mix) {
        mix.innerHTML = "<li>Unable to load source mix.</li>";
      }
      if (insights) {
        insights.innerHTML = "<li>Unable to compute insights right now.</li>";
      }
    }
  }

  function compactCount(value) {
    const count = Number(value || 0);
    if (count >= 1000) {
      return `${Math.round((count / 100)) / 10}k`;
    }
    return String(count);
  }

  function starString(value) {
    const stars = Math.max(1, Math.min(5, Math.round(Number(value || 0))));
    return "*".repeat(stars);
  }

  function planClass(tier) {
    if (tier === "free") return "plan-free";
    if (tier === "enterprise") return "plan-enterprise";
    return "plan-pro";
  }

  function syncToolTabsWithCatalog(categories) {
    const tabRow = document.querySelector(".tab-row[role='tablist']");
    if (!tabRow) {
      return;
    }

    const unique = Array.from(new Set((Array.isArray(categories) ? categories : []).filter(Boolean)));
    if (!unique.length) {
      return;
    }

    const buttons = [
      '<button class="tab-btn active" data-filter="all" type="button">All Tools</button>',
      ...unique.map(
        (category) =>
          `<button class="tab-btn" data-filter="${escapeHtml(category)}" type="button">${escapeHtml(toLabel(category))}</button>`
      )
    ];

    tabRow.innerHTML = buttons.join("");
  }

  function renderManagedToolsGrid(grid, tools) {
    const items = sortCatalogItems((Array.isArray(tools) ? tools : []).map((item, index) => normalizeToolRecord(item, index)));
    grid.innerHTML = items
      .map((tool) => {
        return `<article class="card tool-card" data-category="${escapeHtml(tool.category)}" data-tool-id="${escapeHtml(
          tool.slug
        )}">
          <div class="top">
            <div>
              <span class="icon-wrap">${escapeHtml(tool.iconCode || "AI")}</span>
              <h3>${escapeHtml(tool.name)}</h3>
            </div>
            <span class="badge ${planClass(tool.planTier)}">${escapeHtml(toLabel(tool.planTier))}</span>
          </div>
          <p>${escapeHtml(tool.summary || "AI workflow tool for finance teams.")}</p>
          <div class="meta-row">
            <span class="tag">${escapeHtml(toLabel(tool.category))}</span>
            <a class="btn btn-secondary" href="${escapeHtml(tool.ctaHref || "/tool-detail")}">${escapeHtml(
              tool.ctaLabel || "Try It"
            )}</a>
          </div>
        </article>`;
      })
      .join("");

    const categories = items.map((item) => item.category);
    syncToolTabsWithCatalog(categories);
    grid.dataset.toolFiltersBound = "";
    app.reinitToolFilters?.();
  }

  function renderManagedCoursesGrid(grid, courses) {
    const items = sortCatalogItems((Array.isArray(courses) ? courses : []).map((item, index) => normalizeCourseRecord(item, index)));
    grid.innerHTML = items
      .map((course, index) => {
        const cardClasses = ["course-filter-card", "card", "course-card"];
        if (index >= 5) {
          cardClasses.push("extra-course", "hidden");
        }

        return `<article class="${cardClasses.join(" ")}" data-course-id="${escapeHtml(course.slug)}" data-topic="${escapeHtml(
          course.topic
        )}" data-level="${escapeHtml(course.level)}" data-duration="${escapeHtml(
          course.durationBucket
        )}" data-format="${escapeHtml(course.format)}" data-cert="${escapeHtml(
          course.certType
        )}" data-rating="${escapeHtml(course.rating)}" data-enroll="${escapeHtml(
          course.enrollCount
        )}" data-year="${escapeHtml(course.releaseYear)}" data-price="${escapeHtml(course.priceUsd)}">
          <div class="course-thumb"></div>
          <div class="course-content">
            <div class="meta-row">
              <span class="badge ${escapeHtml(course.level)}">${escapeHtml(toLabel(course.level))}</span>
              <span class="muted">${escapeHtml(`${Math.max(0, Math.round(course.durationHours))} hrs`)}</span>
            </div>
            <h3>${escapeHtml(course.title)}</h3>
            <p>${escapeHtml(course.instructor || "FinReady Academy")}</p>
            <div class="meta-row">
              <span class="rating">${escapeHtml(starString(course.rating))} ${escapeHtml(
                Number(course.rating || 0).toFixed(1)
              )}</span>
              <span class="muted">(${escapeHtml(compactCount(course.enrollCount))})</span>
            </div>
            <a class="btn btn-primary" href="/course-detail">Enroll</a>
          </div>
        </article>`;
      })
      .join("");

    const loadMoreButton = document.getElementById("loadMoreCourses");
    if (loadMoreButton) {
      loadMoreButton.classList.toggle("hidden", items.length <= 5);
    }

    app.reinitCourseFilters?.();
  }

  async function initCatalogPublicHydration() {
    const toolGrid = document.querySelector(".tool-grid");
    const coursesGrid = document.getElementById("coursesGrid");

    if (!toolGrid && !coursesGrid) {
      return;
    }

    if (toolGrid) {
      try {
        const tools = await fetchCatalogTools(false);
        if (tools.length) {
          renderManagedToolsGrid(toolGrid, tools);
        }
      } catch (error) {}
    }

    if (coursesGrid) {
      try {
        const courses = await fetchCatalogCourses(false);
        if (courses.length) {
          renderManagedCoursesGrid(coursesGrid, courses);
        }
      } catch (error) {}
    }

    initSaveActions();
  }

  function setManagerMessage(holder, text, state) {
    if (!holder) {
      return;
    }
    holder.textContent = text || "";
    holder.dataset.state = state || "info";
  }

  function getCoursePayloadFromForm(form) {
    const data = new FormData(form);
    return normalizeCourseRecord({
      id: String(data.get("id") || "").trim(),
      slug: String(data.get("slug") || ""),
      title: String(data.get("title") || ""),
      instructor: String(data.get("instructor") || ""),
      summary: String(data.get("summary") || ""),
      topic: String(data.get("topic") || ""),
      level: String(data.get("level") || ""),
      durationHours: Number(data.get("durationHours") || 0),
      durationBucket: String(data.get("durationBucket") || ""),
      format: String(data.get("format") || ""),
      certType: String(data.get("certType") || ""),
      rating: Number(data.get("rating") || 0),
      enrollCount: Number(data.get("enrollCount") || 0),
      releaseYear: Number(data.get("releaseYear") || DEFAULT_COURSE_RELEASE_YEAR),
      priceUsd: Number(data.get("priceUsd") || 0),
      displayOrder: Number(data.get("displayOrder") || 0),
      isPublished: data.get("isPublished") === "on"
    });
  }

  function getToolPayloadFromForm(form) {
    const data = new FormData(form);
    return normalizeToolRecord({
      id: String(data.get("id") || "").trim(),
      slug: String(data.get("slug") || ""),
      name: String(data.get("name") || ""),
      category: String(data.get("category") || ""),
      summary: String(data.get("summary") || ""),
      planTier: String(data.get("planTier") || ""),
      iconCode: String(data.get("iconCode") || ""),
      ctaLabel: String(data.get("ctaLabel") || ""),
      ctaHref: String(data.get("ctaHref") || ""),
      displayOrder: Number(data.get("displayOrder") || 0),
      isActive: data.get("isActive") === "on"
    });
  }

  async function initAdminCoursesManager() {
    const table = document.getElementById("adminCoursesTable");
    const form = document.getElementById("adminCourseForm");
    if (!table || !form) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session)) {
      const body = table.querySelector("tbody");
      if (body) {
        body.innerHTML = '<tr><td colspan="7">Access denied. Login as admin to manage courses.</td></tr>';
      }
      Array.from(form.elements || []).forEach((el) => {
        el.disabled = true;
      });
      return;
    }

    const tableBody = table.querySelector("tbody");
    const pagination = document.getElementById("adminCoursesPagination");
    const searchInput = document.getElementById("adminCourseSearch");
    const statusFilter = document.getElementById("adminCourseStatus");
    const topicFilter = document.getElementById("adminCourseTopic");
    const totalEl = document.getElementById("adminCoursesTotal");
    const publishedEl = document.getElementById("adminCoursesPublished");
    const draftEl = document.getElementById("adminCoursesDraft");
    const formTitle = document.getElementById("adminCourseFormTitle");
    const submitBtn = document.getElementById("adminCourseSubmit");
    const resetBtn = document.getElementById("adminCourseReset");
    const messageEl = document.getElementById("adminCourseMessage");

    const idInput = document.getElementById("adminCourseId");
    const slugInput = document.getElementById("adminCourseSlug");
    const titleInput = document.getElementById("adminCourseTitle");
    const instructorInput = document.getElementById("adminCourseInstructor");
    const summaryInput = document.getElementById("adminCourseSummary");
    const topicInput = document.getElementById("adminCourseTopicValue");
    const levelInput = document.getElementById("adminCourseLevel");
    const durationHoursInput = document.getElementById("adminCourseDurationHours");
    const durationBucketInput = document.getElementById("adminCourseDurationBucket");
    const formatInput = document.getElementById("adminCourseFormat");
    const certTypeInput = document.getElementById("adminCourseCertType");
    const ratingInput = document.getElementById("adminCourseRating");
    const enrollCountInput = document.getElementById("adminCourseEnrollCount");
    const releaseYearInput = document.getElementById("adminCourseReleaseYear");
    const priceUsdInput = document.getElementById("adminCoursePriceUsd");
    const displayOrderInput = document.getElementById("adminCourseDisplayOrder");
    const publishedInput = document.getElementById("adminCoursePublished");

    let all = [];
    let filtered = [];
    let page = 1;
    const pageSize = 8;

    const resetForm = () => {
      form.reset();
      if (idInput) idInput.value = "";
      if (topicInput) topicInput.value = "fundamentals";
      if (levelInput) levelInput.value = "beginner";
      if (durationBucketInput) durationBucketInput.value = "mid";
      if (formatInput) formatInput.value = "selfpaced";
      if (certTypeInput) certTypeInput.value = "finready";
      if (durationHoursInput) durationHoursInput.value = "4";
      if (ratingInput) ratingInput.value = "4.5";
      if (enrollCountInput) enrollCountInput.value = "0";
      if (releaseYearInput) releaseYearInput.value = String(DEFAULT_COURSE_RELEASE_YEAR);
      if (priceUsdInput) priceUsdInput.value = "0";
      if (displayOrderInput) displayOrderInput.value = "0";
      if (publishedInput) publishedInput.checked = true;
      if (formTitle) formTitle.textContent = "Create Course";
      if (submitBtn) submitBtn.textContent = "Create Course";
      setManagerMessage(messageEl, "", "info");
    };

    const fillForm = (item) => {
      if (!item) {
        return;
      }
      if (idInput) idInput.value = item.id || "";
      if (slugInput) slugInput.value = item.slug || "";
      if (titleInput) titleInput.value = item.title || "";
      if (instructorInput) instructorInput.value = item.instructor || "";
      if (summaryInput) summaryInput.value = item.summary || "";
      if (topicInput) topicInput.value = choose(item.topic, COURSE_TOPICS, "fundamentals");
      if (levelInput) levelInput.value = choose(item.level, COURSE_LEVELS, "beginner");
      if (durationHoursInput) durationHoursInput.value = String(Math.round(Number(item.durationHours || 0)));
      if (durationBucketInput) durationBucketInput.value = choose(item.durationBucket, COURSE_DURATION_BUCKETS, "mid");
      if (formatInput) formatInput.value = choose(item.format, COURSE_FORMATS, "selfpaced");
      if (certTypeInput) certTypeInput.value = choose(item.certType, COURSE_CERT_TYPES, "finready");
      if (ratingInput) ratingInput.value = String(Number(item.rating || 0));
      if (enrollCountInput) enrollCountInput.value = String(Number(item.enrollCount || 0));
      if (releaseYearInput) releaseYearInput.value = String(Number(item.releaseYear || DEFAULT_COURSE_RELEASE_YEAR));
      if (priceUsdInput) priceUsdInput.value = String(Number(item.priceUsd || 0));
      if (displayOrderInput) displayOrderInput.value = String(Number(item.displayOrder || 0));
      if (publishedInput) publishedInput.checked = item.isPublished !== false;
      if (formTitle) formTitle.textContent = "Edit Course";
      if (submitBtn) submitBtn.textContent = "Update Course";
      setManagerMessage(messageEl, `Editing "${item.title}"`, "info");
    };

    const applyFilters = () => {
      const q = String(searchInput?.value || "").trim().toLowerCase();
      const status = String(statusFilter?.value || "all").toLowerCase();
      const topic = String(topicFilter?.value || "all").toLowerCase();

      filtered = all.filter((item) => {
        const inStatus =
          status === "all" ||
          (status === "published" && item.isPublished) ||
          (status === "draft" && !item.isPublished);
        const inTopic = topic === "all" || String(item.topic || "").toLowerCase() === topic;
        const haystack = `${item.title} ${item.slug} ${item.instructor}`.toLowerCase();
        const inQuery = !q || haystack.includes(q);
        return inStatus && inTopic && inQuery;
      });

      page = 1;
      render();
    };

    const render = () => {
      if (!tableBody) {
        return;
      }

      if (totalEl) totalEl.textContent = formatNumber(all.length);
      if (publishedEl) publishedEl.textContent = formatNumber(all.filter((item) => item.isPublished).length);
      if (draftEl) draftEl.textContent = formatNumber(all.filter((item) => !item.isPublished).length);

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, totalPages);
      const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

      tableBody.innerHTML = pageRows.length
        ? pageRows
            .map((item) => {
              return `<tr>
                <td><strong>${escapeHtml(item.title)}</strong><br /><small class="muted">${escapeHtml(item.slug)}</small></td>
                <td>${escapeHtml(toLabel(item.topic))}</td>
                <td>${escapeHtml(toLabel(item.level))}</td>
                <td>$${escapeHtml(formatNumber(item.priceUsd || 0))}</td>
                <td>${statusPill(item.isPublished ? "published" : "draft")}</td>
                <td>${escapeHtml(formatDateLabel(item.updatedAt || item.createdAt))}</td>
                <td>
                  <div class="admin-row-actions">
                    <button class="btn btn-outline" type="button" data-course-action="edit" data-course-id="${escapeHtml(item.id)}">Edit</button>
                    <button class="btn btn-ghost" type="button" data-course-action="toggle" data-course-id="${escapeHtml(item.id)}">${
                      item.isPublished ? "Unpublish" : "Publish"
                    }</button>
                    <button class="btn btn-outline" type="button" data-course-action="delete" data-course-id="${escapeHtml(item.id)}">Delete</button>
                  </div>
                </td>
              </tr>`;
            })
            .join("")
        : '<tr><td colspan="7">No courses match your filters.</td></tr>';

      renderPagination(pagination, page, totalPages, (next) => {
        page = next;
        render();
      });
    };

    const load = async () => {
      all = await fetchCatalogCourses(true);
      filtered = all.slice();
      render();
    };

    table.addEventListener("click", async (event) => {
      const target = event.target.closest("[data-course-action]");
      if (!target) {
        return;
      }

      const action = target.getAttribute("data-course-action");
      const id = target.getAttribute("data-course-id");
      const item = all.find((course) => course.id === id);
      if (!item) {
        return;
      }

      try {
        if (action === "edit") {
          fillForm(item);
          form.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (action === "toggle") {
          await updateCourse(item.id, { ...item, isPublished: !item.isPublished });
          await load();
          setManagerMessage(messageEl, `Course "${item.title}" updated.`, "success");
          return;
        }

        if (action === "delete") {
          if (!window.confirm(`Delete course "${item.title}"?`)) {
            return;
          }
          await deleteCourse(item.id);
          await load();
          if (idInput?.value === item.id) {
            resetForm();
          }
          setManagerMessage(messageEl, `Course "${item.title}" deleted.`, "success");
        }
      } catch (error) {
        setManagerMessage(messageEl, error instanceof Error ? error.message : "Unable to update course.", "error");
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = getCoursePayloadFromForm(form);
      if (!payload.slug || !payload.title) {
        setManagerMessage(messageEl, "Slug and title are required.", "error");
        return;
      }

      const existingId = String(idInput?.value || "").trim();
      try {
        if (existingId) {
          await updateCourse(existingId, payload);
          setManagerMessage(messageEl, "Course updated successfully.", "success");
        } else {
          await createCourse(payload);
          setManagerMessage(messageEl, "Course created successfully.", "success");
        }
        resetForm();
        await load();
      } catch (error) {
        setManagerMessage(messageEl, error instanceof Error ? error.message : "Unable to save course.", "error");
      }
    });

    resetBtn?.addEventListener("click", () => {
      resetForm();
    });
    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);
    topicFilter?.addEventListener("change", applyFilters);

    resetForm();
    try {
      await load();
    } catch (error) {
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7">Unable to load courses right now.</td></tr>';
      }
      setManagerMessage(messageEl, error instanceof Error ? error.message : "Unable to load courses.", "error");
    }
  }

  async function initAdminToolsManager() {
    const table = document.getElementById("adminToolsTable");
    const form = document.getElementById("adminToolForm");
    if (!table || !form) {
      return;
    }

    const session = app.getSession();
    if (!app.isAdminSession(session)) {
      const body = table.querySelector("tbody");
      if (body) {
        body.innerHTML = '<tr><td colspan="6">Access denied. Login as admin to manage tools.</td></tr>';
      }
      Array.from(form.elements || []).forEach((el) => {
        el.disabled = true;
      });
      return;
    }

    const tableBody = table.querySelector("tbody");
    const pagination = document.getElementById("adminToolsPagination");
    const searchInput = document.getElementById("adminToolSearch");
    const statusFilter = document.getElementById("adminToolStatus");
    const categoryFilter = document.getElementById("adminToolCategory");
    const totalEl = document.getElementById("adminToolsTotal");
    const activeEl = document.getElementById("adminToolsActive");
    const inactiveEl = document.getElementById("adminToolsInactive");
    const formTitle = document.getElementById("adminToolFormTitle");
    const submitBtn = document.getElementById("adminToolSubmit");
    const resetBtn = document.getElementById("adminToolReset");
    const messageEl = document.getElementById("adminToolMessage");

    const idInput = document.getElementById("adminToolId");
    const slugInput = document.getElementById("adminToolSlug");
    const nameInput = document.getElementById("adminToolName");
    const categoryInput = document.getElementById("adminToolCategoryValue");
    const summaryInput = document.getElementById("adminToolSummary");
    const planTierInput = document.getElementById("adminToolPlanTier");
    const iconCodeInput = document.getElementById("adminToolIconCode");
    const ctaLabelInput = document.getElementById("adminToolCtaLabel");
    const ctaHrefInput = document.getElementById("adminToolCtaHref");
    const displayOrderInput = document.getElementById("adminToolDisplayOrder");
    const activeInput = document.getElementById("adminToolActive");

    let all = [];
    let filtered = [];
    let page = 1;
    const pageSize = 10;

    const resetForm = () => {
      form.reset();
      if (idInput) idInput.value = "";
      if (categoryInput) categoryInput.value = "forecasting";
      if (planTierInput) planTierInput.value = "pro";
      if (iconCodeInput) iconCodeInput.value = "AI";
      if (ctaLabelInput) ctaLabelInput.value = "Try It";
      if (ctaHrefInput) ctaHrefInput.value = "/tool-detail";
      if (displayOrderInput) displayOrderInput.value = "0";
      if (activeInput) activeInput.checked = true;
      if (formTitle) formTitle.textContent = "Create Tool";
      if (submitBtn) submitBtn.textContent = "Create Tool";
      setManagerMessage(messageEl, "", "info");
    };

    const fillForm = (item) => {
      if (!item) {
        return;
      }
      if (idInput) idInput.value = item.id || "";
      if (slugInput) slugInput.value = item.slug || "";
      if (nameInput) nameInput.value = item.name || "";
      if (categoryInput) categoryInput.value = item.category || "analysis";
      if (summaryInput) summaryInput.value = item.summary || "";
      if (planTierInput) planTierInput.value = choose(item.planTier, TOOL_PLAN_TIERS, "pro");
      if (iconCodeInput) iconCodeInput.value = item.iconCode || "AI";
      if (ctaLabelInput) ctaLabelInput.value = item.ctaLabel || "Try It";
      if (ctaHrefInput) ctaHrefInput.value = item.ctaHref || "/tool-detail";
      if (displayOrderInput) displayOrderInput.value = String(Number(item.displayOrder || 0));
      if (activeInput) activeInput.checked = item.isActive !== false;
      if (formTitle) formTitle.textContent = "Edit Tool";
      if (submitBtn) submitBtn.textContent = "Update Tool";
      setManagerMessage(messageEl, `Editing "${item.name}"`, "info");
    };

    const applyFilters = () => {
      const q = String(searchInput?.value || "").trim().toLowerCase();
      const status = String(statusFilter?.value || "all").toLowerCase();
      const category = String(categoryFilter?.value || "all").toLowerCase();

      filtered = all.filter((item) => {
        const inStatus =
          status === "all" ||
          (status === "active" && item.isActive) ||
          (status === "inactive" && !item.isActive);
        const inCategory = category === "all" || item.category === category;
        const haystack = `${item.name} ${item.slug} ${item.category}`.toLowerCase();
        const inQuery = !q || haystack.includes(q);
        return inStatus && inCategory && inQuery;
      });

      page = 1;
      render();
    };

    const render = () => {
      if (!tableBody) {
        return;
      }

      if (totalEl) totalEl.textContent = formatNumber(all.length);
      if (activeEl) activeEl.textContent = formatNumber(all.filter((item) => item.isActive).length);
      if (inactiveEl) inactiveEl.textContent = formatNumber(all.filter((item) => !item.isActive).length);

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      page = Math.min(page, totalPages);
      const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

      tableBody.innerHTML = pageRows.length
        ? pageRows
            .map((item) => {
              return `<tr>
                <td><strong>${escapeHtml(item.name)}</strong><br /><small class="muted">${escapeHtml(item.slug)}</small></td>
                <td>${escapeHtml(toLabel(item.category))}</td>
                <td>${statusPill(item.planTier)}</td>
                <td>${statusPill(item.isActive ? "active" : "inactive")}</td>
                <td>${escapeHtml(formatDateLabel(item.updatedAt || item.createdAt))}</td>
                <td>
                  <div class="admin-row-actions">
                    <button class="btn btn-outline" type="button" data-tool-action="edit" data-tool-id="${escapeHtml(item.id)}">Edit</button>
                    <button class="btn btn-ghost" type="button" data-tool-action="toggle" data-tool-id="${escapeHtml(item.id)}">${
                      item.isActive ? "Deactivate" : "Activate"
                    }</button>
                    <button class="btn btn-outline" type="button" data-tool-action="delete" data-tool-id="${escapeHtml(item.id)}">Delete</button>
                  </div>
                </td>
              </tr>`;
            })
            .join("")
        : '<tr><td colspan="6">No tools match your filters.</td></tr>';

      renderPagination(pagination, page, totalPages, (next) => {
        page = next;
        render();
      });
    };

    const load = async () => {
      all = await fetchCatalogTools(true);
      filtered = all.slice();
      render();
    };

    table.addEventListener("click", async (event) => {
      const target = event.target.closest("[data-tool-action]");
      if (!target) {
        return;
      }

      const action = target.getAttribute("data-tool-action");
      const id = target.getAttribute("data-tool-id");
      const item = all.find((tool) => tool.id === id);
      if (!item) {
        return;
      }

      try {
        if (action === "edit") {
          fillForm(item);
          form.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        if (action === "toggle") {
          await updateTool(item.id, { ...item, isActive: !item.isActive });
          await load();
          setManagerMessage(messageEl, `Tool "${item.name}" updated.`, "success");
          return;
        }

        if (action === "delete") {
          if (!window.confirm(`Delete tool "${item.name}"?`)) {
            return;
          }
          await deleteTool(item.id);
          await load();
          if (idInput?.value === item.id) {
            resetForm();
          }
          setManagerMessage(messageEl, `Tool "${item.name}" deleted.`, "success");
        }
      } catch (error) {
        setManagerMessage(messageEl, error instanceof Error ? error.message : "Unable to update tool.", "error");
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = getToolPayloadFromForm(form);
      if (!payload.slug || !payload.name) {
        setManagerMessage(messageEl, "Slug and name are required.", "error");
        return;
      }

      const existingId = String(idInput?.value || "").trim();
      try {
        if (existingId) {
          await updateTool(existingId, payload);
          setManagerMessage(messageEl, "Tool updated successfully.", "success");
        } else {
          await createTool(payload);
          setManagerMessage(messageEl, "Tool created successfully.", "success");
        }
        resetForm();
        await load();
      } catch (error) {
        setManagerMessage(messageEl, error instanceof Error ? error.message : "Unable to save tool.", "error");
      }
    });

    resetBtn?.addEventListener("click", () => {
      resetForm();
    });
    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);
    categoryFilter?.addEventListener("change", applyFilters);

    resetForm();
    try {
      await load();
    } catch (error) {
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="6">Unable to load tools right now.</td></tr>';
      }
      setManagerMessage(messageEl, error instanceof Error ? error.message : "Unable to load tools.", "error");
    }
  }

  function initDashboardModule() {
    initCatalogPublicHydration();
    initSaveActions();
    initDashboardProgress();
    initCertificatesWidget();
    initThankYouMessage();
    initRoleDashboardCards();
    initAdminDashboard();
    initRequestForms();

    initAdminWorkspaceNav();
    initAdminOverviewPanels();
    initAdminLeadsWorkbench();
    initAdminUsersDirectory();
    initAdminOperationsBoard();
    initAdminAnalytics();
    initAdminCoursesManager();
    initAdminToolsManager();
  }

  app.registerModule(initDashboardModule);
})();
