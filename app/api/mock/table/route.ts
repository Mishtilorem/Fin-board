import { NextResponse } from 'next/server';

// Mock table data API - perfect for table widgets
export async function GET() {
  // Simulate some network delay
  await new Promise(resolve => setTimeout(resolve, 400));

  const generateStock = (symbol: string, basePrice: number) => {
    const change = (Math.random() * 10 - 5);
    const price = basePrice + change;
    return {
      symbol,
      name: `${symbol} Corporation`,
      price: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: ((change / basePrice) * 100).toFixed(2),
      volume: Math.floor(Math.random() * 10000000 + 1000000),
      marketCap: Math.floor(price * Math.random() * 1000000000 + 50000000000),
      sector: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'][Math.floor(Math.random() * 5)],
    };
  };

  const stocks = [
    generateStock('AAPL', 175),
    generateStock('GOOGL', 140),
    generateStock('MSFT', 350),
    generateStock('AMZN', 150),
    generateStock('TSLA', 250),
    generateStock('META', 320),
    generateStock('NVDA', 450),
    generateStock('NFLX', 450),
    generateStock('AMD', 120),
    generateStock('INTC', 45),
  ];

  return NextResponse.json(stocks);
}


