/* ═══════════════════════════════════════════════════════════════
   SANKET SARAF — VANILLA JS
   Replaces: Framer Motion, next-themes, React state & effects
   Uses: GSAP + ScrollTrigger (CDN), IntersectionObserver, RAF
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════
     1. LOADER
  ═══════════════════════════════════════ */
  (function initLoader() {
    const loader     = document.getElementById('loader');
    const percentEl  = document.getElementById('loaderPercent');
    const barEl      = document.getElementById('loaderBar');
    const TOTAL_MS   = 1800;
    const START      = performance.now();
    let raf;

    function tick(now) {
      const elapsed = now - START;
      const raw     = Math.min(elapsed / TOTAL_MS, 1);
      // Quadratic ease-out: fast start, slows near 100 %
      const eased   = 1 - Math.pow(1 - raw, 2);
      const pct     = Math.floor(eased * 100);

      percentEl.textContent = pct + '%';
      barEl.style.width     = pct + '%';

      if (elapsed < TOTAL_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        percentEl.textContent = '100%';
        barEl.style.width     = '100%';
        // 500 ms pause at 100 %, then slide out
        setTimeout(() => {
          window.scrollTo(0, 0);
          loader.classList.add('exit');
          loader.addEventListener('transitionend', () => {
            loader.style.display = 'none';
          }, { once: true });
        }, 500);
      }
    }

    raf = requestAnimationFrame(tick);
  })();


  /* ═══════════════════════════════════════
     2. CUSTOM CURSOR  (fine-pointer only)
  ═══════════════════════════════════════ */
  (function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = document.getElementById('cursor');
    cursor.style.display = 'block';

    let mouseX = -100, mouseY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      const isInteractive =
        t.tagName === 'A' ||
        t.tagName === 'BUTTON' ||
        !!t.closest('a') ||
        !!t.closest('button');
      cursor.classList.toggle('hovering', isInteractive);
    });
  })();


  /* ═══════════════════════════════════════
     3. NAVBAR — scroll spy + smooth anchors
  ═══════════════════════════════════════ */
  (function initNavbar() {
    const navLinks    = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const hamburger   = document.getElementById('hamburgerBtn');
    const mobileMenu  = document.getElementById('mobileMenu');
    const iconMenu    = document.getElementById('iconMenu');
    const iconClose   = document.getElementById('iconClose');

    // Section → nav-id mapping (matches original sectionMap in DOM order)
    const sectionMap = {
      'top':             'hero',
      'projects-sticky': 'projects',
      'about':           'about',
      'frames':          'projects',
      'education':       'experience',
      'expertise':       'projects',
      'experience':      'experience',
      'awards':          'experience',
      'research':        'research',
      'contact':         'contact',
    };

    function setActive(navId) {
      navLinks.forEach(a => {
        const active = a.dataset.nav === navId;
        a.classList.toggle('active', active);
      });
      mobileLinks.forEach(a => {
        const active = a.dataset.nav === navId;
        a.classList.toggle('active', active);
      });
    }

    // Scroll spy
    function onScroll() {
      const pos = window.scrollY + 140;
      for (const [sid, navId] of Object.entries(sectionMap)) {
        const el = document.getElementById(sid);
        if (!el) continue;
        if (pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
          setActive(navId);
          break;
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Smooth scroll on nav click
    function smoothTo(anchor) {
      if (anchor === 'top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const el = document.getElementById(anchor);
      if (!el) return;
      const offset = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    navLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        setActive(a.dataset.nav);
        smoothTo(a.dataset.nav === 'hero' ? 'top' : getAnchorForNav(a.dataset.nav));
      });
    });

    mobileLinks.forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        closeMobile();
        setTimeout(() => {
          const anchor = a.getAttribute('href').replace('#', '');
          smoothTo(anchor);
        }, 50);
      });
    });

    function getAnchorForNav(navId) {
      const map = { hero: 'top', about: 'about', projects: 'work', research: 'research', experience: 'experience', contact: 'contact' };
      return map[navId] || navId;
    }

    // Hamburger toggle
    let menuOpen = false;

    function openMobile() {
      menuOpen = true;
      mobileMenu.classList.add('open');
      mobileMenu.style.height = mobileMenu.scrollHeight + 'px';
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close menu');
      iconMenu.style.display  = 'none';
      iconClose.style.display = 'block';
    }

    function closeMobile() {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      mobileMenu.style.height = '0';
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      iconMenu.style.display  = 'block';
      iconClose.style.display = 'none';
    }

    hamburger.addEventListener('click', () => {
      if (menuOpen) closeMobile(); else openMobile();
    });
  })();


  /* ═══════════════════════════════════════
     4. HERO — count-up animation
  ═══════════════════════════════════════ */
  (function initHeroCountUp() {
    function countUp(el, targetStr, duration) {
      const target = parseInt(targetStr);
      if (isNaN(target)) return;
      const suffix = targetStr.replace(String(target), '');
      const start  = performance.now();

      function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = targetStr;
      }
      requestAnimationFrame(update);
    }

    const statsCard     = document.querySelector('.stats-card-new');
    const statProjects  = document.getElementById('stat-val-projects');
    const statPapers    = document.getElementById('stat-val-papers');

    if (!statsCard || !statProjects || !statPapers) return;

    const projectsTarget = statProjects.textContent.trim();
    const papersTarget   = statPapers.textContent.trim();

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        countUp(statProjects, projectsTarget, 1200);
        countUp(statPapers,   papersTarget,   1200);
        obs.disconnect();
      }
    }, { threshold: 0.3 });

    obs.observe(statsCard);
  })();


  /* ═══════════════════════════════════════
     5. HERO — 3D mouse parallax on BG image
  ═══════════════════════════════════════ */
  (function initHeroParallax() {
    const section = document.getElementById('top');
    const bgImg   = document.querySelector('.hero-bg-character');
    if (!section || !bgImg) return;

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      bgImg.style.transform =
        `scale(1.08) translateX(${x * 20}px) translateY(${y * 20}px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
    });

    section.addEventListener('mouseleave', () => {
      bgImg.style.transform = 'scale(1.05) translate(0,0) rotateY(0deg) rotateX(0deg)';
    });
  })();


  /* ═══════════════════════════════════════
     6. SCROLL REVEAL — IntersectionObserver
        Replaces Framer Motion whileInView
  ═══════════════════════════════════════ */
  (function initScrollReveal() {
    const els = document.querySelectorAll('.fade-up-el');

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '-40px 0px' });

    els.forEach(el => obs.observe(el));
  })();


  /* ═══════════════════════════════════════
     7. GSAP — Project sticky cards scale
        + progress bar
        Waits for GSAP to load from CDN
  ═══════════════════════════════════════ */
  (function initGSAP() {
    let attempts = 0;

    function tryInit() {
      attempts++;
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        if (attempts < 30) setTimeout(tryInit, 200);
        return;
      }

      // Skip GSAP effects on mobile
      if (window.innerWidth <= 768) return;

      gsap.registerPlugin(ScrollTrigger);

      const cards    = gsap.utils.toArray('.project-card');
      const progress = document.getElementById('projectsProgress');
      const section  = document.getElementById('projects-sticky');

      // Scale each card down as the next one scrolls on top
      cards.forEach((card, i) => {
        if (i < cards.length - 1) {
          gsap.to(card, {
            scale: 0.90,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top top',
              end: '+=100%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }
      });

      // Progress bar
      if (progress && section) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            progress.style.width = (self.progress * 100) + '%';
          },
        });
      }
    }

    tryInit();
  })();


  /* ═══════════════════════════════════════
     8. GALLERY — parallax scroll
        Replaces Framer Motion useScroll + useTransform
        Row 1: 0% → -20%  |  Row 2: -20% → 0%
  ═══════════════════════════════════════ */
  (function initGalleryParallax() {
    const section = document.getElementById('frames');
    const row1    = document.getElementById('galleryRow1');
    const row2    = document.getElementById('galleryRow2');
    if (!section || !row1 || !row2) return;

    // Set row2 initial offset (-20% of its own width)
    row2.style.transform = 'translateX(-20%)';

    function update() {
      const rect     = section.getBoundingClientRect();
      const vh       = window.innerHeight;
      // progress: 0 when section bottom enters viewport, 1 when top leaves
      const total    = rect.height + vh;
      const elapsed  = vh - rect.top;
      const progress = Math.min(Math.max(elapsed / total, 0), 1);

      // Row 1: translateX from 0% to -20%
      const x1 = progress * -20;
      // Row 2: translateX from -20% to 0%
      const x2 = -20 + progress * 20;

      row1.style.transform = `translateX(${x1}%)`;
      row2.style.transform = `translateX(${x2}%)`;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  })();


  /* ═══════════════════════════════════════
     9. SKILL BAR ANIMATIONS
        Triggers width when section is visible
  ═══════════════════════════════════════ */
  (function initSkillBars() {
    const profSection = document.getElementById('proficiencySection');
    if (!profSection) return;

    const fills = profSection.querySelectorAll('.skill-fill');
    let animated = false;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        fills.forEach((fill, i) => {
          const target = fill.dataset.width;
          setTimeout(() => {
            fill.style.width = target + '%';
          }, i * 70);
        });
        obs.disconnect();
      }
    }, { threshold: 0.3 });

    obs.observe(profSection);
  })();


  /* ═══════════════════════════════════════
     10. NAV LOGO smooth scroll
  ═══════════════════════════════════════ */
  (function initLogoClick() {
    const logo = document.getElementById('navLogo');
    if (!logo) return;
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

})();
