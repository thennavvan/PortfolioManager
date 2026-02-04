import React, { useState } from 'react';
import { getLivePrice } from '../services/api';
import '../styles/LivePriceViewer.css';

const LivePriceViewer = () => {
  const [symbol, setSymbol] = useState('');
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getLivePrice(symbol.toUpperCase());
      setPriceData(response.data);
      
      // Add to history
      if (!searchHistory.includes(symbol.toUpperCase())) {
        setSearchHistory([symbol.toUpperCase(), ...searchHistory.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch price data');
      setPriceData(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (sym) => {
    setSymbol(sym);
    setTimeout(() => {
      document.querySelector('form')?.dispatchEvent(
        new Event('submit', { bubbles: true })
      );
    }, 0);
  };

  return (
    <div className="live-price-viewer">
      <h1>Live Stock Price Viewer</h1>

      <form onSubmit={handleSearch} className="search-form">
        <div className="input-group">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL, GOOGL)"
            className="symbol-input"
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <div className="error">{error}</div>}

      {priceData && (
        <div className="price-card">
          <h2>{priceData.symbol}</h2>
          <div className="price-display">
            <p className="price-value">
              ${priceData.price?.toFixed(2) || 'N/A'}
            </p>
            <p className="price-timestamp">
              Updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {searchHistory.length > 0 && (
        <div className="search-history">
          <h3>Recent Searches</h3>
          <div className="history-buttons">
            {searchHistory.map((sym) => (
              <button
                key={sym}
                className="history-btn"
                onClick={() => handleHistoryClick(sym)}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePriceViewer;
