import React, { useState } from 'react';
import { getLivePrice, getPriceHistory } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/LivePriceViewer.css';

const LivePriceViewer = () => {
  const [symbol, setSymbol] = useState('');
  const [priceData, setPriceData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
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
      setHistoryData(null);
      
      // Fetch current price
      const priceResponse = await getLivePrice(symbol.toUpperCase());
      setPriceData(priceResponse.data);
      
      // Fetch price history
      try {
        const historyResponse = await getPriceHistory(symbol.toUpperCase());
        if (historyResponse.data && historyResponse.data.history) {
          setHistoryData(historyResponse.data.history);
        }
      } catch (historyErr) {
        console.error('Error fetching price history:', historyErr);
      }
      
      // Add to history
      if (!searchHistory.includes(symbol.toUpperCase())) {
        setSearchHistory([symbol.toUpperCase(), ...searchHistory.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch price data');
      setPriceData(null);
      setHistoryData(null);
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

      {historyData && historyData.length > 0 && (
        <div className="history-section">
          <h3>Price History (30 Days)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  border: `1px solid var(--border)`,
                  borderRadius: '6px',
                  color: 'var(--text)'
                }}
                formatter={(value) => `$${value.toFixed(2)}`}
                labelStyle={{ color: 'var(--text)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="var(--primary)" 
                dot={false}
                strokeWidth={2}
                name="Closing Price"
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="var(--success)" 
                dot={false}
                strokeWidth={1}
                opacity={0.6}
                name="High"
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="var(--danger)" 
                dot={false}
                strokeWidth={1}
                opacity={0.6}
                name="Low"
              />
            </LineChart>
          </ResponsiveContainer>
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
