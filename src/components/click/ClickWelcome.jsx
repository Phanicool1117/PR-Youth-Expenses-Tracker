import React from 'react';
import { ArrowLeft, Sparkles, FolderSync, Cloud, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '../../utils/hapticsSound';

export function ClickWelcome({ onContinue, onBackToTracker }) {
  const handleContinue = () => {
    triggerHaptic(15);
    if (onContinue) onContinue();
  };

  const handleBack = () => {
    triggerHaptic(10);
    if (onBackToTracker) onBackToTracker();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#258bf7] via-[#52a7ff] to-[#99cdff] text-white select-none">
      
      {/* Background Decorative Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Fluffy Cloud Blobs */}
        <div className="absolute -top-10 -left-16 w-72 h-44 bg-white/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-28 -right-20 w-80 h-52 bg-white/25 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-10 w-96 h-48 bg-white/15 rounded-full blur-3xl" />
      </div>

      {/* Top Bar Navigation */}
      <div className="relative z-20 flex items-center justify-between p-4 sm:p-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tracker</span>
        </button>

        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white/95">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Penumuli Youth Archive</span>
        </div>
      </div>

      {/* Hero Content Section */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-md mx-auto pt-2 pb-6">
        
        {/* Frosted Glass Icon Badge with Scalloped 3D Icon (Ref Image 1 & 2) */}
        <div className="mb-5 relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/25 border-2 border-white/50 backdrop-blur-xl shadow-2xl shadow-blue-900/30 flex items-center justify-center p-3.5 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/click-icon.png"
              alt="Click App Icon"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          {/* Subtle glow aura */}
          <div className="absolute -inset-2 bg-blue-300/30 rounded-3xl blur-lg -z-10 animate-pulse" />
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 mb-4">
          <p className="text-sm sm:text-base font-semibold tracking-wide text-blue-100">
            Welcome to
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            Click
          </h1>
          <p className="text-xs sm:text-sm text-blue-50/90 font-medium max-w-xs mx-auto leading-relaxed pt-1">
            A place to keep our days with note, photo, and tape.
          </p>
        </div>

      </div>

      {/* Polaroid Memories Collage & Ripped Paper Section (Ref Image 2) */}
      <div className="relative z-20 w-full max-w-md mx-auto">
        
        {/* Layered Polaroid Cards Fan-Out */}
        <div className="relative h-44 sm:h-48 w-full flex items-center justify-center px-4">
          
          {/* Left Polaroid (Tilted -8deg) */}
          <div className="absolute left-6 bottom-4 w-32 sm:w-36 bg-white p-2 pb-5 rounded-lg shadow-xl shadow-blue-950/20 transform -rotate-8 transition-transform hover:-rotate-4 hover:scale-105 z-10">
            <div className="w-full h-20 sm:h-24 bg-gradient-to-tr from-amber-400 to-orange-500 rounded flex items-center justify-center overflow-hidden">
              <img
                src="/Logo.png"
                alt="Ganesh Festival"
                className="w-12 h-12 object-contain drop-shadow"
              />
            </div>
            <p className="text-[8px] font-bold text-slate-600 text-center pt-1.5 truncate">Sri Vinayaka 2026</p>
          </div>

          {/* Center Main Polaroid (Slightly tilted 3deg) */}
          <div className="absolute bottom-2 w-36 sm:w-40 bg-white p-2.5 pb-6 rounded-lg shadow-2xl shadow-blue-950/30 transform rotate-2 transition-transform hover:rotate-0 hover:scale-105 z-20">
            <div className="w-full h-24 sm:h-28 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded flex items-center justify-center overflow-hidden">
              <div className="text-center text-white">
                <Sparkles className="w-8 h-8 mx-auto text-amber-300 animate-bounce" />
                <p className="text-[9px] font-black tracking-wider uppercase pt-1">Laddu Auction</p>
              </div>
            </div>
            <p className="text-[9px] font-extrabold text-slate-800 text-center pt-1.5 truncate">Youth Celebrations</p>
          </div>

          {/* Right Polaroid (Tilted 10deg) */}
          <div className="absolute right-6 bottom-5 w-32 sm:w-36 bg-white p-2 pb-5 rounded-lg shadow-xl shadow-blue-950/20 transform rotate-10 transition-transform hover:rotate-6 hover:scale-105 z-10">
            <div className="w-full h-20 sm:h-24 bg-gradient-to-tr from-emerald-400 to-teal-600 rounded flex items-center justify-center overflow-hidden">
              <div className="text-center text-white">
                <ImageIcon className="w-7 h-7 mx-auto text-emerald-100" />
                <p className="text-[8px] font-bold">Annadanam</p>
              </div>
            </div>
            <p className="text-[8px] font-bold text-slate-600 text-center pt-1.5 truncate">Devotees & Prasadam</p>
          </div>

        </div>

        {/* Torn / Ripped Paper White Bottom Card Container */}
        <div className="relative bg-white pt-6 pb-8 px-6 rounded-t-[32px] shadow-2xl text-slate-800">
          
          {/* Subtle Ripped Paper Zigzag SVG Divider on top */}
          <div className="absolute -top-3 left-0 right-0 h-4 overflow-hidden pointer-events-none opacity-90">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-white">
              <path d="M0,0 L50,15 L100,2 L150,18 L200,4 L250,16 L300,1 L350,17 L400,3 L450,15 L500,2 L550,18 L600,4 L650,16 L700,2 L750,17 L800,3 L850,15 L900,1 L950,18 L1000,4 L1050,16 L1100,2 L1150,17 L1200,0 L1200,120 L0,120 Z" />
            </svg>
          </div>

          {/* Action Button: Continue (Deep Dark Rounded Pill) */}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-4 px-6 rounded-full bg-[#18181b] hover:bg-black text-white font-extrabold text-sm shadow-xl shadow-slate-900/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue</span>
          </button>

          <p className="text-[10px] text-center text-slate-400 font-semibold pt-3">
            Synced live with Google Drive Archive
          </p>

        </div>

      </div>

    </div>
  );
}
