//package com.thrive.service;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.thrive.dto.PriceResponse;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestClient;
//import java.time.Instant;
//import java.util.concurrent.ConcurrentHashMap;
//
//
//@Service
//public class MarketPriceService {
//
//    private static class CachedPrice {
//        double price;
//        String currency;
//        Instant timestamp;
//
//        CachedPrice(double price, String currency) {
//            this.price = price;
//            this.currency = currency;
//            this.timestamp = Instant.now();
//        }
//    }
//
//    private final ConcurrentHashMap<String, CachedPrice> cache = new ConcurrentHashMap<>();
//
//    private final RestClient restClient;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    public MarketPriceService() {
//        this.restClient = RestClient.create();
//    }
//
//    public PriceResponse getLivePrice(String symbol) {
//
//        // 1️⃣ Check cache (valid for 60 seconds)
//        CachedPrice cached = cache.get(symbol);
//        if (cached != null && Instant.now().minusSeconds(60).isBefore(cached.timestamp)) {
//            return new PriceResponse(symbol, cached.price, cached.currency);
//        }
//
//        String url = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=" + symbol;
//
//        try {
//            String response = restClient.get()
//                    .uri(url)
//                    .retrieve()
//                    .body(String.class);
//
//            JsonNode root = objectMapper.readTree(response);
//            JsonNode quote = root.path("quoteResponse")
//                    .path("result")
//                    .get(0);
//
//            double price = quote.path("regularMarketPrice").asDouble();
//            String currency = quote.path("currency").asText();
//
//            // 2️⃣ Store in cache
//            cache.put(symbol, new CachedPrice(price, currency));
//
//            return new PriceResponse(symbol, price, currency);
//
//        } catch (Exception ex) {
//
//            // 3️⃣ Fallback to cache if available
//            if (cached != null) {
//                return new PriceResponse(symbol, cached.price, cached.currency);
//            }
//
//            return new PriceResponse(symbol, -1, "UNAVAILABLE");
//        }
//    }
//}

package com.thrive.service;

import com.thrive.dto.PriceResponse;
import org.springframework.stereotype.Service;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


import java.io.IOException;
import java.math.BigDecimal;

//@Service
//public class MarketPriceService {
//
//    public PriceResponse getLivePrice(String symbol) {
//
//        try {
//            Stock stock = YahooFinance.get(symbol);
//
//            if (stock == null || stock.getQuote() == null) {
//                return new PriceResponse(symbol, -1, "UNAVAILABLE");
//            }
//
//            BigDecimal price = stock.getQuote().getPrice();
//            String currency = stock.getCurrency();
//
//            if (price == null) {
//                return new PriceResponse(symbol, -1, "UNAVAILABLE");
//            }
//
//            return new PriceResponse(symbol, price.doubleValue(), currency);
//
//        } catch (IOException e) {
//            return new PriceResponse(symbol, -1, "UNAVAILABLE");
//        }
//    }
//}

@Service
public class MarketPriceService {

    private static class CachedPrice {
        double price;
        String currency;
        long timestamp;
    }

    private final Map<String, CachedPrice> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 60_000; // 1 minute

    public PriceResponse getLivePrice(String symbol) {
        symbol = symbol.toUpperCase();

        // 1️⃣ Serve from cache if fresh
        CachedPrice cached = cache.get(symbol);
        if (cached != null && (System.currentTimeMillis() - cached.timestamp) < CACHE_TTL_MS) {
            return new PriceResponse(symbol, cached.price, cached.currency);
        }

        // 2️⃣ Fetch from Yahoo
        try {
            Stock stock = YahooFinance.get(symbol);

            if (stock == null || stock.getQuote() == null) {
                throw new RuntimeException("Stock not found");
            }

            BigDecimal price = stock.getQuote().getPrice();
            if (price == null) {
                price = stock.getQuote().getPreviousClose();
            }

            if (price == null) {
                throw new RuntimeException("Price unavailable");
            }

            String currency = stock.getCurrency() != null ? stock.getCurrency() : "USD";

            // 3️⃣ Save to cache
            CachedPrice cp = new CachedPrice();
            cp.price = price.doubleValue();
            cp.currency = currency;
            cp.timestamp = System.currentTimeMillis();
            cache.put(symbol, cp);

            return new PriceResponse(symbol, cp.price, cp.currency);

        } catch (Exception e) {
            // 4️⃣ Fallback to stale cache if Yahoo blocks us
            if (cached != null) {
                return new PriceResponse(symbol, cached.price, cached.currency);
            }

            throw new RuntimeException("Price service temporarily unavailable", e);
        }
    }
}


