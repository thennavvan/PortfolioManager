import React, { useState, useEffect } from 'react';
import '../styles/Header.css';

const Header = ({ currentPage }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

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
        <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;
