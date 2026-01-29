import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, RefreshCw, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE;

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('Invalid verification link. Email parameter is missing.');
    } else {
      setStatus('input');
    }
  }, [email]);

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = pasted.concat(Array(6 - pasted.length).fill(''));
    setOtp(newOtp);
    // Focus the last filled input or the first empty one
    const focusIndex = Math.min(newOtp.findIndex(d => d === '') === -1 ? 5 : newOtp.findIndex(d => d === ''), 5);
    document.getElementById(`otp-${focusIndex}`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('New credentials dispatched to ' + email);
        setOtp(['', '', '', '', '', '']);
        setStatus('input');
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Failed to resend authentication code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' && !isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="h-12 w-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background Aesthetic Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/10 p-8 md:p-12 shadow-2xl">

          {/* Security Icon */}
          <div className="flex justify-center mb-10">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-indigo-600 p-[2px] shadow-2xl shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-indigo-600 text-white font-black text-2xl">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3 uppercase">
              Secure Authentication
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
              <Mail className="h-4 w-4" />
              <p className="text-sm">Verification code sent to <span className="text-indigo-400 font-bold">{email}</span></p>
            </div>
          </div>

          {message && (
            <div className={`mb-10 p-5 rounded-3xl border animate-fade-in ${status === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-bold'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-bold'
              } flex items-center gap-3`}>
              <div className={`h-1.5 w-1.5 rounded-full ${status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex justify-between gap-2 md:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={status === 'success' || isLoading}
                  className="h-14 w-full md:h-18 md:w-16 rounded-2xl bg-white/5 border border-white/10 text-center text-xl font-black text-white focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all duration-300 placeholder:text-slate-700 shadow-sm"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading || status === 'success'}
                className="w-full h-16 relative flex items-center justify-center px-8 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Establish Identity'
                )}
              </button>

              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> Abort
                </button>

                <div className="h-4 w-[1px] bg-white/10"></div>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} /> Dispatch New Code
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
