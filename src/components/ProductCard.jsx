import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';

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
    <Link
      to={`/product/${product._id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md relative"
    >
      <div className="aspect-4/3 w-full overflow-hidden bg-gray-100 relative">
        <img
          src={getOptimizedImageUrl(product?.image?.url)}
          alt={product?.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 shadow-sm transition-colors backdrop-blur-sm z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className={`h-5 w-5 ${isWishlisted ? 'text-red-500' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">{product?.name}</h3>
          <div className="shrink-0 text-sm font-bold text-indigo-600">₹{Number(product?.price || 0).toFixed(2)}</div>
        </div>

        <div className="mt-1">
          <StarRating rating={product?.averageRating || 0} totalReviews={product?.totalReviews || 0} />
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{product?.description}</p>

        <div className="mt-3 text-xs text-gray-500">
          {product?.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </div>

        <div className="mt-4">
          <button
            type="button"
            disabled={product?.stock <= 0}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAuthenticated) {
                alert('Please login yourself to continue shopping');
                return;
              }
              await addItem(product._id, 1);
            }}
            className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
