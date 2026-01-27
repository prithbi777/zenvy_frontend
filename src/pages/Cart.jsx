import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Cart = () => {
  const { cart, isLoading, error, clearError, setQuantity, removeItem, refresh } = useCart();
  const { user } = useAuth();
  const [busyKey, setBusyKey] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Cart</h1>
          <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-500">Continue shopping</Link>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={clearError} className="text-sm font-medium">Dismiss</button>
            </div>
          </div>
        )}

        {!cart || !cart.items?.length ? (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
            Your cart is empty.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {cart.items.map((i) => (
              <div key={i.product._id} className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded bg-gray-100">
                    <img src={i.product.image?.url} alt={i.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{i.product.name}</div>
                    <div className="mt-1 text-sm text-gray-600">₹{Number(i.product.price || 0).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={i.product.stock}
                    value={i.quantity}
                    disabled={busyKey === i.product._id}
                    onChange={async (e) => {
                      const next = Number(e.target.value);
                      setBusyKey(i.product._id);
                      try {
                        await setQuantity(i.product._id, next);
                      } finally {
                        setBusyKey(null);
                      }
                    }}
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    disabled={busyKey === i.product._id}
                    onClick={async () => {
                      setBusyKey(i.product._id);
                      try {
                        await removeItem(i.product._id);
                      } finally {
                        setBusyKey(null);
                      }
                    }}
                    className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4">
                {paymentError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{paymentError}</div>
                )}
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Items</span>
                  <span>{cart.totalItems}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm font-semibold text-gray-900">
                  <span>Subtotal</span>
                  <span>₹{Number(cart.subtotal || 0).toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  disabled={isPaying}
                  onClick={async () => {
                    try {
                      setPaymentError(null);
                      setIsPaying(true);

                      // Check address before allowing checkout
                      const isAddressComplete = user?.address &&
                        user.address.street?.trim() &&
                        user.address.city?.trim() &&
                        user.address.state?.trim() &&
                        user.address.pincode?.trim();

                      if (!isAddressComplete) {
                        setPaymentError(
                          <span>
                            Please set your shipping address in your{' '}
                            <button
                              onClick={() => navigate('/profile')}
                              className="font-bold underline text-red-800"
                            >
                              profile
                            </button>{' '}
                            before placing an order.
                          </span>
                        );
                        setIsPaying(false);
                        return;
                      }

                      const orderData = await apiService.createRazorpayOrder();
                      const { order_id, amount, currency, key_id } = orderData;

                      const loaded = await loadRazorpayScript();
                      if (!loaded) {
                        await apiService.markPaymentFailed({ razorpay_order_id: order_id, reason: 'Razorpay SDK failed to load' });
                        setPaymentError('Failed to load Razorpay. Please try again.');
                        navigate('/order/failure', { state: { message: 'Failed to load Razorpay. Please try again.' } });
                        return;
                      }

                      const options = {
                        key: key_id,
                        amount,
                        currency,
                        order_id,
                        name: 'Zenvy',
                        description: 'Order Payment',
                        prefill: {
                          name: user?.name || '',
                          email: user?.email || ''
                        },
                        theme: {
                          color: '#4F46E5'
                        },
                        modal: {
                          ondismiss: async () => {
                            try {
                              await apiService.markPaymentFailed({ razorpay_order_id: order_id, reason: 'Payment cancelled' });
                            } catch {
                            }
                            navigate('/order/failure', { state: { message: 'Payment was cancelled.' } });
                          }
                        },
                        handler: async (response) => {
                          try {
                            const verify = await apiService.verifyRazorpayPayment({
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_signature: response.razorpay_signature
                            });

                            await refresh();
                            navigate(`/order/success/${verify.order._id}`);
                          } catch (e) {
                            setPaymentError(e.message || 'Payment verification failed');
                            navigate('/order/failure', { state: { message: e.message || 'Payment verification failed' } });
                          }
                        }
                      };

                      const rzp = new window.Razorpay(options);
                      rzp.on('payment.failed', async (resp) => {
                        const reason = resp?.error?.description || 'Payment failed';
                        try {
                          await apiService.markPaymentFailed({ razorpay_order_id: order_id, reason });
                        } catch {
                        }
                        setPaymentError(reason);
                        navigate('/order/failure', { state: { message: reason } });
                      });

                      rzp.open();
                    } catch (e) {
                      setPaymentError(e.message || 'Checkout failed');
                      navigate('/order/failure', { state: { message: e.message || 'Checkout failed' } });
                    } finally {
                      setIsPaying(false);
                    }
                  }}
                  className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isPaying ? 'Opening…' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
