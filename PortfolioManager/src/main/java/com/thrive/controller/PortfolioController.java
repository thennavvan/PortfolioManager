package com.thrive.controller;

import com.thrive.dto.HoldingDto;
import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.entity.PortfolioSnapshot;
import com.thrive.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.thrive.dto.PortfolioAllocationResponse;

import java.util.List;

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

    @GetMapping("/holdings")
    public ResponseEntity<List<HoldingDto>> getHoldings() {
        return ResponseEntity.ok(portfolioService.getHoldings());
    }

    @PostMapping("/snapshot")
    public ResponseEntity<PortfolioSnapshot> saveSnapshot() {
        PortfolioSnapshot snapshot = portfolioService.savePortfolioSnapshot();
        return ResponseEntity.ok(snapshot);
    }

    @PostMapping("/snapshot/auto")
    public ResponseEntity<?> autoSaveSnapshot() {
        PortfolioSnapshot snapshot = portfolioService.autoSaveSnapshotIfNeeded();
        if (snapshot != null) {
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
                {
                    put("saved", true);
                    put("snapshot", snapshot);
                    put("message", "Daily snapshot saved automatically");
                }
            });
        }
        return ResponseEntity.ok(new java.util.HashMap<String, Object>() {
            {
                put("saved", false);
                put("message", "Snapshot already saved today");
            }
        });
    }

    @GetMapping("/history")
    public ResponseEntity<List<PortfolioSnapshot>> getHistory(@RequestParam(defaultValue = "30") int days) {
        List<PortfolioSnapshot> history = portfolioService.getPortfolioHistory(days);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/all")
    public ResponseEntity<List<PortfolioSnapshot>> getAllHistory() {
        List<PortfolioSnapshot> history = portfolioService.getAllPortfolioHistory();
        return ResponseEntity.ok(history);
    }

}
