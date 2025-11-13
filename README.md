# Sensory Visual Playground

Config-driven ambient visuals you can remix, publish, and drop into any space. Each scene is a standalone ES module that paints on a fullscreen canvas—no bundlers, no dependencies, just HTML/CSS/JS.

## Features
- **Scene picker** – Switch between visuals defined in `config/scenes.js`.
- **Live controls** – Sliders, color pickers, and selects map straight to scene settings.
- **Canvas aware** – Resizes with its container and runs smoothly on high-DPI displays.
- **Theme toggle** – Dark/light mode with persisted preference.

## Quick start
1. Fork or download the folder.
2. Open `index.html` locally (double-click or host with `npx serve`).
3. Edit `config/scenes.js` to add or tweak scenes.
4. Deploy the directory to GitHub Pages, Netlify, Vercel, or any static host.

## Config structure
`config/scenes.js` exports an object with a default scene id and a list of scenes:

```js
export default {
  defaultSceneId: 'aurora-gradient',
  scenes: [
    {
      id: 'aurora-gradient',
      title: 'Aurora Gradient Drift',
      description: 'Soft flowing bands of color with shimmer and easeful motion.',
      module: '../scenes/aurora-gradient.js',
      controls: [
        { id: 'speed', label: 'Drift speed', type: 'range', min: 0.1, max: 2, step: 0.1, default: 0.6 },
        // ...more controls
      ],
    },
  ],
};
```

Supported control types out of the box: `range`, `select`, `color`, and fallback text inputs. Each control populates the settings object passed to the scene module’s `start` and `update` methods.

## Scene API
Every scene in `assets/scenes/` should export `createScene`:

```js
export function createScene({ canvas }) {
  const ctx = canvas.getContext('2d');
  let settings = {};

  function start(initialSettings) {
    settings = { ...settings, ...initialSettings };
    loop();
  }

  function update(nextSettings) {
    settings = { ...settings, ...nextSettings };
  }

  function resize() {
    // optional, called whenever the canvas size changes
  }

  function stop() {
    cancelAnimationFrame(frameId);
  }

  return { start, update, resize, stop };
}
```

Use `settings` to drive animation speed, colors, etc. Keep modules side-effect free so they hot-swap cleanly.

## Included scenes
- `aurora-gradient` – Flowing radial gradients with adjustable palettes and intensity.
- `particle-drift` – Ambient particle system with trails and color controls.
- `lissajous-loop` – Oscillating line art with tweakable frequencies.

## Deploy
- **GitHub Pages**: push to a repo, enable Pages (`main` + `/`).
- **Netlify / Vercel**: choose “static site” and point to the project root.
- **Local installation**: run `npx serve` (or any static server) and open the link.

## Make it yours
1. Duplicate an existing scene module and adjust the rendering logic.
2. Add a matching entry in `config/scenes.js` with any controls you want to expose.
3. Share your fork as a template so others can plug in their own sensory set.

Have fun experimenting—and feel free to add ambient audio hooks, MIDI inputs, or hardware integrations on top of this foundation.
