import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCcw, AlertCircle, ShoppingCart } from 'lucide-react';

const OrderFailure = () => {
  const location = useLocation();
  const message = location.state?.message || 'The digital handshake was interrupted during the payment phase.';

  return (
    <div className="min-h-screen bg-white selection:bg-rose-100 selection:text-rose-900">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-rose-50 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative mx-auto max-w-[800px] px-6 py-12 lg:py-40 text-center">
        <div className="inline-flex items-center gap-3 px-4 h-10 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 mb-12">
          <XCircle className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Transmission Interrupted</span>
        </div>

        <h1 className="text-6xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[0.9] mb-12">
          Handshake <br />
          <span className="text-rose-600">Failed.</span>
        </h1>

        <div className="max-w-md mx-auto mb-16 space-y-8">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-widest leading-loose">
            {message}
          </p>

          <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-start gap-4 text-left">
            <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">System Advice</span>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
                Please verify your payment credentials and ensure your session has not expired. Your cart contents remain secured for your next attempt.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/cart"
            className="h-16 px-10 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 group"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Return to Cart</span>
          </Link>
          <Link
            to="/"
            className="h-16 px-10 bg-white border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            Exit to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderFailure;

