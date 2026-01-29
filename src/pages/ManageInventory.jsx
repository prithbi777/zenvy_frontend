import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Search, Filter, Trash2, Edit3, Upload, X, Check, RefreshCcw, Image as ImageIcon, Box, Tag, DollarSign, Info } from 'lucide-react';
import apiService from '../services/api';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ManageInventory = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [file, setFile] = useState(null);
  const [cloudinaryImage, setCloudinaryImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEditing = !!editingProduct;

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadInventory = async () => {
    try {
      setInventoryLoading(true);
      const data = await apiService.getAdminInventory();
      setInventory(data.products || []);
      setInventoryError(null);
    } catch (e) {
      setInventoryError(e.message || 'Failed to load inventory');
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ?? '',
      category: product?.category || '',
      stock: product?.stock ?? ''
    });
    setFile(null);
    setCloudinaryImage(null);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', category: '', stock: '' });
    setFile(null);
    setCloudinaryImage(null);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
  };

  const onFileChange = (e) => {
    const next = e.target.files?.[0] || null;
    setError(null);
    setSuccess(null);
    setCloudinaryImage(null);
    setUploadProgress(0);

    if (!next) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.has(next.type)) {
      setFile(null);
      setError('Invalid image format. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    if (next.size > MAX_IMAGE_BYTES) {
      setFile(null);
      setError('Image is too large. Max size is 5MB.');
      return;
    }

    setFile(next);
  };

  const uploadToCloudinary = async () => {
    if (!file) {
      throw new Error('Please select an image');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const sig = await apiService.getCloudinarySignature();

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', String(sig.timestamp));
      form.append('signature', sig.signature);
      form.append('folder', sig.folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);

        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(pct);
        };

        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.responseText || '{}');
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              reject(new Error(data.error?.message || 'Cloudinary upload failed'));
            }
          } catch {
            reject(new Error('Cloudinary upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Cloudinary upload failed'));
        xhr.send(form);
      });

      const meta = {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      };

      setCloudinaryImage(meta);
      setSuccess('Image uploaded successfully');
      return meta;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (product) => {
    const ok = window.confirm(`Remove "${product?.name}"? This will delete it from the database.`);
    if (!ok) return;

    try {
      setError(null);
      setSuccess(null);
      await apiService.deleteProduct(product._id);
      await loadInventory();
      if (editingProduct?._id === product._id) {
        cancelEdit();
      }
      setSuccess('Product removed');
    } catch (e) {
      setError(e.message || 'Failed to remove product');
    }
  };

  const validateProductFields = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) return 'Product name is required';
    if (!formData.description.trim() || formData.description.trim().length < 10) return 'Description must be at least 10 characters';
    if (!formData.category.trim() || formData.category.trim().length < 2) return 'Category is required';

    const price = Number(formData.price);
    if (!Number.isFinite(price) || price < 0) return 'Price must be a valid non-negative number';

    const stock = Number(formData.stock);
    if (!Number.isInteger(stock) || stock < 0) return 'Stock must be a valid non-negative integer';

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isEditing && !file && !cloudinaryImage) {
      setError('Please select an image');
      return;
    }

    const fieldError = validateProductFields();
    if (fieldError) {
      setError(fieldError);
      return;
    }

    setIsSaving(true);

    let uploaded = cloudinaryImage;
    try {
      if (!uploaded && file) {
        uploaded = await uploadToCloudinary();
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        stock: Number(formData.stock)
      };

      if (uploaded) {
        payload.image = uploaded;
      }

      if (isEditing) {
        await apiService.updateProduct(editingProduct._id, payload);
      } else {
        await apiService.createProduct(payload);
      }

      setSuccess(isEditing ? 'Product updated successfully' : 'Product created successfully');
      await loadInventory();

      if (isEditing) {
        cancelEdit();
      } else {
        setFormData({ name: '', description: '', price: '', category: '', stock: '' });
        setFile(null);
        setCloudinaryImage(null);
        setUploadProgress(0);
      }
    } catch (err) {
      setError(err.message || 'Failed to create product');

      if (!cloudinaryImage && uploaded?.publicId) {
        try {
          await apiService.deleteCloudinaryImage(uploaded.publicId);
        } catch {
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-slate-100 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-24">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-12 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">
              <Box className="h-3 w-3" />
              <span>Logistics / Inventory Control</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[0.9]">
              Asset Ledger
            </h1>
            <p className="mt-6 text-sm font-medium text-slate-400 uppercase tracking-widest">
              Curate and manage your luxury collection.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 md:h-16 px-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Assets</span>
              <span className="text-xl md:text-2xl font-black text-slate-900">{inventory.length}</span>
            </div>
          </div>
        </div>

        {/* Global Feedback */}
        {(error || success) && (
          <div className={`mb-12 rounded-3xl border px-6 py-4 flex items-center justify-between animate-fade-in ${error ? 'border-rose-100 bg-rose-50 text-rose-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'
            }`}>
            <div className="flex items-center gap-3">
              {error ? <X className="h-5 w-5" /> : <Check className="h-5 w-5" />}
              <span className="text-xs font-black uppercase tracking-widest">{error || success}</span>
            </div>
            <button onClick={() => { setError(null); setSuccess(null); }} className="opacity-50 hover:opacity-100 transition-opacity">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Input Console */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${isEditing ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'}`}>
                  {isEditing ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {isEditing ? 'Modify Entry' : 'Create Entry'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isEditing ? `Refining ID: ${editingProduct._id.slice(-8)}` : 'Initiate new collection item'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 p-8 bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Label</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Tag className="h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        placeholder="Product Name"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Curator's Notes</label>
                    <div className="relative group">
                      <div className="absolute top-4 left-4 pointer-events-none">
                        <Info className="h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={onChange}
                        placeholder="Cinematic description of the asset..."
                        rows={4}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Price Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Valuation</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                          name="price"
                          value={formData.price}
                          onChange={onChange}
                          inputMode="decimal"
                          placeholder="Price"
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Stock Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Units</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Box className="h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                          name="stock"
                          value={formData.stock}
                          onChange={onChange}
                          inputMode="numeric"
                          placeholder="Stock"
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                      <input
                        name="category"
                        value={formData.category}
                        onChange={onChange}
                        placeholder="Category"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Image Matrix */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Evidence</label>

                    <div className="relative group flex items-center transition-all">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={onFileChange}
                        className="hidden"
                        required={!isEditing}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex-1 cursor-pointer flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-200 transition-all group"
                      >
                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            {file ? file.name : 'Select High-Res Image'}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">MAX ISO: 5.0 MB</span>
                        </div>
                      </label>
                    </div>

                    {(previewUrl || (isEditing && !file && editingProduct?.image?.url)) && (
                      <div className="relative h-48 w-full rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 group">
                        <img
                          src={previewUrl || editingProduct.image.url}
                          alt="Visual Preview"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-4 py-2 bg-white/90 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-900">Preview Mode</span>
                        </div>
                      </div>
                    )}

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                          <span>Uploading Transmission</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-300 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isUploading || isSaving}
                    className="h-16 w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl shadow-slate-200 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <RefreshCcw className="h-4 w-4 animate-spin mr-3" />
                    ) : isEditing ? (
                      <Edit3 className="h-4 w-4 mr-3" />
                    ) : (
                      <Plus className="h-4 w-4 mr-3" />
                    )}
                    {isSaving ? 'Synchronizing...' : isEditing ? 'Commit Changes' : 'Initialize Asset'}
                  </button>

                  <div className="flex gap-3">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isUploading || isSaving}
                        className="flex-1 h-14 flex items-center justify-center bg-white border border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Abort Modification
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => uploadToCloudinary().catch((e) => setError(e.message))}
                      disabled={!file || isUploading || isSaving}
                      className="flex-1 h-14 flex items-center justify-center bg-white border border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Pre-Sync Image
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Operational Ledger */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Inventory</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archive of curated assets</p>
              </div>
              <button
                onClick={loadInventory}
                className="h-10 w-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                title="Refresh Registry"
              >
                <RefreshCcw className={`h-4 w-4 text-slate-400 ${inventoryLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-6">
              {inventoryLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                  <div className="h-12 w-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Registry...</span>
                </div>
              ) : !inventory.length ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                  <div className="h-16 w-16 flex items-center justify-center bg-white rounded-3xl shadow-sm">
                    <Box className="h-8 w-8 text-slate-100" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 mb-2">Vault Empty</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">No assets initialized in system.</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {inventory.map((p) => (
                    <div key={p._id} className="group relative bg-white hover:bg-slate-50/50 rounded-[32px] border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-4">
                        {/* Compact Visual */}
                        <div className="relative h-32 sm:h-20 w-full sm:w-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={p?.image?.url} alt={p?.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center bg-white/80 backdrop-blur-md rounded-lg shadow-sm">
                            <span className="text-[10px] font-black">{p.stock}</span>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="flex-1 flex flex-col sm:grid sm:grid-cols-12 items-center gap-4 sm:gap-6">
                          <div className="sm:col-span-5 text-center sm:text-left">
                            <span className="block text-[8px] font-black uppercase tracking-widest text-indigo-500 mb-1">{p.category}</span>
                            <h4 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{p.name}</h4>
                            <p className="text-[10px] font-medium text-slate-400 line-clamp-1 italic mt-1 leading-none">"{p.description}"</p>
                          </div>

                          <div className="sm:col-span-3 flex flex-col items-center sm:items-start pl-4">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1 font-mono">Valuation</span>
                            <span className="text-sm font-black text-slate-900">₹{Number(p?.price || 0).toLocaleString()}</span>
                          </div>

                          <div className="sm:col-span-4 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 sm:mt-0 sm:pl-12">
                            <button
                              onClick={() => startEdit(p)}
                              className="h-9 w-full sm:h-10 sm:px-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md active:scale-95 group/edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Modify Asset</span>
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="h-9 w-full sm:h-10 sm:px-4 flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-900 hover:text-rose-600 rounded-xl transition-all active:scale-95 group/del"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Purge Ledger</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Low Stock Indicator Line */}
                      {p.stock < 5 && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
