// Protected Dashboard Routes
<Route
  path="/farmer-dashboard"
  element={
    <ProtectedRoute allowedRoles={['farmer']}>
      <FarmerDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/buyer-dashboard"
  element={
    <ProtectedRoute allowedRoles={['buyer']}>
      <BuyerDashboard />
    </ProtectedRoute>
  }
/>