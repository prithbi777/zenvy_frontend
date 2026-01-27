import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    <div className="w-full py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <img
              src={getOptimizedImageUrl(product?.image?.url)}
              alt={product?.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product?.name}</h1>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-xl font-bold text-indigo-600">₹{Number(product?.price || 0).toFixed(2)}</div>
              <StarRating rating={product?.averageRating || 0} totalReviews={product?.totalReviews || 0} size="md" />
            </div>

            <div className="mt-4 text-sm text-gray-600">{product?.description}</div>

            <div className="mt-6">
              <div className="text-sm font-medium text-gray-900">Availability</div>
              <div className={`mt-1 text-sm ${product?.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {product?.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                disabled={product?.stock <= 0}
                onClick={async () => {
                  if (!isAuthenticated) {
                    alert('Please login yourself to continue shopping');
                    return;
                  }
                  try {
                    setIsAdding(true);
                    await addItem(product._id, 1);
                  } catch (e) {
                    setError(e.message || 'Failed to add to cart');
                  } finally {
                    setIsAdding(false);
                  }
                }}
                className="flex-1 rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isAdding ? 'Adding…' : 'Add to Cart'}
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                className={`flex items-center justify-center rounded-md border px-4 py-3 transition-colors ${isWishlisted
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={id} onReviewSubmitted={handleReviewSubmitted} />
      </div>
    </div>
  );
};

export default ProductDetails;
