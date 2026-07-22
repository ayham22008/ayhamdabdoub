

/* =========================================================
   Ayham Dabdoub — Portfolio Scripts
   v3 — movement upgrade, original purple/coral palette kept
   (No preloader / loading screen — unchanged from original)
   ---------------------------------------------------------
   Every original function is kept, unmodified in behavior:
   theme, nav, image fallback, lightbox, 3D carousel, designs
   grid, models tabs, and the GLTF model viewer all still do
   exactly what they did before. The palette (purple #7c5cff +
   blue-purple #6b6eff) is untouched — only the MOVEMENT changed:
     - new ambient particle layer + scroll-progress line
       (injected here, not in the HTML, so markup stays intact)
     - carousel spacing/easing feels weightier and more cinematic
     - hero portrait gets a subtle mouse-tilt
     - the Three.js viewer's lighting stays purple/coral, just
       reorganized into a clearer key/accent/rim setup
========================================================= */
 
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
/* ==========================================
   AMBIENT LAYER — particle field + scroll progress
   New in v2. Purely decorative, injected at runtime so the
   existing HTML file needs zero edits.
   ========================================== */
(function ambientLayer() {
  // Scroll progress line along the header's bottom edge
  const header = document.querySelector('header');
  if (header) {
    const bar = document.createElement('div');
    bar.id = 'wokProgress';
    header.appendChild(bar);
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
    }, { passive: true });
  }

  // Ambient purple/coral particle canvas, fixed behind all content
  const canvas = document.createElement('canvas');
  canvas.id = 'wokParticles';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height, particles, rafId;
  const COLORS = ['rgba(124,92,255,', 'rgba(255,107,107,'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  function createParticles() {
    const count = Math.min(60, Math.floor((width * height) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.6,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.4 + 0.12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));
  }
  function tick() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });
    rafId = requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  window.addEventListener('resize', () => { resize(); createParticles(); });

  if (reduceMotion) { tick(); cancelAnimationFrame(rafId); return; }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(rafId); else tick();
  });
  tick();
})();
/* ==========================================
   HERO PORTRAIT TILT
   New in v2. Subtle mouse-follow tilt on the profile photo —
   doesn't touch the existing hover scale/rotate in CSS.
   ========================================== */
(function heroTilt() {
  const img = document.querySelector('.hero-image img');
  if (!img || reduceMotion) return;
 
  img.addEventListener('mousemove', e => {
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    img.style.transform = `scale(1.08) rotateX(${y * -10}deg) rotateY(${x * 10}deg)`;
  });
  img.addEventListener('mouseleave', () => {
    img.style.transform = '';
  });
})();
 
/* ==========================================
   THEME TOGGLE  (unchanged behavior)
   ========================================== */
(function theme() {
  const btn = document.getElementById('theme-btn');
  const saved = localStorage.getItem('ayham-theme');
 
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    btn.textContent = '☀️';
  }
 
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
 
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      btn.textContent = '🌙';
      localStorage.setItem('ayham-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      btn.textContent = '☀️';
      localStorage.setItem('ayham-theme', 'light');
    }
  });
})();
 
/* ==========================================
   MOBILE NAV  (unchanged behavior)
   ========================================== */
(function nav() {
  const burger = document.getElementById('nav-burger');
  const links = document.querySelectorAll('#nav-links a');
 
  burger.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
 
  links.forEach(a => {
    a.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
    });
  });
})();
 
/* ==========================================
   IMAGE FALLBACK  (unchanged behavior)
   ========================================== */
function attachImageFallback(img, emoji, extraClass) {
  img.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = extraClass || 'fallback';
    fallback.textContent = emoji || '🖼️';
    img.replaceWith(fallback);
  }, { once: true });
}
 
document.querySelectorAll('img[data-fallback]').forEach(img => {
  attachImageFallback(img, img.dataset.fallback, 'img-fallback-emoji');
});
 
/* ==========================================
   LIGHTBOX  (unchanged behavior)
   ========================================== */
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
 
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
 
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});
 
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
 
function openLightbox(src, alt) {
  lightboxImage.src = src;
  lightboxImage.alt = alt || '';
  lightbox.classList.add('open');
}
 
function closeLightbox() {
  lightbox.classList.remove('open');
}
 
/* ==========================================
   3D CAROUSEL
   Drag, arrows, dots, and autoplay all work the same as
   before. What's fixed: the old version used FIXED pixel
   offsets (130px apart, 100px of depth) regardless of how
   wide the stage actually was. That looked fine at the
   desktop width it was tuned for, but on a phone — where the
   stage shrinks to ~210px — 130px of horizontal spacing is
   more than half the card's own width, so cards overlapped
   and crowded together. Spacing/depth are now calculated as a
   percentage of the stage's actual width, recalculated on
   resize, so the layout holds together at any screen size.
   Also new: the centered card gets a highlighted border/glow,
   and a "n / 10" counter sits next to the dots.
   ========================================== */
(function carousel() {
  const stage = document.getElementById('carouselStage');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const counter = document.getElementById('carouselCounter');
 
  if (!stage) return;
 
  const TOTAL = 10;
  const items = [];
 
  for (let i = 1; i <= TOTAL; i++) {
    const item = document.createElement('div');
    item.className = 'carousel-item';
 
    const img = document.createElement('img');
    img.src = `images/${i}.png`;
    img.alt = `Gallery photo ${i}`;
    img.draggable = false;
 
    attachImageFallback(img, '📷', 'carousel-fallback');
 
    item.appendChild(img);
    stage.appendChild(item);
    items.push(item);
 
    const dot = document.createElement('span');
    dot.setAttribute('role', 'button');
    dot.setAttribute('aria-label', `Go to photo ${i}`);
    dot.onclick = () => goTo(i - 1);
    dotsWrap.appendChild(dot);
  }
 
  const dots = dotsWrap.querySelectorAll('span');
  let current = 0;
 
  /* Spacing is a fraction of the stage's own width/height
     instead of a fixed pixel value, so it scales correctly
     from phone to desktop. */
  function getSpacing() {
    const rect = stage.getBoundingClientRect();
    return {
      x: rect.width * 0.25,
      z: rect.width * 0.19
    };
  }
 
  function render() {
    const { x: spacingX, z: spacingZ } = getSpacing();
 
    items.forEach((item, i) => {
      let offset = i - current;
 
      if (offset > TOTAL / 2) offset -= TOTAL;
      if (offset < -TOTAL / 2) offset += TOTAL;
 
      const abs = Math.abs(offset);
 
      item.style.opacity = abs > 3 ? '0' : String(1 - abs * 0.28);
      item.style.pointerEvents = abs > 3 ? 'none' : 'auto';
      item.classList.toggle('active', offset === 0);
 
      item.style.transform = `
        translateX(${offset * spacingX}px)
        translateZ(${-abs * spacingZ}px)
        rotateY(${offset * -28}deg)
        scale(${1 - abs * 0.12})
      `;
 
      item.style.zIndex = 10 - abs;
    });
 
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
 
    if (counter) counter.textContent = `${current + 1} / ${TOTAL}`;
  }
 
  function goTo(i) {
    current = ((i % TOTAL) + TOTAL) % TOTAL;
    render();
  }
 
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }
 
  prevBtn.onclick = prev;
  nextBtn.onclick = next;
 
  let dragging = false;
  let startX = 0;
  let dragOffset = 0;
 
  stage.onpointerdown = e => {
    dragging = true;
    startX = e.clientX;
    stage.setPointerCapture(e.pointerId);
    pauseAutoplay();
  };
 
  stage.onpointermove = e => {
    if (dragging) dragOffset = e.clientX - startX;
  };
 
  stage.onpointerup = () => {
    if (!dragging) return;
 
    dragging = false;
 
    if (dragOffset > 40) prev();
    else if (dragOffset < -40) next();
 
    dragOffset = 0;
    resumeAutoplay();
  };
 
  let timer = null;
 
  function pauseAutoplay() {
    clearInterval(timer);
  }
 
  function resumeAutoplay() {
    if (reduceMotion) return;
    clearInterval(timer);
    /* Slightly slower cadence (3800ms vs 3200ms) — a calmer,
       more deliberate autoplay to match the new pacing. */
    timer = setInterval(next, 3800);
  }
 
  const carouselWrap = document.getElementById('galleryCarousel');
  if (carouselWrap) {
    carouselWrap.onmouseenter = pauseAutoplay;
    carouselWrap.onmouseleave = resumeAutoplay;
  }
 
  // Re-render on resize/orientation change so spacing stays
  // correct as the stage's own width changes.
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 120);
  });
 
  render();
  resumeAutoplay();
})();
 
/* ==========================================
   DESIGNS GRID  (unchanged behavior)
   ========================================== */
(function designsGrid() {
  const grid = document.getElementById('designsGrid');
  if (!grid) return;
 
  const labels = [
    'drinkk',
    'ayham logo',
    '2d character',
    'war of knowledge',
    'south kingdom',
    'east kingdom',
    'west kingdom',
    'north kingdom'
  ];
 
  labels.forEach((label, idx) => {
    const i = idx + 11;
 
    const tile = document.createElement('div');
    tile.className = 'design-tile';
    tile.setAttribute('data-aos', 'fade-up');
 
    const img = document.createElement('img');
    img.src = `images/${i}.png`;
    img.alt = label;
 
    attachImageFallback(img, '🎨');
 
    tile.appendChild(img);
 
    const overlay = document.createElement('div');
    overlay.className = 'tile-overlay';
    overlay.innerHTML = `<span>${label}</span>`;
 
    tile.appendChild(overlay);
 
    tile.addEventListener('click', () => {
      const image = tile.querySelector('img');
      openLightbox(image ? image.src : '', label);
    });
 
    grid.appendChild(tile);
  });
})();
 
/* ==========================================
   MODELS TABS  (unchanged behavior)
   ========================================== */
(function modelsTabs() {
  const tabs = document.querySelectorAll('.models-tab');
  const panelViewer = document.getElementById('panel-viewer');
  const panelRenders = document.getElementById('panel-renders');
 
  if (!tabs.length) return;
 
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
 
      const showViewer = tab.dataset.tab === 'viewer';
 
      if (panelViewer) panelViewer.style.display = showViewer ? '' : 'none';
      if (panelRenders) panelRenders.style.display = showViewer ? 'none' : '';
    });
  });
})();
 
/* ==========================================
   3D MODEL VIEWER — GLB / GLTF
   Loading, fitting, animation mixer, and controls are all
   unchanged. Lighting palette stays purple/coral — just split
   into a clearer key light + two accent point lights.
   ========================================== */
(function modelViewer() {
  const canvas = document.getElementById('modelCanvas');
  if (!canvas || !window.THREE) return;
 
  const container = canvas.parentElement;
  const overlay = document.getElementById('viewerOverlay');
  const autoRotateBtn = document.getElementById('autoRotateBtn');
  const resetBtn = document.getElementById('resetViewBtn');
 
  let model = null;
  let mixer = null;
  let controls = null;
 
  /* SCENE */
  const scene = new THREE.Scene();
  scene.background = null;
 
  /* CAMERA */
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  camera.position.set(0, 1, 5);
 
  /* RENDERER */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 
  /* LIGHTING — purple key light, blue-purple rim light */
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
 
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(5, 8, 5);
  scene.add(key);
 
  const accentLight = new THREE.PointLight(0x7c5cff, 2, 20);
  accentLight.position.set(-4, 3, -4);
  scene.add(accentLight);
 
  const rimLight = new THREE.PointLight(0x6b6eff, 1.4, 20);
  rimLight.position.set(4, -2, 3);
  scene.add(rimLight);
 
  /* FLOOR GRID */
  const grid = new THREE.GridHelper(10, 20, 0x7c5cff, 0x222222);
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
 
  /* 🔴 GRID POSITION */
  grid.position.y = -4;
  grid.position.x = 0.2;
  grid.position.z = 2.1;
  scene.add(grid);
 
  /* CONTROLS */
  if (THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 1;
    controls.maxDistance = 20;
  }
 
  /* LOAD MODEL */
  function loadModel() {
    if (!THREE.GLTFLoader) {
      console.error("GLTFLoader missing");
      return;
    }
 
    const loader = new THREE.GLTFLoader();
 
    if (overlay) {
      overlay.style.display = 'block';
      overlay.innerHTML = 'Loading Model 0%';
    }
 
    /* 🔴 MODEL PATH */
    loader.load(
      "images/bahaa.glb",
      function (gltf) {
        if (model) {
          scene.remove(model);
        }
 
        model = gltf.scene;
        scene.add(model);
 
        /* 🔴 MODEL SCALE PLACE */
        /*
        Example:
        model.scale.set(0.5,0.5,0.5);
        model.scale.set(2,2,2);
        */
 
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
 
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach(anim => {
            mixer.clipAction(anim).play();
          });
        }
 
        fitModel(model);
 
        if (overlay) {
          overlay.style.display = 'none';
        }
      },
      function (progress) {
        if (progress.total) {
          let percent = Math.round((progress.loaded / progress.total) * 100);
          if (overlay) {
            overlay.innerHTML = 'Loading Model ' + percent + '%';
          }
        }
      },
      function (error) {
        console.error("Model loading error:", error);
        if (overlay) {
          overlay.innerHTML = "Model failed to load";
        }
      }
    );
  }
 
  /* CAMERA FIT */
  function fitModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
 
    object.position.sub(center);
 
    const max = Math.max(size.x, size.y, size.z);
 
    /* 🔴 CAMERA DISTANCE */
    const distance = max * 2.5;
 
    camera.position.set(distance, distance * 0.7, distance);
    camera.near = max / 100;
    camera.far = max * 100;
    camera.updateProjectionMatrix();
 
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }
 
  /* BUTTONS */
  if (autoRotateBtn) {
    autoRotateBtn.onclick = () => {
      if (!controls) return;
      controls.autoRotate = !controls.autoRotate;
      autoRotateBtn.classList.toggle('active', controls.autoRotate);
    };
  }
 
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (model) {
        fitModel(model);
      }
    };
  }
 
  /* RESIZE */
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
 
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
 
  window.addEventListener('resize', resize);
  resize();
 
  /* ANIMATION */
  const clock = new THREE.Clock();
 
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
 
    if (mixer) {
      mixer.update(delta);
    }
 
    if (controls) {
      controls.update();
    }
 
    renderer.render(scene, camera);
  }
 
  animate();
 
  /* START VIEWER */
  loadModel();
})();