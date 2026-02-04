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
  const [searchQuery, setSearchQuery] = useState('');

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
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="main-layout">
        <Header 
          currentPage={currentPage} 
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="main-content">
          {renderPage()}
        </main>

        <footer className="footer">
          <p>&copy; 2024 Portfolio Manager. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

