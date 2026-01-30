import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://restaurant-be-400174736012.asia-southeast2.run.app';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = `${BACKEND_URL}/api/resto/${id}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const result = await response.json();
    
    // Transform backend response to match frontend expectations
    if (result.success && result.data) {
      const resto = result.data;
      
      // Transform restaurant data
      const transformedData = {
        id: resto.id,
        name: resto.name,
        rating: resto.star || resto.averageRating || 0,
        location: resto.place || '',
        distance: '2.0 km', // API doesn't provide distance
        image: resto.images?.[0] || resto.logo || '/images/placeholder.svg',
        logo: resto.logo || '',
        gallery: resto.images || [],
        totalReviews: resto.totalReviews || 0,
        category: resto.category || '',
        
        // Transform menus
        menus: (resto.menus || []).map((menu: any) => ({
          id: menu.id,
          name: menu.foodName || menu.name,
          description: menu.description || '',
          price: menu.price || 0,
          image: menu.image || '/images/placeholder-food.svg',
          categoryId: menu.type === 'drink' ? 5 : 1, // drink or food
          rating: resto.star || 0,
          location: resto.place || '',
          distance: '2.0 km',
        })),
        
        // Transform reviews
        reviews: (resto.reviews || []).map((review: any) => ({
          id: review.id,
          name: review.user?.name || 'Anonymous',
          avatar: review.user?.avatar || null,
          date: new Date(review.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          rating: review.star || 5,
          comment: review.comment || '',
        })),
      };
      
      return NextResponse.json(transformedData);
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid response from backend' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error fetching restaurant detail:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch restaurant detail' },
      { status: 500 }
    );
  }
}
