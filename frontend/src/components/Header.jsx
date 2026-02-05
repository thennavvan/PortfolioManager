import React, { useState, useEffect } from 'react';
import { exportPortfolioPDF } from '../services/pdfExport';
import '../styles/Header.css';

const Header = ({ currentPage }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Check system preference and localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setIsDarkMode(savedMode === 'dark');
      applyTheme(savedMode === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      applyTheme(prefersDark);
    }
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('themeMode', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('themeMode', 'light');
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportPortfolioPDF();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      holdings: 'Portfolio Holdings',
      assets: 'Asset Management',
      prices: 'Live Prices',
      performance: 'Performance'
    };
    return titles[currentPage] || 'Portfolio Manager';
  };

  return (
    <header className="header">
      <div className="header-content">
        <h2 className="header-title">{getPageTitle()}</h2>
        <div className="header-actions">
          <button 
            className="export-btn" 
            onClick={handleExportPDF}
            disabled={isExporting}
            title="Export Portfolio as PDF"
          >
            {isExporting ? 'Exporting...' : <><svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 18 15 15"/></svg> Export Portfolio as PDF</>}
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
