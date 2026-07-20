import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Calls your Django backend at POST /api/register
      // Add the slash right after register!
      await api.post('/register/', formData);
      
      // On successful registration, redirect to login page
      navigate('/login');
    } catch (err) {
      // Add this line right here!
      console.log("Django says:", err.response?.data); 
      
      const errorData = err.response?.data;
      if (errorData) {
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          // Extract and format field-specific validation errors nicely
          const errorMsg = Object.entries(errorData)
            .map(([field, msgs]) => {
              const cleanField = field.charAt(0).toUpperCase() + field.slice(1);
              const cleanMsgs = Array.isArray(msgs) ? msgs.join(' ') : msgs;
              return `${cleanField}: ${cleanMsgs}`;
            })
            .join(' | ');
          setError(errorMsg || 'Registration failed. Please check your inputs.');
        }
      } else {
        setError('Registration failed. Username or email might already exist.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-50 via-slate-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 text-3xl font-extrabold text-purple-700 hover:scale-105 transition-transform">
          <Sparkles className="w-8 h-8 fill-purple-100" />
          TripNest
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
            Log in here
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="glass-panel py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/60">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-rose-50 text-rose-600 text-sm p-3.5 rounded-xl border border-rose-100 font-medium"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Username</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all sm:text-sm font-medium text-slate-800 bg-white/50"
                  placeholder="traveler123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all sm:text-sm font-medium text-slate-800 bg-white/50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all sm:text-sm font-medium text-slate-800 bg-white/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-600/20 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;