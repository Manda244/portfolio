// ── CUSTOM CURSOR ──
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .skill-card, .project-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.style.transform = 'translate(-50%,-50%) scale(2)');
  el.addEventListener('mouseleave', () => ring.style.transform = 'translate(-50%,-50%) scale(1)');
});

// ── 3D CANVAS BACKGROUND ──
const canvas = document.getElementById('canvas3d');
const ctx = canvas.getContext('2d');

let W, H;
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

// Particles
const particles = Array.from({length: 120}, () => ({
  x: Math.random() * 2000 - 1000,
  y: Math.random() * 2000 - 1000,
  z: Math.random() * 1500,
  vz: Math.random() * 1.5 + 0.5,
  size: Math.random() * 2 + 0.5,
  hue: Math.random() > 0.7 ? 270 : 165
}));

// Grid
const GRID_SIZE = 80;
const GRID_ROWS = 20;
const GRID_COLS = 24;

let gridOffset = 0;
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / W - 0.5) * 2;
  mouseY = (e.clientY / H - 0.5) * 2;
});

function project(x, y, z) {
  const fov = 600;
  const scale = fov / (fov + z);
  return { x: x * scale + W / 2, y: y * scale + H / 2, scale };
}

function drawGrid() {
  const perspX = mouseX * 40;
  const perspY = mouseY * 20;

  ctx.save();
  ctx.translate(perspX * 0.5, perspY * 0.5);

  const startX = -GRID_COLS / 2 * GRID_SIZE;
  const startZ = -200;
  const endZ = 1200;

  // Horizontal lines (Z-axis)
  for (let row = 0; row <= GRID_ROWS; row++) {
    const zLine = startZ + (row / GRID_ROWS) * (endZ - startZ) + gridOffset;
    const zNorm = (zLine - startZ) / (endZ - startZ);
    const alpha = Math.max(0, Math.min(0.3, zNorm * 0.4));

    const p1 = project(startX, H * 0.15, zLine);
    const p2 = project(-startX, H * 0.15, zLine);

    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(0,245,196,${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Vertical lines (X-axis)
  for (let col = 0; col <= GRID_COLS; col++) {
    const xLine = startX + (col / GRID_COLS) * (-startX - startX);
    const alpha = 0.12;

    const pNear = project(xLine, H * 0.15, startZ + gridOffset);
    const pFar = project(xLine, H * 0.15, endZ + gridOffset);

    if (pNear && pFar) {
      const grad = ctx.createLinearGradient(pNear.x, pNear.y, pFar.x, pFar.y);
      grad.addColorStop(0, `rgba(0,245,196,0)`);
      grad.addColorStop(0.5, `rgba(0,245,196,${alpha})`);
      grad.addColorStop(1, `rgba(0,245,196,0)`);

      ctx.beginPath();
      ctx.moveTo(pNear.x, pNear.y);
      ctx.lineTo(pFar.x, pFar.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  ctx.restore();
}

function animCanvas() {
  ctx.clearRect(0, 0, W, H);

  // Deep gradient bg
  const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
  bgGrad.addColorStop(0, 'rgba(15,24,48,0.6)');
  bgGrad.addColorStop(1, 'rgba(5,8,16,0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid
  gridOffset += 1.2;
  if (gridOffset > GRID_SIZE) gridOffset = 0;
  drawGrid();

  // Particles
  const cx = W / 2, cy = H / 2;
  particles.forEach(p => {
    p.z -= p.vz;
    if (p.z <= 0) { p.z = 1500; p.x = Math.random() * 2000 - 1000; p.y = Math.random() * 2000 - 1000; }

    const proj = project(p.x, p.y, p.z);
    const alpha = (1 - p.z / 1500) * 0.8;
    const size = p.size * proj.scale;

    if (size > 0.1) {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, Math.max(0.1, size), 0, Math.PI * 2);
      ctx.fillStyle = p.hue === 165
        ? `rgba(0,245,196,${alpha})`
        : `rgba(124,77,255,${alpha * 0.7})`;
      ctx.fill();
    }
  });

  requestAnimationFrame(animCanvas);
}
animCanvas();

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => el.classList.add('visible'), parseFloat(delay) * 1000);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(r => observer.observe(r));

// ── SKILL BARS ANIMATION ──
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bars = entry.target.querySelectorAll('.skill-bar-fill');
      bars.forEach((bar, i) => {
        setTimeout(() => {
          bar.style.width = bar.dataset.pct + '%';
        }, i * 120 + 200);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
document.querySelectorAll('#skills').forEach(s => barObserver.observe(s));

// ── COUNTER ANIMATION ──
function animateCount(el, target) {
  let start = 0;
  const dur = 1500;
  const startTime = performance.now();
  function step(t) {
    const p = Math.min((t - startTime) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(start + (target - start) * ease);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const counters = document.querySelectorAll('[data-count]');
const countObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target, parseInt(entry.target.dataset.count));
      countObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => countObs.observe(c));

// ── 3D TILT ──
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(8px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
  });
});

// ── CV DOWNLOAD ──
function downloadCV(e) {
  e.preventDefault();
  // Simulate PDF creation
  const cvContent = `RASOLOMON Mandaniana F
Développeur Full Stack
Antananarivo, Madagascar

COMPÉTENCES
- JavaScript / TypeScript (90%)
- React / Next.js (88%)
- Python / Django (80%)
- Node.js (85%)
- SQL / PostgreSQL (75%)
- Docker / DevOps (70%)
- CSS / TailwindCSS (95%)

EXPÉRIENCES
2025-2026 — Lead Developer @ TechMada
2025-2026 — Frontend Dev @ StartupMG

FORMATION
2026 — Licence 2 Informatique, Université d'Antananarivo

contact@alexmirana.dev`;

  const blob = new Blob([cvContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RASOLOMON_Mandaniaina_F_CV.txt';
  a.click();
  URL.revokeObjectURL(url);

  // Visual feedback
  const btn = e.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '✓ Téléchargé !';
  btn.style.background = 'var(--accent)';
  btn.style.color = 'var(--bg)';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = 'var(--accent2)';
    btn.style.color = 'white';
  }, 2500);
}