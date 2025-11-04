// Mock data for FarmConnect dashboards

// Mock user data
export const mockUsers = {
  farmer: {
    id: 'farmer-1',
    name: 'John Smith',
    role: 'farmer',
    email: 'john.smith@farm.com',
    farmName: 'Green Valley Farms',
    location: 'California, USA',
    joinedDate: '2023-01-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  buyer: {
    id: 'buyer-1',
    name: 'Sarah Johnson',
    role: 'buyer',
    email: 'sarah.johnson@market.com',
    company: 'Fresh Market Co.',
    location: 'New York, USA',
    joinedDate: '2023-02-20',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  }
};

// Mock products data
export const mockProducts = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    price: 4.50,
    unit: 'lb',
    quantity: 500,
    image: 'https://images.unsplash.com/photo-1546470427-e26264292bb1?w=300&h=200&fit=crop',
    description: 'Fresh organic tomatoes grown without pesticides',
    farmerId: 'farmer-1',
    farmerName: 'Green Valley Farms',
    status: 'available',
    harvestDate: '2024-01-10'
  },
  {
    id: '2',
    name: 'Free-Range Eggs',
    category: 'Dairy & Eggs',
    price: 6.00,
    unit: 'dozen',
    quantity: 200,
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=300&h=200&fit=crop',
    description: 'Farm-fresh eggs from free-range chickens',
    farmerId: 'farmer-1',
    farmerName: 'Green Valley Farms',
    status: 'available',
    harvestDate: '2024-01-12'
  },
  {
    id: '3',
    name: 'Organic Apples',
    category: 'Fruits',
    price: 3.25,
    unit: 'lb',
    quantity: 800,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=200&fit=crop',
    description: 'Crisp organic apples perfect for snacking',
    farmerId: 'farmer-1',
    farmerName: 'Green Valley Farms',
    status: 'available',
    harvestDate: '2024-01-08'
  },
  {
    id: '4',
    name: 'Fresh Lettuce',
    category: 'Vegetables',
    price: 2.75,
    unit: 'head',
    quantity: 300,
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&h=200&fit=crop',
    description: 'Crispy fresh lettuce heads',
    farmerId: 'farmer-1',
    farmerName: 'Green Valley Farms',
    status: 'low-stock',
    harvestDate: '2024-01-11'
  }
];

// Mock orders data
export const mockOrders = [
  {
    id: 'order-001',
    buyerId: 'buyer-1',
    buyerName: 'Sarah Johnson',
    buyerCompany: 'Fresh Market Co.',
    farmerId: 'farmer-1',
    items: [
      { productId: '1', productName: 'Organic Tomatoes', quantity: 50, price: 4.50, total: 225 },
      { productId: '2', productName: 'Free-Range Eggs', quantity: 20, price: 6.00, total: 120 }
    ],
    totalAmount: 345,
    status: 'pending',
    orderDate: '2024-01-10T10:30:00Z',
    expectedDelivery: '2024-01-15',
    shippingAddress: '123 Market St, New York, NY 10001'
  },
  {
    id: 'order-002',
    buyerId: 'buyer-1',
    buyerName: 'Sarah Johnson',
    buyerCompany: 'Fresh Market Co.',
    farmerId: 'farmer-1',
    items: [
      { productId: '3', productName: 'Organic Apples', quantity: 100, price: 3.25, total: 325 }
    ],
    totalAmount: 325,
    status: 'shipped',
    orderDate: '2024-01-08T14:20:00Z',
    expectedDelivery: '2024-01-12',
    shippingAddress: '123 Market St, New York, NY 10001',
    trackingNumber: 'FC789456123'
  },
  {
    id: 'order-003',
    buyerId: 'buyer-1',
    buyerName: 'Sarah Johnson',
    buyerCompany: 'Fresh Market Co.',
    farmerId: 'farmer-1',
    items: [
      { productId: '4', productName: 'Fresh Lettuce', quantity: 30, price: 2.75, total: 82.50 }
    ],
    totalAmount: 82.50,
    status: 'delivered',
    orderDate: '2024-01-05T09:15:00Z',
    expectedDelivery: '2024-01-08',
    deliveryDate: '2024-01-08T16:30:00Z',
    shippingAddress: '123 Market St, New York, NY 10001'
  }
];

// Mock analytics data
export const mockAnalytics = {
  farmer: {
    totalRevenue: 15420,
    totalOrders: 48,
    totalProducts: 12,
    totalCustomers: 8,
    monthlyRevenue: [
      { month: 'Sep', revenue: 2800 },
      { month: 'Oct', revenue: 3200 },
      { month: 'Nov', revenue: 3800 },
      { month: 'Dec', revenue: 4100 },
      { month: 'Jan', revenue: 1520 }
    ],
    popularProducts: [
      { name: 'Organic Tomatoes', sales: 850, revenue: 3825 },
      { name: 'Free-Range Eggs', sales: 320, revenue: 1920 },
      { name: 'Organic Apples', sales: 650, revenue: 2112.50 }
    ],
    ordersByStatus: {
      pending: 5,
      shipped: 12,
      delivered: 31
    }
  },
  buyer: {
    totalSpent: 2450,
    totalOrders: 8,
    favoriteFarmers: 3,
    savedProducts: 15,
    monthlySpending: [
      { month: 'Sep', spent: 420 },
      { month: 'Oct', spent: 580 },
      { month: 'Nov', spent: 650 },
      { month: 'Dec', spent: 800 },
      { month: 'Jan', spent: 732.50 }
    ],
    categorySpending: [
      { category: 'Vegetables', amount: 980, percentage: 40 },
      { category: 'Fruits', amount: 735, percentage: 30 },
      { category: 'Dairy & Eggs', amount: 490, percentage: 20 },
      { category: 'Grains', amount: 245, percentage: 10 }
    ],
    ordersByStatus: {
      pending: 1,
      shipped: 2,
      delivered: 5
    }
  }
};

// Mock customer insights
export const mockCustomers = [
  {
    id: 'buyer-1',
    name: 'Sarah Johnson',
    company: 'Fresh Market Co.',
    totalOrders: 8,
    totalSpent: 2450,
    lastOrder: '2024-01-10',
    status: 'active',
    location: 'New York, NY'
  },
  {
    id: 'buyer-2',
    name: 'Mike Chen',
    company: 'Organic Grocers',
    totalOrders: 12,
    totalSpent: 3680,
    lastOrder: '2024-01-09',
    status: 'active',
    location: 'Los Angeles, CA'
  },
  {
    id: 'buyer-3',
    name: 'Emily Rodriguez',
    company: 'Farm-to-Table Restaurant',
    totalOrders: 6,
    totalSpent: 1890,
    lastOrder: '2024-01-07',
    status: 'active',
    location: 'Austin, TX'
  }
];

// Mock cart data
export let mockCart = {
  items: [],
  total: 0
};

// Helper functions for mock data manipulation
export const addToCart = (product, quantity = 1) => {
  const existingItem = mockCart.items.find(item => item.productId === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.total = existingItem.quantity * existingItem.price;
  } else {
    mockCart.items.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity,
      image: product.image,
      unit: product.unit
    });
  }

  mockCart.total = mockCart.items.reduce((sum, item) => sum + item.total, 0);
};

export const removeFromCart = (productId) => {
  mockCart.items = mockCart.items.filter(item => item.productId !== productId);
  mockCart.total = mockCart.items.reduce((sum, item) => sum + item.total, 0);
};

export const updateCartQuantity = (productId, quantity) => {
  const item = mockCart.items.find(item => item.productId === productId);
  if (item) {
    item.quantity = quantity;
    item.total = item.price * quantity;
    mockCart.total = mockCart.items.reduce((sum, item) => sum + item.total, 0);
  }
};

export const clearCart = () => {
  mockCart.items = [];
  mockCart.total = 0;
};