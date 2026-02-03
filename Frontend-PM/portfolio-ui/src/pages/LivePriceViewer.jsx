import React, { useState } from 'react';
import { assetService, handleApiError } from '../services/api';
import '../styles/LivePriceViewer.css';

export function LivePriceViewer() {
  const [symbol, setSymbol] = useState('');
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPriceData(null);

      const response = await assetService.getLivePrice(symbol.toUpperCase());
      setPriceData(response.data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      setPriceData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="live-price-viewer-page">
      <h1>Live Price Viewer</h1>

      <div className="price-viewer-container">
        <div className="search-section">
          <h2>Search for Stock Price</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol (e.g., AAPL, GOOGL, MSFT)"
                disabled={loading}
              />
              <button type="submit" disabled={loading} className="btn-search">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && <div className="error-message">{error}</div>}
        </div>

        {priceData && (
          <div className="price-result">
            <div className="price-card">
              <div className="symbol-header">
                <h2>{priceData.symbol}</h2>
              </div>

              <div className="price-info">
                <div className="price-item">
                  <span className="label">Current Price</span>
                  <span className="value">${priceData.currentPrice.toFixed(2)}</span>
                </div>

                <div className="price-item">
                  <span className="label">Currency</span>
                  <span className="value">{priceData.currency}</span>
                </div>

                {priceData.timestamp && (
                  <div className="price-item">
                    <span className="label">Last Updated</span>
                    <span className="value">{new Date(priceData.timestamp).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="info-box">
              <p>💡 This price data is fetched from Yahoo Finance in real-time via your backend service.</p>
            </div>
          </div>
        )}

        {!priceData && !loading && !error && (
          <div className="empty-state">
            <p>Enter a stock symbol above to view live prices</p>
            <p className="hint">Try symbols like: AAPL, GOOGL, MSFT, AMZN, TSLA</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <p>Fetching price data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
