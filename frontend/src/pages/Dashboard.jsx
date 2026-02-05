import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getPortfolioSummary, getPortfolioAllocation, getPortfolioHoldings, getPortfolioRiskAnalysis } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, allocationRes, holdingsRes] = await Promise.all([
        getPortfolioSummary(),
        getPortfolioAllocation(),
        getPortfolioHoldings()
      ]);
      setSummary(summaryRes.data);
      const allocationData = allocationRes.data?.allocations || [];
      console.log('Allocation data:', allocationData);
      setAllocation(allocationData);
      setError(null);
      
      // Fetch risk analysis
      if (holdingsRes.data && holdingsRes.data.length > 0) {
        fetchRiskAnalysis(holdingsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskAnalysis = async (holdings) => {
    try {
      setRiskLoading(true);
      const response = await getPortfolioRiskAnalysis(holdings);
      setRiskData(response.data);
    } catch (err) {
      console.error('Failed to fetch risk analysis:', err);
    } finally {
      setRiskLoading(false);
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

      {/* Risk Score Section */}
      <div className="risk-section">
        <h2>Portfolio Risk Analysis</h2>
        {riskLoading ? (
          <div className="risk-loading">Analyzing portfolio risk...</div>
        ) : riskData ? (
          <div className="risk-content">
            <div className="risk-score-circle" style={{ borderColor: riskData.riskColor }}>
              <div className="risk-score-value">{riskData.overallScore}</div>
              <div className="risk-score-label">Risk Score</div>
            </div>
            <div className="risk-level" style={{ color: riskData.riskColor }}>
              {riskData.riskLevel}
            </div>
            <div className="risk-factors">
              {riskData.factors?.map((factor, index) => (
                <div key={index} className="risk-factor">
                  <div className="factor-header">
                    <span className="factor-icon">{factor.icon}</span>
                    <span className="factor-name">{factor.name}</span>
                    <span className={`factor-status ${factor.score >= 70 ? 'good' : factor.score >= 40 ? 'moderate' : 'poor'}`}>
                      {factor.status}
                    </span>
                  </div>
                  <div className="factor-bar-container">
                    <div 
                      className="factor-bar" 
                      style={{ 
                        width: `${factor.score}%`,
                        backgroundColor: factor.score >= 70 ? '#10B981' : factor.score >= 40 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </div>
                  <div className="factor-description">{factor.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>Add holdings to see risk analysis</p>
        )}
      </div>

      <button className="refresh-btn" onClick={fetchData}>Refresh Data</button>
    </div>
  );
};

export default Dashboard;
