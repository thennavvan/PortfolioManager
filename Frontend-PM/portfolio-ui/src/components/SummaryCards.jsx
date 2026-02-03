import React from 'react';
import '../styles/SummaryCards.css';

export function SummaryCards({ portfolioSummary, loading, error }) {
  if (loading) {
    return <div className="summary-cards-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="summary-cards-container error-message">{error}</div>;
  }

  if (!portfolioSummary) {
    return <div className="summary-cards-container"><p>No data available</p></div>;
  }

  const {
    totalPortfolioValue = 0,
    totalInvestedValue = 0,
    totalProfitLoss = 0,
    totalProfitLossPercent = 0,
  } = portfolioSummary;

  const isProfitable = totalProfitLoss >= 0;

  return (
    <div className="summary-cards-container">
      <div className="summary-card">
        <div className="card-label">Total Portfolio Value</div>
        <div className="card-value">${totalPortfolioValue.toFixed(2)}</div>
      </div>

      <div className="summary-card">
        <div className="card-label">Total Invested Value</div>
        <div className="card-value">${totalInvestedValue.toFixed(2)}</div>
      </div>

      <div className={`summary-card ${isProfitable ? 'profit' : 'loss'}`}>
        <div className="card-label">Total Profit/Loss</div>
        <div className="card-value">
          ${Math.abs(totalProfitLoss).toFixed(2)}
        </div>
        <div className="card-percentage">
          {isProfitable ? '+' : '-'}{Math.abs(totalProfitLossPercent).toFixed(2)}%
        </div>
      </div>
    </div>
  );
}
