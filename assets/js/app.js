import playgroundConfig from '../../config/scenes.js';

const canvas = document.getElementById('scene-canvas');
const sceneSelect = document.getElementById('scene-select');
const sceneDescription = document.getElementById('scene-description');
const controlsForm = document.getElementById('controls-form');
const controlsContainer = document.getElementById('scene-controls');
const restartButton = document.getElementById('restart-button');
const fullscreenButton = document.getElementById('fullscreen-button');
const themeToggle = document.getElementById('theme-toggle');
const toast = document.getElementById('status-toast');
const root = document.querySelector('.layout');

let currentSceneConfig = null;
let sceneController = null;
let currentSettings = {};
let resizeObserver = null;
let toastTimeout = null;

init();

async function init() {
  setupThemeToggle();
  populateScenes();
  bindButtons();
  listenForResize();

  const startSceneId = playgroundConfig.defaultSceneId || playgroundConfig.scenes?.[0]?.id;
  if (startSceneId) {
    await loadScene(startSceneId, { isInitial: true });
  }
}

function setupThemeToggle() {
  const storedTheme = localStorage.getItem('playground-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(theme);
  themeToggle.checked = theme === 'dark';
  themeToggle.addEventListener('change', () => {
    setTheme(themeToggle.checked ? 'dark' : 'light');
  });
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('playground-theme', theme);
}

function populateScenes() {
  if (!Array.isArray(playgroundConfig.scenes)) return;

  sceneSelect.innerHTML = '';
  playgroundConfig.scenes.forEach((scene) => {
    const option = document.createElement('option');
    option.value = scene.id;
    option.textContent = scene.title;
    sceneSelect.appendChild(option);
  });

  sceneSelect.addEventListener('change', () => {
    const selected = sceneSelect.value;
    if (selected) {
      loadScene(selected, { announce: true });
    }
  });
}

function bindButtons() {
  restartButton.addEventListener('click', () => {
    if (currentSceneConfig) {
      loadScene(currentSceneConfig.id, { announce: true, forceRestart: true });
    }
  });

  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen?.().catch(() => {
        showToast('Fullscreen unavailable.');
      });
    } else {
      document.exitFullscreen?.();
    }
  });
}

function listenForResize() {
  resizeObserver = new ResizeObserver(() => {
    fitCanvasToContainer();
    sceneController?.resize?.();
  });
  resizeObserver.observe(canvas.parentElement);

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      fitCanvasToContainer();
      sceneController?.resize?.();
    }, 120);
  });
}

async function loadScene(sceneId, { isInitial = false, announce = false, forceRestart = false } = {}) {
  const config = playgroundConfig.scenes.find((scene) => scene.id === sceneId);
  if (!config) return;

  if (!isInitial && !forceRestart && currentSceneConfig?.id === config.id) {
    // Update settings only
    sceneController?.update?.(currentSettings);
    return;
  }

  if (sceneController?.stop) {
    sceneController.stop();
  }

  currentSceneConfig = config;
  sceneSelect.value = config.id;
  sceneDescription.textContent = config.description || '';

  fitCanvasToContainer();

  try {
    const moduleUrl = new URL(config.module, import.meta.url).href;
    const sceneModule = await import(moduleUrl);

    if (typeof sceneModule.createScene !== 'function') {
      throw new Error(`Scene "${config.title}" is missing a createScene export.`);
    }

    sceneController = sceneModule.createScene({ canvas, settings: {} });
    currentSettings = buildControls(config);
    sceneController.start?.(currentSettings);

    if (announce) {
      showToast(`${config.title} loaded`);
    }
  } catch (error) {
    console.error(error);
    showToast('Unable to load scene');
  }
}

function fitCanvasToContainer() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildControls(sceneConfig) {
  controlsForm.innerHTML = '';

  if (!Array.isArray(sceneConfig.controls) || sceneConfig.controls.length === 0) {
    controlsContainer.style.display = 'none';
    currentSettings = {};
    return currentSettings;
  }

  controlsContainer.style.display = '';

  const settings = {};

  sceneConfig.controls.forEach((control) => {
    const row = document.createElement('div');
    row.className = 'control-row';

    const label = document.createElement('label');
    label.setAttribute('for', `control-${control.id}`);
    label.textContent = control.label;
    row.appendChild(label);

    let input;
    let output;
    const initialValue = control.default ?? '';

    switch (control.type) {
      case 'range':
        input = document.createElement('input');
        input.type = 'range';
        input.min = control.min;
        input.max = control.max;
        input.step = control.step ?? 'any';
        input.value = initialValue;

        output = document.createElement('output');
        output.textContent = initialValue;
        input.addEventListener('input', () => {
          output.textContent = Number.parseFloat(input.value).toFixed(2);
          updateSettings(control.id, parseFloat(input.value));
        });
        row.appendChild(input);
        row.appendChild(output);
        break;

      case 'select':
        input = document.createElement('select');
        input.className = 'input';
        control.options?.forEach((option) => {
          const opt = document.createElement('option');
          opt.value = option.value;
          opt.textContent = option.label;
          input.appendChild(opt);
        });
        input.value = initialValue;
        input.addEventListener('change', () => {
          updateSettings(control.id, input.value);
        });
        row.appendChild(input);
        break;

      case 'color':
        input = document.createElement('input');
        input.type = 'color';
        input.value = initialValue || '#ffffff';
        input.addEventListener('input', () => {
          updateSettings(control.id, input.value);
        });
        row.appendChild(input);
        break;

      default:
        input = document.createElement('input');
        input.className = 'input';
        input.value = initialValue;
        input.addEventListener('input', () => {
          updateSettings(control.id, input.value);
        });
        row.appendChild(input);
        break;
    }

    input.id = `control-${control.id}`;
    input.name = control.id;

    settings[control.id] = control.type === 'range' ? parseFloat(initialValue) : initialValue;

    controlsForm.appendChild(row);
  });

  currentSettings = settings;
  return settings;
}

function updateSettings(key, value) {
  currentSettings = {
    ...currentSettings,
    [key]: value,
  };

  sceneController?.update?.(currentSettings);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 1800);
}

window.addEventListener('beforeunload', () => {
  sceneController?.stop?.();
  resizeObserver?.disconnect();
});
