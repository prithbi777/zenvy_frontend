import { useState, useEffect } from 'react';
import api from '../services/api';

const ORDER_STATUS_CONFIG = {
    PLACED: { label: 'Placed', color: 'bg-blue-100 text-blue-800', icon: '📦' },
    PROCESSING: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: '⚙️' },
    SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: '🚛' },
    DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '✅' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
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
    const [selectedOrder, setSelectedOrder] = useState(null);

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

            // Refresh orders
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

            // Refresh orders
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
            <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="mt-2 text-gray-600">Manage and update order statuses</p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {[
                        { key: 'all', label: 'All Orders' },
                        { key: 'paid', label: 'Paid Orders' },
                        { key: 'PLACED', label: 'Placed' },
                        { key: 'PROCESSING', label: 'Processing' },
                        { key: 'SHIPPED', label: 'Shipped' },
                        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                        { key: 'DELIVERED', label: 'Delivered' },
                        { key: 'CANCELLED', label: 'Cancelled' }
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

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-gray-600">No orders match the selected filter.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-600">Order ID</p>
                                            <p className="font-mono font-semibold text-gray-900 text-sm truncate">{order._id}</p>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">Customer</p>
                                                <p className="font-semibold text-gray-900">{order.user?.name || 'N/A'}</p>
                                                <p className="text-sm text-gray-600">{order.user?.email || 'N/A'}</p>
                                                {order.user?.phone && (
                                                    <p className="text-sm text-gray-600">{order.user.phone}</p>
                                                )}
                                            </div>
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
                                            <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${order.paymentStatus === 'SUCCESS'
                                                ? 'bg-green-100 text-green-800'
                                                : order.paymentStatus === 'FAILED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Order Status</p>
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${ORDER_STATUS_CONFIG[order.orderStatus]?.color || 'bg-gray-100 text-gray-800'
                                                }`}>
                                                <span>{ORDER_STATUS_CONFIG[order.orderStatus]?.icon}</span>
                                                {ORDER_STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <button
                                                onClick={() => handleDeleteOrder(order._id)}
                                                disabled={updatingOrderId === order._id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors title='Delete Order'"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="px-6 py-4 bg-indigo-50/50 border-b border-gray-100">
                                        <h3 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                                            📍 Shipping Address
                                        </h3>
                                        <p className="text-sm text-gray-800 font-medium">
                                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                        </p>
                                        <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider font-bold">
                                            {order.shippingAddress.country}
                                        </p>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 pb-3 border-b border-gray-100 last:border-0">
                                                <div className="flex-shrink-0">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-xl">📦</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Status Update Actions */}
                                {order.paymentStatus === 'SUCCESS' && STATUS_TRANSITIONS[order.orderStatus]?.length > 0 && (
                                    <div className="p-6 bg-gray-50">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Order Status</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {STATUS_TRANSITIONS[order.orderStatus].map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(order._id, status)}
                                                    disabled={updatingOrderId === order._id}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${status === 'CANCELLED'
                                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {updatingOrderId === order._id ? (
                                                        <span className="flex items-center gap-2">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Updating...
                                                        </span>
                                                    ) : (
                                                        `Mark as ${ORDER_STATUS_CONFIG[status]?.label}`
                                                    )}
                                                </button>
                                            ))}
                                        </div>
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
