export function createScene({ canvas }) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let time = 0;
  let settings = {
    aFreq: 3,
    bFreq: 2,
    stroke: '#facc15',
    lineWidth: 3,
  };

  function start(initialSettings = {}) {
    settings = { ...settings, ...initialSettings };
    time = 0;
    render();
  }

  function render() {
    const { width, height } = canvas;

    ctx.fillStyle = 'rgba(8, 11, 26, 0.12)';
    ctx.fillRect(0, 0, width, height);

    const amplitude = Math.min(width, height) * 0.35;
    const points = 360;
    const phase = time * 0.002;

    ctx.save();
    ctx.translate(width / 2, height / 2);

    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const t = (i / points) * Math.PI * 2;
      const x = amplitude * Math.sin(settings.aFreq * t + phase);
      const y = amplitude * Math.sin(settings.bFreq * t);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = withAlpha(settings.stroke, 0.9);
    ctx.lineWidth = settings.lineWidth;
    ctx.shadowColor = withAlpha(settings.stroke, 0.55);
    ctx.shadowBlur = 14;
    ctx.stroke();

    ctx.restore();

    time += 16;
    animationId = requestAnimationFrame(render);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function resize() {
    // No precomputation needed; drawing uses canvas size each frame.
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
