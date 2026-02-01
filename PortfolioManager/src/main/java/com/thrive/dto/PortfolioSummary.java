package com.thrive.dto;

public class PortfolioSummary {
    private int totalAssets;
    private Double totalQuantity;
    private Double totalInvestedValue;

    public PortfolioSummary(int totalAssets, Double totalQuantity, Double totalInvestedValue) {
        this.totalAssets = totalAssets;
        this.totalQuantity = totalQuantity;
        this.totalInvestedValue = totalInvestedValue;
    }

    public int getTotalAssets() {
        return totalAssets;
    }

    public Double getTotalQuantity() {
        return totalQuantity;
    }

    public Double getTotalInvestedValue() {
        return totalInvestedValue;
    }
}
