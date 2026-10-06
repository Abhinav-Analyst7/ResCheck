import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function ResCheckLanding({ onNavigate, darkMode, setDarkMode }) {
  const calmReassuringSentences = [
    "Recruitment doesn't have to be overwhelming. Let AI take the stress off your plate.",
    "Precision screening you can trust—giving you back hours on every hiring search.",
    "Focus on building human connections while our engine surfaces top talent effortlessly.",
    "Total clarity for hiring teams. Smarter decisions made with complete peace of mind."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); 
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % calmReassuringSentences.length);
        setFade(true); 
      }, 400);
    }, 4800);

    return () => clearInterval(interval);
  }, [calmReassuringSentences.length]);

  return (
    <div className="relative w-full bg-black text-white font-sans selection:bg-white selection:text-black">
      
      {/* 
        ========================================================
        1. HERO SECTION (Carpet Base - Sticky Background)
        ========================================================
      */}
      <section className="sticky top-0 h-screen w-full z-0 overflow-hidden flex flex-col justify-between pt-28 pb-10 px-6">
        
        {/* Background Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/background-video.mp4" type="video/mp4" />
        </video>

        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[1px]" />

        {/* Floating Glassmorphic iOS Navbar */}
        <Navbar onNavigate={onNavigate} darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Centered Rotating Ticker & Action Button */}
        <main className="relative z-10 max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center -mt-16 md:-mt-24 text-center my-auto">
          <div className="w-full h-65 md:h-75 flex items-center justify-center px-2">
            <h1 
              className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.2] text-white drop-shadow-xl transition-all duration-700 ease-in-out ${
                fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.99]'
              }`}
            >
              "{calmReassuringSentences[currentIndex]}"
            </h1>
          </div>

          <div className="mt-2">
            <button 
              onClick={() => onNavigate && onNavigate('single')}
              className="flex items-center gap-3 bg-white text-black pl-8 pr-3 py-3.5 rounded-full font-bold text-base hover:bg-gray-100 transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95"
            >
              Start Screening
              <span className="bg-black text-white rounded-full p-2 flex items-center justify-center">
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </main>

        <footer className="relative z-10 text-center text-xs text-white/70 tracking-wider uppercase font-medium drop-shadow-sm">
          ResCheck AI • Intelligent Semantic Matching Pipeline
        </footer>
      </section>

      {/* 
        ========================================================
        2. EDITORIAL OVERLAPPING CARPET SECTION
        ========================================================
      */}
      <section className="relative z-10 min-h-screen bg-[#070708] text-white rounded-t-[3rem] border-t border-white/10 shadow-[0_-25px_60px_rgba(0,0,0,0.95)] px-6 md:px-12 py-16">
        
        {/* Top Minimalist Metadata Grid (Editorial Header) */}
        <div className="grid grid-cols-2 md:grid-cols-5 border-b border-white/15 pb-6 text-[11px] font-mono tracking-widest uppercase text-gray-400 gap-4 mb-16">
          <div className="md:border-r border-white/15 pr-4">
            <span className="text-white font-bold">01</span> ENGINE
          </div>
          <div className="md:border-r border-white/15 pr-4">
            <span className="text-white font-bold">02</span> FASTAPI + NLP
          </div>
          <div className="md:border-r border-white/15 pr-4">
            <span className="text-white font-bold">03</span> 99% PRECISION
          </div>
          <div className="md:border-r border-white/15 pr-4">
            <span className="text-white font-bold">04</span> BATCH RANKING
          </div>
          <div>
            <span className="text-white font-bold">05</span> EDITION 2026
          </div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          
          {/* Giant Oversized Editorial Typography Background */}
          <div className="relative select-none pointer-events-none -mb-16 md:-mb-28 z-0">
            <h2 className="text-[14vw] font-black uppercase tracking-tighter leading-none text-white/10">
              SMART MATCH
            </h2>
          </div>

          {/* Layered Showcase Block */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-8">
            
            {/* Main Central Media Card */}
            <div className="lg:col-span-9 relative rounded-3xl overflow-hidden border border-white/15 bg-linear-to-br from-zinc-900 via-black to-zinc-950 p-8 md:p-12 shadow-2xl min-h-105 flex flex-col justify-between">
              
              {/* Glassmorphic Stat Overlay (Top Left) */}
              <div className="max-w-xs bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-gray-300 font-mono mb-2">
                  <span>Engine Output</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                  99% Match
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  AI-driven semantic vector calculations comparing candidate profiles against requirements in real-time.
                </p>
              </div>

              {/* Bottom Card Title */}
              <div className="mt-12">
                <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                  REDEFINING TALENT ACQUISITION
                </h4>
                <p className="text-sm text-gray-400 max-w-lg">
                  Instantly uncover skill gaps, rank applicants semantically, and eliminate recruiter fatigue.
                </p>
              </div>

            </div>

            {/* Vibrant Yellow High-Contrast Badge (Bottom-Right Overlap) */}
            <div className="lg:col-span-3 bg-yellow-400 text-black rounded-3xl p-8 font-mono flex flex-col justify-between h-full min-h-70 shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-80">
                <span>RESCHECK®</span>
                <ArrowUpRight size={20} />
              </div>
              <div>
                <h5 className="text-2xl font-black uppercase leading-tight mb-2">
                  AUTOMATED ATS RANKING
                </h5>
                <p className="text-xs font-semibold text-black/80">
                  35.6762° N<br />
                  139.6503° E<br />
                  2026 EDITION
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Editorial Prose & Bracketed CTA Button */}
          <div className="mt-16 pt-8 border-t border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed font-light">
              ResCheck is engineered around a single philosophy: eliminate manual friction without losing semantic precision, openness, or connection to top talent.
            </p>

            <button 
              onClick={() => onNavigate && onNavigate('single')}
              className="group flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-white hover:text-yellow-400 transition-colors cursor-pointer"
            >
              <span>&#123;</span>
              <span className="underline underline-offset-8 decoration-white/30 group-hover:decoration-yellow-400">VIEW FULL ENGINE DASHBOARD</span>
              <span>&#125;</span>
            </button>
          </div>

        </div>

      </section>

    </div>
  );
}