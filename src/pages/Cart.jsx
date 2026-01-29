import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, Minus, Plus, CreditCard, ShieldCheck, Sparkles, ArrowRight, Package, RefreshCcw } from 'lucide-react';
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
      <div className="min-h-[60vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Manifest...</span>
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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
              <ShoppingBag className="h-3 w-3" />
              <span>Manifest / Current Requisitions</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
              Shopping <br /> <span className="text-indigo-600 italic">Bag.</span>
            </h1>
            <p className="mt-8 text-sm font-medium text-slate-400 uppercase tracking-widest">
              Review your curated selections before final acquisition.
            </p>
          </div>

          <Link
            to="/"
            className="group flex items-center gap-4 h-16 px-8 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Continue Gallery
          </Link>
        </div>

        {error && (
          <div className="mb-12 rounded-[32px] bg-rose-50 border border-rose-100 p-6 animate-fade-in">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-rose-600">
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
              </div>
              <button onClick={clearError} className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-800 transition-colors">Dismiss</button>
            </div>
          </div>
        )}

        {!cart || !cart.items?.length ? (
          <div className="min-h-[60vh] w-full flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-50 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-md">
              <div className="mb-10 relative">
                <div className="absolute inset-0 bg-slate-200 blur-2xl rounded-full"></div>
                <div className="relative h-24 w-24 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center border border-slate-50">
                  <ShoppingBag className="h-10 w-10 text-slate-200" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-[10px] font-black text-white">0</span>
                </div>
              </div>

              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight uppercase mb-4">
                Manifest <br /> <span className="text-slate-400 italic font-medium">Clear.</span>
              </h2>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed mb-12 px-6">
                No items have been marked for requisition in this session.
              </p>

              <Link
                to="/"
                className="group flex items-center gap-4 h-16 px-10 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 active:scale-95"
              >
                Initiate Shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-8">
              {cart.items.map((i) => (
                <div key={i.product._id} className="group relative bg-white/50 hover:bg-white rounded-[40px] border border-slate-100 p-6 transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Visual Asset */}
                    <div className="relative h-40 w-full sm:w-40 shrink-0 overflow-hidden rounded-[32px] bg-slate-50">
                      <img
                        src={i.product.image?.url}
                        alt={i.product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Operational Details */}
                    <div className="flex flex-col flex-1 w-full text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">{i.product.category || 'Asset'}</span>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors uppercase">
                            {i.product.name}
                          </h3>
                        </div>
                        <div className="text-2xl font-black text-slate-900">
                          ₹{Number(i.product.price || 0).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-8 mt-auto">
                        {/* Unit Controls */}
                        <div className="flex items-center p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                          <button
                            disabled={busyKey === i.product._id || i.quantity <= 1}
                            onClick={() => setQuantity(i.product._id, i.quantity - 1)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 hover:text-indigo-600 disabled:opacity-50 transition-all active:scale-90"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center text-xs font-black text-slate-900 uppercase">
                            {i.quantity}
                          </span>
                          <button
                            disabled={busyKey === i.product._id || i.quantity >= i.product.stock}
                            onClick={() => setQuantity(i.product._id, i.quantity + 1)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-100 hover:text-indigo-600 disabled:opacity-50 transition-all active:scale-90"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

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
                          className="flex items-center gap-2 px-6 py-3 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove Asset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Operational Sync State */}
                  {busyKey === i.product._id && (
                    <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Requisition Summary Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
              <div className="rounded-[48px] bg-slate-900 p-10 shadow-3xl shadow-slate-200 overflow-hidden relative group">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-colors duration-700"></div>

                <div className="relative z-10">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 mb-10">Summary Ledger</h2>

                  <div className="space-y-8 mb-10 pb-10 border-b border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Count</span>
                      <span className="text-lg font-black text-white">{cart.totalItems} Units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logistics</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[.3em] bg-emerald-400/10 px-3 py-1 rounded-full">Gratis</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Total Requisition Amount</span>
                      <span className="text-5xl font-black text-white tracking-tighter leading-none">₹{Number(cart.subtotal || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="mb-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-[10px] font-black uppercase tracking-widest text-rose-300 leading-relaxed">
                      {paymentError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isPaying}
                    onClick={async () => {
                      try {
                        setPaymentError(null);
                        setIsPaying(true);

                        const isAddressComplete = user?.address &&
                          user.address.street?.trim() &&
                          user.address.city?.trim() &&
                          user.address.state?.trim() &&
                          user.address.pincode?.trim();

                        if (!isAddressComplete) {
                          setPaymentError(
                            <span>
                              Shipping address required. Update your{' '}
                              <button
                                onClick={() => navigate('/profile')}
                                className="font-black underline text-rose-400"
                              >
                                PROFILE
                              </button>{' '}
                              to proceed.
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
                          name: 'ZENVY',
                          description: 'Asset Requisition',
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
                    className="w-full relative h-20 flex items-center justify-center gap-4 bg-white text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:bg-slate-50 hover:shadow-2xl hover:shadow-indigo-500/10 active:scale-95 disabled:opacity-50"
                  >
                    {isPaying ? (
                      <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Commit Purchase
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="mt-8 flex items-center justify-center gap-3 text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest">End-to-End Encryption Secured</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[32px] border border-slate-100 bg-white/50 backdrop-blur-sm">
                  <Package className="h-5 w-5 text-indigo-600 mb-3" />
                  <p className="text-[10px] font-black text-slate-900 uppercase">Express Delivery</p>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-1">2-4 Business Days</p>
                </div>
                <div className="p-6 rounded-[32px] border border-slate-100 bg-white/50 backdrop-blur-sm">
                  <RefreshCcw className="h-5 w-5 text-indigo-600 mb-3" />
                  <p className="text-[10px] font-black text-slate-900 uppercase">Seamless Returns</p>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-1">14-Day Assurance</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

