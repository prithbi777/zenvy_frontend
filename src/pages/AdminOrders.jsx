import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Search, Filter, Trash2, ArrowRight, User, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const ORDER_STATUS_CONFIG = {
    PLACED: { label: 'Placed', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Package, glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
    PROCESSING: { label: 'Processing', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Clock, glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' },
    SHIPPED: { label: 'Shipped', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Truck, glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Truck, glow: 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' },
    DELIVERED: { label: 'Delivered', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle, glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]' },
    CANCELLED: { label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: XCircle, glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]' }
};

const STATUS_TRANSITIONS = {
    PLACED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: []
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('all');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');

            const params = {};
            if (filter !== 'all' && filter !== 'paid') {
                params.status = filter;
            }
            if (filter === 'paid') {
                params.paymentStatus = 'SUCCESS';
            }

            const response = await api.getAdminOrders(params);
            setOrders(response.orders || []);
        } catch (err) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingOrderId(orderId);
            setError('');
            setSuccess('');

            await api.updateOrderStatus(orderId, newStatus);
            setSuccess(`Order status updated to ${ORDER_STATUS_CONFIG[newStatus]?.label}`);
            await fetchOrders();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to update order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to permanently DELETE this order from the database? This cannot be undone.')) return;

        try {
            setUpdatingOrderId(orderId);
            setError('');
            setSuccess('');

            await api.deleteAdminOrder(orderId);
            setSuccess('Order removed from database successfully');
            await fetchOrders();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to delete order');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Order Ledger...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
            {/* Dynamic Background Blur */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-slate-200 rounded-full blur-[100px] md:blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-100 rounded-full blur-[100px] md:blur-[150px]"></div>
            </div>

            <div className="relative mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 py-8 md:py-12 lg:py-24">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 lg:mb-16 pb-12 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
                            <Clock className="h-3 w-3" />
                            <span>System Operations / Fulfillment</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
                            Order Ledger
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-14 md:h-16 px-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Entries</span>
                            <span className="text-xl md:text-2xl font-black text-slate-900">{orders.length}</span>
                        </div>
                    </div>
                </div>

                {/* Filter Matrix */}
                <div className="mb-12 flex flex-wrap gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {[
                        { key: 'all', label: 'All Operations' },
                        { key: 'paid', label: 'Verified Payments' },
                        { key: 'PLACED', label: 'New Orders' },
                        { key: 'PROCESSING', label: 'In Processing' },
                        { key: 'SHIPPED', label: 'In Transit' },
                        { key: 'DELIVERED', label: 'Completed' },
                        { key: 'CANCELLED', label: 'Aborted' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`h-12 md:h-14 px-6 md:px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 whitespace-nowrap min-w-[140px] md:min-w-[160px] ${filter === key
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-8 p-4 md:p-6 rounded-[24px] md:rounded-[28px] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <XCircle className="h-5 w-5 bg-rose-500 text-white rounded-full p-1 shadow-lg" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-8 p-4 md:p-6 rounded-[24px] md:rounded-[28px] bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                        <CheckCircle className="h-5 w-5 bg-emerald-500 text-white rounded-full p-1 shadow-lg" />
                        {success}
                    </div>
                )}

                {/* Order Feed */}
                {orders.length === 0 ? (
                    <div className="py-24 md:py-40 text-center border-2 border-dashed border-slate-100 rounded-[32px] md:rounded-[48px]">
                        <Package className="h-12 md:h-16 w-12 md:w-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Zero Commissions Found</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-loose max-w-sm mx-auto px-6">
                            The system reports no active transactions matching your current selection parameters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 md:gap-12">
                        {orders.map((order) => {
                            const StatusIcon = ORDER_STATUS_CONFIG[order.orderStatus]?.icon || Package;
                            const statusColor = ORDER_STATUS_CONFIG[order.orderStatus]?.color || 'text-slate-400';
                            const statusBg = ORDER_STATUS_CONFIG[order.orderStatus]?.bg || 'bg-slate-50';
                            const statusBorder = ORDER_STATUS_CONFIG[order.orderStatus]?.border || 'border-slate-100';
                            const statusGlow = ORDER_STATUS_CONFIG[order.orderStatus]?.glow || '';

                            return (
                                <div key={order._id} className="group relative bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 hover:border-indigo-100 transition-all duration-700 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-12">
                                        {/* Entry Header: Summary & Customer */}
                                        <div className="lg:col-span-4 p-6 md:p-8 lg:p-10 bg-slate-50/50 border-b lg:border-b-0 lg:border-r border-slate-50">
                                            <div className="flex flex-col h-full">
                                                <div className="mb-8 md:mb-10">
                                                    <span className="block text-[8px] font-black tracking-[0.3em] uppercase text-slate-400 mb-2">Entry ID</span>
                                                    <p className="text-[10px] font-black text-slate-900 bg-white p-3 rounded-xl border border-slate-100 font-mono inline-block break-all max-w-full">
                                                        {order._id}
                                                    </p>
                                                </div>

                                                <div className="space-y-6 flex-1">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer / Agent</span>
                                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{order.user?.name || 'Anonymous User'}</h4>
                                                            <p className="text-[10px] font-bold text-indigo-500 mt-1 truncate">{order.user?.email || 'N/A'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Target Coordinates</span>
                                                            <p className="text-[10px] font-medium text-slate-600 leading-relaxed uppercase tracking-widest">
                                                                {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                                                                {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-10 pt-10 border-t border-slate-100">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-2">
                                                        <div>
                                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Valuation</span>
                                                            <p className="text-2xl font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                                                        </div>
                                                        <div className="sm:text-right">
                                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Timestamp</span>
                                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Entry Content: Items & Operations */}
                                        <div className="lg:col-span-8 p-6 md:p-8 lg:p-10 flex flex-col">
                                            {/* Top Bar: Statuses */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 md:mb-12">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                                    <div className="w-full sm:w-auto">
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Transit Status</span>
                                                        <div className={`flex items-center gap-3 px-4 md:px-6 h-12 rounded-2xl border-2 ${statusBg} ${statusBorder} ${statusColor} ${statusGlow}`}>
                                                            <StatusIcon className="h-4 w-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                                {ORDER_STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full sm:w-auto">
                                                        <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Payment Audit</span>
                                                        <div className={`flex items-center gap-2 px-4 md:px-6 h-12 rounded-2xl border-2 ${order.paymentStatus === 'SUCCESS' ? 'border-emerald-100 text-emerald-600 bg-emerald-50/50' : 'border-rose-100 text-rose-600 bg-rose-50/50'}`}>
                                                            <CreditCard className="h-4 w-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{order.paymentStatus}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteOrder(order._id)}
                                                    className="h-12 w-full sm:w-12 flex items-center justify-center bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-2xl transition-all duration-300 group/del shadow-sm active:scale-95"
                                                    title="Purge Entry"
                                                >
                                                    <Trash2 className="h-4 w-4 transition-transform group-hover/del:scale-110" />
                                                </button>
                                            </div>

                                            {/* Manifest: Items */}
                                            <div className="flex-1 mb-10">
                                                <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Manifest / Inventory Impact</span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-4 rounded-[24px] bg-slate-50/30 border border-slate-50 group/item hover:bg-white hover:border-slate-100 transition-all">
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={item.imageUrl || "https://res.cloudinary.com/demo/image/upload/v1633036643/product_placeholder.png"}
                                                                    alt={item.name}
                                                                    className="w-12 md:w-16 h-12 md:h-16 object-cover rounded-2xl shadow-sm transition-transform group-hover/item:scale-105"
                                                                />
                                                                <div className="absolute -top-2 -right-2 h-5 md:h-6 w-5 md:w-6 bg-slate-900 text-white text-[9px] md:text-[10px] font-black flex items-center justify-center rounded-lg border-2 border-white shadow-md">
                                                                    {item.quantity}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{item.name}</h5>
                                                                <p className="text-[12px] font-bold text-slate-400 mt-1">{formatCurrency(item.price)} <span className="text-[8px] text-slate-300">/ Unit</span></p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Operation Control */}
                                            {order.paymentStatus === 'SUCCESS' && STATUS_TRANSITIONS[order.orderStatus]?.length > 0 && (
                                                <div className="pt-8 border-t border-slate-50 mt-auto">
                                                    <span className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 uppercase">Control Operations / State Change</span>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        {STATUS_TRANSITIONS[order.orderStatus].map((status) => {
                                                            const isCancel = status === 'CANCELLED';
                                                            return (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleStatusUpdate(order._id, status)}
                                                                    disabled={updatingOrderId === order._id}
                                                                    className={`flex-1 min-h-[56px] px-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 disabled:grayscale ${isCancel
                                                                        ? 'bg-white border-rose-100 border-2 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-100 hover:border-rose-500'
                                                                        : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100'
                                                                        }`}
                                                                >
                                                                    {updatingOrderId === order._id ? (
                                                                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-center">Commit: {ORDER_STATUS_CONFIG[status]?.label}</span>
                                                                            <ArrowRight className="h-4 w-4 flex-shrink-0" />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
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


