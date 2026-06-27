import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ColorPicker from '../components/ColorPicker';
import { Shield, Mail, User, Check, ArrowRight } from 'lucide-react';

// Generates an 80-color grid similar to standard system pickers
const generatePresetPalette = () => {
  const hues = [0, 30, 60, 120, 180, 220, 270, 320]; // 8 hue families
  const lightnesses = [90, 80, 70, 60, 50, 40, 30, 20]; // 8 shades
  const colors = [];

  // Add Grayscale row first (10 shades)
  const grayscale = [255, 230, 200, 170, 140, 110, 80, 50, 20, 0];
  grayscale.forEach(g => {
    colors.push({ r: g, g: g, b: g });
  });

  // Add saturated colors (8 hues x 8 shades = 64 colors)
  hues.forEach((h) => {
    lightnesses.forEach((l) => {
      // Simple HSL to RGB conversion
      const s = 90; // High saturation
      const c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l / 100 - c / 2;
      let r = 0, g_ = 0, b = 0;

      if (h >= 0 && h < 60) { r = c; g_ = x; b = 0; }
      else if (h >= 60 && h < 120) { r = x; g_ = c; b = 0; }
      else if (h >= 120 && h < 180) { r = 0; g_ = c; b = x; }
      else if (h >= 180 && h < 240) { r = 0; g_ = x; b = c; }
      else if (h >= 240 && h < 300) { r = x; g_ = 0; b = c; }
      else if (h >= 300 && h < 360) { r = c; g_ = 0; b = x; }

      colors.push({
        r: Math.round((r + m) * 255),
        g: Math.round((g_ + m) * 255),
        b: Math.round((b + m) * 255)
      });
    });
  });

  // Add 6 extra earthy/brown tones to make it exactly 80 colors
  const earthy = [
    { r: 139, g: 69, b: 19 },
    { r: 160, g: 82, b: 45 },
    { r: 210, g: 105, b: 30 },
    { r: 244, g: 164, b: 96 },
    { r: 222, g: 184, b: 135 },
    { r: 188, g: 143, b: 143 }
  ];
  earthy.forEach(col => colors.push(col));

  return colors;
};

const PALETTE = generatePresetPalette();

export default function Register() {
  const { registerUser, navigateTo, colorBlindMode } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Flow control
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedColors, setSelectedColors] = useState([]); // Max 5 colors
  const [activePickerColor, setActivePickerColor] = useState(null); // The color being fine-tuned
  const [activePickerIndex, setActivePickerIndex] = useState(null);

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email) {
      setError('Please fill in all details.');
      return;
    }
    // Simple email check
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setFormSubmitted(true);
  };

  const handlePaletteTileClick = (color) => {
    if (selectedColors.length >= 5) return;
    setActivePickerColor(color);
  };

  const handleConfirmFineTune = (fineTunedColor) => {
    setSelectedColors([...selectedColors, fineTunedColor]);
    setActivePickerColor(null);
  };

  const handleRemoveColor = (indexToRemove) => {
    setSelectedColors(selectedColors.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRegister = async () => {
    if (selectedColors.length !== 5) {
      setError('You must select exactly 5 colors in order.');
      return;
    }
    setLoading(true);
    setError('');

    const res = await registerUser(username, email, selectedColors);
    setLoading(false);

    if (res.status === 201) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigateTo('login');
      }, 2000);
    } else {
      setError(res.data.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl glass-panel p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600 rounded-full blur-[100px] opacity-35"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-600 rounded-full blur-[100px] opacity-35"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3 rounded-full bg-indigo-950/50 text-indigo-400 border border-indigo-800/30 mb-3 glow-indigo">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">
            Create Graphical Account
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Secure your credentials with a 5-step color sequence
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm text-center relative z-10">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-sm text-center relative z-10 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        {!formSubmitted ? (
          /* Step 1: Input details */
          <form onSubmit={handleDetailsSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2 group hover:scale-[1.01] active:scale-[0.99]"
            >
              Continue to Color Password <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          /* Step 2: Set color password */
          <div className="space-y-6 relative z-10">
            {/* Display sequence slots */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block">
                Your Password Sequence ({selectedColors.length} of 5)
              </span>
              <div className="flex gap-4 justify-between bg-slate-950/80 p-4 rounded-xl border border-slate-900 min-h-[76px]">
                {[...Array(5)].map((_, idx) => {
                  const hasColor = idx < selectedColors.length;
                  const color = hasColor ? selectedColors[idx] : null;
                  return (
                    <div
                      key={idx}
                      className="relative w-12 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center group overflow-hidden transition-all duration-300 shadow"
                      style={{
                        backgroundColor: hasColor ? `rgb(${color.r}, ${color.g}, ${color.b})` : 'transparent',
                        borderColor: hasColor ? 'rgba(255,255,255,0.2)' : undefined,
                      }}
                    >
                      {!hasColor ? (
                        <span className="text-slate-600 font-bold text-sm">{idx + 1}</span>
                      ) : (
                        <button
                          onClick={() => handleRemoveColor(idx)}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {activePickerColor ? (
              /* Fine tune overlay/panel */
              <div className="flex justify-center py-2 animate-fadeIn">
                <ColorPicker
                  initialColor={activePickerColor}
                  onConfirm={handleConfirmFineTune}
                  onCancel={() => setActivePickerColor(null)}
                />
              </div>
            ) : (
              /* Color Palette Grid */
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Select a color to fine tune:
                  </span>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Edit Username/Email
                  </button>
                </div>

                <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl bg-slate-950/50 border border-slate-900 select-none">
                  {PALETTE.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePaletteTileClick(color)}
                      disabled={selectedColors.length >= 5}
                      className="aspect-square w-full rounded-md border border-black/20 hover:scale-110 active:scale-95 transition-all shadow-sm focus:outline-none disabled:opacity-40 disabled:hover:scale-100"
                      style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                      title={`Color RGB: ${color.r}, ${color.g}, ${color.b}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={selectedColors.length !== 5 || loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? 'Creating Account...' : 'Complete Secure Registration'}
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-900 pt-5">
          Already have an account?{' '}
          <button
            onClick={() => navigateTo('login')}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline focus:outline-none"
          >
            Access Portal
          </button>
        </div>
      </div>
    </div>
  );
}
