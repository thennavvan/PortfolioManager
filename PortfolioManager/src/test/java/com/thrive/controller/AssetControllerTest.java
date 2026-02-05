package com.thrive.controller;

import com.thrive.dto.PortfolioSummary;
import com.thrive.dto.PriceResponse;
import com.thrive.entity.Asset;
import com.thrive.service.AssetService;
import com.thrive.service.MarketPriceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AssetController.class)
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AssetService assetService;

    @MockBean
    private MarketPriceService marketPriceService;

    private final Map<String, PriceResponse> priceBySymbol = new HashMap<>();
    private final AtomicReference<String> lastSymbol = new AtomicReference<>();

    private void stubLivePrice(String symbol, double price) {
        priceBySymbol.put(symbol, new PriceResponse(symbol, price, "USD"));
    }

    private void installMockRestClientForStaticMarketPriceService() {
        try {
            org.springframework.web.client.RestClient restClient = mock(org.springframework.web.client.RestClient.class);
            @SuppressWarnings("rawtypes")
            org.springframework.web.client.RestClient.RequestHeadersUriSpec uriSpec = mock(org.springframework.web.client.RestClient.RequestHeadersUriSpec.class);
            @SuppressWarnings("rawtypes")
            org.springframework.web.client.RestClient.RequestHeadersSpec headersSpec = mock(org.springframework.web.client.RestClient.RequestHeadersSpec.class);
            org.springframework.web.client.RestClient.ResponseSpec responseSpec = mock(org.springframework.web.client.RestClient.ResponseSpec.class);

            when(restClient.get()).thenReturn(uriSpec);
            when(uriSpec.uri(eq("/price/{symbol}"), any(Object[].class))).thenAnswer(invocation -> {
                Object raw = invocation.getArgument(1);
                if (raw instanceof Object[] arr && arr.length > 0) {
                    lastSymbol.set(String.valueOf(arr[0]));
                } else {
                    lastSymbol.set(String.valueOf(raw));
                }
                return headersSpec;
            });
            when(headersSpec.retrieve()).thenReturn(responseSpec);
            when(responseSpec.body(eq(PriceResponse.class))).thenAnswer(invocation -> priceBySymbol.get(lastSymbol.get()));

            Field field = MarketPriceService.class.getDeclaredField("restClient");
            field.setAccessible(true);
            field.set(null, restClient);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void getAllAssets_ShouldReturnAssets() throws Exception {
        List<Asset> assets = Arrays.asList(
                new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0),
                new Asset("Bitcoin", "BTC", Asset.AssetType.CRYPTO, 0.5, 30000.0)
        );

        when(assetService.getAllAssets()).thenReturn(assets);

        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$[1].symbol").value("BTC"));

        verify(assetService, times(1)).getAllAssets();
    }

    @Test
    void getAssetById_WhenFound_ShouldReturnAsset() throws Exception {
        Asset asset = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0);
        when(assetService.getAssetById(1L)).thenReturn(Optional.of(asset));

        mockMvc.perform(get("/api/assets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"));

        verify(assetService, times(1)).getAssetById(1L);
    }

    @Test
    void getAssetById_WhenNotFound_ShouldReturn404() throws Exception {
        when(assetService.getAssetById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/assets/999"))
                .andExpect(status().isNotFound());

        verify(assetService, times(1)).getAssetById(999L);
    }

    @Test
    void getAssetBySymbol_WhenFound_ShouldReturnAsset() throws Exception {
        Asset asset = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0);
        when(assetService.findBySymbol("AAPL")).thenReturn(Optional.of(asset));

        mockMvc.perform(get("/api/assets/symbol/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"));

        verify(assetService, times(1)).findBySymbol("AAPL");
    }

    @Test
    void createAsset_WithValidRequest_ShouldReturnSavedAsset() throws Exception {
        Asset asset = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 100.0, 150.0);
        when(assetService.saveAsset(any(Asset.class))).thenReturn(asset);

        String body = "{" +
                "\"name\":\"Apple Inc.\"," +
                "\"symbol\":\"AAPL\"," +
                "\"assetType\":\"STOCK\"," +
                "\"quantity\":100.0," +
                "\"buyPrice\":150.0" +
                "}";

        mockMvc.perform(
                        post("/api/assets")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.assetType").value("STOCK"));

        verify(assetService, times(1)).saveAsset(any(Asset.class));
    }

    @Test
    void createAsset_WithInvalidRequest_ShouldReturn400() throws Exception {
        String body = "{" +
                "\"name\":\"\"," +
                "\"symbol\":\"AAPL\"," +
                "\"assetType\":\"STOCK\"," +
                "\"quantity\":-1.0," +
                "\"buyPrice\":150.0" +
                "}";

        mockMvc.perform(
                        post("/api/assets")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isBadRequest());

        verify(assetService, never()).saveAsset(any(Asset.class));
    }

    @Test
    void updateAsset_WithValidRequest_ShouldReturnUpdatedAsset() throws Exception {
        Asset updated = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 200.0, 155.0);
        when(assetService.updateAsset(any(Long.class), any(Asset.class))).thenReturn(updated);

        String body = "{" +
                "\"name\":\"Apple Inc.\"," +
                "\"symbol\":\"AAPL\"," +
                "\"assetType\":\"STOCK\"," +
                "\"quantity\":200.0," +
                "\"buyPrice\":155.0" +
                "}";

        mockMvc.perform(
                        put("/api/assets/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body)
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(200.0));

        verify(assetService, times(1)).updateAsset(any(Long.class), any(Asset.class));
    }

    @Test
    void deleteAsset_ShouldReturn204() throws Exception {
        doNothing().when(assetService).deleteAsset(1L);

        mockMvc.perform(delete("/api/assets/1"))
                .andExpect(status().isNoContent());

        verify(assetService, times(1)).deleteAsset(1L);
    }

    @Test
    void getPortfolioSummary_ShouldReturnSummary() throws Exception {
        PortfolioSummary summary = new PortfolioSummary(2, 100.5, 30000.0);
        when(assetService.getPortfolioSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/assets/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets").value(2))
                .andExpect(jsonPath("$.totalQuantity").value(100.5));

        verify(assetService, times(1)).getPortfolioSummary();
    }

    @Test
    void getLivePrice_ShouldReturnPriceResponse() throws Exception {
        stubLivePrice("AAPL", 170.0);
        installMockRestClientForStaticMarketPriceService();

        mockMvc.perform(get("/api/assets/price/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.price").value(170.0))
                .andExpect(jsonPath("$.currency").value("USD"));
    }
}
