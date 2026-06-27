import React from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';import Landing from './pages/Landing';

function AppContent() {
  const { currentView, theme, accessibilityMode, colorBlindMode } = useAuth();

  // Map active view to component
  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <Landing />;
      case 'login':
        return <Login />;
      case 'register':
        return <Register />;
      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Landing />;
    }
  };

  // Determine accessibility sizing classes
  const accessibilityClass = accessibilityMode ? 'text-lg font-medium tracking-normal scale-[1.03]' : '';
  
  // Colorblindness filter classes
  const colorBlindClass = 
    colorBlindMode === 'protanopia' ? 'filter-protanopia' :
    colorBlindMode === 'deuteranopia' ? 'filter-deuteranopia' :
    colorBlindMode === 'tritanopia' ? 'filter-tritanopia' : '';

  return (
    <div className={`min-h-screen transition-colors duration-500 relative flex flex-col justify-between animated-bg text-slate-100 ${accessibilityClass} ${colorBlindClass}`}>
      
      {/* SVG Color Blind Filters for browser rendering fallback */}
      <svg className="hidden">
        <defs>
          {/* Protanopia (Red-Green blindness, Red weak) */}
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0,     0, 0
                      0.558, 0.442, 0,     0, 0
                      0,     0.242, 0.758, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
          {/* Deuteranopia (Red-Green blindness, Green weak) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0,   0, 0
                      0.7,   0.3,   0,   0, 0
                      0,     0.3,   0.7, 0, 0
                      0,     0,     0,   1, 0"
            />
          </filter>
          {/* Tritanopia (Blue-Yellow blindness, Blue weak) */}
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95,  0.05,  0,     0, 0
                      0,     0.433, 0.567, 0, 0
                      0,     0.475, 0.525, 0, 0
                      0,     0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Main view content */}
      <main className="flex-1 flex flex-col justify-center">
        {renderView()}
      </main>

      {/* Global CSS for filters */}
      <style>{`
        .filter-protanopia { filter: url(#protanopia-filter); }
        .filter-deuteranopia { filter: url(#deuteranopia-filter); }
        .filter-tritanopia { filter: url(#tritanopia-filter); }
      `}</style>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
