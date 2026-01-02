/* =========================================================
   Qahwaji Taif - Main JS (All Pages)
   Works with the template classes:
   .mobile-menu-toggle, header nav, .scroll-to-top
   Form IDs: #name #phone #service #message
   WhatsApp: +966507712688
   ========================================================= */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const isRTL = () => document.documentElement.dir === "rtl";
  const normalizePath = (p) => (p || "").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // ---------- Config ----------
  const WHATSAPP_NUMBER = "966507712688"; // without +
  const MIN_SCROLL_TOP_SHOW = 450;

  // ---------- Mobile Menu ----------
  const menuBtn = $(".mobile-menu-toggle");
  const nav = $("header nav");

  const openMenu = () => {
    if (!nav) return;
    nav.classList.add("mobile-active");
    menuBtn?.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove("mobile-active");
    menuBtn?.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    if (!nav) return;
    nav.classList.toggle("mobile-active");
    const expanded = nav.classList.contains("mobile-active");
    menuBtn?.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  if (menuBtn && nav) {
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("mobile-active")) return;

      const target = e.target;
      const clickedInsideNav = nav.contains(target);
      const clickedMenuBtn = menuBtn.contains(target);

      if (!clickedInsideNav && !clickedMenuBtn) closeMenu();
    });

    // Close menu on link click (mobile)
    $$("a", nav).forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 768px)").matches) closeMenu();
      });
    });

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // ---------- Smooth Scroll for in-page anchors ----------
  // e.g. #services
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // small offset fix if you use sticky header
      // (optional) could be added by CSS scroll-margin-top
    });
  });

  // ---------- Scroll To Top ----------
  const scrollBtn = $(".scroll-to-top");
  const updateScrollBtn = () => {
    if (!scrollBtn) return;
    if (window.scrollY > MIN_SCROLL_TOP_SHOW) scrollBtn.classList.add("show");
    else scrollBtn.classList.remove("show");
  };

  if (scrollBtn) {
    updateScrollBtn();
    window.addEventListener("scroll", updateScrollBtn, { passive: true });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---------- Active Nav Link (highlight current page) ----------
  // Adds class "active" to <a> that matches current page.
  const setActiveNavLink = () => {
    if (!nav) return;

    const current = normalizePath(window.location.pathname);
    const links = $$("a[href]", nav);

    // Remove previous active
    links.forEach((l) => l.classList.remove("active"));

    // Try exact match first
    let matched = links.find((l) => normalizePath(l.getAttribute("href")) === current);

    // Fallback: if home
    if (!matched && (current === "/" || current.endsWith("/index.html"))) {
      matched = links.find((l) => /index\.html$/i.test(l.getAttribute("href") || "")) || links[0];
    }

    // Fallback: partial (e.g. /blog/post.html -> blog.html)
    if (!matched) {
      matched = links.find((l) => current.includes(normalizePath(l.getAttribute("href"))));
    }

    matched?.classList.add("active");
  };
  setActiveNavLink();

  // ---------- Contact Form -> WhatsApp ----------
  // Works on any page containing these IDs.
  const nameEl = $("#name");
  const phoneEl = $("#phone");
  const serviceEl = $("#service");
  const messageEl = $("#message");

  const sanitizePhone = (value) => (value || "").replace(/[^\d+]/g, "").trim();

  const validateForm = () => {
    const name = (nameEl?.value || "").trim();
    const phone = sanitizePhone(phoneEl?.value);
    const service = (serviceEl?.value || "").trim();
    const msg = (messageEl?.value || "").trim();

    const errors = [];
    if (name.length < 2) errors.push("اكتب الاسم بشكل صحيح.");
    if (phone.length < 9) errors.push("اكتب رقم الجوال بشكل صحيح.");
    if (!service) errors.push("اختر نوع المناسبة.");
    if (msg.length < 5) errors.push("اكتب تفاصيل مختصرة (الموقع + الموعد).");

    return { ok: errors.length === 0, errors, data: { name, phone, service, msg } };
  };

  // This function name is used by your button onclick="sendToWhatsapp()"
  window.sendToWhatsapp = function sendToWhatsapp() {
    const { ok, errors, data } = validateForm();

    if (!ok) {
      alert(errors.join("\n"));
      return;
    }

    const lines = [
      "طلب جديد من موقع قهوجي الطائف:",
      `الاسم: ${data.name}`,
      `الجوال: ${data.phone}`,
      `نوع المناسبة: ${data.service}`,
      `التفاصيل: ${data.msg}`,
      `الصفحة: ${window.location.href}`
    ];

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    window.open(url, "_blank", "noopener");
  };

  // ---------- Optional: Add scroll-margin-top to sections (sticky header friendly) ----------
  // If you use sticky header, anchors can hide under it.
  // This sets a safe margin top on sections with ids.
  const applyScrollMargin = () => {
    // approximate header height (dynamic)
    const header = $("header");
    const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    const margin = Math.max(72, headerH + 12);

    $$("[id]").forEach((el) => {
      // only apply to major sections, not every tiny element:
      if (el.tagName.toLowerCase() === "section" || el.classList.contains("section")) {
        el.style.scrollMarginTop = `${margin}px`;
      }
    });
  };
  applyScrollMargin();
  window.addEventListener("resize", applyScrollMargin);

})();
/* =========================
   Global Settings
   ========================= */
(function () {
  "use strict";

  const WHATSAPP_NUMBER = "966507712688";

  /* =========================
     Mobile Menu Toggle
     ========================= */
  const toggleBtn = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector("header nav");

  function closeMobileMenu() {
    if (!nav) return;
    nav.classList.remove("mobile-active");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
  }

  function toggleMobileMenu() {
    if (!nav) return;
    const isOpen = nav.classList.toggle("mobile-active");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", String(isOpen));
  }

  if (toggleBtn && nav) {
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.addEventListener("click", toggleMobileMenu);

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      const clickedInsideHeader = e.target.closest("header");
      if (!clickedInsideHeader && nav.classList.contains("mobile-active")) {
        closeMobileMenu();
      }
    });

    // Close menu on any nav link click (mobile UX)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      closeMobileMenu();
    });
  }

  /* =========================
     Smooth Scroll for Hash Links
     ========================= */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute("href");
    if (!id || id.length < 2) return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    closeMobileMenu();

    // scroll with offset (header sticky)
    const header = document.querySelector("header");
    const headerH = header ? header.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 10;

    window.scrollTo({ top: y, behavior: "smooth" });
  });

  /* =========================
     Scroll To Top Button
     ========================= */
  const scrollBtn = document.querySelector(".scroll-to-top");

  function onScroll() {
    if (!scrollBtn) return;
    if (window.scrollY > 450) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  }

  if (scrollBtn) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* =========================
     Header Shadow on Scroll (optional polish)
     ========================= */
  const header = document.querySelector("header");
  if (header) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 6) {
          header.style.boxShadow = "0 10px 30px rgba(15,23,42,0.08)";
        } else {
          header.style.boxShadow = "none";
        }
      },
      { passive: true }
    );
  }

  /* =========================
     WhatsApp Form Sender
     Works on:
       - contact.html
       - index.html (if you have same IDs)
   ========================= */
  window.sendToWhatsapp = function sendToWhatsapp() {
    // Try to read fields if exist
    const name = (document.getElementById("name")?.value || "").trim();
    const phone = (document.getElementById("phone")?.value || "").trim();
    const service = (document.getElementById("service")?.value || "").trim();
    const location = (document.getElementById("location")?.value || "").trim();
    const date = (document.getElementById("date")?.value || "").trim();
    const message = (document.getElementById("message")?.value || "").trim();

    // Basic validation (only if fields exist on the page)
    const requiredIds = ["name", "phone", "service", "message"];
    const requiredMissing = requiredIds
      .filter((id) => document.getElementById(id))
      .some((id) => !(document.getElementById(id).value || "").trim());

    if (requiredMissing) {
      alert("فضلاً عبّئ الحقول المطلوبة ثم اضغط إرسال.");
      return;
    }

    // Build WhatsApp message (clean and conversion-focused)
    const lines = [
      "طلب حجز — قهوجي الطائف",
      "-------------------------",
      name ? `الاسم: ${name}` : null,
      phone ? `الجوال: ${phone}` : null,
      service ? `نوع المناسبة: ${service}` : null,
      location ? `الموقع داخل الطائف: ${location}` : null,
      date ? `الموعد: ${date}` : null,
      message ? `التفاصيل: ${message}` : null,
      "-------------------------",
      "تم الإرسال من الموقع."
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;

    // Open WhatsApp
    window.open(url, "_blank", "noopener");
  };
})();
/* =========================
   Article TOC + Reading Progress
   ========================= */
(function () {
  const article = document.querySelector("#article");
  const tocBox = document.getElementById("toc");
  const progress = document.querySelector(".read-progress");

  // TOC
  if (article && tocBox) {
    const headings = article.querySelectorAll("h2, h3");
    if (headings.length) {
      const frag = document.createDocumentFragment();
      headings.forEach((h, idx) => {
        if (!h.id) h.id = `sec-${idx + 1}`;
        const a = document.createElement("a");
        a.href = `#${h.id}`;
        a.textContent = h.textContent;
        a.style.marginBottom = ".55rem";
        a.style.display = "block";
        a.style.fontSize = (h.tagName.toLowerCase() === "h3") ? ".92rem" : ".98rem";
        a.style.opacity = (h.tagName.toLowerCase() === "h3") ? ".9" : "1";
        frag.appendChild(a);
      });
      tocBox.appendChild(frag);
    } else {
      tocBox.innerHTML = "<small>لا توجد عناوين كافية لعرضها.</small>";
    }
  }

  // Progress bar
  if (article && progress) {
    const onScroll = () => {
      const rect = article.getBoundingClientRect();
      const articleTop = window.scrollY + rect.top;
      const articleHeight = article.offsetHeight;
      const scrollPos = window.scrollY - articleTop + 120;
      const pct = Math.max(0, Math.min(100, (scrollPos / articleHeight) * 100));
      progress.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
