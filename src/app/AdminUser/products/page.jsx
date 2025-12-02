'use client'

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { getAllProducts, createProduct, updateProduct, deleteProduct, getProductById } from './productService';

// Utility function to parse dd-MM-yyyy format dates
const parseBackendDate = (dateString) => {
  if (!dateString) return null;
  // Convert dd-MM-yyyy to MM-dd-yyyy for JavaScript Date constructor
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${month}-${day}-${year}`);
  }
  return new Date(dateString);
};

export default function ProductsPage() {
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // product code of open menu
  const [editingCode, setEditingCode] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    code: '',
    status: 'Active',
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getAllProducts();
        
        // Map the API response to the format expected by the table
        const formattedProducts = products.map(product => ({
          id: product.id,
          code: product.productCode,
          name: product.productName,
          status: product.status,
          date: product.dateAdded ? parseBackendDate(product.dateAdded).toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          }) : new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          }),
        }));
        
        setRows(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Add a specific handler for closing dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.dropdown-container')) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const saveProduct = async () => {
    // Format current date as dd-MM-yyyy to match backend format
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    try {
      if (editingCode) {
        // Update existing product via API
        // Find the product ID by code
        const existingProduct = rows.find(r => r.code === editingCode);
        const productId = existingProduct?.id;
        
        if (!productId) {
          throw new Error('Product ID not found');
        }
        
        const productData = {
          productName: form.name,
          productCode: form.code,
          status: form.status,
        };
        
        const updatedProduct = await updateProduct(productId, productData);
        
        setRows(prev => prev.map(r => 
          r.code === editingCode 
            ? { 
                ...r, 
                name: updatedProduct.productName, 
                code: updatedProduct.productCode,
                status: updatedProduct.status,
                date: updatedProduct.dateAdded ? parseBackendDate(updatedProduct.dateAdded).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: '2-digit', 
                  year: 'numeric' 
                }) : dateStr
              } 
            : r
        ));
        toast.success('Product updated successfully');
      } else {
        // Create new product via API
        const productData = {
          productName: form.name,
          productCode: form.code,
          status: form.status,
        };
        
        const newProduct = await createProduct(productData);
        
        const newRow = {
          code: newProduct.productCode,
          name: newProduct.productName,
          status: newProduct.status,
          date: newProduct.dateAdded ? parseBackendDate(newProduct.dateAdded).toLocaleDateString('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          }) : dateStr,
        };
        
        setRows(prev => [newRow, ...prev]);
        toast.success('Product created successfully');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product: ' + error.message);
    }

    setShowModal(false);
    setEditingCode(null);
    setForm({ name: '', code: '', status: 'Active' });
  };

  return (
    <div className="w-full">
      {/* Page content - layout is handled by ClientLayout */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-black">Product Management</h1>
            <p className="text-sm text-black/70">View, manage, and add new products.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            <span>＋</span> Add Product
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-black">
                  <th className="py-3 px-4">Product Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        <span className="ml-2">Loading products...</span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.code} className={i % 2 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 font-medium text-indigo-600">{r.code}</td>
                      <td className="py-3 px-4 text-black">{r.name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${r.status === 'Active' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-black">{r.date}</td>
                      <td className="py-3 px-4 text-black">
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-1 rounded hover:bg-gray-100 text-green-600"
                            onClick={async () => { 
                              try {
                                // Find the product ID by code
                                const existingProduct = rows.find(row => row.code === r.code);
                                const productId = existingProduct?.id;
                                
                                if (!productId) {
                                  throw new Error('Product ID not found');
                                }
                                
                                const productDetails = await getProductById(productId);
                                setViewingProduct(productDetails);
                                setShowViewModal(true);
                              } catch (error) {
                                console.error('Error fetching product details:', error);
                                toast.error('Failed to fetch product details: ' + error.message);
                              }
                            }}
                            title="View"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-gray-100 text-blue-600"
                            onClick={() => { setShowModal(true); setEditingCode(r.code); setForm({ name: r.name, code: r.code, status: r.status }); }}
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-gray-100 text-red-600"
                            onClick={async () => { 
                              try {
                                // Find the product ID by code
                                const existingProduct = rows.find(row => row.code === r.code);
                                const productId = existingProduct?.id;
                                
                                if (!productId) {
                                  throw new Error('Product ID not found');
                                }
                                
                                await deleteProduct(productId);
                                
                                setRows(prev => prev.filter(x => x.code !== r.code)); 
                                toast.success('Product deleted successfully');
                              } catch (error) {
                                console.error('Error deleting product:', error);
                                toast.error('Failed to delete product: ' + error.message);
                                // Fallback to local state removal
                                setRows(prev => prev.filter(x => x.code !== r.code)); 
                              }
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{editingCode ? 'Edit Product' : 'Add New Product'}</h3>
                    <p className="text-sm text-black/70">Enter the details for the new product.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-black">×</button>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Product Name</label>
                    <input value={form.name} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Product Code</label>
                    <input value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-black">Status</label>
                    <select value={form.status} onChange={(e)=>setForm(f=>({...f, status:e.target.value}))} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-gray-300 text-black">Cancel</button>
                  <button onClick={saveProduct} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">Save Product</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showViewModal && viewingProduct && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowViewModal(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-black">Product Details</h3>
                    <p className="text-sm text-black/70">View product information</p>
                  </div>
                  <button onClick={() => setShowViewModal(false)} className="text-black">×</button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-500">Product ID</label>
                      <p className="text-sm font-medium text-black">{viewingProduct.id}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-500">Status</label>
                      <p className="text-sm font-medium text-black">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${viewingProduct.status === 'Active' ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'}`}>
                          {viewingProduct.status}
                        </span>
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1 text-gray-500">Product Name</label>
                      <p className="text-sm font-medium text-black">{viewingProduct.productName}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1 text-gray-500">Product Code</label>
                      <p className="text-sm font-medium text-black">{viewingProduct.productCode}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1 text-gray-500">Date Added</label>
                      <p className="text-sm font-medium text-black">
                        {viewingProduct.dateAdded ? parseBackendDate(viewingProduct.dateAdded).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: '2-digit', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
                  <button 
                    onClick={() => setShowViewModal(false)} 
                    className="px-4 py-2 rounded-md border border-gray-300 text-black"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
