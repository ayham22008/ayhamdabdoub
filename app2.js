/* =============================================================
   WAR OF KNOWLEDGE — app2.js
   Vanilla JS only. No frameworks, no build step.
   Sections:
     1. Loader
     2. Particle background canvas
     3. AOS init
     4. Header scroll state + scroll progress bar
     5. Mobile nav toggle
     6. Gameplay loop diagram interactions
     7. Gallery filtering
     8. Animated counters (results + educational focus)
     9. Three.js 3D model viewer (rotate / reset / fullscreen)
     10. Back-to-top button
     11. Footer year
============================================================= */

(() => {
  'use strict';

  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     1. LOADER
     Hides the intro loader once the page has painted, so the
     hero animation feels like a deliberate reveal rather than
     a blank flash.
  ----------------------------------------------------------- */
  function initLoader() {
    const loader = document.getElementById('wokLoader');
    if (!loader) return;
    const hide = () => loader.classList.add('loaded');
    window.addEventListener('load', () => setTimeout(hide, 900));
    // Safety net: never trap the user behind the loader
    setTimeout(hide, 3500);
  }

  /* -----------------------------------------------------------
     2. PARTICLE BACKGROUND CANVAS
     Lightweight floating-particle field (emerald/gold dust)
     drawn on a full-viewport canvas behind all content.
     Pauses when the tab is hidden and respects reduced motion.
  ----------------------------------------------------------- */
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles, rafId;
    const COLORS = ['rgba(0,255,136,', 'rgba(198,166,100,'];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createParticles() {
      const count = Math.min(70, Math.floor((width * height) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        alpha: Math.random() * 0.5 + 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.fill();
      });
      rafId = requestAnimationFrame(tick);
    }

    resize();
    createParticles();
    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    if (prefersReducedMotion) {
      // Draw a single static frame instead of animating forever
      tick();
      cancelAnimationFrame(rafId);
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        tick();
      }
    });

    tick();
  }

  /* -----------------------------------------------------------
     3. AOS INIT
  ----------------------------------------------------------- */
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: prefersReducedMotion
    });
  }

  /* -----------------------------------------------------------
     4. HEADER SCROLL STATE + PROGRESS BAR
  ----------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.getElementById('wokHeader');
    const progress = document.getElementById('scrollProgress');
    if (!header) return;

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      header.style.borderBottomColor =
        scrollTop > 40 ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.06)';

      if (progress) progress.style.width = pct + '%';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -----------------------------------------------------------
     5. MOBILE NAV TOGGLE
  ----------------------------------------------------------- */
  function initNavToggle() {
    const burger = document.getElementById('navBurger');
    const links = document.getElementById('navLinks');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -----------------------------------------------------------
     6. GAMEPLAY LOOP DIAGRAM
     Clicking a node highlights it and swaps the explanatory
     text below the diagram — a lightweight interactive
     flow-diagram without any external charting library.
  ----------------------------------------------------------- */
  function initLoopDiagram() {
    const nodes = document.querySelectorAll('.loop-node');
    const detail = document.getElementById('loopDetail');
    if (!nodes.length || !detail) return;

    const STEP_COPY = {
      1: 'Choose Territory — scout the hex-grid map of Wisdom Land and pick a tile worth fighting for. Contested tiles offer bigger rewards but harder questions.',
      2: 'Answer Question — a question themed to your kingdom appears. Speed and accuracy both feed into your final score for the exchange.',
      3: 'Claim or Lose Ground — win, and the tile is painted in your kingdom colors. Lose, and it may fall to a rival or return to neutral ground.',
      4: 'Earn Rewards — correct streaks generate scrolls, coins, and cosmetic unlocks that carry over between sessions.',
      5: 'Level Up Kingdom — accumulated territory and rewards raise your kingdom\'s level, unlocking new abilities and story chapters.'
    };

    function setActive(node) {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const step = node.getAttribute('data-step');
      detail.innerHTML = `<p><strong>Step ${step}.</strong> ${STEP_COPY[step]}</p>`;
    }

    nodes.forEach(node => {
      node.addEventListener('click', () => setActive(node));
      node.addEventListener('mouseenter', () => setActive(node));
    });

    // Auto-cycle once on load so the diagram doesn't sit static,
    // unless the user prefers reduced motion.
    if (!prefersReducedMotion) {
      let i = 0;
      const auto = setInterval(() => {
        if (document.querySelector('.loop-node:hover')) return; // don't fight the user
        setActive(nodes[i % nodes.length]);
        i++;
        if (i >= nodes.length) clearInterval(auto);
      }, 2200);
    } else {
      setActive(nodes[0]);
    }
  }

  /* -----------------------------------------------------------
     7. GALLERY FILTERING
  ----------------------------------------------------------- */
  function initGalleryFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    if (!buttons.length || !items.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        items.forEach(item => {
          const match = filter === 'all' || item.getAttribute('data-category') === filter;
          item.classList.toggle('hidden', !match);
        });
      });
    });
  }

  /* -----------------------------------------------------------
     8. ANIMATED COUNTERS
     Drives both the Results counters and the Educational
     Focus percentage stats. Uses IntersectionObserver so the
     count-up only fires once each element scrolls into view.
  ----------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('.counter, .edu-percent');
    if (!counters.length) return;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const isPercent = el.classList.contains('edu-percent');
      const duration = 1400;
      const startTime = performance.now();

      if (prefersReducedMotion) {
        el.textContent = target + (isPercent ? '%' : '');
        return;
      }

      function frame(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        const value = Math.floor(eased * target);
        el.textContent = value + (isPercent ? '%' : '');
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* -----------------------------------------------------------
     9. THREE.JS 3D MODEL VIEWER
     A lightweight orbiting viewer for hero props. Since real
     .glb assets aren't bundled with this scaffold, each option
     renders a distinct procedural placeholder mesh built to
     roughly evoke the named prop (emblem / sword / codex) —
     swap the buildX() functions for GLTFLoader calls once the
     real exported models are dropped into /assets/models/.
  ----------------------------------------------------------- */
  function initModelViewer() {
    const canvas = document.getElementById('warModelCanvas');
    const container = document.getElementById('modelCanvasContainer');
    const wrap = document.querySelector('.model-viewer-wrap');
    const select = document.getElementById('modelSelect');
    const resetBtn = document.getElementById('modelResetBtn');
    const fullscreenBtn = document.getElementById('modelFullscreenBtn');
    const loadingEl = document.getElementById('modelLoading');
    if (!canvas || typeof THREE === 'undefined') return;

    let renderer, scene, camera, currentMesh, rafId;
    let rotationY = 0.6, rotationX = -0.15;
    let isDragging = false, lastX = 0, lastY = 0;
    let autoRotate = true;
    let zoom = 6;

    function init() {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, zoom);

      const keyLight = new THREE.DirectionalLight(0x00ff88, 1.1);
      keyLight.position.set(3, 4, 5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xC6A664, 0.9);
      rimLight.position.set(-4, -2, -3);
      scene.add(rimLight);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      resize();
      loadModel('emblem');
      animate();

      window.addEventListener('resize', resize);
    }

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    /* ---- Procedural placeholder builders ---- */
    function buildEmblem() {
      const group = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.4, 0.12, 24, 64),
        new THREE.MeshStandardMaterial({ color: 0xC6A664, metalness: 0.7, roughness: 0.3 })
      );
      group.add(ring);
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.85, 0),
        new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.4, roughness: 0.25, emissive: 0x00341c, emissiveIntensity: 0.6 })
      );
      group.add(core);
      return group;
    }

    function buildSword() {
      const group = new THREE.Group();
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.85, roughness: 0.15 })
      );
      blade.position.y = 1.1;
      group.add(blade);

      const guard = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xC6A664, metalness: 0.7, roughness: 0.3 })
      );
      guard.position.y = -0.2;
      group.add(guard);

      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 })
      );
      handle.position.y = -0.7;
      group.add(handle);

      const pommel = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x003d20, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.3 })
      );
      pommel.position.y = -1.2;
      group.add(pommel);

      group.position.y = -0.1;
      return group;
    }

    function buildCodex() {
      const group = new THREE.Group();
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 2.1, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x0f2e1c, metalness: 0.2, roughness: 0.7 })
      );
      group.add(cover);

      const inlay = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0xC6A664, metalness: 0.8, roughness: 0.25, side: THREE.DoubleSide })
      );
      inlay.position.z = 0.15;
      group.add(inlay);

      const pages = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 1.95, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xece6d6, roughness: 0.9 })
      );
      pages.position.z = -0.02;
      group.add(pages);

      return group;
    }

    const BUILDERS = { emblem: buildEmblem, sword: buildSword, codex: buildCodex };

    function loadModel(key) {
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
      }
      // Simulate an async asset load so the loading spinner has a purpose
      // even though the placeholder geometry builds instantly.
      setTimeout(() => {
        const builder = BUILDERS[key] || BUILDERS.emblem;
        currentMesh = builder();
        scene.add(currentMesh);
        resetView();
        if (loadingEl) loadingEl.classList.add('hidden');
      }, 250);
    }

    function resetView() {
      rotationY = 0.6;
      rotationX = -0.15;
      zoom = 6;
      autoRotate = true;
    }

    function animate() {
      rafId = requestAnimationFrame(animate);
      if (currentMesh) {
        if (autoRotate && !isDragging) rotationY += 0.004;
        currentMesh.rotation.y = rotationY;
        currentMesh.rotation.x = rotationX;
      }
      camera.position.z = zoom;
      renderer.render(scene, camera);
    }

    /* ---- Pointer controls: drag to orbit, wheel to zoom ---- */
    function onPointerDown(e) {
      isDragging = true;
      autoRotate = false;
      lastX = e.clientX ?? e.touches?.[0].clientX;
      lastY = e.clientY ?? e.touches?.[0].clientY;
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      const x = e.clientX ?? e.touches?.[0].clientX;
      const y = e.clientY ?? e.touches?.[0].clientY;
      rotationY += (x - lastX) * 0.008;
      rotationX += (y - lastY) * 0.008;
      rotationX = Math.max(-1.1, Math.min(1.1, rotationX));
      lastX = x;
      lastY = y;
    }
    function onPointerUp() { isDragging = false; }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    canvas.addEventListener('touchmove', onPointerMove, { passive: true });
    canvas.addEventListener('touchend', onPointerUp);

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      zoom = Math.max(3, Math.min(10, zoom + e.deltaY * 0.005));
    }, { passive: false });

    /* ---- Toolbar controls ---- */
    if (select) {
      select.addEventListener('change', () => loadModel(select.value));
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', resetView);
    }
    if (fullscreenBtn && container) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          container.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      });
      document.addEventListener('fullscreenchange', resize);
    }

    // Pause the render loop when the viewer scrolls off-screen
    const vis = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(rafId);
        } else if (!rafId) {
          animate();
        }
      });
    }, { threshold: 0.05 });
    if (wrap) vis.observe(wrap);

    init();
  }

  /* -----------------------------------------------------------
     10. BACK TO TOP
  ----------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* -----------------------------------------------------------
     11. FOOTER YEAR
  ----------------------------------------------------------- */
  function initFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* -----------------------------------------------------------
     BOOTSTRAP — run everything once the DOM is ready
  ----------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initParticles();
    initAOS();
    initHeaderScroll();
    initNavToggle();
    initLoopDiagram();
    initGalleryFilter();
    initCounters();
    initModelViewer();
    initBackToTop();
    initFooterYear();
  });
})();
