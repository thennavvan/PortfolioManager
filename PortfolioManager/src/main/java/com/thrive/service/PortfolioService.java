package com.thrive.service;

import com.thrive.dto.PortfolioAssetSummary;
import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
            Double price = marketPriceService.getLivePrice(asset.getSymbol()).getPrice();
            PortfolioAssetSummary summary =
                    new PortfolioAssetSummary(
                            asset.getSymbol(),
                            asset.getQuantity(),
                            price
                    );

            summaries.add(summary);
            totalValue += summary.getValue();
        }

        return new PortfolioSummaryResponse(summaries, totalValue);
    }
}
