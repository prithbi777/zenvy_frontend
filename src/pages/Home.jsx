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
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">Zenvy</span>
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-4 max-w-3xl mx-auto font-light">
              Your Premium Destination for Quality Products
            </p>
            <p className="text-lg text-indigo-200 mb-8 max-w-2xl mx-auto">
              Discover curated collections, unbeatable deals, and seamless shopping experiences designed just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#products"
                className="px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Shop Now
              </a>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
                >
                  Join Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </div>

      {/* Products Section */}
      <div className="w-full py-12 bg-gray-50" id="products">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header with Search */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Products</h2>

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
