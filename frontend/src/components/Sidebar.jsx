import React, { useState } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage, isCollapsed, setIsCollapsed }) => {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'holdings', label: 'Portfolio Holdings' },
    { id: 'assets', label: 'Assets' },
    { id: 'prices', label: 'Live Prices' },
    { id: 'performance', label: 'Performance' }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          ☰
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
