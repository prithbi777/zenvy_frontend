import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, ArrowRight, ChevronRight, XCircle, ShoppingBag, CreditCard } from 'lucide-react';
import api from '../services/api';

const ORDER_STATUS_CONFIG = {
    PLACED: { label: 'Secured', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Package, step: 0 },
    PROCESSING: { label: 'Refining', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, step: 1 },
    SHIPPED: { label: 'In Transit', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Truck, step: 2 },
    OUT_FOR_DELIVERY: { label: 'Near You', color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: MapPin, step: 3 },
    DELIVERED: { label: 'Arrived', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle, step: 4 },
    CANCELLED: { label: 'Aborted', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle, step: -1 }
};

const PROGRESS_STEPS = ['PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function ActiveOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActiveOrders();
        const interval = setInterval(fetchActiveOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchActiveOrders = async () => {
        try {
            const response = await api.getActiveOrders();
            setOrders(response.orders || []);
        } catch (err) {
            setError(err.message || 'Failed to load active orders');
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

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to abort this requisition?')) return;
        try {
            setError('');
            await api.cancelOrder(orderId);
            await fetchActiveOrders();
        } catch (err) {
            setError(err.message || 'Failed to cancel order');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Active Logistics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-6 lg:px-12 py-12 lg:py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
                            <Truck className="h-3 w-3" />
                            <span>Logistics / Ongoing Transmissions</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
                            Active Orders
                        </h1>
                        <p className="mt-6 text-sm font-medium text-slate-400 uppercase tracking-widest">Tracking your curated selections in real-time.</p>
                    </div>
                    <Link
                        to="/orders/history"
                        className="group flex items-center gap-4 h-16 px-8 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200"
                    >
                        <span>View Ledger</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {error && (
                    <div className="mb-12 p-6 rounded-[28px] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-4">
                        <XCircle className="h-5 w-5 bg-rose-500 text-white rounded-full p-1" />
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="py-40 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
                        <Package className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Empty Transit</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-loose max-w-sm mx-auto mb-10">
                            You currently have no active logistics being processed.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-4 h-14 px-10 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all hover:shadow-xl hover:shadow-indigo-100"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {orders.map((order) => {
                            const currentStatus = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.PLACED;
                            const currentStep = currentStatus.step;

                            return (
                                <div key={order._id} className="group relative bg-white rounded-[40px] border border-slate-100 overflow-hidden hover:border-indigo-100 transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-indigo-100">
                                    {/* Order Stripe */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-50 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 transition-all duration-1000 ease-out"
                                            style={{ width: `${(currentStep + 1) / PROGRESS_STEPS.length * 100}%` }}
                                        ></div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12">
                                        {/* Coll 1: Order Meta & Progress */}
                                        <div className="lg:col-span-8 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-50">
                                            <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                                                <div>
                                                    <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Transmission ID</span>
                                                    <p className="text-[10px] font-black text-slate-900 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                                        {order._id}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Initiated On</span>
                                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                                                </div>
                                            </div>

                                            {/* Kinetic Timeline */}
                                            <div className="relative py-12">
                                                <div className="absolute top-[50%] left-0 w-full h-[2px] bg-slate-50"></div>
                                                <div className="relative flex justify-between">
                                                    {PROGRESS_STEPS.map((statusKey, idx) => {
                                                        const stepConfig = ORDER_STATUS_CONFIG[statusKey];
                                                        const isCompleted = idx <= currentStep;
                                                        const isCurrent = idx === currentStep;
                                                        const Icon = stepConfig.icon;

                                                        return (
                                                            <div key={statusKey} className="flex flex-col items-center group/step">
                                                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isCompleted
                                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-110'
                                                                    : 'bg-white border-slate-100 text-slate-200'
                                                                    } ${isCurrent ? 'ring-4 ring-indigo-50' : ''}`}>
                                                                    <Icon className="h-4 w-4" />
                                                                </div>
                                                                <span className={`absolute -bottom-8 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                                                    {stepConfig.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Shipping Detail */}
                                            <div className="mt-20 pt-10 border-t border-slate-50">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivery Destination</span>
                                                        <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-relaxed">
                                                            {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                                                            {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coll 2: Items & Total */}
                                        <div className="lg:col-span-4 p-8 lg:p-12 bg-slate-50/30 flex flex-col">
                                            <div className="flex-1 space-y-6 mb-12">
                                                <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Secured Items</span>
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 group/item">
                                                        <div className="relative h-16 w-16 flex-shrink-0 bg-white rounded-2xl border border-slate-100 p-1">
                                                            <img
                                                                src={item.imageUrl || "https://res.cloudinary.com/demo/image/upload/v1633036643/product_placeholder.png"}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
                                                            />
                                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-slate-900 text-white text-[8px] font-black flex items-center justify-center rounded-md border-2 border-white shadow-sm">
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate group-hover/item:text-indigo-600 transition-colors">{item.name}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1">{formatCurrency(item.price)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                                                    <div>
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Valuation</span>
                                                        <p className="text-2xl font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
                                                        <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border border-current ${currentStatus.color} ${currentStatus.bg}`}>
                                                            {currentStatus.label}
                                                        </div>
                                                    </div>
                                                </div>

                                                {['PLACED', 'PROCESSING'].includes(order.orderStatus) && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        className="w-full h-14 bg-white border border-rose-100 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 active:scale-95"
                                                    >
                                                        Abort Requisition
                                                    </button>
                                                )}
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

