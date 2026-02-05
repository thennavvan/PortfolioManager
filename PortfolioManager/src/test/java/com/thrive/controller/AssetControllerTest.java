package com.thrive.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AssetController.class)
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AssetService assetService;

    @MockBean
    private MarketPriceService marketPriceService;

    @Test
    void createAsset_ShouldReturn200AndSavedAsset_WhenRequestValid() throws Exception {
        Asset request = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 10.0, 150.0);
        Asset saved = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 10.0, 150.0);

        when(assetService.saveAsset(any(Asset.class))).thenReturn(saved);

        mockMvc.perform(post("/api/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Apple Inc."))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.assetType").value("STOCK"))
                .andExpect(jsonPath("$.quantity").value(10.0))
                .andExpect(jsonPath("$.buyPrice").value(150.0));

        verify(assetService, times(1)).saveAsset(any(Asset.class));
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void createAsset_ShouldReturn400_WhenValidationFails() throws Exception {
        Asset invalid = new Asset("", "", null, -1.0, -10.0);

        mockMvc.perform(post("/api/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.symbol").exists())
                .andExpect(jsonPath("$.assetType").exists())
                .andExpect(jsonPath("$.quantity").exists())
                .andExpect(jsonPath("$.buyPrice").exists());

        verifyNoInteractions(assetService);
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void getAllAssets_ShouldReturn200AndList() throws Exception {
        List<Asset> assets = Arrays.asList(
                new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 10.0, 150.0),
                new Asset("Bitcoin", "BTC", Asset.AssetType.CRYPTO, 0.5, 30000.0)
        );

        when(assetService.getAllAssets()).thenReturn(assets);

        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$[1].symbol").value("BTC"));

        verify(assetService, times(1)).getAllAssets();
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void getAssetById_ShouldReturn200_WhenFound() throws Exception {
        Asset asset = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 10.0, 150.0);
        when(assetService.getAssetById(1L)).thenReturn(Optional.of(asset));

        mockMvc.perform(get("/api/assets/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.symbol").value("AAPL"));

        verify(assetService, times(1)).getAssetById(1L);
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void getAssetById_ShouldReturn404_WhenNotFound() throws Exception {
        when(assetService.getAssetById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/assets/999"))
                .andExpect(status().isNotFound());

        verify(assetService, times(1)).getAssetById(999L);
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void deleteAsset_ShouldReturn204() throws Exception {
        doNothing().when(assetService).deleteAsset(1L);

        mockMvc.perform(delete("/api/assets/1"))
                .andExpect(status().isNoContent());

        verify(assetService, times(1)).deleteAsset(1L);
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void updateAsset_ShouldReturn200AndUpdatedAsset_WhenFound() throws Exception {
        Asset request = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 20.0, 200.0);
        Asset updated = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 20.0, 200.0);

        when(assetService.updateAsset(eq(1L), any(Asset.class))).thenReturn(Optional.of(updated));

        mockMvc.perform(put("/api/assets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.quantity").value(20.0))
                .andExpect(jsonPath("$.buyPrice").value(200.0));

        verify(assetService, times(1)).updateAsset(eq(1L), any(Asset.class));
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void updateAsset_ShouldReturn404_WhenNotFound() throws Exception {
        Asset request = new Asset("Apple Inc.", "AAPL", Asset.AssetType.STOCK, 20.0, 200.0);
        when(assetService.updateAsset(eq(999L), any(Asset.class))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/assets/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());

        verify(assetService, times(1)).updateAsset(eq(999L), any(Asset.class));
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void updateAsset_ShouldReturn400_WhenValidationFails() throws Exception {
        Asset invalid = new Asset("", "", null, -1.0, -10.0);

        mockMvc.perform(put("/api/assets/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.symbol").exists())
                .andExpect(jsonPath("$.assetType").exists())
                .andExpect(jsonPath("$.quantity").exists())
                .andExpect(jsonPath("$.buyPrice").exists());

        verifyNoInteractions(assetService);
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void getPortfolioSummary_ShouldReturn200AndBody() throws Exception {
        PortfolioSummary summary = new PortfolioSummary(2, 100.5, 30000.0);

        when(assetService.getPortfolioSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/assets/summary"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalAssets").value(2))
                .andExpect(jsonPath("$.totalQuantity").value(100.5))
                .andExpect(jsonPath("$.totalInvestedValue").value(30000.0));

        verify(assetService, times(1)).getPortfolioSummary();
        verifyNoInteractions(marketPriceService);
    }

    @Test
    void getLivePrice_ShouldReturn200AndBody() throws Exception {
        PriceResponse priceResponse = new PriceResponse("AAPL", 150.0, "USD");

        when(marketPriceService.getLivePrice("AAPL")).thenReturn(priceResponse);

        mockMvc.perform(get("/api/assets/price/AAPL"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.price").value(150.0))
                .andExpect(jsonPath("$.currency").value("USD"));

        verify(marketPriceService, times(1)).getLivePrice("AAPL");
        verifyNoInteractions(assetService);
    }
}
