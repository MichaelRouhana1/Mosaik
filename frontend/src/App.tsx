import { useState } from 'react'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProductList from './pages/ProductList'
import CartDrawer from './components/CartDrawer'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCartClick={() => setIsCartOpen(true)}
        />
        <main>
          <ProductList searchQuery={searchQuery} />
        </main>
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartProvider>
  )
}

export default App
