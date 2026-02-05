package com.thrive.dto;

import java.util.List;

public class PortfolioSummaryResponse {
    private List<PortfolioAssetSummary> assets;
    private Double totalPortfolioValue;
    private Double totalInvestedValue;
    private Double profitLoss;
    private Double profitLossPercent;

    public PortfolioSummaryResponse() {
    }

    public PortfolioSummaryResponse(List<PortfolioAssetSummary> assets, Double totalPortfolioValue, 
                                   Double totalInvestedValue, Double profitLoss, Double profitLossPercent) {
        this.assets = assets;
        this.totalPortfolioValue = totalPortfolioValue;
        this.totalInvestedValue = totalInvestedValue;
        this.profitLoss = profitLoss;
        this.profitLossPercent = profitLossPercent;
    }

    public List<PortfolioAssetSummary> getAssets() {
        return assets;
    }

    public void setAssets(List<PortfolioAssetSummary> assets) {
        this.assets = assets;
    }

    public Double getTotalPortfolioValue() {
        return totalPortfolioValue;
    }

    public void setTotalPortfolioValue(Double totalPortfolioValue) {
        this.totalPortfolioValue = totalPortfolioValue;
    }

    public Double getTotalInvestedValue() {
        return totalInvestedValue;
    }

    public void setTotalInvestedValue(Double totalInvestedValue) {
        this.totalInvestedValue = totalInvestedValue;
    }

    public Double getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(Double profitLoss) {
        this.profitLoss = profitLoss;
    }

    public Double getProfitLossPercent() {
        return profitLossPercent;
    }

    public void setProfitLossPercent(Double profitLossPercent) {
        this.profitLossPercent = profitLossPercent;
    }
}
