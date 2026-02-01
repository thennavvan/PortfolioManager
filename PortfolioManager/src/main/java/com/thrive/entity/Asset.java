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
        CRYPTO,
        FOREX,
        ETF
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "Asset name cannot be empty")
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank(message = "Symbol cannot be empty")
    private String symbol;

    @NotNull(message = "Asset type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType assetType;

    @Positive(message = "Quantity must be greater than zero")
    @Column(nullable = false)
    private Double quantity;

    @Positive(message = "Buy price must be greater than zero")
    @Column(nullable = false)
    private Double buyPrice;

    public Asset() {
    }

    public Asset(String name, String symbol, AssetType assetType, Double quantity, Double buyPrice) {
        this.name = name;
        this.symbol = symbol;
        this.assetType = assetType;
        this.quantity = quantity;
        this.buyPrice = buyPrice;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public AssetType getAssetType() {
        return assetType;
    }

    public void setAssetType(AssetType assetType) {
        this.assetType = assetType;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(Double buyPrice) {
        this.buyPrice = buyPrice;
    }

}
