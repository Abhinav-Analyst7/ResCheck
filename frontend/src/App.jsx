import React, { useState, useEffect } from 'react';
import ResCheckLanding from './ResCheckLanding';
import ScreeningDashboard from './ScreeningDashboard';
import Custom_scrollbar from './Custom_scrollbar';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); 
  const [dashboardTab, setDashboardTab] = useState('single'); 
  const [darkMode, setDarkMode] = useState(true);

  // Sync browser back/forward buttons with state navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page === 'dashboard') {
        setCurrentPage('dashboard');
        if (event.state.tab) setDashboardTab(event.state.tab);
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle seamless programmatic page & tab transitions
  const handleNavigate = (page = 'landing', tab = 'single') => {
    if (page === 'dashboard' || tab === 'single' || tab === 'batch') {
      setDashboardTab(tab);
      setCurrentPage('dashboard');
      window.history.pushState({ page: 'dashboard', tab }, '', '/dashboard');
    } else {
      setCurrentPage('landing');
      window.history.pushState({ page: 'landing' }, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`w-full min-h-screen relative font-sans transition-colors duration-300 ${
      darkMode ? 'bg-[#0e0f11] text-[#e1e4e8]' : 'bg-[#f8f9fa] text-[#1f2328]'
    }`}>
      {/* Universal Scrollbar Styling */}
      <Custom_scrollbar />

      {/* Page Routing */}
      {currentPage === 'landing' ? (
        <ResCheckLanding 
          onNavigate={(tab) => handleNavigate('dashboard', tab)} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />
      ) : (
        <ScreeningDashboard 
          initialTab={dashboardTab} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        />
      )}
    </div>
  );
}