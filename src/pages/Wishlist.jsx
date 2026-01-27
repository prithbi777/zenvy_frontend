import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const { wishlist, isLoading } = useWishlist();

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="text-gray-500">Loading wishlist...</div>
            </div>
        );
    }

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[60vh] py-20">
                <div className="mb-4 rounded-full bg-gray-100 p-6">
                    <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Your Wishlist is Empty</h2>
                <p className="mb-8 text-gray-600">Explore products and save your favorites!</p>
                <Link to="/" className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="mb-8 text-2xl font-bold text-gray-900">My Wishlist</h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {wishlist.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
