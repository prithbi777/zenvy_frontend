import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';
import { Heart, ShoppingCart } from 'lucide-react';

const getOptimizedImageUrl = (url) => {
  if (!url) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
};

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isWishlisted = product?._id ? isInWishlist(product._id) : false;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please login yourself to continue shopping');
      return;
    }
    if (isWishlisted) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  return (
    <div className="group relative">
      <Link
        to={`/product/${product._id}`}
        className="relative flex flex-col overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-2"
      >
        {/* compact Image Section */}
        <div className="relative aspect-square w-full overflow-hidden p-2 pb-0">
          <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-slate-50">
            <img
              src={getOptimizedImageUrl(product?.image?.url)}
              alt={product?.name}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105"
              loading="lazy"
            />

            {/* Wishlist Button - High Contrast */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-3 right-3 z-10 h-9 w-9 flex items-center justify-center rounded-xl backdrop-blur-xl transition-all duration-300 shadow-lg ${isWishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white text-slate-900 hover:bg-rose-50 hover:text-rose-500'
                }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Low Stock Badge */}
            {product?.stock < 5 && product?.stock > 0 && (
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-amber-500/90 backdrop-blur-md rounded-lg shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">Low Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Content Section */}
        <div className="p-5 flex flex-col">
          <div className="mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Zenvy Signature</span>
            <h3 className="line-clamp-1 text-lg font-black text-slate-900 tracking-tight transition-colors group-hover:text-indigo-600">
              {product?.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={product?.averageRating || 0} totalReviews={product?.totalReviews || 0} />
          </div>

          {/* Bottom Bar: Clean & Compact */}
          <div className="mt-2 pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                ₹{Number(product?.price || 0).toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              disabled={product?.stock <= 0}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isAuthenticated) {
                  alert('Please sign in to continue');
                  return;
                }
                await addItem(product._id, 1);
              }}
              className="h-11 w-11 flex items-center justify-center bg-slate-900 rounded-xl text-white transition-all duration-300 hover:bg-indigo-600 active:scale-90 disabled:bg-slate-100 disabled:text-slate-300 shadow-lg shadow-slate-100"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
