import { Link } from 'react-router-dom';
import { ShieldAlert, Fingerprint, Network } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';

function Home() {
  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto space-y-24 py-12">
      {/* Hero Section */}
      <header className="text-center space-y-8 flex flex-col items-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium tracking-wide">
          Enterprise Voice Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Zero-Trust Audio <br className="hidden md:block" /> Authentication
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Voice cloning fraud is costing enterprises billions. Defend your organization with VerifeyeX—an autonomous AI swarm that analyzes acoustic fingerprints in real-time to detect synthetic voice threats before they breach your security.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <SignedIn>
            <Link to="/scanner" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              Access Live Platform
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Sign in to Access Platform
              </button>
            </SignInButton>
          </SignedOut>
          <Link to="/technology" className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold border border-slate-700 rounded-md transition-all duration-200 active:scale-95">
            Read Architecture
          </Link>
        </div>
      </header>

      {/* Features Grid */}
      <section className="w-full space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">Why VerifeyeX?</h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl hover:border-slate-700 transition-colors">
            <ShieldAlert size={36} className="text-red-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Defeat Social Engineering</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Generative AI has made CEO impersonation and wire-fraud trivial. Our platform intercepts voice streams over VoIP or WebSockets, neutralizing threats before the human ear can be deceived.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl hover:border-slate-700 transition-colors">
            <Fingerprint size={36} className="text-blue-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Acoustic Fingerprinting</h3>
            <p className="text-slate-400 text-sm leading-relaxed">We extract Deep Mel-Frequency Cepstral Coefficients (MFCCs) to identify the microscopic algorithmic artifacts left by AI vocoders—glitches invisible to humans but obvious to our ResNet architecture.</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl hover:border-slate-700 transition-colors">
            <Network size={36} className="text-purple-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Autonomous Agent Swarm</h3>
            <p className="text-slate-400 text-sm leading-relaxed">More than just a binary flag. When a threat is detected, our simulated agent swarm immediately transcribes the payload, profiles the attack vector, and deploys rapid countermeasures.</p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="w-full bg-blue-950/20 border border-blue-900/30 rounded-2xl p-10 md:p-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Built for Modern Fintech & Cybersecurity</h2>
        <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed text-lg">
          Designed with ultra-low latency streaming in mind. Whether you are a bank verifying customer identities or an enterprise securing internal communications, our WebSocket-to-FastAPI pipeline ensures millisecond response times without compromising on deep learning accuracy.
        </p>
      </section>
    </div>
  );
}



export default Home;

