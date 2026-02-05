package com.thrive.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portfolio_snapshots")
public class PortfolioSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Double totalValue;

    @Column(nullable = false)
    private Double totalInvestedValue;

    @Column(nullable = false)
    private LocalDateTime snapshotDate;

    public PortfolioSnapshot() {
    }

    public PortfolioSnapshot(Double totalValue, Double totalInvestedValue, LocalDateTime snapshotDate) {
        this.totalValue = totalValue;
        this.totalInvestedValue = totalInvestedValue;
        this.snapshotDate = snapshotDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }

    public Double getTotalInvestedValue() {
        return totalInvestedValue;
    }

    public void setTotalInvestedValue(Double totalInvestedValue) {
        this.totalInvestedValue = totalInvestedValue;
    }

    public LocalDateTime getSnapshotDate() {
        return snapshotDate;
    }

    public void setSnapshotDate(LocalDateTime snapshotDate) {
        this.snapshotDate = snapshotDate;
    }
}
