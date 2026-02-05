package com.thrive.controller;

import com.thrive.dto.HoldingDto;
import com.thrive.dto.PortfolioAllocationItem;
import com.thrive.dto.PortfolioAllocationResponse;
import com.thrive.dto.PortfolioAssetSummary;
import com.thrive.dto.PortfolioSummaryResponse;
import com.thrive.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PortfolioController.class)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PortfolioService portfolioService;

    @Test
    void getSummary_ShouldReturn200AndBody() throws Exception {
        List<PortfolioAssetSummary> assets = Arrays.asList(
                new PortfolioAssetSummary("AAPL", 10.0, 170.0)
        );
        PortfolioSummaryResponse response = new PortfolioSummaryResponse(assets, 1700.0);

        when(portfolioService.getPortfolioSummary()).thenReturn(response);

        mockMvc.perform(get("/api/portfolio/summary"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.assets[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$.totalValue").value(1700.0));

        verify(portfolioService, times(1)).getPortfolioSummary();
    }

    @Test
    void getAllocation_ShouldReturn200AndBody() throws Exception {
        List<PortfolioAllocationItem> allocation = Arrays.asList(
                new PortfolioAllocationItem("STOCK", 1700.0, 100.0)
        );
        PortfolioAllocationResponse response = new PortfolioAllocationResponse(1700.0, allocation);

        when(portfolioService.getAllocation()).thenReturn(response);

        mockMvc.perform(get("/api/portfolio/allocation"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalValue").value(1700.0))
                .andExpect(jsonPath("$.allocation[0].assetType").value("STOCK"))
                .andExpect(jsonPath("$.allocation[0].value").value(1700.0))
                .andExpect(jsonPath("$.allocation[0].percentage").value(100.0));

        verify(portfolioService, times(1)).getAllocation();
    }

    @Test
    void getHoldings_ShouldReturn200AndList() throws Exception {
        HoldingDto holding = new HoldingDto();
        holding.setSymbol("AAPL");
        holding.setAssetType("STOCK");
        holding.setQuantity(10.0);
        holding.setBuyPrice(150.0);
        holding.setCurrentPrice(170.0);
        holding.setInvestedValue(1500.0);
        holding.setMarketValue(1700.0);
        holding.setProfitLoss(200.0);
        holding.setProfitLossPercent(13.33);

        when(portfolioService.getHoldings()).thenReturn(List.of(holding));

        mockMvc.perform(get("/api/portfolio/holdings"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].symbol").value("AAPL"))
                .andExpect(jsonPath("$[0].profitLoss").value(200.0));

        verify(portfolioService, times(1)).getHoldings();
    }
}
