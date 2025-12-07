import { NextResponse } from 'next/server';

// Mock users table data API
export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 400));

  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emily', 'Chris', 'Anna', 'Tom', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
  const companies = ['Tech Corp', 'Finance Inc', 'Health Systems', 'Energy Ltd', 'Retail Group'];
  const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'mock.io'];

  const generateUser = (id: number) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    
    return {
      id,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      company,
      department: ['Sales', 'Engineering', 'Marketing', 'Support', 'Finance'][Math.floor(Math.random() * 5)],
      status: ['Active', 'Active', 'Active', 'Inactive'][Math.floor(Math.random() * 4)],
      joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    };
  };

  const users = Array.from({ length: 15 }, (_, i) => generateUser(i + 1));

  return NextResponse.json(users);
}


