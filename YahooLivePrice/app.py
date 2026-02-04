from flask import Flask, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route("/price/<symbol>", methods=["GET"])
def get_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        # Fetch latest data
        data = ticker.history(period="1d")

        if data.empty:
            return jsonify({
                "error": "Symbol not found",
                "symbol": symbol.upper()
            }), 404

        # Get the latest close price
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


@app.route("/price-history/<symbol>", methods=["GET"])
def get_price_history(symbol):
    try:
        ticker = yf.Ticker(symbol)
        # Fetch last 30 days of data
        data = ticker.history(period="1mo")

        if data.empty:
            return jsonify({
                "error": "Symbol not found",
                "symbol": symbol.upper()
            }), 404

        # Format data for frontend
        history = []
        for date, row in data.iterrows():
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            })

        return jsonify({
            "symbol": symbol.upper(),
            "history": history,
            "currency": "USD",
            "period": "30 days",
            "timestamp": datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        print(f"Error fetching price history for {symbol}: {str(e)}")
        return jsonify({
            "error": "Price history service unavailable",
            "details": str(e),
            "symbol": symbol.upper()
        }), 503


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    print("Starting Yahoo Finance price service on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=False)
