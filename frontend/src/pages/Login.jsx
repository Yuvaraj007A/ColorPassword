import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ColorPicker from '../components/ColorPicker';
import Captcha from '../components/Captcha';
import { Shield, User, KeyRound, Check, RefreshCw } from 'lucide-react';

// Color Preset Generator (Same colors as Register, but grouped in 8 rows of 10 colors)
const generateGroupedPalette = () => {
  const hues = [0, 30, 60, 120, 180, 220, 270, 320]; // 8 hue families
  const lightnesses = [90, 80, 70, 60, 50, 40, 30, 20]; // 8 shades
  const rows = [];

  // Add Grayscale row
  const grayscale = [255, 230, 200, 170, 140, 110, 80, 50, 20, 0];
  rows.push(grayscale.map(g => ({ r: g, g: g, b: g })));

  // Add hue rows (8 rows)
  hues.forEach((h) => {
    const row = [];
    lightnesses.forEach((l) => {
      // HSL to RGB
      const s = 90;
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

      row.push({
        r: Math.round((r + m) * 255),
        g: Math.round((g_ + m) * 255),
        b: Math.round((b + m) * 255)
      });
    });
    rows.push(row);
  });

  // Add earthy row (extra 6 colors + 4 black slots)
  const earthy = [
    { r: 139, g: 69, b: 19 },
    { r: 160, g: 82, b: 45 },
    { r: 210, g: 105, b: 30 },
    { r: 244, g: 164, b: 96 },
    { r: 222, g: 184, b: 135 },
    { r: 188, g: 143, b: 143 },
    // Fill remaining 4 slots with dark blues/greens
    { r: 8, g: 47, b: 73 },
    { r: 6, g: 78, b: 59 },
    { r: 67, g: 20, b: 7 },
    { r: 4, g: 120, b: 87 }
  ];
  rows.push(earthy);

  return rows;
};

// Shuffles an array helper
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function Login() {
  const { loginUser, checkUsername, navigateTo } = useAuth();
  
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Flow control
  const [stage, setStage] = useState(1); // 1 = username check, 2 = color password
  const [shuffledRows, setShuffledRows] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]); // User selected
  const [activePickerColor, setActivePickerColor] = useState(null); // Active color being adjusted

  // Security CAPTCHA
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaSolved, setCaptchaSolved] = useState(false);

  // Initialize and randomize palette sections (rows) on login component mount
  useEffect(() => {
    const rows = generateGroupedPalette();
    const randomized = shuffleArray(rows);
    setShuffledRows(randomized);
  }, [stage]);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username) {
      setError('Username is required.');
      setLoading(false);
      return;
    }

    const res = await checkUsername(username);
    setLoading(false);

    if (res.status === 200) {
      setRequireCaptcha(res.data.requireCaptcha);
      setStage(2);
    } else {
      setError(res.data.error || 'User verification failed.');
    }
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

  const handleLogin = async () => {
    if (selectedColors.length !== 5) {
      setError('Please select all 5 sequence colors.');
      return;
    }
    if (requireCaptcha && !captchaSolved) {
      setError('Please complete the sliding security verification.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await loginUser(username, selectedColors, captchaSolved);
    setLoading(false);

    if (res.status === 200) {
      setSuccess('Identity Verified. Access granted.');
    } else {
      setError(res.data.error || 'Authentication failed.');
      // If server asks for captcha in error
      if (res.data.requireCaptcha) {
        setRequireCaptcha(true);
        setCaptchaSolved(false);
      }
      if (res.data.locked) {
        // Redirect back to username stage if locked out
        setTimeout(() => {
          setStage(1);
          setSelectedColors([]);
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl glass-panel p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Neon Glow backdrops */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600 rounded-full blur-[100px] opacity-35"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-600 rounded-full blur-[100px] opacity-35"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex p-3 rounded-full bg-indigo-950/50 text-indigo-400 border border-indigo-800/30 mb-3 glow-indigo">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-200 to-violet-200 bg-clip-text text-transparent">
            Secure Cryptographic Portal
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {stage === 1 ? 'Enter your identity credential' : 'Enter your color sequence pattern'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-sm text-center relative z-10 animate-shake">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-sm text-center relative z-10 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" /> {success}
          </div>
        )}

        {stage === 1 ? (
          /* Stage 1: Check Username */
          <form onSubmit={handleUsernameSubmit} className="space-y-6 relative z-10">
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
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? 'Authenticating...' : 'Validate Credentials'}
            </button>
          </form>
        ) : (
          /* Stage 2: Color Password Picker */
          <div className="space-y-6 relative z-10">
            {/* Password Sequence slots */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block">
                Enter Graphical Password ({selectedColors.length} of 5)
              </span>
              <div className="flex gap-4 justify-between bg-slate-950/80 p-4 rounded-xl border border-slate-900 min-h-[76px]">
                {[...Array(5)].map((_, idx) => {
                  const hasColor = idx < selectedColors.length;
                  const color = hasColor ? selectedColors[idx] : null;
                  return (
                    <div
                      key={idx}
                      className="relative w-12 h-12 rounded-lg border border-dashed border-slate-700 flex items-center justify-center group overflow-hidden transition-all shadow"
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
                          Clear
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {activePickerColor ? (
              /* Color Precision adjustments */
              <div className="flex justify-center py-2 animate-fadeIn">
                <ColorPicker
                  initialColor={activePickerColor}
                  onConfirm={handleConfirmFineTune}
                  onCancel={() => setActivePickerColor(null)}
                />
              </div>
            ) : (
              /* Randomized Color Palette Grid */
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <span>Palette grid</span>
                    <span className="text-[10px] text-slate-500 font-normal normal-case">
                      (Positions randomized for security)
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setStage(1);
                      setSelectedColors([]);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Change Username
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-950/50 border border-slate-900 select-none">
                  {shuffledRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="grid grid-cols-10 gap-1.5">
                      {row.map((color, colIdx) => (
                        <button
                          key={colIdx}
                          onClick={() => handlePaletteTileClick(color)}
                          disabled={selectedColors.length >= 5}
                          className="aspect-square w-full rounded-md border border-black/20 hover:scale-110 active:scale-95 transition-all shadow-sm focus:outline-none disabled:opacity-40 disabled:hover:scale-100"
                          style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                          title={`Color RGB: ${color.r}, ${color.g}, ${color.b}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Captcha rendering */}
            {requireCaptcha && (
              <Captcha onSolved={(solved) => setCaptchaSolved(solved)} />
            )}

            <button
              onClick={handleLogin}
              disabled={selectedColors.length !== 5 || loading || (requireCaptcha && !captchaSolved)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl font-medium shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? 'Decrypting Hash...' : 'Verify Cryptographic Identity'}
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-900 pt-5 flex justify-center gap-4 flex-wrap">
          <div>
            New terminal access?{' '}
            <button
              onClick={() => navigateTo('register')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline focus:outline-none"
            >
              Create Color Password
            </button>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div>
            Lost access?{' '}
            <button
              onClick={() => navigateTo('forgot-password')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
