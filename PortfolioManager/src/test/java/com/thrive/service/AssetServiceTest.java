package com.thrive.service;

import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import com.thrive.dto.PortfolioSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepo assetRepo;

    @InjectMocks
    private AssetService assetService;

    private Asset testAsset;
    private List<Asset> testAssets;

    @BeforeEach
    void setUp() {
        testAsset = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0);

        Asset testAsset2 = new Asset("Bitcoin", "BTC", Asset.AssetType.CRYPTO, 0.5, 30000.0);

        testAssets = Arrays.asList(testAsset, testAsset2);
    }

    @Test
    void saveAsset_ShouldReturnSavedAsset() {
        // Given
        when(assetRepo.save(any(Asset.class))).thenReturn(testAsset);

        // When
        Asset result = assetService.saveAsset(testAsset);

        // Then
        assertNotNull(result);
        assertEquals(testAsset.getName(), result.getName());
        assertEquals(testAsset.getSymbol(), result.getSymbol());
        assertEquals(testAsset.getAssetType(), result.getAssetType());
        assertEquals(testAsset.getQuantity(), result.getQuantity());
        assertEquals(testAsset.getBuyPrice(), result.getBuyPrice());
        verify(assetRepo, times(1)).save(testAsset);
    }

    @Test
    void getAllAssets_ShouldReturnAllAssets() {
        // Given
        when(assetRepo.findAll()).thenReturn(testAssets);

        // When
        List<Asset> result = assetService.getAllAssets();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(testAssets, result);
        verify(assetRepo, times(1)).findAll();
    }

    @Test
    void getAllAssets_ShouldReturnEmptyListWhenNoAssets() {
        // Given
        when(assetRepo.findAll()).thenReturn(Arrays.asList());

        // When
        List<Asset> result = assetService.getAllAssets();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(assetRepo, times(1)).findAll();
    }

    @Test
    void getAssetById_ShouldReturnAssetWhenFound() {
        // Given
        when(assetRepo.findById(1L)).thenReturn(Optional.of(testAsset));

        // When
        Optional<Asset> result = assetService.getAssetById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testAsset, result.get());
        verify(assetRepo, times(1)).findById(1L);
    }

    @Test
    void getAssetById_ShouldReturnEmptyWhenNotFound() {
        // Given
        when(assetRepo.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Asset> result = assetService.getAssetById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(assetRepo, times(1)).findById(999L);
    }

    @Test
    void deleteAsset_ShouldCallRepositoryDelete() {
        // Given
        Long assetId = 1L;
        doNothing().when(assetRepo).deleteById(assetId);

        // When
        assetService.deleteAsset(assetId);

        // Then
        verify(assetRepo, times(1)).deleteById(assetId);
    }

    @Test
    void getPortfolioSummary_ShouldReturnCorrectSummary() {
        // Given
        when(assetRepo.findAll()).thenReturn(testAssets);

        // When
        var result = assetService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalAssets());
        assertEquals(100.5, result.getTotalQuantity(), 0.001);
        assertEquals(15000.0 + 15000.0, result.getTotalInvestedValue(), 0.001);
        verify(assetRepo, times(1)).findAll();
    }

    @Test
    void getPortfolioSummary_ShouldReturnZeroSummaryWhenNoAssets() {
        // Given
        when(assetRepo.findAll()).thenReturn(Arrays.asList());

        // When
        var result = assetService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalAssets());
        assertEquals(0.0, result.getTotalQuantity(), 0.001);
        assertEquals(0.0, result.getTotalInvestedValue(), 0.001);
        verify(assetRepo, times(1)).findAll();
    }

    @Test
    void getPortfolioSummary_ShouldCalculateCorrectlyWithSingleAsset() {
        // Given
        List<Asset> singleAsset = Arrays.asList(testAsset);
        when(assetRepo.findAll()).thenReturn(singleAsset);

        // When
        var result = assetService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalAssets());
        assertEquals(100.0, result.getTotalQuantity(), 0.001);
        assertEquals(15000.0, result.getTotalInvestedValue(), 0.001);
        verify(assetRepo, times(1)).findAll();
    }

    @Test
    void getPortfolioSummary_ShouldHandleDifferentAssetTypes() {
        // Given
        Asset stockAsset = new Asset("Stock", "STK", Asset.AssetType.STOCK, 10.0, 100.0);
        Asset cryptoAsset = new Asset("Crypto", "CRP", Asset.AssetType.CRYPTO, 5.0, 50.0);
        Asset etfAsset = new Asset("ETF", "ETF", Asset.AssetType.ETF, 20.0, 200.0);
        Asset forexAsset = new Asset("Forex", "FX", Asset.AssetType.FOREX, 1000.0, 1.0);

        List<Asset> mixedAssets = Arrays.asList(stockAsset, cryptoAsset, etfAsset, forexAsset);
        when(assetRepo.findAll()).thenReturn(mixedAssets);

        // When
        var result = assetService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertEquals(4, result.getTotalAssets());
        assertEquals(1035.0, result.getTotalQuantity(), 0.001);
        assertEquals(1000.0 + 250.0 + 4000.0 + 1000.0, result.getTotalInvestedValue(), 0.001);
        verify(assetRepo, times(1)).findAll();
    }
}
