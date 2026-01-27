import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, LogIn, Menu, X, Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { Link } from 'react-router-dom';


const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()
  const { wishlist } = useWishlist()

  const cartCount = cart?.totalItems || 0
  const wishlistCount = wishlist?.length || 0

  useEffect(() => {
    if (location.pathname === '/') {
      setSearchQuery(searchParams.get('search') || '')
    } else {
      setSearchQuery('')
    }
  }, [location.pathname, searchParams])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value) {
      navigate(`/?search=${encodeURIComponent(value)}`, { replace: location.pathname === '/' })
    } else {
      navigate('/', { replace: location.pathname === '/' })
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/signup')
  }

  return (
    <nav className="w-full bg-white border-b">
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <h1 className="text-2xl font-bold text-indigo-600">
              <Link to="/">Zenvy</Link>
            </h1>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyPress}
                  className="w-64 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 pr-10 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {isAuthenticated && user?.role?.toLowerCase() === 'admin' && (
                <Link to="/admin/inventory" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Manage Inventory
                </Link>
              )}

              {isAuthenticated && (
                <Link to="/wishlist" className="relative text-gray-600 hover:text-indigo-600">
                  <Heart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="font-medium">{user.name}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Profile
                      </Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Wishlist
                      </Link>
                      <Link to="/orders/active" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Active Orders
                      </Link>
                      <Link to="/orders/history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Order History
                      </Link>
                      {user?.role?.toLowerCase() === 'admin' && (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <Link to="/admin/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Manage Orders
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleLogin} className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                  <button onClick={handleSignup} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4">
              <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && (
                <Link to="/wishlist" className="relative text-gray-600 hover:text-indigo-600">
                  <Heart className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 hover:text-indigo-600">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyPress}
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 pr-10 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>

              {isAuthenticated && user?.role?.toLowerCase() === 'admin' && (
                <Link
                  to="/admin/inventory"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Manage Inventory
                </Link>
              )}

              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    {user.profilePhoto ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    My Wishlist
                  </Link>

                  <Link
                    to="/orders/active"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Active Orders
                  </Link>

                  <Link
                    to="/orders/history"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Order History
                  </Link>

                  {user?.role?.toLowerCase() === 'admin' && (
                    <Link
                      to="/admin/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Manage Orders
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleLogin}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                  <button
                    onClick={handleSignup}
                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
