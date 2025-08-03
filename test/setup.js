import '@testing-library/jest-dom';

// Mock canvas methods for game testing
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
  rect: jest.fn(),
  closePath: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  drawImage: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  setLineDash: jest.fn(),
  getLineDash: jest.fn(() => []),
  lineDashOffset: 0,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  filter: 'none',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'ltr',
  font: '10px sans-serif',
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Setup global test utilities
global.createMockKeyboardEvent = (key, type = 'keydown') => {
  return new KeyboardEvent(type, {
    key,
    code: key,
    keyCode: key.charCodeAt(0),
    which: key.charCodeAt(0),
    bubbles: true,
  });
};