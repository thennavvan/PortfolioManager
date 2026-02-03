import React, { useEffect, useState } from 'react';
import { HoldingsTable } from '../components/HoldingsTable';
import { portfolioService, handleApiError } from '../services/api';
import '../styles/Holdings.css';

export function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await portfolioService.getPortfolioHoldings();
        setHoldings(response.data);
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  return (
    <div className="holdings-page">
      <h1>Portfolio Holdings</h1>
      <HoldingsTable 
        holdings={holdings} 
        loading={loading} 
        error={error}
      />
    </div>
  );
}
