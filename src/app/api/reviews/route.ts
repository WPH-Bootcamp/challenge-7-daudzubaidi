import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://restaurant-be-400174736012.asia-southeast2.run.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const url = `${BACKEND_URL}/api/review`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    console.log('Create review payload:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Review API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, message: `Failed to create review: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Review response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Review API exception:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while creating review' },
      { status: 500 }
    );
  }
}
