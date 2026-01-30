import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://be-restaurant-api-889893107835.asia-southeast2.run.app';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Fast Food', icon: 'fast-food' },
  { id: 2, name: 'Beverages', icon: 'beverages' },
  { id: 3, name: 'Asian', icon: 'asian' },
  { id: 4, name: 'Local', icon: 'local' },
];

export async function GET() {
  try {
    const url = `${BACKEND_URL}/api/categories`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(MOCK_CATEGORIES);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(MOCK_CATEGORIES);
  }
}
