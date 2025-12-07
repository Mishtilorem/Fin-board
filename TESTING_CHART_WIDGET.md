# How to Test Chart Widget Functionality

## 🎯 Quick Start - Testing with Built-in Mock API

### Step-by-Step Guide:

1. **Click "+ Add Widget"** button

2. **Enter Widget Details**:
   - **Widget Name**: `Price History` (or any name you like)
   - **API URL**: `/api/mock/chart`
   - **Display Mode**: Select **Chart**
   - **Refresh Interval**: `60` seconds

3. **Click "Test"** button
   - You should see: "API connection successful! X fields found"
   - The response will show an array of time-series data

4. **Select Fields** (IMPORTANT):
   - Charts need **at least 2 fields**:
     - **First field** = X-axis (usually date/time)
     - **Additional fields** = Y-axis (values to plot)
   
   - For `/api/mock/chart`, look for fields like:
     - `[0].date` - Select this FIRST (X-axis)
     - `[0].price` - Select this SECOND (Y-axis)
     - `[0].volume` - Optional (additional line)
     - `[0].high` - Optional (additional line)
     - `[0].low` - Optional (additional line)

5. **Click "Add Widget"**
   - Your chart should appear with a line graph

---

## 📊 Understanding Chart Field Selection

### How Charts Work:

Charts need **time-series data** (data points over time):
- **X-axis**: Usually dates, times, or sequential values
- **Y-axis**: Numeric values to plot (can have multiple lines)

### Field Selection Rules:

1. **Select at least 2 fields**:
   - First field = X-axis label
   - Second+ fields = Y-axis values (creates multiple lines)

2. **Field Order Matters**:
   - First selected = X-axis
   - Rest = Y-axis lines

3. **Data Must Be Array**:
   - Chart expects array of objects
   - Each object = one data point

---

## ✅ Testing Checklist

### Test 1: Basic Chart Creation
```
□ Click "+ Add Widget"
□ Enter name: "Price Chart"
□ Enter URL: "/api/mock/chart"
□ Select Display Mode: "Chart"
□ Click "Test" → Verify success
□ Select fields: [0].date (first), [0].price (second)
□ Click "Add Widget"
□ Verify chart appears with line graph
```

### Test 2: Multiple Data Series
```
□ Create chart with: [0].date, [0].price, [0].volume
□ Verify chart shows 2 lines (price and volume)
□ Verify legend shows both series
□ Verify different colors for each line
```

### Test 3: Chart Interaction
```
□ Hover over chart → Verify tooltip shows data
□ Verify X-axis shows dates
□ Verify Y-axis shows numeric values
□ Verify chart is responsive (resizes with container)
```

### Test 4: Auto-Refresh
```
□ Set refresh interval to 10 seconds (for testing)
□ Wait 10 seconds
□ Verify chart updates with new data
□ Verify "Last updated" time changes
```

### Test 5: Manual Refresh
```
□ Click refresh button (circular arrow)
□ Verify loading spinner appears
□ Verify chart updates
□ Verify "Last updated" time changes
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No chart data available"

**Problem**: Chart shows empty message

**Solutions**:
1. **Check field selection**:
   - Must select at least 2 fields
   - First field should be X-axis (date/time)
   - Second+ fields should be numeric (Y-axis)

2. **Verify data structure**:
   - Click "Test" to see API response
   - Data should be an array: `[{...}, {...}, {...}]`
   - Each item should have the fields you selected

3. **Check field paths**:
   - For `/api/mock/chart`: Use `[0].date`, `[0].price`
   - Make sure paths match the API response structure

### Issue 2: Chart Shows But No Lines

**Problem**: Chart container appears but no data lines

**Solutions**:
1. **Verify numeric values**:
   - Y-axis fields must be numbers
   - Check if values are strings (might need conversion)

2. **Check field order**:
   - First field = X-axis (should be dates/strings)
   - Other fields = Y-axis (should be numbers)

3. **Verify data array**:
   - Data should be array of objects
   - Each object should have selected fields

### Issue 3: Wrong X-axis Labels

**Problem**: X-axis shows wrong values

**Solutions**:
1. **Check first field**:
   - First selected field becomes X-axis
   - Should be date/time or sequential values

2. **Verify field path**:
   - Make sure you selected the correct field
   - Use "Test" to see exact field structure

### Issue 4: Chart Not Responsive

**Problem**: Chart doesn't resize or has horizontal scroll

**Solutions**:
1. **Check container**:
   - Chart should be in flexible container
   - Should use ResponsiveContainer from Recharts

2. **Verify width/height**:
   - Chart uses 100% width and height
   - Container should be flexible

---

## 📝 Step-by-Step Example: `/api/mock/chart`

### API Response Structure:
```json
[
  {
    "date": "2024-01-01",
    "price": "102.50",
    "volume": 750000,
    "high": "105.20",
    "low": "100.30"
  },
  {
    "date": "2024-01-02",
    "price": "103.75",
    "volume": 820000,
    "high": "104.50",
    "low": "102.10"
  },
  ...
]
```

### Field Selection:
1. **Click "Test"** → See available fields
2. **Look for**: `[0].date`, `[0].price`, `[0].volume`, etc.
3. **Select in order**:
   - First: `[0].date` (X-axis)
   - Second: `[0].price` (Y-axis - main line)
   - Optional: `[0].volume` (Y-axis - second line)

### Expected Result:
- Chart with dates on X-axis
- Price line on Y-axis
- Optional volume line (if selected)
- Interactive tooltip on hover
- Legend showing data series

---

## 🌐 Testing with External APIs

### Option 1: CoinGecko API (Cryptocurrency Prices) ⭐ RECOMMENDED
**No API key required!**

**API URL for Bitcoin Price History:**
```
https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily
```

**Fields to select:**
- First: `prices[0][0]` (X-axis - timestamp)
- Second: `prices[0][1]` (Y-axis - Bitcoin price)
- Optional: `market_caps[0][1]` (market cap line)
- Optional: `total_volumes[0][1]` (volume line)

**Note:** This returns nested arrays. You'll need to transform it. See Option 1b for a better format.

**Option 1b: CoinGecko Simple Format (Better for Charts):**
```
https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=30
```
- Returns array of [timestamp, open, high, low, close]
- **Fields to select:**
  - First: `[0][0]` (X-axis - timestamp)
  - Second: `[0][1]` (open price)
  - Third: `[0][2]` (high price)
  - Fourth: `[0][3]` (low price)
  - Fifth: `[0][4]` (close price)

### Option 2: Open-Meteo Weather API ⭐ GREAT FOR MULTIPLE LINES
**No API key required!**

**API URL:**
```
https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&forecast_days=3
```

**Fields to select:**
- First: `hourly.time` (X-axis - time)
- Second: `hourly.temperature_2m` (Y-axis - temperature)
- Third: `hourly.relative_humidity_2m` (humidity line)
- Fourth: `hourly.wind_speed_10m` (wind speed line)

**Note:** This API has nested structure. After clicking "Test", look for:
- `hourly.time[0]` (first time value)
- `hourly.temperature_2m[0]` (first temperature)
- etc.

### Option 3: ExchangeRate-API (Currency Rates)
**Free tier available, no key needed for basic usage**

**API URL:**
```
https://api.exchangerate-api.com/v4/latest/USD
```
- Returns current rates (not time-series)
- For time-series, check their historical endpoint

### Option 4: JSONPlaceholder (Simple Test Data)
**No API key required - good for testing structure**

**API URL:**
```
https://jsonplaceholder.typicode.com/posts
```
- Returns array of posts
- **Fields to select:**
  - First: `[0].id` (X-axis - post ID)
  - Second: `[0].userId` (user ID line)
  - Third: `[0].id` (post ID as value)

### Option 5: Alpha Vantage (Stock Data) - Requires Free API Key ⭐
**Get free API key at: https://www.alphavantage.co/support/#api-key**

**API URL:**
```
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=K78JCQMFOOCYWBW6
```

**How to Use:**
1. Click "+ Add Widget"
2. Enter name: "IBM Stock Chart"
3. Paste the API URL above
4. Select Display Mode: **Chart**   
5. Click **"Test"** button

**Fields to Select:**
After clicking "Test", you'll see the response structure. Look for fields under `Time Series (Daily)`:

- **First field** (X-axis): Select **ANY date field** like:
  - `Time Series (Daily).2024-01-01` (pick the first date you see)
  
- **Second field** (Y-axis - Open price):
  - `Time Series (Daily).2024-01-01.1. open`
  
- **Third field** (Y-axis - High price):
  - `Time Series (Daily).2024-01-01.2. high`
  
- **Fourth field** (Y-axis - Low price):
  - `Time Series (Daily).2024-01-01.3. low`
  
- **Fifth field** (Y-axis - Close price):
  - `Time Series (Daily).2024-01-01.4. close`

**Important Notes:**
- The chart component will automatically transform the Alpha Vantage format
- Pick any date from `Time Series (Daily)` for the first field - it will use all dates
- The chart will show 4 lines: Open (blue), High (purple), Low (purple), Close (cyan)
- Alpha Vantage has rate limits: 5 API calls per minute, 500 per day

**Try Different Stocks:**
- Replace `IBM` with: `AAPL` (Apple), `MSFT` (Microsoft), `GOOGL` (Google), `TSLA` (Tesla)

### Option 6: REST Countries (Simple Array Test)
**No API key required**

**API URL:**
```
https://restcountries.com/v3.1/all?fields=name,population,area
```
- Returns array of countries
- **Fields to select:**
  - First: `[0].name.common` (X-axis - country name)
  - Second: `[0].population` (population line)
  - Third: `[0].area` (area line)

---

## 🎯 Best Options for Multiple Lines:

1. **Open-Meteo** (Option 2) - Easiest, returns multiple metrics in nested arrays
2. **CoinGecko OHLC** (Option 1b) - Best for financial data with 4 lines (open/high/low/close)
3. **CoinGecko Market Chart** (Option 1) - Good but needs transformation

---

### Custom Time-Series API
Any API that returns an array of objects with:
- One field for X-axis (dates/times)
- One or more numeric fields for Y-axis

---

## 💡 Pro Tips

1. **Always Test First**:
   - Click "Test" before adding widget
   - Check the data structure
   - Verify fields exist

2. **Field Selection Order**:
   - First field = X-axis (horizontal)
   - Other fields = Y-axis (vertical lines)

3. **Multiple Lines**:
   - Select multiple Y-axis fields for multiple lines
   - Each line gets a different color

4. **Data Format**:
   - X-axis: Can be dates, times, or labels
   - Y-axis: Must be numeric values

5. **Refresh Intervals**:
   - Charts: 60+ seconds (data doesn't change often)
   - Don't set too low (wastes API calls)

---

## 🎓 Chart Data Requirements

### What Charts Need:
- ✅ Array of objects
- ✅ At least 2 selected fields
- ✅ First field = X-axis (labels)
- ✅ Other fields = Y-axis (numeric values)
- ✅ Consistent data structure across all items

### What Charts DON'T Need:
- ❌ Single values (not arrays)
- ❌ Only 1 field selected
- ❌ Non-numeric Y-axis values
- ❌ Inconsistent data structure

---

## 🚀 Quick Test Commands

### Test with Mock API (Fastest)
```
1. Click "+ Add Widget"
2. URL: /api/mock/chart
3. Mode: Chart
4. Test → Select: [0].date (first), [0].price (second)
5. Add Widget
```

### Test with Multiple Lines
```
1. Click "+ Add Widget"
2. URL: /api/mock/chart
3. Mode: Chart
4. Test → Select: [0].date, [0].price, [0].volume
5. Add Widget
6. Verify 2 lines on chart (price and volume)
```

---

## 📊 Expected Results

### For `/api/mock/chart`:
- **X-axis**: Dates (30 days)
- **Y-axis**: Price line (and optionally volume, high, low)
- **Data Points**: 30 points
- **Features**: Interactive tooltip, legend, responsive

### Chart Features:
- ✅ Line graph with smooth curves
- ✅ Interactive tooltip on hover
- ✅ Legend showing data series
- ✅ Responsive sizing
- ✅ X-axis labels (dates)
- ✅ Y-axis labels (numeric values)
- ✅ Grid lines for readability

---

## 🔍 Debugging Tips

1. **Check Browser Console** (F12):
   - Look for errors
   - Check if data is loading
   - Verify field paths

2. **Inspect Widget Data**:
   - Click "Configure" on widget
   - Check selected fields
   - Verify field paths are correct

3. **Test API Response**:
   - Use "Test" button in modal
   - Check the response structure
   - Verify array format

4. **Verify Field Selection**:
   - Must have at least 2 fields
   - First = X-axis
   - Others = Y-axis

---

**Happy Chart Testing! 📈**

If charts still don't show, check:
1. Field selection (need 2+ fields)
2. Field order (first = X-axis)
3. Data format (must be array)
4. Browser console for errors

