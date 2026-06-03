import React, { useState, useEffect } from 'react';
import { getProducts, getOrders, addProduct, addOrder, updateOrderStatus } from '../services/db';
import { Product, Order } from '../types';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  User, 
  BadgeCheck, 
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [errorWord, setErrorWord] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const pData = await getProducts();
      const oData = await getOrders();
      setProducts(pData || []);
      setOrders(oData || []);
    } catch (err: any) {
      console.error(err);
      setErrorWord("Unable to load data. Ensure your Firebase terms are accepted and database is fully provisioned.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => {
    const val = Number((order as any).total);
    return sum + (Number.isFinite(val) ? val : 0);
  }, 0);

  // Status breakdown
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

  const handleSeedData = async () => {
    setSeeding(true);
    setErrorWord(null);
    try {
      const sampleProducts = [
        {
          name: "Aurelia 'Noir' Tech Runner",
          price: 490,
          category: "Sneakers",
          description: "Sculpted Italian mesh knit running shoe paired with custom premium vulcanized leather overlays, aerodynamic sole structure, and minimal embossed branding.",
          stock: 12,
          sizes: [40, 41, 42, 43, 44, 45],
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600"
        },
        {
          name: "Classic Espresso Calfskin Loafer",
          price: 640,
          category: "Dress Shoes",
          description: "Meticulously hand-stitched grain leather loafers in solid deep espresso dark brown tones. Crafted with high-stretch comfort cuffs and padded bespoke soles.",
          stock: 8,
          sizes: [39, 40, 41, 42, 43, 44],
          image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=600"
        },
        {
          name: "Suede Chelsea Boot 'Sable'",
          price: 580,
          category: "Boots",
          description: "Rich brushed calfskin suede ankle boots colored in timeless sand-beige. Flexible elastic siding matching handwoven pull tabs and reinforced leather heels.",
          stock: 15,
          sizes: [40, 41, 42, 43, 44, 45],
          image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600"
        }
      ];

      const createdProductIds = [];
      for (const p of sampleProducts) {
        const id = await addProduct(p);
        createdProductIds.push({ id, ...p });
      }

      // Add 3 sample orders
      const sampleOrders = [
        {
          customerName: "Alessandro Vercelli",
          phone: "+39 342 987 1144",
          address: "Via Montenapoleone 14, Milan, Italy",
          items: [
            {
              id: createdProductIds[0].id || "1",
              name: createdProductIds[0].name,
              price: createdProductIds[0].price,
              quantity: 1,
              size: 42,
              image: createdProductIds[0].image
            }
          ],
          total: createdProductIds[0].price,
          status: "pending" as const
        },
        {
          customerName: "Julianne Moore",
          phone: "+1 (212) 555-8941",
          address: "742 Park Avenue, New York, NY 10021",
          items: [
            {
              id: createdProductIds[1].id || "2",
              name: createdProductIds[1].name,
              price: createdProductIds[1].price,
              quantity: 1,
              size: 40,
              image: createdProductIds[1].image
            }
          ],
          total: createdProductIds[1].price,
          status: "processing" as const
        },
        {
          customerName: "Sebastian Vance",
          phone: "+44 7700 900077",
          address: "12 Bruton Place, Mayfair, London, UK",
          items: [
            {
              id: createdProductIds[2].id || "3",
              name: createdProductIds[2].name,
              price: createdProductIds[2].price,
              quantity: 2,
              size: 44,
              image: createdProductIds[2].image
            }
          ],
          total: createdProductIds[2].price * 2,
          status: "delivered" as const
        }
      ];

      for (const o of sampleOrders) {
        await addOrder(o);
      }

      await loadData();
    } catch (err: any) {
      console.error(err);
      setErrorWord("Seeding failed: " + (err.message || "Missing Firestore write permissions. Make sure you are logged in as biestjhon78@gmail.com."));
    } finally {
      setSeeding(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-full">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-light text-3xl tracking-tight text-white mb-2">
            Performance Atelier
          </h2>
          <p className="text-sm font-light text-[#a8a29e]">
            Review current inventory distribution, sales volumes, and order state parameters below.
          </p>
        </div>

        {/* Empty State Seeder Action Button */}
        {totalProducts === 0 && !loading && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gold-600/15 hover:bg-gold-600/25 border border-gold-500/35 text-gold-300 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
          >
            {seeding ? (
              <>
                <svg className="animate-spin h-4 w-4 text-gold-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Scribing Bespoke Seed Catalog...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4.5 h-4.5 text-gold-400" />
                <span>Seed Luxury Samples</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {errorWord && (
        <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-yellow-200 text-xs leading-relaxed">
          {errorWord}
        </div>
      )}

      {loading ? (
        <div className="h-96 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-2 border-gold-500/10 border-t-gold-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-[#a8a29e] tracking-widest uppercase font-light">Loading statistics...</p>
        </div>
      ) : (
        <>
          {/* Bento-Grid Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: Total Revenue */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all"></div>
              <span className="text-[10px] text-[#737373] uppercase tracking-[0.2em] block mb-2">Total Revenue</span>
              <span className="text-3xl font-light tracking-tight text-white">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="mt-4 flex items-center gap-2 text-[10px]">
                <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-sans font-medium">+12.5%</span>
                <span className="text-[#737373]">real-time accumulated ledger</span>
              </div>
            </div>

            {/* CARD 2: Active Orders */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <span className="text-[10px] text-[#737373] uppercase tracking-[0.2em] block mb-2">Active Orders</span>
              <span className="text-3xl font-light tracking-tight text-white">{totalOrders} Invoices</span>
              <div className="mt-4 flex items-center gap-2 text-[10px]">
                <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full font-sans font-medium">{pendingOrders} Pending</span>
                <span className="text-[#737373]">requires prompt attention</span>
              </div>
            </div>

            {/* CARD 3: Inventory Value */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <span className="text-[10px] text-[#737373] uppercase tracking-[0.2em] block mb-2">Inventory Value</span>
              <span className="text-3xl font-light tracking-tight text-white">{totalProducts} Registered Styles</span>
              <div className="mt-4 flex items-center gap-2 text-[10px]">
                <span className="text-[#BFA181] bg-[#BFA181]/15 px-2 py-0.5 rounded-full font-mono text-[9px] font-medium">HIGH TIER</span>
                <span className="text-[#737373]">premium footwear catalog</span>
              </div>
            </div>

          </div>

          {/* Simple Analytics & Status Tracker Split */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* RECENT ORDERS: 3 Column Width */}
            <div className="lg:col-span-3 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 flex flex-col">
              <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
                <h4 className="font-display text-sm uppercase tracking-widest text-[#737373] font-medium">Recent Operations</h4>
                <Link to="/admin/orders" className="text-[11px] text-[#BFA181] hover:underline transition-all flex items-center gap-1 uppercase font-semibold">
                  <span>Scroll Order Book</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center py-12 text-[#a8a29e]">
                  <ShoppingBag className="w-10 h-10 text-gold-500/20 mb-3" />
                  <p className="text-xs font-light tracking-wide">Ready for guest checkout invoices...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#a8a29e]">
                    <thead>
                      <tr className="text-[#6b6661] uppercase tracking-wider border-b border-luxury-gray pb-3 text-[10px]">
                        <th className="py-2.5 font-light">Client</th>
                        <th className="py-2.5 font-light">Date</th>
                        <th className="py-2.5 font-weight-light text-right">Sum</th>
                        <th className="py-2.5 font-light text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-luxury-gray/50">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3">
                            <span className="font-semibold text-[#f7f5f2] block">{order.customerName}</span>
                            <span className="text-[10px] font-mono text-[#525252]">{order.phone}</span>
                          </td>
                          <td className="py-3 font-mono">
                            {order.createdAt 
                              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) 
                              : 'Pending Auth'}
                          </td>
                          <td className="py-3 text-right font-semibold text-[#f7f5f2]">
                            ${Number.isFinite(Number(order.total)) ? Number(order.total) : 0}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold font-mono tracking-wide ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* CATEGORY & METADATA METRICS: 2 Column Width */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 flex flex-col justify-between">
              <div>
                <div className="pb-6 border-b border-white/5 mb-6">
                  <h4 className="font-display text-sm uppercase tracking-widest text-[#737373] font-medium">Category Allocation</h4>
                </div>
                
                {products.length === 0 ? (
                  <div className="py-12 flex flex-col justify-center items-center text-[#737373]">
                    <Layers className="w-10 h-10 text-white/5 mb-3" />
                    <p className="text-xs font-light tracking-wide text-center">Empty catalog</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Compute category percentages */}
                    {Array.from(new Set(products.map(p => p.category))).map(category => {
                      const count = products.filter(p => p.category === category).length;
                      const percent = Math.round((count / products.length) * 100);
                      return (
                        <div key={category} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#E5E5E5] font-medium">{category}</span>
                            <span className="font-mono text-[#BFA181]">{percent}% ({count})</span>
                          </div>
                          {/* Modern horizontal progress bar */}
                          <div className="w-full bg-[#121212] h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#BFA181] h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Design quote or visual signature */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="p-4 rounded bg-white/2 border border-white/5 text-[11px] text-[#737373] font-light leading-relaxed">
                  "Simplicity is the ultimate sophistication. In our shoe atelier, we ensure quality of craft and purity of database design meet."
                  <span className="block mt-2 text-right text-[9px] uppercase tracking-widest font-semibold text-[#BFA181]">
                    — Leonardo da Vinci
                  </span>
                </div>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
};
