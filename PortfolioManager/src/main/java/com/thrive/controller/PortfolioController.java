package com.thrive.controller;

import com.thrive.dto.HoldingDto;
import com.thrive.dto.PortfolioHistoryPoint;
import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.service.PortfolioHistoryService;
import com.thrive.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.thrive.dto.PortfolioAllocationResponse;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PortfolioHistoryService portfolioHistoryService;

    public PortfolioController(PortfolioService portfolioService,
                               PortfolioHistoryService portfolioHistoryService) {

        this.portfolioService = portfolioService;
        this.portfolioHistoryService = portfolioHistoryService;
    }

    @GetMapping("/summary")
    public PortfolioSummaryResponse getSummary() {

        return portfolioService.getPortfolioSummary();
    }

    @GetMapping("/allocation")
    public PortfolioAllocationResponse getAllocation() {

        return portfolioService.getAllocation();
    }

    @GetMapping("/holdings")
    public ResponseEntity<List<HoldingDto>> getHoldings() {
        return ResponseEntity.ok(portfolioService.getHoldings());
    }

    @GetMapping("/history")
    public ResponseEntity<List<PortfolioHistoryPoint>> getHistory() {
        return ResponseEntity.ok(portfolioHistoryService.getHistory());
    }

}
