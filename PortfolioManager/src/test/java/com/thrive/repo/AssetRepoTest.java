package com.thrive.repo;

import com.thrive.entity.Asset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AssetRepoTest {

    @Autowired
    private AssetRepo assetRepo;

    @Test
    void findBySymbol_WhenPresent_ShouldReturnAsset() {
        Asset saved = assetRepo.save(new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0));

        Optional<Asset> result = assetRepo.findBySymbol("AAPL");

        assertTrue(result.isPresent());
        assertEquals(saved.getSymbol(), result.get().getSymbol());
        assertEquals(saved.getName(), result.get().getName());
    }

    @Test
    void findBySymbol_WhenMissing_ShouldReturnEmpty() {
        Optional<Asset> result = assetRepo.findBySymbol("MISSING");
        assertTrue(result.isEmpty());
    }
}
