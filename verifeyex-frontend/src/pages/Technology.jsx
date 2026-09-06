import { Database, Activity, GitBranch } from 'lucide-react';
import './Technology.css';

function Technology() {
  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>Platform Architecture</h1>
        <p>A deep dive into the Machine Learning and System Design powering VerifeyeX.</p>
      </div>

      <div className="tech-container">
        <div className="tech-card glass-panel">
          <div className="tech-icon-wrapper"><Activity size={32} className="text-blue" /></div>
          <h2>1. Deep Signal Processing (DSP)</h2>
          <p>
            Raw audio waves are incredibly dense and inefficient for Neural Networks. 
            Before inference, our Python pipeline extracts <strong>Mel-Frequency Cepstral Coefficients (MFCCs)</strong>.
            This isolates the exact frequency bands where AI voice-cloning vocoders leave behind microscopic, 
            robotic statistical anomalies (vocoder artifacts) that are entirely invisible to human ears.
          </p>
        </div>

        <div className="tech-card glass-panel">
          <div className="tech-icon-wrapper"><Database size={32} className="text-purple" /></div>
          <h2>2. Deep Residual Networks (ResNet)</h2>
          <p>
            By treating the MFCC acoustic fingerprint as a 2D image, we feed the data into a 
            <strong> ResNet architecture</strong>. ResNets are historically the most powerful networks for 
            detecting microscopic texture patterns in 2D grids. This is the exact methodology utilized by researchers 
            winning the international ASVspoof (Automatic Speaker Verification Spoofing) challenges.
          </p>
        </div>

        <div className="tech-card glass-panel">
          <div className="tech-icon-wrapper"><GitBranch size={32} className="text-red" /></div>
          <h2>3. Autonomous OpenRouter Swarm</h2>
          <p>
            VerifeyeX transcends passive binary detection. When a threat is flagged by the PyTorch model, 
            an orchestration layer dispatches a multi-agent swarm via the <strong>OpenRouter API</strong>.
            Transcriber agents extract the payload, Profiler agents semantically analyze the intent (e.g. CEO Wire Fraud), 
            and Responder agents deploy counter-measures in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Technology;

