import React, { useState, useEffect } from 'react';
import { getAssetBySymbol, getAssetInfo } from '../services/api';
import '../styles/AddAssetForm.css';

const AddAssetForm = ({ onSubmit, editingAsset, onCancel }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    assetType: 'STOCK',
    quantity: '',
    buyPrice: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [existingAsset, setExistingAsset] = useState(null);
  const [checkingSymbol, setCheckingSymbol] = useState(false);
  const [validatingTicker, setValidatingTicker] = useState(false);
  const [symbolValidation, setSymbolValidation] = useState(null);
  const [assetName, setAssetName] = useState('');

  // If editing, populate the form and mark as pre-validated
  useEffect(() => {
    if (editingAsset) {
      setFormData({
        symbol: editingAsset.symbol,
        assetType: editingAsset.assetType,
        quantity: editingAsset.quantity.toString(),
        buyPrice: editingAsset.buyPrice.toString()
      });
      setExistingAsset(editingAsset);
      setAssetName(editingAsset.name || editingAsset.symbol);
      // Mark existing asset as pre-validated
      setSymbolValidation({
        valid: true,
        message: `✓ ${editingAsset.name || editingAsset.symbol} (${editingAsset.assetType})`
      });
    }
  }, [editingAsset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Check if symbol already exists and validate ticker when user leaves the symbol field
  const handleSymbolBlur = async () => {
    if (!formData.symbol.trim()) {
      return; // Don't check if empty
    }
    
    // If editing and symbol hasn't changed, skip validation
    if (editingAsset && formData.symbol.toUpperCase() === editingAsset.symbol.toUpperCase()) {
      return;
    }

    const symbol = formData.symbol.toUpperCase();
    
    try {
      setCheckingSymbol(true);
      setValidatingTicker(true);
      setSymbolValidation(null);
      setAssetName('');

      // Get asset info including type and price
      try {
        const infoResponse = await getAssetInfo(symbol);
        const assetInfo = infoResponse.data;
        
        // Check if price is valid
        if (!assetInfo.price || assetInfo.price === null) {
          setSymbolValidation({
            valid: false,
            message: `Invalid ticker symbol "${symbol}". Please check and try again.`
          });
          setErrors(prev => ({
            ...prev,
            symbol: `Invalid ticker symbol "${symbol}". Please check and try again.`
          }));
          return;
        }

        // Auto-select the asset type based on Yahoo Finance data
        setFormData(prev => ({
          ...prev,
          assetType: assetInfo.assetType || 'STOCK'
        }));
        
        // Store the asset name for display
        setAssetName(assetInfo.name || '');

        // Ticker is valid
        setSymbolValidation({
          valid: true,
          message: `✓ ${assetInfo.name} (${assetInfo.assetType}) - $${parseFloat(assetInfo.price).toFixed(2)}`
        });
        setErrors(prev => ({
          ...prev,
          symbol: ''
        }));

        try {
          const response = await getAssetBySymbol(symbol);
          setExistingAsset(response.data);
        } catch (err) {
          setExistingAsset(null); // Symbol doesn't exist in portfolio
        }
      } catch (priceErr) {
        setSymbolValidation({
          valid: false,
          message: `Invalid ticker symbol "${symbol}". Please check and try again.`
        });
        setErrors(prev => ({
          ...prev,
          symbol: `Invalid ticker symbol "${symbol}". Please check and try again.`
        }));
      }
    } finally {
      setCheckingSymbol(false);
      setValidatingTicker(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    } else if (!symbolValidation?.valid) {
      newErrors.symbol = symbolValidation?.message || 'Please validate the ticker symbol first';
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.buyPrice || parseFloat(formData.buyPrice) <= 0) {
      newErrors.buyPrice = 'Buy price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // When editingAsset is provided (from Edit button), we want to REPLACE values
      // When existingAsset is found (symbol already exists), we want to ADD to existing
      const isAddingToExisting = !!existingAsset && !editingAsset;
      
      await onSubmit({
        name: assetName || formData.symbol.toUpperCase(),
        symbol: formData.symbol.toUpperCase(),
        assetType: formData.assetType,
        quantity: parseFloat(formData.quantity),
        buyPrice: parseFloat(formData.buyPrice),
        isUpdate: isAddingToExisting,
        existingAssetId: isAddingToExisting ? existingAsset?.id : null
      });
      
      // Reset form
      setFormData({
        symbol: '',
        assetType: 'STOCK',
        quantity: '',
        buyPrice: ''
      });
      setExistingAsset(null);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isUpdating = !!existingAsset && !editingAsset;
  const buttonText = editingAsset ? 'Update Asset' : (isUpdating ? 'Add More Units' : 'Add Asset');
  const formTitle = editingAsset ? 'Edit Asset' : (isUpdating ? `Add to ${formData.symbol.toUpperCase()}` : 'Add New Asset');

  // Calculate weighted average preview
  const getWeightedAveragePreview = () => {
    if (!isUpdating || !existingAsset) return null;
    
    const oldQty = existingAsset.quantity;
    const oldPrice = existingAsset.buyPrice;
    const newQty = parseFloat(formData.quantity) || 0;
    const newPrice = parseFloat(formData.buyPrice) || 0;
    
    if (newQty <= 0 || newPrice <= 0) return null;
    
    const totalInvested = (oldQty * oldPrice) + (newQty * newPrice);
    const totalQty = oldQty + newQty;
    const weightedAvg = totalInvested / totalQty;
    
    return {
      totalQty,
      weightedAvg: weightedAvg.toFixed(2),
      oldQty,
      oldPrice: oldPrice.toFixed(2)
    };
  };

  const preview = getWeightedAveragePreview();

  return (
    <form className="add-asset-form" onSubmit={handleSubmit}>
      <h3>{formTitle}</h3>

      {isUpdating && (
        <div className="info-box">
          <p><strong>Existing:</strong> {existingAsset.quantity} units @ ${existingAsset.buyPrice?.toFixed(2)}</p>
          <p>Enter the new units you're buying. The average cost will be calculated automatically.</p>
        </div>
      )}

      {preview && (
        <div className="preview-box">
          <p><strong>After adding:</strong></p>
          <p>Total: <strong>{preview.totalQty}</strong> units @ <strong>${preview.weightedAvg}</strong> avg cost</p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="symbol">Stock Symbol</label>
        <input
          type="text"
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={handleChange}
          onBlur={handleSymbolBlur}
          placeholder="e.g., AAPL"
          className={errors.symbol ? 'error' : ''}
          disabled={editingAsset ? true : false}
        />
        {checkingSymbol && <span className="checking">Validating ticker...</span>}
        {validatingTicker && !checkingSymbol && <span className="checking">Checking price data...</span>}
        {symbolValidation?.valid && !checkingSymbol && !validatingTicker && (
          <span className="symbol-check available">✓ {symbolValidation.message}</span>
        )}
        {symbolValidation?.valid === false && !checkingSymbol && !validatingTicker && (
          <span className="symbol-check exists">✗ {symbolValidation.message}</span>
        )}
        {errors.symbol && <span className="error-msg">{errors.symbol}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="assetType">Asset Type</label>
        <select
          id="assetType"
          name="assetType"
          value={formData.assetType}
          onChange={handleChange}
        >
          <option value="STOCK">Stock</option>
          <option value="CRYPTO">Crypto</option>
          <option value="FOREX">Forex</option>
          <option value="ETF">ETF</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="e.g., 10"
          step="0.01"
          className={errors.quantity ? 'error' : ''}
        />
        {errors.quantity && <span className="error-msg">{errors.quantity}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="buyPrice">Buy Price</label>
        <input
          type="number"
          id="buyPrice"
          name="buyPrice"
          value={formData.buyPrice}
          onChange={handleChange}
          placeholder="e.g., 150.50"
          step="0.01"
          className={errors.buyPrice ? 'error' : ''}
        />
        {errors.buyPrice && <span className="error-msg">{errors.buyPrice}</span>}
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading || checkingSymbol || validatingTicker || (formData.symbol && !editingAsset && !symbolValidation?.valid)}
        >
          {loading ? `${editingAsset ? 'Updating' : 'Adding'}...` : buttonText}
        </button>
        {(editingAsset || isUpdating) && (
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddAssetForm;
