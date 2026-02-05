from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
from datetime import datetime
import requests
import numpy as np

app = Flask(__name__)
CORS(app)


@app.route("/risk-analysis", methods=["POST"])
def analyze_portfolio_risk():
    """Calculate portfolio risk score based on diversification, volatility, and concentration"""
    try:
        data = request.json
        holdings = data.get('holdings', [])
        
        if not holdings:
            return jsonify({
                "overallScore": 0,
                "riskLevel": "Unknown",
                "factors": [],
                "message": "No holdings to analyze"
            }), 200
        
        # Calculate risk factors
        factors = []
        total_value = sum(h.get('currentValue', 0) for h in holdings)
        
        # 1. Diversification Score (number of holdings)
        num_holdings = len(holdings)
        if num_holdings >= 15:
            diversification_score = 100
            diversification_status = "Excellent"
        elif num_holdings >= 10:
            diversification_score = 80
            diversification_status = "Good"
        elif num_holdings >= 5:
            diversification_score = 60
            diversification_status = "Moderate"
        elif num_holdings >= 3:
            diversification_score = 40
            diversification_status = "Low"
        else:
            diversification_score = 20
            diversification_status = "Poor"
        
        factors.append({
            "name": "Diversification",
            "score": diversification_score,
            "status": diversification_status,
            "description": f"{num_holdings} holdings in portfolio",
            "icon": "📊"
        })
        
        # 2. Concentration Risk (Herfindahl-Hirschman Index)
        if total_value > 0:
            weights = [(h.get('currentValue', 0) / total_value) * 100 for h in holdings]
            hhi = sum(w ** 2 for w in weights)
            max_weight = max(weights) if weights else 0
            
            # HHI: 10000 = single stock, ~0 = perfectly diversified
            # Convert to 0-100 score (higher is better/less concentrated)
            concentration_score = max(0, min(100, 100 - (hhi / 100)))
            
            if max_weight > 50:
                concentration_status = "High Risk"
                concentration_score = min(concentration_score, 30)
            elif max_weight > 30:
                concentration_status = "Elevated"
                concentration_score = min(concentration_score, 50)
            elif max_weight > 20:
                concentration_status = "Moderate"
            else:
                concentration_status = "Well Balanced"
            
            top_holding = max(holdings, key=lambda h: h.get('currentValue', 0))
            factors.append({
                "name": "Concentration",
                "score": round(concentration_score),
                "status": concentration_status,
                "description": f"Largest position: {top_holding.get('symbol', 'N/A')} ({max_weight:.1f}%)",
                "icon": "⚖️"
            })
        
        # 3. Volatility Score (fetch historical volatility for each holding)
        volatility_scores = []
        for holding in holdings[:10]:  # Limit to first 10 for performance
            symbol = holding.get('symbol', '')
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="3mo")
                if not hist.empty and len(hist) > 5:
                    returns = hist['Close'].pct_change().dropna()
                    volatility = returns.std() * np.sqrt(252) * 100  # Annualized volatility %
                    weight = holding.get('currentValue', 0) / total_value if total_value > 0 else 0
                    volatility_scores.append({
                        'symbol': symbol,
                        'volatility': volatility,
                        'weight': weight
                    })
            except:
                pass
        
        if volatility_scores:
            # Portfolio weighted volatility
            weighted_vol = sum(v['volatility'] * v['weight'] for v in volatility_scores)
            
            # Convert volatility to score (lower volatility = higher score)
            if weighted_vol < 15:
                volatility_score = 90
                volatility_status = "Low"
            elif weighted_vol < 25:
                volatility_score = 70
                volatility_status = "Moderate"
            elif weighted_vol < 40:
                volatility_score = 50
                volatility_status = "Elevated"
            elif weighted_vol < 60:
                volatility_score = 30
                volatility_status = "High"
            else:
                volatility_score = 15
                volatility_status = "Very High"
            
            factors.append({
                "name": "Volatility",
                "score": round(volatility_score),
                "status": volatility_status,
                "description": f"Annualized volatility: {weighted_vol:.1f}%",
                "icon": "📈"
            })
        
        # 4. Asset Type Diversity
        asset_types = set(h.get('assetType', 'UNKNOWN') for h in holdings)
        num_asset_types = len(asset_types)
        
        if num_asset_types >= 4:
            asset_type_score = 100
            asset_type_status = "Excellent"
        elif num_asset_types >= 3:
            asset_type_score = 75
            asset_type_status = "Good"
        elif num_asset_types >= 2:
            asset_type_score = 50
            asset_type_status = "Limited"
        else:
            asset_type_score = 25
            asset_type_status = "Single Type"
        
        factors.append({
            "name": "Asset Types",
            "score": asset_type_score,
            "status": asset_type_status,
            "description": f"{num_asset_types} asset type(s): {', '.join(asset_types)}",
            "icon": "🏦"
        })
        
        # Calculate overall score (weighted average)
        if factors:
            weights = [0.25, 0.30, 0.25, 0.20]  # Diversification, Concentration, Volatility, Asset Types
            scores = [f['score'] for f in factors]
            # Pad with 50 if we don't have all factors
            while len(scores) < 4:
                scores.append(50)
            overall_score = sum(s * w for s, w in zip(scores, weights))
        else:
            overall_score = 50
        
        # Determine risk level
        if overall_score >= 80:
            risk_level = "Low Risk"
            risk_color = "#10B981"  # Green
        elif overall_score >= 60:
            risk_level = "Moderate Risk"
            risk_color = "#3B82F6"  # Blue
        elif overall_score >= 40:
            risk_level = "Elevated Risk"
            risk_color = "#F59E0B"  # Orange
        else:
            risk_level = "High Risk"
            risk_color = "#EF4444"  # Red
        
        return jsonify({
            "overallScore": round(overall_score),
            "riskLevel": risk_level,
            "riskColor": risk_color,
            "factors": factors,
            "holdingsAnalyzed": len(holdings)
        }), 200
        
    except Exception as e:
        print(f"Error analyzing risk: {str(e)}")
        return jsonify({
            "error": f"Failed to analyze risk: {str(e)}"
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


@app.route("/asset-info/<symbol>", methods=["GET"])
def get_asset_info(symbol):
    """Get asset information including type, name, and current price"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        data = ticker.history(period="1d")
        
        if data.empty and not info:
            return jsonify({
                "error": "Symbol not found",
                "symbol": symbol.upper()
            }), 404
        
        # Get quote type and map to our asset types
        quote_type = info.get('quoteType', 'EQUITY')
        
        # Map Yahoo Finance types to our app's types
        type_mapping = {
            'EQUITY': 'STOCK',
            'ETF': 'ETF',
            'MUTUALFUND': 'MUTUAL_FUND',
            'CRYPTOCURRENCY': 'CRYPTO',
            'CURRENCY': 'CRYPTO',  # Crypto pairs like BTC-USD
            'INDEX': 'ETF',
            'FUTURE': 'STOCK',
        }
        
        # Check if it's a crypto symbol (ends with -USD, -EUR, etc.)
        if '-' in symbol.upper() and any(symbol.upper().endswith(curr) for curr in ['-USD', '-EUR', '-GBP', '-JPY', '-USDT']):
            asset_type = 'CRYPTO'
        else:
            asset_type = type_mapping.get(quote_type, 'STOCK')
        
        # Get price
        price = None
        if not data.empty:
            price = round(float(data["Close"].iloc[-1]), 2)
        
        # Get name
        name = info.get('shortName') or info.get('longName') or symbol.upper()
        
        return jsonify({
            "symbol": symbol.upper(),
            "name": name,
            "assetType": asset_type,
            "quoteType": quote_type,
            "price": price,
            "currency": info.get('currency', 'USD'),
            "exchange": info.get('exchange', ''),
            "sector": info.get('sector', ''),
            "industry": info.get('industry', '')
        }), 200
        
    except Exception as e:
        print(f"Error fetching asset info for {symbol}: {str(e)}")
        return jsonify({
            "error": "Asset info unavailable",
            "details": str(e),
            "symbol": symbol.upper()
        }), 503


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/similar-stocks/<symbol>", methods=["GET"])
def get_similar_stocks(symbol):
    """Get similar stocks based on sector and industry"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        sector = info.get('sector', '')
        industry = info.get('industry', '')
        quote_type = info.get('quoteType', '')
        
        # For crypto, suggest other major cryptos
        if quote_type == 'CRYPTOCURRENCY' or '-USD' in symbol.upper():
            crypto_suggestions = [
                {'symbol': 'BTC-USD', 'name': 'Bitcoin USD', 'reason': 'Major Cryptocurrency'},
                {'symbol': 'ETH-USD', 'name': 'Ethereum USD', 'reason': 'Major Cryptocurrency'},
                {'symbol': 'SOL-USD', 'name': 'Solana USD', 'reason': 'Major Cryptocurrency'},
                {'symbol': 'XRP-USD', 'name': 'XRP USD', 'reason': 'Major Cryptocurrency'},
                {'symbol': 'ADA-USD', 'name': 'Cardano USD', 'reason': 'Major Cryptocurrency'},
                {'symbol': 'DOGE-USD', 'name': 'Dogecoin USD', 'reason': 'Major Cryptocurrency'},
            ]
            # Filter out the current symbol
            similar = [c for c in crypto_suggestions if c['symbol'] != symbol.upper()][:5]
            return jsonify({
                "symbol": symbol.upper(),
                "sector": "Cryptocurrency",
                "industry": "Digital Assets",
                "similar": similar
            }), 200
        
        # For ETFs, suggest similar ETFs
        if quote_type == 'ETF':
            etf_suggestions = [
                {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF', 'reason': 'S&P 500 Index'},
                {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust', 'reason': 'Nasdaq 100 Index'},
                {'symbol': 'VTI', 'name': 'Vanguard Total Stock Market', 'reason': 'Total Market'},
                {'symbol': 'IWM', 'name': 'iShares Russell 2000', 'reason': 'Small Cap'},
                {'symbol': 'DIA', 'name': 'SPDR Dow Jones', 'reason': 'Dow Jones Index'},
                {'symbol': 'VOO', 'name': 'Vanguard S&P 500', 'reason': 'S&P 500 Index'},
            ]
            similar = [e for e in etf_suggestions if e['symbol'] != symbol.upper()][:5]
            return jsonify({
                "symbol": symbol.upper(),
                "sector": "ETF",
                "industry": info.get('category', 'Exchange Traded Fund'),
                "similar": similar
            }), 200
        
        if not sector:
            return jsonify({
                "symbol": symbol.upper(),
                "sector": None,
                "industry": None,
                "similar": [],
                "message": "No sector information available"
            }), 200
        
        # Sector-based stock suggestions (major companies by sector)
        sector_stocks = {
            'Technology': [
                {'symbol': 'AAPL', 'name': 'Apple Inc.', 'industry': 'Consumer Electronics'},
                {'symbol': 'MSFT', 'name': 'Microsoft Corp.', 'industry': 'Software'},
                {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'industry': 'Internet Services'},
                {'symbol': 'NVDA', 'name': 'NVIDIA Corp.', 'industry': 'Semiconductors'},
                {'symbol': 'META', 'name': 'Meta Platforms', 'industry': 'Social Media'},
                {'symbol': 'AVGO', 'name': 'Broadcom Inc.', 'industry': 'Semiconductors'},
                {'symbol': 'CRM', 'name': 'Salesforce Inc.', 'industry': 'Software'},
                {'symbol': 'AMD', 'name': 'AMD Inc.', 'industry': 'Semiconductors'},
            ],
            'Financial Services': [
                {'symbol': 'JPM', 'name': 'JPMorgan Chase', 'industry': 'Banks'},
                {'symbol': 'BAC', 'name': 'Bank of America', 'industry': 'Banks'},
                {'symbol': 'WFC', 'name': 'Wells Fargo', 'industry': 'Banks'},
                {'symbol': 'GS', 'name': 'Goldman Sachs', 'industry': 'Investment Banking'},
                {'symbol': 'MS', 'name': 'Morgan Stanley', 'industry': 'Investment Banking'},
                {'symbol': 'V', 'name': 'Visa Inc.', 'industry': 'Payments'},
                {'symbol': 'MA', 'name': 'Mastercard', 'industry': 'Payments'},
            ],
            'Healthcare': [
                {'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'industry': 'Pharmaceuticals'},
                {'symbol': 'UNH', 'name': 'UnitedHealth Group', 'industry': 'Health Insurance'},
                {'symbol': 'PFE', 'name': 'Pfizer Inc.', 'industry': 'Pharmaceuticals'},
                {'symbol': 'ABBV', 'name': 'AbbVie Inc.', 'industry': 'Pharmaceuticals'},
                {'symbol': 'MRK', 'name': 'Merck & Co.', 'industry': 'Pharmaceuticals'},
                {'symbol': 'LLY', 'name': 'Eli Lilly', 'industry': 'Pharmaceuticals'},
            ],
            'Consumer Cyclical': [
                {'symbol': 'AMZN', 'name': 'Amazon.com', 'industry': 'E-Commerce'},
                {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'industry': 'Auto Manufacturers'},
                {'symbol': 'HD', 'name': 'Home Depot', 'industry': 'Home Improvement'},
                {'symbol': 'NKE', 'name': 'Nike Inc.', 'industry': 'Apparel'},
                {'symbol': 'MCD', 'name': "McDonald's", 'industry': 'Restaurants'},
                {'symbol': 'SBUX', 'name': 'Starbucks', 'industry': 'Restaurants'},
            ],
            'Communication Services': [
                {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'industry': 'Internet Services'},
                {'symbol': 'META', 'name': 'Meta Platforms', 'industry': 'Social Media'},
                {'symbol': 'NFLX', 'name': 'Netflix Inc.', 'industry': 'Streaming'},
                {'symbol': 'DIS', 'name': 'Walt Disney', 'industry': 'Entertainment'},
                {'symbol': 'T', 'name': 'AT&T Inc.', 'industry': 'Telecom'},
                {'symbol': 'VZ', 'name': 'Verizon', 'industry': 'Telecom'},
            ],
            'Consumer Defensive': [
                {'symbol': 'PG', 'name': 'Procter & Gamble', 'industry': 'Consumer Products'},
                {'symbol': 'KO', 'name': 'Coca-Cola', 'industry': 'Beverages'},
                {'symbol': 'PEP', 'name': 'PepsiCo', 'industry': 'Beverages'},
                {'symbol': 'WMT', 'name': 'Walmart', 'industry': 'Retail'},
                {'symbol': 'COST', 'name': 'Costco', 'industry': 'Retail'},
            ],
            'Energy': [
                {'symbol': 'XOM', 'name': 'Exxon Mobil', 'industry': 'Oil & Gas'},
                {'symbol': 'CVX', 'name': 'Chevron', 'industry': 'Oil & Gas'},
                {'symbol': 'COP', 'name': 'ConocoPhillips', 'industry': 'Oil & Gas'},
                {'symbol': 'SLB', 'name': 'Schlumberger', 'industry': 'Oil Services'},
                {'symbol': 'EOG', 'name': 'EOG Resources', 'industry': 'Oil & Gas'},
            ],
            'Industrials': [
                {'symbol': 'CAT', 'name': 'Caterpillar', 'industry': 'Machinery'},
                {'symbol': 'BA', 'name': 'Boeing', 'industry': 'Aerospace'},
                {'symbol': 'UPS', 'name': 'United Parcel Service', 'industry': 'Logistics'},
                {'symbol': 'HON', 'name': 'Honeywell', 'industry': 'Conglomerate'},
                {'symbol': 'GE', 'name': 'General Electric', 'industry': 'Conglomerate'},
                {'symbol': 'RTX', 'name': 'RTX Corp', 'industry': 'Aerospace & Defense'},
            ],
            'Real Estate': [
                {'symbol': 'AMT', 'name': 'American Tower', 'industry': 'REIT'},
                {'symbol': 'PLD', 'name': 'Prologis', 'industry': 'Industrial REIT'},
                {'symbol': 'CCI', 'name': 'Crown Castle', 'industry': 'REIT'},
                {'symbol': 'EQIX', 'name': 'Equinix', 'industry': 'Data Center REIT'},
                {'symbol': 'SPG', 'name': 'Simon Property', 'industry': 'Retail REIT'},
            ],
            'Utilities': [
                {'symbol': 'NEE', 'name': 'NextEra Energy', 'industry': 'Utilities'},
                {'symbol': 'DUK', 'name': 'Duke Energy', 'industry': 'Utilities'},
                {'symbol': 'SO', 'name': 'Southern Company', 'industry': 'Utilities'},
                {'symbol': 'D', 'name': 'Dominion Energy', 'industry': 'Utilities'},
                {'symbol': 'AEP', 'name': 'American Electric Power', 'industry': 'Utilities'},
            ],
            'Basic Materials': [
                {'symbol': 'LIN', 'name': 'Linde plc', 'industry': 'Chemicals'},
                {'symbol': 'APD', 'name': 'Air Products', 'industry': 'Chemicals'},
                {'symbol': 'SHW', 'name': 'Sherwin-Williams', 'industry': 'Chemicals'},
                {'symbol': 'FCX', 'name': 'Freeport-McMoRan', 'industry': 'Mining'},
                {'symbol': 'NEM', 'name': 'Newmont Corp', 'industry': 'Gold Mining'},
            ],
        }
        
        # Get stocks from the same sector
        sector_list = sector_stocks.get(sector, [])
        
        # Filter out the current symbol and prioritize same industry
        similar = []
        same_industry = []
        other_sector = []
        
        for stock in sector_list:
            if stock['symbol'] == symbol.upper():
                continue
            if stock.get('industry', '').lower() == industry.lower():
                same_industry.append({**stock, 'reason': f'Same Industry: {industry}'})
            else:
                other_sector.append({**stock, 'reason': f'Same Sector: {sector}'})
        
        # Combine: same industry first, then other sector stocks
        similar = same_industry[:3] + other_sector[:5 - len(same_industry[:3])]
        
        return jsonify({
            "symbol": symbol.upper(),
            "name": info.get('shortName', symbol.upper()),
            "sector": sector,
            "industry": industry,
            "similar": similar[:5]
        }), 200
        
    except Exception as e:
        print(f"Error fetching similar stocks for {symbol}: {str(e)}")
        return jsonify({
            "error": "Similar stocks unavailable",
            "details": str(e),
            "symbol": symbol.upper()
        }), 503


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


@app.route("/simulate-portfolio", methods=["POST"])
def simulate_portfolio():
    """Simulate portfolio changes and return impact analysis"""
    try:
        data = request.json
        current_holdings = data.get('currentHoldings', [])
        simulated_changes = data.get('simulatedChanges', [])
        
        if not current_holdings and not simulated_changes:
            return jsonify({"error": "No data to simulate"}), 400
        
        # Build current portfolio state
        portfolio = {}
        for h in current_holdings:
            symbol = h.get('symbol', '').upper()
            if symbol:
                portfolio[symbol] = {
                    'symbol': symbol,
                    'name': h.get('name', symbol),
                    'quantity': h.get('quantity', 0),
                    'buyPrice': h.get('buyPrice', 0),
                    'currentPrice': h.get('currentPrice', 0),
                    'currentValue': h.get('currentValue', 0),
                    'assetType': h.get('assetType', 'STOCK')
                }
        
        # Calculate current metrics
        current_total_value = sum(p['currentValue'] for p in portfolio.values())
        current_holdings_count = len(portfolio)
        current_asset_types = set(p['assetType'] for p in portfolio.values())
        
        # Calculate current concentration (top holding %)
        current_top_holding_pct = 0
        if current_total_value > 0:
            max_value = max((p['currentValue'] for p in portfolio.values()), default=0)
            current_top_holding_pct = (max_value / current_total_value) * 100
        
        # Apply simulated changes to create new portfolio
        simulated_portfolio = {k: v.copy() for k, v in portfolio.items()}
        
        for change in simulated_changes:
            symbol = change.get('symbol', '').upper()
            action = change.get('action', 'BUY')
            quantity = change.get('quantity', 0)
            price = change.get('price', 0)
            
            if not symbol or quantity <= 0:
                continue
            
            if action == 'BUY':
                if symbol in simulated_portfolio:
                    # Add to existing
                    existing = simulated_portfolio[symbol]
                    old_qty = existing['quantity']
                    old_price = existing['buyPrice']
                    new_qty = old_qty + quantity
                    # Weighted average price
                    weighted_price = ((old_qty * old_price) + (quantity * price)) / new_qty if new_qty > 0 else price
                    existing['quantity'] = new_qty
                    existing['buyPrice'] = weighted_price
                    existing['currentPrice'] = price
                    existing['currentValue'] = new_qty * price
                else:
                    # New asset
                    simulated_portfolio[symbol] = {
                        'symbol': symbol,
                        'name': change.get('name', symbol),
                        'quantity': quantity,
                        'buyPrice': price,
                        'currentPrice': price,
                        'currentValue': quantity * price,
                        'assetType': change.get('assetType', 'STOCK')
                    }
            elif action == 'SELL':
                if symbol in simulated_portfolio:
                    existing = simulated_portfolio[symbol]
                    new_qty = existing['quantity'] - quantity
                    if new_qty <= 0:
                        del simulated_portfolio[symbol]
                    else:
                        existing['quantity'] = new_qty
                        existing['currentValue'] = new_qty * existing['currentPrice']
        
        # Calculate simulated metrics
        sim_total_value = sum(p['currentValue'] for p in simulated_portfolio.values())
        sim_holdings_count = len(simulated_portfolio)
        sim_asset_types = set(p['assetType'] for p in simulated_portfolio.values())
        
        # Calculate simulated concentration
        sim_top_holding_pct = 0
        sim_top_holding = None
        if sim_total_value > 0:
            for p in simulated_portfolio.values():
                pct = (p['currentValue'] / sim_total_value) * 100
                if pct > sim_top_holding_pct:
                    sim_top_holding_pct = pct
                    sim_top_holding = p['symbol']
        
        # Calculate risk scores (simplified version)
        def calculate_risk_score(holdings_count, top_pct, asset_type_count):
            # Lower is better for concentration
            concentration_risk = min(top_pct, 50)  # Cap at 50
            # More holdings = lower risk
            diversification_bonus = min(holdings_count * 3, 30)
            # More asset types = lower risk
            type_bonus = min(asset_type_count * 5, 20)
            
            # Base risk starts at 50
            risk = 50 + concentration_risk - diversification_bonus - type_bonus
            return max(0, min(100, risk))
        
        current_risk = calculate_risk_score(current_holdings_count, current_top_holding_pct, len(current_asset_types))
        sim_risk = calculate_risk_score(sim_holdings_count, sim_top_holding_pct, len(sim_asset_types))
        
        def get_risk_level(score):
            if score <= 30:
                return "Low"
            elif score <= 50:
                return "Medium"
            elif score <= 70:
                return "High"
            else:
                return "Very High"
        
        # Calculate allocation by asset type
        def calc_allocation(holdings):
            allocation = {}
            total = sum(p['currentValue'] for p in holdings.values())
            if total == 0:
                return allocation
            for p in holdings.values():
                asset_type = p['assetType']
                if asset_type not in allocation:
                    allocation[asset_type] = 0
                allocation[asset_type] += (p['currentValue'] / total) * 100
            return allocation
        
        current_allocation = calc_allocation(portfolio)
        sim_allocation = calc_allocation(simulated_portfolio)
        
        # Build insights
        insights = []
        value_change = sim_total_value - current_total_value
        risk_change = sim_risk - current_risk
        
        if value_change > 0:
            insights.append(f"Portfolio value increases by ${value_change:,.2f}")
        elif value_change < 0:
            insights.append(f"Portfolio value decreases by ${abs(value_change):,.2f}")
        
        if risk_change > 5:
            insights.append(f"Risk increases by {risk_change:.0f} points - consider diversifying")
        elif risk_change < -5:
            insights.append(f"Risk decreases by {abs(risk_change):.0f} points - better diversification")
        
        if sim_holdings_count > current_holdings_count:
            insights.append(f"Adding {sim_holdings_count - current_holdings_count} new holding(s)")
        elif sim_holdings_count < current_holdings_count:
            insights.append(f"Removing {current_holdings_count - sim_holdings_count} holding(s)")
        
        if sim_top_holding_pct > 30:
            insights.append(f"Warning: {sim_top_holding} would be {sim_top_holding_pct:.1f}% of portfolio")
        
        return jsonify({
            "current": {
                "totalValue": current_total_value,
                "holdingsCount": current_holdings_count,
                "assetTypes": len(current_asset_types),
                "topHoldingPercent": round(current_top_holding_pct, 1),
                "riskScore": round(current_risk),
                "riskLevel": get_risk_level(current_risk),
                "allocation": current_allocation
            },
            "simulated": {
                "totalValue": sim_total_value,
                "holdingsCount": sim_holdings_count,
                "assetTypes": len(sim_asset_types),
                "topHoldingPercent": round(sim_top_holding_pct, 1),
                "riskScore": round(sim_risk),
                "riskLevel": get_risk_level(sim_risk),
                "allocation": sim_allocation,
                "holdings": list(simulated_portfolio.values())
            },
            "changes": {
                "valueChange": round(value_change, 2),
                "riskChange": round(risk_change),
                "holdingsChange": sim_holdings_count - current_holdings_count
            },
            "insights": insights
        })
        
    except Exception as e:
        print(f"Error simulating portfolio: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Starting Yahoo Finance price service on port 8000")
    app.run(host="0.0.0.0", port=8000, debug=False)
