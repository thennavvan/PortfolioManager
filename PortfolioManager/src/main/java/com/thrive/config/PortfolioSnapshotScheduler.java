package com.thrive.config;

import com.thrive.service.PortfolioService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PortfolioSnapshotScheduler {

    private final PortfolioService portfolioService;

    public PortfolioSnapshotScheduler(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    // Save portfolio snapshot daily at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void savePortfolioSnapshot() {
        try {
            portfolioService.savePortfolioSnapshot();
            System.out.println("Portfolio snapshot saved successfully at: " + java.time.LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("Failed to save portfolio snapshot: " + e.getMessage());
        }
    }
}
