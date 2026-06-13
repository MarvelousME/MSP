(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-menu a");

  // Header scroll state
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Mobile navigation toggle
  navToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Guard when CDN is unavailable
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) {
    document.querySelectorAll(".metric-value").forEach((el) => {
      el.textContent = formatMetric(Number(el.dataset.count || 0));
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Split hero heading into animated words
  document.querySelectorAll(".split-heading").forEach((heading) => {
    const words = heading.textContent.trim().split(/\s+/);
    heading.textContent = "";
    words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word + " ";
      span.style.display = "inline-block";
      heading.appendChild(span);
    });
  });

  // Hero word reveal animation
  gsap.from(".hero-title .word", {
    yPercent: 110,
    opacity: 0,
    rotateX: -60,
    transformOrigin: "50% 100%",
    duration: 1,
    ease: "power4.out",
    stagger: 0.045
  });

  // Standard scroll reveals
  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.from(el, {
      y: 42,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
        once: true
      }
    });
  });

  // Scale-in reveals
  gsap.utils.toArray(".reveal-scale").forEach((el) => {
    gsap.from(el, {
      y: 30,
      scale: 0.94,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 82%",
        once: true
      }
    });
  });

  // 3D hero visual movement
  gsap.to(".horse-card", {
    rotateY: 10,
    rotateX: -2,
    y: -28,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // Parallax race-track background
  gsap.to(".track-lines", {
    y: -120,
    opacity: 0.82,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true
    }
  });

  // Floating badges and visual elements
  gsap.to(".floating-badge", {
    y: -18,
    rotation: 4,
    duration: 2.6,
    ease: "sine.inOut",
    stagger: 0.25,
    repeat: -1,
    yoyo: true
  });

  gsap.to(".dashboard-float", {
    y: 16,
    rotation: -1.5,
    duration: 3,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });

  // Counter animation
  document.querySelectorAll(".metric-value").forEach((el) => {
    const target = Number(el.dataset.count || 0);

    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        const proxy = { value: 0 };
        gsap.to(proxy, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = formatMetric(Math.round(proxy.value));
          }
        });
      }
    });
  });

  // Premium tilt-card micro-interactions
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformOrigin: "center",
        duration: 0.32,
        ease: "power2.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.45,
        ease: "power3.out"
      });
    });
  });

  // Dashboard chart reveal
  gsap.from(".chart-bars i", {
    height: 0,
    duration: 1,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: {
      trigger: ".mock-dashboard",
      start: "top 78%",
      once: true
    }
  });

  function formatMetric(value) {
    if (value >= 1000000) {
      const millions = value / 1000000;
      return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
    }

    if (value >= 1000) {
      const thousands = value / 1000;
      return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}K`;
    }

    return new Intl.NumberFormat("en-ZA").format(value);
  }
})();
