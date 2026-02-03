# Portfolio Manager Frontend

A professional React-based frontend for the Portfolio Management application. Displays real-time portfolio data, asset allocation, and live stock prices.

## Features

- **Dashboard**: Real-time portfolio summary with allocation visualization
- **Holdings**: Detailed table of all portfolio holdings with color-coded profit/loss
- **Assets Management**: Add, view, and delete assets from your portfolio
- **Live Price Viewer**: Check live stock prices using Yahoo Finance data
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: All data fetched from backend APIs

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization charts
- **CSS3** - Styling with responsive design

## Project Structure

```
src/
├── pages/
│   ├── Dashboard.jsx          # Portfolio dashboard
│   ├── HoldingsPage.jsx       # Holdings table view
│   ├── AssetsManagement.jsx   # Asset CRUD operations
│   └── LivePriceViewer.jsx    # Live stock price viewer
├── components/
│   ├── SummaryCards.jsx       # Portfolio summary cards
│   ├── HoldingsTable.jsx      # Holdings data table
│   └── AllocationChart.jsx    # Portfolio allocation pie chart
├── services/
│   └── api.js                 # Centralized API service layer
├── styles/
│   ├── Dashboard.css
│   ├── Holdings.css
│   ├── AssetsManagement.css
│   ├── LivePriceViewer.css
│   ├── SummaryCards.css
│   ├── HoldingsTable.css
│   └── AllocationChart.css
├── App.jsx                    # Main app component with routing
├── App.css                    # Global app styles
├── main.jsx                   # React entry point
└── index.css                  # Global styles
```

## Installation

1. Navigate to the frontend directory:
```bash
cd Frontend-PM/portfolio-ui
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will start at `http://localhost:5173`

**Requirements:**
- Backend must be running at `http://localhost:8080`
- Python yfinance service must be running for live prices

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## API Service Layer

All API calls are centralized in `src/services/api.js`:

### Asset Service
- `assetService.getAllAssets()` - GET /api/assets
- `assetService.addAsset(data)` - POST /api/assets
- `assetService.deleteAsset(id)` - DELETE /api/assets/{id}
- `assetService.getAssetSummary()` - GET /api/assets/summary
- `assetService.getLivePrice(symbol)` - GET /api/assets/price/{symbol}

### Portfolio Service
- `portfolioService.getPortfolioSummary()` - GET /api/portfolio/summary
- `portfolioService.getPortfolioHoldings()` - GET /api/portfolio/holdings
- `portfolioService.getPortfolioAllocation()` - GET /api/portfolio/allocation

### Error Handling
- All errors are handled via `handleApiError()` function
- Returns structured error objects with status, message, and data
- Displays user-friendly error messages

## Pages Overview

### Dashboard Page
Displays real-time portfolio metrics:
- **Total Portfolio Value**: Current market value of all holdings
- **Total Invested Value**: Sum of all buy prices × quantity
- **Total Profit/Loss**: Absolute and percentage gains/losses
- **Allocation Chart**: Pie chart showing asset distribution

Data Sources:
- `GET /api/portfolio/summary`
- `GET /api/portfolio/allocation`

### Holdings Page
Table view of all holdings with:
- Symbol, Asset Type, Quantity
- Buy Price, Current Price
- Market Value
- Profit/Loss (absolute and %)
- Color-coded rows (green for profit, red for loss)

Data Source: `GET /api/portfolio/holdings`

### Assets Management Page
Manage your assets:
- **Add Asset Form**: Input fields for symbol, type, quantity, buy price
- **Asset Cards Grid**: Visual representation of all assets with delete option
- **Real-time Updates**: Form submission triggers data refresh
- **Success/Error Messages**: User feedback for operations

Data Sources:
- `GET /api/assets` - Fetch all assets
- `POST /api/assets` - Create new asset
- `DELETE /api/assets/{id}` - Remove asset

### Live Price Viewer
Check stock prices on demand:
- **Search Form**: Input any stock symbol
- **Price Display**: Current price, currency, timestamp
- **Real-time Data**: Fetched from Yahoo Finance via backend

Data Source: `GET /api/assets/price/{symbol}`

## Component Architecture

### SummaryCards Component
Props:
- `portfolioSummary` (object) - Portfolio summary data
- `loading` (boolean) - Loading state
- `error` (string) - Error message

Features:
- Responsive grid layout
- Color-coded for profit (green) and loss (red)
- Percentage displays for P&L

### HoldingsTable Component
Props:
- `holdings` (array) - Array of holding objects
- `loading` (boolean) - Loading state
- `error` (string) - Error message

Features:
- Sortable table structure
- Color-coded profit/loss rows
- Responsive table wrapper for mobile

### AllocationChart Component
Props:
- `allocationData` (array) - Allocation items with symbol and percentage
- `loading` (boolean) - Loading state
- `error` (string) - Error message

Features:
- Interactive pie chart using Recharts
- Custom tooltips with market value
- Color-coded segments
- Responsive container

## Styling

The application uses a professional color scheme:
- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Dark Purple)
- **Success**: #48bb78 (Green)
- **Error**: #f56565 (Red)
- **Background**: #f5f7fa (Light Gray)
- **Text**: #2d3748 (Dark Gray)

All CSS is written without preprocessors for simplicity. Each component and page has its own CSS file in `src/styles/`.

## Responsive Design

The application is fully responsive:
- Desktop: Full multi-column layouts
- Tablet: Adaptive grid layouts (768px breakpoint)
- Mobile: Single column with stacked elements

## Error Handling

The application handles errors gracefully:
1. **Network Errors**: "No response from server" message
2. **API Errors**: Backend error messages displayed to user
3. **Form Validation**: Required field validation with error messages
4. **Confirmation Dialogs**: Delete operations require user confirmation

## Performance Considerations

- **Code Splitting**: React Router enables automatic code splitting
- **Lazy Loading**: Page components are loaded on demand
- **API Optimization**: Uses `Promise.all()` for parallel requests
- **Responsive Images**: Chart components scale to container size

## Future Enhancements

- Add TypeScript for type safety
- Implement data caching and refresh intervals
- Add export to CSV functionality
- Portfolio performance charts over time
- Asset search and filtering
- Add authentication
- Dark mode support
- Advanced charting (TradingView charts)

## Troubleshooting

### "No response from server" Error
- Ensure backend is running on `http://localhost:8080`
- Check network connectivity
- Verify CORS is properly configured on backend

### "Cannot GET /api/..." Error
- Check backend endpoints match the API service
- Verify backend is running and responsive

### Empty Data Tables
- Ensure you have assets added to the portfolio
- Check if backend is returning data
- Look at browser console for API errors

### Chart Not Displaying
- Ensure allocation data is returned from backend
- Check if data has valid symbol and percentage values

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- The application does NOT mock data - all data comes from the backend
- No TypeScript is used, only JavaScript
- All computations are done on the backend (frontend displays only)
- Live prices are fetched via backend's Python yfinance service
- Authentication is not implemented
