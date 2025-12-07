import { NextResponse } from 'next/server';

// Mock metrics dashboard data
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));

  const mockData = {
    totalRevenue: Math.floor(Math.random() * 1000000 + 500000),
    activeUsers: Math.floor(Math.random() * 50000 + 10000),
    transactions: Math.floor(Math.random() * 10000 + 5000),
    conversionRate: (Math.random() * 10 + 2).toFixed(2),
    avgOrderValue: (Math.random() * 200 + 50).toFixed(2),
    customerSatisfaction: (Math.random() * 30 + 70).toFixed(1),
    pageViews: Math.floor(Math.random() * 500000 + 200000),
    bounceRate: (Math.random() * 30 + 20).toFixed(2),
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(mockData);
}


