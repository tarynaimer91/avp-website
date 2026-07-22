const header = document.getElementById("site-header");
const navToggle = document.getElementById("nav-toggle");
const primaryNav = document.getElementById("primary-nav");
const currentYear = document.getElementById("current-year");

function updateHeader() {
  if (!header) return;

  if (window.scrollY > 24) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

function closeMenu() {
  if (!navToggle || !primaryNav) return;

  navToggle.classList.remove("active");
  primaryNav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("menu-open");
}

function toggleMenu() {
  if (!navToggle || !primaryNav) return;

  const isOpen = primaryNav.classList.toggle("open");

  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );

  document.body.classList.toggle("menu-open", isOpen);
}

if (navToggle) {
  navToggle.addEventListener("click", toggleMenu);
}

if (primaryNav) {
  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px"
    }
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

const internalLinks = document.querySelectorAll('a[href^="#"]');

internalLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    const headerOffset = header ? header.offsetHeight : 0;
    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }
});

/* Progressive interaction layer */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const scrollProgress = document.createElement("div");
scrollProgress.className = "scroll-progress";
scrollProgress.setAttribute("aria-hidden", "true");
document.body.appendChild(scrollProgress);

function updateScrollEffects() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(1, progress)})`;

  if (!prefersReducedMotion) {
    document.documentElement.style.setProperty(
      "--page-shift",
      `${Math.min(window.scrollY * 0.055, 48)}px`
    );
  }
}

window.addEventListener("scroll", updateScrollEffects, { passive: true });
updateScrollEffects();

const interactiveCards = document.querySelectorAll(
  ".capability-card, .engagement-card, .difference-item"
);

interactiveCards.forEach((card) => {
  card.classList.add("interactive-card");

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty("--spot-x", `${x}px`);
    card.style.setProperty("--spot-y", `${y}px`);

    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const rotateX = ((y / rect.height) - 0.5) * -3.5;
    const rotateY = ((x / rect.width) - 0.5) * 3.5;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("transform");
  });
});

if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelectorAll(".button, .nav-cta").forEach((button) => {
    button.classList.add("magnetic");

    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.removeProperty("transform");
    });
  });
}

const trackedSections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');

if ("IntersectionObserver" in window && trackedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!current) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active-section",
          link.getAttribute("href") === `#${current.target.id}`
        );
      });
    },
    { rootMargin: "-25% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] }
  );

  trackedSections.forEach((section) => sectionObserver.observe(section));
}
