import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'

// Ensure clean direct browser rendering without Service Worker cache lockups
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
  } catch (e) {}
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md max-w-sm w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-800">Something went wrong</h2>
            <p className="text-xs text-slate-500">Please tap below to refresh the page.</p>
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#0f52ba] text-white font-bold text-sm shadow-sm active:scale-95 cursor-pointer"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
