import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ currentPage, setCurrentPage, isCollapsed, setIsCollapsed }) => {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'holdings', label: 'Portfolio Holdings' },
    { id: 'assets', label: 'Assets' },
    { id: 'performance', label: 'Performance' }
  ];

  const handleNavClick = (itemId) => {
    console.log('Navigating to:', itemId);
    setCurrentPage(itemId);
  };

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
        {!isCollapsed && <span className="logo-text">FinSight</span>}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
            {isCollapsed && <span className="nav-label-short">{item.label.charAt(0)}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
