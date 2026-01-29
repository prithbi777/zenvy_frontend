import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthForm = ({ isLogin = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminPasskey: '',
  });

  const [userType, setUserType] = useState('normal'); // login only
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPasskey, setShowAdminPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // 🔒 BASE PAYLOAD
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      /* ================= LOGIN ================= */
      if (isLogin) {
        payload.userType = userType;

        if (userType === 'admin') {
          if (!formData.adminPasskey.trim()) {
            throw new Error('Admin passkey is required');
          }
          payload.adminPasskey = formData.adminPasskey.trim();
        }

        await login(payload);
        navigate(userType === 'admin' ? '/admin/inventory' : '/');
      }

      /* ================= SIGNUP ================= */
      else {
        // 🔑 SEND adminPasskey ONLY IF FILLED
        if (formData.adminPasskey.trim()) {
          payload.adminPasskey = formData.adminPasskey.trim();
        }

        await register(payload);
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }

    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/10 p-8 md:p-12 shadow-2xl">

          {/* Logo/Brand Icon */}
          <div className="flex justify-center mb-10">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-indigo-600 p-[2px] shadow-2xl shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-indigo-600 text-white font-black text-2xl italic leading-none">
                Z
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              {isLogin ? 'Welcome back' : 'Join the legacy'}
            </h2>
            <p className="text-slate-400 font-medium">
              {isLogin ? "Zenvy. Luxury redefined at your fingertips." : "Experience a new standard of shopping excellence."}
            </p>
          </div>

          {/* User Type Segmented Control (Login Only) */}
          {isLogin && (
            <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
              <button
                type="button"
                onClick={() => setUserType('normal')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${userType === 'normal' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
              >
                Personal
              </button>
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${userType === 'admin' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
              >
                Executive
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold text-rose-300 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </div>
            )}

            {!isLogin && (
              <InputField
                label="Full Name"
                name="name"
                icon={User}
                placeholder="Alexander Zenvy"
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <InputField
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="alex@zenvy.com"
              value={formData.email}
              onChange={handleChange}
            />

            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
            />

            {isLogin && (
              <div className="flex justify-end pr-2">
                <Link
                  to="/forgot-password"
                  className="text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot access?
                </Link>
              </div>
            )}

            {!isLogin && (
              <PasswordField
                label="Confirm Identity"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showConfirmPassword}
                toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}

            {(isLogin ? userType === 'admin' : true) && (
              <PasswordField
                label={isLogin ? 'Executive Passkey' : 'Admin Passkey (Optional)'}
                name="adminPasskey"
                value={formData.adminPasskey}
                onChange={handleChange}
                show={showAdminPasskey}
                toggle={() => setShowAdminPasskey(!showAdminPasskey)}
                icon={Key}
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative flex items-center justify-center px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg transition-all duration-300 hover:bg-indigo-700 hover:shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{isLogin ? 'Begin Session' : 'Establish Account'}</>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-500">
            {isLogin ? "Don't have an account?" : "Already part of the inner circle?"}{' '}
            <Link
              to={isLogin ? '/signup' : '/login'}
              className="font-black text-indigo-400 hover:text-indigo-300 underline underline-offset-8 transition-colors"
            >
              {isLogin ? 'Join Zenvy' : 'Sign in here'}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

/* ================== INPUTS ================== */

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2 group">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-indigo-400 transition-colors pr-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        {...props}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-300 shadow-sm"
      />
    </div>
  </div>
);

const PasswordField = ({ label, show, toggle, icon: Icon = Lock, ...props }) => (
  <div className="space-y-2 group">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-indigo-400 transition-colors pr-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-12 text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all duration-300 shadow-sm"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export default AuthForm;
