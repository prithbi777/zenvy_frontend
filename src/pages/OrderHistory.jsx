import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, Search, Filter, ArrowLeft, ChevronRight, XCircle, ShoppingBag, CreditCard, Calendar } from 'lucide-react';
import api from '../services/api';

const ORDER_STATUS_CONFIG = {
    PLACED: { label: 'Secured', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Package },
    PROCESSING: { label: 'Refining', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
    SHIPPED: { label: 'In Transit', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck },
    OUT_FOR_DELIVERY: { label: 'Near You', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: Truck },
    DELIVERED: { label: 'Arrived', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle },
    CANCELLED: { label: 'Aborted', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle }
};

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            const response = await api.getOrderHistory();
            setOrders(response.orders || []);
        } catch (err) {
            setError(err.message || 'Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return !['DELIVERED', 'CANCELLED'].includes(order.orderStatus);
        if (filter === 'delivered') return order.orderStatus === 'DELIVERED';
        if (filter === 'cancelled') return order.orderStatus === 'CANCELLED';
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-[60vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Archiving History...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12 py-12 lg:py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pb-12 border-b border-slate-100">
                    <div>
                        <Link to="/orders/active" className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">
                            <ArrowLeft className="h-3 w-3" />
                            <span>Return to Active Logistics</span>
                        </Link>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
                            Purchase Ledger
                        </h1>
                        <p className="mt-6 text-sm font-medium text-slate-400 uppercase tracking-widest">A definitive record of your curated acquisitions.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-16 px-8 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Archive Entries: {filteredOrders.length}</span>
                        </div>
                    </div>
                </div>

                {/* Filter Matrix */}
                <div className="mb-12 flex flex-wrap gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {[
                        { key: 'all', label: 'Complete Archive' },
                        { key: 'active', label: 'Processing' },
                        { key: 'delivered', label: 'Completed' },
                        { key: 'cancelled', label: 'Aborted' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 whitespace-nowrap min-w-[160px] ${filter === key
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-12 p-6 rounded-[28px] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-4">
                        <XCircle className="h-5 w-5 bg-rose-500 text-white rounded-full p-1 shadow-lg" />
                        {error}
                    </div>
                )}

                {filteredOrders.length === 0 ? (
                    <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
                        <ShoppingBag className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Archive Empty</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-loose max-w-sm mx-auto mb-10">
                            No records matching the selected parameters were found in the archive.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-4 h-14 px-10 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-100"
                        >
                            Begin Selection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {filteredOrders.map((order) => {
                            const status = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.PLACED;
                            const Icon = status.icon;

                            return (
                                <div key={order._id} className="group bg-white rounded-[40px] border border-slate-100 hover:border-indigo-100 transition-all duration-700 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-12">
                                        {/* Entry Summary */}
                                        <div className="lg:col-span-4 p-8 lg:p-10 bg-slate-50/50 border-r border-slate-50 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-10">
                                                    <span className="text-[10px] font-black text-slate-900 font-mono bg-white px-3 py-2 rounded-lg border border-slate-100">
                                                        #{order._id.slice(-8).toUpperCase()}
                                                    </span>
                                                    <div className={`px-4 h-8 rounded-full flex items-center gap-2 text-[8px] font-black uppercase tracking-widest border border-current ${status.color} ${status.bg}`}>
                                                        <Icon className="h-3 w-3" />
                                                        <span>{status.label}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Transaction Date</span>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Valuation</span>
                                                        <p className="text-2xl font-black text-slate-900 leading-none">{formatCurrency(order.totalAmount)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-10 pt-10 border-t border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="h-4 w-4 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                        {order.paymentStatus === 'SUCCESS' ? 'Transaction Verified' : 'Pending Verification'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Manifest */}
                                        <div className="lg:col-span-8 p-8 lg:p-10">
                                            <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Archived Manifest</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/30 border border-slate-50 group/item hover:bg-white hover:border-slate-100 transition-all">
                                                        <div className="relative h-14 w-14 flex-shrink-0">
                                                            <img
                                                                src={item.imageUrl || "https://res.cloudinary.com/demo/image/upload/v1633036643/product_placeholder.png"}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover rounded-2xl grayscale group-hover/item:grayscale-0 transition-all duration-500"
                                                            />
                                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-slate-900 text-white text-[8px] font-black flex items-center justify-center rounded-lg border-2 border-white">
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{item.name}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{formatCurrency(item.price)} <span className="text-[8px] opacity-40 font-medium">/ ITEM</span></p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

