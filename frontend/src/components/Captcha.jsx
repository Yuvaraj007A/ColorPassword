import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowRight, LockKeyholeOpen } from 'lucide-react';

export default function Captcha({ onSolved }) {
  const [sliderValue, setSliderValue] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleStart = () => {
    if (isSolved) return;
    setIsDragging(true);
  };

  const handleMove = (clientX) => {
    if (!isDragging || isSolved || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width - 52; // subtract handle width
    const offset = clientX - rect.left - 26; // center handle on cursor
    
    const percentage = Math.max(0, Math.min(100, (offset / width) * 100));
    setSliderValue(percentage);

    if (percentage >= 98) {
      setIsSolved(true);
      setIsDragging(false);
      setSliderValue(100);
      onSolved(true);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (!isSolved) {
          setSliderValue(0);
        }
      }
    };

    const handleMouseMove = (e) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging, isSolved]);

  return (
    <div className="space-y-2 mt-4 select-none">
      <label className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
        Security Captcha Required (Slide to Unlock)
      </label>
      
      <div 
        ref={containerRef}
        className={`relative h-12 w-full rounded-xl flex items-center justify-center border transition-all duration-300 ${
          isSolved 
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}
        style={{ touchAction: 'none' }}
      >
        <span className="text-xs font-medium tracking-wide">
          {isSolved ? 'Security Verification Passed' : 'Drag slider right to verify'}
        </span>

        {/* Draggable handle */}
        <div
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          className={`absolute left-1 top-1 bottom-1 w-10 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors duration-200 ${
            isSolved 
              ? 'bg-emerald-500 text-slate-950' 
              : isDragging 
                ? 'bg-indigo-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          style={{ 
            transform: `translateX(${sliderValue * 0.01 * (containerRef.current ? containerRef.current.clientWidth - 48 : 0)}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {isSolved ? (
            <LockKeyholeOpen className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}
