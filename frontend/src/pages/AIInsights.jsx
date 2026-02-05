import React, { useState, useEffect } from 'react';
import { getPortfolioSummary, getPortfolioHoldings, getPortfolioAllocation, getAIInsights } from '../services/api';
import '../styles/AIInsights.css';

const AIInsights = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoadingPortfolio(true);
      const [summaryRes, holdingsRes, allocationRes] = await Promise.all([
        getPortfolioSummary(),
        getPortfolioHoldings(),
        getPortfolioAllocation()
      ]);
      
      setPortfolioData({
        summary: summaryRes.data,
        holdings: holdingsRes.data,
        allocation: allocationRes.data
      });
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const generateInsights = async () => {
    if (!portfolioData) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAIInsights(portfolioData);
      setInsights(response.data);
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.response?.data?.error || 'Failed to generate AI insights. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loadingPortfolio) {
    return (
      <div className="ai-insights">
        <h1>AI Portfolio Insights</h1>
        <div className="loading-container">
          <span className="loading-spinner">⟳</span>
          <p>Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights">
      <h1>AI Portfolio Insights</h1>
      
      <div className="insights-header">
        <div className="portfolio-snapshot">
          <h3>Portfolio Snapshot</h3>
          <div className="snapshot-grid">
            <div className="snapshot-item">
              <span className="label">Total Value</span>
              <span className="value">{formatCurrency(portfolioData?.summary?.totalPortfolioValue)}</span>
            </div>
            <div className="snapshot-item">
              <span className="label">Total Invested</span>
              <span className="value">{formatCurrency(portfolioData?.summary?.totalInvestedValue)}</span>
            </div>
            <div className="snapshot-item">
              <span className="label">Total P/L</span>
              <span className={`value ${portfolioData?.summary?.totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(portfolioData?.summary?.totalProfitLoss)}
              </span>
            </div>
            <div className="snapshot-item">
              <span className="label">Assets</span>
              <span className="value">{portfolioData?.holdings?.length || 0}</span>
            </div>
          </div>
        </div>
        
        <button 
          className="generate-btn"
          onClick={generateInsights}
          disabled={loading || !portfolioData}
        >
          {loading ? (
            <>
              <span className="btn-spinner">⟳</span>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Generate AI Insights
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>Ready to Analyze Your Portfolio</h3>
          <p>Click "Generate AI Insights" to get personalized analysis, recommendations, and risk assessment for your portfolio.</p>
          <ul className="feature-list">
            <li>📊 Portfolio Analysis & Health Check</li>
            <li>⚠️ Risk Assessment & Warnings</li>
            <li>💡 Diversification Recommendations</li>
            <li>📈 Growth Opportunities</li>
          </ul>
        </div>
      )}

      {insights && (
        <div className="insights-content">
          {/* Portfolio Health */}
          {insights.portfolioHealth && (
            <div className="insight-card health-card">
              <div className="card-header">
                <h3>📊 Portfolio Health</h3>
                <span className={`health-score ${insights.portfolioHealth.score?.toLowerCase()}`}>
                  {insights.portfolioHealth.score}
                </span>
              </div>
              <p className="card-description">{insights.portfolioHealth.summary}</p>
            </div>
          )}

          {/* Risk Assessment */}
          {insights.riskAssessment && (
            <div className="insight-card risk-card">
              <div className="card-header">
                <h3>⚠️ Risk Assessment</h3>
                <span className={`risk-level ${insights.riskAssessment.level?.toLowerCase()}`}>
                  {insights.riskAssessment.level}
                </span>
              </div>
              <p className="card-description">{insights.riskAssessment.summary}</p>
              {insights.riskAssessment.warnings && insights.riskAssessment.warnings.length > 0 && (
                <ul className="warning-list">
                  {insights.riskAssessment.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Diversification */}
          {insights.diversification && (
            <div className="insight-card diversification-card">
              <div className="card-header">
                <h3>🎯 Diversification Analysis</h3>
              </div>
              <p className="card-description">{insights.diversification.summary}</p>
              {insights.diversification.suggestions && insights.diversification.suggestions.length > 0 && (
                <ul className="suggestion-list">
                  {insights.diversification.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Top Performers */}
          {insights.topPerformers && insights.topPerformers.length > 0 && (
            <div className="insight-card performers-card">
              <div className="card-header">
                <h3>🏆 Top Performers</h3>
              </div>
              <div className="performers-list">
                {insights.topPerformers.map((performer, idx) => (
                  <div key={idx} className="performer-item">
                    <span className="performer-symbol">{performer.symbol}</span>
                    <span className="performer-reason">{performer.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div className="insight-card recommendations-card">
              <div className="card-header">
                <h3>💡 Recommendations</h3>
              </div>
              <div className="recommendations-list">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className={`recommendation-item ${rec.type?.toLowerCase()}`}>
                    <div className="rec-header">
                      <span className="rec-type">{rec.type}</span>
                      {rec.symbol && <span className="rec-symbol">{rec.symbol}</span>}
                    </div>
                    <p className="rec-reason">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          {insights.summary && (
            <div className="insight-card summary-card">
              <div className="card-header">
                <h3>📝 AI Summary</h3>
              </div>
              <p className="ai-summary">{insights.summary}</p>
            </div>
          )}

          <p className="disclaimer">
            ⚠️ AI-generated insights are for informational purposes only and should not be considered financial advice. 
            Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
