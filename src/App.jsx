import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OTPVerification from './pages/OTPVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import ManageInventory from './pages/ManageInventory'
import Cart from './pages/Cart'
import OrderSuccess from './pages/OrderSuccess'
import OrderFailure from './pages/OrderFailure'
import Profile from './pages/Profile'
import ActiveOrders from './pages/ActiveOrders'
import OrderHistory from './pages/OrderHistory'
import AdminOrders from './pages/AdminOrders'
import { WishlistProvider } from './contexts/WishlistContext'
import Wishlist from './pages/Wishlist'
import Chatbot from './components/Chatbot/Chatbot'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen w-full bg-gray-50 flex flex-col">
              {/* Full-width navbar */}
              <Navbar />

              {/* Full-width main wrapper */}
              <main className="flex w-full flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify-otp" element={<OTPVerification />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <div className="w-full flex items-center justify-center py-8">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                          <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard (Protected)
                          </h1>
                          <p className="mt-4 text-gray-600">
                            This is a protected route - only accessible when logged in.
                          </p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } />

                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                      <div className="w-full flex items-center justify-center py-8">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                          <h1 className="text-3xl font-bold text-gray-900">
                            Admin Panel (Admin Only)
                          </h1>
                          <p className="mt-4 text-gray-600">
                            This is an admin-only route - only accessible by admin users.
                          </p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } />

                  <Route
                    path="/admin/inventory"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <ManageInventory />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />

                  <Route path="/wishlist" element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  } />

                  <Route path="/order/success/:id" element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  } />

                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  <Route path="/orders/active" element={
                    <ProtectedRoute>
                      <ActiveOrders />
                    </ProtectedRoute>
                  } />

                  <Route path="/orders/history" element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin/orders" element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminOrders />
                    </ProtectedRoute>
                  } />

                  <Route path="/order/failure" element={<OrderFailure />} />

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Full-width footer */}
              <Footer />

              {/* Floating Chatbot */}
              <Chatbot />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
