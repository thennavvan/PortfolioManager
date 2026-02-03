import React from 'react';
import '../styles/HoldingsTable.css';

export function HoldingsTable({ holdings, loading, error }) {
  if (loading) {
    return <div className="holdings-container"><p>Loading holdings...</p></div>;
  }

  if (error) {
    return <div className="holdings-container error-message">{error}</div>;
  }

  if (!holdings || holdings.length === 0) {
    return <div className="holdings-container"><p>No holdings available</p></div>;
  }

  return (
    <div className="holdings-container">
      <h2>Holdings</h2>
      <div className="table-wrapper">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Asset Type</th>
              <th>Quantity</th>
              <th>Buy Price</th>
              <th>Current Price</th>
              <th>Market Value</th>
              <th>Profit/Loss</th>
              <th>Profit/Loss %</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding, index) => {
              const profitLoss = holding.profitLoss || 0;
              const profitLossPercent = holding.profitLossPercent || 0;
              const isProfitable = profitLoss >= 0;

              return (
                <tr key={index}>
                  <td className="symbol-cell"><strong>{holding.symbol}</strong></td>
                  <td>{holding.assetType}</td>
                  <td>{holding.quantity}</td>
                  <td>${holding.buyPrice.toFixed(2)}</td>
                  <td>${holding.currentPrice.toFixed(2)}</td>
                  <td>${holding.marketValue.toFixed(2)}</td>
                  <td className={isProfitable ? 'profit' : 'loss'}>
                    ${Math.abs(profitLoss).toFixed(2)}
                  </td>
                  <td className={isProfitable ? 'profit' : 'loss'}>
                    {isProfitable ? '+' : '-'}{Math.abs(profitLossPercent).toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
