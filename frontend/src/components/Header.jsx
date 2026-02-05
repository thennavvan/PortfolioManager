import React, { useState, useEffect, useRef } from 'react';
import { exportPortfolioPDF } from '../services/pdfExport';
import { searchAssets, getLivePrice, getPriceHistory, getSimilarStocks } from '../services/api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/Header.css';

const Header = ({ currentPage, setCurrentPage }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Price modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [chartType, setChartType] = useState('area');
  const [similarStocks, setSimilarStocks] = useState(null);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await searchAssets(query);
        setSearchResults(response.data.results || []);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleResultClick = async (result) => {
    setShowResults(false);
    setSearchQuery('');
    setSelectedAsset(result);
    setShowPriceModal(true);
    setLoadingPrice(true);
    setPriceData(null);
    setHistoryData(null);
    setSimilarStocks(null);
    
    try {
      // Fetch live price
      const priceResponse = await getLivePrice(result.symbol);
      setPriceData(priceResponse.data);
      
      // Fetch price history
      try {
        const historyResponse = await getPriceHistory(result.symbol);
        if (historyResponse.data && historyResponse.data.history) {
          setHistoryData(historyResponse.data.history);
        }
      } catch (historyErr) {
        console.error('Error fetching price history:', historyErr);
      }
      
      // Fetch similar stocks
      try {
        setLoadingSimilar(true);
        const similarResponse = await getSimilarStocks(result.symbol);
        setSimilarStocks(similarResponse.data);
      } catch (similarErr) {
        console.error('Error fetching similar stocks:', similarErr);
      } finally {
        setLoadingSimilar(false);
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    } finally {
      setLoadingPrice(false);
    }
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setSelectedAsset(null);
    setPriceData(null);
    setHistoryData(null);
    setSimilarStocks(null);
  };

  const handleSimilarStockClick = async (stock) => {
    // Load the similar stock in the same modal
    setSelectedAsset({ symbol: stock.symbol, name: stock.name, type: 'EQUITY' });
    setLoadingPrice(true);
    setPriceData(null);
    setHistoryData(null);
    setSimilarStocks(null);
    
    try {
      const priceResponse = await getLivePrice(stock.symbol);
      setPriceData(priceResponse.data);
      
      try {
        const historyResponse = await getPriceHistory(stock.symbol);
        if (historyResponse.data && historyResponse.data.history) {
          setHistoryData(historyResponse.data.history);
        }
      } catch (historyErr) {
        console.error('Error fetching price history:', historyErr);
      }
      
      try {
        setLoadingSimilar(true);
        const similarResponse = await getSimilarStocks(stock.symbol);
        setSimilarStocks(similarResponse.data);
      } catch (similarErr) {
        console.error('Error fetching similar stocks:', similarErr);
      } finally {
        setLoadingSimilar(false);
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    } finally {
      setLoadingPrice(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'EQUITY': 'Stock',
      'ETF': 'ETF',
      'MUTUALFUND': 'Mutual Fund'
    };
    return labels[type] || type;
  };

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

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportPortfolioPDF();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      holdings: 'Portfolio Holdings',
      assets: 'Asset Management',
      performance: 'Performance'
    };
    return titles[currentPage] || 'FinSight';
  };

  return (
    <header className="header">
      <div className="header-content">
        <h2 className="header-title">{getPageTitle()}</h2>
        
        <div className="global-search" ref={searchRef}>
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="global-search-input"
              placeholder="Search stocks, ETFs, mutual funds..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
            {isSearching && <span className="search-spinner">⟳</span>}
          </div>
          
          {showResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result, index) => (
                <div 
                  key={`${result.symbol}-${index}`}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="result-main">
                    <span className="result-symbol">{result.symbol}</span>
                    <span className="result-name">{result.name}</span>
                  </div>
                  <div className="result-meta">
                    <span className={`result-type ${result.type.toLowerCase()}`}>
                      {getTypeLabel(result.type)}
                    </span>
                    <span className="result-exchange">{result.exchange}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showResults && searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
            <div className="search-results-dropdown">
              <div className="no-results">No results found</div>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            className="export-btn" 
            onClick={handleExportPDF}
            disabled={isExporting}
            title="Export Portfolio as PDF"
          >
            {isExporting ? 'Exporting...' : <><svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg> Export Portfolio as PDF</>}
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      
      {/* Price Modal */}
      {showPriceModal && (
        <div className="price-modal-overlay" onClick={closePriceModal}>
          <div className="price-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closePriceModal}>×</button>
            
            {loadingPrice ? (
              <div className="modal-loading">
                <span className="loading-spinner">⟳</span>
                <p>Loading price data...</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div className="modal-title">
                    <h2>{selectedAsset?.symbol}</h2>
                    <span className="modal-asset-name">{selectedAsset?.name}</span>
                  </div>
                  <span className={`modal-asset-type ${selectedAsset?.type?.toLowerCase()}`}>
                    {getTypeLabel(selectedAsset?.type)}
                  </span>
                </div>
                
                {priceData && (
                  <div className="modal-price-display">
                    <p className="modal-price">${priceData.price?.toFixed(2) || 'N/A'}</p>
                    <p className="modal-timestamp">Updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                )}
                
                {historyData && historyData.length > 0 && (
                  <div className="modal-chart-section">
                    <div className="modal-chart-header">
                      <h4>Price History (30 Days)</h4>
                      <div className="chart-toggle">
                        <button 
                          className={`toggle-btn ${chartType === 'area' ? 'active' : ''}`}
                          onClick={() => setChartType('area')}
                          title="Area Chart"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 18L9 12L13 16L21 8"/>
                            <path d="M21 8V18H3V18L9 12L13 16L21 8Z" fill="currentColor" opacity="0.3"/>
                          </svg>
                        </button>
                        <button 
                          className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                          onClick={() => setChartType('line')}
                          title="Line Chart"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 18L9 12L13 16L21 8"/>
                          </svg>
                        </button>
                        <button 
                          className={`toggle-btn ${chartType === 'detailed' ? 'active' : ''}`}
                          onClick={() => setChartType('detailed')}
                          title="Detailed"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 18L9 12L13 16L21 8"/>
                            <path d="M3 12L9 8L13 10L21 4" opacity="0.5"/>
                            <path d="M3 21L9 16L13 19L21 14" opacity="0.5"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="modal-chart">
                      <ResponsiveContainer width="100%" height={280}>
                        {chartType === 'area' ? (
                          <AreaChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                              <linearGradient id="modalColorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ebb8a" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#4ebb8a" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="date" 
                              stroke="#888"
                              style={{ fontSize: '10px' }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#888"
                              style={{ fontSize: '10px' }}
                              tickLine={false}
                              axisLine={false}
                              domain={['dataMin - 2', 'dataMax + 2']}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1a1a1a', 
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: '#fff'
                              }}
                              formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="close" 
                              stroke="#4ebb8a" 
                              strokeWidth={2}
                              fill="url(#modalColorPrice)"
                            />
                          </AreaChart>
                        ) : chartType === 'line' ? (
                          <LineChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <XAxis 
                              dataKey="date" 
                              stroke="#888"
                              style={{ fontSize: '10px' }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#888"
                              style={{ fontSize: '10px' }}
                              tickLine={false}
                              axisLine={false}
                              domain={['dataMin - 2', 'dataMax + 2']}
                              tickFormatter={(value) => `$${value.toFixed(0)}`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1a1a1a', 
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: '#fff'
                              }}
                              formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="close" 
                              stroke="#5ba3d9" 
                              dot={false}
                              strokeWidth={2}
                            />
                          </LineChart>
                        ) : (
                          <LineChart data={historyData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#888"
                              style={{ fontSize: '10px' }}
                            />
                            <YAxis 
                              stroke="#888"
                              style={{ fontSize: '10px' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1a1a1a', 
                                border: '1px solid #333',
                                borderRadius: '6px',
                                color: '#fff'
                              }}
                              formatter={(value) => `$${value.toFixed(2)}`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="close" stroke="#5ba3d9" dot={false} strokeWidth={2} name="Close" />
                            <Line type="monotone" dataKey="high" stroke="#4ebb8a" dot={false} strokeWidth={1} opacity={0.6} name="High" />
                            <Line type="monotone" dataKey="low" stroke="#d95555" dot={false} strokeWidth={1} opacity={0.6} name="Low" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Similar Stocks Section */}
                {(similarStocks || loadingSimilar) && (
                  <div className="similar-stocks-section">
                    <h4>Similar {similarStocks?.sector === 'Cryptocurrency' ? 'Cryptocurrencies' : 'Stocks'}</h4>
                    {similarStocks?.sector && similarStocks?.industry && (
                      <div className="sector-info">
                        <span className="sector-badge">{similarStocks.sector}</span>
                        <span className="industry-badge">{similarStocks.industry}</span>
                      </div>
                    )}
                    {loadingSimilar ? (
                      <div className="loading-similar">Finding similar stocks...</div>
                    ) : similarStocks?.similar && similarStocks.similar.length > 0 ? (
                      <div className="similar-stocks-list">
                        {similarStocks.similar.map((stock, index) => (
                          <div 
                            key={index} 
                            className="similar-stock-item"
                            onClick={() => handleSimilarStockClick(stock)}
                          >
                            <div className="similar-stock-symbol">{stock.symbol}</div>
                            <div className="similar-stock-name">{stock.name}</div>
                            <div className="similar-stock-reason">{stock.reason}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-similar">No similar stocks found</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
