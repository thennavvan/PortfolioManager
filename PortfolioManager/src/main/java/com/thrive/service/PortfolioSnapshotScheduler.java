package com.thrive.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PortfolioSnapshotScheduler {

    private final PortfolioHistoryService portfolioHistoryService;

    public PortfolioSnapshotScheduler(PortfolioHistoryService portfolioHistoryService) {
        this.portfolioHistoryService = portfolioHistoryService;
    }

    @Scheduled(fixedRateString = "${portfolio.snapshot.fixedRateMs:300000}")
    public void record() {
        portfolioHistoryService.recordSnapshot();
    }
}
