import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShadcnTabs } from './ui/ShadcnTabs';
import { LayoutDashboard, PlusCircle, Users, HeartHandshake, Flame } from 'lucide-react';

export function Navbar() {
  const { user, activeTab, setActiveTab, donationSubTab, setDonationSubTab } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'Admin';

  // Member Tabs: Home & Add
  const memberTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'add-expense', label: 'Add', icon: PlusCircle },
  ];

  // Admin Tabs: Overview, Donations (with Chanda & Laddu sub-options), Members
  const adminTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'donations',
      label: 'Donations',
      icon: PlusCircle,
      subTabs: [
        { id: 'chanda', label: 'Chanda', icon: HeartHandshake },
        { id: 'laddu', label: 'Laddu Auction', icon: Flame },
      ],
    },
    { id: 'members', label: 'Members', icon: Users },
  ];

  const currentTabs = isAdmin ? adminTabs : memberTabs;

  return (
    <div className="w-full">
      <ShadcnTabs
        tabs={currentTabs}
        activeTab={activeTab}
        donationSubTab={donationSubTab}
        onSelectTab={(tabId, subTabId) => {
          setActiveTab(tabId);
          if (subTabId) {
            setDonationSubTab(subTabId);
          }
        }}
      />
    </div>
  );
}
