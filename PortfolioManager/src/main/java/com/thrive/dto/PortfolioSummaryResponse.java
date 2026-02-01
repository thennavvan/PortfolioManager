package com.thrive.dto;

import java.util.List;

public class PortfolioSummaryResponse {
    private List<PortfolioAssetSummary> assets;
    private Double totalValue;

    public PortfolioSummaryResponse(List<PortfolioAssetSummary> assets, Double totalValue) {
        this.assets = assets;
        this.totalValue = totalValue;
    }

    public List<PortfolioAssetSummary> getAssets() {
        return assets;
    }

    public Double getTotalValue() {
        return totalValue;
    }
}
