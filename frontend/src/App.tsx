import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import LandingNavbar from './components/LandingNavbar'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import CheckoutCancel from './pages/CheckoutCancel'
import CartDrawer from './components/CartDrawer'
import Landing from './pages/Landing'
import Editorial from './pages/Editorial'
import About from './pages/About'
import Account from './pages/Account'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminProducts from './admin/AdminProducts'
import AdminOrders from './admin/AdminOrders'
import AdminCustomers from './admin/AdminCustomers'
import ProtectedRoute from './admin/ProtectedRoute'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AuthProvider>
          <CartProvider>
        <ToastProvider>
          <div className="min-h-screen bg-white dark:bg-mosaik-dark-bg transition-colors">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="customers/:id" element={<AdminCustomers />} />
            </Route>
            <Route path="/" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <Landing />
            </>
          } />
          <Route path="/shop" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <ProductList />
              </div>
            </>
          } />
          <Route path="/shop/:id" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <ProductDetail />
              </div>
            </>
          } />
          <Route path="/editorial" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <Editorial />
            </>
          } />
          <Route path="/account" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <Account />
            </>
          } />
          <Route path="/about" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <About />
            </>
          } />
          <Route path="/cart" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <Cart />
              </div>
            </>
          } />
          <Route path="/checkout" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <Checkout />
              </div>
            </>
          } />
          <Route path="/checkout/success" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <CheckoutSuccess />
              </div>
            </>
          } />
          <Route path="/checkout/cancel" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <CheckoutCancel />
              </div>
            </>
          } />
          </Routes>
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
          </div>
        </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}

export default App
