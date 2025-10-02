(function () {
    const canvas = document.getElementById('header-canvas');
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    const header = canvas.parentElement;
  
    const styles = getComputedStyle(document.documentElement);
    const NODE_COLOR = styles.getPropertyValue('--node-color').trim() || 'rgba(255,255,255,0.75)';
    const LINE_COLOR = styles.getPropertyValue('--line-color').trim() || 'rgba(255,255,255,0.25)';
  
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR for perf
  
    // Tweakables
    let PARTICLE_COUNT = 28;        // adjust density
    const SPEED_MIN = 0.08;         // px per frame (logical)
    const SPEED_MAX = 0.35;
    const R_MIN = 1.2;              // radius in px (logical)
    const R_MAX = 2.6;
    const LINK_DIST = 140;          // distance to draw lines (logical)
    const LINK_THICKNESS = 1;       // line width (logical)
  
    let w = 0, h = 0;
    let particles = [];
    let rafId = null;
    let running = false;
  
    function resize() {
      const rect = header.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  
    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    function initParticles() {
      // scale particle count with width for consistent density
      const base = Math.round((w / 1200) * PARTICLE_COUNT);
      const targetCount = Math.max(12, base);
      particles.length = 0;
      for (let i = 0; i < targetCount; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(SPEED_MIN, SPEED_MAX) * (Math.random() < 0.5 ? -1 : 1),
          vy: rand(SPEED_MIN, SPEED_MAX) * (Math.random() < 0.5 ? -1 : 1),
          r: rand(R_MIN, R_MAX)
        });
      }
    }
  
    function step() {
      ctx.clearRect(0, 0, w, h);
  
      // move & bounce
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
  
        if (p.x < -20) { p.x = -20; p.vx *= -1; }
        if (p.x > w + 20) { p.x = w + 20; p.vx *= -1; }
        if (p.y < -20) { p.y = -20; p.vy *= -1; }
        if (p.y > h + 20) { p.y = h + 20; p.vy *= -1; }
      }
  
      // lines
      ctx.lineWidth = LINK_THICKNESS;
      ctx.strokeStyle = LINE_COLOR;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.globalAlpha = 1 - dist / LINK_DIST; // fade with distance
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
  
      // nodes
      ctx.fillStyle = NODE_COLOR;
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
  
      rafId = requestAnimationFrame(step);
    }
  
    function start() {
      if (running || prefersReduced) return;
      running = true;
      rafId = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }
  
    // Handle tab visibility (pause when not visible)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  
    // Resize & re-init on layout changes
    window.addEventListener('resize', () => {
      const prevW = w, prevH = h;
      resize();
      if (Math.abs(prevW - w) > 10 || Math.abs(prevH - h) > 10) {
        initParticles();
      }
    });
  
    // Init
    resize();
    initParticles();
    start();
  })();
  

  document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const researchItems = document.querySelectorAll('.research-item');
  
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
  
        researchItems.forEach(item => {
          const categories = item.getAttribute('data-category').toLowerCase();
          const match = categories.includes(filter.toLowerCase());
  
          if (filter === 'all' || match) {
            item.style.display = 'grid'; // show item
          } else {
            item.style.display = 'none'; // hide item
          }
        });
  
        // Optional: Highlight active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  });
  

  