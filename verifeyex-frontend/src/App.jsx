import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Technology from './pages/Technology';
import Enrollment from './pages/Enrollment';
import Profile from './pages/Profile';
import PaymentModal from './components/PaymentModal';


const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center p-16 text-center max-w-2xl mx-auto my-16 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
          <h2 className="mb-4 text-3xl font-bold text-slate-100 tracking-tight">Authentication Required</h2>
          <p className="mb-10 text-lg text-slate-400 leading-relaxed max-w-lg">
            Please log in for full usage of the platform. You must authenticate your identity to access the Live Scanner and Voice Enrollment systems.
          </p>
          <SignInButton mode="modal">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-all duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95">
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
};

function AppContent() {
  const [showPayment, setShowPayment] = useState(false);
  
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('verifeyex_balance');
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('verifeyex_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('verifeyex_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('verifeyex_history', JSON.stringify(history));
  }, [history]);

  const handleDeduct = (amount) => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setHistory(prev => [...prev, {
        action: 'Active Defense Scan Initialized',
        cost: amount,
        timestamp: new Date().toISOString()
      }]);
      return true;
    }
    setShowPayment(true);
    return false;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar onUpgradeClick={() => setShowPayment(true)} balance={balance} />
        
        {showPayment && (
          <PaymentModal 
            onClose={() => setShowPayment(false)} 
            onRecharge={() => setBalance(1000)} 
          />
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/technology" element={<Technology />} />
            
            {/* Protected Routes (Require Authentication) */}
            <Route path="/enroll" element={<ProtectedRoute><Enrollment /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Scanner onDeduct={handleDeduct} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile balance={balance} history={history} /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="w-full text-center py-8 text-sm text-slate-500 border-t border-slate-800 bg-slate-950 mt-auto">
          <p>VerifeyeX Security Systems &copy; {new Date().getFullYear()} | Autonomous Voice Threat Intelligence</p>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  if (!clerkPubKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-8 text-white">
        <div className="bg-slate-900 border border-slate-800 p-12 max-w-lg mx-auto rounded-xl shadow-2xl">
          <h2 className="text-red-500 text-2xl font-bold mb-4">Missing Clerk API Key!</h2>
          <p className="text-slate-300 mb-6">You requested Clerk Authentication, but the <strong className="text-slate-100 font-mono">VITE_CLERK_PUBLISHABLE_KEY</strong> is missing from your <code className="font-mono text-sm bg-slate-800 px-1 py-0.5 rounded">.env</code> file.</p>
          <div className="text-left bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 mt-6">
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Go to <strong className="text-white">clerk.com</strong> and create a free account.</li>
              <li>Create a new application.</li>
              <li>Copy your Publishable Key.</li>
              <li>Create a <code className="font-mono text-sm">.env</code> file in the <code className="font-mono text-sm">verifeyex-frontend</code> folder.</li>
              <li>Paste it as: <br/><code className="text-emerald-400 font-mono text-sm block mt-2 p-2 bg-slate-900 rounded border border-slate-800">VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."</code></li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;
