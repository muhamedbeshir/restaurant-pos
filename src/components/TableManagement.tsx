import React, { useState, useEffect } from 'react';
import DatabaseManager from '../database';

interface TableManagementProps {
  db: DatabaseManager;
}

const TableManagement: React.FC<TableManagementProps> = ({ db }) => {
  const [tables, setTables] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [tableForm, setTableForm] = useState({
    number: '',
    name: '',
    capacity: 4,
    section: 'Main Hall'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tablesData = await db.getTables();
      const ordersData = await db.getActiveOrders();

      setTables(tablesData);
      setActiveOrders(ordersData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const updateTableStatus = async (tableId: number, status: string) => {
    try {
      await db.updateTableStatus(tableId, status);
      loadData();
    } catch (error) {
      console.error('Error updating table status:', error);
      alert('Failed to update table status');
    }
  };

  const getOrderForTable = (tableNumber: number) => {
    return activeOrders.find(order => order.table_number === tableNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 border-green-600';
      case 'occupied':
        return 'bg-red-500 border-red-600';
      case 'reserved':
        return 'bg-yellow-500 border-yellow-600';
      case 'cleaning':
        return 'bg-blue-500 border-blue-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'occupied':
        return '👥';
      case 'reserved':
        return '⏰';
      case 'cleaning':
        return '🧹';
      default:
        return '❓';
    }
  };

  const sections = ['All', 'Main Hall', 'VIP', 'Outdoor'];
  const [selectedSection, setSelectedSection] = useState('All');

  const filteredTables = selectedSection === 'All'
    ? tables
    : tables.filter(t => t.section === selectedSection);

  return (
    <div className="p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Table Management</h2>
          <p className="text-gray-400">Manage restaurant tables and reservations</p>
        </div>
      </div>

      {/* Section Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {sections.map(section => (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedSection === section
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Available', value: tables.filter(t => t.status === 'available').length, color: 'bg-green-500' },
          { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length, color: 'bg-red-500' },
          { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length, color: 'bg-yellow-500' },
          { label: 'Cleaning', value: tables.filter(t => t.status === 'cleaning').length, color: 'bg-blue-500' }
        ].map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-xl p-6 text-white`}>
            <p className="text-sm opacity-90">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filteredTables.map(table => {
          const order = getOrderForTable(table.number);
          const statusColor = getStatusColor(table.status);

          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`${statusColor} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all relative`}
            >
              {/* Status Icon */}
              <div className="absolute top-2 right-2 text-2xl">
                {getStatusIcon(table.status)}
              </div>

              {/* Table Number */}
              <div className="text-4xl font-bold mb-2">
                {table.name || `Table ${table.number}`}
              </div>

              {/* Capacity */}
              <div className="text-sm opacity-90 mb-3">
                👥 Capacity: {table.capacity}
              </div>

              {/* Section */}
              <div className="text-xs opacity-75 mb-3">
                📍 {table.section}
              </div>

              {/* Order Info */}
              {order && (
                <div className="bg-black/20 rounded-lg p-3">
                  <p className="text-sm font-medium">Order #{order.id}</p>
                  <p className="text-2xl font-bold">${parseFloat(order.total).toFixed(2)}</p>
                  <p className="text-xs">{order.status}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">
                {selectedTable.name || `Table ${selectedTable.number}`}
              </h3>
              <button
                onClick={() => setSelectedTable(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Capacity</p>
                <p className="text-xl font-bold">{selectedTable.capacity} seats</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Section</p>
                <p className="text-xl font-bold">{selectedTable.section}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <p className={`text-xl font-bold capitalize ${selectedTable.status === 'available' ? 'text-green-500' : selectedTable.status === 'occupied' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {selectedTable.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Current Order</p>
                <p className="text-xl font-bold">
                  {getOrderForTable(selectedTable.number) ? `Order #${getOrderForTable(selectedTable.number).id}` : 'None'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => updateTableStatus(selectedTable.id, 'available')}
                  className="py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium"
                >
                  Available
                </button>
                <button
                  onClick={() => updateTableStatus(selectedTable.id, 'occupied')}
                  className="py-3 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
                >
                  Occupied
                </button>
                <button
                  onClick={() => updateTableStatus(selectedTable.id, 'reserved')}
                  className="py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-medium"
                >
                  Reserved
                </button>
                <button
                  onClick={() => updateTableStatus(selectedTable.id, 'cleaning')}
                  className="py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium"
                >
                  Cleaning
                </button>
              </div>
            </div>

            {/* Order Details */}
            {getOrderForTable(selectedTable.number) && (
              <div className="bg-darker rounded-xl p-6">
                <p className="text-lg font-bold mb-4">Current Order</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order #</span>
                    <span className="font-medium">{getOrderForTable(selectedTable.number).id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="font-medium capitalize">{getOrderForTable(selectedTable.number).status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total</span>
                    <span className="font-bold text-primary text-xl">
                      ${parseFloat(getOrderForTable(selectedTable.number).total).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="font-medium">{new Date(getOrderForTable(selectedTable.number).created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedTable(null)}
              className="w-full mt-6 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
