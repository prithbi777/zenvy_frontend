import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const loadProducts = async (search = '') => {
    try {
      setIsSearching(true);
      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }
      const data = await apiService.getProducts(params);
      setProducts(data.products || []);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query) => {
      loadProducts(query);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    // Cancel any pending search when unmounting or query changing
    return () => { };
  }, [searchQuery, debouncedSearch]);


  const handleSearchClear = () => {
    navigate('/', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-[#0a0a0a]">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-float"></div>
        </div>

        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase">New Season Arrival</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
              Curating <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Excellence</span> <br />
              For Your Lifestyle
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
              Zenvy is your premier destination for high-end fashion, electronics, and home essentials. Experience shopping redefined with quality you can trust.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full sm:w-auto">
              <a
                href="#products"
                className="group relative flex items-center gap-2 px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-lg transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] active:scale-95"
              >
                Start Exploring
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/signup')}
                  className="px-10 py-5 bg-transparent border-2 border-white/10 text-white rounded-2xl font-black text-lg hover:bg-white/5 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  Join the Club
                </button>
              )}
            </div>

            {/* Quick Stats/Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-10 border-t border-white/5 w-full">
              {[
                { label: 'Curated Products', value: '500+' },
                { label: 'Global Shipping', value: 'Fast' },
                { label: 'Happy Customers', value: '10k+' },
                { label: 'Secure Payments', value: '100%' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-white">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="w-full pt-16 md:pt-24 pb-20 md:pb-32 bg-[#f8fafc]" id="products">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 pb-6 border-b border-slate-200">
            <div>
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase mb-2">Our Selection</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Full Collection</h2>
            </div>
            <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-slate-500 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <span className="text-slate-900 whitespace-nowrap">All Products</span>
              <span className="text-slate-200">•</span>
              <span className="hover:text-indigo-600 cursor-pointer transition-colors whitespace-nowrap">Featured</span>
              <span className="text-slate-200">•</span>
              <span className="hover:text-indigo-600 cursor-pointer transition-colors whitespace-nowrap">Latest</span>
            </div>
          </div>



          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Products Found</h2>
              <p className="text-gray-600">
                {searchQuery
                  ? `No products match "${searchQuery}". Try a different search term.`
                  : 'No products available at the moment.'}
              </p>
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="mb-4 text-sm text-gray-600">
                  Found {products.length} product{products.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
              )}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
