import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { MemberDashboard } from './pages/MemberDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AddExpense } from './pages/AddExpense';
import { AdminDonations } from './pages/AdminDonations';
import { AdminMembers } from './pages/AdminMembers';
import { AdminExpenses } from './pages/AdminExpenses';
import { ScanQRModal } from './components/ScanQRModal';
import { triggerHaptic } from './utils/hapticsSound';
import { QrCode } from 'lucide-react';

export function App() {
  const { user, activeTab } = useAuth();
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Auto-hide scan button on scroll down to prevent overlapping content
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="relative min-h-screen bg-gradient-to-b from-[#dcebfa] via-[#edf5fc] to-[#f5f9fd]">
      
      {/* Scan QR Trigger Button (Anchored to top, disappears on scroll down) */}
      <div className={`absolute top-4 right-4 sm:top-6 sm:right-6 z-30 transition-all duration-300 transform ${
        isScrolled ? 'opacity-0 pointer-events-none -translate-y-3' : 'opacity-100 translate-y-0'
      }`}>
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setShowScanModal(true);
          }}
          className="relative group flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/95 hover:bg-white border border-blue-200 shadow-xl shadow-blue-500/10 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="Scan QR to Pay (GPay & PhonePe)"
        >
          {/* Subtle Halo */}
          <div className="absolute -inset-1 rounded-2xl bg-blue-400/20 animate-pulse pointer-events-none" />

          {/* Scanner Icon */}
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0f52ba] to-blue-500 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-4.5 h-4.5" />
          </div>

          <div className="pr-1 text-left hidden xs:block">
            <span className="block text-[11px] font-black text-slate-900 leading-tight">Scan QR</span>
            <span className="block text-[9px] font-bold text-[#0f52ba] leading-tight">GPay · PhonePe</span>
          </div>
        </button>
      </div>

      {/* Global QR Code Modal */}
      <ScanQRModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
      />

      <main className="pb-16 sm:pb-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
