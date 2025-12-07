# How to Test Your Table Widget

## 🎯 Quick Start - Testing with Built-in Mock APIs

### Option 1: Stock Market Table (Recommended)

1. **Click "+ Add Widget"** button
2. **Enter Widget Details**:
   - **Widget Name**: `Stock Prices` (or any name you like)
   - **API URL**: `/api/mock/table`
   - **Display Mode**: Select **Table**
   - **Refresh Interval**: `60` seconds

3. **Click "Test"** button
   - You should see: "API connection successful! X fields found"
   - The response will show an array of stock data

4. **Select Fields**:
   - In the "Available Fields" section, look for fields that are **arrays**
   - For `/api/mock/table`, the API returns an array directly
   - **Important**: Select the **root array** (the array itself, not individual fields)
   - You'll see fields like: `[0].symbol`, `[0].name`, `[0].price`, etc.
   - Select multiple fields like: `symbol`, `name`, `price`, `change`, `volume`

5. **Click "Add Widget"**
   - Your table should appear with columns for each selected field
   - Data should display in rows

### Option 2: Users Table

1. **Widget Name**: `User List`
2. **API URL**: `/api/mock/users`
3. **Display Mode**: **Table**
4. **Refresh Interval**: `60` seconds
5. **Click "Test"** → Select array fields like: `id`, `name`, `email`, `company`, `department`
6. **Add Widget**

---

## 🌐 Testing with External APIs

### Public APIs That Work Great for Tables

#### 1. JSONPlaceholder Todos
```
API URL: https://jsonplaceholder.typicode.com/todos
```
- **Fields to select**: `id`, `title`, `completed`, `userId`
- Returns 200 todo items
- Perfect for testing large datasets

#### 2. JSONPlaceholder Users
```
API URL: https://jsonplaceholder.typicode.com/users
```
- **Fields to select**: `id`, `name`, `email`, `phone`, `company.name`, `address.city`
- Returns 10 user objects
- Good for testing nested fields

#### 3. JSONPlaceholder Posts
```
API URL: https://jsonplaceholder.typicode.com/posts
```
- **Fields to select**: `id`, `title`, `body`, `userId`
- Returns 100 posts
- Tests with longer text content

---

## ✅ What to Test

### 1. **Basic Display**
- ✅ Table shows all selected fields as columns
- ✅ Data appears in rows
- ✅ Column headers are visible
- ✅ Data is readable and formatted

### 2. **Search Functionality**
- ✅ Type in the search box
- ✅ Table filters rows based on search query
- ✅ Search works across all columns
- ✅ "X of Y items" counter updates correctly

### 3. **Sorting**
- ✅ Click any column header to sort
- ✅ First click sorts ascending (↑)
- ✅ Second click sorts descending (↓)
- ✅ Third click removes sorting
- ✅ Sorting works for numbers, text, and dates

### 4. **Refresh**
- ✅ Click refresh button (circular arrow icon)
- ✅ Loading spinner appears
- ✅ Data updates after refresh
- ✅ "Last updated" timestamp changes

### 5. **Auto-Refresh**
- ✅ Wait for the refresh interval (e.g., 60 seconds)
- ✅ Table automatically fetches new data
- ✅ Updates without manual intervention

### 6. **Responsive Design**
- ✅ Table scrolls horizontally on mobile
- ✅ Columns are visible on different screen sizes
- ✅ Search bar is accessible on mobile

### 7. **Error Handling**
- ✅ Enter invalid API URL → Shows error message
- ✅ API returns error → Error displayed in table
- ✅ Network failure → Shows appropriate error

---

## 🔍 Step-by-Step Testing Checklist

### Test 1: Basic Table Creation
```
□ Click "+ Add Widget"
□ Enter name: "Test Table"
□ Enter URL: "/api/mock/table"
□ Select Display Mode: "Table"
□ Click "Test" → Verify success message
□ Select array fields (symbol, name, price)
□ Click "Add Widget"
□ Verify table appears with data
```

### Test 2: Search Functionality
```
□ Type "AAPL" in search box
□ Verify only matching rows show
□ Clear search → All rows reappear
□ Type partial text → Verify partial matches work
```

### Test 3: Column Sorting
```
□ Click "price" column header
□ Verify ascending sort (lowest to highest)
□ Click again → Verify descending sort
□ Click third time → Verify sort removed
□ Test with text column (name) → Verify alphabetical sort
```

### Test 4: Manual Refresh
```
□ Note current "Last updated" time
□ Click refresh button (circular arrow)
□ Verify loading spinner appears
□ Verify data updates
□ Verify "Last updated" time changes
```

### Test 5: Auto-Refresh
```
□ Set refresh interval to 10 seconds (for testing)
□ Note current data
□ Wait 10 seconds
□ Verify data automatically refreshes
□ Verify "Last updated" time updates
```

### Test 6: Multiple Columns
```
□ Configure widget with many fields (5+ columns)
□ Verify all columns display
□ Verify horizontal scrolling works (on mobile)
□ Verify columns are sortable
```

### Test 7: Large Dataset
```
□ Use API: "https://jsonplaceholder.typicode.com/todos"
□ Verify all 200 rows load
□ Verify search works with large dataset
□ Verify sorting works with large dataset
```

### Test 8: Error Scenarios
```
□ Enter invalid URL → Verify error message
□ Use URL that returns non-array data → Verify error
□ Disconnect internet → Verify error handling
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No fields found" or Empty Table

**Problem**: Table shows but no data appears

**Solutions**:
1. **Check if you selected an array field**
   - Table widgets need array data
   - Look for fields that show `type: "array"` in the field list
   - Select the root array, not individual object properties

2. **Verify API returns array**
   - Click "Test" button
   - Check the response structure
   - Should be: `[{...}, {...}, {...}]` not `{data: [...]}`

3. **Select correct fields**
   - For `/api/mock/table`: Select fields like `symbol`, `name`, `price`
   - Don't select the array itself, select fields within array items

### Issue 2: Columns Not Showing

**Problem**: Table shows but columns are missing

**Solutions**:
1. **Select more fields**
   - Each selected field becomes a column
   - Select at least 2-3 fields for a proper table

2. **Check field paths**
   - Make sure field paths are correct
   - Use "Test" to see exact field structure

### Issue 3: Search Not Working

**Problem**: Search box doesn't filter rows

**Solutions**:
1. **Refresh the widget**
   - Click refresh button
   - Sometimes data needs to reload

2. **Check if data is loaded**
   - Verify table has data rows
   - Empty table = nothing to search

### Issue 4: Sorting Not Working

**Problem**: Clicking column headers doesn't sort

**Solutions**:
1. **Wait for data to load**
   - Sorting only works when data is present
   - Check for loading spinner

2. **Try different column**
   - Some columns might have same values
   - Try sorting by numeric columns (price, volume)

### Issue 5: Data Not Updating

**Problem**: Table shows old data

**Solutions**:
1. **Manual refresh**
   - Click refresh button
   - This bypasses cache

2. **Check refresh interval**
   - Verify interval is set correctly
   - Wait for auto-refresh time

3. **Clear cache**
   - Browser might be caching
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

---

## 📊 Expected Results

### For `/api/mock/table`:
- **Columns**: symbol, name, price, change, changePercent, volume, marketCap, sector
- **Rows**: 10 stock entries
- **Features**: All sortable, searchable

### For `/api/mock/users`:
- **Columns**: id, name, email, phone, company, department, status, joinDate
- **Rows**: 15 user entries
- **Features**: All sortable, searchable

### For `https://jsonplaceholder.typicode.com/todos`:
- **Columns**: id, title, completed, userId
- **Rows**: 200 todo items
- **Features**: All sortable, searchable

---

## 🎓 Pro Tips

1. **Always Test First**
   - Click "Test" button before adding widget
   - Verify API returns array data
   - Check field structure

2. **Start Simple**
   - Use `/api/mock/table` first
   - Get familiar with the interface
   - Then try external APIs

3. **Select Array Fields**
   - Look for `type: "array"` in field list
   - Select fields within the array items
   - Don't select the array wrapper itself

4. **Use Appropriate Refresh Intervals**
   - Tables: 60+ seconds (data doesn't change often)
   - Don't set too low (wastes API calls)

5. **Test All Features**
   - Search, sort, refresh
   - Test on mobile and desktop
   - Test with different data sizes

---

## 🚀 Quick Test Commands

### Test with Mock API (Fastest)
```
1. Click "+ Add Widget"
2. URL: /api/mock/table
3. Mode: Table
4. Test → Select: symbol, name, price, volume
5. Add Widget
```

### Test with External API
```
1. Click "+ Add Widget"
2. URL: https://jsonplaceholder.typicode.com/users
3. Mode: Table
4. Test → Select: id, name, email, phone
5. Add Widget
```

---

## 📝 Testing Notes

- **Table widgets require array data** - Make sure your API returns an array
- **Select fields within array items** - Not the array wrapper
- **Each field becomes a column** - Select 3-5 fields for best results
- **Search works across all columns** - Type anything to filter
- **Sorting works on all columns** - Click header to sort
- **Refresh updates data** - Manual or automatic

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console (F12) for error messages.

