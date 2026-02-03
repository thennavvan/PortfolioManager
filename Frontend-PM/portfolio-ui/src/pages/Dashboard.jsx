import React, { useEffect, useState } from 'react';
import { SummaryCards } from '../components/SummaryCards';
import { AllocationChart } from '../components/AllocationChart';
import { portfolioService, handleApiError } from '../services/api';
import '../styles/Dashboard.css';

export function Dashboard() {
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, allocationRes] = await Promise.all([
          portfolioService.getPortfolioSummary(),
          portfolioService.getPortfolioAllocation(),
        ]);

        setPortfolioSummary(summaryRes.data);
        setAllocationData(allocationRes.data);
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-page">
      <h1>Portfolio Dashboard</h1>
      
      <SummaryCards 
        portfolioSummary={portfolioSummary} 
        loading={loading} 
        error={error}
      />

      <AllocationChart 
        allocationData={allocationData} 
        loading={loading} 
        error={error}
      />
    </div>
  );
}
