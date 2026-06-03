import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { Crown, Key, Mail, User, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { login, register, error: authError } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    if (!email || !password || (isRegister && !name)) {
      setLocalError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error("Authentication exception:", err);
      // Simplify human readable text
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setLocalError(
          isRegister 
            ? "Account registration error. Try another credential."
            : "Invalid credentials. If this is your first time logging in as biestjhon78@gmail.com, please switch to 'Create an Account' below to register it!"
        );
      } else if (err.code === 'auth/email-already-in-use') {
        setLocalError("This email address is already registered. Try logging in instead!");
      } else {
        setLocalError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick fill configuration to make testing incredibly fluid
  const handleQuickFillAdmin = () => {
    setEmail('biestjhon78@gmail.com');
    setPassword('admin123');
    if (isRegister) {
      setName('Master Architect');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-gold-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gold-500/5 blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-luxury-dark border border-luxury-gray/100 rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        {/* Luxury Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gold-600/15 border border-gold-500/30 flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-gold-500" />
          </div>
          <h2 className="font-display font-light text-2xl tracking-[0.2em] text-[#fff] uppercase text-center">
            AURELIA ATELIER
          </h2>
          <p className="text-[10px] tracking-[0.3em] font-light text-gold-500 uppercase mt-2">
            Luxury shoe control panel
          </p>
        </div>

        {/* Display System Error Logs */}
        {(localError || authError) && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-red-200 text-xs flex items-start gap-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold uppercase tracking-wider text-[10px] block mb-0.5">Authorization Notice</span>
              {localError || authError}
            </div>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[11px] uppercase tracking-wider text-[#a8a29e] font-light">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a8a29e]/60">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  placeholder="Master Admin / Artisan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#161616] border border-luxury-gray rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#f7f5f2] focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all duration-300 placeholder:text-[#525252]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#a8a29e] font-light">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a8a29e]/60">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                placeholder="artisan@aurelia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-luxury-gray rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#f7f5f2] focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all duration-300 placeholder:text-[#525252]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#a8a29e] font-light">
              Secure Word Key
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#a8a29e]/60">
                <Key className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161616] border border-luxury-gray rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#f7f5f2] focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all duration-300 placeholder:text-[#525252]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-600 hover:bg-gold-500 disabled:bg-gold-800 text-luxury-black font-semibold text-xs tracking-[0.2em] uppercase py-3.5 px-4 rounded-lg shadow-lg hover:shadow-gold-600/10 cursor-pointer transition-all duration-300 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-luxury-black/30 border-t-luxury-black rounded-full animate-spin"></span>
            ) : isRegister ? (
              "Complete Admin Setup"
            ) : (
              "Enter Admin Chamber"
            )}
          </button>
        </form>

        {/* Preset Admin shortcut buttons */}
        <div className="mt-6 pt-5 border-t border-luxury-gray/50 flex flex-col items-center">
          <p className="text-[10px] text-[#a8a29e] tracking-wide mb-3 text-center">
            To satisfy Firestore rules write access, sign in or register with verified admin email:
          </p>
          <button
            type="button"
            onClick={handleQuickFillAdmin}
            className="flex items-center gap-2 py-1.5 px-3 rounded bg-gold-600/10 border border-gold-500/20 text-gold-500 text-[10px] tracking-wider uppercase hover:bg-gold-600/20 transition-all font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Autofill Bootstrapped Admin
          </button>
        </div>

        {/* Change Mode */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-[#a8a29e] hover:text-white underline underline-offset-4 cursor-pointer font-light transition-colors"
          >
            {isRegister 
              ? "Already have an admin vault? Log in instead" 
              : "Registering standard admin credentials? Create an Account"
            }
          </button>
        </div>

      </motion.div>
    </div>
  );
};
