const palettes = {
  'violet-dawn': ['#1e1b4b', '#4c1d95', '#7c3aed', '#ec4899'],
  'ocean-mist': ['#0f172a', '#155e75', '#38bdf8', '#a855f7'],
  'solar-flare': ['#881337', '#c026d3', '#f97316', '#fde047'],
};

export function createScene({ canvas }) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let animationId = null;
  let tick = 0;
  let settings = {
    speed: 0.6,
    intensity: 0.75,
    palette: 'violet-dawn',
  };

  function start(initialSettings = {}) {
    settings = { ...settings, ...initialSettings };
    tick = 0;
    render();
  }

  function render() {
    const { width, height } = canvas;
    tick += 0.005 * (settings.speed || 1);

    const colors = palettes[settings.palette] || palettes['violet-dawn'];

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < colors.length; i++) {
      const angle = tick * (i + 1);
      const x = width / 2 + Math.sin(angle * 0.7) * (width * 0.25);
      const y = height / 2 + Math.cos(angle * 0.9) * (height * 0.25);
      const gradient = ctx.createRadialGradient(x, y, width * 0.05, x, y, width * 0.7);

      gradient.addColorStop(0, withAlpha(colors[i], 1));
      gradient.addColorStop(0.5, withAlpha(colors[(i + 1) % colors.length], 0.55));
      gradient.addColorStop(1, withAlpha('#000000', 0));

      ctx.globalAlpha = settings.intensity ?? 0.75;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();

    animationId = requestAnimationFrame(render);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function resize() {
    // Nothing specific; render loop reads canvas width/height on each frame.
  }

  function update(newSettings = {}) {
    settings = { ...settings, ...newSettings };
  }

  return { start, stop, resize, update };
}

function withAlpha(hex, alpha) {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
