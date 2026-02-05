package com.thrive.repo;

import com.thrive.entity.Asset;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AssetRepoTest {

    @Autowired
    private AssetRepo assetRepo;

    @Test
    void saveAndFetchAsset_FromMySQL() {
        Asset asset = new Asset("Test Asset", "TST",
                Asset.AssetType.STOCK, 5.0, 100.0);

        Asset saved = assetRepo.save(asset);

        Optional<Asset> found = assetRepo.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals("TST", found.get().getSymbol());
        assertEquals(100.0, found.get().getBuyPrice());
    }

    @Test
    void findById_ShouldReturnEmpty_WhenNotPresent() {
        Optional<Asset> found = assetRepo.findById(999999L);
        assertTrue(found.isEmpty());
    }
}
