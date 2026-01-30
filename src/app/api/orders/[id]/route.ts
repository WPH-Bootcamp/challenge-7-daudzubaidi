import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://be-restaurant-api-889893107835.asia-southeast2.run.app';

interface Order {
  id: number;
  restaurantName: string;
  items: unknown[];
  total: number;
  status: string;
  createdAt: string;
}

const MOCK_ORDERS: Record<number, Order> = {
  1: { id: 1, restaurantName: 'Burger King', items: [], total: 150000, status: 'completed', createdAt: new Date('2024-01-15').toISOString() },
  2: { id: 2, restaurantName: 'Pizza Hut', items: [], total: 225000, status: 'completed', createdAt: new Date('2024-01-14').toISOString() },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${BACKEND_URL}/api/orders/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const mockData = MOCK_ORDERS[parseInt(id)];
      return NextResponse.json(mockData || { error: 'Order not found' });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    const mockData = MOCK_ORDERS[parseInt((await params).id)];
    return NextResponse.json(mockData || { error: 'Order not found' });
  }
}
