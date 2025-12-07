# Finance Dashboard - Complete Project Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Functionalities](#core-functionalities)
3. [Project Architecture](#project-architecture)
4. [File Structure & Purpose](#file-structure--purpose)
5. [Data Flow](#data-flow)
6. [Key Technologies](#key-technologies)
7. [How Everything Works Together](#how-everything-works-together)

---

## 🎯 Overview

**Finance Dashboard** is a customizable, real-time finance monitoring application that allows users to:
- Connect to any financial API
- Create custom widgets to visualize data
- Display data in multiple formats (Cards, Tables, Charts)
- Manage widgets with drag-and-drop reordering
- Persist dashboard state across sessions

---

## ✨ Core Functionalities

### 1. **Widget Management System**
- ✅ **Add Widgets**: Create new widgets by connecting to any REST API
- ✅ **Remove Widgets**: Delete unwanted widgets
- ✅ **Configure Widgets**: Edit widget settings (name, API URL, fields, refresh interval)
- ✅ **Reorder Widgets**: Drag-and-drop to rearrange widget positions
- ✅ **Refresh Widgets**: Manual refresh button for each widget

### 2. **Widget Display Modes**
- **Card View**: Display key metrics in a card format with labels and values
- **Table View**: Show data in a sortable, searchable table format
- **Chart View**: Visualize time-series data with interactive line charts

### 3. **API Integration**
- **Dynamic Field Selection**: Automatically extracts all fields from API responses
- **Field Mapping**: Users can select which fields to display
- **Real-time Updates**: Configurable refresh intervals (1 second to any value)
- **Intelligent Caching**: Reduces API calls and improves performance
- **CORS Proxy**: Built-in proxy to handle CORS issues
- **Error Handling**: Graceful error messages for failed API calls

### 4. **User Interface Features**
- **Dark/Light Theme**: Toggle between dark and light modes
- **Fully Responsive**: Works on mobile, tablet, and desktop
- **Loading States**: Visual indicators during data fetching
- **Error States**: Clear error messages when things go wrong
- **Modern UI**: Clean, intuitive interface with smooth animations

### 5. **Data Persistence**
- **LocalStorage Integration**: Dashboard state saved in browser
- **Session Persistence**: Widgets and settings persist across page refreshes
- **Automatic Recovery**: Dashboard restores previous state on load

### 6. **Mock APIs (Built-in)**
- **Card API**: `/api/mock/card` - Stock price card data
- **Table API**: `/api/mock/table` - Stock market table data
- **Chart API**: `/api/mock/chart` - Time series price data
- **Finance API**: `/api/mock/finance` - Cryptocurrency data
- **Metrics API**: `/api/mock/metrics` - Dashboard metrics
- **Users API**: `/api/mock/users` - User table data

---

## 🏗️ Project Architecture

```
Finboard/
├── app/                    # Next.js App Router (Pages & API Routes)
├── components/             # React Components
├── store/                  # State Management (Zustand)
├── types/                  # TypeScript Type Definitions
├── utils/                  # Utility Functions
└── Configuration Files     # Next.js, TypeScript, Tailwind configs
```

---

## 📁 File Structure & Purpose

### **Root Configuration Files**

#### `package.json`
**Purpose**: Defines project dependencies and scripts
- Lists all npm packages (React, Next.js, Zustand, Recharts, etc.)
- Contains build scripts (`dev`, `build`, `start`, `lint`)
- **Use Case**: Install dependencies with `npm install`, run project with `npm run dev`

#### `tsconfig.json`
**Purpose**: TypeScript configuration
- Defines TypeScript compiler options
- Sets up path aliases (`@/` points to root directory)
- **Use Case**: Enables TypeScript type checking and IntelliSense

#### `next.config.js`
**Purpose**: Next.js framework configuration
- Configures Next.js build settings
- **Use Case**: Customizes Next.js behavior (currently uses defaults)

#### `tailwind.config.ts`
**Purpose**: Tailwind CSS configuration
- Defines custom colors, breakpoints, and styles
- **Use Case**: Customizes the design system and responsive breakpoints

#### `postcss.config.js`
**Purpose**: PostCSS configuration for Tailwind
- Processes CSS with Tailwind and Autoprefixer
- **Use Case**: Required for Tailwind CSS to work

#### `.eslintrc.json`
**Purpose**: ESLint configuration for code quality
- Sets up linting rules for Next.js projects
- **Use Case**: Catches code errors and enforces code style

#### `next-env.d.ts`
**Purpose**: Auto-generated TypeScript definitions for Next.js
- Provides type definitions for Next.js
- **Use Case**: TypeScript knows about Next.js types (auto-generated, don't edit)

---

### **App Directory** (`app/`)

This is the Next.js App Router directory - all routes and pages go here.

#### `app/layout.tsx`
**Purpose**: Root layout component for all pages
- Wraps all pages with common elements (metadata, fonts, global styles)
- **Use Case**: Defines the HTML structure, metadata, and global styles

#### `app/page.tsx`
**Purpose**: Home page component
- Initializes the dashboard store from localStorage
- Renders the main Dashboard component
- **Use Case**: Entry point of the application - what users see at `/`

#### `app/globals.css`
**Purpose**: Global CSS styles
- Contains Tailwind CSS directives
- Custom CSS variables and global styles
- **Use Case**: Applies styles across the entire application

---

### **API Routes** (`app/api/`)

These are Next.js API routes that run on the server.

#### `app/api/proxy/route.ts`
**Purpose**: CORS proxy for external APIs
- Fetches data from external APIs server-side (avoids CORS issues)
- **Use Case**: When an API blocks browser requests, this proxy fetches it server-side
- **How it works**: Client sends API URL → Server fetches data → Returns to client

#### `app/api/mock/card/route.ts`
**Purpose**: Mock API endpoint for card widget testing
- Returns sample stock price data
- **Use Case**: Test card widgets without external API keys
- **URL**: `/api/mock/card`

#### `app/api/mock/table/route.ts`
**Purpose**: Mock API endpoint for table widget testing
- Returns array of stock market data
- **Use Case**: Test table widgets with sample data
- **URL**: `/api/mock/table`

#### `app/api/mock/chart/route.ts`
**Purpose**: Mock API endpoint for chart widget testing
- Returns time-series price data (30 days)
- **Use Case**: Test chart widgets with historical data
- **URL**: `/api/mock/chart`

#### `app/api/mock/finance/route.ts`
**Purpose**: Mock API endpoint for finance card testing
- Returns cryptocurrency finance data
- **Use Case**: Test finance-related card widgets
- **URL**: `/api/mock/finance`

#### `app/api/mock/metrics/route.ts`
**Purpose**: Mock API endpoint for metrics dashboard
- Returns dashboard metrics (revenue, users, conversion rate)
- **Use Case**: Test metrics card widgets
- **URL**: `/api/mock/metrics`

#### `app/api/mock/users/route.ts`
**Purpose**: Mock API endpoint for user table testing
- Returns array of user data
- **Use Case**: Test table widgets with user data
- **URL**: `/api/mock/users`

---

### **Components Directory** (`components/`)

All React components that make up the UI.

#### `components/Dashboard.tsx`
**Purpose**: Main dashboard container component
- **Key Features**:
  - Displays header with title and widget count
  - Renders grid of widgets
  - Handles drag-and-drop reordering
  - Shows "Add Widget" button and empty state
  - Manages AddWidgetModal visibility
- **Use Case**: The main screen users see - orchestrates all widgets
- **State Management**: Uses Zustand store to get widgets list
- **Drag & Drop**: Uses @dnd-kit for widget reordering

#### `components/AddWidgetModal.tsx`
**Purpose**: Modal dialog for creating new widgets
- **Key Features**:
  - Form to enter widget name and API URL
  - "Test" button to verify API connection
  - Field selection interface (available vs selected fields)
  - Display mode selection (Card/Table/Chart)
  - Refresh interval configuration
- **Use Case**: When user clicks "Add Widget", this modal appears
- **Workflow**:
  1. User enters API URL and clicks "Test"
  2. System fetches API data and shows available fields
  3. User selects fields to display
  4. User chooses display mode and refresh interval
  5. User clicks "Add Widget" to create

#### `components/WidgetConfigModal.tsx`
**Purpose**: Modal dialog for editing existing widgets
- **Key Features**:
  - Pre-filled form with current widget settings
  - Same field selection as AddWidgetModal
  - "Save Changes" button to update widget
- **Use Case**: When user clicks "Configure" button on a widget
- **Difference from AddWidgetModal**: Edits existing widget instead of creating new

#### `components/ThemeToggle.tsx`
**Purpose**: Button to switch between dark and light themes
- **Key Features**:
  - Toggles theme state in Zustand store
  - Updates document class for dark mode
- **Use Case**: User clicks to switch theme - affects entire app

#### `components/widgets/WidgetCard.tsx`
**Purpose**: Displays widget data in card format
- **Key Features**:
  - Shows widget name and refresh interval badge
  - Displays selected fields as key-value pairs
  - Refresh, configure, and delete buttons
  - Loading and error states
  - Auto-fetches data on mount and at intervals
- **Use Case**: Renders when widget `displayMode` is "card"
- **Data Flow**: Fetches API → Displays fields → Auto-refreshes

#### `components/widgets/WidgetTable.tsx`
**Purpose**: Displays widget data in table format
- **Key Features**:
  - Sortable columns
  - Searchable rows
  - Responsive horizontal scrolling
  - Shows array data in rows
  - Refresh, configure, and delete buttons
- **Use Case**: Renders when widget `displayMode` is "table"
- **Data Flow**: Expects array data → Renders as table → Allows sorting/searching

#### `components/widgets/WidgetChart.tsx`
**Purpose**: Displays widget data as line chart
- **Key Features**:
  - Interactive line chart using Recharts
  - Time-series data visualization
  - Multiple data series support
  - Responsive chart sizing
  - Refresh, configure, and delete buttons
- **Use Case**: Renders when widget `displayMode` is "chart"
- **Data Flow**: Expects time-series array → Renders chart → Updates on refresh

---

### **Store Directory** (`store/`)

State management using Zustand.

#### `store/dashboardStore.ts`
**Purpose**: Central state management for entire application
- **State Properties**:
  - `widgets`: Array of all widgets
  - `theme`: Current theme ('light' or 'dark')
- **Actions**:
  - `addWidget()`: Creates new widget
  - `removeWidget()`: Deletes widget by ID
  - `updateWidget()`: Updates widget properties
  - `reorderWidgets()`: Changes widget order
  - `setTheme()`: Changes theme
  - `clearAllWidgets()`: Removes all widgets
  - `initialize()`: Loads state from localStorage
- **Persistence**: Automatically saves to localStorage on every change
- **Use Case**: All components read/write state through this store
- **Why Zustand**: Lightweight, simple, no boilerplate compared to Redux

---

### **Types Directory** (`types/`)

TypeScript type definitions.

#### `types/widget.ts`
**Purpose**: Defines TypeScript types for widgets and dashboard
- **Key Types**:
  - `Widget`: Complete widget object structure
  - `WidgetField`: Field mapping (path, label, type, value)
  - `DisplayMode`: 'card' | 'table' | 'chart'
  - `DashboardState`: Overall dashboard state structure
- **Use Case**: Ensures type safety - TypeScript catches errors if wrong data structure used
- **Benefits**: IntelliSense autocomplete, compile-time error checking

---

### **Utils Directory** (`utils/`)

Utility functions used throughout the application.

#### `utils/api.ts`
**Purpose**: API fetching and caching utilities
- **Key Functions**:
  - `fetchApiData()`: Main function to fetch API data with caching
  - `flattenObject()`: Converts nested JSON to flat structure for field selection
  - Cache management functions
- **Features**:
  - Automatic caching (reduces API calls)
  - Request deduplication (multiple widgets using same API share request)
  - CORS proxy fallback
  - Error handling
- **Use Case**: All widgets use this to fetch data
- **How it works**:
  1. Check cache first
  2. If cached and valid → return cached data
  3. If not cached → fetch from API
  4. Store in cache
  5. Return data

#### `utils/cache.ts`
**Purpose**: Low-level caching implementation
- **Key Features**:
  - TTL (Time-To-Live) management
  - Cache size limits
  - Automatic expiration
  - Optional localStorage persistence
- **Use Case**: Used by `api.ts` for caching logic
- **How it works**: Stores key-value pairs with expiration timestamps

#### `utils/storage.ts`
**Purpose**: LocalStorage helper functions
- **Key Functions**:
  - `saveToStorage()`: Saves data to localStorage
  - `loadFromStorage()`: Loads data from localStorage
- **Use Case**: Used by dashboardStore to persist state
- **Features**: Handles JSON serialization, error handling, default values

---

## 🔄 Data Flow

### **Adding a Widget**

```
User clicks "Add Widget"
    ↓
AddWidgetModal opens
    ↓
User enters API URL → clicks "Test"
    ↓
fetchApiData() called
    ↓
API data fetched (or from cache)
    ↓
flattenObject() extracts all fields
    ↓
Fields displayed in modal
    ↓
User selects fields, display mode, refresh interval
    ↓
User clicks "Add Widget"
    ↓
addWidget() called in dashboardStore
    ↓
Widget added to store
    ↓
Store saves to localStorage
    ↓
Dashboard re-renders with new widget
    ↓
Widget component mounts → fetches data → displays
```

### **Widget Data Refresh**

```
Widget component mounts
    ↓
useEffect triggers fetchData()
    ↓
fetchApiData() called with widget.apiUrl
    ↓
Check cache → if valid, return cached data
    ↓
If not cached → fetch from API (or proxy if CORS)
    ↓
Data returned → updateWidget() called
    ↓
Widget re-renders with new data
    ↓
setInterval() schedules next refresh
```

### **Drag & Drop Reordering**

```
User drags widget
    ↓
@dnd-kit detects drag
    ↓
handleDragEnd() called
    ↓
Calculate old and new positions
    ↓
reorderWidgets() called with new array order
    ↓
Store updates widgets array
    ↓
Store saves to localStorage
    ↓
Dashboard re-renders with new order
```

---

## 🛠️ Key Technologies

### **Frontend Framework**
- **Next.js 14**: React framework with App Router
  - Server-side rendering
  - API routes
  - File-based routing

### **Language**
- **TypeScript**: Type-safe JavaScript
  - Catches errors before runtime
  - Better IDE support

### **Styling**
- **Tailwind CSS**: Utility-first CSS framework
  - Responsive design
  - Dark mode support
  - Custom design system

### **State Management**
- **Zustand**: Lightweight state management
  - Simple API
  - No boilerplate
  - Persistence support

### **Data Visualization**
- **Recharts**: React charting library
  - Line charts
  - Responsive charts
  - Interactive features

### **Drag & Drop**
- **@dnd-kit**: Modern drag-and-drop library
  - Touch support
  - Keyboard accessible
  - Sortable lists

### **HTTP Client**
- **Axios**: Promise-based HTTP client
  - Request/response interceptors
  - Error handling
  - Automatic JSON parsing

### **Icons**
- **Lucide React**: Icon library
  - Consistent icon set
  - Tree-shakeable

### **Date Handling**
- **date-fns**: Date utility library
  - Format dates
  - Relative time ("2 hours ago")

---

## 🔗 How Everything Works Together

### **Application Startup**

1. **Next.js loads** `app/layout.tsx` → Sets up HTML structure
2. **Next.js loads** `app/page.tsx` → Renders Dashboard component
3. **Dashboard component** reads from `dashboardStore`
4. **Store initializes** → Loads from localStorage (or empty array)
5. **Dashboard renders** → Shows widgets or empty state
6. **Each widget** mounts → Fetches data using `utils/api.ts`
7. **Data displayed** → Widgets show cards/tables/charts

### **User Interaction Flow**

1. **User adds widget**:
   - Opens `AddWidgetModal`
   - Tests API → `utils/api.ts` fetches data
   - Selects fields → `flattenObject()` shows available fields
   - Creates widget → `dashboardStore.addWidget()` saves to store
   - Store persists → `utils/storage.ts` saves to localStorage
   - Dashboard updates → New widget appears

2. **User reorders widgets**:
   - Drags widget → `@dnd-kit` handles drag
   - Drop detected → `dashboardStore.reorderWidgets()` updates order
   - Store persists → localStorage updated
   - Dashboard re-renders → New order displayed

3. **User changes theme**:
   - Clicks theme toggle → `dashboardStore.setTheme()` updates theme
   - Store persists → Theme saved
   - All components re-render → Dark/light mode applied

4. **Widget auto-refreshes**:
   - `setInterval()` triggers → Widget calls `fetchApiData()`
   - Cache checked → If valid, uses cached data
   - If expired → Fetches fresh data
   - Widget updates → New data displayed

### **Data Persistence**

- **On every state change**: Store automatically saves to localStorage
- **On page load**: Store loads from localStorage
- **On browser close**: Data persists (stored in browser)
- **On page refresh**: Dashboard restores previous state

---

## 📝 Summary

### **What This Application Does**

A customizable dashboard that:
1. Connects to any REST API
2. Displays data in 3 formats (Card/Table/Chart)
3. Auto-refreshes data at configurable intervals
4. Allows drag-and-drop reordering
5. Persists everything in browser storage
6. Works on all devices (responsive)

### **Key Design Decisions**

- **Zustand over Redux**: Simpler, less boilerplate
- **Next.js App Router**: Modern React routing
- **TypeScript**: Type safety and better DX
- **Tailwind CSS**: Rapid UI development
- **LocalStorage**: Simple persistence (no backend needed)
- **Caching**: Reduces API calls and improves performance

### **File Organization**

- **`app/`**: Routes and API endpoints
- **`components/`**: Reusable UI components
- **`store/`**: Global state management
- **`types/`**: TypeScript definitions
- **`utils/`**: Shared utility functions

---

## 🎓 Learning Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Zustand Docs**: https://zustand-demo.pmnd.rs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/
- **@dnd-kit**: https://docs.dndkit.com/

---

**This guide covers everything in the project. Each file has a specific purpose, and together they create a fully functional finance dashboard application!**

