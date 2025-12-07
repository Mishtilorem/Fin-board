import { NextResponse } from 'next/server';

// Mock card data API - perfect for card widgets
export async function GET() {
  // Simulate some network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockData = {
    currency: 'USD',
    price: (Math.random() * 50000 + 30000).toFixed(2),
    change: (Math.random() * 1000 - 500).toFixed(2),
    changePercent: (Math.random() * 5 - 2.5).toFixed(2),
    volume: Math.floor(Math.random() * 1000000 + 500000),
    high: (Math.random() * 52000 + 32000).toFixed(2),
    low: (Math.random() * 48000 + 30000).toFixed(2),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(mockData);
}

