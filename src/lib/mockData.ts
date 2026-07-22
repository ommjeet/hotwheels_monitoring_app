import { WatchlistItem, InstamartItem } from '../types';

export const DEFAULT_RULES: WatchlistItem[] = [
  {
    id: 'rule-1',
    name: 'Super Treasure Hunts (STH)',
    keyword: 'Super Treasure Hunt',
    matchType: 'contains',
    excludeKeywords: ['damaged', 'loose'],
    autoPurchase: true,
    active: true,
    priority: 'high',
    similarityThreshold: 90,
    maxPrice: 200,
    quantity: 1,
    codToggle: false,
    notes: 'Prioritize Spectraflame blue editions if available.',
    detectionCount: 3,
    lastDetected: '2026-07-20T02:45:00Z'
  },
  {
    id: 'rule-2',
    name: 'Nissan Skyline GT-R',
    keyword: 'Skyline GT-R',
    matchType: 'contains',
    excludeKeywords: [],
    autoPurchase: true,
    active: true,
    priority: 'high',
    similarityThreshold: 85,
    maxPrice: 499,
    quantity: 2,
    codToggle: false,
    notes: 'Automatic buy on stock matching.',
    detectionCount: 5,
    lastDetected: '2026-07-20T02:12:00Z'
  },
  {
    id: 'rule-3',
    name: 'Toyota AE86 Trueno',
    keyword: 'AE86',
    matchType: 'contains',
    excludeKeywords: [],
    autoPurchase: false,
    active: true,
    priority: 'medium',
    similarityThreshold: 85,
    maxPrice: 599,
    quantity: 1,
    codToggle: true,
    notes: 'Premium boulevard release only.',
    detectionCount: 1,
    lastDetected: '2026-07-20T01:30:00Z'
  },
  {
    id: 'rule-4',
    name: 'Premium Car Culture Series',
    keyword: 'Car Culture',
    matchType: 'contains',
    excludeKeywords: [],
    autoPurchase: false,
    active: false,
    priority: 'medium',
    similarityThreshold: 80,
    maxPrice: 600,
    quantity: 1,
    codToggle: false,
    notes: 'Watchlist only.',
    detectionCount: 0,
    lastDetected: undefined
  }
];

export const INSTAMART_SAMPLE_PRODUCTS: Omit<InstamartItem, 'id' | 'timestamp'>[] = [
  {
    title: 'Hot Wheels Premium Car Culture Boulevard - Toyota AE86 Sprinter Trueno',
    price: 499,
    originalPrice: 599,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Premium Car Culture'
  },
  {
    title: 'Hot Wheels 1:64 Mainline Assorted Die-Cast Toy Car (Styles May Vary)',
    price: 149,
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: false,
    collectorType: 'Mainline Match'
  },
  {
    title: 'Hot Wheels Super Treasure Hunt - Nissan Skyline GT-R (R34) Spectraflame Blue',
    price: 149,
    originalPrice: 149,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Super TH'
  },
  {
    title: 'Hot Wheels Boulevard Mercedes-Benz 190E 2.5-16 Evolution II Black',
    price: 499,
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Premium Car Culture'
  },
  {
    title: 'Hot Wheels Regular Treasure Hunt - Mad Propz Airplane Chrome Edition',
    price: 149,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Regular TH'
  },
  {
    title: 'Hot Wheels Retro Entertainment Back to the Future Time Machine Hover Mode',
    price: 549,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Premium Car Culture'
  },
  {
    title: 'Hot Wheels Red Line Club Exclusive Custom Corvette Spectraflame Pink',
    price: 2499,
    originalPrice: 2999,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Red Line Club'
  },
  {
    title: 'Hot Wheels Car Culture Speed Machines Porsche 911 GT3 RS',
    price: 499,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: true,
    collectorType: 'Premium Car Culture'
  },
  {
    title: 'Dairy Milk Silk Hazelnut Chocolate Bar 58g',
    price: 90,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Chocolates & Candies',
    isCollectorPiece: false
  },
  {
    title: 'Coca-Cola Zero Sugar Diet Soda 330ml Can',
    price: 40,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Soft Drinks',
    isCollectorPiece: false
  },
  {
    title: 'Doritos Nacho Cheese Tortilla Chips 150g',
    price: 85,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Chips & Crisps',
    isCollectorPiece: false
  },
  {
    title: 'Hot Wheels Mainline - Custom 18 Ford Mustang GT Red',
    price: 149,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Toys & Collectibles',
    isCollectorPiece: false,
    collectorType: 'Mainline Match'
  },
  {
    title: 'Britannia Good Day Butter Cookies 200g',
    price: 35,
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=400',
    category: 'Biscuits & Cookies',
    isCollectorPiece: false
  }
];

export const MOCK_USER_SETTINGS = {
  scanIntervalSeconds: 4,
  userLocation: 'Mumbai Central Area, Sector 4',
  autoCheckoutSimulated: true,
  autoCheckoutPaymentMethod: 'UPI',
  localChromePort: 9222
};
