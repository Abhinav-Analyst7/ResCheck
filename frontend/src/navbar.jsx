import React from 'react';
import { Hexagon, Sun, Moon } from 'lucide-react';

export default function Navbar({ onNavigate, darkMode, setDarkMode }) {
  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 flex justify-center">
      <nav className="w-full max-w-5xl px-6 py-3 rounded-full bg-white/25 dark:bg-white/15 backdrop-blur-2xl border border-white/30 shadow-lg flex items-center justify-between transition-all">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate && onNavigate('landing')}
        >
          <div className="p-1.5 rounded-xl bg-white/30 text-white border border-white/40 backdrop-blur-md transition-transform group-hover:scale-105">
            <Hexagon size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">ResCheck</span>
        </div>

        {/* Center Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode && setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/20 border border-white/30 text-amber-300 hover:bg-white/30 transition-all cursor-pointer backdrop-blur-md"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
          </button>

          <button className="hidden md:block text-sm font-medium text-white/90 hover:text-white transition-colors px-2">
            Sign In
          </button>

          <button 
            onClick={() => onNavigate && onNavigate('single')}
            className="px-5 py-2 rounded-full text-xs md:text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all shadow-md hover:scale-[1.02] cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>

      </nav>
    </header>
  );
}