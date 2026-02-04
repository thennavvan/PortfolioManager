package com.thrive.service;

import com.thrive.dto.PortfolioHistoryPoint;
import com.thrive.entity.Asset;
import com.thrive.entity.PortfolioValueSnapshot;
import com.thrive.repo.AssetRepo;
import com.thrive.repo.PortfolioValueSnapshotRepo;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class PortfolioHistoryService {

    private final AssetRepo assetRepo;
    private final PortfolioValueSnapshotRepo snapshotRepo;
    private final MarketPriceService marketPriceService;

    public PortfolioHistoryService(AssetRepo assetRepo,
                                  PortfolioValueSnapshotRepo snapshotRepo,
                                  MarketPriceService marketPriceService) {
        this.assetRepo = assetRepo;
        this.snapshotRepo = snapshotRepo;
        this.marketPriceService = marketPriceService;
    }

    public PortfolioValueSnapshot recordSnapshot() {
        List<Asset> assets = assetRepo.findAll();
        double totalValue = 0.0;

        for (Asset asset : assets) {
            double currentPrice = marketPriceService.getLivePrice(asset.getTickerSymbol()).getPrice();
            totalValue += currentPrice * asset.getQuantityOwned();
        }

        PortfolioValueSnapshot snapshot = new PortfolioValueSnapshot(Instant.now(), round(totalValue));
        return snapshotRepo.save(snapshot);
    }

    public List<PortfolioHistoryPoint> getHistory() {
        List<PortfolioValueSnapshot> snapshots = snapshotRepo.findAll(Sort.by(Sort.Direction.ASC, "snapshotTime"));
        List<PortfolioHistoryPoint> points = new ArrayList<>();

        for (PortfolioValueSnapshot snapshot : snapshots) {
            points.add(new PortfolioHistoryPoint(snapshot.getSnapshotTime(), snapshot.getTotalValue()));
        }

        return points;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
