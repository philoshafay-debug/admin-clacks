import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../services/db';
import { Order } from '../types';
import { useAuth } from '../firebase/AuthContext';
import { 
  ShoppingBag, 
  Phone, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Orders: React.FC = () => {
  const { isAdmin } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (err: any) {
      console.error(err);
      setActionError("Error loading orders from Firestore database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    if (!isAdmin) {
      setActionError("Write block: Updating fulfillment status in Firestore requires biestjhon78@gmail.com administrator credentials.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setStatusUpdatingId(id);
    setActionError(null);
    try {
      await updateOrderStatus(id, newStatus);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      console.error(err);
      setActionError("Transaction failed: Relational security rules rejected this status transition.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Upper Brand Info */}
      <div>
        <h2 className="font-display font-light text-3xl tracking-tight text-white mb-2">
          The Order Ledger
        </h2>
        <p className="text-sm font-light text-[#a8a29e]">
          Review incoming store boutique invoices, ship footwear, and track delivery sequences.
        </p>
      </div>

      {actionError && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-200 text-xs flex items-center gap-3 animate-fadeIn">
          <AlertTriangle className="w-4.5 h-4.5 text-yellow-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-2 border-white/5 border-t-[#BFA181] rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-[#737373] tracking-widest uppercase font-light">Retrieving Order Book...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-white/5 bg-[#0a0a0a] flex flex-col items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-[#525252] mb-4" />
          <p className="text-[#a8a29e] font-light text-sm">No transaction invoices exist in the Ledger yet.</p>
          <p className="text-[#737373] text-xs font-light mt-1 text-center max-w-xs">Use the 'Seed Luxury Samples' button on the Dashboard to instantly import starter orders and shoes!</p>
        </div>
      ) : (
        /* Invoices Grid */
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E5E5E5] border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[#737373] uppercase tracking-wider text-[10px] border-b border-white/5">
                  <th className="py-4.5 px-6 font-medium">Client name</th>
                  <th className="py-4.5 px-6 font-medium">Contact phone</th>
                  <th className="py-4.5 px-6 font-medium text-right">Sum total</th>
                  <th className="py-4.5 px-6 font-medium text-center">Status state</th>
                  <th className="py-4.5 px-6 font-medium">Created date</th>
                  <th className="py-4.5 px-6 font-medium text-right">Receipt Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const isUpdating = statusUpdatingId === order.id;

                  return (
                    <React.Fragment key={order.id}>
                      <tr className={`hover:bg-white/[0.02] transition-colors relative ${isExpanded ? 'bg-white/[0.02]' : ''}`}>
                        
                        {/* Customer Name */}
                        <td className="py-4.5 px-6">
                          <span className="font-semibold text-white block text-sm">{order.customerName}</span>
                          <span className="text-[10px] font-light font-mono text-[#737373] uppercase tracking-widest">{order.id?.substring(0, 10)}</span>
                        </td>

                        {/* Phone */}
                        <td className="py-4.5 px-6 font-mono text-[11px] text-[#737373]">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#525252]" />
                            {order.phone}
                          </span>
                        </td>

                        {/* Total price */}
                        <td className="py-4.5 px-6 text-right font-semibold text-white font-mono text-sm">
                          ${order.total.toLocaleString()}
                        </td>

                        {/* Status dropdown */}
                        <td className="py-4.5 px-6 text-center">
                          <div className="inline-flex items-center justify-center relative">
                            {isUpdating ? (
                              <span className="w-5 h-5 border-2 border-white/5 border-t-[#BFA181] rounded-full animate-spin"></span>
                            ) : (
                              <select
                                value={order.status}
                                onChange={(e) => order.id && handleStatusChange(order.id, e.target.value as Order['status'])}
                                className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wide font-bold outline-none cursor-pointer border border-[#BFA181]/10 bg-black text-[#BFA181] hover:border-[#BFA181]/40 transition-all focus:ring-1 focus:ring-[#BFA181]`}
                              >
                                <option value="pending" className="bg-[#050505] text-[#BFA181]">Pending</option>
                                <option value="processing" className="bg-[#050505] text-[#BFA181]">Processing</option>
                                <option value="shipped" className="bg-[#050505] text-[#BFA181]">Shipped</option>
                                <option value="delivered" className="bg-[#050505] text-green-500">Delivered</option>
                              </select>
                            )}
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="py-4.5 px-6 font-mono text-[11px] text-[#737373]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#525252]" />
                            {order.createdAt 
                              ? new Date(order.createdAt.seconds * 1000).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})
                              : 'Pending Auth'}
                          </span>
                        </td>

                        {/* Expand Row details */}
                        <td className="py-4.5 px-6 text-right">
                          <button
                            onClick={() => order.id && toggleExpand(order.id)}
                            className="inline-flex items-center justify-center py-1.5 px-3 rounded bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/10 text-[#737373] hover:text-white transition-all cursor-pointer font-bold uppercase tracking-widest text-[10px] gap-1"
                          >
                            <span>Invoice</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#BFA181]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />}
                          </button>
                        </td>

                      </tr>

                      {/* Expandable subrow receipts details drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-black/60 p-6 border-b border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                              
                              {/* Shipping summary */}
                              <div className="md:col-span-2 space-y-4">
                                <span className="text-[10px] uppercase font-bold text-[#BFA181] tracking-widest">Shipping Dossier</span>
                                <div className="space-y-2 text-[#737373]">
                                  <div className="flex gap-2.5 items-start">
                                    <MapPin className="w-4 h-4 text-[#BFA181] shrink-0 mt-0.5" />
                                    <span className="text-xs leading-relaxed text-white font-light">{order.address}</span>
                                  </div>
                                  <div className="flex gap-2.5 items-center font-mono text-[11px] pt-1">
                                    <Phone className="w-4 h-4 text-[#525252]" />
                                    <span>{order.phone}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Purchased bags products list */}
                              <div className="md:col-span-3 space-y-3">
                                <span className="text-[10px] uppercase font-bold text-[#737373] tracking-widest block font-medium">Line Items</span>
                                <div className="space-y-2.5">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded bg-[#050505]/80 border border-white/5">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black rounded overflow-hidden border border-white/5 shrink-0">
                                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                        <div>
                                          <span className="font-semibold text-white text-xs block">{item.name}</span>
                                          <span className="text-[10px] text-[#BFA181] font-mono">Size {item.size} × {item.quantity} unit(s)</span>
                                        </div>
                                      </div>
                                      <div className="text-right font-mono font-semibold text-white text-xs">
                                        ${(item.price * item.quantity).toLocaleString()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
