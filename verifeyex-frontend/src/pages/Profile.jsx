import { Clock, Coins, ShieldCheck, Activity } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

function Profile({ balance, history }) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">SaaS Account Dashboard</h1>
        <p className="text-lg text-slate-400">Manage your billing, credits, and active defense usage history.</p>
        <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full mt-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Card */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center text-center shadow-lg h-fit">
          <img src={user.imageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl mb-4" />
          <h2 className="text-xl font-bold text-white mb-1">{user.fullName}</h2>
          <p className="text-slate-400 text-sm mb-4">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full mb-8">
            <ShieldCheck size={14} /> Enterprise Verified
          </div>
          
          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">
              <Coins size={16} className="text-emerald-400" /> Available Credits
            </div>
            <div className="text-4xl font-extrabold text-white mb-1">${balance}</div>
            <p className="text-xs text-slate-500">Current SaaS Balance</p>
          </div>
        </div>

        {/* History Panel */}
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Activity size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Platform Usage History</h3>
          </div>
          <p className="text-slate-400 text-sm mb-8">Total Active Defense Scans: <strong className="text-white">{history.length}</strong></p>
          
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                No usage history yet. Go to the Live Scanner to run your first Deepfake check.
              </div>
            ) : (
              history.slice().reverse().map((log, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{log.action}</div>
                      <div className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded text-sm">
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

