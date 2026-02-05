package com.thrive.service;

import com.thrive.dto.PortfolioAllocationItem;
import com.thrive.dto.PortfolioAllocationResponse;
import com.thrive.dto.PortfolioAssetSummary;
import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.dto.PriceResponse;
import com.thrive.entity.Asset;
import com.thrive.repo.AssetRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private AssetRepo assetRepo;

    @Mock
    private MarketPriceService marketPriceService;

    @InjectMocks
    private PortfolioService portfolioService;

    private Asset stockAsset;
    private Asset cryptoAsset;
    private Asset etfAsset;
    private List<Asset> testAssets;

    @BeforeEach
    void setUp() {
        stockAsset = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0);

        cryptoAsset = new Asset("Bitcoin", "BTC", Asset.AssetType.CRYPTO, 0.5, 30000.0);

        etfAsset = new Asset("S&P 500 ETF", "SPY", Asset.AssetType.ETF, 50.0, 400.0);

        testAssets = Arrays.asList(stockAsset, cryptoAsset, etfAsset);
    }

    @Test
    void getPortfolioSummary_ShouldReturnCorrectSummaryWithLivePrices() {
        // Given
        when(assetRepo.findAll()).thenReturn(testAssets);
        when(marketPriceService.getLivePrice("AAPL")).thenReturn(new PriceResponse("AAPL", 170.0, "USD"));
        when(marketPriceService.getLivePrice("BTC")).thenReturn(new PriceResponse("BTC", 35000.0, "USD"));
        when(marketPriceService.getLivePrice("SPY")).thenReturn(new PriceResponse("SPY", 420.0, "USD"));

        // When
        PortfolioSummaryResponse result = portfolioService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertNotNull(result.getAssets());
        assertEquals(3, result.getAssets().size());

        // Verify individual asset summaries
        PortfolioAssetSummary aaplSummary = result.getAssets().stream()
                .filter(asset -> "AAPL".equals(asset.getSymbol()))
                .findFirst()
                .orElse(null);
        assertNotNull(aaplSummary);
        assertEquals("AAPL", aaplSummary.getSymbol());
        assertEquals(100.0, aaplSummary.getQuantity());
        assertEquals(170.0, aaplSummary.getPrice());
        assertEquals(17000.0, aaplSummary.getValue());

        PortfolioAssetSummary btcSummary = result.getAssets().stream()
                .filter(asset -> "BTC".equals(asset.getSymbol()))
                .findFirst()
                .orElse(null);
        assertNotNull(btcSummary);
        assertEquals("BTC", btcSummary.getSymbol());
        assertEquals(0.5, btcSummary.getQuantity());
        assertEquals(35000.0, btcSummary.getPrice());
        assertEquals(17500.0, btcSummary.getValue());

        PortfolioAssetSummary spySummary = result.getAssets().stream()
                .filter(asset -> "SPY".equals(asset.getSymbol()))
                .findFirst()
                .orElse(null);
        assertNotNull(spySummary);
        assertEquals("SPY", spySummary.getSymbol());
        assertEquals(50.0, spySummary.getQuantity());
        assertEquals(420.0, spySummary.getPrice());
        assertEquals(21000.0, spySummary.getValue());

        // Verify total value
        assertEquals(17000.0 + 17500.0 + 21000.0, result.getTotalPortfolioValue(), 0.001);

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, times(1)).getLivePrice("AAPL");
        verify(marketPriceService, times(1)).getLivePrice("BTC");
        verify(marketPriceService, times(1)).getLivePrice("SPY");
    }

    @Test
    void getPortfolioSummary_ShouldReturnEmptySummaryWhenNoAssets() {
        // Given
        when(assetRepo.findAll()).thenReturn(Arrays.asList());

        // When
        PortfolioSummaryResponse result = portfolioService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertNotNull(result.getAssets());
        assertTrue(result.getAssets().isEmpty());
        assertEquals(0.0, result.getTotalPortfolioValue(), 0.001);

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, never()).getLivePrice(anyString());
    }

    @Test
    void getPortfolioSummary_ShouldHandleSingleAsset() {
        // Given
        List<Asset> singleAsset = Arrays.asList(stockAsset);
        when(assetRepo.findAll()).thenReturn(singleAsset);
        when(marketPriceService.getLivePrice("AAPL")).thenReturn(new PriceResponse("AAPL", 180.0, "USD"));

        // When
        PortfolioSummaryResponse result = portfolioService.getPortfolioSummary();

        // Then
        assertNotNull(result);
        assertEquals(1, result.getAssets().size());
        assertEquals(18000.0, result.getTotalPortfolioValue(), 0.001);

        PortfolioAssetSummary summary = result.getAssets().get(0);
        assertEquals("AAPL", summary.getSymbol());
        assertEquals(100.0, summary.getQuantity());
        assertEquals(180.0, summary.getPrice());
        assertEquals(18000.0, summary.getValue());

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, times(1)).getLivePrice("AAPL");
    }

    @Test
    void getAllocation_ShouldReturnCorrectAllocationByAssetType() {
        // Given
        when(assetRepo.findAll()).thenReturn(testAssets);
        when(marketPriceService.getLivePrice("AAPL")).thenReturn(new PriceResponse("AAPL", 170.0, "USD"));
        when(marketPriceService.getLivePrice("BTC")).thenReturn(new PriceResponse("BTC", 35000.0, "USD"));
        when(marketPriceService.getLivePrice("SPY")).thenReturn(new PriceResponse("SPY", 420.0, "USD"));

        // When
        PortfolioAllocationResponse result = portfolioService.getAllocations();

        // Then
        assertNotNull(result);
        assertNotNull(result.getAllocations());
        assertEquals(3, result.getAllocations().size());

        // Calculate expected values
        double stockValue = 100.0 * 170.0; // 17000.0
        double cryptoValue = 0.5 * 35000.0; // 17500.0
        double etfValue = 50.0 * 420.0; // 21000.0
        double totalValue = stockValue + cryptoValue + etfValue; // 55500.0

        assertEquals(totalValue, result.getTotalPortfolioValue(), 0.001);

        // Verify allocation items
        PortfolioAllocationItem stockAllocation = result.getAllocations().stream()
                .filter(item -> "STOCK".equals(item.getAssetType()))
                .findFirst()
                .orElse(null);
        assertNotNull(stockAllocation);
        assertEquals("STOCK", stockAllocation.getAssetType());
        assertEquals(stockValue, stockAllocation.getValue(), 0.001);
        assertEquals(Math.round((stockValue / totalValue) * 100 * 100.0) / 100.0, stockAllocation.getPercentage(), 0.001);

        PortfolioAllocationItem cryptoAllocation = result.getAllocations().stream()
                .filter(item -> "CRYPTO".equals(item.getAssetType()))
                .findFirst()
                .orElse(null);
        assertNotNull(cryptoAllocation);
        assertEquals("CRYPTO", cryptoAllocation.getAssetType());
        assertEquals(cryptoValue, cryptoAllocation.getValue(), 0.001);
        assertEquals(Math.round((cryptoValue / totalValue) * 100 * 100.0) / 100.0, cryptoAllocation.getPercentage(), 0.001);

        PortfolioAllocationItem etfAllocation = result.getAllocations().stream()
                .filter(item -> "ETF".equals(item.getAssetType()))
                .findFirst()
                .orElse(null);
        assertNotNull(etfAllocation);
        assertEquals("ETF", etfAllocation.getAssetType());
        assertEquals(etfValue, etfAllocation.getValue(), 0.001);
        assertEquals(Math.round((etfValue / totalValue) * 100 * 100.0) / 100.0, etfAllocation.getPercentage(), 0.001);

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, times(1)).getLivePrice("AAPL");
        verify(marketPriceService, times(1)).getLivePrice("BTC");
        verify(marketPriceService, times(1)).getLivePrice("SPY");
    }

    @Test
    void getAllocation_ShouldReturnEmptyAllocationWhenNoAssets() {
        // Given
        when(assetRepo.findAll()).thenReturn(Arrays.asList());

        // When
        PortfolioAllocationResponse result = portfolioService.getAllocations();

        // Then
        assertNotNull(result);
        assertNotNull(result.getAllocations());
        assertTrue(result.getAllocations().isEmpty());
        assertEquals(0.0, result.getTotalPortfolioValue(), 0.001);

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, never()).getLivePrice(anyString());
    }

    @Test
    void getAllocation_ShouldHandleMultipleAssetsOfSameType() {
        // Given
        Asset stockAsset2 = new Asset("Microsoft", "MSFT", Asset.AssetType.STOCK, 200.0, 250.0);
        List<Asset> assetsWithSameType = Arrays.asList(stockAsset, stockAsset2);
        
        when(assetRepo.findAll()).thenReturn(assetsWithSameType);
        when(marketPriceService.getLivePrice("AAPL")).thenReturn(new PriceResponse("AAPL", 170.0, "USD"));
        when(marketPriceService.getLivePrice("MSFT")).thenReturn(new PriceResponse("MSFT", 300.0, "USD"));

        // When
        PortfolioAllocationResponse result = portfolioService.getAllocations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.getAllocations().size());

        double stockValue1 = 100.0 * 170.0; // 17000.0
        double stockValue2 = 200.0 * 300.0; // 60000.0
        double totalValue = stockValue1 + stockValue2; // 77000.0

        assertEquals(totalValue, result.getTotalPortfolioValue(), 0.001);

        PortfolioAllocationItem stockAllocation = result.getAllocations().get(0);
        assertEquals("STOCK", stockAllocation.getAssetType());
        assertEquals(totalValue, stockAllocation.getValue(), 0.001);
        assertEquals(100.0, stockAllocation.getPercentage(), 0.001);

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, times(1)).getLivePrice("AAPL");
        verify(marketPriceService, times(1)).getLivePrice("MSFT");
    }

    @Test
    void getAllocation_ShouldRoundValuesCorrectly() {
        // Given
        Asset assetWithFractionalValue = new Asset("Test", "TST", Asset.AssetType.STOCK, 1.0, 1.0);
        when(assetRepo.findAll()).thenReturn(Arrays.asList(assetWithFractionalValue));
        when(marketPriceService.getLivePrice("TST")).thenReturn(new PriceResponse("TST", 1.234567, "USD"));

        // When
        PortfolioAllocationResponse result = portfolioService.getAllocations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.getAllocations().size());

        PortfolioAllocationItem allocation = result.getAllocations().get(0);
        assertEquals(1.23, allocation.getValue(), 0.001); // Should be rounded to 2 decimal places
        assertEquals(100.0, allocation.getPercentage(), 0.001); // Should be rounded to 2 decimal places
        assertEquals(1.23, result.getTotalPortfolioValue(), 0.001); // Should be rounded to 2 decimal places

        verify(assetRepo, times(1)).findAll();
        verify(marketPriceService, times(1)).getLivePrice("TST");
    }
}
