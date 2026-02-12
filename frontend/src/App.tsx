import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import LandingNavbar from './components/LandingNavbar'
import ProductList from './pages/ProductList'
import Checkout from './pages/Checkout'
import CartDrawer from './components/CartDrawer'
import Landing from './pages/Landing'
import Editorial from './pages/Editorial'
import About from './pages/About'
import Account from './pages/Account'

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Routes>
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
          <Route path="/checkout" element={
            <>
              <LandingNavbar onCartClick={() => setIsCartOpen(true)} />
              <div className="pt-14">
                <Checkout />
              </div>
            </>
          } />
        </Routes>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  )
}

export default App
