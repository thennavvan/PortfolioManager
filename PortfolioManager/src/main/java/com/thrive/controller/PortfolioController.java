package com.thrive.controller;

import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.service.PortfolioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.thrive.dto.PortfolioAllocationResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {

        this.portfolioService = portfolioService;
    }

    @GetMapping("/summary")
    public PortfolioSummaryResponse getSummary() {

        return portfolioService.getPortfolioSummary();
    }

    @GetMapping("/allocation")
    public PortfolioAllocationResponse getAllocation() {
        return portfolioService.getAllocation();
    }
}
