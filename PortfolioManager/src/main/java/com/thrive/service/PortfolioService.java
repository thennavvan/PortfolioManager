package com.thrive.service;

import com.thrive.dto.*;
import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.*;

@Service
public class PortfolioService {

    private final AssetRepo assetRepo;
    private final MarketPriceService marketPriceService;

    public PortfolioService(AssetRepo assetRepo,
                            MarketPriceService marketPriceService) {
        this.assetRepo = assetRepo;
        this.marketPriceService = marketPriceService;
    }

    public PortfolioSummaryResponse getPortfolioSummary() {

        List<Asset> assets = assetRepo.findAll();
        List<PortfolioAssetSummary> summaries = new ArrayList<>();

        Double totalValue = 0.0;

        for (Asset asset : assets) {
            Double price = marketPriceService.getLivePrice(asset.getTickerSymbol()).getPrice();
            // If current price is 0 (Yahoo down), use buy price to avoid misleading loss
            Double effectivePrice = (price == 0.0) ? asset.getBuyPrice() : price;
            PortfolioAssetSummary summary =
                    new PortfolioAssetSummary(
                            asset.getTickerSymbol(),
                            asset.getQuantityOwned(),
                            effectivePrice
                    );

            summaries.add(summary);
            totalValue += summary.getValue();
        }

        return new PortfolioSummaryResponse(summaries, totalValue);
    }

    public PortfolioAllocationResponse getAllocation() {

        List<Asset> assets = assetRepo.findAll();

        Map<String, Double> valueByType = new HashMap<>();
        double totalValue = 0.0;

        for (Asset asset : assets) {
            double currentPrice = marketPriceService.getLivePrice(asset.getTickerSymbol()).getPrice();
            // If current price is 0 (Yahoo down), use buy price to avoid misleading allocation
            double effectivePrice = (currentPrice == 0.0) ? asset.getBuyPrice() : currentPrice;
            double marketValue = effectivePrice * asset.getQuantityOwned();

            valueByType.merge(asset.getAssetType().name(), marketValue, Double::sum);
            totalValue += marketValue;
        }

        List<PortfolioAllocationItem> allocation = new ArrayList<>();

        for (Map.Entry<String, Double> entry : valueByType.entrySet()) {
            double percentage = (totalValue == 0) ? 0 : (entry.getValue() / totalValue) * 100;
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

    public List<HoldingDto> getHoldings() {

        List<Asset> assets = assetRepo.findAll();
        List<HoldingDto> holdings = new ArrayList<>();

        for (Asset asset : assets) {

            double currentPrice = marketPriceService
                    .getLivePrice(asset.getTickerSymbol())
                    .getPrice();

            // If current price is 0 (Yahoo down), use buy price to avoid misleading loss
            double effectivePrice = (currentPrice == 0.0) ? asset.getBuyPrice() : currentPrice;

            double investedValue = asset.getQuantityOwned() * asset.getBuyPrice();
            double marketValue = asset.getQuantityOwned() * effectivePrice;
            double profitLoss = marketValue - investedValue;

            double profitLossPercent = investedValue == 0
                    ? 0
                    : (profitLoss / investedValue) * 100;

            HoldingDto dto = new HoldingDto();
            dto.setSymbol(asset.getTickerSymbol());
            dto.setAssetType(asset.getAssetType().name());
            dto.setQuantity(asset.getQuantityOwned());
            dto.setBuyPrice(asset.getBuyPrice());
            dto.setCurrentPrice(effectivePrice);
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
