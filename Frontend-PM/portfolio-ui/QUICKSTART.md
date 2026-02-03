# Frontend Setup & Run Guide

## Prerequisites

Ensure the following are installed:
- **Node.js** (v16+) with npm
- **Backend Service** running on `http://localhost:8080`
- **Python yfinance service** running (for live prices)

## Quick Start

### 1. Install Dependencies

```bash
cd Frontend-PM/portfolio-ui
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 3. Access the Application

Visit: **http://localhost:5173**

You should see:
- Navigation bar with 4 pages
- Dashboard page with portfolio metrics and allocation chart
- Portfolio summary cards showing real-time data

## Pages Overview

1. **Dashboard** (Home page)
   - Portfolio value summary
   - Total profit/loss
   - Allocation pie chart

2. **Holdings**
   - Table of all assets
   - Current prices and profit/loss
   - Color-coded returns

3. **Assets Management**
   - Add new assets
   - View all assets
   - Delete assets

4. **Live Price**
   - Search for stock symbols
   - View current prices
   - Real-time data from Yahoo Finance

## Common Commands

### Development
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run lint     # Run ESLint
```

### Production
```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

## Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**: Make sure the Java backend is running on `http://localhost:8080`

```bash
# In the PortfolioManager directory
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

### Issue: Empty data on Dashboard
**Solution**: Add some assets first using the "Assets Management" page

### Issue: Live Price shows error
**Solution**: Ensure the Python yfinance service is running

## API Endpoints Used

The frontend calls these backend endpoints:

**Assets**
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Add new asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/assets/price/{symbol}` - Get live price

**Portfolio**
- `GET /api/portfolio/summary` - Portfolio summary
- `GET /api/portfolio/holdings` - All holdings
- `GET /api/portfolio/allocation` - Asset allocation

## Expected Data Format

### Portfolio Summary Response
```json
{
  "totalPortfolioValue": 15250.50,
  "totalInvestedValue": 14000.00,
  "totalProfitLoss": 1250.50,
  "totalProfitLossPercent": 8.93
}
```

### Holdings Response
```json
[
  {
    "symbol": "AAPL",
    "assetType": "STOCK",
    "quantity": 10,
    "buyPrice": 150.00,
    "currentPrice": 155.00,
    "marketValue": 1550.00,
    "profitLoss": 50.00,
    "profitLossPercent": 3.33
  }
]
```

### Allocation Response
```json
[
  {
    "symbol": "AAPL",
    "marketValue": 1550.00,
    "marketValuePercent": 25.5
  }
]
```

### Live Price Response
```json
{
  "symbol": "AAPL",
  "currentPrice": 155.00,
  "currency": "USD",
  "timestamp": "2026-02-04T10:30:00Z"
}
```

## Adding a New Asset

1. Navigate to "Assets Management" page
2. Fill in the form:
   - **Symbol**: e.g., AAPL, GOOGL
   - **Asset Type**: Stock, ETF, Crypto, or Mutual Fund
   - **Quantity**: Number of shares
   - **Buy Price**: Price per share at purchase
3. Click "Add Asset"
4. Wait for success message
5. Asset appears in portfolio immediately

## Viewing Live Prices

1. Navigate to "Live Price" page
2. Enter a stock symbol (e.g., AAPL, MSFT, GOOGL)
3. Click "Search"
4. Current price displays from Yahoo Finance

## Project Folder Structure

```
Frontend-PM/
└── portfolio-ui/
    ├── src/
    │   ├── pages/              # Page components
    │   ├── components/         # Reusable components
    │   ├── services/           # API service layer
    │   ├── styles/             # CSS files
    │   ├── App.jsx             # Main app with routing
    │   ├── main.jsx            # React entry point
    │   └── index.css           # Global styles
    ├── package.json            # Dependencies
    ├── vite.config.js          # Vite config
    └── index.html              # HTML entry point
```

## Next Steps

1. Add some assets using the Assets Management page
2. Check the Dashboard to see your portfolio value
3. View detailed holdings in the Holdings page
4. Try searching for live prices in Live Price Viewer

## Need Help?

Check the full documentation in `FRONTEND_README.md`
