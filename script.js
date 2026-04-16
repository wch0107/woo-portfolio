(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const header = $(".site-header");
  const nav = $(".nav");
  const toggle = $(".nav-toggle");
  const menu = $("#nav-menu");
  const navLinks = $$(".nav-link");

  const setYear = () => {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  };

  const setHeaderElevate = () => {
    if (!header) return;
    const shouldElevate = window.scrollY > 6;
    header.classList.toggle("is-elevated", shouldElevate);
  };

  const openNav = () => {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "메뉴 닫기");
  };

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "메뉴 열기");
  };

  const toggleNav = () => {
    if (!nav) return;
    const isOpen = nav.classList.contains("is-open");
    if (isOpen) closeNav();
    else openNav();
  };

  const bindNav = () => {
    if (!toggle || !menu || !nav) return;

    toggle.addEventListener("click", toggleNav);

    navLinks.forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      const clickedInside = nav.contains(target);
      if (!clickedInside) closeNav();
    });
  };

  const bindActiveSection = () => {
    if (!navLinks.length) return;

    const ids = navLinks
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && href.startsWith("#"))
      .map((href) => href.slice(1));

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const byId = new Map(navLinks.map((a) => [a.getAttribute("href")?.slice(1), a]));

    const setActive = (id) => {
      navLinks.forEach((a) => a.classList.remove("is-active"));
      const active = byId.get(id);
      if (active) active.classList.add("is-active");
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActive(visible.target.id);
      },
      { root: null, threshold: [0.2, 0.4, 0.6], rootMargin: "-20% 0px -65% 0px" }
    );

    sections.forEach((s) => io.observe(s));
  };

  const bindContactForm = () => {
    const form = $("#contact-form");
    if (!(form instanceof HTMLFormElement)) return;

    const nameEl = $("#name", form);
    const emailEl = $("#email", form);
    const msgEl = $("#message", form);
    const resultEl = $("#form-result");

    const hint = {
      name: $("#hint-name", form),
      email: $("#hint-email", form),
      message: $("#hint-message", form),
    };

    const setFieldState = (fieldEl, hintEl, message) => {
      const wrapper = fieldEl?.closest?.(".field");
      if (!(wrapper instanceof HTMLElement)) return;
      const hasError = Boolean(message);
      wrapper.classList.toggle("is-error", hasError);
      if (hintEl) hintEl.textContent = message ?? "";
    };

    const isEmailValid = (value) => {
      // Pragmatic email check (UI hint only)
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
    };

    const read = () => ({
      name: nameEl instanceof HTMLInputElement ? nameEl.value.trim() : "",
      email: emailEl instanceof HTMLInputElement ? emailEl.value.trim() : "",
      message: msgEl instanceof HTMLTextAreaElement ? msgEl.value.trim() : "",
    });

    const validate = () => {
      const v = read();
      const errors = {};

      if (!v.name) errors.name = "이름을 입력해 주세요.";
      else if (v.name.length < 2) errors.name = "이름은 2글자 이상이 좋아요.";

      if (!v.email) errors.email = "이메일을 입력해 주세요.";
      else if (!isEmailValid(v.email)) errors.email = "이메일 형식이 올바르지 않아요.";

      if (!v.message) errors.message = "메시지를 입력해 주세요.";
      else if (v.message.length < 10) errors.message = "메시지는 10자 이상이면 좋아요.";

      setFieldState(nameEl, hint.name, errors.name);
      setFieldState(emailEl, hint.email, errors.email);
      setFieldState(msgEl, hint.message, errors.message);

      return { ok: Object.keys(errors).length === 0, values: v, errors };
    };

    const buildMailto = ({ name, email, message }) => {
      const to = "hello@example.com";
      const subject = encodeURIComponent(`[Portfolio] ${name} 님의 문의`);
      const body = encodeURIComponent(
        `이름: ${name}\n회신 이메일: ${email}\n\n메시지:\n${message}\n`
      );
      return `mailto:${to}?subject=${subject}&body=${body}`;
    };

    const onInput = () => {
      validate();
      if (resultEl) resultEl.textContent = "";
    };

    ["input", "blur"].forEach((evt) => {
      nameEl?.addEventListener?.(evt, onInput, { passive: true });
      emailEl?.addEventListener?.(evt, onInput, { passive: true });
      msgEl?.addEventListener?.(evt, onInput, { passive: true });
    });

    form.addEventListener("reset", () => {
      setTimeout(() => {
        setFieldState(nameEl, hint.name, "");
        setFieldState(emailEl, hint.email, "");
        setFieldState(msgEl, hint.message, "");
        if (resultEl) resultEl.textContent = "";
      }, 0);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const res = validate();

      if (!resultEl) return;

      if (!res.ok) {
        resultEl.textContent = "입력 값을 확인해 주세요.";
        return;
      }

      const mailto = buildMailto(res.values);
      resultEl.innerHTML = `준비 완료! <a href="${mailto}">메일 앱 열기</a> (데모: 실제 전송은 메일 앱에서 진행돼요)`;
    });
  };

  setYear();
  setHeaderElevate();
  bindNav();
  bindActiveSection();
  bindContactForm();

  window.addEventListener("scroll", setHeaderElevate, { passive: true });
})();
