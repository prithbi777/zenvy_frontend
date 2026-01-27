import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';

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
    setOtp(pasted.concat(Array(6 - pasted.length).fill('')));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setMessage('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    // setStatus('loading'); // Removed full-page loader for better UX

    try {
      const res = await fetch('http://localhost:5001/api/auth/verify-otp', {
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
      const res = await fetch('http://localhost:5001/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('New OTP sent to your email');
        setOtp(['', '', '', '', '', '']);
        setStatus('input');
      } else {
        setStatus('error');
        setMessage(data.message);
      }
    } catch {
      setStatus('error');
      setMessage('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' && !isLoading) { // Show only on initial load
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md px-8 py-6">

          <h2 className="text-2xl font-bold text-center text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit OTP sent to <b>{email}</b>
          </p>

          {message && (
            <div className={`mt-4 rounded-md p-3 text-sm ${status === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : status === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={status === 'success' || isLoading}
                  className="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || status === 'success'}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Resend OTP
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
