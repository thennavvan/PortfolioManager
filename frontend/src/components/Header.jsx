import React from 'react';
import '../styles/Header.css';

const Header = ({ currentPage, onSearch, searchQuery, setSearchQuery }) => {
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
        <form className="search-form" onSubmit={onSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search assets, holdings, prices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>
      </div>
    </header>
  );
};

export default Header;
