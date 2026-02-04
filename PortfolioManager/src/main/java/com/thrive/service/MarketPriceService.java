package com.thrive.service;

import com.thrive.dto.PriceResponse;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class MarketPriceService {
    private static final Logger log = LoggerFactory.getLogger(MarketPriceService.class);
    private final Map<String, PriceResponse> cache = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public PriceResponse getLivePrice(String symbol) {
        if (cache.containsKey(symbol)) {
            return cache.get(symbol);
        }
        try {
            // Random delay 200-800ms to avoid rate limiting
            Thread.sleep(200 + random.nextInt(600));
            Stock stock = YahooFinance.get(symbol);
            if (stock == null || stock.getQuote() == null) {
                log.warn("No quote available for symbol: {}", symbol);
                PriceResponse fallback = new PriceResponse(symbol, 0.0, "USD");
                cache.put(symbol, fallback);
                return fallback;
            }

            BigDecimal price = stock.getQuote().getPrice();
            if (price == null) {
                price = stock.getQuote().getPreviousClose();
            }
            if (price == null) {
                log.warn("No price available for symbol: {}", symbol);
                PriceResponse fallback = new PriceResponse(symbol, 0.0, "USD");
                cache.put(symbol, fallback);
                return fallback;
            }

            String currency = stock.getCurrency();
            PriceResponse response = new PriceResponse(symbol, price.doubleValue(), currency);
            cache.put(symbol, response);
            return response;
        } catch (IOException e) {
            log.warn("Price service temporarily unavailable for symbol: {}", symbol, e);
            PriceResponse fallback = new PriceResponse(symbol, 0.0, "USD");
            cache.put(symbol, fallback);
            return fallback;
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
            return cache.getOrDefault(symbol, new PriceResponse(symbol, 0.0, "USD"));
        }
    }

    public Map<String, PriceResponse> getLivePrices(String[] symbols) {
        Map<String, PriceResponse> result = new HashMap<>();
        try {
            // Random delay 300-1000ms to avoid rate limiting
            Thread.sleep(300 + random.nextInt(700));
            Map<String, Stock> stocks = YahooFinance.get(symbols);

            for (String symbol : symbols) {
                Stock stock = stocks.get(symbol);
                if (stock == null || stock.getQuote() == null) {
                    log.warn("No quote available for symbol: {}", symbol);
                    PriceResponse fallback = new PriceResponse(symbol, 0.0, "USD");
                    result.put(symbol, fallback);
                    cache.put(symbol, fallback);
                    continue;
                }

                BigDecimal price = stock.getQuote().getPrice();
                if (price == null) {
                    price = stock.getQuote().getPreviousClose();
                }

                if (price != null) {
                    PriceResponse response = new PriceResponse(symbol, price.doubleValue(), stock.getCurrency());
                    result.put(symbol, response);
                    cache.put(symbol, response);
                } else {
                    log.warn("No price available for symbol: {}", symbol);
                    PriceResponse fallback = new PriceResponse(symbol, 0.0, "USD");
                    result.put(symbol, fallback);
                    cache.put(symbol, fallback);
                }
            }
        } catch (IOException e) {
            log.warn("Bulk price service temporarily unavailable", e);
            for (String symbol : symbols) {
                PriceResponse fallback = new PriceResponse(symbol, 0.0, "USD");
                result.put(symbol, fallback);
                cache.put(symbol, fallback);
            }
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
            for (String symbol : symbols) {
                result.put(symbol, cache.getOrDefault(symbol, new PriceResponse(symbol, 0.0, "USD")));
            }
        }
        return result;
    }
}
