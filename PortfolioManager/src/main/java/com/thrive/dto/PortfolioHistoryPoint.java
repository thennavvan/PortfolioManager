package com.thrive.dto;

import java.time.Instant;

public class PortfolioHistoryPoint {

    private Instant time;
    private Double totalValue;

    public PortfolioHistoryPoint() {
    }

    public PortfolioHistoryPoint(Instant time, Double totalValue) {
        this.time = time;
        this.totalValue = totalValue;
    }

    public Instant getTime() {
        return time;
    }

    public void setTime(Instant time) {
        this.time = time;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }
}
