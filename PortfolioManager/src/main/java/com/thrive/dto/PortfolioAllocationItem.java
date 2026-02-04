package com.thrive.dto;

public class PortfolioAllocationItem {

    private String assetType;
    private String name;
    private double value;
    private double percentage;
    private double percentageAllocation;

    public PortfolioAllocationItem() {
    }

    public PortfolioAllocationItem(String assetType, double value, double percentage) {
        this.assetType = assetType;
        this.name = assetType;
        this.value = value;
        this.percentage = percentage;
        this.percentageAllocation = percentage;
    }

    public String getAssetType() {
        return assetType;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public double getPercentageAllocation() {
        return percentageAllocation;
    }

    public void setPercentageAllocation(double percentageAllocation) {
        this.percentageAllocation = percentageAllocation;
    }
}
