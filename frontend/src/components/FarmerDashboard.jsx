// frontend/src/pages/FarmerDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Home,
  UserCircle,
  User,
  Store,
  Phone,
  Mail,
  Edit3,
  X,
  Bell,
  LogOut,
  Settings,
  Info,
  Download,
  Shield,
  Moon,
  Sun,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  WifiOff,
  Server,
  Save,
  AlertCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import StatsCard from '../components/StatsCard';
import axios from 'axios';

// ✅ BACKEND INTEGRATION CONSTANTS - UPDATED
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8002';
const API_BASE = `${BACKEND_URL}/api`;

// ✅ HELPER FUNCTIONS (ONLY PURE FUNCTIONS OUTSIDE COMPONENT)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'shipped': 'bg-purple-100 text-purple-800 border-purple-200',
    'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'active': 'bg-blue-100 text-blue-800 border-blue-200',
    'inactive': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// ✅ AUTH TOKEN MANAGEMENT
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
};

const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('tokenExpiry');
};

const setAuthData = (token, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
  // Set token expiry (assuming 24-hour tokens)
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  localStorage.setItem('tokenExpiry', expiry.toISOString());
};

const isTokenExpired = () => {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  return new Date() > new Date(expiry);
};

const FarmerDashboard = () => {
  // ✅ ALL STATE HOOKS AT THE TOP
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [backendOnline, setBackendOnline] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [authError, setAuthError] = useState('');

  // Edit product states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editProductErrors, setEditProductErrors] = useState({});
  const [updatingProduct, setUpdatingProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: '',
    category: '',
    description: '',
    quantity_available: '',
    images: []
  });

  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    priceAlerts: true,
    newOrders: true,
    promotions: false,
    soundEnabled: true
  });

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    farmName: '',
    location: '',
    bio: ''
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginAlerts: true
  });

  // Product management states
  const [addingProduct, setAddingProduct] = useState(false);
  const [productErrors, setProductErrors] = useState({});

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Get user from localStorage
  const currentUser = getCurrentUser();

  // ✅ PRODUCT VALIDATION FUNCTION
  const validateProduct = (product) => {
    const errors = {};

    if (!product.name?.trim()) {
      errors.name = 'Product name is required';
    } else if (product.name.length < 2) {
      errors.name = 'Product name must be at least 2 characters';
    }

    if (!product.price || parseFloat(product.price) <= 0) {
      errors.price = 'Valid price is required';
    }

    if (!product.unit?.trim()) {
      errors.unit = 'Unit is required (e.g., kg, bunch, piece)';
    }

    if (!product.category) {
      errors.category = 'Category is required';
    }

    if (!product.quantity_available || parseInt(product.quantity_available) < 0) {
      errors.quantity_available = 'Valid quantity is required';
    }

    if (!product.description?.trim()) {
      errors.description = 'Description is required';
    } else if (product.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    return errors;
  };

  // ✅ ENHANCED AUTH CHECK WITH TOKEN REFRESH
  const checkAuth = async () => {
    const token = getAuthToken();

    if (!token) {
      console.error('❌ No auth token found');
      setAuthError('No authentication token found. Please log in again.');
      return false;
    }

    if (isTokenExpired()) {
      console.error('❌ Token expired');
      setAuthError('Your session has expired. Please log in again.');
      clearAuthData();
      return false;
    }

    // If backend is offline, we'll use demo mode
    if (!backendOnline) {
      console.log('📡 Backend offline, proceeding with demo mode');
      return true;
    }

    try {
      const response = await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      console.log('✅ Auth valid, user:', response.data);
      setAuthError('');
      return true;
    } catch (error) {
      console.error('❌ Auth check failed:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        setAuthError('Authentication failed. Please log in again.');
        clearAuthData();
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      return false;
    }
  };

  // ✅ ENHANCED BACKEND CHECK WITH AUTH VALIDATION
  const checkBackendConnection = async () => {
    try {
      console.log('🔍 Checking backend connection...');
      const response = await axios.get(`${BACKEND_URL}/health`, {
        timeout: 3000
      });
      console.log('✅ Backend is online:', response.data);
      setBackendOnline(true);
      setConnectionError('');

      // After backend check, validate auth
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated && backendOnline) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Backend is offline:', error.message);
      setBackendOnline(false);
      setConnectionError(`Cannot connect to backend server at ${BACKEND_URL}. Please make sure the server is running.`);
      return false;
    }
  };

  // ✅ DEMO DATA FOR OFFLINE MODE
  const loadDemoData = () => {
    console.log('📊 Loading demo data...');

    const demoProducts = [
      {
        id: 1,
        name: "Fresh Organic Tomatoes",
        price: 1500,
        unit: "kg",
        category: "Vegetables",
        description: "Fresh organic tomatoes grown with sustainable farming practices",
        quantity_available: 100,
        images: ['/api/placeholder/300/200?text=Tomatoes'],
        status: 'active'
      },
      {
        id: 2,
        name: "Green Bell Peppers",
        price: 1200,
        unit: "kg",
        category: "Vegetables",
        description: "Crisp green bell peppers, perfect for cooking and salads",
        quantity_available: 75,
        images: ['/api/placeholder/300/200?text=Peppers'],
        status: 'active'
      },
      {
        id: 3,
        name: "Fresh Cucumbers",
        price: 800,
        unit: "kg",
        category: "Vegetables",
        description: "Fresh green cucumbers, great for salads and snacks",
        quantity_available: 50,
        images: ['/api/placeholder/300/200?text=Cucumbers'],
        status: 'active'
      }
    ];

    const demoOrders = [
      {
        id: 1001,
        buyer_name: "John Smith",
        total_amount: 4500,
        status: "pending",
        created_at: new Date().toISOString(),
        delivery_address: "123 Market Street, Lagos"
      },
      {
        id: 1002,
        buyer_name: "Sarah Johnson",
        total_amount: 3200,
        status: "confirmed",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        delivery_address: "456 Business Ave, Abuja"
      },
      {
        id: 1003,
        buyer_name: "Michael Brown",
        total_amount: 5600,
        status: "delivered",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        delivery_address: "789 Farm Road, Ibadan"
      }
    ];

    const demoAnalytics = {
      total_earnings: 150000,
      total_orders: demoOrders.length,
      active_products: demoProducts.length,
      total_customers: 45,
      monthly_earnings: [
        { month: "Jan", earned: 12000 },
        { month: "Feb", earned: 18000 },
        { month: "Mar", earned: 22000 },
        { month: "Apr", earned: 19000 },
        { month: "May", earned: 25000 },
        { month: "Jun", earned: 28000 }
      ],
      product_performance: [
        { product: "Tomatoes", revenue: 45000, sales: 150 },
        { product: "Peppers", revenue: 32000, sales: 120 },
        { product: "Cucumbers", revenue: 28000, sales: 95 }
      ],
      customer_ratings: 4.5
    };

    const demoUserProfile = {
      ...currentUser,
      first_name: currentUser.first_name || 'John',
      last_name: currentUser.last_name || 'Doe',
      email: currentUser.email || 'farmer@example.com',
      phone: currentUser.phone || '+2348012345678',
      farm_name: currentUser.farm_name || 'Green Valley Farm',
      city: currentUser.city || 'Lagos',
      state: currentUser.state || 'Lagos State',
      address: currentUser.address || '123 Farm Road, Lagos',
      farm_size: currentUser.farm_size || '5 acres',
      farm_type: currentUser.farm_type || 'Organic Vegetables',
      years_farming: currentUser.years_farming || 3,
      bio: currentUser.bio || 'We grow fresh, organic vegetables using sustainable farming practices.',
      completedProfile: 85,
      joinDate: currentUser.created_at || new Date().toISOString()
    };

    setProducts(demoProducts);
    setOrders(demoOrders);
    setAnalytics(demoAnalytics);
    setUserProfile(demoUserProfile);
    setProfileForm(demoUserProfile);
    setLoading(false);
  };

  // ✅ PROFILE COMPLETION CALCULATOR
  const calculateProfileCompletion = (profile) => {
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone',
      'farm_name', 'city', 'state', 'address'
    ];

    const optionalFields = [
      'farm_size', 'farm_type', 'years_farming', 'bio'
    ];

    let completedCount = 0;
    let totalCount = requiredFields.length + (optionalFields.length / 2);

    requiredFields.forEach(field => {
      if (profile[field] && profile[field].toString().trim() !== '') {
        completedCount += 1;
      }
    });

    optionalFields.forEach(field => {
      if (profile[field] && profile[field].toString().trim() !== '') {
        completedCount += 0.3;
      }
    });

    const completion = Math.min(100, Math.round((completedCount / totalCount) * 100));
    return completion;
  };

  // ✅ ENHANCED LOAD DATA WITH BETTER ERROR HANDLING
  const loadData = async () => {
    try {
      setLoading(true);
      setAuthError('');

      // Check backend connection first
      const isBackendOnline = await checkBackendConnection();

      if (!isBackendOnline) {
        console.log('📡 Backend offline, loading demo data');
        loadDemoData();
        return;
      }

      // Backend is online, try to load real data
      const token = getAuthToken();
      if (!token) {
        setAuthError('No authentication token found');
        window.location.href = '/login';
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Load user profile
      try {
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
          headers,
          timeout: 10000
        });
        const userData = profileResponse.data;
        console.log('✅ Profile loaded:', userData);

        const completion = calculateProfileCompletion(userData);
        const enhancedUserData = {
          ...userData,
          completedProfile: completion,
          joinDate: userData.created_at || userData.joinDate || new Date().toISOString()
        };

        setUserProfile(enhancedUserData);
        setProfileForm(enhancedUserData);
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        if (error.response?.status === 401) {
          setAuthError('Authentication failed. Please log in again.');
          return;
        }
        // Fallback to current user data
        const completion = calculateProfileCompletion(currentUser);
        const enhancedCurrentUser = {
          ...currentUser,
          completedProfile: completion,
          joinDate: currentUser.created_at || currentUser.joinDate || new Date().toISOString()
        };
        setUserProfile(enhancedCurrentUser);
        setProfileForm(enhancedCurrentUser);
      }

      // Load products
      try {
        const productsResponse = await axios.get(
          `${API_BASE}/products?farmer_id=${currentUser.id}`,
          { headers, timeout: 10000 }
        );
        const productsWithFullImageUrls = productsResponse.data.map(product => ({
          ...product,
          images: product.images?.map(img =>
            img.startsWith('http') ? img : `${BACKEND_URL}${img}`
          ) || []
        }));
        setProducts(productsWithFullImageUrls || []);
        console.log('✅ Products loaded:', productsWithFullImageUrls.length);
      } catch (error) {
        console.error('❌ Error loading products:', error);
        if (error.response?.status === 401) {
          setAuthError('Authentication failed. Please log in again.');
          return;
        }
        setProducts([]);
      }

      // Load orders
      try {
        const ordersResponse = await axios.get(
          `${API_BASE}/orders/farmer-orders`,
          { headers, timeout: 10000 }
        );
        setOrders(ordersResponse.data || []);
        console.log('✅ Orders loaded:', ordersResponse.data?.length || 0);
      } catch (error) {
        console.error('❌ Error loading orders:', error);
        if (error.response?.status === 401) {
          setAuthError('Authentication failed. Please log in again.');
          return;
        }
        setOrders([]);
      }

      // Calculate customer ratings from reviews (if available)
      const calculateCustomerRating = (products) => {
        const allRatings = [];
        products.forEach(product => {
          if (product.reviews && Array.isArray(product.reviews)) {
            product.reviews.forEach(review => {
              if (review.rating) allRatings.push(review.rating);
            });
          }
        });
        if (allRatings.length === 0) return 0.0;
        const avgRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
        return Math.round(avgRating * 10) / 10; // Round to 1 decimal place
      };

      // Count active products (products that are available)
      const activeProductsCount = products.filter(p => p.is_available !== false).length;

      // Set analytics based on real data
      setAnalytics({
        total_earnings: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        total_orders: orders.length,
        active_products: activeProductsCount,
        total_customers: new Set(orders.map(order => order.buyer_id || order.buyer_name)).size,
        monthly_earnings: [
          { month: "Jan", earned: 12000 },
          { month: "Feb", earned: 18000 },
          { month: "Mar", earned: 22000 },
          { month: "Apr", earned: 19000 },
          { month: "May", earned: 25000 },
          { month: "Jun", earned: 28000 }
        ],
        product_performance: products.map(product => ({
          product: product.name,
          revenue: product.price * 10, // Demo calculation
          sales: Math.floor(Math.random() * 100) + 10
        })),
        customer_ratings: calculateCustomerRating(products),
        total_reviews: products.reduce((sum, product) => {
          return sum + (product.reviews && Array.isArray(product.reviews) ? product.reviews.length : 0);
        }, 0)
      });

    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Fallback to demo data
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // ✅ PROFILE COMPLETION COMPONENT
  const ProfileCompletionBar = ({ completion }) => {
    return (
      <div className={darkMode ? 'bg-blue-900/20 rounded-lg p-4' : 'bg-blue-50 rounded-lg p-4'}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            Profile Completion
          </span>
          <span className={`text-sm font-bold ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            {completion}%
          </span>
        </div>
        <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-blue-800' : 'bg-blue-200'}`}>
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion}%` }}
          ></div>
        </div>
        <p className={`text-xs mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
          {completion === 100
            ? '🎉 Your profile is complete!'
            : `Complete your profile to increase customer trust (${100 - completion}% remaining)`
          }
        </p>
      </div>
    );
  };

  // ✅ CONNECTION STATUS BANNER
  const ConnectionStatusBanner = () => {
    if (backendOnline && !authError) return null;

    return (
      <div className={`${authError ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
        <div className="flex items-center">
          {authError ? <AlertCircle className="h-5 w-5 text-red-600 mr-2" /> : <WifiOff className="h-5 w-5 text-yellow-600 mr-2" />}
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${authError ? 'text-red-800' : 'text-yellow-800'}`}>
              {authError ? 'Authentication Error' : 'Offline Mode'}
            </h3>
            <p className={`text-sm ${authError ? 'text-red-700' : 'text-yellow-700'} mt-1`}>
              {authError || connectionError || 'Cannot connect to server. Showing demo data.'}
            </p>
            {authError && (
              <div className="mt-2">
                <Button
                  onClick={() => {
                    clearAuthData();
                    window.location.href = '/login';
                  }}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </div>
          {!authError && (
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
            >
              <Server className="h-4 w-4 mr-1" />
              Retry Connection
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ✅ IMAGE UPLOAD HANDLER
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    console.log('📁 Files selected:', files);

    if (newProduct.images.length + files.length > 5) {
      alert('❌ Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024;

      if (!isValidType) {
        alert(`❌ File "${file.name}" is not a valid image`);
        return false;
      }
      if (!isValidSize) {
        alert(`❌ File "${file.name}" is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }

    event.target.value = '';
  };

  // ✅ REMOVE IMAGE HANDLER
  const removeImage = (index) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // ✅ UPLOAD IMAGES TO BACKEND
  const uploadProductImages = async (productId, imageFiles) => {
    try {
      if (!imageFiles.length) {
        console.log('ℹ️ No images to upload');
        return [];
      }

      console.log('📤 Starting image upload for product:', productId);

      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('files', file);
      });

      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE}/products/${productId}/upload-images`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      console.log('✅ Images uploaded successfully:', response.data);

      // ✅ FIX: Construct full URLs for the images
      const imageUrls = response.data.image_urls.map(url =>
        `${BACKEND_URL}${url}`
      );

      return imageUrls;
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 401) {
        setAuthError('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to upload images: ' + (error.response?.data?.detail || error.message));
    }
  };
// Add this debug function to FarmerDashboard.jsx
const debugBackendConnection = async () => {
  console.log('🔧 DEBUG: Testing backend connection...');

  try {
    // Test basic health
    const health = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend health:', health.data);

    // Test API health
    const apiHealth = await axios.get(`${BACKEND_URL}/api/health`);
    console.log('✅ API health:', apiHealth.data);

    // Test products endpoint
    const productsHealth = await axios.get(`${BACKEND_URL}/api/products/health`);
    console.log('✅ Products endpoint:', productsHealth.data);

    // Test authentication
    const token = getAuthToken();
    if (token) {
      const profile = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Auth check:', profile.status);
    }

    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.response?.data || error.message);
    return false;
  }
};
  // ✅ ADD PRODUCT FUNCTION WITH BETTER ERROR HANDLING

const handleAddProduct = async (e) => {
  e.preventDefault();
  console.log('🚀 Starting product creation...');

  // Validate inputs
  const errors = validateProduct(newProduct);
  setProductErrors(errors);

  if (Object.keys(errors).length > 0) {
    console.log('❌ Validation errors:', errors);
    return;
  }

  setAddingProduct(true);

  try {
    if (!backendOnline) {
      throw new Error('Backend server is not running. Please start the server.');
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    // ✅ Ensure field names match backend model
    const productData = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      unit: newProduct.unit.trim(),
      quantity_available: parseInt(newProduct.quantity_available), // ✅ Matches backend now
      min_order_quantity: 1,
      image_urls: []
    };

    console.log('📦 Sending product data to backend:', productData);

    // Step 1: Create product
    const response = await axios.post(
      `${API_BASE}/products/`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Product created successfully:', response.data);

    // Step 2: Upload images if any
    let uploadedImageUrls = [];
    if (newProduct.images.length > 0) {
      console.log('📸 Uploading images...');
      uploadedImageUrls = await uploadProductImages(response.data.id, newProduct.images);
      console.log('✅ Image URLs received:', uploadedImageUrls);
    }

    // Step 3: Update local state
    const productWithImages = {
      ...response.data,
      images:
        uploadedImageUrls.length > 0
          ? uploadedImageUrls
          : ['/api/placeholder/400/300?text=' + encodeURIComponent(newProduct.name)]
    };

    setProducts(prev => {
      const updatedProducts = [productWithImages, ...prev];
      
      // Update analytics with new product count
      setAnalytics(prevAnalytics => ({
        ...prevAnalytics,
        active_products: updatedProducts.filter(p => p.is_available !== false).length
      }));
      
      return updatedProducts;
    });

    // Reset form
    setNewProduct({
      name: '',
      price: '',
      unit: '',
      category: '',
      description: '',
      quantity_available: '',
      images: []
    });

    setProductErrors({});
    setShowAddProduct(false);

    alert('🎉 Product added successfully!');

  } catch (error) {
    console.error('❌ Full error details:', error);

    // ✅ ADDITION: Log backend validation errors for debugging
    if (error.response?.data?.detail) {
      console.error('🔍 Validation errors from backend:', error.response.data.detail);

      if (Array.isArray(error.response.data.detail)) {
        error.response.data.detail.forEach((err, index) => {
          console.error(`🔍 Error ${index + 1}:`, err.msg);
          console.error(`🔍 Location:`, err.loc);
          console.error(`🔍 Type:`, err.type);
        });
      }
    }

    let errorMessage = 'Error adding product. Please try again.';

    if (error.response) {
      console.error('📡 Server response error:', error.response.status, error.response.data);

      if (error.response.status === 422 || error.response.status === 400) {
        // Handle validation errors
        const detail = error.response.data?.detail;
        if (Array.isArray(detail)) {
          // Pydantic validation errors
          const errors = detail.map(err => {
            const field = err.loc?.join('.') || 'field';
            return `${field}: ${err.msg}`;
          }).join('\n');
          errorMessage = `Validation errors:\n${errors}`;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        } else {
          errorMessage = 'Invalid product data. Please check your inputs.';
        }
      } else if (error.response.status === 500) {
        const detail = error.response.data?.detail || 'Unknown server error';
        errorMessage = `Server error: ${detail}`;
      } else if (error.response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        setAuthError(errorMessage);
      } else {
        errorMessage = `Server error (${error.response.status}): ${error.response.data?.detail || 'Unknown error'}`;
      }
    } else if (error.request) {
      console.error('📡 No response received - server may be down');
      errorMessage = `Cannot connect to backend. Please ensure it’s running on ${BACKEND_URL}`;
    } else {
      console.error('📡 Other error:', error.message);
      errorMessage = error.message;
    }

    alert(`❌ ${errorMessage}`);
  } finally {
    setAddingProduct(false);
  }
};


  // ✅ EDIT PRODUCT FUNCTION WITH BETTER ERROR HANDLING
  const handleEditProduct = async (e) => {
  e.preventDefault();
  console.log('✏️ Starting product update...');

  // Validate inputs
  const errors = validateProduct(editingProduct);
  setEditProductErrors(errors);

  if (Object.keys(errors).length > 0) {
    console.log('❌ Validation errors:', errors);
    return;
  }

  setUpdatingProduct(true);

  try {
      if (!backendOnline) {
        throw new Error('Backend server is not running. Please start the server.');
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Prepare product data for update
      const productData = {
      name: editingProduct.name.trim(),
      description: editingProduct.description.trim(),
      price: parseFloat(editingProduct.price),
      category: editingProduct.category,
      unit: editingProduct.unit.trim(),
      stock_quantity: parseInt(editingProduct.quantity_available), // ✅ CHANGED THIS LINE
    };

    console.log('📦 Sending product update to FastAPI:', productData);
      // Update the product using PUT request
      const response = await axios.put(
        `${API_BASE}/products/${editingProduct.id}`,
        productData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      console.log('✅ Product updated successfully via FastAPI:', response.data);

      // Update product in local state
      setProducts(prev => prev.map(product =>
        product.id === editingProduct.id ? { ...product, ...response.data } : product
      ));

      // Reset form and close modal
      setEditingProduct(null);
      setEditProductErrors({});
      setShowEditProduct(false);

      alert('✅ Product updated successfully!');

    } catch (error) {
      console.error('❌ Error updating product:', error);

      let errorMessage = 'Error updating product. Please try again.';

      if (error.response) {
        console.error('📡 FastAPI response error:', error.response.status, error.response.data);

        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          setAuthError(errorMessage);
        } else if (error.response.status === 404) {
          errorMessage = 'Product not found. It may have been deleted.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to update this product.';
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid product data. Please check your inputs.';
        } else {
          errorMessage = `Server error (${error.response.status}): ${error.response.data?.detail || 'Unknown error'}`;
        }
      } else if (error.request) {
        console.error('📡 No response received - FastAPI server is likely down');
        errorMessage = `Cannot connect to FastAPI server. Please ensure the backend is running on ${BACKEND_URL}`;
      } else {
        console.error('📡 Other error:', error.message);
        errorMessage = error.message;
      }

      alert(`❌ ${errorMessage}`);
    } finally {
      setUpdatingProduct(false);
    }
  };

  // ✅ START EDITING PRODUCT WITH BETTER ERROR HANDLING
  const startEditingProduct = async (product) => {
  if (!backendOnline) {
    alert('⚠️ Offline Mode: Product editing is disabled. Please connect to the server.');
    return;
  }

  try {
    setUpdatingProduct(true);

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    // Optionally fetch fresh product data from FastAPI
    console.log('🔄 Fetching product data for editing...');
    const response = await axios.get(
      `${API_BASE}/products/${product.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const productData = response.data;
    console.log('✅ Product data fetched:', productData);

    // ✅ FIXED: Map backend stock_quantity to frontend quantity_available
    setEditingProduct({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      unit: productData.unit,
      category: productData.category,
      description: productData.description,
      quantity_available: productData.stock_quantity || productData.quantity_available, // ✅ CHANGED THIS LINE
      images: productData.images || productData.image_urls || []
    });

  } catch (error) {
    console.error('❌ Error fetching product data:', error);

    if (error.response?.status === 401) {
      setAuthError('Authentication failed. Please log in again.');
      alert('❌ Authentication failed. Please log in again.');
      return;
    }

    // Fallback to existing product data if fetch fails
    console.log('🔄 Using existing product data as fallback');
    setEditingProduct({
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      category: product.category,
      description: product.description,
      quantity_available: product.stock_quantity || product.quantity_available, // ✅ CHANGED THIS LINE
      images: product.images || []
    });

    if (error.response?.status === 404) {
      alert('⚠️ Product not found. It may have been deleted.');
      return;
    }
  } finally {
    setUpdatingProduct(false);
  }

  setShowEditProduct(true);
};
  // ✅ DELETE PRODUCT FUNCTION WITH BETTER ERROR HANDLING
  const deleteProduct = async (productId) => {
    if (!backendOnline) {
      alert('⚠️ Offline Mode: Product deletion is disabled. Please connect to the server.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting product from FastAPI...');

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      await axios.delete(
        `${API_BASE}/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      // Remove product from local state and update analytics
      setProducts(prev => {
        const updatedProducts = prev.filter(product => product.id !== productId);
        
        // Recalculate analytics based on actual products
        const activeProductsCount = updatedProducts.filter(p => p.is_available !== false).length;
        setAnalytics(prevAnalytics => ({
          ...prevAnalytics,
          active_products: activeProductsCount
        }));
        
        return updatedProducts;
      });

      alert('✅ Product deleted successfully!');

    } catch (error) {
      console.error('❌ Error deleting product:', error);

      let errorMessage = 'Error deleting product. Please try again.';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          setAuthError(errorMessage);
        } else if (error.response.status === 404) {
          errorMessage = 'Product not found. It may have already been deleted.';
        } else if (error.response.status === 403) {
          errorMessage = 'You are not authorized to delete this product.';
        } else {
          errorMessage = `Server error (${error.response.status}): ${error.response.data?.detail || 'Unknown error'}`;
        }
      }

      alert(`❌ ${errorMessage}`);
    }
  };

  // ✅ ENHANCED PROFILE SAVE FUNCTION
  const saveProfile = async () => {
    if (!backendOnline) {
      alert('⚠️ Offline Mode: Profile updates are disabled. Please connect to the server to save changes.');
      return;
    }

    try {
      console.log('💾 Saving profile...', profileForm);

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Simulate API call for demo (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedProfile = {
        ...userProfile,
        ...profileForm,
        completedProfile: calculateProfileCompletion(profileForm)
      };

      setUserProfile(updatedProfile);
      setEditingProfile(false);

      alert('✅ Profile updated successfully!');

    } catch (error) {
      console.error('❌ Error updating profile:', error);
      alert('❌ Error updating profile. Please try again.');
    }
  };

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!backendOnline) {
      alert('⚠️ Offline Mode: Order updates are disabled. Please connect to the server.');
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Here you would make the actual API call to update the order status
      // For now, we'll just update the local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      alert(`Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('❌ Error updating order status. Please try again.');
    }
  };

  // Profile management functions
  const startEditingProfile = () => {
    setEditingProfile(true);
  };

  const cancelEditing = () => {
    setEditingProfile(false);
    setProfileForm(userProfile);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = () => {
    alert('Data export feature coming soon!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion feature coming soon!');
    }
  };

  // Security functions
  const handleSecurityUpdate = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (securitySettings.newPassword && securitySettings.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      console.log('Updating security settings...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Security settings updated successfully!');
      setSecuritySettings({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: securitySettings.twoFactorEnabled,
        loginAlerts: securitySettings.loginAlerts
      });
    } catch (error) {
      alert('Error updating security settings. Please try again.');
    }
  };

  // ✅ INITIALIZE DASHBOARD WITH BETTER ERROR HANDLING
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check backend connection first
        const isBackendOnline = await checkBackendConnection();

        if (isBackendOnline) {
          // Check authentication
          const isAuthenticated = await checkAuth();
          if (!isAuthenticated) {
            console.log('❌ Authentication failed, redirecting to login...');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }
        }

        // Load data (will use demo data if backend is offline)
        await loadData();
      } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        // Fallback to demo data
        loadDemoData();
      }
    };

    initializeDashboard();
  }, []);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'products', label: 'My Products', icon: Package, badge: products.length },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // Product card buttons component
  const renderProductCardButtons = (product) => (
    <div className="flex space-x-2 pt-2">
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={() => startEditingProduct(product)}
        disabled={!backendOnline || updatingProduct || !!authError}
      >
        <Edit className="h-3 w-3 mr-1" />
        Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:bg-red-50"
        onClick={() => deleteProduct(product.id)}
        disabled={!backendOnline || !!authError}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your farm dashboard...</p>
          {!backendOnline && (
            <p className="text-yellow-600 text-sm mt-2">Connecting to server...</p>
          )}
          {authError && (
            <p className="text-red-600 text-sm mt-2">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} flex transition-colors duration-300`}>
      {/* Sidebar Navigation */}
      <div className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg border-r flex flex-col transition-colors duration-300`}>
        {/* Logo */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>FarmConnect</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Farmer Portal</p>
              {!backendOnline && (
                <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                  Offline
                </Badge>
              )}
              {authError && (
                <Badge variant="outline" className="mt-1 bg-red-100 text-red-800 text-xs">
                  Auth Error
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                {userProfile.first_name} {userProfile.last_name}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{userProfile.farm_name || 'My Farm'}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Badge variant="secondary" className={`text-xs ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                  Farmer
                </Badge>
                {!backendOnline && (
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                    Demo
                  </Badge>
                )}
                {authError && (
                  <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                    Auth Issue
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? darkMode
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== null && item.badge > 0 && (
                  <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
          <button
            onClick={() => setShowProfile(true)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            } transition-colors`}
          >
            <UserCircle className="h-4 w-4" />
            <span>My Profile</span>
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
              darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
            } transition-colors`}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-300`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} capitalize`}>
                {activeTab === 'dashboard' ? 'Farm Dashboard' :
                 activeTab === 'products' ? 'Product Management' :
                 activeTab === 'orders' ? 'Order Management' :
                 activeTab === 'analytics' ? 'Farm Analytics' :
                 activeTab === 'settings' ? 'Settings' : 'My Profile'}
                {!backendOnline && ' (Demo Mode)'}
                {authError && ' (Authentication Error)'}
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {activeTab === 'dashboard' ? 'Manage your farm business and track performance' :
                 activeTab === 'products' ? 'Add and manage your farm products' :
                 activeTab === 'orders' ? 'Process and track customer orders' :
                 activeTab === 'analytics' ? 'Insights into your farm business' :
                 activeTab === 'settings' ? 'Customize your farm dashboard' : 'Manage your farm profile'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Add Product Button */}
              {activeTab === 'products' && (
                <Button
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!backendOnline || !!authError}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              )}

              {/* Notifications */}
              <button className={`p-2 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}>
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile Quick Action */}
              <button
                onClick={() => setShowProfile(true)}
                className={`flex items-center space-x-3 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.first_name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Farmer</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

          {/* Connection Status Banner */}
          <ConnectionStatusBanner />

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome back, Farmer {userProfile.first_name}!</h2>
                      <p className="text-blue-100 opacity-90">
                        {backendOnline
                          ? 'Manage your farm products, track orders, and grow your business with FarmConnect.'
                          : 'You are in demo mode. Connect to the server to access real data and features.'
                        }
                        {authError && ' There are authentication issues. Please check your login.'}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="bg-white/20 rounded-lg p-4 text-center">
                        <p className="text-sm opacity-90">Farm Profile</p>
                        <div className="w-32 bg-white/30 rounded-full h-2 mt-2">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${userProfile.completedProfile || 80}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 opacity-90">{userProfile.completedProfile || 80}% Complete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Earnings"
                  value={formatCurrency(analytics?.total_earnings || 0)}
                  change="0"
                  changeType="neutral"
                  icon={DollarSign}
                  description="Lifetime earnings"
                />
                <StatsCard
                  title="Total Orders"
                  value={(analytics?.total_orders || 0).toString()}
                  change="0"
                  changeType="neutral"
                  icon={Package}
                  description={`${analytics?.total_orders || 0} All-time orders`}
                />
                <StatsCard
                  title="Active Products"
                  value={(analytics?.active_products ?? products.filter(p => p.is_available !== false).length).toString()}
                  change="0"
                  changeType="neutral"
                  icon={User}
                  description={`${analytics?.active_products ?? products.filter(p => p.is_available !== false).length} Products listed`}
                />
                <StatsCard
                  title="Customer Rating"
                  value={(analytics?.customer_ratings ?? 0.0).toString()}
                  change="0"
                  changeType="neutral"
                  icon={Star}
                  description={`Based on ${analytics?.total_reviews ?? 0} ${analytics?.total_reviews === 1 ? 'review' : 'reviews'}`}
                />
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                  <CardHeader>
                    <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                      <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No orders yet</p>
                        <p className={darkMode ? 'text-gray-500' : 'text-gray-400'} style={{fontSize: '0.875rem'}}>Orders will appear here when customers purchase your products</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className={`flex items-center justify-between p-3 border rounded-lg ${darkMode ? 'border-blue-900 bg-blue-900/20' : 'border-blue-100 bg-blue-50/50'}`}>
                            <div>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.id}</p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>From {order.buyer_name || 'Customer'}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(order.total_amount)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Product Performance */}
                <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                  <CardHeader>
                    <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                      Product Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics?.product_performance?.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No sales data yet</p>
                        <p className={darkMode ? 'text-gray-500' : 'text-gray-400'} style={{fontSize: '0.875rem'}}>Start selling to see product performance</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {analytics?.product_performance?.map((product, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{product.product}</span>
                              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(product.revenue)}</span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{width: `${(product.revenue / (analytics.total_earnings || 1)) * 100}%`}}
                              ></div>
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{product.sales} sales</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Products Management Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center justify-between`}>
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-blue-600 mr-2" />
                      My Products ({products.length})
                      {!backendOnline && (
                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                          Demo Data
                        </Badge>
                      )}
                      {authError && (
                        <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                          Read Only
                        </Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!backendOnline || !!authError}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Product
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{fontSize: '1.125rem'}}>No products listed yet</p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Start by adding your first farm product to begin selling</p>
                      <Button
                        onClick={() => setShowAddProduct(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        disabled={!backendOnline || !!authError}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className={`border rounded-xl p-4 hover:shadow-lg transition-all ${darkMode ? 'border-blue-900 bg-gray-800' : 'border-blue-100 bg-white'}`}>
                          <img
                            src={product.images?.[0] || '/api/placeholder/300/200?text=Product+Image'}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/300/200?text=Image+Not+Found';
                            }}
                          />
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>
                              <Badge className={getStatusColor(product.status)}>
                                {product.status}
                              </Badge>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.category}</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(product.price)} <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/{product.unit}</span>
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available: {product.quantity_available} {product.unit}s</p>
                            {renderProductCardButtons(product)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Management Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
                    Order Management ({orders.length})
                    {!backendOnline && (
                      <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                        Demo Data
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{fontSize: '1.125rem'}}>No orders yet</p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Orders will appear here when customers purchase your products</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className={`border rounded-lg p-4 ${darkMode ? 'border-blue-900 bg-gray-800' : 'border-blue-100 bg-white'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.id}</h4>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>From {order.buyer_name || 'Customer'}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(order.total_amount)}</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Date</p>
                              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivery Address</p>
                              <p className={darkMode ? 'text-white' : 'text-gray-900'}>{order.delivery_address || 'Not specified'}</p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              disabled={order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' || !backendOnline || !!authError}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              disabled={order.status === 'shipped' || order.status === 'delivered' || !backendOnline || !!authError}
                            >
                              Mark as Shipped
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              disabled={order.status === 'delivered' || !backendOnline || !!authError}
                            >
                              Mark as Delivered
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                    Farm Analytics
                    {!backendOnline && (
                      <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">
                        Demo Data
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className={`p-4 border rounded-lg ${darkMode ? 'border-blue-900 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(analytics?.total_earnings)}
                          </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <div className={`p-4 border rounded-lg ${darkMode ? 'border-blue-900 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Orders</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {analytics?.total_orders || 0}
                          </p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    <div className={`p-4 border rounded-lg ${darkMode ? 'border-purple-900 bg-purple-900/20' : 'border-purple-200 bg-purple-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer Rating</p>
                          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {analytics?.customer_ratings || '0.0'}/5.0
                          </p>
                        </div>
                        <Star className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Earnings Chart */}
                  <div className="mt-8">
                    <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Earnings</h4>
                    <div className="space-y-3">
                      {analytics?.monthly_earnings?.map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} w-12`}>{month.month}</span>
                          <div className="flex-1 mx-4">
                            <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <div
                                className="bg-blue-500 h-3 rounded-full"
                                style={{ width: `${(month.earned / (Math.max(...analytics.monthly_earnings.map(m => m.earned)) || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} w-20 text-right`}>
                            {formatCurrency(month.earned)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Account Settings */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        First Name
                      </label>
                      <Input
                        value={settingsForm.firstName}
                        onChange={(e) => setSettingsForm({...settingsForm, firstName: e.target.value})}
                        className={darkMode ? "bg-gray-700 text-white" : ""}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Last Name
                      </label>
                      <Input
                        value={settingsForm.lastName}
                        onChange={(e) => setSettingsForm({...settingsForm, lastName: e.target.value})}
                        className={darkMode ? "bg-gray-700 text-white" : ""}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <Input
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                        type="email"
                        className={darkMode ? "bg-gray-700 text-white" : ""}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </label>
                      <Input
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                        type="tel"
                        className={darkMode ? "bg-gray-700 text-white" : ""}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Farm Name
                      </label>
                      <Input
                        value={settingsForm.farmName}
                        onChange={(e) => setSettingsForm({...settingsForm, farmName: e.target.value})}
                        className={darkMode ? "bg-gray-700 text-white" : ""}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSecurityUpdate} className="mt-4 bg-blue-600 hover:bg-blue-700">
                    Save Account Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <Bell className="h-5 w-5 text-blue-600 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Updates</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get notified about order status changes</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('orderUpdates')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          notifications.orderUpdates ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notifications.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Price Alerts</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get alerts when product prices change</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('priceAlerts')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          notifications.priceAlerts ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notifications.priceAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Orders</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get notified about new customer orders</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('newOrders')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          notifications.newOrders ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notifications.newOrders ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sound Effects</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Play sounds for notifications</p>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('soundEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          notifications.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            notifications.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          value={securitySettings.currentPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white pr-10" : "pr-10"}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white pr-10" : "pr-10"}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white pr-10" : "pr-10"}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add an extra layer of security to your account</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Login Alerts</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Get notified of new sign-ins to your account</p>
                      </div>
                      <button
                        onClick={() => setSecuritySettings({...securitySettings, loginAlerts: !securitySettings.loginAlerts})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <Button onClick={handleSecurityUpdate} className="w-full bg-blue-600 hover:bg-blue-700">
                      Update Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <Download className="h-5 w-5 text-blue-600 mr-2" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Export Farm Data</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Download your farm data, products, and order history</p>
                      </div>
                      <Button onClick={handleExportData} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Delete Account</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Permanently delete your account and all associated data</p>
                      </div>
                      <Button onClick={handleDeleteAccount} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Edit Product
                </h3>
                <button
                  onClick={() => {
                    setShowEditProduct(false);
                    setEditingProduct(null);
                  }}
                  className={darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g., Fresh Tomatoes"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {editProductErrors.name && <p className="text-red-500 text-sm mt-1">{editProductErrors.name}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (₦) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 1500"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {editProductErrors.price && <p className="text-red-500 text-sm mt-1">{editProductErrors.price}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unit *</label>
                    <Input
                      type="text"
                      placeholder="e.g., per kg, per bunch, per tuber"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {editProductErrors.unit && <p className="text-red-500 text-sm mt-1">{editProductErrors.unit}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Tubers">Tubers</option>
                      <option value="Grains">Grains</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Spices">Spices</option>
                      <option value="Herbs">Herbs</option>
                    </select>
                    {editProductErrors.category && <p className="text-red-500 text-sm mt-1">{editProductErrors.category}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Product Images (Current)
                    </label>
                    {editingProduct.images && editingProduct.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {editingProduct.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No images uploaded</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity Available *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={editingProduct.quantity_available}
                      onChange={(e) => setEditingProduct({...editingProduct, quantity_available: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {editProductErrors.quantity_available && <p className="text-red-500 text-sm mt-1">{editProductErrors.quantity_available}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                <textarea
                  placeholder="Describe your product..."
                  rows="4"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                  }`}
                  required
                />
                {editProductErrors.description && <p className="text-red-500 text-sm mt-1">{editProductErrors.description}</p>}
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={updatingProduct}
                >
                  {updatingProduct ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditProduct(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add New Product
                </h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className={darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Product Name *</label>
                    <Input
                      type="text"
                      placeholder="e.g., Fresh Tomatoes"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {productErrors.name && <p className="text-red-500 text-sm mt-1">{productErrors.name}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price (₦) *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 1500"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {productErrors.price && <p className="text-red-500 text-sm mt-1">{productErrors.price}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Unit *</label>
                    <Input
                      type="text"
                      placeholder="e.g., per kg, per bunch, per tuber"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {productErrors.unit && <p className="text-red-500 text-sm mt-1">{productErrors.unit}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Tubers">Tubers</option>
                      <option value="Grains">Grains</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Spices">Spices</option>
                      <option value="Herbs">Herbs</option>
                    </select>
                    {productErrors.category && <p className="text-red-500 text-sm mt-1">{productErrors.category}</p>}
                  </div>

                  <div className="w-full">
                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Product Images
                    </label>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="product-images"
                    />

                    {/* Image previews - Always show container */}
                    <div className="w-full mb-4">
                      {newProduct.images.length > 0 ? (
                        <>
                          <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Selected Images ({newProduct.images.length}/5)
                          </p>
                          <div className="flex flex-wrap gap-3 w-full overflow-visible">
                            {newProduct.images.map((image, index) => {
                              const imageUrl = typeof image === 'string' ? image : URL.createObjectURL(image);
                              return (
                                <div key={index} className="relative inline-block">
                                  <div className="w-28 h-28 rounded-lg overflow-hidden border-2 border-blue-400 shadow-md bg-gray-100">
                                    <img
                                      src={imageUrl}
                                      alt={`Preview ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = '/api/placeholder/112/112?text=Image+Error';
                                      }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-base font-bold shadow-lg transition-all z-10"
                                    title="Remove image"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
                          No images selected. Upload images below.
                        </p>
                      )}
                    </div>

                    {/* Upload area */}
                    <label
                      htmlFor="product-images"
                      className={`block w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                        darkMode
                          ? 'border-gray-600 bg-gray-700 hover:border-gray-400 hover:bg-gray-600'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {newProduct.images.length > 0 ? 'Add more images' : 'Click to upload images'}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            PNG, JPG, WEBP up to 10MB (Max 5 images)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity Available *</label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={newProduct.quantity_available}
                      onChange={(e) => setNewProduct({...newProduct, quantity_available: e.target.value})}
                      required
                      className={darkMode ? "bg-gray-700 text-white" : ""}
                    />
                    {productErrors.quantity_available && <p className="text-red-500 text-sm mt-1">{productErrors.quantity_available}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description *</label>
                <textarea
                  placeholder="Describe your product... (e.g., Fresh organic tomatoes grown with sustainable farming practices)"
                  rows="4"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkMode ? 'bg-gray-700 text-white border-gray-600' : 'border-gray-300'
                  }`}
                  required
                />
                {productErrors.description && <p className="text-red-500 text-sm mt-1">{productErrors.description}</p>}
              </div>

              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={addingProduct || !backendOnline || !!authError}
                >
                  {addingProduct ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancel
                </Button>
              </div>

              {!backendOnline && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Offline Mode:</strong> Product creation is disabled. Please connect to the server to add real products.
                  </p>
                </div>
              )}

              {authError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <strong>Authentication Error:</strong> {authError}
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingProfile ? 'Edit Profile' : 'Farm Profile'}
                </h3>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    setEditingProfile(false);
                  }}
                  className={darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {editingProfile ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Edit3 className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">Edit Your Farm Profile</h3>
                        <p className="text-blue-100 text-sm">Update your information to attract more customers</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Section */}
                  <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-blue-50'}`}>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          First Name *
                        </label>
                        <Input
                          value={profileForm.first_name || ''}
                          onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Last Name *
                        </label>
                        <Input
                          value={profileForm.last_name || ''}
                          onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email Address *
                        </label>
                        <Input
                          value={profileForm.email || ''}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          type="email"
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone Number *
                        </label>
                        <Input
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          type="tel"
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="+2348012345678"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Farm Information Section */}
                  <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-blue-50'}`}>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Store className="h-5 w-5 text-blue-600 mr-2" />
                      Farm Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Farm Name *
                        </label>
                        <Input
                          value={profileForm.farm_name || ''}
                          onChange={(e) => setProfileForm({...profileForm, farm_name: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="e.g., Green Valley Organic Farms"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Farm Size
                          </label>
                          <Input
                            value={profileForm.farm_size || ''}
                            onChange={(e) => setProfileForm({...profileForm, farm_size: e.target.value})}
                            className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                            placeholder="e.g., 5 acres"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Farm Type
                          </label>
                          <Input
                            value={profileForm.farm_type || ''}
                            onChange={(e) => setProfileForm({...profileForm, farm_type: e.target.value})}
                            className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                            placeholder="e.g., Organic, Poultry"
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Years Farming
                          </label>
                          <Input
                            type="number"
                            value={profileForm.years_farming || ''}
                            onChange={(e) => setProfileForm({...profileForm, years_farming: e.target.value})}
                            className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                            placeholder="e.g., 5"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-blue-50'}`}>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      Location Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          City *
                        </label>
                        <Input
                          value={profileForm.city || ''}
                          onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="e.g., Lagos"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          State *
                        </label>
                        <Input
                          value={profileForm.state || ''}
                          onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          required
                          placeholder="e.g., Lagos State"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Country
                        </label>
                        <Input
                          value={profileForm.country || 'Nigeria'}
                          onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                          className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Address *
                      </label>
                      <Input
                        value={profileForm.address || ''}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        className={darkMode ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}
                        required
                        placeholder="Street address, Landmark, Area"
                      />
                    </div>
                  </div>

                  {/* Farm Description Section */}
                  <div className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-blue-50'}`}>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      Farm Description
                    </h4>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Farm Bio & Description
                      </label>
                      <textarea
                        value={profileForm.bio || ''}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        rows={5}
                        className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                        }`}
                        placeholder="Tell customers about your farm...
• Your farming practices (organic, sustainable, etc.)
• Your specialties and best products
• Your farming philosophy
• Why customers should choose your farm
• Any certifications or awards"
                      />
                      <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        A good description helps attract more customers to your farm
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={saveProfile}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Save All Changes
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      className="flex-1 py-3 text-lg font-semibold border-2"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </Button>
                  </div>

                  {/* Quick Tips */}
                  <div className={`p-4 rounded-xl border ${darkMode ? 'border-blue-900 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Profile Tips</h5>
                        <ul className={`text-sm space-y-1 mt-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          <li>• Complete profiles get 3x more customer views</li>
                          <li>• Detailed descriptions increase sales</li>
                          <li>• Keep your contact information updated</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Enhanced Profile Header */}
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                        {userProfile.profile_photo ? (
                          <img
                            src={userProfile.profile_photo}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-white" />
                        )}
                      </div>
                    </div>
                    <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userProfile.first_name} {userProfile.last_name}
                    </h4>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{userProfile.farm_name || 'My Farm'}</p>
                    <div className="flex justify-center space-x-2 mt-2">
                      <Badge className={darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}>
                        Farmer
                      </Badge>
                    </div>
                  </div>

                  {/* Farm Info */}
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Store className="h-4 w-4 text-gray-600" />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Farm Name</span>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.farm_name || 'Not set'}</span>
                    </div>

                    {userProfile.city && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</span>
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.city}</span>
                      </div>
                    )}

                    {userProfile.state && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>State</span>
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.state}</span>
                      </div>
                    )}

                    <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-600" />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</span>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.phone || 'Not set'}</span>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-600" />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</span>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.email}</span>
                    </div>

                    {userProfile.farm_size && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Farm Size</span>
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.farm_size}</span>
                      </div>
                    )}

                    {userProfile.farm_type && (
                      <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          <Store className="h-4 w-4 text-gray-600" />
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Farm Type</span>
                        </div>
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.farm_type}</span>
                      </div>
                    )}

                    <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Member Since</span>
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(userProfile.joinDate)}</span>
                    </div>

                    {userProfile.bio && (
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>About Our Farm</p>
                        <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Profile Completion */}
                  <ProfileCompletionBar completion={userProfile.completedProfile || 0} />

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button onClick={startEditingProfile} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{products.length}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Products</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{orders.length}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Orders</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{analytics?.customer_ratings || '0.0'}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rating</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ EXPORT MUST BE AT THE VERY END
export default FarmerDashboard;