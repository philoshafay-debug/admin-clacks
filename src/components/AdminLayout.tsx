import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  PlusCircle, 
  ListOrdered, 
  LogOut, 
  Menu, 
  X, 
  Crown,
  ShieldCheck,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', path: '/admin/products', icon: ShoppingBag },
    { name: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
    { name: 'Orders', path: '/admin/orders', icon: ListOrdered },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getHeaderDetails = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return { title: 'System Overview', subtitle: 'Real-time store performance & metrics' };
      case '/admin/products':
        return { title: 'Inventory Control', subtitle: 'Manage high-end shoe definitions' };
      case '/admin/products/add':
        return { title: 'Add Product Spec', subtitle: 'Formulate new custom definitions' };
      case '/admin/orders':
        return { title: 'The Order Ledger', subtitle: 'Review incoming store boutique invoices' };
      default:
        if (location.pathname.includes('/edit/')) {
          return { title: 'Amend Footwear Entry', subtitle: 'Modify parameters and specifications' };
        }
        return { title: 'Sole.Admin Hub', subtitle: 'Global luxury operations interface' };
    }
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getHeaderDetails();
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'AD';

  return (
    <div className="min-h-screen bg-[#050505] text-[#E5E5E5] flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden flex h-16 items-center justify-between px-6 bg-[#080808] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <div className="w-3 h-3 bg-black rotate-45"></div>
          </div>
          <span className="font-sans font-medium tracking-tighter text-white text-sm uppercase">
            Sole.Admin
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#737373] hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* MOBILE SIDEBAR (Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#080808] border-r border-white/10 z-50 flex flex-col p-6 md:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rotate-45"></div>
                  </div>
                  <span className="font-sans font-medium tracking-tighter text-sm uppercase">Sole.Admin</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-white/5 rounded text-[#737373]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all border ${
                        isActive(item.path)
                          ? 'bg-white/5 border-white/10 text-white font-medium pl-4'
                          : 'border-transparent text-[#737373] hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Meta & User Profile Area */}
              <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#BFA181] to-[#D4C3B0] border border-white/20 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-[10px] font-bold text-white">
                      {initials}
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-white truncate">{user?.email}</p>
                    <p className="text-[10px] text-[#BFA181] font-light flex items-center gap-1">
                      {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {isAdmin ? 'System Owner' : 'Staff Access'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#737373] hover:text-[#ef4444] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 border-r border-white/10 flex-col bg-[#080808] shrink-0 min-h-screen">
        {/* Brand / Logo */}
        <div className="p-8 pb-12">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 bg-black rotate-45"></div>
            </div>
            <span className="text-xl font-medium tracking-tighter uppercase text-white selection:bg-[#BFA181]">Sole.Admin</span>
          </div>
          <p className="text-[10px] text-[#737373] tracking-[0.2em] uppercase pl-11 font-mono">Luxury Footwear</p>
        </div>

        {/* Route Links */}
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 border rounded-lg text-sm transition-colors duration-300 ${
                  isActive(item.path)
                    ? 'bg-white/5 border-white/10 text-white font-medium'
                    : 'border-transparent text-[#737373] hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive(item.path) ? 'text-white' : 'text-[#737373]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Support status area */}
        <div className="p-8 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-[#737373] hover:text-white transition-colors w-full text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] overflow-y-auto h-screen">
        
        {/* TOP STATUS NAV BAR */}
        <header className="hidden md:flex h-20 border-b border-white/10 px-10 flex items-center justify-between bg-[#080808]/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-white tracking-tight">{pageTitle}</h1>
            <p className="text-xs text-[#737373] font-light">{pageSubtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-[#737373] uppercase tracking-widest font-mono text-[10px]">Admin Status</span>
              {isAdmin ? (
                <span className="text-xs text-green-500 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
                  Cloud Active
                </span>
              ) : (
                <span className="text-xs text-[#BFA181] flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 bg-[#BFA181] rounded-full animate-pulse"></span> 
                  Staff Viewer
                </span>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#BFA181] to-[#D4C3B0] border border-white/20 p-0.5">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center text-[10px] font-bold text-white uppercase" title={user?.email || 'Admin'}>
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER VIEWPORTS */}
        <div className="p-6 md:p-10 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

    </div>
  );
};
