import React, { useState, useEffect, useRef } from 'react';
import { getAssets, createAsset, deleteAsset, updateAsset, getAssetBySymbol } from '../services/api';
import AddAssetForm from '../components/AddAssetForm';
import '../styles/AssetManagement.css';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

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

  // Calculate weighted average price
  const calculateWeightedAverage = (oldQty, oldPrice, newQty, newPrice) => {
    const totalInvested = (oldQty * oldPrice) + (newQty * newPrice);
    const totalQty = oldQty + newQty;
    return totalQty > 0 ? totalInvested / totalQty : newPrice;
  };

  const handleAddAsset = async (assetData) => {
    try {
      if (assetData.isUpdate && assetData.existingAssetId) {
        // Adding more units to existing asset - use weighted average
        const existingAsset = assets.find(a => a.id === assetData.existingAssetId);
        if (existingAsset) {
          const oldQty = existingAsset.quantity;
          const oldPrice = existingAsset.buyPrice;
          const newQty = assetData.quantity;
          const newPrice = assetData.buyPrice;
          
          const weightedAvgPrice = calculateWeightedAverage(oldQty, oldPrice, newQty, newPrice);
          const totalQuantity = oldQty + newQty;

          await updateAsset(assetData.existingAssetId, {
            name: assetData.name,
            symbol: assetData.symbol,
            assetType: assetData.assetType,
            quantity: totalQuantity,
            buyPrice: parseFloat(weightedAvgPrice.toFixed(2))
          });
          setSuccess(`Added ${newQty} units. New total: ${totalQuantity} @ $${weightedAvgPrice.toFixed(2)} avg`);
        }
      } else if (editingAsset) {
        // Directly editing asset (not adding more) - just update values
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
      setTimeout(() => setSuccess(null), 4000);
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

  // CSV Import functionality
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have a header row and at least one data row');
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Find column indices
    const symbolIdx = header.findIndex(h => h === 'symbol' || h === 'ticker');
    const nameIdx = header.findIndex(h => h === 'name' || h === 'asset name');
    const typeIdx = header.findIndex(h => h === 'assettype' || h === 'asset type' || h === 'type');
    const qtyIdx = header.findIndex(h => h === 'quantity' || h === 'qty' || h === 'shares');
    const priceIdx = header.findIndex(h => h === 'buyprice' || h === 'buy price' || h === 'price' || h === 'cost');

    if (symbolIdx === -1) {
      throw new Error('CSV must have a "symbol" or "ticker" column');
    }
    if (qtyIdx === -1) {
      throw new Error('CSV must have a "quantity" or "qty" column');
    }
    if (priceIdx === -1) {
      throw new Error('CSV must have a "buyPrice" or "price" column');
    }

    // Parse data rows
    const assets = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted values with commas
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/['"]/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/['"]/g, ''));

      const symbol = values[symbolIdx]?.toUpperCase();
      const quantity = parseFloat(values[qtyIdx]);
      const buyPrice = parseFloat(values[priceIdx]);

      if (!symbol || isNaN(quantity) || isNaN(buyPrice)) {
        console.warn(`Skipping invalid row ${i + 1}:`, line);
        continue;
      }

      assets.push({
        symbol,
        name: nameIdx !== -1 ? values[nameIdx] || symbol : symbol,
        assetType: typeIdx !== -1 ? (values[typeIdx]?.toUpperCase() || 'STOCK') : 'STOCK',
        quantity,
        buyPrice
      });
    }

    return assets;
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const text = await file.text();
      const assetsToImport = parseCSV(text);

      if (assetsToImport.length === 0) {
        setError('No valid assets found in CSV file');
        return;
      }

      setImportProgress({ current: 0, total: assetsToImport.length });

      let createdCount = 0;
      let updatedCount = 0;
      let failCount = 0;
      const errors = [];

      for (let i = 0; i < assetsToImport.length; i++) {
        const asset = assetsToImport[i];
        try {
          // Check if asset already exists
          let existingAsset = null;
          try {
            const response = await getAssetBySymbol(asset.symbol);
            existingAsset = response.data;
          } catch (e) {
            // Asset doesn't exist, that's fine
          }

          if (existingAsset && existingAsset.id) {
            // Use weighted average for existing asset
            const oldQty = existingAsset.quantity;
            const oldPrice = existingAsset.buyPrice;
            const newQty = asset.quantity;
            const newPrice = asset.buyPrice;
            
            const totalInvested = (oldQty * oldPrice) + (newQty * newPrice);
            const totalQty = oldQty + newQty;
            const weightedAvgPrice = totalQty > 0 ? totalInvested / totalQty : newPrice;

            await updateAsset(existingAsset.id, {
              ...asset,
              quantity: totalQty,
              buyPrice: parseFloat(weightedAvgPrice.toFixed(2))
            });
            updatedCount++;
          } else {
            // Create new asset
            await createAsset(asset);
            createdCount++;
          }
        } catch (err) {
          failCount++;
          errors.push(`${asset.symbol}: ${err.response?.data?.message || err.message}`);
        }
        setImportProgress({ current: i + 1, total: assetsToImport.length });
      }

      const successParts = [];
      if (createdCount > 0) successParts.push(`${createdCount} created`);
      if (updatedCount > 0) successParts.push(`${updatedCount} updated`);
      
      if (successParts.length > 0) {
        setSuccess(`Successfully imported: ${successParts.join(', ')}${failCount > 0 ? `, ${failCount} failed` : ''}`);
        fetchAssets();
      }
      if (errors.length > 0) {
        setError(`Import errors: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` and ${errors.length - 3} more...` : ''}`);
      }

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
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

        <div className="import-section">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: 'none' }}
          />
          <button 
            className="import-btn"
            onClick={handleImportClick}
            disabled={importing}
          >
            {importing 
              ? `Importing... ${importProgress.current}/${importProgress.total}` 
              : <><svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 18 15 15"/></svg> Import Asset Data</>}
          </button>
        </div>
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
