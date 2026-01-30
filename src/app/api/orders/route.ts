import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://restaurant-be-400174736012.asia-southeast2.run.app';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const url = `${BACKEND_URL}/api/order/my-order`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Orders API error:', response.status, errorText);
      return NextResponse.json({ success: false, message: 'Failed to fetch orders', data: [] }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Orders API exception:', error);
    return NextResponse.json({ success: false, message: 'Server error', data: [] }, { status: 500 });
  }
}

interface OrderBody {
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  let body: OrderBody = {};
  try {
    body = await request.json();
    const authHeader = request.headers.get('authorization');
    const url = `${BACKEND_URL}/api/order/checkout`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    console.log('Checkout payload:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Checkout API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, message: `Failed to create order: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Checkout response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Checkout API exception:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while creating order' },
      { status: 500 }
    );
  }
}
