import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag, Truck, CreditCard, ShieldCheck } from 'lucide-react';
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
    return () => { isMounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verifying Requisition...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Branding & Message */}
          <div className="space-y-12">
            <div className="inline-flex items-center gap-3 px-4 h-10 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transmission Successful</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9]">
              Requisition <br />
              <span className="text-indigo-600">Secured.</span>
            </h1>

            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-loose max-w-md">
              Your curated selections have been successfully logged into our fulfillment matrix.
              Our agents are currently preparing your assets for transit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/orders/active"
                className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 group"
              >
                <span>Track Transmission</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/"
                className="h-16 px-10 bg-white border border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all hover:bg-slate-50"
              >
                Continue Browsing
              </Link>
            </div>

            {/* Order Meta Matrix */}
            <div className="grid grid-cols-2 gap-8 pt-12 border-t border-slate-100">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Transmission ID</span>
                <p className="text-[11px] font-bold text-slate-900 font-mono uppercase">{order?._id}</p>
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Verified Status</span>
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Auth Verification OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Modern Receipt Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-700"></div>
            <div className="relative bg-white rounded-[40px] border border-slate-100 p-10 lg:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Impact</h3>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <ShoppingBag className="h-5 w-5 text-slate-900" />
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {(order?.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6">
                    <div className="relative h-20 w-20 flex-shrink-0 bg-slate-50 rounded-[28px] overflow-hidden p-1 border border-slate-100">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover rounded-[22px]" />
                      <div className="absolute -top-1 -right-1 h-6 w-6 bg-slate-900 text-white text-[9px] font-black flex items-center justify-center rounded-lg border-2 border-white">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{item.name}</h4>
                      <p className="text-[11px] font-bold text-indigo-500 mt-1">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Valuation</span>
                  <span className="text-3xl font-black text-slate-900 leading-none">₹{order?.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
                  <CreditCard className="h-3 w-3" />
                  <span>Payment Method: Digital Transmission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

