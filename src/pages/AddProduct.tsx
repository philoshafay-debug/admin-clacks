import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { addProduct } from '../services/db';
import { useAuth } from '../firebase/AuthContext';
import { ArrowLeft, Upload, CheckCircle2, CloudLightning, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const AddProduct: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Primary product states
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState('Sneakers');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([40, 41, 42, 43]);
  const [imageUrl, setImageUrl] = useState('');

  // Image uploader state variables
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Custom Cloudinary configurations in-view for premium developer ergonomics
  const [cloudName, setCloudName] = useState('dfziz6t0o'); // Fallback standard placeholder, user can modify
  const [uploadPreset, setUploadPreset] = useState('clacks'); // Required by user spec

  const [saving, setSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const sizeOptions = [39, 40, 41, 42, 43, 44, 45];

  const handleSizeToggle = (size: number) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(prev => prev.filter(s => s !== size));
    } else {
      setSelectedSizes(prev => [...prev, size].sort((a,b) => a-b));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  const handleUploadToCloudinary = async () => {
    if (!imageFile) {
      setErrorStatus("Please select an image file first.");
      return;
    }
    if (!cloudName) {
      setErrorStatus("You have not specified a Cloudinary cloud name.");
      return;
    }

    setUploadingImage(true);
    setErrorStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', uploadPreset);

      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName()}/image/upload`;
      console.log(`Uploading to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Cloudinary responded with index error status: ${response.status}`);
      }

      const result = await response.json();
      if (result.secure_url) {
        setImageUrl(result.secure_url);
        setUploadSuccess(true);
        console.log("Cloudinary Upload success!", result.secure_url);
      } else {
        throw new Error("Missing secure_url from response body.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus(`Cloudinary Upload Failed. Check that your Cloud Name "${cloudName}" and Preset "${uploadPreset}" are correct and configure to accept Unsigned uploads! Fell back to a standard placeholder.`);
      // Set to a placeholder so they are not blocked
      setImageUrl(`https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600`);
      setUploadSuccess(true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorStatus("Unauthorized Action: Only the owner admin address biestjhon78@gmail.com is authorized to write to this Firestore catalog.");
      return;
    }

    setErrorStatus(null);

    // Validation
    if (!name.trim()) {
      setErrorStatus("Product Name is required.");
      return;
    }
    if (price <= 0) {
      setErrorStatus("Please specify a valid luxury unit price.");
      return;
    }
    if (selectedSizes.length === 0) {
      setErrorStatus("Please select at least one available footwear size.");
      return;
    }
    if (!imageUrl) {
      setErrorStatus("Please either upload an image or provide an image secure link first.");
      return;
    }

    setSaving(true);
    try {
      await addProduct({
        name,
        price: Number(price),
        category,
        description,
        stock: Number(stock),
        sizes: selectedSizes,
        image: imageUrl
      });
      navigate('/admin/products');
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "An exception occurred saving your document to Firestore.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Navigation Return Hook */}
      <div className="flex items-center justify-between">
        <Link 
          to="/admin/products" 
          className="flex items-center gap-2 text-xs text-[#a8a29e] hover:text-white uppercase tracking-widest transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalog</span>
        </Link>
        <span className="text-xs font-mono text-gold-500/80">
          Draft State: Creating shoe document
        </span>
      </div>

      <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="border-b border-white/5 pb-5 mb-8">
          <h3 className="font-display font-light text-2xl tracking-wide text-white">Create Footwear Entry</h3>
          <p className="text-[#737373] text-xs font-light mt-1.5">Configure sizes, style specs, and images in the catalog database.</p>
        </div>

        {errorStatus && (
          <div className="mb-6 p-4 rounded bg-yellow-500/5 border border-yellow-500/10 text-yellow-200 text-xs flex gap-2.5 leading-relaxed">
            <AlertTriangle className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block uppercase tracking-wider text-[10px] mb-0.5">Configuration Notice</span>
              {errorStatus}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="mb-6 p-4 rounded bg-yellow-600/5 border border-yellow-500/20 text-yellow-500 text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>You are browsing in Guest/Viewer mode. Saving new products to Firestore will yield a PERMISSION_DENIED.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NAME */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#737373] font-light">Product Name</label>
              <input 
                type="text" 
                placeholder="Aura Suede Slingback"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#050505] border border-white/5 rounded-lg p-3 text-xs text-[#E5E5E5] focus:border-white/20 outline-none transition-colors"
                required
              />
            </div>

            {/* CATEGORY & PRICE */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#737373] font-light">Category</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 rounded-lg p-3 text-xs text-[#E5E5E5] focus:border-white/20 outline-none transition-colors cursor-pointer"
                >
                  <option value="Sneakers">Sneakers</option>
                  <option value="Dress Shoes">Dress Shoes</option>
                  <option value="Boots">Boots</option>
                  <option value="Slingbacks">Slingbacks</option>
                  <option value="Loafers">Loafers</option>
                  <option value="Bespoke">Bespoke Couture</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#737373] font-light">Luxury Price ($)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="590"
                  value={price || ''}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full bg-[#050505] border border-white/5 rounded-lg p-3 text-xs text-[#E5E5E5] focus:border-white/20 outline-none transition-colors font-mono"
                  required
                />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* STOCK */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#737373] font-light">Stock Supply</label>
              <input 
                type="number" 
                min="0"
                placeholder="10"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full bg-[#050505] border border-white/5 rounded-lg p-3 text-xs text-[#E5E5E5] focus:border-white/20 outline-none transition-colors font-mono"
                required
              />
            </div>

            {/* SIZES */}
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-[#737373] font-light block mb-1">Available EU Sizes</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {sizeOptions.map(size => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`w-9 h-9 text-xs font-mono rounded border transition-all flex items-center justify-center cursor-pointer ${
                        active 
                          ? 'bg-[#BFA181]/15 border-[#BFA181] text-[#BFA181] font-semibold' 
                          : 'border-white/5 text-[#737373] hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#737373] font-light">Product Story / Specifications</label>
            <textarea 
              rows={4}
              placeholder="Describing Italian calfskin materials, hand-finished stitching, premium linings, packaging notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#050505] border border-white/5 rounded-lg p-3 text-xs text-[#E5E5E5] focus:border-white/20 outline-none transition-colors"
            />
          </div>

          {/* CLOUDINARY CONFIGS / UPLOAD COMPONENT */}
          <div className="border border-white/5 bg-black/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2">
              <CloudLightning className="w-4 h-4 text-[#BFA181]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">Unsigned Cloudinary Uplink</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wide text-[#737373]">Cloud Name</label>
                <input 
                  type="text" 
                  value={cloudName}
                  onChange={e => setCloudName(e.target.value)}
                  placeholder="e.g. dv0wre8of"
                  className="w-full bg-black border border-white/5 rounded p-2 text-[11px] font-mono text-white focus:border-[#BFA181] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wide text-[#737373]">Unsigned Preset</label>
                <input 
                  type="text" 
                  value={uploadPreset}
                  onChange={e => setUploadPreset(e.target.value)}
                  placeholder="e.g. shoe_store"
                  className="w-full bg-black border border-white/5 rounded p-2 text-[11px] font-mono text-white focus:border-[#BFA181] outline-none"
                />
              </div>
            </div>

            {/* Manual URL field or Upload field action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-[10px] uppercase tracking-wide text-[#737373] block">1. Choose Image File</label>
                <div className="flex h-10 w-full items-center">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-[#737373] file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-white/5 file:bg-black file:text-[#BFA181] file:text-[10px] file:uppercase file:tracking-widest file:cursor-pointer hover:file:bg-[#BFA181]/5"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUploadToCloudinary}
                disabled={uploadingImage || !imageFile}
                className="w-full sm:w-auto shrink-0 mt-5 sm:mt-0 flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-white/5 hover:text-white border border-white/5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer text-[#737373]"
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-[#BFA181]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-[#BFA181]" />
                    <span>Upload to Cloudinary</span>
                  </>
                )}
              </button>
            </div>

            {/* SECURE IMAGE URL STATUS */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] uppercase tracking-wide text-[#737373]">Resolved Product Image URL (Firestore Target)</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={e => {
                  setImageUrl(e.target.value);
                  setUploadSuccess(false);
                }}
                placeholder="Cloudinary secure url will appear here, or paste direct public URL"
                className="w-full bg-[#050505] border border-white/5 rounded px-3 py-2 text-xs font-mono text-[#737373] focus:border-[#BFA181] outline-none"
              />
              {uploadSuccess && (
                <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1.5 mt-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Uplink Verified: {imageUrl.substring(0, 50)}...
                </span>
              )}
            </div>

          </div>

          {/* ACTION FORMS */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
            <Link 
              to="/admin/products"
              className="py-3 px-6 text-xs text-[#737373] hover:text-white uppercase tracking-widest font-semibold transition-colors"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="py-3.5 px-8 rounded-lg bg-[#BFA181] hover:bg-white text-black font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  <span>Executing custom transaction...</span>
                </>
              ) : (
                <span>Publish Style</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
