package com.thrive.service;

import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import com.thrive.dto.PriceResponse;
import com.thrive.exception.TickerValidationException;
import org.springframework.stereotype.Service;
import com.thrive.dto.PortfolioSummary;

import java.util.List;
import java.util.Optional;

@Service
public class AssetService {
    private final AssetRepo assetRepo;
    private final MarketPriceService marketPriceService;

    public AssetService(AssetRepo assetRepo, MarketPriceService marketPriceService) {
        this.assetRepo = assetRepo;
        this.marketPriceService = marketPriceService;
    }

    private void validateTickerSymbol(String symbol) {
        try {
            PriceResponse priceResponse = MarketPriceService.getLivePrice(symbol.toUpperCase());
            
            // Check if the price is valid (not N/A or null)
            if (priceResponse == null || 
                priceResponse.getPrice() == null || 
                "N/A".equals(priceResponse.getPrice().toString())) {
                throw new TickerValidationException("Invalid ticker symbol: '" + symbol + "'. Please verify the symbol and try again.");
            }
        } catch (TickerValidationException e) {
            throw e;
        } catch (Exception e) {
            throw new TickerValidationException("Invalid ticker symbol: '" + symbol + "'. Please verify the symbol and try again.");
        }
    }

    public Asset saveAsset(Asset asset){
        // Validate ticker symbol before saving
        validateTickerSymbol(asset.getSymbol());
        return assetRepo.save(asset);
    }

    public Asset updateAsset(Long id, Asset assetDetails) {
        return assetRepo.findById(id).map(asset -> {
            asset.setQuantity(assetDetails.getQuantity());
            asset.setBuyPrice(assetDetails.getBuyPrice());
            asset.setAssetType(assetDetails.getAssetType());
            asset.setName(assetDetails.getName());
            return assetRepo.save(asset);
        }).orElseThrow(() -> new TickerValidationException("Asset not found"));
    }

    public Optional<Asset> findBySymbol(String symbol) {
        return assetRepo.findBySymbol(symbol);
    }

    public List<Asset> getAllAssets(){
        return assetRepo.findAll();
    }

    public Optional<Asset> getAssetById(Long id){
        return assetRepo.findById(id);
    }

    public void deleteAsset(Long id){
        assetRepo.deleteById(id);
    }

    public Optional<Asset> updateAsset(Long id, Asset updatedAsset) {

        return assetRepo.findById(id)
                .map(existing -> {
                    existing.setName(updatedAsset.getName());
                    existing.setSymbol(updatedAsset.getSymbol());
                    existing.setAssetType(updatedAsset.getAssetType());
                    existing.setQuantity(updatedAsset.getQuantity());
                    existing.setBuyPrice(updatedAsset.getBuyPrice());
                    return assetRepo.save(existing);
                });
    }

    public PortfolioSummary getPortfolioSummary() {

        var assets = assetRepo.findAll();

        int totalAssets = assets.size();

        Double totalQuantity = assets.stream()
                .mapToDouble(Asset::getQuantity)
                .sum();

        Double totalInvestedValue = assets.stream()
                .mapToDouble(asset -> asset.getQuantity() * asset.getBuyPrice())
                .sum();

        return new PortfolioSummary(totalAssets, totalQuantity, totalInvestedValue);
    }

}

