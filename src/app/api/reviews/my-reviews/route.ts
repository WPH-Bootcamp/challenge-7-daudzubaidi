import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = 'https://restaurant-be-400174736012.asia-southeast2.run.app';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.get(`${BACKEND_URL}/api/review/my-reviews`, {
      headers: {
        Authorization: authToken,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('My reviews fetch error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.message || 'Failed to fetch reviews',
      },
      { status: error.response?.status || 500 }
    );
  }
}
