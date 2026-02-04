package com.thrive.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "portfolio_value_snapshots")
public class PortfolioValueSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Instant snapshotTime;

    @Column(nullable = false)
    private Double totalValue;

    public PortfolioValueSnapshot() {
    }

    public PortfolioValueSnapshot(Instant snapshotTime, Double totalValue) {
        this.snapshotTime = snapshotTime;
        this.totalValue = totalValue;
    }

    public Long getId() {
        return id;
    }

    public Instant getSnapshotTime() {
        return snapshotTime;
    }

    public void setSnapshotTime(Instant snapshotTime) {
        this.snapshotTime = snapshotTime;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }
}
