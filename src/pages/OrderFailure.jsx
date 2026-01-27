import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderFailure = () => {
  const location = useLocation();
  const message = location.state?.message || 'Payment failed or was cancelled.';

  return (
    <div className="w-full py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-900">Payment Failed</h1>
          <p className="mt-2 text-sm text-red-800">{message}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/cart" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Back to cart</Link>
          <Link to="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderFailure;
