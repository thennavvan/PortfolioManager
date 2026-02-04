import React, { useState, useEffect } from 'react';
import { getAssets, createAsset, deleteAsset, updateAsset } from '../services/api';
import AddAssetForm from '../components/AddAssetForm';
import '../styles/AssetManagement.css';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await getAssets();
      setAssets(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load assets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (assetData) => {
    try {
      if (assetData.isUpdate && assetData.existingAssetId) {
        // Update existing asset
        await updateAsset(assetData.existingAssetId, {
          name: assetData.name,
          symbol: assetData.symbol,
          assetType: assetData.assetType,
          quantity: assetData.quantity,
          buyPrice: assetData.buyPrice
        });
        setSuccess('Asset updated successfully!');
      } else if (editingAsset) {
        // Update asset being edited
        await updateAsset(editingAsset.id, {
          name: assetData.name,
          symbol: assetData.symbol,
          assetType: assetData.assetType,
          quantity: assetData.quantity,
          buyPrice: assetData.buyPrice
        });
        setSuccess('Asset updated successfully!');
        setEditingAsset(null);
      } else {
        // Create new asset
        await createAsset({
          name: assetData.name,
          symbol: assetData.symbol,
          assetType: assetData.assetType,
          quantity: assetData.quantity,
          buyPrice: assetData.buyPrice
        });
        setSuccess('Asset added successfully!');
      }
      setShowForm(false);
      fetchAssets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add/update asset');
      console.error(err);
    }
  };

  const handleDeleteAsset = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAsset(id);
        setSuccess('Asset deleted successfully!');
        fetchAssets();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete asset');
        console.error(err);
      }
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingAsset(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading assets...</div>;

  return (
    <div className="asset-management">
      <h1>Asset Management</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="controls">
        <button 
          className="add-btn" 
          onClick={() => {
            setEditingAsset(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : '+ Add New Asset'}
        </button>
      </div>

      {showForm && (
        <AddAssetForm 
          onSubmit={handleAddAsset}
          editingAsset={editingAsset}
          onCancel={handleCancelEdit}
        />
      )}

      {assets.length > 0 ? (
        <div className="assets-list">
          <h2>Current Assets</h2>
          <div className="table-container">
            <table className="assets-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Asset Type</th>
                  <th>Quantity</th>
                  <th>Buy Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="symbol">{asset.symbol}</td>
                    <td>{asset.assetType}</td>
                    <td className="number">{asset.quantity}</td>
                    <td className="currency">${asset.buyPrice?.toFixed(2) || '0.00'}</td>
                    <td className="actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditAsset(asset)}
                        title="Edit this asset"
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteAsset(asset.id)}
                        title="Delete this asset"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="no-data">No assets found. Add your first asset above.</p>
      )}

      <button className="refresh-btn" onClick={fetchAssets}>Refresh Assets</button>
    </div>
  );
};

export default AssetManagement;
