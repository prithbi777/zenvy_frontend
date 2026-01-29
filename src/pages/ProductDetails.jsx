import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck, Zap, RefreshCcw, ShoppingBag, Heart } from 'lucide-react';
import apiService from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import ReviewSection from '../components/ReviewSection';
import StarRating from '../components/StarRating';

const getOptimizedImageUrl = (url) => {
  if (!url) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_1400/');
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getProduct(id);
      setProduct(data.product);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getProduct(id);
        if (!isMounted) return;
        setProduct(data.product);
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load product');
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleReviewSubmitted = () => {
    // Re-fetch product to update rating and review count
    loadProduct();
  };

  const isWishlisted = product ? isInWishlist(product._id) : false;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login yourself to continue shopping');
      return;
    }
    try {
      if (isWishlisted) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (e) {
      console.error("Wishlist toggle error", e);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
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

  if (!product) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="text-sm text-gray-600">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Background Blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12 py-12 lg:py-24">
        {/* Navigation / Breadcrumb - Simple */}
        <div className="flex items-center gap-2 mb-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Catalog</Link>
          <span className="text-slate-200">/</span>
          <span className="text-slate-900">{product?.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Left: Premium Image Gallery Layout */}
          <div className="lg:col-span-7">
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-[48px] bg-slate-50 border border-slate-100 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.1)] group">
                <img
                  src={getOptimizedImageUrl(product?.image?.url)}
                  alt={product?.name}
                  className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                {/* Floating Price Tag on Image - Mobile Only Style */}
                <div className="absolute top-8 left-8 p-6 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-2xl lg:hidden">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Price</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{Number(product?.price || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Features - Grid */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { icon: ShieldCheck, label: "Certified", sub: "Authentic" },
                  { icon: Zap, label: "Swift", sub: "Delivery" },
                  { icon: RefreshCcw, label: "Premium", sub: "Support" }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-100/50 flex flex-col items-center text-center">
                    <item.icon className="h-5 w-5 text-indigo-600 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">{item.label}</span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Editorial Product Details */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100">
                  Zenvy Edition
                </span>
                {product?.stock < 5 && product?.stock > 0 && (
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100 animate-pulse">
                    Limited Supply
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.95] lg:leading-[0.9] mb-8">
                {product?.name}
              </h1>

              <div className="flex items-center gap-6 mb-10 pt-6 border-t border-slate-50">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Valuation</span>
                  <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                    ₹{Number(product?.price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="h-12 w-px bg-slate-100"></div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Rating</span>
                  <StarRating rating={product?.averageRating || 0} totalReviews={product?.totalReviews || 0} size="md" />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Curator's Note</span>
                  <p className="text-lg font-medium text-slate-500 leading-relaxed italic">
                    "{product?.description}"
                  </p>
                </div>

                <div className="p-5 lg:p-6 rounded-2xl lg:rounded-[32px] bg-slate-900 text-white flex items-center justify-between overflow-hidden relative shadow-lg shadow-slate-100">
                  <div className="relative z-10">
                    <span className="block text-[8px] lg:text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Availability Status</span>
                    <span className="text-xs lg:text-sm font-bold uppercase tracking-widest drop-shadow-sm">
                      {product?.stock > 0 ? `Confirmed: ${product.stock} Units` : 'Reserve Full: Out of Stock'}
                    </span>
                  </div>
                  <div className={`h-2.5 w-2.5 lg:h-3 lg:w-3 rounded-full relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)] ${product?.stock > 0 ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>

                  {/* Decorative Background for Stock Box */}
                  <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>

            {/* Action Matrix */}
            <div className="mt-auto pt-8 lg:pt-10 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                disabled={product?.stock <= 0 || isAdding}
                onClick={async () => {
                  if (!isAuthenticated) return alert('Please login yourself to continue shopping');
                  try {
                    setIsAdding(true);
                    await addItem(product._id, 1);
                  } catch (e) {
                    setError(e.message || 'Failed to add to cart');
                  } finally {
                    setIsAdding(false);
                  }
                }}
                className="flex-[4] relative h-16 lg:h-20 group overflow-hidden bg-slate-900 rounded-2xl lg:rounded-[28px] text-white transition-all duration-500 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 shadow-xl shadow-slate-200"
              >
                <div className="relative z-10 flex items-center justify-center gap-3 lg:gap-4 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em]">
                  {isAdding ? (
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 lg:h-5 lg:w-5" />
                      <span>{product?.stock > 0 ? 'Secure Placement' : 'Sold Out'}</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`flex-1 h-16 lg:h-20 flex items-center justify-center rounded-2xl lg:rounded-[28px] border-2 transition-all duration-500 group active:scale-95 ${isWishlisted
                  ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-100'
                  : 'bg-white border-slate-200 text-slate-900 hover:border-slate-900 shadow-md'
                  }`}
              >
                <Heart className={`h-6 w-6 lg:h-7 lg:w-7 transition-all duration-500 group-hover:scale-110 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Matrix */}
        <div className="mt-32">
          <ReviewSection productId={id} onReviewSubmitted={handleReviewSubmitted} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
