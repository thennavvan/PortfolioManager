import React, { useState } from 'react';
import { getLivePrice, getPriceHistory } from '../services/api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/LivePriceViewer.css';

const LivePriceViewer = () => {
  const [symbol, setSymbol] = useState('');
  const [priceData, setPriceData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [chartType, setChartType] = useState('area'); // 'area', 'line', 'detailed'

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
          <div className="chart-header">
            <h3>Price History (30 Days)</h3>
            <div className="chart-toggle">
              <button 
                className={`toggle-btn ${chartType === 'area' ? 'active' : ''}`}
                onClick={() => setChartType('area')}
                title="Area Chart"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18L9 12L13 16L21 8"/>
                  <path d="M21 8V18H3V18L9 12L13 16L21 8Z" fill="currentColor" opacity="0.3"/>
                </svg>
              </button>
              <button 
                className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
                title="Simple Line"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18L9 12L13 16L21 8"/>
                </svg>
              </button>
              <button 
                className={`toggle-btn ${chartType === 'detailed' ? 'active' : ''}`}
                onClick={() => setChartType('detailed')}
                title="Detailed (High/Low/Close)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 18L9 12L13 16L21 8"/>
                  <path d="M3 12L9 8L13 10L21 4" opacity="0.5"/>
                  <path d="M3 21L9 16L13 19L21 14" opacity="0.5"/>
                </svg>
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'area' ? (
              <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    border: `1px solid var(--border)`,
                    borderRadius: '6px',
                    color: 'var(--text)'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelStyle={{ color: 'var(--text)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke="var(--accent-green)" 
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  name="Price"
                />
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  style={{ fontSize: '11px' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    border: `1px solid var(--border)`,
                    borderRadius: '6px',
                    color: 'var(--text)'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                  labelStyle={{ color: 'var(--text)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="var(--accent-blue)" 
                  dot={false}
                  strokeWidth={2}
                  name="Price"
                />
              </LineChart>
            ) : (
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
                  stroke="var(--accent-green)" 
                  dot={false}
                  strokeWidth={1}
                  opacity={0.6}
                  name="High"
                />
                <Line 
                  type="monotone" 
                  dataKey="low" 
                  stroke="var(--accent-red)" 
                  dot={false}
                  strokeWidth={1}
                  opacity={0.6}
                  name="Low"
                />
              </LineChart>
            )}
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
