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
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

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
        setShowVerificationMessage(true);
      }

    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md px-8 py-6">

          {/* Header */}
          <h2 className="text-center text-3xl font-bold text-gray-900">
            {isLogin ? 'Sign in to Zenvy' : 'Create your account'}
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Or create a new account' : 'Already have an account?'}{' '}
            <Link
              to={isLogin ? '/signup' : '/login'}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>

          {/* LOGIN TYPE */}
          {isLogin && (
            <div className="mt-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Login as
              </label>

              <div className="flex justify-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="normal"
                    checked={userType === 'normal'}
                    onChange={() => setUserType('normal')}
                  />
                  Normal
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="admin"
                    checked={userType === 'admin'}
                    onChange={() => setUserType('admin')}
                  />
                  Admin
                </label>
              </div>
            </div>
          )}

          {/* FORM */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {!isLogin && (
              <InputField
                label="Full Name"
                name="name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <InputField
              label="Email"
              name="email"
              type="email"
              icon={Mail}
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
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {!isLogin && (
              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showConfirmPassword}
                toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            )}

            {(isLogin ? userType === 'admin' : true) && (
              <PasswordField
                label={isLogin ? 'Admin Passkey' : 'Admin Passkey (Optional)'}
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
              className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing…' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {showVerificationMessage && (
            <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              <strong>Check your email.</strong>
              <p className="mt-1">
                OTP sent to <b>{formData.email}</b>
              </p>
              <button
                onClick={() =>
                  navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
                }
                className="mt-3 font-medium text-blue-600 hover:text-blue-500"
              >
                Enter OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================== INPUTS ================== */

const InputField = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      <input
        {...props}
        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm"
      />
    </div>
  </div>
);

const PasswordField = ({ label, show, toggle, icon: Icon = Lock, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <Icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 text-sm"
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-2.5">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export default AuthForm;
