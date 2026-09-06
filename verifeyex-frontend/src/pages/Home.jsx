import { Link } from 'react-router-dom';
import { ShieldAlert, Fingerprint, Network } from 'lucide-react';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <header className="hero-landing">
        <div className="hero-badge">Enterprise Voice Intelligence</div>
        <h1 className="hero-title">Zero-Trust Audio Authentication</h1>
        <p className="hero-subtitle">
          Voice cloning fraud is costing enterprises billions. Defend your organization with VerifeyeX—an autonomous AI swarm that analyzes acoustic fingerprints in real-time to detect synthetic voice threats before they breach your security.
        </p>
        <div className="hero-actions">
          <Link to="/scanner" className="btn-primary-large">Try Live Demo</Link>
          <Link to="/technology" className="btn-secondary-large">Read Whitepaper</Link>
        </div>
      </header>

      <section className="features-section">
        <h2 className="section-heading">Why VerifeyeX?</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <ShieldAlert size={40} className="feature-icon text-red" />
            <h3>Defeat Social Engineering</h3>
            <p>Generative AI has made CEO impersonation and wire-fraud trivial. Our platform intercepts voice streams over VoIP or WebSockets, neutralizing threats before the human ear can be deceived.</p>
          </div>
          <div className="feature-card glass-panel">
            <Fingerprint size={40} className="feature-icon text-blue" />
            <h3>Acoustic Fingerprinting</h3>
            <p>We extract Deep Mel-Frequency Cepstral Coefficients (MFCCs) to identify the microscopic algorithmic artifacts left by AI vocoders—glitches invisible to humans but obvious to our ResNet architecture.</p>
          </div>
          <div className="feature-card glass-panel">
            <Network size={40} className="feature-icon text-purple" />
            <h3>Autonomous Agent Swarm</h3>
            <p>More than just a binary flag. When a threat is detected, our simulated OpenRouter agent swarm immediately transcribes the payload, profiles the attack vector, and deploys rapid countermeasures.</p>
          </div>
        </div>
      </section>

      <section className="enterprise-trust">
        <div className="trust-content">
          <h2>Built for Modern Fintech & Cybersecurity</h2>
          <p>Designed with ultra-low latency streaming in mind. Whether you are a bank verifying customer identities or an enterprise securing internal communications, our WebSocket-to-FastAPI pipeline ensures millisecond response times without compromising on deep learning accuracy.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;

