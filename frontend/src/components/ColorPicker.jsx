import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Color name mapping for accessibility / color blind mode
const getClosestColorName = (r, g, b) => {
  const colors = [
    { name: 'Red', rgb: [255, 0, 0] },
    { name: 'Dark Red', rgb: [139, 0, 0] },
    { name: 'Orange', rgb: [255, 165, 0] },
    { name: 'Yellow', rgb: [255, 255, 0] },
    { name: 'Green', rgb: [0, 255, 0] },
    { name: 'Forest Green', rgb: [34, 139, 34] },
    { name: 'Blue', rgb: [0, 0, 255] },
    { name: 'Navy Blue', rgb: [0, 0, 128] },
    { name: 'Cyan / Aqua', rgb: [0, 255, 255] },
    { name: 'Teal', rgb: [0, 128, 128] },
    { name: 'Purple', rgb: [128, 0, 128] },
    { name: 'Magenta / Pink', rgb: [255, 0, 255] },
    { name: 'Brown', rgb: [165, 42, 42] },
    { name: 'White', rgb: [255, 255, 255] },
    { name: 'Light Gray', rgb: [211, 211, 211] },
    { name: 'Dark Gray', rgb: [100, 100, 100] },
    { name: 'Black', rgb: [0, 0, 0] },
  ];

  let minDistance = Infinity;
  let closestName = 'Unknown';

  colors.forEach((c) => {
    // Euclidean distance
    const dist = Math.sqrt(
      Math.pow(r - c.rgb[0], 2) +
      Math.pow(g - c.rgb[1], 2) +
      Math.pow(b - c.rgb[2], 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestName = c.name;
    }
  });

  return closestName;
};

// Math helpers
const hsvToRgb = (h, s, v) => {
  s /= 100;
  v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
};

const rgbToHex = (r, g, b) => {
  const toHex = (val) => {
    const hex = val.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export default function ColorPicker({ initialColor = { r: 255, g: 0, b: 0 }, onConfirm, onCancel }) {
  const { colorBlindMode, accessibilityMode } = useAuth();
  
  const [rgb, setRgb] = useState(initialColor);
  const [hsv, setHsv] = useState(rgbToHsv(initialColor.r, initialColor.g, initialColor.b));
  const [hex, setHex] = useState(rgbToHex(initialColor.r, initialColor.g, initialColor.b));
  
  const spectrumCanvasRef = useRef(null);
  const hueCanvasRef = useRef(null);
  const [isMouseDownSpectrum, setIsMouseDownSpectrum] = useState(false);
  const [isMouseDownHue, setIsMouseDownHue] = useState(false);

  useEffect(() => {
    drawSpectrum();
  }, [hsv.h]);

  useEffect(() => {
    drawHue();
  }, []);

  const drawSpectrum = () => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Draw main color
    ctx.fillStyle = `hsl(${hsv.h}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // Draw white gradient (left to right)
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    whiteGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw black gradient (bottom to top)
    const blackGrad = ctx.createLinearGradient(0, height, 0, 0);
    blackGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    blackGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  };

  const drawHue = () => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#ff0000');
    grad.addColorStop(0.17, '#ff00ff');
    grad.addColorStop(0.33, '#0000ff');
    grad.addColorStop(0.5, '#00ffff');
    grad.addColorStop(0.67, '#005500');
    grad.addColorStop(0.83, '#ffff00');
    grad.addColorStop(1, '#ff0000');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  };

  const updateColorFromSpectrum = (e) => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    // Calculate saturation and value from positions
    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    const newRgb = hsvToRgb(hsv.h, s, v);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsv({ ...hsv, s, v });
  };

  const updateColorFromHue = (e) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const h = Math.round((y / rect.height) * 360);
    const newRgb = hsvToRgb(h, hsv.s, hsv.v);

    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsv({ ...hsv, h });
  };

  // Input changes
  const handleRgbChange = (channel, value) => {
    const num = Math.max(0, Math.min(255, parseInt(value, 10) || 0));
    const newRgb = { ...rgb, [channel]: num };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHexChange = (value) => {
    setHex(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      const newRgb = hexToRgb(value);
      if (newRgb) {
        setRgb(newRgb);
        setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
      }
    }
  };

  const colorName = getClosestColorName(rgb.r, rgb.g, rgb.b);

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl glass-panel text-slate-100 max-w-xl w-full border border-slate-700 shadow-2xl relative">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <h3 className="text-lg font-semibold tracking-wide text-indigo-400 flex items-center gap-2">
          <span>🎨</span> RGB Precision Adjuster
        </h3>
        {colorBlindMode !== 'none' && (
          <span className="text-xs px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 font-medium border border-indigo-800/40">
            Color Blind Info: {colorName}
          </span>
        )}
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Spectrum Canvas Area */}
        <div className="relative flex-1 select-none">
          <canvas
            ref={spectrumCanvasRef}
            width={240}
            height={200}
            className="rounded-lg cursor-crosshair border border-slate-800 w-full h-[200px]"
            onMouseDown={(e) => {
              setIsMouseDownSpectrum(true);
              updateColorFromSpectrum(e);
            }}
            onMouseMove={(e) => {
              if (isMouseDownSpectrum) updateColorFromSpectrum(e);
            }}
            onMouseUp={() => setIsMouseDownSpectrum(false)}
            onMouseLeave={() => setIsMouseDownSpectrum(false)}
          />
        </div>

        {/* Hue Slider */}
        <div className="relative select-none flex justify-center">
          <canvas
            ref={hueCanvasRef}
            width={30}
            height={200}
            className="rounded-lg cursor-ns-resize border border-slate-800 h-[200px] w-[30px]"
            onMouseDown={(e) => {
              setIsMouseDownHue(true);
              updateColorFromHue(e);
            }}
            onMouseMove={(e) => {
              if (isMouseDownHue) updateColorFromHue(e);
            }}
            onMouseUp={() => setIsMouseDownHue(false)}
            onMouseLeave={() => setIsMouseDownHue(false)}
          />
        </div>

        {/* Photoshop-style Live Previews and Inputs */}
        <div className="flex flex-col gap-4 w-full md:w-[160px]">
          {/* Comparison swatch */}
          <div className="flex flex-col h-[70px] rounded-lg overflow-hidden border border-slate-800">
            <div
              className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-800 bg-white"
              style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
            >
              <span className="bg-black/50 text-white px-1.5 py-0.5 rounded shadow">NEW</span>
            </div>
            <div
              className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-800"
              style={{ backgroundColor: `rgb(${initialColor.r}, ${initialColor.g}, ${initialColor.b})` }}
            >
              <span className="bg-black/50 text-white px-1.5 py-0.5 rounded shadow">CURRENT</span>
            </div>
          </div>

          {/* RGB Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">R</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-rose-400 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">G</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">B</label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-sky-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Hex Input */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">HEX</label>
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full text-center py-1 bg-slate-900 border border-slate-700 rounded text-sm font-mono text-violet-400 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>
      </div>

      {accessibilityMode && (
        <div className="text-xs p-2 rounded bg-indigo-950/20 text-indigo-300 border border-indigo-900/20 text-center">
          Keyboard Help: Use inputs above to type color numerical values accurately.
        </div>
      )}

      {/* Footer Confirm/Cancel */}
      <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-slate-800">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm(rgb)}
          className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium shadow-md transition-all focus:outline-none hover:scale-[1.02] active:scale-[0.98]"
        >
          Confirm Color
        </button>
      </div>
    </div>
  );
}
