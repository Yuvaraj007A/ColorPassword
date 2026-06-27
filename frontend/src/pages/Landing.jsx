import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sliders, Zap, RefreshCw, EyeOff, CheckCircle, ArrowRight, UserPlus } from 'lucide-react';

export default function Landing() {
  const { navigateTo } = useAuth();

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[160px] opacity-25 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600 rounded-full blur-[160px] opacity-25 animate-pulse"></div>

      <div className="max-w-5xl w-full space-y-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex p-3.5 rounded-2xl bg-indigo-950/40 text-indigo-400 border border-indigo-800/30 mb-4 shadow glow-indigo animate-bounce">
            <Shield className="w-8 h-8" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-violet-200 to-sky-200 bg-clip-text text-transparent">
            Cryptographic Palette Authentication
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Replaces vulnerable text credentials with a secure, passwordless authentication model built on high-entropy color-sequence mapping, precision RGB tuning, and zero database plaintext leaks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              onClick={() => navigateTo('login')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              Access Secure Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigateTo('register')}
              className="px-8 py-4 bg-slate-900/60 hover:bg-slate-800/80 text-indigo-300 border border-indigo-950 hover:border-indigo-800 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Create Color Password
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="p-3 bg-indigo-950/50 text-indigo-400 border border-indigo-800/30 rounded-xl w-fit">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">RGB Precision Fine-Tuning</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Select key presets and adjust Hue, Saturation, and Lightness coordinates on a canvas matrix to create unique cryptographic sequences.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="p-3 bg-violet-950/50 text-violet-400 border border-violet-800/30 rounded-xl w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">±5 RGB Coordinate Tolerance</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No need for exact match inputs. Hashing quantization bins allow safe deviation parameters during verification without storing plain coordinates.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="p-3 bg-sky-950/50 text-sky-400 border border-sky-800/30 rounded-xl w-fit">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Shoulder-Surfing Defense</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Grid sections dynamically shuffle positioning during every login request, rendering keylogging and video capture vectors obsolete.
            </p>
          </div>
        </div>

        {/* Interactive Steps Section */}
        <div className="rounded-2xl glass-panel border border-slate-800 p-8 space-y-8">
          <h2 className="text-2xl font-bold text-slate-100 text-center tracking-tight">
            How The Ecosystem Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm mx-auto shadow shadow-indigo-500/20">
                1
              </div>
              <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider">Profile Setup</h4>
              <p className="text-slate-400 text-[11px] leading-normal">
                Register with a standard username and email address. No password field.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm mx-auto shadow shadow-indigo-500/20">
                2
              </div>
              <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider">Sequence Choice</h4>
              <p className="text-slate-400 text-[11px] leading-normal">
                Select exactly 5 primary colors in a personal sequence from a 80-color palette.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm mx-auto shadow shadow-indigo-500/20">
                3
              </div>
              <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider">Fine-Tuning</h4>
              <p className="text-slate-400 text-[11px] leading-normal">
                Adjust R, G, B coordinates for each color using the Photoshop precision sliders.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm mx-auto shadow shadow-indigo-500/20">
                4
              </div>
              <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider">Bin Quantization</h4>
              <p className="text-slate-400 text-[11px] leading-normal">
                Values round to the nearest 10, mapping coordinate deviations to stable hashes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center font-bold text-sm mx-auto shadow shadow-indigo-500/20">
                5
              </div>
              <h4 className="text-xs uppercase font-bold text-slate-200 tracking-wider">Argon2 Hashing</h4>
              <p className="text-slate-400 text-[11px] leading-normal">
                The quantized sequence generates a highly secure Argon2id hash for database validation.
              </p>
            </div>
          </div>
        </div>

        {/* Security Standards */}
        <div className="flex flex-col md:flex-row items-center justify-around p-6 rounded-2xl bg-slate-950/40 border border-slate-900 gap-4 text-xs text-slate-500 text-center md:text-left">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span>High Entropy Key Derivation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span>XSS & CSRF Secured</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span>Locked Profile protection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-500" />
            <span>Privacy Guard: No colors stored</span>
          </div>
        </div>

      </div>
    </div>
  );
}
