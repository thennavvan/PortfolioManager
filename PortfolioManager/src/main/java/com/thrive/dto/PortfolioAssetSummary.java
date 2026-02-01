package com.thrive.dto;

public class PortfolioAssetSummary {
    private String symbol;
    private Double quantity;
    private Double price;
    private Double value;

    public PortfolioAssetSummary(String symbol, Double quantity, Double price) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.price = price;
        this.value = quantity * price;
    }

    public String getSymbol() {
        return symbol;
    }

    public Double getQuantity() {
        return quantity;
    }

    public Double getPrice() {
        return price;
    }

    public Double getValue() {
        return value;
    }
}
