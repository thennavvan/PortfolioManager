import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import '../styles/AllocationChart.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function AllocationChart({ allocationData, loading, error }) {
  if (loading) {
    return <div className="allocation-container"><p>Loading allocation data...</p></div>;
  }

  if (error) {
    return <div className="allocation-container error-message">{error}</div>;
  }

  if (!allocationData || allocationData.length === 0) {
    return <div className="allocation-container"><p>No allocation data available</p></div>;
  }

  const chartData = allocationData.map((item) => ({
    name: item.symbol,
    value: parseFloat(item.marketValuePercent) || 0,
    marketValue: item.marketValue,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">{data.name}</p>
          <p className="value">${data.marketValue.toFixed(2)}</p>
          <p className="percentage">{data.value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="allocation-container">
      <h2>Portfolio Allocation</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, value }) => `${name} (${value.toFixed(1)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
