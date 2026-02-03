import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Holdings } from './pages/HoldingsPage';
import { AssetsManagement } from './pages/AssetsManagement';
import { LivePriceViewer } from './pages/LivePriceViewer';
import './App.css';

function App() {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>Portfolio Manager</h1>
          </div>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${activeNav === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveNav('dashboard')}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/holdings"
                className={`nav-link ${activeNav === 'holdings' ? 'active' : ''}`}
                onClick={() => setActiveNav('holdings')}
              >
                Holdings
              </Link>
            </li>
            <li>
              <Link
                to="/assets"
                className={`nav-link ${activeNav === 'assets' ? 'active' : ''}`}
                onClick={() => setActiveNav('assets')}
              >
                Assets Management
              </Link>
            </li>
            <li>
              <Link
                to="/price"
                className={`nav-link ${activeNav === 'price' ? 'active' : ''}`}
                onClick={() => setActiveNav('price')}
              >
                Live Price
              </Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/holdings" element={<Holdings />} />
            <Route path="/assets" element={<AssetsManagement />} />
            <Route path="/price" element={<LivePriceViewer />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 Portfolio Manager. Real-time portfolio tracking.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
