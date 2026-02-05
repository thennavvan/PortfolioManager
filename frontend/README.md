# Portfolio Manager Frontend

A modern React frontend for managing investment portfolios with real-time stock prices and portfolio analytics.

## Features

- **Dashboard**: View portfolio summary with total value, profit/loss, and asset allocation chart
- **Holdings**: Detailed table of all portfolio holdings with performance metrics
- **Asset Management**: Add and delete assets from your portfolio
- **Live Price Viewer**: Check real-time stock prices for any ticker symbol
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── AddAssetForm.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Holdings.jsx
│   │   ├── AssetManagement.jsx
│   │   └── LivePriceViewer.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── Dashboard.css
│   │   ├── Holdings.css
│   │   ├── AssetManagement.css
│   │   ├── AddAssetForm.css
│   │   └── LivePriceViewer.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## API Endpoints Used

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/assets/summary` - Get asset summary
- `GET /api/assets/price/{symbol}` - Get live price for a symbol

### Portfolio
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/portfolio/holdings` - Get all holdings
- `GET /api/portfolio/allocation` - Get asset allocation

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client
- **Recharts** - Charts and visualization
- **CSS3** - Styling (no frameworks)

## Backend Configuration

The frontend expects the backend API to be running at `http://localhost:8080`

To change the backend URL, edit the `API_BASE_URL` in `src/services/api.js`

## Features

### Dashboard Page
- Total portfolio value
- Total profit/loss (absolute and percentage)
- Asset allocation pie chart
- Auto-refresh capability

### Holdings Page
- Complete table of all holdings
- Color-coded profit/loss (green for profit, red for loss)
- Columns for symbol, type, quantity, prices, and returns
- Responsive table design

### Asset Management
- Add new assets with symbol, type, quantity, and buy price
- Delete existing assets
- Form validation
- Success/error notifications

### Live Price Viewer
- Search for stock prices by symbol
- Recent search history
- Real-time price updates
- Clean, minimal interface

## Notes

- No TypeScript or interfaces used (pure JavaScript)
- No external UI frameworks (plain CSS)
- All data comes from backend APIs (no mock data)
- Fully responsive design
- Clean, professional financial dashboard aesthetic
