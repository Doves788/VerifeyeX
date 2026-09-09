import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, Cpu, UserCheck, Zap, Coins } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';


function Navbar({ onUpgradeClick, balance }) {
  const location = useLocation();

  const navLinkClass = (path) => 
    `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
      location.pathname === path 
        ? 'text-white bg-slate-800/50' 
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">
                Verifeye<span className="text-amber-500">X</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={navLinkClass('/')}>
              <Shield size={16} /> Overview
            </Link>
            <Link to="/enroll" className={navLinkClass('/enroll')}>
              <UserCheck size={16} /> Enroll Voice
            </Link>
            <Link to="/scanner" className={navLinkClass('/scanner')}>
              <Activity size={16} /> Live Scanner
            </Link>
            <Link to="/technology" className={navLinkClass('/technology')}>
              <Cpu size={16} /> Technology
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <SignedIn>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-sm">
                <Coins size={14} className="text-emerald-400" />
                <span className="text-slate-300">Credits: <strong className="text-white">${balance}</strong></span>
              </div>
              <button 
                onClick={onUpgradeClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-400 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-md transition-colors"
              >
                <Zap size={14} className="fill-current" /> Pro
              </button>
              <Link to="/profile" className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors">
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-all duration-200 active:scale-95 shadow-lg shadow-amber-500/20">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
