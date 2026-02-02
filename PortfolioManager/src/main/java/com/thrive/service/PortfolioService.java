package com.thrive.service;

import com.thrive.dto.PortfolioAssetSummary;
import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import org.springframework.stereotype.Service;
import com.thrive.dto.PortfolioAllocationItem;
import com.thrive.dto.PortfolioAllocationResponse;

import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;

import java.util.*;

@Service
public class PortfolioService {

    private final AssetRepo assetRepo;
    private final MarketPriceService marketPriceService;

    public PortfolioService(AssetRepo assetRepo,
                            MarketPriceService marketPriceService) {
        this.assetRepo = assetRepo;
        this.marketPriceService = marketPriceService;
    }

    public PortfolioSummaryResponse getPortfolioSummary() {

        List<Asset> assets = assetRepo.findAll();
        List<PortfolioAssetSummary> summaries = new ArrayList<>();

        Double totalValue = 0.0;

        for (Asset asset : assets) {
            Double price = marketPriceService.getLivePrice(asset.getSymbol()).getPrice();
            PortfolioAssetSummary summary =
                    new PortfolioAssetSummary(
                            asset.getSymbol(),
                            asset.getQuantity(),
                            price
                    );

            summaries.add(summary);
            totalValue += summary.getValue();
        }

        return new PortfolioSummaryResponse(summaries, totalValue);
    }

    public PortfolioAllocationResponse getAllocation() {

        List<Asset> assets = assetRepo.findAll();

        Map<String, Double> valueByType = new HashMap<>();
        double totalValue = 0.0;

        for (Asset asset : assets) {
            double currentPrice = marketPriceService.getLivePrice(asset.getSymbol()).getPrice();
            double marketValue = currentPrice * asset.getQuantity();

            valueByType.merge(asset.getAssetType().name(), marketValue, Double::sum);
            totalValue += marketValue;
        }

        List<PortfolioAllocationItem> allocation = new ArrayList<>();

        for (Map.Entry<String, Double> entry : valueByType.entrySet()) {
            double percentage = (entry.getValue() / totalValue) * 100;
            allocation.add(
                    new PortfolioAllocationItem(
                            entry.getKey(),
                            round(entry.getValue()),
                            round(percentage)
                    )
            );
        }

        return new PortfolioAllocationResponse(round(totalValue), allocation);
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }

    public void importFromCsv(MultipartFile file) {

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {

                // skip header
                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                String[] values = line.split(",");

                Asset asset = new Asset();
                asset.setSymbol(values[0].trim());
                asset.setQuantity(Double.parseDouble(values[1].trim()));
                asset.setBuyPrice(Double.parseDouble(values[2].trim()));
                asset.setAssetType(Asset.AssetType.valueOf(values[3].trim()));

                assetRepo.save(asset);
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to import CSV file");
        }
    }

}
