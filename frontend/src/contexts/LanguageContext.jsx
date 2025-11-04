import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome back",
    totalSpent: "Total Spent",
    totalOrders: "Total Orders",
    favoriteFarmers: "Favorite Farmers",
    cartItems: "Cart Items",
    recentOrders: "Recent Orders",
    noOrders: "No orders yet",
    startShopping: "Start Shopping",
    marketplace: "Marketplace",
    availableProducts: "Available Products",
    searchPlaceholder: "Search for fresh produce...",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    details: "Details",
    shoppingCart: "Shopping Cart",
    cartEmpty: "Your cart is empty",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
  },
  fr: {
    dashboard: "Tableau de bord",
    welcome: "Bon retour",
    totalSpent: "Total Dépensé",
    totalOrders: "Commandes Totales",
    favoriteFarmers: "Agriculteurs Favoris",
    cartItems: "Articles Panier",
    recentOrders: "Commandes Récentes",
    noOrders: "Aucune commande pour le moment",
    startShopping: "Commencer les Achats",
  },
  es: {
    dashboard: "Panel de Control",
    welcome: "Bienvenido de nuevo",
    totalSpent: "Total Gastado",
    totalOrders: "Pedidos Totales",
    favoriteFarmers: "Agricultores Favoritos",
    cartItems: "Artículos del Carrito",
    recentOrders: "Pedidos Recientes",
    noOrders: "Aún no hay pedidos",
    startShopping: "Comenzar a Comprar",
  },
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
