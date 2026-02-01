from flask import Flask, jsonify
import yfinance as yf
from datetime import datetime

app = Flask(__name__)

@app.route("/price/<symbol>", methods=["GET"])
def get_price(symbol):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")

        if data.empty:
            return jsonify({
                "error": "Symbol not found"
            }), 404

        price = round(float(data["Close"].iloc[-1]), 2)

        return jsonify({
            "symbol": symbol.upper(),
            "price": price,
            "currency": "USD",
            "timestamp": datetime.utcnow().isoformat()
        })

    except Exception as e:
        return jsonify({
            "error": "Price service unavailable",
            "details": str(e)
        }), 503


if __name__ == "__main__":
    print("Starting Yahoo Finance price service on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=True)
