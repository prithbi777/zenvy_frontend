import React from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Sparkles, ArrowRight, RefreshCcw } from 'lucide-react';

const Wishlist = () => {
    const { wishlist, isLoading } = useWishlist();

    if (isLoading) {
        return (
            <div className="min-h-[60vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Favorites...</span>
                </div>
            </div>
        );
    }

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="min-h-[80vh] w-full flex flex-col items-center justify-center px-4 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center max-w-md">
                    <div className="mb-10 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
                        <div className="relative h-24 w-24 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center border border-slate-50">
                            <Heart className="h-10 w-10 text-slate-200 fill-slate-50" />
                        </div>
                        <div className="absolute -top-2 -right-2 h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 animate-bounce">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-4">
                        Vault of Desires <br /> <span className="text-indigo-600">is Empty</span>
                    </h2>

                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-relaxed mb-12 px-6">
                        Your curated collection of future acquisitions awaits its first entry.
                    </p>

                    <Link
                        to="/"
                        className="group flex items-center gap-4 h-16 px-10 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 active:scale-95"
                    >
                        Explore Collection
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12 py-12 lg:py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
                            <Heart className="h-3 w-3 fill-indigo-500" />
                            <span>Private Archive / Wishlist</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
                            The Curated <br /> <span className="text-indigo-600 italic">Desires.</span>
                        </h1>
                        <p className="mt-8 text-sm font-medium text-slate-400 uppercase tracking-widest">
                            {wishlist.length} {wishlist.length === 1 ? 'Asset' : 'Assets'} marked for acquisition.
                        </p>
                    </div>

                    <Link
                        to="/"
                        className="group flex items-center gap-4 h-16 px-8 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100"
                    >
                        Back to Gallery
                        <ShoppingBag className="h-4 w-4" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {wishlist.map((product) => (
                        <div key={product._id} className="animate-fade-in group">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-32 p-12 lg:p-20 rounded-[48px] bg-slate-900 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] -mr-64 -mt-64 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none mb-6">
                                Ready to make <br /> <span className="text-indigo-400 italic">them Yours?</span>
                            </h2>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
                                Your curated selections are ready for immediate requisition.
                            </p>
                        </div>
                        <Link
                            to="/cart"
                            className="h-20 px-12 bg-white text-slate-900 rounded-3xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:bg-slate-50 hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                            View Manifest (Cart)
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;

