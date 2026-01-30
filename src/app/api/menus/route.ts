import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://restaurant-be-400174736012.asia-southeast2.run.app';

// Mock data for fallback when backend is not available
// NOTE: Backend API uses /api/resto endpoint for restaurants/menus
// Expected endpoint: https://restaurant-be-400174736012.asia-southeast2.run.app/api/resto
const MOCK_MENUS = [
  { id: 1, name: 'Ayam Geprek', description: 'Ayam goreng dengan sambal pedas', price: 25000, image: '/images/food/ayam-geprek.svg', categoryId: 1, rating: 4.8, location: 'Jakarta Selatan', distance: '1.2 km' },
  { id: 2, name: 'Bakso Malang', description: 'Bakso dengan isi telur puyuh', price: 20000, image: '/images/food/bakso.svg', categoryId: 1, rating: 4.7, location: 'Jakarta Pusat', distance: '2.5 km' },
  { id: 3, name: 'Burger King Whopper', description: 'Burger dengan daging sapi premium', price: 50000, image: '/images/food/burger.svg', categoryId: 2, rating: 4.9, location: 'Jakarta Barat', distance: '3.0 km' },
  { id: 4, name: 'Pizza Margherita', description: 'Pizza klasik dengan keju mozzarella', price: 75000, image: '/images/food/pizza.svg', categoryId: 2, rating: 4.6, location: 'Jakarta Timur', distance: '4.5 km' },
  { id: 5, name: 'Fried Chicken', description: 'Ayam goreng crispy', price: 30000, image: '/images/food/fried-chicken.svg', categoryId: 1, rating: 4.9, location: 'Jakarta Selatan', distance: '1.8 km' },
  { id: 6, name: 'Nasi Padang', description: 'Nasi dengan lauk khas Padang', price: 35000, image: '/images/food/padang.svg', categoryId: 1, rating: 4.8, location: 'Jakarta Pusat', distance: '2.0 km' },
  { id: 7, name: 'Warteg Special', description: 'Menu warteg lengkap', price: 18000, image: '/images/food/warteg.svg', categoryId: 1, rating: 4.5, location: 'Jakarta Selatan', distance: '2.2 km' },
  { id: 8, name: 'Sushi Roll Set', description: 'Set sushi dengan 8 potong roll', price: 85000, image: '/images/food/sushi.svg', categoryId: 4, rating: 4.7, location: 'Jakarta Barat', distance: '3.5 km' },
  { id: 9, name: 'Ramen Bowl', description: 'Ramen dengan kuah gurih', price: 45000, image: '/images/food/ramen.svg', categoryId: 4, rating: 4.6, location: 'Jakarta Pusat', distance: '1.0 km' },
  { id: 10, name: 'Coffee Latte', description: 'Kopi susu premium', price: 28000, image: '/images/food/coffee.svg', categoryId: 5, rating: 4.9, location: 'Jakarta Timur', distance: '2.8 km' },
  { id: 11, name: 'Es Teler', description: 'Minuman segar dengan buah', price: 15000, image: '/images/food/esteler.svg', categoryId: 5, rating: 4.7, location: 'Jakarta Selatan', distance: '1.5 km' },
  { id: 12, name: 'McDonald\'s Big Mac', description: 'Burger double dengan saus special', price: 55000, image: '/images/food/mcdonalds.svg', categoryId: 2, rating: 4.8, location: 'Jakarta Pusat', distance: '2.3 km' },
  { id: 13, name: 'Ayam Geprek Sambel Ijo', description: 'Ayam geprek dengan sambel hijau', price: 27000, image: '/images/food/ayam-geprek.svg', categoryId: 1, rating: 4.7, location: 'Jakarta Barat', distance: '3.2 km' },
  { id: 14, name: 'Bakso Urat', description: 'Bakso dengan urat sapi', price: 25000, image: '/images/food/bakso.svg', categoryId: 1, rating: 4.8, location: 'Jakarta Timur', distance: '2.7 km' },
  { id: 15, name: 'Burger Cheese', description: 'Burger dengan double cheese', price: 45000, image: '/images/food/burger.svg', categoryId: 2, rating: 4.6, location: 'Jakarta Selatan', distance: '1.9 km' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BACKEND_URL}/api/resto${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(MOCK_MENUS);
    }

    const result = await response.json();
    
    // Transform backend response to match frontend expectations
    // Backend returns: { success, data: { restaurants: [...] } }
    // Frontend expects: array of menu items
    if (result.success && result.data?.restaurants) {
      const restaurants = result.data.restaurants.map((resto: any) => ({
        id: resto.id,
        name: resto.name,
        description: resto.category || '',
        price: resto.priceRange?.min || 0,
        image: resto.logo || resto.images?.[0] || '/images/placeholder.svg',
        categoryId: 1, // TODO: Map category string to ID
        rating: resto.star || 0,
        location: resto.place || '',
        distance: '2.0 km', // API doesn't provide distance, using default
      }));
      return NextResponse.json(restaurants);
    }
    
    return NextResponse.json(MOCK_MENUS);
  } catch {
    return NextResponse.json(MOCK_MENUS);
  }
}
