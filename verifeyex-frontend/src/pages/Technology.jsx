import { Database, Activity, GitBranch } from 'lucide-react';

function Technology() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Platform Architecture</h1>
        <p className="text-lg text-slate-400">A deep dive into the Machine Learning and System Design powering VerifeyeX.</p>
        <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full mt-4"></div>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row gap-6 items-start">
          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 flex-shrink-0">
            <Activity size={32} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">1. Deep Signal Processing (DSP)</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Raw audio waves are incredibly dense and inefficient for Neural Networks. 
              Before inference, our Python pipeline extracts <strong className="text-slate-200 font-semibold">Mel-Frequency Cepstral Coefficients (MFCCs)</strong>.
              This isolates the exact frequency bands where AI voice-cloning vocoders leave behind microscopic, 
              robotic statistical anomalies (vocoder artifacts) that are entirely invisible to human ears.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row gap-6 items-start">
          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 flex-shrink-0">
            <Database size={32} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">2. Deep Residual Networks (ResNet)</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              By treating the MFCC acoustic fingerprint as a 2D image, we feed the data into a <strong className="text-slate-200 font-semibold">ResNet architecture</strong>. ResNets are historically the most powerful networks for 
              detecting microscopic texture patterns in 2D grids. This is the exact methodology utilized by researchers 
              winning the international ASVspoof (Automatic Speaker Verification Spoofing) challenges.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-slate-700 transition-all shadow-lg flex flex-col md:flex-row gap-6 items-start">
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex-shrink-0">
            <GitBranch size={32} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-3">3. Autonomous OpenRouter Swarm</h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              VerifeyeX transcends passive binary detection. When a threat is flagged by the PyTorch model, 
              an orchestration layer dispatches a multi-agent swarm via the <strong className="text-slate-200 font-semibold">OpenRouter API</strong>.
              Transcriber agents extract the payload, Profiler agents semantically analyze the intent (e.g. CEO Wire Fraud), 
              and Responder agents deploy counter-measures in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Technology;

