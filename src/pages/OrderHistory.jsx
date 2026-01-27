import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ORDER_STATUS_CONFIG = {
    PLACED: { label: 'Placed', color: 'bg-blue-100 text-blue-800', icon: '📦' },
    PROCESSING: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: '⚙️' },
    SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: '🚛' },
    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
};

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, delivered, cancelled

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const fetchOrderHistory = async () => {
        try {
            setLoading(true);
            setError('');
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

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return !['DELIVERED', 'CANCELLED'].includes(order.orderStatus);
        if (filter === 'delivered') return order.orderStatus === 'DELIVERED';
        if (filter === 'cancelled') return order.orderStatus === 'CANCELLED';
        return true;
    });

    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
                    <p className="mt-2 text-gray-600">View all your past orders</p>
                    <div className="mt-4">
                        <Link
                            to="/orders/active"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            ← Back to Active Orders
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'All Orders' },
                        { key: 'active', label: 'Active' },
                        { key: 'delivered', label: 'Delivered' },
                        { key: 'cancelled', label: 'Cancelled' }
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === key
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? "You haven't placed any orders yet."
                                : `No ${filter} orders found.`}
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Order ID</p>
                                            <p className="font-mono font-semibold text-gray-900 text-sm">{order._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Order Date</p>
                                            <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Total Amount</p>
                                            <p className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Status</p>
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${ORDER_STATUS_CONFIG[order.orderStatus]?.color || 'bg-gray-100 text-gray-800'
                                                }`}>
                                                <span>{ORDER_STATUS_CONFIG[order.orderStatus]?.icon}</span>
                                                {ORDER_STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            📍 Shipping Address
                                        </h3>
                                        <p className="text-sm text-gray-800">
                                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{order.shippingAddress.country}</p>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                                    <div className="space-y-4">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-2xl">📦</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatCurrency(item.price)} each
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Footer */}
                                {order.paidAt && (
                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            Paid on: {formatDate(order.paidAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
