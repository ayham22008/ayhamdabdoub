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
   Results counters + educational percentage counters.
   Starts when elements enter the viewport.
----------------------------------------------------------- */

function initCounters() {

  const counters = document.querySelectorAll(
    '.counter, .edu-percent'
  );

  if (!counters.length) return;


  const prefersReducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;



  function animateCounter(el) {


    const target =
      parseInt(
        el.getAttribute('data-count'),
        10
      ) || 0;


    const isPercent =
      el.classList.contains(
        'edu-percent'
      );


    const duration = 1400;


    const startTime =
      performance.now();



    if (prefersReducedMotion) {

      el.textContent =
        target +
        (isPercent ? '%' : '');

      return;

    }



    function frame(now) {


      const progress =
        Math.min(
          (now - startTime) / duration,
          1
        );



      // smooth ease out animation

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );



      const value =
        Math.floor(
          eased * target
        );



      el.textContent =
        value +
        (isPercent ? '%' : '');



      if (progress < 1) {

        requestAnimationFrame(
          frame
        );

      } else {

        el.textContent =
          target +
          (isPercent ? '%' : '');

      }


    }



    requestAnimationFrame(frame);


  }





  const observer =
    new IntersectionObserver(

      (entries, obs) => {


        entries.forEach(entry => {


          if (entry.isIntersecting) {


            animateCounter(
              entry.target
            );


            obs.unobserve(
              entry.target
            );


          }


        });


      },


      {
        threshold:0.15
      }


    );





  counters.forEach(counter => {

    observer.observe(counter);

  });


}





/* -----------------------------------------------------------
   START COUNTERS
----------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initCounters();

  }
);
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
