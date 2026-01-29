import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, LogIn, LogOut, Menu, X, Heart, Package, Bell, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useNotifications } from '../contexts/NotificationContext'
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
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [activeDropdown, setActiveDropdown] = useState(null) // 'notif', 'profile', or null

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

  // Close dropdowns on interaction
  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(name)
      setIsMobileMenuOpen(false) // Close mobile menu if opening a dropdown
    }
  }

  useEffect(() => {
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 md:p-4 transition-all duration-300">
      <nav className="glass w-full max-w-7xl rounded-2xl md:rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-500 hover:shadow-[0_8px_40px_rgba(79,70,229,0.12)]">
        <div className="flex h-16 items-center justify-between px-3 md:px-6 lg:px-10">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02]">
            <span className="text-lg md:text-2xl font-black tracking-tight text-slate-800">
              Zenvy<span className="text-indigo-600 text-3xl leading-[0]">.</span>
            </span>
          </Link>



          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Find something special..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyPress}
                className="w-full bg-slate-100/50 border border-transparent rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition-all duration-300 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden lg:flex items-center gap-1 mr-4 border-r border-slate-100 pr-6">
              {isAuthenticated && user?.role?.toLowerCase() === 'admin' && (
                <Link to="/admin/inventory" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                  Stock Inventory
                </Link>
              )}
            </div>

            <div className="flex items-center gap-0.5 md:gap-2">
              {isAuthenticated && (
                <Link to="/wishlist" className="relative p-2 md:p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300">
                  <Heart className="h-5 w-5 md:h-6 md:w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] md:text-[10px] font-bold text-white ring-2 ring-white shadow-md">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/cart" className="relative p-2 md:p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300">
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-[16px] md:min-w-[20px] h-4 md:h-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] md:text-[10px] font-bold text-white ring-2 ring-white shadow-md">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown('notif')}
                    className={`relative p-2 md:p-2.5 rounded-xl transition-all duration-300 ${activeDropdown === 'notif' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <Bell className="h-5 w-5 md:h-6 md:w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-indigo-600 text-[8px] md:text-[9px] font-black text-white ring-2 ring-white shadow-md animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className={`absolute right-0 mt-3 w-80 origin-top-right transition-all duration-300 z-[60] ${activeDropdown === 'notif' ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'}`}>
                    <div className="rounded-[32px] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 mb-4 border-b border-slate-50">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Bulletin</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                            className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest"
                          >
                            Mark All
                          </button>
                        )}
                      </div>

                      <div className="max-h-[360px] overflow-y-auto no-scrollbar space-y-2">
                        {notifications.length === 0 ? (
                          <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                              <Bell className="h-6 w-6 text-slate-200" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No new announcements</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <Link
                              key={notif._id}
                              to={notif.link || '#'}
                              onClick={() => markAsRead(notif._id)}
                              className={`block p-4 rounded-2xl transition-all duration-300 ${notif.isRead ? 'opacity-60 grayscale-[0.5]' : 'bg-slate-50 hover:bg-indigo-50'}`}
                            >
                              <div className="flex gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-200' : 'bg-indigo-600 animate-pulse'}`} />
                                <div className="space-y-1">
                                  <p className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-2">
                                    {notif.title}
                                  </p>
                                  <p className="text-[10px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                                    {notif.message}
                                  </p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                                    {notif.type === 'NEW_PRODUCT' && <Sparkles className="h-2 w-2" />}
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {isAuthenticated && user ? (
                <div className="relative dropdown-container ml-0.5 md:ml-1">
                  <button
                    onClick={() => toggleDropdown('profile')}
                    className={`flex items-center gap-2 p-1 rounded-2xl transition-all duration-300 ${activeDropdown === 'profile' ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className={`h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-[14px] border-2 transition-all duration-300 ${activeDropdown === 'profile' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-100 ring-2 ring-transparent'}`}>
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                          <User className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                      )}
                    </div>
                  </button>

                  <div className={`absolute right-0 mt-3 w-64 origin-top-right transition-all duration-300 z-50 ${activeDropdown === 'profile' ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible pointer-events-none'}`}>
                    <div className="rounded-3xl bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-slate-100">
                      <div className="px-4 py-3 mb-2 bg-slate-50 rounded-2xl">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{user.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-1">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <User className="h-4 w-4" /> Profile
                        </Link>
                        <Link to="/orders/active" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                          <ShoppingCart className="h-4 w-4" /> Orders
                        </Link>
                        {user?.role?.toLowerCase() === 'admin' && (
                          <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            Manage Orders
                          </Link>
                        )}
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <button onClick={handleLogin} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                    Log in
                  </button>
                  <button onClick={handleSignup} className="px-6 py-2.5 rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95">
                    Sign up
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setActiveDropdown(null); // Close dropdowns if mobile menu toggled
                }}
                className={`md:hidden p-2.5 rounded-xl active:scale-90 transition-all ${isMobileMenuOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden absolute left-0 right-0 mt-4 px-4 transition-all duration-300 origin-top transform ${isMobileMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="rounded-[32px] bg-white p-6 shadow-2xl border border-slate-100 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onKeyDown={handleSearchKeyPress}
                onChange={handleSearchChange}
                className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div className="space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl mb-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600 overflow-hidden shadow-lg shadow-indigo-100">
                      {user.profilePhoto ? <img src={user.profilePhoto} className="h-full w-full object-cover" alt="" /> : <User className="h-full w-full p-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-xs font-medium text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" className="flex items-center gap-4 p-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="h-5 w-5 text-indigo-500" /> Profile
                  </Link>
                  <Link to="/orders/active" className="flex items-center gap-4 p-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingCart className="h-5 w-5 text-indigo-500" /> My Orders
                  </Link>
                  {user?.role?.toLowerCase() === 'admin' && (
                    <>
                      <Link to="/admin/orders" className="flex items-center gap-4 p-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>
                        <Package className="h-5 w-5 text-indigo-500" /> Manage Orders
                      </Link>
                      <Link to="/admin/inventory" className="flex items-center gap-4 p-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="h-5 w-5 text-indigo-500" /> Stock Inventory
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-4 p-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl w-full text-left">
                    <LogOut className="h-5 w-5" /> Logout
                  </button>

                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={handleLogin} className="py-4 text-sm font-bold text-slate-600 bg-slate-50 rounded-2xl">Log in</button>
                  <button onClick={handleSignup} className="py-4 text-sm font-bold text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">Sign up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
