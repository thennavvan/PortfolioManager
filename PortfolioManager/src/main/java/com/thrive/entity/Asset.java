package com.thrive.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "assets")
public class Asset {
    public enum AssetType {
        STOCK,
        BOND,
        CRYPTO,
        CASH,
        ETF,
        COMMODITY,
        REAL_ESTATE,
        MUTUAL_FUND
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Company name cannot be empty")
    private String companyName;

    @Column(nullable = false)
    @NotBlank(message = "Ticker symbol cannot be empty")
    private String tickerSymbol;

    @NotNull(message = "Asset type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Positive(message = "Quantity must be greater than zero")
    @Column(nullable = false)
    private Double quantityOwned;

    @Positive(message = "Buy price must be greater than zero")
    @Column(nullable = false)
    private Double buyPrice;

    public Asset() {
    }

    public Asset(String companyName, String tickerSymbol, AssetType assetType, Double quantityOwned, Double buyPrice) {
        this.companyName = companyName;
        this.tickerSymbol = tickerSymbol;
        this.assetType = assetType;
        this.quantityOwned = quantityOwned;
        this.buyPrice = buyPrice;
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public void setTickerSymbol(String tickerSymbol) {
        this.tickerSymbol = tickerSymbol;
    }

    public AssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public Double getQuantityOwned() {
        return quantityOwned;
    }

    public void setQuantityOwned(Double quantityOwned) {
        this.quantityOwned = quantityOwned;
    }

    public Double getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(Double buyPrice) {
        this.buyPrice = buyPrice;
    }
}
