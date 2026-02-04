package com.thrive.service;

import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import org.springframework.stereotype.Service;
import com.thrive.dto.PortfolioSummary;

import java.util.List;
import java.util.Optional;

@Service
public class AssetService {
    private final AssetRepo assetRepo;

    public AssetService(AssetRepo assetRepo) {
        this.assetRepo = assetRepo;
    }

    public Asset saveAsset(Asset asset){
        return assetRepo.save(asset);
    }

    public List<Asset> getAllAssets(){
        return assetRepo.findAll();
    }

    public Optional<Asset> getAssetById(Long id){
        return assetRepo.findById(id);
    }

    public Asset updateAsset(Long id, Asset updated) {
        Asset existing = assetRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found with id: " + id));

        existing.setTickerSymbol(updated.getTickerSymbol());
        existing.setCompanyName(updated.getCompanyName());
        existing.setAssetType(updated.getAssetType());
        existing.setQuantityOwned(updated.getQuantityOwned());
        existing.setBuyPrice(updated.getBuyPrice());

        return assetRepo.save(existing);
    }

    public void deleteAsset(Long id){
        assetRepo.deleteById(id);
    }

    public PortfolioSummary getPortfolioSummary() {

        var assets = assetRepo.findAll();

        int totalAssets = assets.size();

        Double totalQuantity = assets.stream()
                .mapToDouble(Asset::getQuantityOwned)
                .sum();

        Double totalInvestedValue = assets.stream()
                .mapToDouble(asset -> asset.getQuantityOwned() * asset.getBuyPrice())
                .sum();

        return new PortfolioSummary(totalAssets, totalQuantity, totalInvestedValue);
    }

}
