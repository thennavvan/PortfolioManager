import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPortfolioHistory, getAllPortfolioHistory, savePortfolioSnapshot, autoSavePortfolioSnapshot } from '../services/api';
import '../styles/Performance.css';

const Performance = () => {
  const [historyData, setHistoryData] = useState([]);
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    triggerAutoSnapshot();
    fetchHistory();
  }, [timeRange]);

  const triggerAutoSnapshot = async () => {
    try {
      await autoSavePortfolioSnapshot();
    } catch (err) {
      // Silently fail - auto-snapshot is optional
      console.log('Auto-snapshot check completed');
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (timeRange === 'all') {
        response = await getAllPortfolioHistory();
      } else {
        response = await getPortfolioHistory(timeRange);
      }

      // Format data for the chart
      const formattedData = response.data.map(snapshot => ({
        date: new Date(snapshot.snapshotDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: new Date(snapshot.snapshotDate).getTime(),
        totalValue: parseFloat(snapshot.totalValue.toFixed(2)),
        investedValue: parseFloat(snapshot.totalInvestedValue.toFixed(2)),
        profitLoss: parseFloat((snapshot.totalValue - snapshot.totalInvestedValue).toFixed(2))
      }));

      setHistoryData(formattedData);
    } catch (err) {
      setError('Failed to load portfolio history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSnapshot = async () => {
    try {
      setError('');
      setSuccess('');
      await savePortfolioSnapshot();
      setSuccess('Portfolio snapshot saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      // Refresh the chart
      fetchHistory();
    } catch (err) {
      setError('Failed to save portfolio snapshot');
      console.error(err);
    }
  };

  const stats = historyData.length > 0 && {
    startValue: historyData[0].totalValue,
    endValue: historyData[historyData.length - 1].totalValue,
    highestValue: Math.max(...historyData.map(d => d.totalValue)),
    lowestValue: Math.min(...historyData.map(d => d.totalValue)),
    totalChange: historyData[historyData.length - 1].totalValue - historyData[0].totalValue,
    totalChangePercent: ((historyData[historyData.length - 1].totalValue - historyData[0].totalValue) / historyData[0].totalValue) * 100
  };

  return (
    <div className="performance">
      <h1>Portfolio Performance</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="controls-section">
        <div className="time-range-selector">
          <button 
            className={timeRange === 7 ? 'active' : ''} 
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </button>
          <button 
            className={timeRange === 30 ? 'active' : ''} 
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </button>
          <button 
            className={timeRange === 90 ? 'active' : ''} 
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </button>
          <button 
            className={timeRange === 'all' ? 'active' : ''} 
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>

        <button className="save-snapshot-btn" onClick={handleSaveSnapshot} disabled={loading}>
          {loading ? 'Saving...' : 'Save Snapshot'}
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Current Value</h3>
            <p className="stat-value">${stats.endValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="stat-card">
            <h3>Period Change</h3>
            <p className={`stat-value ${stats.totalChange >= 0 ? 'positive' : 'negative'}`}>
              ${stats.totalChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`stat-percent ${stats.totalChangePercent >= 0 ? 'positive' : 'negative'}`}>
              {stats.totalChangePercent >= 0 ? '+' : ''}{stats.totalChangePercent.toFixed(2)}%
            </p>
          </div>

          <div className="stat-card">
            <h3>Highest Value</h3>
            <p className="stat-value">${stats.highestValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="stat-card">
            <h3>Lowest Value</h3>
            <p className="stat-value">${stats.lowestValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      <div className="chart-section">
        {loading ? (
          <div className="loading">Loading portfolio history...</div>
        ) : historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis 
                dataKey="date" 
                stroke="#a0aec0"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#a0aec0"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1f2e',
                  border: '1px solid #2d3748',
                  borderRadius: '6px',
                  padding: '10px'
                }}
                labelStyle={{ color: '#e8eaed' }}
                formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalValue" 
                stroke="#3b82f6" 
                dot={false}
                name="Total Value"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="investedValue" 
                stroke="#a0aec0" 
                dot={false}
                name="Invested Value"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="profitLoss" 
                stroke="#10b981" 
                dot={false}
                name="Profit/Loss"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">▦</div>
            <p><strong>No portfolio history available yet</strong></p>
            <p>Portfolio snapshots are saved automatically every day at midnight, or you can click "Save Snapshot" to capture your portfolio value right now.</p>
            <p style={{ marginTop: '1rem', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Snapshots start accumulating over time. Check back after 24 hours to see your first automatic snapshot!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;
