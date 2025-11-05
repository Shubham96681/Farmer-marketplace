import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import { Input } from "../components/ui/input";
import axios from 'axios';

import {
  ShoppingCart,
  DollarSign,
  Package,
  Heart,
  Search,
  Plus,
  Minus,
  Eye,
  MapPin,
  Calendar,
  ShoppingBag,
  Star,
  Truck,
  LogOut,
  Leaf,
  User,
  Filter,
  Bell,
  MessageCircle,
  HelpCircle,
  Settings,
  CreditCard,
  Home,
  UserCircle,
  Phone,
  Mail,
  Edit3,
  ShieldCheck,
  Gift,
  X,
  Moon,
  Sun,
  Download,
  Shield,
  Trash2,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

const BuyerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [activePromotions, setActivePromotions] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  // ✅ BACKEND INTEGRATION CONSTANTS
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8002';
  const API_BASE = `${BACKEND_URL}/api`;

  // Use context instead of local state
  const { darkMode, toggleDarkMode, language, changeLanguage } = useTheme();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    priceAlerts: true,
    newProducts: false,
    promotions: true,
    soundEnabled: true
  });

  const [notificationsList, setNotificationsList] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Welcome to FarmConnect!',
      message: 'Start exploring fresh farm products from local farmers.',
      time: '2 hours ago',
      read: false,
      icon: Info
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 10% off on your first order with code WELCOME10',
      time: '1 day ago',
      read: false,
      icon: Gift
    }
  ]);

  const categories = ['all', 'Vegetables', 'Fruits', 'Tubers', 'Grains', 'Dairy', 'Spices', 'Herbs'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'yo', name: 'Yoruba' },
    { code: 'ig', name: 'Igbo' },
    { code: 'ha', name: 'Hausa' }
  ];

  // Get user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // ✅ AUTH HEADERS FUNCTION
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    console.log('🔐 Token from localStorage:', token ? 'Present' : 'Missing');

    if (!token) {
      console.error('❌ No auth token found');
      window.location.href = '/login';
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // ✅ TEST AUTH FUNCTION
  const testAuth = async () => {
    const token = localStorage.getItem('authToken');
    console.log('🔐 Token:', token);

    try {
      const response = await axios.get(`${API_BASE}/auth/debug/check-token`, {
        headers: getAuthHeaders()
      });
      console.log('✅ Token is valid:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error.response?.data);
      return false;
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!currentUser.id) {
        window.location.href = '/login';
        return;
      }

      // Test auth first, then load data
      await testAuth();
      loadData();
    };

    initializeDashboard();
  }, []);

  // Load user profile data
  const loadUserProfile = () => {
    const savedProfile = localStorage.getItem(`userProfile_${currentUser.id}`);
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      setUserProfile({
        ...currentUser,
        joinDate: new Date().toISOString(),
        completedProfile: 85,
        phone: currentUser.phone || '+2348012345678',
        address: currentUser.address || 'No address provided',
        city: currentUser.city || 'Lagos',
        state: currentUser.state || 'Lagos',
        bio: 'FarmConnect buyer who loves fresh local produce!'
      });
    }
  };

  const saveUserProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem(`userProfile_${currentUser.id}`, JSON.stringify(updatedProfile));
  };

  // ✅ UPDATED DATA LOADING FUNCTION
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const headers = getAuthHeaders();

      // Load all data from real API
      // Products can be fetched without auth (public browsing)
      let productsResponse;
      try {
        // Try with auth first if available, otherwise without
        const productHeaders = headers.Authorization ? headers : {};
        productsResponse = await axios.get(`${API_BASE}/products`, {
          headers: productHeaders,
          timeout: 10000
        });
        console.log('✅ Products loaded:', productsResponse.data?.length || 0, 'products');
      } catch (err) {
        console.error('❌ Error loading products:', err.response?.status, err.response?.data || err.message);
        // Try without auth headers if auth failed
        try {
          productsResponse = await axios.get(`${API_BASE}/products`, { timeout: 10000 });
          console.log('✅ Products loaded without auth:', productsResponse.data?.length || 0, 'products');
        } catch (err2) {
          console.error('❌ Products endpoint failed even without auth:', err2.message);
          productsResponse = { data: [] };
        }
      }

      // Only require auth for orders and profile
      if (!headers.Authorization) {
        console.warn('⚠️ No authorization header - loading products only');
        // Set products even without auth
        const productsData = Array.isArray(productsResponse.data) ? productsResponse.data : [];
        setProducts(productsData);
        setLoading(false);
        return;
      }

      const [ordersResponse, profileResponse] = await Promise.all([
        axios.get(`${API_BASE}/orders/my-orders`, { headers }).catch(err => {
          console.log('⚠️ Orders endpoint not working yet - using empty orders list');
          return { data: [] };
        }),
        axios.get(`${API_BASE}/auth/profile`, { headers }).catch(err => {
          console.log('⚠️ Profile endpoint not working yet - using local profile');
          return { data: null };
        })
      ]);

      // Set real data from API
      let productsData = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      
      // Fix image URLs to include full backend URL
      productsData = productsData.map(product => {
        if (product.images && Array.isArray(product.images)) {
          product.images = product.images.map(img => {
            if (typeof img === 'string') {
              return img.startsWith('http') ? img : `${BACKEND_URL}${img}`;
            } else if (img.image_url) {
              return img.image_url.startsWith('http') ? img.image_url : `${BACKEND_URL}${img.image_url}`;
            }
            return img;
          });
        }
        return product;
      });
      
      const ordersData = ordersResponse.data || [];
      
      console.log('📦 Products data:', productsData.length, 'items');
      if (productsData.length > 0) {
        console.log('📦 First product sample:', productsData[0]);
      }
      
      setProducts(productsData);
      setOrders(ordersData);

      // Update user profile with backend data
      if (profileResponse.data) {
        const backendProfile = profileResponse.data;
        const updatedProfile = {
          ...userProfile,
          ...backendProfile,
          first_name: backendProfile.first_name || userProfile.first_name,
          last_name: backendProfile.last_name || userProfile.last_name,
          email: backendProfile.email || userProfile.email,
          phone: backendProfile.phone || userProfile.phone,
          address: backendProfile.address || userProfile.address,
          city: backendProfile.city || userProfile.city,
          state: backendProfile.state || userProfile.state,
          joinDate: backendProfile.created_at || userProfile.joinDate
        };
        setUserProfile(updatedProfile);
        setSettingsForm({
          firstName: updatedProfile.first_name || '',
          lastName: updatedProfile.last_name || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || ''
        });
      } else {
        loadUserProfile();
      }

      // Calculate analytics based on actual data
      const totalSpent = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = ordersData.length;
      const uniqueFarmerIds = new Set(productsData.map(p => p.farmer_id).filter(id => id));
      const favoriteFarmersCount = uniqueFarmerIds.size;
      
      // Set analytics with calculated values
      setAnalytics({
        total_spent: totalSpent,
        total_orders: totalOrders,
        favorite_farmers: favoriteFarmersCount,
        saved_products: favorites.length,
        monthly_spending: [],
        category_spending: [],
        savings: 0,
        carbon_footprint: 0,
        local_support: 0
      });

    } catch (error) {
      console.error('❌ Error loading data:', error);

      // More specific error handling
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.response?.status !== 404 && !error.message.includes('Network Error')) {
        setError('Failed to load data. Please try again.');
      }

      // Initialize empty state for real production
      setProducts([]);
      setOrders([]);
      setAnalytics({
        total_spent: 0,
        total_orders: 0,
        favorite_farmers: 0,
        saved_products: 0,
        monthly_spending: [],
        category_spending: [],
        savings: 0,
        carbon_footprint: 0,
        local_support: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
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
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
      'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
  };

  // Enhanced product filtering and sorting
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name?.localeCompare(b.name);
      }
    });

  // Update favorite_farmers count when products change
  useEffect(() => {
    if (products.length > 0) {
      const uniqueFarmerIds = new Set(products.map(p => p.farmer_id).filter(id => id));
      setAnalytics(prev => ({
        ...prev,
        favorite_farmers: uniqueFarmerIds.size
      }));
    }
  }, [products]);

  // Cart management
  const handleAddToCart = (product, quantity = 1) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
          : item
      ));
    } else {
      const newItem = {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: quantity,
        images: product.images || [],
        farmer_name: product.farmer_name || product.farmer?.farm_name || 'Local Farm',
        total: product.price * quantity
      };
      setCartItems([...cartItems, newItem]);
    }

    // Add to recent activities
    setRecentActivities(prev => [{
      id: Date.now(),
      type: 'cart',
      message: `Added ${product.name} to cart`,
      time: 'Just now',
      icon: ShoppingCart
    }, ...prev.slice(0, 4)]);
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCartItems(cartItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity: quantity, total: quantity * item.price }
          : item
      ));
    }
  };

  const toggleFavorite = (productId) => {
    const updatedFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(updatedFavorites);
    
    // Update analytics with new saved products count
    setAnalytics(prev => ({
      ...prev,
      saved_products: updatedFavorites.length
    }));
  };

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalCartValue = () => {
    return cartItems.reduce((total, item) => total + (item.total || 0), 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  // ✅ UPDATED CHECKOUT FUNCTION
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    try {
      setError('');

      // Prepare order data for API
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        delivery_address: userProfile.address || "Please update your address in profile",
        delivery_type: "standard"
      };

      console.log('📤 Sending order data:', orderData);

      const response = await axios.post(
        `${API_BASE}/orders`,
        orderData,
        { headers: getAuthHeaders() }
      );

      console.log('✅ Order created:', response.data);

      if (response.data) {
        // Success - clear cart and update state
        alert(`Order placed successfully! Order #${response.data.order_number}`);
        setCartItems([]);

        // Reload orders to get the latest data
        const ordersResponse = await axios.get(`${API_BASE}/orders/my-orders`, {
          headers: getAuthHeaders()
        });
        const updatedOrders = ordersResponse.data || [];
        setOrders(updatedOrders);

        // Recalculate analytics based on all orders
        const totalSpent = updatedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        setAnalytics(prev => ({
          ...prev,
          total_orders: updatedOrders.length,
          total_spent: totalSpent
        }));

        // Add to recent activities
        setRecentActivities(prev => [{
          id: Date.now(),
          type: 'order',
          message: `Order #${response.data.order_number} placed successfully`,
          time: 'Just now',
          icon: Package
        }, ...prev.slice(0, 4)]);

        // Add notification
        setNotificationsList(prev => [{
          id: Date.now(),
          type: 'success',
          title: 'Order Placed!',
          message: `Your order #${response.data.order_number} has been placed successfully.`,
          time: 'Just now',
          read: false,
          icon: CheckCircle
        }, ...prev]);

        // Switch to orders tab
        setActiveTab('orders');
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      const errorMessage = error.response?.data?.detail || error.message;
      setError(`Checkout failed: ${errorMessage}`);
      alert(`Checkout failed: ${errorMessage}`);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
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

  // Notification handlers
  const markNotificationAsRead = (notificationId) => {
    setNotificationsList(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotificationsList(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotificationsList(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const unreadNotificationsCount = notificationsList.filter(notif => !notif.read).length;

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const startEditingProfile = () => {
    setProfileForm({ ...userProfile });
    setEditingProfile(true);
    setShowProfile(true);
  };

  // ✅ UPDATED PROFILE SAVING FUNCTION
  const saveProfile = async () => {
    try {
      console.log('💾 Saving profile to backend...', profileForm);

      // Prepare update data for backend
      const updateData = {
        first_name: profileForm.first_name || '',
        last_name: profileForm.last_name || '',
        phone: profileForm.phone || '',
        address: profileForm.address || '',
        city: profileForm.city || '',
        state: profileForm.state || '',
        bio: profileForm.bio || ''
      };

      console.log('📤 Sending profile update:', updateData);

      const response = await axios.put(
        `${API_BASE}/auth/profile`,
        updateData,
        { headers: getAuthHeaders() }
      );

      console.log('✅ Profile update response:', response.data);

      if (response.data.user) {
        // Update localStorage with new user data
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update state with fresh data from backend
        const updatedProfile = {
          ...userProfile,
          ...response.data.user,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          email: response.data.user.email,
          phone: response.data.user.phone,
          address: response.data.user.address,
          city: response.data.user.city,
          state: response.data.user.state,
          bio: response.data.user.bio
        };

        setUserProfile(updatedProfile);
        setEditingProfile(false);
        setShowProfile(false);

        alert('✅ Profile updated successfully!');

        // Update settings form
        setSettingsForm({
          firstName: updatedProfile.first_name || '',
          lastName: updatedProfile.last_name || '',
          email: updatedProfile.email || '',
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || ''
        });
      }

    } catch (error) {
      console.error('❌ Error updating profile:', error.response?.data);
      alert('❌ Error updating profile. Please check all fields.');
    }
  };

  const cancelEditing = () => {
    setEditingProfile(false);
    setProfileForm({});
    setShowProfile(false);
  };

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Initialize settings form when userProfile loads
  useEffect(() => {
    if (userProfile.first_name) {
      setSettingsForm({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile]);

  // ✅ UPDATED SETTINGS SAVE FUNCTION
  const handleSettingsUpdate = async () => {
    try {
      console.log('⚙️ Updating settings via backend...', settingsForm);

      const updateData = {
        first_name: settingsForm.firstName || '',
        last_name: settingsForm.lastName || '',
        phone: settingsForm.phone || '',
        address: settingsForm.address || ''
      };

      console.log('📤 Sending settings update:', updateData);

      const response = await axios.put(
        `${API_BASE}/auth/profile`,
        updateData,
        { headers: getAuthHeaders() }
      );

      console.log('✅ Settings update response:', response.data);

      if (response.data.user) {
        // Update localStorage
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update user profile state
        const updatedProfile = {
          ...userProfile,
          ...response.data.user,
          first_name: response.data.user.first_name,
          last_name: response.data.user.last_name,
          phone: response.data.user.phone,
          address: response.data.user.address
        };
        setUserProfile(updatedProfile);

        alert('✅ Settings updated successfully!');
      }

    } catch (error) {
      console.error('❌ Error updating settings:', error);

      let errorMessage = 'Error updating settings. Please try again.';
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail)
            ? errorData.detail.map(err => err.msg || JSON.stringify(err)).join('\n')
            : errorData.detail;
        }
      }

      alert(`❌ ${errorMessage}`);
    }
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart, badge: null },
    { id: 'cart', label: 'My Cart', icon: ShoppingBag, badge: cartItems.length },
    { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favorites.length },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
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
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>FarmConnect</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Buyer Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center space-x-3 p-3 ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                {userProfile.first_name} {userProfile.last_name}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{userProfile.email}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Badge variant="secondary" className={`text-xs ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                  {userProfile.user_type === 'business' ? 'Business' : 'Individual'}
                </Badge>
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
                {item.badge > 0 && (
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
            onClick={() => startEditingProfile()}
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
                {activeTab === 'dashboard' ? 'Dashboard Overview' :
                 activeTab === 'marketplace' ? 'Farmers Marketplace' :
                 activeTab === 'cart' ? 'Shopping Cart' :
                 activeTab === 'orders' ? 'Order History' :
                 activeTab === 'favorites' ? 'Saved Items' :
                 activeTab === 'help' ? 'Help & Support' :
                 activeTab === 'settings' ? 'Settings' : 'My Profile'}
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {activeTab === 'dashboard' ? 'Welcome back! Here\'s your farming journey summary' :
                 activeTab === 'marketplace' ? 'Discover fresh produce from local farmers' :
                 activeTab === 'cart' ? 'Review and checkout your selected items' :
                 activeTab === 'orders' ? 'Track and manage your purchases' :
                 activeTab === 'favorites' ? 'Your saved farmers and products' :
                 activeTab === 'help' ? 'Get help and support for any issues' :
                 activeTab === 'settings' ? 'Customize your app experience' : 'Manage your account and preferences'}
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

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-xl border z-50`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsList.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notificationsList.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer ${
                                !notification.read ? darkMode ? 'bg-blue-900/20' : 'bg-blue-50' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full ${
                                  notification.type === 'success' ?
                                    darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600' :
                                  notification.type === 'promotion' ?
                                    darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600' :
                                  darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </p>
                                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {notification.message}
                                  </p>
                                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {notification.time}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => setActiveTab('cart')}
                className={`p-2 ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {/* Profile Quick Action */}
              <button
                onClick={() => startEditingProfile()}
                className={`flex items-center space-x-3 p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden md:block">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.first_name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{userProfile.user_type === 'business' ? 'Business' : 'Individual'}</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Only show error if it's a real network error, not just empty data */}
          {error && error.includes('Failed to load data') && (
            <div className={`mb-6 p-4 border rounded-lg ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
              <p className={darkMode ? 'text-red-400' : 'text-red-700'}>{error}</p>
            </div>
          )}

          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Welcome back, {userProfile.first_name}! 👋</h2>
                      <p className="text-blue-100 opacity-90">
                        {orders.length === 0
                          ? "Ready to explore fresh farm produce? Make your first order today!"
                          : `You have ${orders.length} order${orders.length === 1 ? '' : 's'} with us. Keep supporting local farmers!`
                        }
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div className="bg-white/20 rounded-lg p-4 text-center">
                        <p className="text-sm opacity-90">Profile Completion</p>
                        <div className="w-32 bg-white/30 rounded-full h-2 mt-2">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${userProfile.completedProfile}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 opacity-90">{userProfile.completedProfile}% Complete</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Spent"
                  value={formatCurrency(analytics?.total_spent || 0)}
                  change={analytics?.total_spent > 0 ? "+12%" : "0%"}
                  changeType={analytics?.total_spent > 0 ? "positive" : "neutral"}
                  icon={DollarSign}
                  description="Lifetime spending"
                />
                <StatsCard
                  title="Total Orders"
                  value={(analytics?.total_orders || 0).toString()}
                  change={analytics?.total_orders > 0 ? "+5%" : "0%"}
                  changeType={analytics?.total_orders > 0 ? "positive" : "neutral"}
                  icon={Package}
                  description={`${analytics?.total_orders || 0} Completed ${analytics?.total_orders === 1 ? 'purchase' : 'purchases'}`}
                />
                <StatsCard
                  title="Favorite Farmers"
                  value={(analytics?.favorite_farmers || 0).toString()}
                  change={analytics?.favorite_farmers > 0 ? "+2" : "0"}
                  changeType={analytics?.favorite_farmers > 0 ? "positive" : "neutral"}
                  icon={Heart}
                  description={`${analytics?.favorite_farmers || 0} Trusted ${(analytics?.favorite_farmers || 0) === 1 ? 'supplier' : 'suppliers'}`}
                />
                <StatsCard
                  title="Cart Items"
                  value={cartItems.length.toString()}
                  change="0"
                  changeType="neutral"
                  icon={ShoppingCart}
                  description={`${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} ready to checkout`}
                />
              </div>

              {/* Recent Orders */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No orders yet</p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'} style={{fontSize: '0.875rem'}}>Your orders will appear here after you make purchases</p>
                      <Button
                        onClick={() => setActiveTab('marketplace')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className={`flex items-center justify-between p-4 border rounded-lg ${darkMode ? 'border-blue-900 bg-blue-900/20' : 'border-blue-100 bg-blue-50/50'}`}>
                          <div>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order #{order.order_number}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(order.total_amount)}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search for fresh produce, farmers, or categories..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={`pl-10 ${darkMode ? 'border-blue-800 bg-gray-700 text-white focus:border-blue-400' : 'border-blue-200 focus:border-blue-500'}`}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`px-3 py-2 border rounded-lg text-sm focus:border-blue-500 dark:focus:border-blue-400 ${
                          darkMode ? 'border-blue-800 bg-gray-700 text-white' : 'border-blue-200'
                        }`}
                      >
                        <option value="name">Sort by Name</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={darkMode ? "border-blue-800 text-blue-400 hover:bg-blue-900/20" : "border-blue-200 text-blue-600 hover:bg-blue-50"}
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        Filters
                      </Button>

                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className={
                            selectedCategory === category
                              ? "bg-blue-600 hover:bg-blue-700"
                              : darkMode
                              ? "border-blue-800 text-blue-400 hover:bg-blue-900/20"
                              : "border-blue-200 text-blue-600 hover:bg-blue-50"
                          }
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Price Range: ₦{priceRange[0]} - ₦{priceRange[1]}
                          </label>
                          <div className="flex items-center space-x-4">
                            <Input
                              type="number"
                              placeholder="Min"
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                              className={`w-24 ${darkMode ? 'bg-gray-600 text-white' : ''}`}
                            />
                            <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>to</span>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                              className={`w-24 ${darkMode ? 'bg-gray-600 text-white' : ''}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Grid */}
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center">
                      <Leaf className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      Available Products ({filteredProducts.length})
                      {searchTerm && (
                        <span className={`ml-2 text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          for "{searchTerm}"
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{fontSize: '1.125rem'}}>
                        {products.length === 0 ? 'No products available' : 'No products found'}
                      </p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                        {products.length === 0
                          ? 'Farmers haven\'t added any products yet'
                          : 'Try adjusting your search or filters'
                        }
                      </p>
                      <Button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setPriceRange([0, 10000]);
                        }}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product) => {
                        const cartQuantity = getCartItemQuantity(product.id);
                        const isFavorite = favorites.includes(product.id);

                        return (
                          <div key={product.id} className={`group border rounded-xl p-4 hover:shadow-lg transition-all duration-200 ${
                            darkMode ? 'border-blue-900 bg-gray-800' : 'border-blue-100 bg-white'
                          }`}>
                            <div className="relative mb-4">
                              <img
                                src={
                                  product.images?.[0] 
                                    ? (typeof product.images[0] === 'string' 
                                        ? product.images[0] 
                                        : product.images[0].image_url || product.images[0])
                                    : '/api/placeholder/300/200?text=Product+Image'
                                }
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                onClick={() => openProductModal(product)}
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/300/200?text=Product+Image';
                                }}
                              />
                              <div className="absolute top-2 right-2 flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={darkMode ? "bg-gray-800/90 hover:bg-gray-800" : "bg-white/90 hover:bg-white"}
                                  onClick={() => toggleFavorite(product.id)}
                                >
                                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                </Button>
                              </div>
                              {product.rating && (
                                <Badge className={`absolute top-2 left-2 ${
                                  darkMode ? 'bg-yellow-900 text-yellow-300 border-yellow-800' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }`}>
                                  <Star className="h-3 w-3 fill-current mr-1" />
                                  {product.rating}
                                </Badge>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className={`font-semibold text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}
                                    onClick={() => openProductModal(product)}>
                                  {product.name}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.category}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {product.farmer?.farm_name || product.farmer_name || 'Local Farm'}
                                  </span>
                                </div>
                              </div>

                              <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.description}</p>

                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(product.price)}
                                  </span>
                                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>/{product.unit}</span>
                                </div>
                                <span className={`text-sm font-medium ${
                                  product.quantity_available > 10
                                    ? darkMode ? 'text-green-400' : 'text-green-600'
                                    : darkMode ? 'text-orange-400' : 'text-orange-600'
                                }`}>
                                  {product.quantity_available} {product.unit}s available
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                {cartQuantity > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateQuantity(product.id, cartQuantity - 1)}
                                      className={darkMode ? "w-8 h-8 p-0 border-blue-800" : "w-8 h-8 p-0 border-blue-200"}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="font-semibold w-8 text-center text-blue-600 dark:text-blue-400">{cartQuantity}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateQuantity(product.id, cartQuantity + 1)}
                                      className={darkMode ? "w-8 h-8 p-0 border-blue-800" : "w-8 h-8 p-0 border-blue-200"}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddToCart(product, 1)}
                                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                                    disabled={!product.is_available || product.quantity_available === 0}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {!product.is_available || product.quantity_available === 0 ? 'Out of Stock' : 'Add to Cart'}
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"}
                                  onClick={() => openProductModal(product)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                      Shopping Cart ({cartItems.length} items)
                    </div>
                    {cartItems.length > 0 && (
                      <Button
                        onClick={handleCheckout}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Checkout - {formatCurrency(getTotalCartValue())}
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{fontSize: '1.125rem'}}>Your cart is empty</p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Add some fresh products from the marketplace</p>
                      <Button
                        onClick={() => setActiveTab('marketplace')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Browse Marketplace
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Cart Items */}
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.product_id} className={`flex items-center justify-between p-4 border rounded-lg ${
                            darkMode ? 'border-blue-900 bg-gray-800' : 'border-blue-100 bg-white'
                          }`}>
                            <div className="flex items-center space-x-4">
                              <img
                                src={item.images?.[0] || '/api/placeholder/80/80'}
                                alt={item.product_name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.product_name}</h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.farmer_name}</p>
                                <p className="text-blue-600 dark:text-blue-400 font-semibold">{formatCurrency(item.price)}/{item.unit}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                  className={darkMode ? "w-8 h-8 p-0 border-blue-800" : "w-8 h-8 p-0 border-blue-200"}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="font-semibold w-8 text-center text-blue-600 dark:text-blue-400">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                  className={darkMode ? "w-8 h-8 p-0 border-blue-800" : "w-8 h-8 p-0 border-blue-200"}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-right min-w-24">
                                <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.total)}</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.quantity} {item.unit}{item.quantity !== 1 ? 's' : ''}</p>
                              </div>

                              <Button
                                size="sm"
                                variant="ghost"
                                className={darkMode ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-red-600 hover:text-red-700 hover:bg-red-50"}
                                onClick={() => handleRemoveFromCart(item.product_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className={`rounded-lg p-6 border ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <h3 className={`text-lg font-semibold mb-4 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Order Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>{formatCurrency(getTotalCartValue())}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Delivery Fee</span>
                            <span>{formatCurrency(1500)}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Service Fee</span>
                            <span>{formatCurrency(500)}</span>
                          </div>
                          <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                              <span>Total</span>
                              <span>{formatCurrency(getTotalCartValue() + 2000)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 space-y-4">
                          <Button
                            onClick={handleCheckout}
                            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-3 text-lg"
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            Proceed to Checkout - {formatCurrency(getTotalCartValue() + 2000)}
                          </Button>

                          <Button
                            onClick={() => setActiveTab('marketplace')}
                            variant="outline"
                            className={darkMode ? "w-full border-blue-800 text-blue-400 hover:bg-blue-900/20" : "w-full border-blue-200 text-blue-600 hover:bg-blue-50"}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Continue Shopping
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Order History ({orders.length} orders)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{fontSize: '1.125rem'}}>No orders yet</p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Your order history will appear here</p>
                      <Button
                        onClick={() => setActiveTab('marketplace')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className={`border rounded-lg p-6 ${
                          darkMode ? 'border-blue-900 bg-gray-800' : 'border-blue-100 bg-white'
                        }`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className={`font-semibold text-lg ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>Order #{order.order_number}</h3>
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Placed on {formatDate(order.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}>{formatCurrency(order.total_amount)}</p>
                              <Badge className={`${getStatusColor(order.status)} text-sm`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </Badge>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h4 className={`font-medium mb-3 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>Order Items:</h4>
                            <div className="space-y-3">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2">
                                  <div className="flex items-center space-x-3">
                                    <img
                                      src={item.product_image || '/api/placeholder/60/60'}
                                      alt={item.product_name}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                    <div>
                                      <p className={`font-medium ${
                                        darkMode ? 'text-white' : 'text-gray-900'
                                      }`}>{item.product_name}</p>
                                      <p className={`text-sm ${
                                        darkMode ? 'text-gray-400' : 'text-gray-600'
                                      }`}>Quantity: {item.quantity} {item.unit}</p>
                                    </div>
                                  </div>
                                  <p className={`font-semibold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {order.delivery_address && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">{order.delivery_address}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    Saved Items ({favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'} style={{fontSize: '1.125rem'}}>No saved items</p>
                      <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Products you save will appear here</p>
                      <Button
                        onClick={() => setActiveTab('marketplace')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products
                        .filter(product => favorites.includes(product.id))
                        .map((product) => {
                          const cartQuantity = getCartItemQuantity(product.id);

                          return (
                            <div key={product.id} className={`border rounded-xl p-4 ${
                              darkMode ? 'border-blue-900 bg-gray-800' : 'border-blue-100 bg-white'
                            }`}>
                              <div className="relative mb-4">
                                <img
                                  src={product.images?.[0] || '/api/placeholder/300/200'}
                                  alt={product.name}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={darkMode ? "absolute top-2 right-2 bg-gray-800/90 hover:bg-gray-800" : "absolute top-2 right-2 bg-white/90 hover:bg-white"}
                                  onClick={() => toggleFavorite(product.id)}
                                >
                                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <h3 className={`font-semibold text-lg ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>{product.name}</h3>
                                  <p className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>{product.category}</p>
                                </div>

                                <p className={`text-sm line-clamp-2 ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>{product.description}</p>

                                <div className="flex justify-between items-center">
                                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(product.price)}/{product.unit}
                                  </span>
                                  <span className={`text-sm font-medium ${
                                    product.quantity_available > 10
                                      ? darkMode ? 'text-green-400' : 'text-green-600'
                                      : darkMode ? 'text-orange-400' : 'text-orange-600'
                                  }`}>
                                    {product.quantity_available} available
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                                  {cartQuantity > 0 ? (
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateQuantity(product.id, cartQuantity - 1)}
                                        className={darkMode ? "w-8 h-8 p-0 border-blue-800" : "w-8 h-8 p-0 border-blue-200"}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="font-semibold w-8 text-center text-blue-600 dark:text-blue-400">{cartQuantity}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateQuantity(product.id, cartQuantity + 1)}
                                        className={darkMode ? "w-8 h-8                                        p-0 border-blue-800" : "w-8 h-8 p-0 border-blue-200"}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToCart(product, 1)}
                                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                                      disabled={!product.is_available || product.quantity_available === 0}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      {!product.is_available || product.quantity_available === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                  )}

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"}
                                    onClick={() => openProductModal(product)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help & Support Tab */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Help & Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 border rounded-lg ${darkMode ? 'border-blue-800 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                      <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
                      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Chat</h3>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Get instant help from our support team</p>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                        Start Chat
                      </Button>
                    </div>

                    <div className={`p-6 border rounded-lg ${darkMode ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
                      <Phone className="h-8 w-8 text-green-600 dark:text-green-400 mb-4" />
                      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Call Support</h3>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>+234 800-FARM-CONNECT</p>
                      <Button className="mt-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
                        Call Now
                      </Button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      {[
                        {
                          question: "How do I place an order?",
                          answer: "Browse the marketplace, add items to cart, and proceed to checkout."
                        },
                        {
                          question: "What are the delivery options?",
                          answer: "We offer standard delivery within 2-3 business days and express delivery within 24 hours."
                        },
                        {
                          question: "How can I track my order?",
                          answer: "Go to the Orders tab to see real-time updates on your order status."
                        }
                      ].map((faq, index) => (
                        <div key={index} className={`border rounded-lg p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{faq.question}</h4>
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{faq.answer}</p>
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
              <Card className={`${darkMode ? 'bg-gray-800 border-blue-900' : 'bg-white border-blue-100'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          First Name
                        </label>
                        <Input
                          value={settingsForm.firstName}
                          onChange={(e) => setSettingsForm({...settingsForm, firstName: e.target.value})}
                          className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Last Name
                        </label>
                        <Input
                          value={settingsForm.lastName}
                          onChange={(e) => setSettingsForm({...settingsForm, lastName: e.target.value})}
                          className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email
                        </label>
                        <Input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                          className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone
                        </label>
                        <Input
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})}
                          className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Address
                        </label>
                        <Input
                          value={settingsForm.address}
                          onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})}
                          className={darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</h3>
                    <div className="space-y-3">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className={`flex items-center space-x-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </label>
                          <Button
                            variant={value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleNotificationToggle(key)}
                            className={value
                              ? "bg-blue-600 hover:bg-blue-700"
                              : darkMode
                                ? "border-blue-800 text-blue-400 hover:bg-blue-900/20"
                                : "border-blue-200 text-blue-600 hover:bg-blue-50"
                            }
                          >
                            {value ? 'On' : 'Off'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Language & Region</h3>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:border-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      onClick={handleSettingsUpdate}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className={darkMode ? "border-blue-800 text-blue-400 hover:bg-blue-900/20" : "border-blue-200 text-blue-600 hover:bg-blue-50"}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDeleteAccount}
                      className={darkMode ? "border-red-800 text-red-400 hover:bg-red-900/20" : "border-red-200 text-red-600 hover:bg-red-50"}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeProductModal}
                className={`absolute top-4 right-4 z-10 ${
                  darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={
                        selectedProduct.images?.[0] 
                          ? (typeof selectedProduct.images[0] === 'string' 
                              ? selectedProduct.images[0] 
                              : selectedProduct.images[0].image_url || selectedProduct.images[0])
                          : '/api/placeholder/400/300'
                      }
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{selectedProduct.name}</h2>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{selectedProduct.category}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        From: {selectedProduct.farmer?.farm_name || selectedProduct.farmer_name || 'Local Farm'}
                      </span>
                    </div>

                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {selectedProduct.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Price:</span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(selectedProduct.price)}/{selectedProduct.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Available:</span>
                        <span className={`font-medium ${
                          selectedProduct.quantity_available > 10
                            ? darkMode ? 'text-green-400' : 'text-green-600'
                            : darkMode ? 'text-orange-400' : 'text-orange-600'
                        }`}>
                          {selectedProduct.quantity_available} {selectedProduct.unit}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                      {getCartItemQuantity(selectedProduct.id) > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(selectedProduct.id, getCartItemQuantity(selectedProduct.id) - 1)}
                            className={darkMode ? "border-blue-800" : "border-blue-200"}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold w-8 text-center text-blue-600 dark:text-blue-400">
                            {getCartItemQuantity(selectedProduct.id)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(selectedProduct.id, getCartItemQuantity(selectedProduct.id) + 1)}
                            className={darkMode ? "border-blue-800" : "border-blue-200"}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleAddToCart(selectedProduct, 1)}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
                          disabled={!selectedProduct.is_available || selectedProduct.quantity_available === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {!selectedProduct.is_available || selectedProduct.quantity_available === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        onClick={() => toggleFavorite(selectedProduct.id)}
                        className={darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-600 hover:text-red-600"}
                      >
                        <Heart className={`h-4 w-4 ${
                          favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''
                        }`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;