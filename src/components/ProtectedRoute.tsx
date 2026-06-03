import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-2 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-light tracking-widest text-[#a8a29e] uppercase font-display">
          Synchronizing Luxury Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};
