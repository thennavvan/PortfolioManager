package com.thrive.dto;

public class PortfolioSummary {
    private int totalAssets;
    private double totalQuantity;
    private double totalInvestedValue;

    public PortfolioSummary(int totalAssets, double totalQuantity, double totalInvestedValue) {
        this.totalAssets = totalAssets;
        this.totalQuantity = totalQuantity;
        this.totalInvestedValue = totalInvestedValue;
    }

    public int getTotalAssets() {
        return totalAssets;
    }

    public double getTotalQuantity() {
        return totalQuantity;
    }

    public double getTotalInvestedValue() {
        return totalInvestedValue;
    }
}
