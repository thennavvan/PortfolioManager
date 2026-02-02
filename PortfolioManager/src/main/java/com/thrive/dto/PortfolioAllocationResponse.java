package com.thrive.dto;

import java.util.List;

public class PortfolioAllocationResponse {

    private double totalValue;
    private List<PortfolioAllocationItem> allocation;

    public PortfolioAllocationResponse(double totalValue, List<PortfolioAllocationItem> allocation) {
        this.totalValue = totalValue;
        this.allocation = allocation;
    }

    public double getTotalValue() {
        return totalValue;
    }

    public List<PortfolioAllocationItem> getAllocation() {
        return allocation;
    }
}
