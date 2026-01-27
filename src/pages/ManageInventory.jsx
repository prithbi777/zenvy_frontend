import React, { useEffect, useMemo, useState } from 'react';
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
    <div className="w-full py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Inventory</h1>
        <p className="mt-1 text-sm text-gray-600">Upload a new product (admin only)</p>

        {(error || success) && (
          <div
            className={`mt-6 rounded-md border px-4 py-3 text-sm ${
              error
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={onChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={4}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                name="price"
                value={formData.price}
                onChange={onChange}
                inputMode="decimal"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={onChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              name="stock"
              value={formData.stock}
              onChange={onChange}
              inputMode="numeric"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="mt-1 block w-full text-sm"
              required={!isEditing}
            />

            {isEditing && !previewUrl && editingProduct?.image?.url && (
              <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                <img src={editingProduct.image.url} alt="Current" className="h-64 w-full object-contain" />
              </div>
            )}

            {previewUrl && (
              <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                <img src={previewUrl} alt="Preview" className="h-64 w-full object-contain" />
              </div>
            )}

            {isUploading && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Uploading image…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-200">
                  <div className="h-full bg-indigo-600" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {cloudinaryImage?.url && (
              <div className="mt-3 text-xs text-green-700">Image ready</div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isUploading || isSaving}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={() => uploadToCloudinary().catch((e) => setError(e.message))}
              disabled={!file || isUploading || isSaving}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Upload Image
            </button>

            <button
              type="submit"
              disabled={isUploading || isSaving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
            <button
              type="button"
              onClick={loadInventory}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {inventoryLoading ? (
            <div className="mt-4 text-sm text-gray-600">Loading inventory…</div>
          ) : inventoryError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{inventoryError}</div>
          ) : !inventory.length ? (
            <div className="mt-4 text-sm text-gray-600">No products yet.</div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded bg-gray-100">
                            <img src={p?.image?.url} alt={p?.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p?.name}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">{p?.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">₹{Number(p?.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p?.stock ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p?.category}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
