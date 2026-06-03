import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProducts, removeProduct } from '../services/db';
import { Product } from '../types';
import { useAuth } from '../firebase/AuthContext';
import { Search, Plus, Edit3, Trash2, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Products: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (err: any) {
      console.error(err);
      setActionError("Error loading products catalog. Double-check database configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) {
      setActionError("Permission Denied: Only biestjhon78@gmail.com can remove catalog products from Firestore.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the catalog?`)) {
      return;
    }

    try {
      await removeProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setActionError(null);
    } catch (err: any) {
      console.error(err);
      setActionError("Deletion failed. Secure permissions rules blocked this write.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-light text-3xl tracking-tight text-white mb-2">
            The Footwear Matrix
          </h2>
          <p className="text-sm font-light text-[#a8a29e]">
            Review, edit, and expand your catalog styles and quantities.
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gold-600 hover:bg-gold-500 text-luxury-black font-semibold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:shadow-gold-600/10"
        >
          <Plus className="w-4.5 h-4.5 text-luxury-black font-bold" />
          <span>New Shoe Style</span>
        </Link>
      </div>

      {actionError && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs flex items-center gap-3 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filters and Search toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0A0A0A] p-4 border border-white/5 rounded-2xl">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#737373]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search footwear models, brand labels, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050505] border border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-xs text-[#E5E5E5] outline-none placeholder:text-[#525252] focus:border-white/10 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <SlidersHorizontal className="w-4 h-4 text-[#BFA181]" />
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373]">
            {filteredProducts.length} model(s) matched
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col justify-center items-center">
          <div className="w-10 h-10 border-2 border-white/5 border-t-[#BFA181] rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-[#737373] tracking-widest uppercase font-light">Examining Footwear Archives...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-white/5 bg-[#0a0a0a] flex flex-col items-center justify-center">
          <Trash2 className="w-12 h-12 text-[#525252] mb-4" />
          <p className="text-[#737373] font-light text-sm mb-4">No model pairings register under this query.</p>
          <button 
            onClick={() => setSearch('')}
            className="text-xs text-[#BFA181] uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Luxury Tabular Grid */
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E5E5E5] border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[#737373] uppercase tracking-wider text-[10px] border-b border-white/5">
                  <th className="py-4.5 px-6 font-medium">Product Detail</th>
                  <th className="py-4.5 px-6 font-medium">Category</th>
                  <th className="py-4.5 px-6 font-medium text-right font-sans">Unit Price</th>
                  <th className="py-4.5 px-6 font-medium text-center">Remaining Stock</th>
                  <th className="py-4.5 px-6 font-medium">Sizes</th>
                  <th className="py-4.5 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Img and core name info */}
                    <td className="py-4.5 px-6 flex items-center gap-4">
                      <div className="w-11 h-11 bg-black border border-white/5 rounded overflow-hidden shrink-0 flex items-center justify-center">
                        <img 
                          src={p.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150"} 
                          alt={p.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-white truncate max-w-xs block text-sm">{p.name}</span>
                        <span className="text-[10px] text-[#737373] truncate max-w-xs block font-light leading-normal">{p.description}</span>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-4.5 px-6 text-[#737373] font-medium">
                      {p.category}
                    </td>

                    {/* Price Column */}
                    <td className="py-4.5 px-6 text-right font-medium text-white font-mono text-sm">
                      ${p.price.toLocaleString()}
                    </td>

                    {/* Stock Level Column */}
                    <td className="py-4.5 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase font-bold tracking-tighter ${
                        p.stock === 0 
                          ? 'border border-red-500/20 bg-red-400/5 text-[#f87171]' 
                          : p.stock <= 5 
                            ? 'border border-yellow-500/20 bg-yellow-400/5 text-yellow-300' 
                            : 'border border-green-500/10 bg-green-500/10 text-green-500'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>

                    {/* Sizes list */}
                    <td className="py-4.5 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.sizes.map(size => (
                          <span key={size} className="bg-black border border-white/5 text-[#737373] text-[10px] px-1.5 py-0.5 rounded font-mono">
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                          className="p-2 bg-[#050505] hover:bg-white/5 border border-white/5 text-[#737373] hover:text-[#BFA181] rounded transition-all cursor-pointer"
                          title="Edit shoe details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => p.id && handleDelete(p.id, p.name)}
                          className="p-2 bg-[#050505] hover:bg-white/5 border border-white/5 text-[#737373] hover:text-[#f87171] rounded transition-all cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
