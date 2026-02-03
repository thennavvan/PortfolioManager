package com.thrive.dto;

public class HoldingDto {

    private String symbol;
    private String assetType;
    private double quantity;
    private double buyPrice;
    private double currentPrice;
    private double investedValue;
    private double marketValue;
    private double profitLoss;
    private double profitLossPercent;

    // getters & setters

    public String getSymbol() {
        return symbol;
    }

    public String getAssetType() {
        return assetType;
    }

    public double getQuantity() {
        return quantity;
    }

    public double getBuyPrice() {
        return buyPrice;
    }

    public double getCurrentPrice() {
        return currentPrice;
    }

    public double getInvestedValue() {
        return investedValue;
    }

    public double getMarketValue() {
        return marketValue;
    }

    public double getProfitLoss() {
        return profitLoss;
    }

    public double getProfitLossPercent() {
        return profitLossPercent;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public void setBuyPrice(double buyPrice) {
        this.buyPrice = buyPrice;
    }

    public void setCurrentPrice(double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public void setInvestedValue(double investedValue) {
        this.investedValue = investedValue;
    }

    public void setMarketValue(double marketValue) {
        this.marketValue = marketValue;
    }

    public void setProfitLoss(double profitLoss) {
        this.profitLoss = profitLoss;
    }

    public void setProfitLossPercent(double profitLossPercent) {
        this.profitLossPercent = profitLossPercent;
    }
}
