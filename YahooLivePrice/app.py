from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
from datetime import datetime
import requests

app = Flask(__name__)
CORS(app)


@app.route("/search", methods=["GET"])
def search_assets():
    """Search for assets by name or symbol"""
    query = request.args.get('q', '').strip()
    
    if not query or len(query) < 1:
        return jsonify({"results": []}), 200
    
    try:
        # Use Yahoo Finance search API
        url = f"https://query2.finance.yahoo.com/v1/finance/search"
        params = {
            'q': query,
            'quotesCount': 10,
            'newsCount': 0,
            'listsCount': 0,
            'enableFuzzyQuery': True,
            'quotesQueryId': 'tss_match_phrase_query'
        }
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        data = response.json()
        
        results = []
        for quote in data.get('quotes', []):
            # Filter to stocks, ETFs, and mutual funds
            quote_type = quote.get('quoteType', '')
            if quote_type in ['EQUITY', 'ETF', 'MUTUALFUND']:
                results.append({
                    'symbol': quote.get('symbol', ''),
                    'name': quote.get('shortname') or quote.get('longname', ''),
                    'type': quote_type,
                    'exchange': quote.get('exchange', '')
                })
        
        return jsonify({"results": results}), 200
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({"results": [], "error": str(e)}), 200


@app.route("/price/<symbol>", methods=["GET"])
def get_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")

        if data.empty:
            return jsonify({
                "error": "Symbol not found",
                "symbol": symbol.upper()
            }), 404

        price = round(float(data["Close"].iloc[-1]), 2)

        return jsonify({
            "symbol": symbol.upper(),
            "price": price,
            "currency": "USD",
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        print(f"Error fetching price for {symbol}: {str(e)}")
        return jsonify({
            "error": "Price service unavailable",
            "details": str(e),
            "symbol": symbol.upper()
        }), 503


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/price-history/<symbol>", methods=["GET"])
def get_price_history(symbol):
    """Get 30 days of price history for a symbol"""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1mo")
        
        if data.empty:
            return jsonify({
                "error": "Symbol not found",
                "symbol": symbol.upper()
            }), 404
        
        history = []
        for index, row in data.iterrows():
            history.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })
        
        return jsonify({
            "symbol": symbol.upper(),
            "history": history
        }), 200
        
    except Exception as e:
        print(f"Error fetching history for {symbol}: {str(e)}")
        return jsonify({
            "error": "Price history unavailable",
            "details": str(e),
            "symbol": symbol.upper()
        }), 503


if __name__ == "__main__":
    print("Starting Yahoo Finance price service on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=False)