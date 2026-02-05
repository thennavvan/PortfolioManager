package com.thrive.dto;

import java.util.List;

public class PortfolioAllocationResponse {

    private double totalValue;
    private List<PortfolioAllocationItem> allocations;

    public PortfolioAllocationResponse() {
    }

    public PortfolioAllocationResponse(double totalValue, List<PortfolioAllocationItem> allocations) {
        this.totalValue = totalValue;
        this.allocations = allocations;
    }

    public double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(double totalValue) {
        this.totalValue = totalValue;
    }

    public List<PortfolioAllocationItem> getAllocations() {
        return allocations;
    }

    public void setAllocations(List<PortfolioAllocationItem> allocations) {
        this.allocations = allocations;
    }
}
