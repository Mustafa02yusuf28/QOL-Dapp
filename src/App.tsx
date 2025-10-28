import React, { Suspense, lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { WalletProvider, useWallet } from './components/WalletProvider';
import { UserRewards } from './components/UserRewards';
import { ThreeBackground } from './components/ThreeBackground';
import './index.css';

// Lazy load components for code splitting
const MapView = lazy(() => import('./components/MapView'));
const SubmissionForm = lazy(() => import('./components/SubmissionForm'));
const VerificationQueue = lazy(() => import('./components/VerificationQueue'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading QoL Index DApp...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingSpinner />}>
          <WalletProvider>
            <div className="relative min-h-screen bg-gradient-to-b from-[#1a1625] to-[#0d0a15] text-white overflow-hidden">
              {/* 3D Background with blur */}
              <div className="absolute inset-0 overflow-hidden">
                <ThreeBackground />
                <div className="absolute inset-0 backdrop-blur-sm bg-black/40"></div>
              </div>
              
              {/* Main Content */}
              <div className="relative z-10">
                <AppContent />
              </div>
            </div>
          </WalletProvider>
        </Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Main app content component
function AppContent() {
  const [view, setView] = React.useState('map');
  const { isConnected } = useWallet();

  return (
    <>
      <Header view={view} setView={setView} />
      {isConnected && (
        <div className="fixed top-24 right-6 z-40 hidden lg:block">
          <UserRewards />
        </div>
      )}
      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        <Suspense fallback={<LoadingSpinner />}>
          {view === 'map' && <MapView />}
          {view === 'submit' && <SubmissionForm />}
          {view === 'verify' && <VerificationQueue />}
        </Suspense>
      </main>
    </>
  );
}

// Header component
function Header({ view, setView }: { 
  view: string; 
  setView: (view: string) => void;
}) {
  const { isConnected, publicKey, connectWallet, disconnectWallet } = useWallet();

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20 py-4 md:py-4 px-4 md:px-6 flex flex-nowrap justify-between items-center fixed top-0 left-0 right-0 z-50 shadow-lg h-16 md:h-20 overflow-hidden">
      <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white flex-shrink-0 whitespace-nowrap">
        <span className="bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">QoL</span> Index DApp
      </h1>
      
      <nav className="flex space-x-2 md:space-x-3 items-center flex-shrink-0">
        <button
          onClick={() => setView('map')}
          className={`nav-btn-base px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
            view === 'map' ? 'nav-btn-active' : ''
          }`}
        >
          <span className="hidden md:inline">Map View</span>
          <span className="md:hidden">Map</span>
        </button>
        <button
          onClick={() => setView('submit')}
          className={`nav-btn-base px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
            view === 'submit' ? 'nav-btn-active' : ''
          }`}
          disabled={!isConnected}
        >
          <span className="hidden md:inline">Submit Audit</span>
          <span className="md:hidden">Submit</span>
        </button>
        <button
          onClick={() => setView('verify')}
          className={`nav-btn-base px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
            view === 'verify' ? 'nav-btn-active' : ''
          }`}
          disabled={!isConnected}
        >
          <span className="hidden md:inline">Verify Data</span>
          <span className="md:hidden">Verify</span>
        </button>
      </nav>

      <div className="flex items-center space-x-2 flex-shrink-0">
        {isConnected && publicKey ? (
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 md:px-3 py-1 md:py-2 rounded-lg truncate max-w-[100px] md:max-w-[120px]">
              {publicKey.substring(0, 6)}...{publicKey.substring(publicKey.length - 4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm transition"
            >
              <span className="hidden md:inline">Disconnect</span>
              <span className="md:hidden">✕</span>
            </button>
          </div>
        ) : (
          <button
            onClick={async () => {
              console.log('🟢 Button clicked!');
              await connectWallet();
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-semibold transition shadow-lg"
          >
            <span className="hidden md:inline">Connect Phantom</span>
            <span className="md:hidden">Connect</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default App;