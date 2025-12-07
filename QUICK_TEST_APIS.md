# Quick Test APIs Reference

Quick reference guide for the most commonly used test APIs. Copy and paste these URLs directly into your widgets!

## 🏠 Local Mock APIs (Start Here!)

These work instantly with no external dependencies:

| Type | URL | Description |
|------|-----|-------------|
| **Card** | `/api/mock/card` | Stock price card with random data |
| **Card** | `/api/mock/finance` | Cryptocurrency finance card |
| **Card** | `/api/mock/metrics` | Dashboard metrics card |
| **Table** | `/api/mock/table` | Stock market table (10 stocks) |
| **Table** | `/api/mock/users` | Users table (15 users) |
| **Chart** | `/api/mock/chart` | 30-day price history chart |

## 🌐 Public APIs (No API Key)

### Card Widgets

```
https://api.coinbase.com/v2/exchange-rates?currency=BTC
```
- Fields: `data.currency`, `data.rates.USD`, `data.rates.EUR`

```
https://randomuser.me/api/
```
- Fields: `results[0].name.first`, `results[0].email`, `results[0].location.country`

```
http://worldtimeapi.org/api/timezone/America/New_York
```
- Fields: `datetime`, `timezone`, `day_of_week`

### Table Widgets

```
https://jsonplaceholder.typicode.com/todos
```
- Returns array directly - perfect for table view
- Fields: `id`, `title`, `completed`, `userId`

```
https://jsonplaceholder.typicode.com/users
```
- Returns array of user objects
- Fields: `id`, `name`, `email`, `phone`, `company.name`

```
https://jsonplaceholder.typicode.com/posts
```
- Returns array of post objects
- Fields: `id`, `title`, `body`, `userId`

### Chart Widgets

```
https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&hourly=temperature_2m&forecast_days=3
```
- X-axis: `hourly.time`
- Y-axis: `hourly.temperature_2m`
- Perfect for time series chart!

## 🎯 Copy-Paste Ready Examples

### Example 1: Bitcoin Price Card
- **Name**: Bitcoin Price
- **URL**: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
- **Mode**: Card
- **Fields**: `data.currency`, `data.rates.USD`
- **Refresh**: 30 seconds

### Example 2: Stock Table
- **Name**: Stock Prices
- **URL**: `/api/mock/table`
- **Mode**: Table
- **Fields**: Select root array
- **Refresh**: 60 seconds

### Example 3: Price Chart
- **Name**: Price History
- **URL**: `/api/mock/chart`
- **Mode**: Chart
- **Fields**: `date` (X-axis), `price` (Y-axis)
- **Refresh**: 60 seconds

### Example 4: Users Table
- **Name**: User List
- **URL**: `/api/mock/users`
- **Mode**: Table
- **Fields**: Select root array
- **Refresh**: 60 seconds

### Example 5: Metrics Dashboard
- **Name**: Key Metrics
- **URL**: `/api/mock/metrics`
- **Mode**: Card
- **Fields**: `totalRevenue`, `activeUsers`, `conversionRate`
- **Refresh**: 30 seconds

## 💡 Pro Tips

1. **Start with local APIs** (`/api/mock/*`) - they work instantly!
2. **Test first** - Always click "Test" before adding the widget
3. **Check field paths** - Use the test response to find exact field paths
4. **Set refresh intervals** - 30s for cards, 60s+ for tables/charts
5. **Local = Fast** - Mock APIs respond instantly with no network delay

## 🚨 Troubleshooting

- **CORS Error?** The proxy should handle it automatically
- **No Data?** Check field paths match the API response structure
- **Slow Loading?** Try local mock APIs first
- **Wrong Format?** Use "Test" button to see exact response structure

For more APIs, see `TEST_APIS.md` for the complete list!

