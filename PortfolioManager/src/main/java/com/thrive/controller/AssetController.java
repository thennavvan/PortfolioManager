package com.thrive.controller;

import com.thrive.entity.Asset;
import com.thrive.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.thrive.dto.PortfolioSummary;
import com.thrive.dto.PriceResponse;
import com.thrive.service.MarketPriceService;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {
    private final AssetService assetService;
    private final MarketPriceService marketPriceService;

    public AssetController(AssetService assetService, MarketPriceService marketPriceService) {
        this.assetService = assetService;
        this.marketPriceService = marketPriceService;
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@Valid @RequestBody Asset asset) {
        Asset savedAsset = assetService.saveAsset(asset);
        return ResponseEntity.ok(savedAsset);
    }

    // PUT (Update) asset by ID
    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @Valid @RequestBody Asset assetDetails) {
        Asset updatedAsset = assetService.updateAsset(id, assetDetails);
        return ResponseEntity.ok(updatedAsset);
    }

    // GET asset by symbol
    @GetMapping("/symbol/{symbol}")
    public ResponseEntity<Asset> getAssetBySymbol(@PathVariable String symbol) {
        return assetService.findBySymbol(symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET all assets
    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    // GET asset by ID
    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE asset by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummary> getPortfolioSummary() {
        return ResponseEntity.ok(assetService.getPortfolioSummary());
    }

    @GetMapping("/price/{symbol}")
    public PriceResponse getLivePrice(@PathVariable String symbol) {
        return marketPriceService.getLivePrice(symbol);
    }
}
