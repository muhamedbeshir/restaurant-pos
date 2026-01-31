import React, { useState, useEffect } from 'react';
import DatabaseManager from '../database';

interface OrderManagementProps {
  db: DatabaseManager;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ db }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await db.getActiveOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadOrderDetails = async (orderId: number) => {
    try {
      const order = await db.getOrder(orderId);
      setSelectedOrder(order);
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await db.updateOrderStatus(orderId, status);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        loadOrderDetails(orderId);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'served':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-full">
      {/* Orders List */}
      <div className="w-96 border-r border-gray-800 overflow-auto">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">Active Orders</h2>
        </div>
        <div className="p-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-4xl mb-2">📋</p>
              <p>No active orders</p>
            </div>
          ) : (
            orders.map(order => (
              <button
                key={order.id}
                onClick={() => loadOrderDetails(order.id)}
                className={`w-full bg-dark rounded-xl p-4 text-left transition-all ${
                  selectedOrder?.id === order.id
                    ? 'border-2 border-primary shadow-lg'
                    : 'border border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Table {order.table_number}</span>
                  <span className={`px-3 py-1 rounded-full text-xs text-white ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</p>
                <p className="text-lg font-bold text-primary mt-2">${parseFloat(order.total).toFixed(2)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 overflow-auto">
        {selectedOrder ? (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Order #{selectedOrder.id}</h2>
              <div className="flex gap-4 text-gray-400">
                <span>Table {selectedOrder.table_number}</span>
                <span>#{selectedOrder.order_number}</span>
                <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              {selectedOrder.customer_name && (
                <div className="mt-2">
                  <span className="text-gray-400">Customer: </span>
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                  {selectedOrder.customer_phone && <span className="text-gray-500 ml-2">{selectedOrder.customer_phone}</span>}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-darker rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-dark rounded-lg">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${parseFloat(item.subtotal).toFixed(2)}</p>
                      {item.profit && (
                        <p className="text-xs text-green-500">+${parseFloat(item.profit).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 mt-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Tax (10%)</span>
                  <span>${parseFloat(selectedOrder.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Discount</span>
                  <span>${parseFloat(selectedOrder.discount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-darker rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Update Status</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedOrder.id, status)}
                    className={`py-3 rounded-xl font-medium capitalize transition-all ${
                      selectedOrder.status === status
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-dark text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-darker rounded-xl p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Payment</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Method</span>
                  <span className="font-medium capitalize">{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-medium capitalize ${
                    selectedOrder.payment_status === 'paid' ? 'text-green-500' :
                    selectedOrder.payment_status === 'refunded' ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-6xl mb-4">📋</p>
              <p className="text-xl">Select an order to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
