import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getPortfolioSummary, getPortfolioAllocation } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, allocationRes] = await Promise.all([
        getPortfolioSummary(),
        getPortfolioAllocation()
      ]);
      setSummary(summaryRes.data);
      const allocationData = allocationRes.data?.allocations || [];
      console.log('Allocation data:', allocationData);
      setAllocation(allocationData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Portfolio Dashboard</h1>
      
      <div className="summary-cards">
        <div className="card">
          <h3>Total Portfolio Value</h3>
          <p className="value">
            ${summary?.totalPortfolioValue?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card">
          <h3>Total Profit/Loss</h3>
          <p className={`value ${(summary?.profitLoss || 0) >= 0 ? 'positive' : 'negative'}`}>
            ${summary?.profitLoss?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card">
          <h3>Profit/Loss %</h3>
          <p className={`value ${(summary?.profitLossPercent || 0) >= 0 ? 'positive' : 'negative'}`}>
            {summary?.profitLossPercent?.toFixed(2) || '0.00'}%
          </p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Asset Allocation</h2>
        {allocation && allocation.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={allocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ assetType, percentageAllocation }) => `${assetType}: ${percentageAllocation?.toFixed(2) || 0}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="percentageAllocation"
              >
                {allocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value?.toFixed(2) || 0}%`}
                labelFormatter={(label) => allocation[allocation.findIndex(item => item.percentageAllocation === label)]?.assetType || label}
              />
              <Legend dataKey="assetType" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No allocation data available</p>
        )}
      </div>

      <button className="refresh-btn" onClick={fetchData}>Refresh Data</button>
    </div>
  );
};

export default Dashboard;
