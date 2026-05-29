(function () {
  const pathAliases = {
    "/": "home",
    "/index.php": "home",
    "/ai-tools": "ai-tools",
    "/ai-tools.php": "ai-tools",
    "/courses": "courses",
    "/courses.php": "courses",
    "/pricing": "pricing",
    "/pricing.php": "pricing",
    "/about": "about",
    "/about.php": "about",
    "/blog": "blog",
    "/blog.php": "blog",
    "/contact": "about",
    "/contact.php": "about",
    "/case-studies": "about",
    "/case-studies.php": "about",
    "/roi-calculator": "pricing",
    "/roi-calculator.php": "pricing",
    "/enterprise": "pricing",
    "/enterprise.php": "pricing",
    "/team-dashboard": "courses",
    "/team-dashboard.php": "courses",
    "/payroll-ai": "ai-tools",
    "/payroll-ai.php": "ai-tools",
    "/recruitment-ai": "ai-tools",
    "/recruitment-ai.php": "ai-tools",
    "/reports": "courses",
    "/reports.php": "courses",
    "/help-center": "about",
    "/help-center.php": "about",
    "/faq": "about",
    "/faq.php": "about",
    "/privacy": "about",
    "/privacy.php": "about",
    "/terms": "about",
    "/terms.php": "about",
    "/my-courses": "courses",
    "/my-courses.php": "courses",
    "/my-certificates": "courses",
    "/my-certificates.php": "courses",
    "/account": "courses",
    "/account.php": "courses",
    "/invoice": "courses",
    "/invoice.php": "courses",
    "/book-demo": "pricing",
    "/book-demo.php": "pricing",
    "/login": "courses",
    "/login.php": "courses",
    "/register": "courses",
    "/register.php": "courses",
    "/admin": "about",
    "/admin.php": "about",
    "/admin-leads": "about",
    "/admin-leads.php": "about",
    "/admin-users": "about",
    "/admin-users.php": "about",
    "/admin-operations": "about",
    "/admin-operations.php": "about",
    "/admin-analytics": "about",
    "/admin-analytics.php": "about",
    "/admin-courses": "about",
    "/admin-courses.php": "about",
    "/admin-tools": "about",
    "/admin-tools.php": "about"
  };

  const navLinks = {
    home: "/",
    "ai-tools": "/ai-tools",
    courses: "/courses",
    pricing: "/pricing",
    about: "/about",
    blog: "/blog"
  };

  const staticRouteMap = {
    "/": "index.php",
    "/index.php": "index.php",
    "/ai-tools": "ai-tools.php",
    "/ai-tools.php": "ai-tools.php",
    "/tool-detail": "tool-detail.php",
    "/tool-detail.php": "tool-detail.php",
    "/courses": "courses.php",
    "/courses.php": "courses.php",
    "/course-detail": "course-detail.php",
    "/course-detail.php": "course-detail.php",
    "/certifications": "certifications.php",
    "/certifications.php": "certifications.php",
    "/dashboard": "dashboard.php",
    "/dashboard.php": "dashboard.php",
    "/pricing": "pricing.php",
    "/pricing.php": "pricing.php",
    "/about": "about.php",
    "/about.php": "about.php",
    "/blog": "blog.php",
    "/blog.php": "blog.php",
    "/contact": "contact.php",
    "/contact.php": "contact.php",
    "/case-studies": "case-studies.php",
    "/case-studies.php": "case-studies.php",
    "/roi-calculator": "roi-calculator.php",
    "/roi-calculator.php": "roi-calculator.php",
    "/enterprise": "enterprise.php",
    "/enterprise.php": "enterprise.php",
    "/team-dashboard": "team-dashboard.php",
    "/team-dashboard.php": "team-dashboard.php",
    "/payroll-ai": "payroll-ai.php",
    "/payroll-ai.php": "payroll-ai.php",
    "/recruitment-ai": "recruitment-ai.php",
    "/recruitment-ai.php": "recruitment-ai.php",
    "/reports": "reports.php",
    "/reports.php": "reports.php",
    "/help-center": "help-center.php",
    "/help-center.php": "help-center.php",
    "/faq": "faq.php",
    "/faq.php": "faq.php",
    "/privacy": "privacy.php",
    "/privacy.php": "privacy.php",
    "/terms": "terms.php",
    "/terms.php": "terms.php",
    "/my-courses": "my-courses.php",
    "/my-courses.php": "my-courses.php",
    "/my-certificates": "my-certificates.php",
    "/my-certificates.php": "my-certificates.php",
    "/account": "account.php",
    "/account.php": "account.php",
    "/invoice": "invoice.php",
    "/invoice.php": "invoice.php",
    "/careers": "careers.php",
    "/careers.php": "careers.php",
    "/book-demo": "book-demo.php",
    "/book-demo.php": "book-demo.php",
    "/thank-you": "thank-you.php",
    "/thank-you.php": "thank-you.php",
    "/login": "login.php",
    "/login.php": "login.php",
    "/register": "register.php",
    "/register.php": "register.php",
    "/admin": "admin.php",
    "/admin.php": "admin.php",
    "/admin-leads": "admin-leads.php",
    "/admin-leads.php": "admin-leads.php",
    "/admin-users": "admin-users.php",
    "/admin-users.php": "admin-users.php",
    "/admin-operations": "admin-operations.php",
    "/admin-operations.php": "admin-operations.php",
    "/admin-analytics": "admin-analytics.php",
    "/admin-analytics.php": "admin-analytics.php",
    "/admin-courses": "admin-courses.php",
    "/admin-courses.php": "admin-courses.php",
    "/admin-tools": "admin-tools.php",
    "/admin-tools.php": "admin-tools.php"
  };

  const STORAGE_KEYS = {
    session: "finready_user_session",
    users: "finready_users",
    savedTools: "finready_saved_tools",
    savedCourses: "finready_saved_courses",
    progress: "finready_learning_progress",
    certs: "finready_certificates",
    localSubmissions: "finready_local_submissions",
    managedCourses: "finready_managed_courses",
    managedTools: "finready_managed_tools"
  };

  function normalizePath(pathname) {
    if (!pathname) {
      return "/";
    }

    if (pathname !== "/" && pathname.endsWith("/")) {
      return pathname.slice(0, -1);
    }

    return pathname;
  }

  function getMainScriptPath() {
    const currentScript = document.currentScript;
    const scriptSrc =
      (currentScript && currentScript.getAttribute("src")) ||
      document.querySelector('script[src*="assets/js/main.js"]')?.getAttribute("src") ||
      "";

    if (!scriptSrc) {
      return "";
    }

    try {
      return normalizePath(new URL(scriptSrc, window.location.href).pathname);
    } catch (error) {
      return "";
    }
  }

  function getStaticBaseCandidate(scriptPath) {
    const match = scriptPath.match(/^(.*)\/assets\/js\/main\.js$/i);
    if (!match) {
      return "";
    }

    const candidate = normalizePath(match[1] || "/");
    return candidate === "/" ? "" : candidate;
  }

  function stripBasePath(pathname, basePath) {
    if (!basePath) {
      return pathname;
    }

    if (pathname === basePath) {
      return "/";
    }

    if (pathname.startsWith(`${basePath}/`)) {
      return normalizePath(pathname.slice(basePath.length) || "/");
    }

    return pathname;
  }

  const CURRENT_PATH = normalizePath(window.location.pathname);
  const MAIN_SCRIPT_PATH = getMainScriptPath();
  const STATIC_BASE_CANDIDATE = getStaticBaseCandidate(MAIN_SCRIPT_PATH);
  const HAS_NEXT_RUNTIME = Boolean(document.getElementById("__NEXT_DATA__"));
  const IS_WITHIN_STATIC_BASE = STATIC_BASE_CANDIDATE
    ? CURRENT_PATH === STATIC_BASE_CANDIDATE || CURRENT_PATH.startsWith(`${STATIC_BASE_CANDIDATE}/`)
    : false;
  const IS_STATIC_HTML_MODE =
    !HAS_NEXT_RUNTIME && (/\.(?:html|php)$/i.test(CURRENT_PATH) || IS_WITHIN_STATIC_BASE);
  const STATIC_BASE_PATH = IS_STATIC_HTML_MODE ? STATIC_BASE_CANDIDATE : "";
  const CURRENT_ROUTE_PATH = normalizePath(stripBasePath(CURRENT_PATH, STATIC_BASE_PATH));
  const PAGE = document.body.dataset.page || pathAliases[CURRENT_ROUTE_PATH] || "";

  function safeReadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function toStaticHref(href) {
    if (!href || !href.startsWith("/")) {
      return href;
    }

    const hashIndex = href.indexOf("#");
    const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
    const withoutHash = hashIndex === -1 ? href : href.slice(0, hashIndex);

    const queryIndex = withoutHash.indexOf("?");
    const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex);
    const path = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);

    const routePath = normalizePath(stripBasePath(path, STATIC_BASE_PATH));
    const normalizedRoute = routePath.replace(/^\//, "");
    let fileName = staticRouteMap[routePath];

    if (!fileName) {
      if (/\.php$/i.test(normalizedRoute)) {
        fileName = normalizedRoute;
      } else if (/\.html$/i.test(normalizedRoute)) {
        fileName = normalizedRoute.replace(/\.html$/i, ".php");
      } else {
        fileName = `${normalizedRoute}.php`;
      }
    }
    const base = STATIC_BASE_PATH && STATIC_BASE_PATH !== "/" ? STATIC_BASE_PATH : "";
    return `${base}/${fileName}${query}${hash}`;
  }

  function navigateTo(href) {
    if (!href) {
      return;
    }

    if (IS_STATIC_HTML_MODE && href.startsWith("/")) {
      window.location.href = toStaticHref(href);
      return;
    }

    window.location.href = href;
  }

  function rewriteLinksForStaticMode() {
    if (!IS_STATIC_HTML_MODE) {
      return;
    }

    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.setAttribute("href", toStaticHref(href));
    });
  }

  function getSession() {
    return safeReadJson(STORAGE_KEYS.session, null);
  }

  function setSession(session) {
    safeWriteJson(STORAGE_KEYS.session, session);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.session);
  }

  async function syncSessionFromServer() {
    if (IS_STATIC_HTML_MODE) {
      return;
    }

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (data?.ok && data.user) {
        setSession({
          id: data.user.id,
          fullName: data.user.fullName || "FinReady User",
          email: data.user.email,
          role: String(data.user.role || "professional").toLowerCase(),
          loggedInAt: new Date().toISOString()
        });
      } else if (data?.ok && !data.user) {
        clearSession();
      }
    } catch (error) {}
  }

  function isAdminSession(session) {
    if (!session) {
      return false;
    }
    return session.role === "admin" || session.email === "admin@finready.ai";
  }

  function createDefaultAdminIfMissing() {
    const users = safeReadJson(STORAGE_KEYS.users, []);
    const hasAdmin = users.some((user) => user.email === "admin@finready.ai");

    if (!hasAdmin) {
      users.push({
        id: "u-admin",
        fullName: "FinReady Admin",
        email: "admin@finready.ai",
        password: "Admin@123",
        role: "admin",
        createdAt: new Date().toISOString()
      });
      safeWriteJson(STORAGE_KEYS.users, users);
    }
  }

  function injectSharedLayout() {
    const headerTarget = document.querySelector("[data-site-header]");
    const footerTarget = document.querySelector("[data-site-footer]");

    if (headerTarget) {
      headerTarget.innerHTML = `
      <header class="site-header ${PAGE === "home" ? "transparent" : "solid"}" id="siteHeader">
        <div class="container nav-wrap">
          <a class="logo" href="/" aria-label="FinReady homepage">Fin<span>Ready</span></a>
          <nav id="siteNav" class="site-nav" aria-label="Main navigation">
            <ul>
              <li class="has-menu">
                <button class="menu-trigger" type="button">AI Tools</button>
                <div class="mega-menu" aria-label="AI tools menu">
                  <a href="/ai-tools">AI Finance Tools<small>Forecasting, compliance, analytics</small></a>
                  <a href="/tool-detail">Payroll Copilot<small>AI payroll management automation</small></a>
                  <a href="/tool-detail#recruitment">Recruitment Intelligence<small>Candidate scoring and hiring fit</small></a>
                  <a href="/ai-tools#literacy">Financial Literacy Bot<small>Coach for employees and students</small></a>
                </div>
              </li>
              <li class="has-menu">
                <button class="menu-trigger" type="button">Courses & Certifications</button>
                <div class="mega-menu" aria-label="Courses menu">
                  <a href="/courses">Course Catalog<small>Self-paced and cohort learning</small></a>
                  <a href="/course-detail">Course Detail<small>Syllabus, outcomes, enrollment</small></a>
                  <a href="/certifications">Certification Hub<small>Roadmaps and employer verification</small></a>
                  <a href="/dashboard">Learning Dashboard<small>Progress tracking and streaks</small></a>
                </div>
              </li>
              <li><a href="/pricing" data-link="pricing">Pricing</a></li>
              <li><a href="/about" data-link="about">About</a></li>
              <li><a href="/blog" data-link="blog">Blog</a></li>
            </ul>
          </nav>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Open navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          <div class="nav-actions">
            <button class="search-toggle" type="button" aria-label="Open site search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="M20 20L17 17"></path></svg>
            </button>
            <a class="btn btn-ghost" href="/login" data-auth-show="guest">Login</a>
            <a class="btn btn-ghost" href="/register" data-auth-show="guest">Register</a>
            <div class="user-nav-dropdown" data-auth-show="user" hidden>
              <button class="user-nav-trigger" type="button" aria-haspopup="menu" aria-expanded="false" data-user-menu-trigger>
                <span class="auth-chip" data-auth-chip hidden></span>
                <svg class="user-nav-caret" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>
              <div class="user-nav-menu" data-user-menu hidden>
                <a class="user-nav-link" href="/dashboard">Dashboard</a>
                <a class="user-nav-link" href="/account.php">Account</a>
                <button class="user-nav-link user-nav-link-danger" type="button" data-auth-logout>Logout</button>
              </div>
            </div>
            <a class="btn btn-secondary" href="/book-demo">Book Demo</a>
          </div>
        </div>
        <div class="nav-search" id="navSearch" role="region" aria-label="Site search">
          <div class="container">
            <input type="search" id="globalSearch" placeholder="Search tools, courses, certifications..." aria-label="Search" />
          </div>
        </div>
      </header>`;
    }

    if (footerTarget) {
      footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div class="footer-col">
            <a class="logo footer-logo" href="/">Fin<span>Ready</span></a>
            <p class="footer-about">AI-driven finance tools and certification-first learning for students, professionals, and enterprise teams.</p>
            <div class="footer-social">
              <a href="#" aria-label="LinkedIn">in</a>
              <a href="#" aria-label="YouTube">></a>
              <a href="#" aria-label="X">X</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>AI Tools</h4>
            <ul class="footer-links">
              <li><a href="/ai-tools">Cash Flow AI</a></li>
              <li><a href="/tool-detail">Payroll Management</a></li>
              <li><a href="/tool-detail#recruitment">Recruitment Services</a></li>
              <li><a href="/ai-tools#literacy">Financial Literacy Coach</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Learning</h4>
            <ul class="footer-links">
              <li><a href="/courses">All Courses</a></li>
              <li><a href="/certifications">Certifications</a></li>
              <li><a href="/my-courses">My Courses</a></li>
              <li><a href="/my-certificates">My Certificates</a></li>
              <li><a href="/blog">Free Resources</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul class="footer-links">
              <li><a href="/about">About</a></li>
              <li><a href="/case-studies">Case Studies</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/help-center">Help Center</a></li>
              <li><a href="/book-demo">Book Demo</a></li>
              <li><a href="/admin">Admin</a></li>
            </ul>
            <form class="footer-newsletter" data-form-name="newsletter" data-form-message="Thanks for subscribing to FinReady updates." data-form-redirect="/thank-you?type=newsletter">
              <input name="email" type="email" required placeholder="Work email" aria-label="Email" />
              <button class="btn btn-secondary" type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>(c) 2026 FinReady. All rights reserved.</span>
          <span><a href="/terms">Terms</a> | <a href="/privacy">Privacy</a> | <a href="/faq">FAQ</a></span>
        </div>
      </footer>`;
    }
  }

  function setActiveNav() {
    document.querySelectorAll(".site-nav a").forEach((link) => {
      const rawHref = link.getAttribute("href") || "";
      const hrefPath = normalizePath(new URL(rawHref, window.location.origin).pathname);

      if (
        hrefPath === CURRENT_ROUTE_PATH ||
        (hrefPath === "/" && CURRENT_ROUTE_PATH === "/index.php")
      ) {
        link.classList.add("active");
      }
    });

    const fallbackPath = PAGE || "home";
    const fallbackHref = navLinks[fallbackPath];
    if (!fallbackHref) {
      return;
    }

    document.querySelectorAll(".site-nav a").forEach((link) => {
      if (link.getAttribute("href") === fallbackHref) {
        link.classList.add("active");
      }
    });
  }

  function initHeaderBehavior() {
    const header = document.getElementById("siteHeader");
    const nav = document.getElementById("siteNav");
    const navToggle = document.querySelector(".nav-toggle");
    const searchToggle = document.querySelector(".search-toggle");
    const navSearch = document.getElementById("navSearch");

    if (!header || !nav || !navToggle) {
      return;
    }

    const updateHeaderState = () => {
      const hasHero = PAGE === "home";
      if (!hasHero || window.scrollY > 28) {
        header.classList.remove("transparent");
        header.classList.add("solid");
      } else {
        header.classList.add("transparent");
        header.classList.remove("solid");
      }
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState);

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth > 1023) {
          return;
        }

        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1023) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".has-menu > .menu-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.innerWidth > 1023) {
          return;
        }

        const holder = btn.closest(".has-menu");
        holder.classList.toggle("open");
      });
    });

    if (searchToggle && navSearch) {
      searchToggle.addEventListener("click", () => {
        navSearch.classList.toggle("open");
      });
    }
  }

  function initUserMenu() {
    const wrapper = document.querySelector(".user-nav-dropdown");
    const trigger = document.querySelector("[data-user-menu-trigger]");
    const menu = document.querySelector("[data-user-menu]");

    if (!wrapper || !trigger || !menu) {
      return;
    }

    if (trigger.dataset.boundUserMenu === "1") {
      return;
    }

    const closeMenu = () => {
      wrapper.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    };

    trigger.dataset.boundUserMenu = "1";
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const willOpen = !wrapper.classList.contains("open");
      wrapper.classList.toggle("open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
      menu.hidden = !willOpen;
    });

    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (!wrapper.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    menu.querySelectorAll("a, button").forEach((node) => {
      node.addEventListener("click", () => {
        closeMenu();
      });
    });
  }

  function updateAuthUi() {
    const session = getSession();
    const authChip = document.querySelector("[data-auth-chip]");
    const userDropdown = document.querySelector(".user-nav-dropdown");
    const userMenu = document.querySelector("[data-user-menu]");
    const userMenuTrigger = document.querySelector("[data-user-menu-trigger]");

    document.querySelectorAll("[data-auth-show='guest']").forEach((node) => {
      node.hidden = Boolean(session);
    });

    document.querySelectorAll("[data-auth-show='user']").forEach((node) => {
      node.hidden = !session;
    });

    if (authChip) {
      if (session) {
        authChip.hidden = false;
        authChip.textContent = `Hi, ${session.fullName?.split(" ")[0] || "User"}`;
      } else {
        authChip.hidden = true;
      }
    }

    if (!session && userDropdown && userMenu && userMenuTrigger) {
      userDropdown.classList.remove("open");
      userMenu.hidden = true;
      userMenuTrigger.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll("[data-auth-logout]").forEach((btn) => {
      if (btn.dataset.boundLogout === "1") {
        return;
      }

      btn.dataset.boundLogout = "1";
      btn.addEventListener("click", async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
          });
        } catch (error) {}

        clearSession();
        navigateTo("/");
      });
    });
  }

  function ensureSkipLink() {
    if (!document.querySelector(".skip-link")) {
      const link = document.createElement("a");
      link.className = "skip-link";
      link.href = "#mainContent";
      link.textContent = "Skip to content";
      document.body.prepend(link);
    }

    const main = document.querySelector("main");
    if (main && !main.id) {
      main.id = "mainContent";
    }
  }

  function injectSeoEnhancements() {
    if (!document.querySelector('link[rel="icon"]')) {
      const icon = document.createElement("link");
      icon.rel = "icon";
      icon.type = "image/svg+xml";
      icon.href = IS_STATIC_HTML_MODE ? "assets/images/favicon.svg" : "/assets/images/favicon.svg";
      document.head.appendChild(icon);
    }

    if (!document.querySelector('meta[property="og:site_name"]')) {
      const siteMeta = document.createElement("meta");
      siteMeta.setAttribute("property", "og:site_name");
      siteMeta.content = "FinReady";
      document.head.appendChild(siteMeta);
    }

    const canonicalPath =
      CURRENT_ROUTE_PATH.replace(/\.(?:html|php)$/i, "").replace(/\/index$/i, "") || "/";
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://finready.ai${canonicalPath === "/" ? "" : canonicalPath}`;

    if (!document.querySelector('script[data-schema="website"]')) {
      const schema = document.createElement("script");
      schema.type = "application/ld+json";
      schema.dataset.schema = "website";
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FinReady",
        url: "https://finready.ai",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://finready.ai/ai-tools?query={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      });
      document.head.appendChild(schema);
    }
  }

  function initScrollReveal() {
    const revealItems = Array.from(
      document.querySelectorAll(
        [
          "main > section",
          ".card-grid-3 .card",
          ".tool-card",
          ".course-card",
          ".plan-card",
          ".track-card",
          ".story-item",
          ".member-card",
          ".post-card",
          ".role-card",
          ".timeline-item",
          ".review",
          ".timeline-box"
        ].join(",")
      )
    ).filter((node) => !node.classList.contains("hidden"));

    if (!revealItems.length || !("IntersectionObserver" in window)) {
      return;
    }

    revealItems.forEach((node, index) => {
      node.setAttribute("data-reveal", "");
      node.style.transitionDelay = `${Math.min(index % 8, 5) * 50}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((node) => revealObserver.observe(node));
  }

  function initCountUp() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) {
      return;
    }

    const animateCounter = (el) => {
      const target = Number(el.dataset.count || 0);
      let value = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const suffix = el.dataset.suffix || "";

      const timer = setInterval(() => {
        value += step;
        if (value >= target) {
          value = target;
          clearInterval(timer);
        }
        el.textContent = `${value.toLocaleString()}${suffix}`;
      }, 28);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initTestimonials() {
    const quoteEl = document.querySelector("[data-testimonial-quote]");
    const authorEl = document.querySelector("[data-testimonial-author]");
    const prevBtn = document.querySelector("[data-testimonial-prev]");
    const nextBtn = document.querySelector("[data-testimonial-next]");

    if (!quoteEl || !authorEl || !prevBtn || !nextBtn) {
      return;
    }

    const items = [
      {
        quote:
          "FinReady's AI tools saved our finance team 20 hours every week and gave us cleaner month-end closes.",
        author: "Sarah Chen, CFO at TechCorp"
      },
      {
        quote:
          "The payroll and hiring automation stack reduced onboarding time by 43% in one quarter.",
        author: "James Osei, People Ops Director at BrightGrid"
      },
      {
        quote:
          "Our students completed certification paths 2x faster with personalized AI tutoring.",
        author: "Dr. Maya Patel, Program Lead at Metro Business School"
      }
    ];

    let index = 0;

    const render = () => {
      quoteEl.textContent = `"${items[index].quote}"`;
      authorEl.textContent = items[index].author;
    };

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + items.length) % items.length;
      render();
    });

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % items.length;
      render();
    });

    render();
  }

  function initToolFilters() {
    const search = document.getElementById("toolSearch");
    const grid = document.querySelector(".tool-grid");
    const tabs = Array.from(document.querySelectorAll(".tab-btn[data-filter]"));

    if (!grid || !tabs.length) {
      return;
    }

    const getCards = () => Array.from(grid.querySelectorAll(".tool-card"));
    if (!getCards().length) {
      return;
    }

    let activeFilter = "all";

    function apply() {
      const cards = getCards();
      const query = (search?.value || "").toLowerCase().trim();
      cards.forEach((card) => {
        const cardCategory = card.dataset.category || "";
        const text = card.textContent.toLowerCase();
        const matchCategory = activeFilter === "all" || activeFilter === cardCategory;
        const matchSearch = query.length === 0 || text.includes(query);
        card.classList.toggle("hidden", !(matchCategory && matchSearch));
      });
    }

    if (grid.dataset.toolFiltersBound !== "1") {
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((item) => item.classList.remove("active"));
          tab.classList.add("active");
          activeFilter = tab.dataset.filter || "all";
          apply();
        });
      });

      if (search) {
        search.addEventListener("input", apply);
      }

      grid.dataset.toolFiltersBound = "1";
    }

    const activeTab = tabs.find((tab) => tab.classList.contains("active")) || tabs[0];
    if (activeTab) {
      activeFilter = activeTab.dataset.filter || "all";
    }
    apply();
  }

  function initUseCaseTabs() {
    const buttons = Array.from(document.querySelectorAll("[data-usecase-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-usecase-panel]"));

    if (!buttons.length || !panels.length) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.usecaseTab;
        buttons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        panels.forEach((panel) => {
          panel.classList.toggle("hidden", panel.dataset.usecasePanel !== target);
        });
      });
    });
  }

  function initAccordion() {
    document.querySelectorAll(".accordion-item").forEach((item, index) => {
      const trigger = item.querySelector(".accordion-trigger");
      const panel = item.querySelector(".accordion-panel");
      if (!trigger || !panel) {
        return;
      }

      const panelId = panel.id || `accordion-panel-${index + 1}`;
      panel.id = panelId;
      trigger.setAttribute("aria-controls", panelId);
      trigger.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");

      trigger.addEventListener("click", () => {
        const open = item.classList.contains("open");
        item.classList.toggle("open", !open);
        trigger.setAttribute("aria-expanded", String(!open));
      });
    });
  }

  function initStickyEnroll() {
    const sticky = document.querySelector(".sticky-enroll");
    const trigger = document.querySelector("[data-sticky-trigger]");

    if (!sticky || !trigger) {
      return;
    }

    const toggle = () => {
      const threshold = trigger.getBoundingClientRect().bottom;
      sticky.classList.toggle("show", threshold < 70);
    };

    window.addEventListener("scroll", toggle);
    toggle();
  }

  function initPricingToggle() {
    const buttons = Array.from(document.querySelectorAll("[data-billing-toggle] button"));
    const prices = Array.from(document.querySelectorAll("[data-price]"));

    if (!buttons.length || !prices.length) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        const mode = button.dataset.billing || "monthly";

        prices.forEach((price) => {
          const nextValue = price.dataset[mode] || "";
          price.textContent = nextValue;
        });

        document.querySelectorAll("[data-annual-badge]").forEach((badge) => {
          badge.classList.toggle("hidden", mode !== "annual");
        });
      });
    });
  }

  function initRoadmap() {
    const nodes = Array.from(document.querySelectorAll(".road-node"));
    const detail = document.getElementById("roadmapDetail");

    if (!nodes.length || !detail) {
      return;
    }

    nodes.forEach((node) => {
      node.addEventListener("click", () => {
        nodes.forEach((item) => item.classList.remove("active"));
        node.classList.add("active");
        detail.innerHTML = `<strong>${node.dataset.title}</strong><p>${node.dataset.detail}</p>`;
      });
    });

    nodes[0].click();
  }

  function initDemoTool() {
    const runBtn = document.getElementById("runDemo");
    const output = document.getElementById("demoOutput");

    if (!runBtn || !output) {
      return;
    }

    runBtn.addEventListener("click", () => {
      const payroll = Number(document.getElementById("demoPayroll")?.value || 0);
      const headcount = Number(document.getElementById("demoHeadcount")?.value || 0);
      const attrition = Number(document.getElementById("demoAttrition")?.value || 0);

      const riskScore = Math.min(99, Math.round(attrition * 1.1 + (payroll / 10000) * 0.08));
      const savings = Math.round((payroll * 0.06 + headcount * 190) / 1000) * 1000;
      output.innerHTML = `
        <h3>AI Demo Insights</h3>
        <p>Payroll variance risk score: <strong>${riskScore}/100</strong></p>
        <p>Estimated annual automation savings: <strong>$${savings.toLocaleString()}</strong></p>
        <p>Suggested action: deploy anomaly detection for payroll and hiring flow in high-turnover teams first.</p>`;
    });
  }

  function getSelectedValues(groupName) {
    return Array.from(
      document.querySelectorAll(`input[data-filter-group="${groupName}"]:checked`)
    ).map((input) => input.value);
  }

  function initCourseFilters() {
    const grid = document.getElementById("coursesGrid");
    const searchInput = document.getElementById("courseSearch");
    const sortSelect = document.getElementById("courseSort");
    const emptyState = document.getElementById("courseEmptyState");

    if (!grid) {
      return;
    }

    const getCards = () => Array.from(grid.querySelectorAll(".course-filter-card"));
    if (!getCards().length) {
      return;
    }

    const applyFilters = () => {
      const cards = getCards();
      const topic = getSelectedValues("topic");
      const level = getSelectedValues("level");
      const duration = getSelectedValues("duration");
      const format = getSelectedValues("format");
      const cert = getSelectedValues("cert");
      const query = (searchInput?.value || "").toLowerCase().trim();

      let visible = 0;

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matchTopic = topic.length === 0 || topic.includes(card.dataset.topic || "");
        const matchLevel = level.length === 0 || level.includes(card.dataset.level || "");
        const matchDuration = duration.length === 0 || duration.includes(card.dataset.duration || "");
        const matchFormat = format.length === 0 || format.includes(card.dataset.format || "");
        const matchCert = cert.length === 0 || cert.includes(card.dataset.cert || "");
        const matchQuery = query.length === 0 || text.includes(query);

        const show =
          matchTopic &&
          matchLevel &&
          matchDuration &&
          matchFormat &&
          matchCert &&
          matchQuery;

        card.classList.toggle("hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible === 0 ? "block" : "none";
      }
    };

    const sortCourses = () => {
      if (!sortSelect) {
        return;
      }

      if (!grid) {
        return;
      }

      const mode = sortSelect.value;
      const cards = getCards();
      const sorted = cards.slice().sort((a, b) => {
        const ratingA = Number(a.dataset.rating || 0);
        const ratingB = Number(b.dataset.rating || 0);
        const enrollA = Number(a.dataset.enroll || 0);
        const enrollB = Number(b.dataset.enroll || 0);
        const yearA = Number(a.dataset.year || 0);
        const yearB = Number(b.dataset.year || 0);

        if (mode === "highest") return ratingB - ratingA;
        if (mode === "newest") return yearB - yearA;
        if (mode === "price") return Number(a.dataset.price || 0) - Number(b.dataset.price || 0);
        return enrollB - enrollA;
      });

      sorted.forEach((card) => grid.appendChild(card));
    };

    if (grid.dataset.courseFiltersBound !== "1") {
      document.querySelectorAll("input[data-filter-group]").forEach((input) => {
        input.addEventListener("change", applyFilters);
      });

      document.getElementById("clearFilters")?.addEventListener("click", () => {
        document.querySelectorAll("input[data-filter-group]").forEach((input) => {
          input.checked = false;
        });
        if (searchInput) {
          searchInput.value = "";
        }
        applyFilters();
      });

      searchInput?.addEventListener("input", applyFilters);
      sortSelect?.addEventListener("change", () => {
        sortCourses();
        applyFilters();
      });

      grid.dataset.courseFiltersBound = "1";
    }

    sortCourses();
    applyFilters();
  }

  function initLoadMoreCourses() {
    const btn = document.getElementById("loadMoreCourses");
    if (!btn) {
      return;
    }

    btn.addEventListener("click", () => {
      document.querySelectorAll(".extra-course").forEach((card) => {
        card.classList.remove("hidden");
      });
      btn.classList.add("hidden");
    });
  }

  function initReviewFilter() {
    const buttons = Array.from(document.querySelectorAll("[data-review-filter]"));
    const reviews = Array.from(document.querySelectorAll(".review[data-rating]"));

    if (!buttons.length || !reviews.length) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const rating = Number(button.dataset.reviewFilter || 0);
        buttons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        reviews.forEach((review) => {
          const reviewRating = Number(review.dataset.rating || 0);
          if (rating === 0 || reviewRating === rating) {
            review.classList.remove("hidden");
          } else {
            review.classList.add("hidden");
          }
        });
      });
    });
  }

  function enrichFormsWithTracking() {
    const params = new URLSearchParams(window.location.search);
    const trackingFields = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

    document.querySelectorAll("form[data-form-name]").forEach((form) => {
      trackingFields.forEach((field) => {
        const value = params.get(field);
        if (!value) {
          return;
        }

        if (!form.querySelector(`input[name="${field}"]`)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = field;
          input.value = value;
          form.appendChild(input);
        }
      });

      if (!form.querySelector('input[name="referrer"]')) {
        const ref = document.createElement("input");
        ref.type = "hidden";
        ref.name = "referrer";
        ref.value = document.referrer || "direct";
        form.appendChild(ref);
      }
    });
  }

  function getFormPayload(form) {
    const data = new FormData(form);
    const fields = {};

    data.forEach((value, key) => {
      fields[key] = String(value);
    });

    return {
      formName: form.dataset.formName || form.getAttribute("id") || "general-form",
      page: window.location.pathname,
      message: form.dataset.formMessage || "",
      fields
    };
  }

  function getLocalSubmissions() {
    return safeReadJson(STORAGE_KEYS.localSubmissions, []);
  }

  function storeLocalSubmission(payload) {
    const list = getLocalSubmissions();
    list.unshift({
      ...payload,
      submittedAt: new Date().toISOString(),
      source: "local"
    });
    safeWriteJson(STORAGE_KEYS.localSubmissions, list.slice(0, 400));
  }

  async function submitFormPayload(payload) {
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = await response.json();
      storeLocalSubmission(payload);
      return data;
    } catch (error) {
      storeLocalSubmission(payload);
      return { ok: true, storedLocally: true };
    }
  }

  function setFormStatus(form, text, state) {
    let status = form.querySelector(".form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      form.appendChild(status);
    }

    status.textContent = text;
    status.dataset.state = state || "info";
  }

  function initMultiStepForms() {
    document.querySelectorAll("form[data-multi-step-form]").forEach((form) => {
      const steps = Array.from(form.querySelectorAll(".form-step"));
      if (!steps.length) {
        return;
      }

      let currentStep = 1;

      const render = () => {
        steps.forEach((step) => {
          const stepNum = Number(step.dataset.step || 1);
          step.classList.toggle("hidden", stepNum !== currentStep);
        });

        form.querySelectorAll("[data-step-dot]").forEach((dot) => {
          const stepNum = Number(dot.dataset.stepDot || 1);
          dot.classList.toggle("active", stepNum === currentStep);
        });
      };

      function validateCurrentStep() {
        const activeStep = form.querySelector(`.form-step[data-step="${currentStep}"]`);
        if (!activeStep) {
          return true;
        }

        const fields = Array.from(
          activeStep.querySelectorAll("input, select, textarea")
        ).filter((field) => !field.disabled && field.type !== "button");

        for (const field of fields) {
          if (!field.checkValidity()) {
            field.reportValidity();
            return false;
          }
        }

        return true;
      }

      form.querySelectorAll("[data-step-next]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (!validateCurrentStep()) {
            return;
          }
          currentStep = Math.min(currentStep + 1, steps.length);
          render();
        });
      });

      form.querySelectorAll("[data-step-prev]").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentStep = Math.max(currentStep - 1, 1);
          render();
        });
      });

      render();
    });
  }

  function initSimpleForms() {
    document.querySelectorAll("form[data-form-message]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        const message = form.dataset.formMessage || "Submitted successfully.";
        const redirect = form.dataset.formRedirect || "";

        if (submitButton) {
          submitButton.disabled = true;
        }

        setFormStatus(form, "Submitting...", "loading");

        try {
          const payload = getFormPayload(form);
          await submitFormPayload(payload);
          setFormStatus(form, message, "success");
          form.reset();

          if (redirect) {
            setTimeout(() => {
              navigateTo(redirect);
            }, 400);
          }
        } catch (error) {
          setFormStatus(form, "We could not submit your request right now. Please try again.", "error");
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
          }
        }
      });
    });
  }

  async function submitAuthToApi(mode, payload) {
    const response = await fetch("/api/app-data", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode, ...payload })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.message || `Auth request failed with status ${response.status}`);
    }

    return data;
  }

  function registerLocalUser(payload) {
    const users = safeReadJson(STORAGE_KEYS.users, []);
    const existing = users.find((user) => user.email === payload.email.toLowerCase());

    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const user = {
      id: `u-${Date.now()}`,
      fullName: payload.fullName,
      email: payload.email.toLowerCase(),
      password: payload.password,
      role: payload.role || "professional",
      createdAt: new Date().toISOString()
    };

    users.push(user);
    safeWriteJson(STORAGE_KEYS.users, users);
    return user;
  }

  function loginLocalUser(payload) {
    const users = safeReadJson(STORAGE_KEYS.users, []);
    const user = users.find(
      (item) => item.email === payload.email.toLowerCase() && item.password === payload.password
    );

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    return user;
  }

  function initAuthForms() {
    const authForms = document.querySelectorAll("form[data-auth-form]");
    if (!authForms.length) {
      return;
    }

    authForms.forEach((form) => {
      const mode = form.dataset.authForm;
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const status = form.querySelector("#authMessage") || form.querySelector(".auth-message");
        const formData = new FormData(form);
        const payload = {
          fullName: String(formData.get("full_name") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          password: String(formData.get("password") || "").trim(),
          role: String(formData.get("role") || "professional").toLowerCase()
        };

        if (status) {
          status.textContent = "Processing...";
        }

        try {
          let user;
          if (IS_STATIC_HTML_MODE) {
            if (mode === "register") {
              user = registerLocalUser(payload);
            } else {
              user = loginLocalUser(payload);
            }
          } else {
            const result = await submitAuthToApi(mode, payload);
            if (!result.ok || !result.user) {
              throw new Error(result.message || "Authentication failed");
            }
            user = result.user;
          }

          const session = {
            id: user.id || `u-${Date.now()}`,
            fullName: user.fullName || user.name || "FinReady User",
            email: user.email,
            role: (user.role || "professional").toLowerCase(),
            loggedInAt: new Date().toISOString()
          };

          setSession(session);
          if (status) {
            status.textContent = "Success. Redirecting to dashboard...";
          }

          setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            const next = params.get("next") || "/dashboard";
            navigateTo(next);
          }, 350);
        } catch (error) {
          if (status) {
            status.textContent = error instanceof Error ? error.message : "Authentication failed.";
          }
        }
      });
    });
  }

  const moduleRegistry = [];
  let dashboardModuleLoadingPromise = null;

  function registerModule(initFn) {
    if (typeof initFn === "function") {
      moduleRegistry.push(initFn);
    }
  }

  function runRegisteredModules() {
    moduleRegistry.forEach((initFn) => {
      try {
        initFn();
      } catch (error) {}
    });
  }

  function resolveModuleSrc(fileName) {
    if (IS_STATIC_HTML_MODE) {
      return `assets/js/modules/${fileName}`;
    }
    return `/assets/js/modules/${fileName}`;
  }

  function loadScriptFile(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function loadDashboardModule() {
    const isAdminWorkspace = Boolean(document.body.dataset.adminPage);
    const needsDashboardModule =
      isAdminWorkspace ||
      Boolean(
        document.querySelector(
          [
            ".tool-card",
            ".course-card",
            ".progress-card",
            "#certificateList",
            "#thankYouMessage",
            "#adminLeadsTable",
            "#adminLeadsWorkbenchTable",
            "#adminUsersTable",
            "#payrollRequestsTable",
            "#recruitmentRequestsTable",
            "#analyticsFunnel",
            "[data-dashboard-cards]",
            "form[data-request-form]"
          ].join(", ")
        )
      );

    if (!needsDashboardModule) {
      return;
    }

    if (!dashboardModuleLoadingPromise) {
      dashboardModuleLoadingPromise = loadScriptFile(resolveModuleSrc("dashboard-module.js"))
        .then(() => {
          runRegisteredModules();
          return true;
        })
        .catch(() => false);
    }

    await dashboardModuleLoadingPromise;
  }

  window.FinReadyApp = {
    registerModule,
    runRegisteredModules,
    getSession,
    setSession,
    clearSession,
    isAdminSession,
    navigateTo,
    safeReadJson,
    safeWriteJson,
    slugify,
    STORAGE_KEYS,
    getLocalSubmissions,
    isStaticMode: IS_STATIC_HTML_MODE,
    currentPath: CURRENT_ROUTE_PATH,
    rawPath: CURRENT_PATH,
    reinitToolFilters: initToolFilters,
    reinitCourseFilters: initCourseFilters
  };

  function initSearchShortcut() {
    const input = document.getElementById("globalSearch");
    if (!input) {
      return;
    }

    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      const query = input.value.trim();
      if (!query) {
        navigateTo("/ai-tools");
      } else {
        navigateTo(`/ai-tools?query=${encodeURIComponent(query)}`);
      }
    });
  }

  function initPageQuerySync() {
    const query = new URLSearchParams(window.location.search).get("query");
    const searchInput = document.getElementById("toolSearch");
    if (query && searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event("input"));
    }
  }

  injectSharedLayout();
  ensureSkipLink();
  rewriteLinksForStaticMode();
  injectSeoEnhancements();
  if (IS_STATIC_HTML_MODE) {
    createDefaultAdminIfMissing();
  }
  updateAuthUi();
  initUserMenu();
  setActiveNav();
  initHeaderBehavior();
  initSearchShortcut();
  initScrollReveal();
  initCountUp();
  initTestimonials();
  initToolFilters();
  initUseCaseTabs();
  initAccordion();
  initStickyEnroll();
  initPricingToggle();
  initRoadmap();
  initDemoTool();
  initCourseFilters();
  initLoadMoreCourses();
  initReviewFilter();
  enrichFormsWithTracking();
  initMultiStepForms();
  initSimpleForms();
  initAuthForms();
  initPageQuerySync();
  syncSessionFromServer().finally(() => {
    updateAuthUi();
    loadDashboardModule();
  });
})();
