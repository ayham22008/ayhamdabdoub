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

 /* ==========================================
   3D MODEL VIEWER — WAR OF KNOWLEDGE GLB

   Models:
   images/models/
   ├── bahaa.glb
   ├── ayham.glb
   ├── lalo.glb
   └── zaid.glb

========================================== */


(function modelViewer(){


const canvas =
document.getElementById("modelCanvas");


if(!canvas || !window.THREE)
return;



const container =
canvas.parentElement;


const overlay =
document.getElementById("viewerOverlay");


const select =
document.getElementById("modelSelect");


const autoRotateBtn =
document.getElementById("autoRotateBtn");


const resetBtn =
document.getElementById("resetViewBtn");



let model = null;

let mixer = null;

let controls = null;



/* ==========================================
   MODELS
========================================== */


const MODELS = {


north:
"images/bahaa.glb",


east:
"images/ayham.glb",


west:
"images/lalo.glb",


south:
"images/zaid.glb"


};




/* ==========================================
   SCENE
========================================== */


const scene =
new THREE.Scene();


scene.background = null;




/* CAMERA */


const camera =
new THREE.PerspectiveCamera(
45,
1,
0.01,
1000
);


camera.position.set(
0,
1,
5
);





/* RENDERER */


const renderer =
new THREE.WebGLRenderer({

canvas:canvas,

antialias:true,

alpha:true

});


renderer.setPixelRatio(
Math.min(
window.devicePixelRatio,
2
)
);


renderer.shadowMap.enabled = true;





/* ==========================================
   LIGHTS
========================================== */


scene.add(
new THREE.AmbientLight(
0xffffff,
0.5
)
);



const key =
new THREE.DirectionalLight(
0xffffff,
1.8
);


key.position.set(
5,
8,
5
);


key.castShadow = true;


scene.add(key);




const greenLight =
new THREE.PointLight(
0x00ff88,
2,
20
);


greenLight.position.set(
-4,
3,
-4
);


scene.add(greenLight);





const goldLight =
new THREE.PointLight(
0xc6a664,
1.5,
20
);


goldLight.position.set(
4,
-2,
3
);


scene.add(goldLight);





/* ==========================================
   GRID
========================================== */


const grid =
new THREE.GridHelper(
10,
25,
0x00ff88,
0x222222
);



grid.material.transparent = true;

grid.material.opacity = .25;


grid.position.y = -2.5;

grid.position.z = 1;


scene.add(grid);





/* ==========================================
   CONTROLS
========================================== */


if(THREE.OrbitControls){


controls =
new THREE.OrbitControls(
camera,
renderer.domElement
);



controls.enableDamping = true;

controls.dampingFactor = .08;


controls.autoRotate = true;

controls.autoRotateSpeed = .8;


controls.minDistance = 1;

controls.maxDistance = 20;


}







/* ==========================================
   LOAD MODEL
========================================== */


function loadModel(type){



if(!MODELS[type]){


console.error(
"MODEL NOT FOUND:",
type
);


return;

}




const loader =
new THREE.GLTFLoader();



if(overlay){


overlay.style.display =
"block";


overlay.innerHTML =
"Loading Model 0%";


}





loader.load(


MODELS[type],



function(gltf){



if(model){

scene.remove(model);

}





model =
gltf.scene;



scene.add(model);





model.traverse(
child=>{


if(child.isMesh){


child.castShadow = true;


child.receiveShadow = true;


}



}

);






if(gltf.animations.length){


mixer =
new THREE.AnimationMixer(
model
);



gltf.animations.forEach(
clip=>{


mixer
.clipAction(clip)
.play();



}

);


}





fitModel(model);





if(overlay)

overlay.style.display =
"none";



console.log(
"Loaded:",
type
);



},





function(xhr){



if(xhr.total && overlay){


let percent =
Math.round(
(xhr.loaded /
xhr.total)
*100
);



overlay.innerHTML =
"Loading Model "
+
percent
+
"%";



}



},





function(error){



console.error(
"GLB ERROR:",
error
);



if(overlay)

overlay.innerHTML =
"Model Failed";



}



);



}







/* ==========================================
   FIT MODEL
========================================== */


function fitModel(object){



const box =
new THREE.Box3()
.setFromObject(object);




const size =
box.getSize(
new THREE.Vector3()
);



const center =
box.getCenter(
new THREE.Vector3()
);



object.position.sub(center);




const max =
Math.max(
size.x,
size.y,
size.z
);



const distance =
max * 2.8;



camera.position.set(

distance,

distance*.7,

distance

);




camera.near =
max/100;



camera.far =
max*100;


camera.updateProjectionMatrix();




if(controls){


controls.target.set(
0,
0,
0
);


controls.update();


}



}







/* ==========================================
   SELECT
========================================== */


if(select){


select.onchange = ()=>{


loadModel(
select.value
);


};


}







/* BUTTONS */


if(autoRotateBtn){


autoRotateBtn.onclick = ()=>{


if(!controls)
return;



controls.autoRotate =
!controls.autoRotate;



};


}




if(resetBtn){


resetBtn.onclick = ()=>{


if(model)

fitModel(model);



};


}








/* RESIZE */


function resize(){



const w =
container.clientWidth;


const h =
container.clientHeight;



renderer.setSize(
w,
h,
false
);



camera.aspect =
w/h;



camera.updateProjectionMatrix();



}



window.addEventListener(
"resize",
resize
);


resize();







/* ANIMATION */


const clock =
new THREE.Clock();



function animate(){



requestAnimationFrame(
animate
);



const delta =
clock.getDelta();



if(mixer)

mixer.update(delta);



if(controls)

controls.update();



renderer.render(
scene,
camera
);



}



animate();






/* START MODEL */


loadModel("north");



})();

  /* -----------------------------------------------------------
     9B. STORY BOARD
     Single-image narrative slider through 82 illustrated scenes.
     Rebuilt from scratch — the original version had a filename
     mismatch (images/s(${n}).png instead of images/s${n}.png),
     an inconsistent scene count (looped at 83 while only 82
     images/captions exist), and read `descriptions` before it
     was ever declared. Fixed here, plus added: a crossfade
     between images instead of an instant swap, a progress bar,
     drag/swipe support to match the rest of the site, and
     left/right arrow-key navigation while the section is in view.
  ----------------------------------------------------------- */
  function initStoryBoard() {
    const image = document.getElementById('storyImage');
    const description = document.getElementById('storyDescription');
    const title = document.getElementById('storyTitle');
    const number = document.getElementById('storyNumber');
    const totalEl = document.getElementById('storyTotal');
    const progressBar = document.getElementById('storyProgressBar');
    const nextBtn = document.getElementById('storyNext');
    const prevBtn = document.getElementById('storyPrev');
    const section = document.getElementById('storyboard');
    if (!image || !nextBtn || !prevBtn) return;

    const TOTAL = 71;
    let current = 1;


    const descriptions = {
      1: "Introducing the four characters : Lalo, Ayham, Zaid, and Baha'a.",
      2: "the start of the journey.",
      3: "establishing the room of ayham (the inventor).",
      4: "ayham in his room, laboratory.",
      5: "establishing the BAU university where zaid studies.",
      6: "zaid in the university (the student).",
      7: "establishing the library where lalo reads books.",
      8: "lalo in the library(the book reader).",
      9: "establishing the gym where baha'a trains.",
      10: "baha'a in the gym (the strong one).",
      11: "zaid receives a message in the university.",
      12: "the massage says lets meet at the cafe.",
      13: "ayham receives a message in his room.",
      14: "The message contains urgent news about the meeting.",
      15: "baha'a receives a message in the gym.",
      16: "The message says the meeting is at the cafe.",
      17: "lalo receives a message in the library.",
      18: "the group send a message about the meeting.",
      19: "The meeting was scheduled at night in the cafe.",
      20: "establishing the cafe where the meeting will take place.",
      21: "the four friends gather at the cafe.",
      22: "They discuss about the Parallel worlds and their existing.",
      23: "The discussion continues and they ask if there is another worlds with different peoples,time and culture .",
      24: "suddenly, the lights went out and on and the land start shaking.",
      25: "there phone started ringing and lighting up in a strange way.",
      26: "then a mysterious white light appeared.",
      27: "then thay woke up in a strange place named (wisdom land).",
      28: "Introducing the four kings king of east ,north ,south and west .",
      29: "establishing the kingdoms of east.",
      30: "ayham arrives at the east kingdom.",
      31: "ayham talks to the people of East.",
      32: "establishing the kingdom of south.",
      33: "zaid arrives at the south sea.",
      34: "zaid communicates with the south pirates.",
      35: "establishing the kingdom of north.",
      36: "baha'a arrives at the north kingdom.",
      37: "baha'a talks to the vaiking.",
      38: "establishing the kingdom of west.",
      39: "lalo arrives at the west kingdom.",
      40: "lalo talks to the sherif of the west.",
      41: "now the four kings have gathered the wisdome land into four kingdoms.",
      42: "establishing the castle of north.",
      43: "baha'a lives in his castle up in the mountains of north.",
      44: "establishing the castle of east.",
      45: "ayham lives in his castle in the heart of the east desert.",
      46: "establishing the castle of west.",
      47: "lalo lives in his castle in the heart of the west jungle.",
      48: "establishing the castle of south.",
      49: "zaid lives in his castle ship in the south sea.",
      50: "the map of wisdom land shows the four kingdoms beforethe war began.",
      51: "the four kings are going to faight each other for intelligence and resources.",
      52: "establishing the army camp of north.",
      53: "the army of vaiking are ready to enter the war of knowledge.",
      54: "establishing the army ships of south.",
      55: "the pirates are ready to enter the war of knowledge.",
      56: "establishing the army of east.",
      57: "the arab are ready to enter the war of knowledge.",
      58: "establishing the castle of west.",
      59: "the westren people are ready to enter the war of knowledge.",
      60: "the map of wisdom land shows the new borders of the four kingdoms after war.",
      61: "the war has ended and everything is receiving a message to back to their world .",
      62: "baha'a returns to his kingdom and found the letter.",
      63: "the message says that you have completed your mission and connected the lands of north even with the diffecalt weather and now is the time for another king to rule the north.",
      64: "ayham returns to his kingdom and found the letter.",
      65: "the message says that you have completed your mission and connected the lands of east even with the diffecalt weather and desarts and now is the time for another king to rule the east.",
      66: "lalo returns to his kingdom and found the letter.",
      67: "the message says that you have completed your mission and connected the lands of west even with the diffecalt people and cultures and now is the time for another king to rule the west.",
      68: "zaid returns to his kingdom and found the letter.",
      69: "the message says that you have completed your mission and connected the lands of south even with the diffecalt seas and oceans and now is the time for another king to rule the south.",
      70: "the war continues but with deffrent kings the first kings have made the lands and start the  war and now is your turn to be the king and rule the wisdom land.",
      71: "the end. thank you for playing the war of knowledge.",
    };

    if (totalEl) totalEl.textContent = TOTAL;

    function updateStory() {
      // Crossfade instead of an instant image swap
      image.style.opacity = '0';
      window.setTimeout(() => {
        image.src = `images/ss/s${current}.png`;
      }, prefersReducedMotion ? 0 : 160);
      image.onload = () => { image.style.opacity = '1'; };

      if (title) title.textContent = `Scene ${current}`;
      if (number) number.textContent = current;
      if (description) {
        description.textContent =
          descriptions[current] || 'Visual scene from the War of Knowledge story.';
      }
      if (progressBar) progressBar.style.width = `${(current / TOTAL) * 100}%`;
    }

    function next() { current = current >= TOTAL ? 1 : current + 1; updateStory(); }
    function prev() { current = current <= 1 ? TOTAL : current - 1; updateStory(); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    /* Drag/swipe on the image itself, matching the gallery carousel elsewhere on the page */
    let dragging = false;
    let startX = 0;
    image.style.cursor = 'grab';

    function dragStart(e) {
      dragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      image.style.cursor = 'grabbing';
    }
    function dragEnd(e) {
      if (!dragging) return;
      dragging = false;
      image.style.cursor = 'grab';
      const endX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
      const delta = endX - startX;
      if (delta > 50) prev();
      else if (delta < -50) next();
    }
    image.addEventListener('mousedown', dragStart);
    window.addEventListener('mouseup', dragEnd);
    image.addEventListener('touchstart', dragStart, { passive: true });
    image.addEventListener('touchend', dragEnd);

    /* Left/right arrow keys, only while the section is on screen
       so they don't hijack scrolling/typing elsewhere on the page */
    if (section) {
      let inView = false;
      const observer = new IntersectionObserver(
        entries => entries.forEach(entry => { inView = entry.isIntersecting; }),
        { threshold: 0.4 }
      );
      observer.observe(section);

      document.addEventListener('keydown', e => {
        if (!inView) return;
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      });
    }

    updateStory();
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

     Each init runs in its own try/catch. Before this change,
     one function throwing (initModelViewer is the most likely
     culprit — it depends on Three.js and WebGL) would silently
     stop every init AFTER it in this list from ever running,
     since they were called back-to-back with nothing catching
     the error. That would explain buttons "doing nothing" —
     their addEventListener calls simply never happened. Wrapping
     each call means a failure in one module (logged to the
     console, not swallowed) can't take out the rest of the page.
  ----------------------------------------------------------- */
  function safeInit(name, fn) {
    try {
      fn();
    } catch (err) {
      console.error(`[app2.js] ${name} failed to initialize:`, err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    safeInit('initLoader', initLoader);
    safeInit('initParticles', initParticles);
    safeInit('initAOS', initAOS);
    safeInit('initHeaderScroll', initHeaderScroll);
    safeInit('initNavToggle', initNavToggle);
    safeInit('initLoopDiagram', initLoopDiagram);
    safeInit('initGalleryFilter', initGalleryFilter);
    safeInit('initCounters', initCounters);
    safeInit('initStoryBoard', initStoryBoard);
    safeInit('initBackToTop', initBackToTop);
    safeInit('initFooterYear', initFooterYear);
    // Three.js/WebGL dependent — runs last so a failure here
    // (missing library, no WebGL support, etc.) can never block
    // any of the simpler, more important interactions above.
    safeInit('initModelViewer', initModelViewer);
  });
})();