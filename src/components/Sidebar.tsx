import React from 'react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'pos', label: 'Point of Sale', icon: '🛒' },
    { id: 'orders', label: 'Orders', icon: '📋' },
    { id: 'menu', label: 'Menu', icon: '🍽️' },
    { id: 'tables', label: 'Tables', icon: '🪑' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' }
  ];

  return (
    <div className="w-64 bg-darker border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-primary">Restaurant POS</h1>
        <p className="text-sm text-gray-500 mt-1">Premium Management</p>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
              currentView === item.id
                ? 'bg-primary text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-lg">
              👨‍🍳
            </div>
            <div>
              <p className="font-medium">Admin</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
