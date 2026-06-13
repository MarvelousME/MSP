(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-menu a");

  // Header scroll state
  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 14);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Mobile menu
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
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // No-animation fallback
  if (reducedMotion || !window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll(".counter").forEach((counter) => {
      counter.textContent = formatCounter(Number(counter.dataset.count || 0), counter.dataset.count === "583");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Split heading into animated words
  document.querySelectorAll(".split-heading").forEach((heading) => {
    const words = heading.textContent.trim().split(/\s+/);
    heading.textContent = "";

    words.forEach((word) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = `${word} `;
      span.style.display = "inline-block";
      heading.appendChild(span);
    });
  });

  // Hero heading animation
  gsap.from(".hero-title .word", {
    opacity: 0,
    yPercent: 120,
    rotateX: -72,
    transformOrigin: "50% 100%",
    duration: 1,
    ease: "power4.out",
    stagger: 0.045
  });

  // Scroll reveal
  gsap.utils.toArray(".reveal-up").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      y: 48,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 86%",
        once: true
      }
    });
  });

  // Scale reveal
  gsap.utils.toArray(".reveal-scale").forEach((element) => {
    gsap.from(element, {
      opacity: 0,
      scale: 0.92,
      y: 28,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
        once: true
      }
    });
  });

  // Hero image parallax
  gsap.to(".hero-image", {
    scale: 1.09,
    yPercent: 5,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // Photo finish 3D scroll
  gsap.to(".photo-finish", {
    y: -30,
    rotateY: -8,
    rotateX: 5,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // Track background parallax
  gsap.to(".track-perspective", {
    y: -140,
    opacity: 0.58,
    ease: "none",
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: true
    }
  });

  // Finish meter pulse
  gsap.to(".finish-meter i", {
    width: "98%",
    duration: 1.35,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });

  // Dashboard chart bars
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

  // Counters
  document.querySelectorAll(".counter").forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    const isPercent = target === 583;

    ScrollTrigger.create({
      trigger: counter,
      start: "top 90%",
      once: true,
      onEnter: () => {
        const proxy = { value: 0 };

        gsap.to(proxy, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            counter.textContent = formatCounter(Math.round(proxy.value), isPercent);
          }
        });
      }
    });
  });

  // Card tilt
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      gsap.to(card, {
        rotateX: ((y / rect.height) - 0.5) * -8,
        rotateY: ((x / rect.width) - 0.5) * 8,
        transformPerspective: 900,
        transformOrigin: "center",
        duration: 0.28,
        ease: "power2.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.42,
        ease: "power3.out"
      });
    });
  });

  function formatCounter(value, isPercent) {
    if (isPercent) {
      return (value / 100).toFixed(2);
    }

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
