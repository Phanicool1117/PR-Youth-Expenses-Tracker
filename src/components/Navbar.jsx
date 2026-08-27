import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShadcnTabs } from './ui/ShadcnTabs';
import { LayoutDashboard, PlusCircle, CreditCard, Users } from 'lucide-react';

export function Navbar() {
  const { user, activeTab, setActiveTab } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'Admin';

  // Member Tabs: Home & Add (Activity is integrated into Home!)
  const memberTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add', icon: CreditCard },
  ];

  // Admin Tabs: Overview, Donations, Members, Expenses
  const adminTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'donations', label: 'Donations', icon: PlusCircle },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
  ];

  const currentTabs = isAdmin ? adminTabs : memberTabs;

  return (
    <div className="w-full">
      <ShadcnTabs
        tabs={currentTabs}
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />
    </div>
  );
}
