import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Holdings from './pages/Holdings.jsx';
import AssetManagement from './pages/AssetManagement.jsx';
import LivePriceViewer from './pages/LivePriceViewer.jsx';
import Performance from './pages/Performance.jsx';
import './styles/App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'holdings':
        return <Holdings />;
      case 'assets':
        return <AssetManagement />;
      case 'prices':
        return <LivePriceViewer />;
      case 'performance':
        return <Performance />;
      default:
        return <Dashboard />;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // TODO: Implement search functionality
  };

  return (
    <div className="app">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <div className={`main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header currentPage={currentPage} />

        <main className="main-content">
          {renderPage()}
        </main>

        <footer className="footer">
          <p>&copy; Team Thrive - PortfolioManager</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

