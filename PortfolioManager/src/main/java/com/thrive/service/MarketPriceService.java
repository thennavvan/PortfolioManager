package com.thrive.service;

import com.thrive.dto.PriceResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MarketPriceService {

    private static RestClient restClient = null;

    public MarketPriceService() {
        this.restClient = RestClient.create("http://localhost:8000");
    }

    public static PriceResponse getLivePrice(String symbol) {
        try {
            return restClient
                    .get()
                    .uri("/price/{symbol}", symbol)
                    .retrieve()
                    .body(PriceResponse.class);

        } catch (Exception e) {
            throw new RuntimeException("Price service temporarily unavailable");
        }
    }
}
