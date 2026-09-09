import { useState, useRef } from 'react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import { Fingerprint, UserCheck, Loader } from 'lucide-react';

function Enrollment() {
  const [username, setUsername] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, recording, processing, success, error
  const [message, setMessage] = useState('');
  
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const startEnrollment = async () => {
    if (!username.trim()) {
      setMessage('Please enter a username or ID.');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: StereoAudioRecorder,
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
      setStatus('recording');
      setMessage('Recording 5 seconds of your voice...');
      
      // Auto-stop after 5 seconds
      setTimeout(stopEnrollment, 5000);
      
    } catch (err) {
      console.error(err);
      setMessage('Microphone access denied.');
      setStatus('error');
    }
  };

  const stopEnrollment = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(async () => {
        setIsRecording(false);
        setStatus('processing');
        setMessage('Extracting 60-Dimensional MFCC Voiceprint...');
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const audioBlob = recorderRef.current.getBlob();
        await uploadVoiceprint(audioBlob);
      });
    }
  };

  const uploadVoiceprint = async (blob) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('audio', blob, 'enroll.wav');
    
    try {
      const response = await fetch('`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/enroll`', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to connect to FastAPI backend.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Voice Biometric Enrollment</h1>
        <p className="text-lg text-slate-400">Register your acoustic identity in the Vector Database.</p>
        <div className="h-1 w-16 bg-amber-600 mx-auto rounded-full mt-4"></div>
      </div>
      
      <div className="flex justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 w-full max-w-lg shadow-xl">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
              {status === 'success' ? (
                <UserCheck size={48} className="text-emerald-400" />
              ) : (
                <Fingerprint size={48} className="text-amber-500" />
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-4">Identity Registration</h2>
          <p className="text-slate-400 text-center mb-8 text-sm leading-relaxed">
            To enable Active Defense, we need to map your voice. 
            Enter your ID and read the phrase: <br/><strong className="text-slate-200 mt-2 block">"My voice is my password, verify my identity."</strong>
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Username</label>
              <input 
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder-slate-600" 
                placeholder="e.g. CEO_John_Doe" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={status === 'recording' || status === 'processing'}
              />
            </div>
            
            <button 
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 font-medium rounded-md transition-all duration-200 
                ${isRecording 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse cursor-not-allowed' 
                  : status === 'processing'
                  ? 'bg-amber-600/50 text-white/70 border border-amber-600/50 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-[0.98] shadow-lg shadow-amber-500/20'
                }`}
              onClick={startEnrollment}
              disabled={isRecording || status === 'processing'}
            >
              {isRecording ? (
                <>ðŸ”´ Recording (5s)...</>
              ) : status === 'processing' ? (
                <><Loader className="animate-spin" size={20} /> Processing Audio...</>
              ) : (
                'Begin Voice Capture'
              )}
            </button>
            
            {message && (
              <div className={`p-4 rounded-md text-sm font-medium border text-center ${
                status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Enrollment;


