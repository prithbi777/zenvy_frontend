import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiService from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getOrder(id);
        if (!isMounted) return;
        setOrder(data.order);
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load order');
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

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-10">
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <h1 className="text-xl font-bold text-green-900">Payment Successful</h1>
          <p className="mt-2 text-sm text-green-800">Your order has been placed successfully.</p>
          <div className="mt-4 text-sm text-gray-700">
            <div><span className="font-medium">Order ID:</span> {order?._id}</div>
            <div className="mt-1"><span className="font-medium">Status:</span> {order?.paymentStatus}</div>
            <div className="mt-1"><span className="font-medium">Total:</span> ₹{Number(order?.totalAmount || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Items</h2>
          <div className="mt-4 space-y-3">
            {(order?.items || []).map((i) => (
              <div key={i.product?._id || String(i.product) || i.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded bg-gray-100">
                    <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{i.name}</div>
                    <div className="text-xs text-gray-500">Qty {i.quantity}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700">₹{Number(i.price || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Link to="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Continue shopping</Link>
            <Link to="/cart" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">View cart</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
