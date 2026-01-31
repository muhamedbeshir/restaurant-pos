import React, { useState, useEffect } from 'react';
import DatabaseManager from './database';
import POSInterface from './components/POSInterface';
import OrderManagement from './components/OrderManagement';
import MenuManagement from './components/MenuManagement';
import TableManagement from './components/TableManagement';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

type View = 'pos' | 'orders' | 'menu' | 'tables' | 'dashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('pos');
  const [db, setDb] = useState<DatabaseManager | null>(null);

  const handleSetView = (view: string) => {
    setCurrentView(view as View);
  };

  useEffect(() => {
    try {
      const database = new DatabaseManager();
      setDb(database);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }, []);

  if (!db) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-dark text-white">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <div className="flex-1 overflow-hidden">
        {currentView === 'pos' && <POSInterface db={db} />}
        {currentView === 'orders' && <OrderManagement db={db} />}
        {currentView === 'menu' && <MenuManagement db={db} />}
        {currentView === 'tables' && <TableManagement db={db} />}
        {currentView === 'dashboard' && <Dashboard db={db} />}
      </div>
    </div>
  );
}

export default App;
