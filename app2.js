/* =========================================================
   Ayham Dabdoub — Portfolio Scripts
   (No preloader / loading screen)
========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================
   THEME TOGGLE
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
   MOBILE NAV
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
   IMAGE FALLBACK
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
   LIGHTBOX
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
   ========================================== */
(function carousel() {
  const stage = document.getElementById('carouselStage');
  const dotsWrap = document.getElementById('carouselDots');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

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
    dot.onclick = () => goTo(i - 1);
    dotsWrap.appendChild(dot);
  }

  const dots = dotsWrap.querySelectorAll('span');
  let current = 0;

  function render() {
    items.forEach((item, i) => {
      let offset = i - current;

      if (offset > TOTAL / 2) offset -= TOTAL;
      if (offset < -TOTAL / 2) offset += TOTAL;

      const abs = Math.abs(offset);

      item.style.opacity = abs > 3 ? '0' : String(1 - abs * 0.28);
      item.style.pointerEvents = abs > 3 ? 'none' : 'auto';

      item.style.transform = `
        translateX(${offset * 130}px)
        translateZ(${-abs * 90}px)
        rotateY(${offset * -32}deg)
        scale(${1 - abs * 0.12})
      `;

      item.style.zIndex = 10 - abs;
    });

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
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
    timer = setInterval(next, 3200);
  }

  const carouselWrap = document.getElementById('galleryCarousel');
  if (carouselWrap) {
    carouselWrap.onmouseenter = pauseAutoplay;
    carouselWrap.onmouseleave = resumeAutoplay;
  }

  render();
  resumeAutoplay();
})();

/* ==========================================
   DESIGNS GRID
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
   MODELS TABS
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

  /* LIGHTING */
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(5, 8, 5);
  scene.add(key);

  const greenLight = new THREE.PointLight(0x7c5cff, 2, 20);
  greenLight.position.set(-4, 3, -4);
  scene.add(greenLight);

  /* FLOOR GRID */
  const grid = new THREE.GridHelper(10, 20, 0x7c5cff, 0x222222);
  grid.material.transparent = true;
  grid.material.opacity = 0.25;

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
    controls.autoRotateSpeed = 1.2;
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