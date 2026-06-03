/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './firebase/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { AddProduct } from './pages/AddProduct';
import { EditProduct } from './pages/EditProduct';
import { Orders } from './pages/Orders';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Endpoint */}
          <Route path="/admin/login" element={<Login />} />

          {/* Secure Admin Operations Gate */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Route>

          {/* Global Fallback Route Redirects */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
