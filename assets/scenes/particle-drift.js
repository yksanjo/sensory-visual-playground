export function createScene({ canvas }) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let particles = [];
  let settings = {
    count: 180,
    speed: 0.9,
    trail: 0.9,
    color: '#7dd3fc',
  };

  function start(initialSettings = {}) {
    settings = { ...settings, ...initialSettings };
    initParticles();
    render();
  }

  function initParticles() {
    const { width, height } = canvas;
    particles = Array.from({ length: Math.round(settings.count) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * settings.speed,
      vy: (Math.random() - 0.5) * settings.speed,
      life: Math.random() * 100,
    }));
  }

  function render() {
    const { width, height } = canvas;

    ctx.fillStyle = `rgba(8, 11, 26, ${1 - settings.trail})`;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = withAlpha(settings.color, 0.85);

    particles.forEach((particle) => {
      particle.x += particle.vx * 2;
      particle.y += particle.vy * 2;
      particle.life += 0.01;

      const noise = Math.sin(particle.life) * 0.5;
      particle.vx += noise * 0.005;
      particle.vy += Math.cos(particle.life) * 0.005;

      const speedLimit = settings.speed * 1.5;
      particle.vx = clamp(particle.vx, -speedLimit, speedLimit);
      particle.vy = clamp(particle.vy, -speedLimit, speedLimit);

      if (particle.x > width) particle.x = 0;
      if (particle.x < 0) particle.x = width;
      if (particle.y > height) particle.y = 0;
      if (particle.y < 0) particle.y = height;

      const size = 1.5 + Math.sin(particle.life * 3) * 1.2;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, Math.max(0.4, size), 0, Math.PI * 2);
      ctx.fill();
    });

    animationId = requestAnimationFrame(render);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function resize() {
    initParticles();
  }

  function update(newSettings = {}) {
    const countBefore = settings.count;
    settings = { ...settings, ...newSettings };

    if (Math.round(settings.count) !== Math.round(countBefore)) {
      initParticles();
    }
  }

  return { start, stop, resize, update };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function withAlpha(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
