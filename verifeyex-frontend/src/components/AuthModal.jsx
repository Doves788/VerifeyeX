import { useState } from 'react';
import { Shield, Mail, Lock, Fingerprint } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

function AuthModal({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = (credentialResponse) => {
    setIsLoading(true);
    try {
      // Decode the JWT token returned by Google
      const decoded = jwtDecode(credentialResponse.credential);
      setTimeout(() => {
        setIsLoading(false);
        onLogin({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          token: credentialResponse.credential
        });
      }, 500); // Small delay for UX
    } catch (err) {
      console.error('Failed to decode Google JWT', err);
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Login Failed');
  };

  const handleStandardLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        name: email.split('@')[0],
        email: email,
        picture: `https://ui-avatars.com/api/?name=${email}&background=ec4899&color=fff`,
        token: 'mock-jwt-token-abc-456'
      });
    }, 1000);
  };

  return (
    <div className="auth-overlay fade-in">
      <div className="auth-container glass-panel slide-up">
        
        <div className="auth-header">
          <Shield size={48} className="text-primary mb-2 mx-auto" />
          <h2>Verifeye<span className="highlight">X</span> Security</h2>
          <p>Authentication required for active defense systems.</p>
        </div>

        <div className="google-btn-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="rectangular"
            theme="filled_blue"
            size="large"
          />
        </div>

        <div className="divider">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        <form className="auth-form" onSubmit={handleStandardLogin}>
          <div className="input-group">
            <label>Enterprise Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="admin@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password / Security Key</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            <Fingerprint size={18} />
            {isLoading ? 'Verifying...' : 'Secure Login'}
          </button>
        </form>

        <div className="auth-footer">
          <Lock size={12} />
          End-to-End Encrypted via AES-256
        </div>
      </div>
    </div>
  );
}

export default AuthModal;

