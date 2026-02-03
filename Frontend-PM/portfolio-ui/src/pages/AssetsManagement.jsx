import React, { useEffect, useState } from 'react';
import { assetService, handleApiError } from '../services/api';
import '../styles/AssetsManagement.css';

export function AssetsManagement() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    symbol: '',
    assetType: '',
    quantity: '',
    buyPrice: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await assetService.getAllAssets();
      setAssets(response.data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.symbol || !formData.assetType || !formData.quantity || !formData.buyPrice) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await assetService.addAsset({
        symbol: formData.symbol.toUpperCase(),
        assetType: formData.assetType,
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice),
      });

      setSuccessMessage('Asset added successfully!');
      setFormData({ symbol: '', assetType: '', quantity: '', buyPrice: '' });
      await fetchAssets();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      setError(null);
      await assetService.deleteAsset(id);
      setSuccessMessage('Asset deleted successfully!');
      await fetchAssets();
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
    }
  };

  return (
    <div className="assets-management-page">
      <h1>Assets Management</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="assets-container">
        {/* Add Asset Form */}
        <div className="add-asset-section">
          <h2>Add New Asset</h2>
          <form onSubmit={handleFormSubmit} className="asset-form">
            <div className="form-group">
              <label htmlFor="symbol">Symbol:</label>
              <input
                id="symbol"
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleFormChange}
                placeholder="e.g., AAPL"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="assetType">Asset Type:</label>
              <select
                id="assetType"
                name="assetType"
                value={formData.assetType}
                onChange={handleFormChange}
                disabled={isSubmitting}
              >
                <option value="">Select Asset Type</option>
                <option value="STOCK">Stock</option>
                <option value="ETF">ETF</option>
                <option value="CRYPTO">Cryptocurrency</option>
                <option value="MUTUAL_FUND">Mutual Fund</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                placeholder="e.g., 10"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="buyPrice">Buy Price ($):</label>
              <input
                id="buyPrice"
                type="number"
                name="buyPrice"
                value={formData.buyPrice}
                onChange={handleFormChange}
                placeholder="e.g., 150.00"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Asset'}
            </button>
          </form>
        </div>

        {/* Assets List */}
        <div className="assets-list-section">
          <h2>Your Assets</h2>
          {loading ? (
            <p>Loading assets...</p>
          ) : assets.length === 0 ? (
            <p>No assets yet. Add one to get started!</p>
          ) : (
            <div className="assets-grid">
              {assets.map((asset) => (
                <div key={asset.id} className="asset-card">
                  <div className="card-header">
                    <h3>{asset.symbol}</h3>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteAsset(asset.id)}
                      title="Delete asset"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="card-body">
                    <p><strong>Type:</strong> {asset.assetType}</p>
                    <p><strong>Quantity:</strong> {asset.quantity}</p>
                    <p><strong>Buy Price:</strong> ${asset.buyPrice.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
