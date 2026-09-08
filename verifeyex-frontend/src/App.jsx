import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, SignIn, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Technology from './pages/Technology';
import Enrollment from './pages/Enrollment';
import Profile from './pages/Profile';
import PaymentModal from './components/PaymentModal';
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
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
      <div className="page-wrapper">
        <Navbar onUpgradeClick={() => setShowPayment(true)} balance={balance} />
        
        {showPayment && (
          <PaymentModal 
            onClose={() => setShowPayment(false)} 
            onRecharge={() => setBalance(1000)} 
          />
        )}

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/enroll" element={<Enrollment />} />
          <Route path="/scanner" element={<Scanner onDeduct={handleDeduct} />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/profile" element={<Profile balance={balance} history={history} />} />
          
          {/* Protected Routes (Require Authentication) */}
          <Route path="/enroll" element={<ProtectedRoute><Enrollment /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner onDeduct={handleDeduct} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile balance={balance} history={history} /></ProtectedRoute>} />
        </Routes>
        <footer>
          <p>VerifeyeX Security Systems &copy; {new Date().getFullYear()} | Autonomous Voice Threat Intelligence</p>
        </footer>
      </div>
    </Router>
  );
}

function App() {
  if (!clerkPubKey) {
    return (
      <div className="auth-overlay fade-in" style={{ textAlign: 'center', padding: '2rem', color: '#fff' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: '#ef4444' }}>Missing Clerk API Key!</h2>
          <p>You requested Clerk Authentication, but the <strong>VITE_CLERK_PUBLISHABLE_KEY</strong> is missing from your `.env` file.</p>
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem' }}>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1' }}>
              <li>Go to <strong>clerk.com</strong> and create a free account.</li>
              <li>Create a new application.</li>
              <li>Copy your Publishable Key.</li>
              <li>Create a `.env` file in the `verifeyex-frontend` folder.</li>
              <li>Paste it as: <br/><code style={{ color: '#6ee7b7' }}>VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."</code></li>
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
