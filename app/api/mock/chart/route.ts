import { NextResponse } from 'next/server';

// Mock chart/time series data API - perfect for chart widgets
export async function GET() {
  // Simulate some network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const generateTimeSeriesData = () => {
    const data = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 30); // Start 30 days ago
    
    let basePrice = 100;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      // Random walk for price simulation
      basePrice += (Math.random() * 5 - 2.5);
      
      const volume = Math.floor(Math.random() * 1000000 + 500000);
      const high = basePrice + Math.random() * 3;
      const low = basePrice - Math.random() * 3;
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: basePrice.toFixed(2),
        volume,
        high: high.toFixed(2),
        low: low.toFixed(2),
        open: (basePrice + (Math.random() * 2 - 1)).toFixed(2),
        close: basePrice.toFixed(2),
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  return NextResponse.json(timeSeriesData);
}


