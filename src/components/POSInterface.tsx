import React, { useState, useEffect } from 'react';
import DatabaseManager from '../database';

interface POSInterfaceProps {
  db: DatabaseManager;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const POSInterface: React.FC<POSInterfaceProps> = ({ db }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number>(1);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await db.getCategories();
      setCategories(cats);
      if (cats.length > 0) {
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
    if (selectedCategory) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    try {
      const orderResult = await db.createOrder({
        tableNumber: selectedTable
      });
      const orderId = orderResult.insertId;

      for (const item of cart) {
        await db.addOrderItem(orderId, item.id, item.quantity);
      }

      await db.updateOrderTotal(orderId);
      await db.updateTableStatus(selectedTable, 'occupied');

      setCart([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        {/* Categories */}
        <div className="p-4 bg-darker border-b border-gray-800">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-dark border border-gray-800 rounded-xl p-4 hover:border-primary transition-all hover:shadow-lg text-left"
              >
                <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3 flex items-center justify-center text-4xl">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    '🍽️'
                  )}
                </div>
                <h3 className="font-semibold mb-1">{product.name}</h3>
                <p className="text-primary font-bold">${parseFloat(product.price).toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-darker border-l border-gray-800 flex flex-col">
        {/* Table Selector */}
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-semibold mb-2">Table Number</h3>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
              <button
                key={num}
                onClick={() => setSelectedTable(num)}
                className={`w-12 h-12 rounded-lg font-bold transition-all ${
                  selectedTable === num
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4 overflow-auto">
          <h3 className="font-semibold mb-4">Cart ({cart.length} items)</h3>
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-4xl mb-2">🛒</p>
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-dark rounded-lg p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-8 h-8 bg-red-500 rounded-lg text-white hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total & Checkout */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-bold">${getCartTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Tax (10%)</span>
            <span className="font-bold">${(getCartTotal() * 0.1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">${(getCartTotal() * 1.1).toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              cart.length === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-blue-600 shadow-lg'
            }`}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;
