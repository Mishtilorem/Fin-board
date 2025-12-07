import { NextResponse } from 'next/server';

// Mock finance card data API
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));

  const currencies = ['BTC', 'ETH', 'USD', 'EUR', 'GBP'];
  const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];

  const mockData = {
    symbol: randomCurrency,
    name: randomCurrency === 'BTC' ? 'Bitcoin' : 
          randomCurrency === 'ETH' ? 'Ethereum' : 
          randomCurrency,
    currentPrice: randomCurrency === 'BTC' ? (Math.random() * 10000 + 40000).toFixed(2) :
                   randomCurrency === 'ETH' ? (Math.random() * 2000 + 2000).toFixed(2) :
                   (Math.random() * 10 + 1).toFixed(2),
    change24h: (Math.random() * 10 - 5).toFixed(2),
    changePercent24h: (Math.random() * 5 - 2.5).toFixed(2),
    volume24h: Math.floor(Math.random() * 50000000000 + 10000000000),
    marketCap: Math.floor(Math.random() * 1000000000000 + 500000000000),
    high24h: (Math.random() * 50000 + 45000).toFixed(2),
    low24h: (Math.random() * 40000 + 35000).toFixed(2),
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(mockData);
}


