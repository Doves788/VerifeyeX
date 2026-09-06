import { Clock, Coins, ShieldCheck, Activity } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import './Profile.css';

function Profile({ balance, history }) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>SaaS Account Dashboard</h1>
        <p>Manage your billing, credits, and active defense usage history.</p>
      </div>

      <div className="profile-container">
        
        {/* User Card */}
        <div className="profile-sidebar glass-panel">
          <img src={user.imageUrl} alt="Profile" className="profile-avatar-large" />
          <h2>{user.fullName}</h2>
          <p className="profile-email">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="account-status">
            <ShieldCheck size={16} className="text-success" /> Enterprise Verified
          </div>
          
          <div className="balance-card">
            <div className="balance-header">
              <Coins size={20} color="#fbbf24" /> Available Credits
            </div>
            <div className="balance-amount">${balance}</div>
            <p className="balance-desc">Current SaaS Balance</p>
          </div>
        </div>

        {/* History Panel */}
        <div className="history-panel glass-panel">
          <h3><Activity size={20} /> Platform Usage History</h3>
          <p className="history-desc">Total Active Defense Scans: <strong>{history.length}</strong></p>
          
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-history">
                No usage history yet. Go to the Live Scanner to run your first Deepfake check.
              </div>
            ) : (
              history.slice().reverse().map((log, index) => (
                <div key={index} className="history-item">
                  <div className="history-icon">
                    <Clock size={16} />
                  </div>
                  <div className="history-details">
                    <div className="history-action">{log.action}</div>
                    <div className="history-time">{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="history-cost text-error">
                    -${log.cost}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;

