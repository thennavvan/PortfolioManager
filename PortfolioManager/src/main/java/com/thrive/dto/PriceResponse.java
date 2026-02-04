package com.thrive.dto;

public class PriceResponse {
    private String symbol;
    private Double price;
    private String currency;

    public PriceResponse() {
    }

    public PriceResponse(String symbol, Double price, String currency) {
        this.symbol = symbol;
        this.price = price;
        this.currency = currency;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
