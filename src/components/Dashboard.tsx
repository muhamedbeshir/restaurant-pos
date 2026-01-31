import React, { useEffect, useState } from 'react';
import DatabaseManager from '../database';

interface DashboardProps {
  db: DatabaseManager;
}

const Dashboard: React.FC<DashboardProps> = ({ db }) => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);

    return () => clearInterval(interval);
  }, [db]);

  const loadDashboardData = async () => {
    try {
      const statsData = await db.getStats();
      const ordersData = await db.getAllOrders(10);
      const tablesData = await db.getTables();

      setStats(statsData);
      setRecentOrders(ordersData);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
      trend: '+12%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: '💰',
      color: 'from-green-500 to-green-600',
      trend: '+8%'
    },
    {
      title: 'Menu Items',
      value: stats.totalProducts,
      icon: '🍽️',
      color: 'from-purple-500 to-purple-600',
      trend: '+2'
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      icon: '👥',
      color: 'from-orange-500 to-orange-600',
      trend: '+5%'
    }
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'preparing': return 'bg-blue-500/20 text-blue-500';
      case 'ready': return 'bg-green-500/20 text-green-500';
      case 'served': return 'bg-purple-500/20 text-purple-500';
      case 'completed': return 'bg-gray-500/20 text-gray-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'cleaning': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-8 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-400">
          Welcome back! Here's your restaurant overview.
          {' '}{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{stat.icon}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {stat.trend}
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-darker rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Orders</h3>
            <button className="text-primary hover:text-blue-400 text-sm font-medium">
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-4xl mb-2">📋</p>
                <p>No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="bg-dark rounded-xl p-4 flex items-center gap-4 hover:border-primary border-2 border-transparent transition-all cursor-pointer">
                  <div className={`w-12 h-12 ${getTableStatusColor(order.status)} rounded-lg flex items-center justify-center text-lg`}>
                    🍽️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold">Table {order.table_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">${parseFloat(order.total).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.payment_method}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tables Overview */}
        <div className="bg-darker rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Tables</h3>
            <button className="text-primary hover:text-blue-400 text-sm font-medium">
              Manage →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Free', value: tables.filter(t => t.status === 'available').length, color: 'bg-green-500' },
              { label: 'Occupied', value: tables.filter(t => t.status === 'occupied').length, color: 'bg-red-500' },
              { label: 'Reserved', value: tables.filter(t => t.status === 'reserved').length, color: 'bg-yellow-500' }
            ].map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-4 text-white text-center`}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {tables.slice(0, 6).map((table) => (
              <div key={table.id} className="bg-dark rounded-lg p-3 flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getTableStatusColor(table.status)}`}></div>
                <div className="flex-1">
                  <p className="font-medium">{table.name || `Table ${table.number}`}</p>
                  <p className="text-xs text-gray-500">{table.section}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  table.status === 'available' ? 'bg-green-500/20 text-green-500' :
                  table.status === 'occupied' ? 'bg-red-500/20 text-red-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {table.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-darker rounded-2xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { icon: '🟢', title: 'System is running smoothly', time: 'Just now', color: 'bg-green-500' },
            { icon: '🔵', title: 'Database connected successfully', time: '1 min ago', color: 'bg-blue-500' },
            { icon: '📦', title: 'Tables initialized', time: '2 min ago', color: 'bg-purple-500' },
            { icon: '🍽️', title: 'Default categories created', time: '3 min ago', color: 'bg-orange-500' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-dark rounded-lg">
              <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
              <span className="text-gray-300 flex-1">{activity.title}</span>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
