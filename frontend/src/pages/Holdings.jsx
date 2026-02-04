import React, { useState, useEffect } from 'react';
import { getPortfolioHoldings } from '../services/api';
import '../styles/Holdings.css';

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    try {
      setLoading(true);
      const response = await getPortfolioHoldings();
      setHoldings(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load holdings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00';
  };

  const getProfitLossClass = (value) => {
    return (value || 0) >= 0 ? 'positive' : 'negative';
  };

  if (loading) return <div className="loading">Loading holdings...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="holdings">
      <h1>Portfolio Holdings</h1>

      {holdings.length > 0 ? (
        <div className="table-container">
          <table className="holdings-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Asset Type</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th>Current Price</th>
                <th>Market Value</th>
                <th>Invested Value</th>
                <th>Profit/Loss</th>
                <th>Profit/Loss %</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, index) => (
                <tr key={index}>
                  <td className="symbol">{holding.symbol}</td>
                  <td>{holding.assetType}</td>
                  <td className="number">{holding.quantity}</td>
                  <td className="currency">{formatCurrency(holding.buyPrice)}</td>
                  <td className="currency">{formatCurrency(holding.currentPrice)}</td>
                  <td className="currency">{formatCurrency(holding.marketValue)}</td>
                  <td className="currency">{formatCurrency(holding.investedValue)}</td>
                  <td className={`currency ${getProfitLossClass(holding.profitLoss)}`}>
                    {formatCurrency(holding.profitLoss)}
                  </td>
                  <td className={`number ${getProfitLossClass(holding.profitLossPercent)}`}>
                    {holding.profitLossPercent?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No holdings found. Add assets to your portfolio.</p>
      )}

      <button className="refresh-btn" onClick={fetchHoldings}>Refresh Holdings</button>
    </div>
  );
};

export default Holdings;
