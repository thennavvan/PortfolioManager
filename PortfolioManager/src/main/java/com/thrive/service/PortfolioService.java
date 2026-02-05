package com.thrive.service;

import com.thrive.dto.*;
import com.thrive.entity.Asset;
import com.thrive.entity.PortfolioSnapshot;
import com.thrive.repo.AssetRepo;
import com.thrive.repo.PortfolioSnapshotRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.*;

@Service
public class PortfolioService {

    private final AssetRepo assetRepo;
    private final PortfolioSnapshotRepo snapshotRepo;
    private final MarketPriceService marketPriceService;

    public PortfolioService(AssetRepo assetRepo,
                            PortfolioSnapshotRepo snapshotRepo,
                            MarketPriceService marketPriceService) {
        this.assetRepo = assetRepo;
        this.snapshotRepo = snapshotRepo;
        this.marketPriceService = marketPriceService;
    }

    public PortfolioSummaryResponse getPortfolioSummary() {

        List<Asset> assets = assetRepo.findAll();
        List<PortfolioAssetSummary> summaries = new ArrayList<>();

        Double totalPortfolioValue = 0.0;
        Double totalInvestedValue = 0.0;

        for (Asset asset : assets) {

            Double price = marketPriceService.getLivePrice(asset.getSymbol()).getPrice();

            Double currentPrice = MarketPriceService.getLivePrice(asset.getSymbol()).getPrice();
            Double marketValue = currentPrice * asset.getQuantity();
            Double investedValue = asset.getQuantity() * asset.getBuyPrice();
            

            PortfolioAssetSummary summary =
                    new PortfolioAssetSummary(
                            asset.getSymbol(),
                            asset.getQuantity(),
                            currentPrice
                    );

            summaries.add(summary);
            totalPortfolioValue += marketValue;
            totalInvestedValue += investedValue;
        }

        Double profitLoss = totalPortfolioValue - totalInvestedValue;
        Double profitLossPercent = totalInvestedValue == 0 ? 0 : (profitLoss / totalInvestedValue) * 100;

        return new PortfolioSummaryResponse(
                summaries, 
                round(totalPortfolioValue),
                round(totalInvestedValue),
                round(profitLoss),
                round(profitLossPercent)
        );
    }

    public PortfolioAllocationResponse getAllocation() {

        List<Asset> assets = assetRepo.findAll();

        Map<String, Double> valueByType = new HashMap<>();
        double totalValue = 0.0;

        for (Asset asset : assets) {
            double currentPrice = marketPriceService.getLivePrice(asset.getSymbol()).getPrice();
            double marketValue = currentPrice * asset.getQuantity();

            valueByType.merge(asset.getAssetType().name(), marketValue, Double::sum);
            totalValue += marketValue;
        }

        List<PortfolioAllocationItem> allocation = new ArrayList<>();

        for (Map.Entry<String, Double> entry : valueByType.entrySet()) {
            double percentage = (entry.getValue() / totalValue) * 100;
            allocation.add(
                    new PortfolioAllocationItem(
                            entry.getKey(),
                            round(entry.getValue()),
                            round(percentage)
                    )
            );
        }

        return new PortfolioAllocationResponse(round(totalValue), allocation);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    public PortfolioSnapshot savePortfolioSnapshot() {
        PortfolioSummaryResponse summary = getPortfolioSummary();
        PortfolioSnapshot snapshot = new PortfolioSnapshot(
                summary.getTotalPortfolioValue(),
                summary.getTotalInvestedValue(),
                LocalDateTime.now()
        );
        return snapshotRepo.save(snapshot);
    }

    public boolean shouldSaveSnapshot() {
        PortfolioSnapshot lastSnapshot = snapshotRepo.findLatestSnapshot();
        if (lastSnapshot == null) {
            return true; // No snapshot exists, save one
        }

        LocalDateTime lastSnapshotTime = lastSnapshot.getSnapshotDate();
        LocalDateTime today = LocalDateTime.now();
        
        // Check if last snapshot was today
        return !lastSnapshotTime.toLocalDate().equals(today.toLocalDate());
    }

    public PortfolioSnapshot autoSaveSnapshotIfNeeded() {
        if (shouldSaveSnapshot()) {
            return savePortfolioSnapshot();
        }
        return null;
    }

    public List<PortfolioSnapshot> getPortfolioHistory(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = now.minusDays(days);
        return snapshotRepo.findBySnapshotDateBetweenOrderBySnapshotDateAsc(startDate, now);
    }

    public List<PortfolioSnapshot> getAllPortfolioHistory() {
        return snapshotRepo.findAll();
    }

    public List<HoldingDto> getHoldings() {

        List<Asset> assets = assetRepo.findAll();
        List<HoldingDto> holdings = new ArrayList<>();

        for (Asset asset : assets) {

            double currentPrice = marketPriceService
                    .getLivePrice(asset.getSymbol())
                    .getPrice();

            double investedValue = asset.getQuantity() * asset.getBuyPrice();
            double marketValue = asset.getQuantity() * currentPrice;
            double profitLoss = marketValue - investedValue;

            double profitLossPercent = investedValue == 0
                    ? 0
                    : (profitLoss / investedValue) * 100;

            HoldingDto dto = new HoldingDto();
            dto.setSymbol(asset.getSymbol());
            dto.setAssetType(asset.getAssetType().name());
            dto.setQuantity(asset.getQuantity());
            dto.setBuyPrice(asset.getBuyPrice());
            dto.setCurrentPrice(currentPrice);
            dto.setInvestedValue(round(investedValue));
            dto.setMarketValue(round(marketValue));
            dto.setProfitLoss(round(profitLoss));
            dto.setProfitLossPercent(round(profitLossPercent));

            holdings.add(dto);
        }

        return holdings;
    }

//    private double round(double value) {
//        return Math.round(value * 100.0) / 100.0;
//    }
}
