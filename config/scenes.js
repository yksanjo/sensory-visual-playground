const playgroundConfig = {
  defaultSceneId: 'aurora-gradient',
  scenes: [
    {
      id: 'aurora-gradient',
      title: 'Aurora Gradient Drift',
      description: 'Soft flowing bands of color with shimmer and easeful motion.',
      module: '../scenes/aurora-gradient.js',
      controls: [
        {
          id: 'speed',
          label: 'Drift speed',
          type: 'range',
          min: 0.1,
          max: 2,
          step: 0.1,
          default: 0.6,
        },
        {
          id: 'intensity',
          label: 'Glow intensity',
          type: 'range',
          min: 0.2,
          max: 1,
          step: 0.05,
          default: 0.75,
        },
        {
          id: 'palette',
          label: 'Palette',
          type: 'select',
          default: 'violet-dawn',
          options: [
            { label: 'Violet Dawn', value: 'violet-dawn' },
            { label: 'Ocean Mist', value: 'ocean-mist' },
            { label: 'Solar Flare', value: 'solar-flare' },
          ],
        },
      ],
    },
    {
      id: 'particle-drift',
      title: 'Particle Drift',
      description: 'Hundreds of glowing particles wander, collide, and regroup.',
      module: '../scenes/particle-drift.js',
      controls: [
        {
          id: 'count',
          label: 'Particle count',
          type: 'range',
          min: 50,
          max: 400,
          step: 10,
          default: 180,
        },
        {
          id: 'speed',
          label: 'Velocity',
          type: 'range',
          min: 0.2,
          max: 1.8,
          step: 0.1,
          default: 0.9,
        },
        {
          id: 'trail',
          label: 'Trail persistence',
          type: 'range',
          min: 0.6,
          max: 0.98,
          step: 0.01,
          default: 0.9,
        },
        {
          id: 'color',
          label: 'Particle color',
          type: 'color',
          default: '#7dd3fc',
        },
      ],
    },
    {
      id: 'lissajous-loop',
      title: 'Lissajous Loop',
      description: 'Geometric line art tracing hypnotic oscillations.',
      module: '../scenes/lissajous-loop.js',
      controls: [
        {
          id: 'aFreq',
          label: 'Horizontal frequency',
          type: 'range',
          min: 1,
          max: 9,
          step: 1,
          default: 3,
        },
        {
          id: 'bFreq',
          label: 'Vertical frequency',
          type: 'range',
          min: 1,
          max: 9,
          step: 1,
          default: 2,
        },
        {
          id: 'stroke',
          label: 'Stroke color',
          type: 'color',
          default: '#facc15',
        },
        {
          id: 'lineWidth',
          label: 'Line width',
          type: 'range',
          min: 1,
          max: 8,
          step: 0.5,
          default: 3,
        },
      ],
    },
  ],
};

export default playgroundConfig;

if (typeof window !== 'undefined') {
  window.playgroundConfig = playgroundConfig;
}
