# Finance Dashboard

A customizable real-time finance monitoring dashboard built with Next.js, TypeScript, and Tailwind CSS. Connect to any financial API and create custom widgets to visualize your data.

> **Status**: ✅ Project Complete - Ready for production use

## Features

- **Widget Management**: Add, remove, and rearrange widgets with drag-and-drop
- **Multiple Display Modes**: Card, Table, and Chart views
- **API Integration**: Connect to any REST API that returns JSON
- **Real-time Updates**: Configurable refresh intervals with intelligent caching
- **Dark/Light Theme**: Responsive design with theme switching
- **Data Persistence**: Dashboard state saved in browser localStorage

## Tech Stack

- Next.js 14 (App Router) | TypeScript | Tailwind CSS
- Zustand (State) | Recharts (Charts) | @dnd-kit (Drag & Drop)
- Axios | Lucide React Icons

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Usage

1. Click **"+ Add Widget"** button
2. Enter widget name and API URL
3. Click **"Test"** to verify connection
4. Select display mode (Card/Table/Chart)
5. Choose fields from API response
6. Set refresh interval and add widget

**Widget Controls**: Hover over widgets to refresh, configure, or delete. Drag by the handle to reorder.

## Supported APIs

Works with any REST API returning JSON:
- Coinbase: `https://api.coinbase.com/v2/exchange-rates?currency=BTC`
- Alpha Vantage, Finnhub, or any custom financial API

## Project Structure

```
finboard/
├── app/              # Next.js app directory
├── components/       # React components
│   └── widgets/      # Widget components
├── store/            # Zustand state management
├── types/            # TypeScript definitions
└── utils/            # API & storage helpers
```

## License

MIT License

---

**Project completed and ready for deployment** 🚀
