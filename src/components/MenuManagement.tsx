import React, { useState, useEffect } from 'react';
import DatabaseManager from '../database';

interface MenuManagementProps {
  db: DatabaseManager;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ db }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#2563eb', description: '' });
  const [productForm, setProductForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: '',
    sku: '',
    costPrice: '',
    stockQuantity: 0,
    minStock: 5,
    preparationTime: 0
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await db.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (categoryId?: number) => {
    try {
      const prods = await db.getProducts(categoryId);
      setProducts(prods);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  useEffect(() => {
    loadProducts(selectedCategory || undefined);
  }, [selectedCategory]);

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await db.updateCategory(editingCategory.id, categoryForm);
      } else {
        await db.createCategory(categoryForm.name, categoryForm.color, categoryForm.description);
      }

      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', color: '#2563eb', description: '' });
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await db.deleteCategory(id);
      loadCategories();
      if (selectedCategory === id) {
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleSaveProduct = async () => {
    try {
      const data = {
        categoryId: parseInt(productForm.categoryId),
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        sku: productForm.sku || null,
        costPrice: productForm.costPrice ? parseFloat(productForm.costPrice) : null,
        stockQuantity: parseInt(productForm.stockQuantity.toString()),
        minStock: parseInt(productForm.minStock.toString()),
        preparationTime: parseInt(productForm.preparationTime.toString())
      };

      if (editingProduct) {
        await db.updateProduct(editingProduct.id, data);
      } else {
        await db.createProduct(data);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({
        categoryId: '',
        name: '',
        description: '',
        price: '',
        sku: '',
        costPrice: '',
        stockQuantity: 0,
        minStock: 5,
        preparationTime: 0
      });
      loadProducts(selectedCategory || undefined);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await db.deleteProduct(id);
      loadProducts(selectedCategory || undefined);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const editCategoryHandler = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, color: category.color, description: category.description });
    setShowCategoryModal(true);
  };

  const editProductHandler = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      categoryId: product.category_id.toString(),
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      sku: product.sku || '',
      costPrice: product.cost_price ? product.cost_price.toString() : '',
      stockQuantity: product.stock_quantity || 0,
      minStock: product.min_stock || 5,
      preparationTime: product.preparation_time || 0
    });
    setShowProductModal(true);
  };

  return (
    <div className="p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Menu Management</h2>
          <p className="text-gray-400">Manage categories and products</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', color: '#2563eb', description: '' });
            setShowCategoryModal(true);
          }}
          className="bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <span>+</span> Add Category
        </button>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`bg-darker rounded-xl p-6 border-2 cursor-pointer transition-all ${
                selectedCategory === cat.id ? 'border-primary shadow-lg' : 'border-gray-800 hover:border-gray-600'
              }`}
              style={{ borderColor: selectedCategory === cat.id ? cat.color : '' }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); editCategoryHandler(cat); }}
                    className="text-gray-400 hover:text-white"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <h4 className="font-semibold">{cat.name}</h4>
              {cat.description && <p className="text-sm text-gray-500 mt-1">{cat.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      {selectedCategory && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Products</h3>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  categoryId: selectedCategory.toString(),
                  name: '',
                  description: '',
                  price: '',
                  sku: '',
                  costPrice: '',
                  stockQuantity: 0,
                  minStock: 5,
                  preparationTime: 0
                });
                setShowProductModal(true);
              }}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <span>+</span> Add Product
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-darker rounded-xl p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-3xl">
                    🍽️
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editProductHandler(product)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-lg mb-2">{product.name}</h4>
                {product.description && <p className="text-sm text-gray-400 mb-3">{product.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">${parseFloat(product.price).toFixed(2)}</span>
                  <span className={`text-sm ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    Stock: {product.stock_quantity}
                  </span>
                </div>
                {product.sku && <p className="text-xs text-gray-500 mt-2">SKU: {product.sku}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <input
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-full h-12 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  rows={3}
                  placeholder="Category description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 bg-primary hover:bg-blue-600 px-4 py-3 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-dark rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <div className="space-y-4 max-h-96 overflow-auto">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  rows={3}
                  placeholder="Product description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.costPrice}
                    onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  placeholder="Product SKU"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Stock</label>
                  <input
                    type="number"
                    value={productForm.minStock}
                    onChange={(e) => setProductForm({ ...productForm, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prep (min)</label>
                  <input
                    type="number"
                    value={productForm.preparationTime}
                    onChange={(e) => setProductForm({ ...productForm, preparationTime: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProductModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="flex-1 bg-primary hover:bg-blue-600 px-4 py-3 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
