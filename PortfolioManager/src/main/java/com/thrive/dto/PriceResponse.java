package com.thrive.dto;

public class PriceResponse {
    private String symbol;
    private double price;
    private String currency;

    public PriceResponse(String symbol, double price, String currency) {
        this.symbol = symbol;
        this.price = price;
        this.currency = currency;
    }

    public String getSymbol() {
        return symbol;
    }

    public double getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }
}
