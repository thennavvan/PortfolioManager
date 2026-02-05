from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
from datetime import datetime
import requests
import os
from openai import OpenAI

app = Flask(__name__)
CORS(app)

# Configure OpenAI API
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


@app.route("/insights", methods=["POST"])
def get_portfolio_insights():
    """Generate AI insights for portfolio using OpenAI"""
    if not OPENAI_API_KEY:
        return jsonify({
            "error": "OpenAI API key not configured. Set OPENAI_API_KEY environment variable."
        }), 400
    
    try:
        data = request.json
        summary = data.get('summary', {})
        holdings = data.get('holdings', [])
        allocation = data.get('allocation', {})
        
        # Build portfolio context for AI
        portfolio_context = f"""
Portfolio Summary:
- Total Portfolio Value: ${summary.get('totalPortfolioValue', 0):,.2f}
- Total Invested: ${summary.get('totalInvestedValue', 0):,.2f}
- Total Gain/Loss: ${summary.get('totalGainLoss', 0):,.2f} ({summary.get('totalGainLossPercentage', 0):.2f}%)
- Number of Holdings: {summary.get('numberOfHoldings', 0)}

Holdings:
"""
        for holding in holdings[:20]:  # Limit to 20 holdings
            portfolio_context += f"- {holding.get('symbol', 'N/A')}: {holding.get('quantity', 0)} shares @ ${holding.get('currentPrice', 0):.2f}, P/L: {holding.get('gainLossPercentage', 0):.2f}%\n"
        
        portfolio_context += "\nAllocation by Asset Type:\n"
        allocations = allocation.get('allocations', [])
        for alloc in allocations:
            portfolio_context += f"- {alloc.get('type', 'N/A')}: {alloc.get('percentage', 0):.1f}% (${alloc.get('value', 0):,.2f})\n"
        
        prompt = f"""You are a professional financial advisor AI. Analyze the following investment portfolio and provide actionable insights.

{portfolio_context}

Please provide a comprehensive analysis with the following sections. Format your response as JSON with a "sections" array, where each section has:
- "icon": an emoji representing the section
- "title": section title
- "type": one of "info", "success", "warning", or "danger" based on sentiment
- "content": the analysis text (use markdown formatting like **bold** for emphasis and - for bullet points)

Include these sections:
1. Portfolio Health Score (overall assessment)
2. Diversification Analysis (how well diversified, concentration risks)
3. Risk Assessment (volatility, sector exposure)
4. Top Performers & Underperformers
5. Recommendations (specific actionable suggestions)

Be specific, reference actual holdings, and provide practical advice. Keep each section concise but informative."""

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional financial advisor. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        response_text = response.choices[0].message.content
        
        # Clean up response if it has markdown code blocks
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        
        try:
            import json
            insights = json.loads(response_text)
            return jsonify(insights), 200
        except:
            # Return as plain text if JSON parsing fails
            return jsonify({
                "sections": [{
                    "icon": "📊",
                    "title": "Portfolio Analysis",
                    "type": "info",
                    "content": response.choices[0].message.content
                }]
            }), 200
            
    except Exception as e:
        print(f"Error generating insights: {str(e)}")
        return jsonify({
            "error": f"Failed to generate insights: {str(e)}"
        }), 500


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