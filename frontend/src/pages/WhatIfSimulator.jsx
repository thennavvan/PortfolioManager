import React, { useState, useEffect } from 'react';
import { getPortfolioHoldings, simulatePortfolio, searchAssets, getLivePrice } from '../services/api';
import '../styles/WhatIfSimulator.css';

const WhatIfSimulator = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);
  
  // Simulated changes
  const [changes, setChanges] = useState([]);
  const [newChange, setNewChange] = useState({
    action: 'BUY',
    symbol: '',
    name: '',
    quantity: '',
    price: '',
    assetType: ''
  });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Simulation results
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const response = await getPortfolioHoldings();
      setHoldings(response.data || []);
    } catch (err) {
      setError('Failed to load holdings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search for assets
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await searchAssets(searchQuery);
        setSearchResults(response.data?.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSelectAsset = async (asset) => {
    setNewChange({
      ...newChange,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.type || 'STOCK'
    });
    setSearchQuery(asset.symbol);
    setSearchResults([]);

    // Fetch current price
    try {
      const priceResponse = await getLivePrice(asset.symbol);
      if (priceResponse.data?.price) {
        setNewChange(prev => ({
          ...prev,
          price: priceResponse.data.price.toFixed(2)
        }));
      }
    } catch (err) {
      console.error('Failed to fetch price:', err);
    }
  };

  const handleAddChange = () => {
    if (!newChange.symbol || !newChange.quantity || !newChange.price) {
      setError('Please fill in symbol, quantity, and price');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!newChange.assetType) {
      setError('Please select an asset type');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const symbolUpper = newChange.symbol.toUpperCase();
    
    // Validate SELL action - check if asset exists in holdings
    if (newChange.action === 'SELL') {
      const holdingExists = holdings.find(h => h.symbol?.toUpperCase() === symbolUpper);
      if (!holdingExists) {
        setError(`Cannot simulate selling ${symbolUpper} - you don't own this asset`);
        setTimeout(() => setError(null), 4000);
        return;
      }
      
      // Also check if trying to sell more than owned (including pending sell changes)
      const currentQty = holdingExists.quantity || 0;
      const pendingSells = changes
        .filter(c => c.action === 'SELL' && c.symbol === symbolUpper)
        .reduce((sum, c) => sum + c.quantity, 0);
      const pendingBuys = changes
        .filter(c => c.action === 'BUY' && c.symbol === symbolUpper)
        .reduce((sum, c) => sum + c.quantity, 0);
      const availableQty = currentQty - pendingSells + pendingBuys;
      
      if (parseFloat(newChange.quantity) > availableQty) {
        setError(`Cannot sell ${newChange.quantity} ${symbolUpper} - you only have ${availableQty.toFixed(2)} available`);
        setTimeout(() => setError(null), 4000);
        return;
      }
    }

    const change = {
      id: Date.now(),
      action: newChange.action,
      symbol: symbolUpper,
      name: newChange.name || symbolUpper,
      quantity: parseFloat(newChange.quantity),
      price: parseFloat(newChange.price),
      assetType: newChange.assetType
    };

    setChanges([...changes, change]);
    setNewChange({
      action: 'BUY',
      symbol: '',
      name: '',
      quantity: '',
      price: '',
      assetType: ''
    });
    setSearchQuery('');
    setResults(null); // Clear previous results
  };

  const handleRemoveChange = (id) => {
    setChanges(changes.filter(c => c.id !== id));
    setResults(null);
  };

  const handleSimulate = async () => {
    if (changes.length === 0) {
      setError('Add at least one change to simulate');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setSimulating(true);
      setError(null);
      
      const response = await simulatePortfolio(holdings, changes);
      setResults(response.data);
    } catch (err) {
      setError('Simulation failed: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleClearAll = () => {
    setChanges([]);
    setResults(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="simulator-container">
        <div className="loading">Loading portfolio data...</div>
      </div>
    );
  }

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h1>What-If Simulator</h1>
        <p className="subtitle">Simulate portfolio changes and see the impact before making real trades</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="simulator-layout">
        {/* Left Panel - Add Changes */}
        <div className="simulator-panel add-panel">
          <h2>Simulate Changes</h2>
          
          <div className="change-form">
            <div className="form-row">
              <div className="form-group action-group">
                <label>Action</label>
                <div className="action-buttons">
                  <button
                    className={`action-btn buy ${newChange.action === 'BUY' ? 'active' : ''}`}
                    onClick={() => setNewChange({ ...newChange, action: 'BUY' })}
                  >
                    Buy
                  </button>
                  <button
                    className={`action-btn sell ${newChange.action === 'SELL' ? 'active' : ''}`}
                    onClick={() => setNewChange({ ...newChange, action: 'SELL' })}
                  >
                    Sell
                  </button>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group search-group">
                <label>Symbol</label>
                <div className="search-wrapper">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setNewChange({ ...newChange, symbol: e.target.value });
                    }}
                    placeholder="Search ticker..."
                  />
                  {searching && <span className="search-spinner">...</span>}
                  
                  {searchResults.length > 0 && (
                    <div className="search-dropdown">
                      {searchResults.slice(0, 5).map((result, idx) => (
                        <div
                          key={idx}
                          className="search-result"
                          onClick={() => handleSelectAsset(result)}
                        >
                          <span className="result-symbol">{result.symbol}</span>
                          <span className="result-name">{result.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={newChange.quantity}
                  onChange={(e) => setNewChange({ ...newChange, quantity: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="any"
                />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={newChange.price}
                  onChange={(e) => setNewChange({ ...newChange, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="any"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Asset Type</label>
                <select
                  value={newChange.assetType}
                  onChange={(e) => setNewChange({ ...newChange, assetType: e.target.value })}
                >
                  <option value="" disabled>Select Asset Type</option>
                  <option value="STOCK">Stock</option>
                  <option value="ETF">ETF</option>
                  <option value="CRYPTO">Crypto</option>
                  <option value="FOREX">Forex</option>
                </select>
              </div>
            </div>

            <button className="add-change-btn" onClick={handleAddChange}>
              Add to Simulation
            </button>
          </div>

          {/* Pending Changes */}
          {changes.length > 0 && (
            <div className="pending-changes">
              <h3>Pending Changes ({changes.length})</h3>
              <div className="changes-list">
                {changes.map((change) => (
                  <div key={change.id} className={`change-item ${change.action.toLowerCase()}`}>
                    <div className="change-info">
                      <span className={`change-action ${change.action.toLowerCase()}`}>
                        {change.action}
                      </span>
                      <span className="change-symbol">{change.symbol}</span>
                      <span className="change-details">
                        {change.quantity} @ {formatCurrency(change.price)}
                      </span>
                      <span className="change-total">
                        = {formatCurrency(change.quantity * change.price)}
                      </span>
                    </div>
                    <button
                      className="remove-change-btn"
                      onClick={() => handleRemoveChange(change.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="simulate-actions">
                <button className="clear-btn" onClick={handleClearAll}>
                  Clear All
                </button>
                <button
                  className="simulate-btn"
                  onClick={handleSimulate}
                  disabled={simulating}
                >
                  {simulating ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Results */}
        <div className="simulator-panel results-panel">
          <h2>Impact Analysis</h2>
          
          {!results ? (
            <div className="no-results">
              <div className="no-results-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-4 4 4 5-6" />
                </svg>
              </div>
              <p>Add changes and run simulation to see the impact</p>
            </div>
          ) : (
            <div className="results-content">
              {/* Comparison Cards */}
              <div className="comparison-grid">
                <div className="comparison-card">
                  <h4>Total Value</h4>
                  <div className="comparison-values">
                    <div className="value-row">
                      <span className="label">Current:</span>
                      <span className="value">{formatCurrency(results.current.totalValue)}</span>
                    </div>
                    <div className="value-row">
                      <span className="label">After:</span>
                      <span className="value">{formatCurrency(results.simulated.totalValue)}</span>
                    </div>
                    <div className={`change-indicator ${results.changes.valueChange >= 0 ? 'positive' : 'negative'}`}>
                      {results.changes.valueChange >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(results.changes.valueChange))}
                    </div>
                  </div>
                </div>

                <div className="comparison-card">
                  <h4>Risk Score</h4>
                  <div className="comparison-values">
                    <div className="value-row">
                      <span className="label">Current:</span>
                      <span className="value">{results.current.riskScore} ({results.current.riskLevel})</span>
                    </div>
                    <div className="value-row">
                      <span className="label">After:</span>
                      <span className="value">{results.simulated.riskScore} ({results.simulated.riskLevel})</span>
                    </div>
                    <div className={`change-indicator ${results.changes.riskChange <= 0 ? 'positive' : 'negative'}`}>
                      {results.changes.riskChange <= 0 ? '▼' : '▲'} {Math.abs(results.changes.riskChange)} pts
                    </div>
                  </div>
                </div>

                <div className="comparison-card">
                  <h4>Holdings</h4>
                  <div className="comparison-values">
                    <div className="value-row">
                      <span className="label">Current:</span>
                      <span className="value">{results.current.holdingsCount} assets</span>
                    </div>
                    <div className="value-row">
                      <span className="label">After:</span>
                      <span className="value">{results.simulated.holdingsCount} assets</span>
                    </div>
                    <div className={`change-indicator ${results.changes.holdingsChange >= 0 ? 'positive' : 'neutral'}`}>
                      {results.changes.holdingsChange > 0 ? '+' : ''}{results.changes.holdingsChange}
                    </div>
                  </div>
                </div>

                <div className="comparison-card">
                  <h4>Top Holding</h4>
                  <div className="comparison-values">
                    <div className="value-row">
                      <span className="label">Current:</span>
                      <span className="value">{results.current.topHoldingPercent}%</span>
                    </div>
                    <div className="value-row">
                      <span className="label">After:</span>
                      <span className="value">{results.simulated.topHoldingPercent}%</span>
                    </div>
                    <div className={`change-indicator ${results.simulated.topHoldingPercent <= results.current.topHoldingPercent ? 'positive' : 'negative'}`}>
                      {results.simulated.topHoldingPercent > 30 ? 'High concentration' : 'Diversified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {results.insights && results.insights.length > 0 && (
                <div className="insights-section">
                  <h4>Key Insights</h4>
                  <ul className="insights-list">
                    {results.insights.map((insight, idx) => (
                      <li key={idx}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Allocation Comparison */}
              <div className="allocation-section">
                <h4>Allocation by Asset Type</h4>
                <div className="allocation-comparison">
                  <div className="allocation-column">
                    <h5>Current</h5>
                    {Object.entries(results.current.allocation || {}).map(([type, pct]) => (
                      <div key={type} className="allocation-bar">
                        <span className="allocation-label">{type}</span>
                        <div className="bar-container">
                          <div className="bar" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="allocation-pct">{pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="allocation-column">
                    <h5>After Changes</h5>
                    {Object.entries(results.simulated.allocation || {}).map(([type, pct]) => (
                      <div key={type} className="allocation-bar">
                        <span className="allocation-label">{type}</span>
                        <div className="bar-container">
                          <div className="bar simulated" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="allocation-pct">{pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
