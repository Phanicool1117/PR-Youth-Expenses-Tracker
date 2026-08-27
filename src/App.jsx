import React from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { MemberDashboard } from './pages/MemberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AddExpense } from './pages/AddExpense';
import { AdminDonations } from './pages/AdminDonations';
import { AdminMembers } from './pages/AdminMembers';
import { AdminExpenses } from './pages/AdminExpenses';

export function App() {
  const { user, activeTab } = useAuth();

  if (!user) {
    return <Login />;
  }

  const isAdmin = user.role === 'Admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
      case 'add-expense':
        return <AddExpense />;
      case 'donations':
        return <AdminDonations />;
      case 'members':
        return <AdminMembers />;
      case 'expenses':
        return <AdminExpenses />;
      default:
        return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#dcebfa] via-[#edf5fc] to-[#f5f9fd]">
      <main className="pb-16 sm:pb-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
