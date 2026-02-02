package com.thrive.dto;

public class PortfolioAllocationItem {

    private String assetType;
    private double value;
    private double percentage;

    public PortfolioAllocationItem(String assetType, double value, double percentage) {
        this.assetType = assetType;
        this.value = value;
        this.percentage = percentage;
    }

    public String getAssetType() {
        return assetType;
    }

    public double getValue() {
        return value;
    }

    public double getPercentage() {
        return percentage;
    }
}
