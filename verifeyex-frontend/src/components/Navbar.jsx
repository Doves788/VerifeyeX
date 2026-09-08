import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Cpu, UserCheck, Zap, Coins } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import './Navbar.css';

function Navbar({ onUpgradeClick, balance }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <span className="logo-text">Verifeye<span className="highlight">X</span></span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <Shield size={18} /> Overview
        </Link>
        <Link to="/technology" className={`nav-link ${location.pathname === '/technology' ? 'active' : ''}`}>
          <Cpu size={18} /> Technology
        </Link>
        
        <SignedIn>
          <Link to="/enroll" className={`nav-link ${location.pathname === '/enroll' ? 'active' : ''}`}>
            <UserCheck size={18} /> Enroll Voice
          </Link>
          <Link to="/scanner" className={`nav-link ${location.pathname === '/scanner' ? 'active' : ''}`}>
            <Activity size={18} /> Live Scanner
          </Link>
        </SignedIn>
      </div>
      <div className="nav-actions">
        <SignedIn>
          <div className="balance-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Coins size={16} color="#fbbf24" /> 
            <span>Credits: <strong style={{ color: '#fbbf24' }}>${balance}</strong></span>
          </div>
          <button className="btn-upgrade" onClick={onUpgradeClick}>
            <Zap size={16} fill="currentColor" /> Upgrade to Pro
          </button>
          <div style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
          <Link to="/profile" className="btn-primary-small">Dashboard</Link>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn-primary-large" style={{ padding: '0.6rem 1.5rem', fontSize: '1rem' }}>Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}

export default Navbar;
