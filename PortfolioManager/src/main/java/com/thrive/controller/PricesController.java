package com.thrive.controller;

import com.thrive.dto.PriceResponse;
import com.thrive.service.MarketPriceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prices")
public class PricesController {

    private final MarketPriceService marketPriceService;

    public PricesController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<PriceResponse> getPrice(@PathVariable String symbol) {
        return ResponseEntity.ok(marketPriceService.getLivePrice(symbol));
    }

    @PostMapping("/bulk")
    public ResponseEntity<Map<String, PriceResponse>> getPricesBulk(@RequestBody BulkPriceRequest request) {
        if (request == null || request.getSymbols() == null || request.getSymbols().isEmpty()) {
            return ResponseEntity.ok(Map.of());
        }

        String[] symbolsArray = request.getSymbols().toArray(new String[0]);
        return ResponseEntity.ok(marketPriceService.getLivePrices(symbolsArray));
    }

    public static class BulkPriceRequest {
        private List<String> symbols;

        public BulkPriceRequest() {
        }

        public List<String> getSymbols() {
            return symbols;
        }

        public void setSymbols(List<String> symbols) {
            this.symbols = symbols;
        }
    }
}
