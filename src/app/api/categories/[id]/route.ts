import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://be-restaurant-api-889893107835.asia-southeast2.run.app';

interface Category {
  id: number;
  name: string;
  icon: string;
}

const MOCK_CATEGORIES: Record<number, Category> = {
  1: { id: 1, name: 'Fast Food', icon: 'fast-food' },
  2: { id: 2, name: 'Beverages', icon: 'beverages' },
  3: { id: 3, name: 'Asian', icon: 'asian' },
  4: { id: 4, name: 'Local', icon: 'local' },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${BACKEND_URL}/api/categories/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const mockData = MOCK_CATEGORIES[parseInt(id)];
      return NextResponse.json(mockData || { error: 'Category not found' });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    const mockData = MOCK_CATEGORIES[parseInt((await params).id)];
    return NextResponse.json(mockData || { error: 'Category not found' });
  }
}
