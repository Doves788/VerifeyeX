import { useState, useRef } from 'react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import { Fingerprint, UserCheck, Loader } from 'lucide-react';
import './Enrollment.css';

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
      const response = await fetch('http://localhost:8000/enroll', {
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
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>Voice Biometric Enrollment</h1>
        <p>Register your acoustic identity in the Vector Database.</p>
      </div>
      
      <div className="enrollment-container">
        <div className="enrollment-card glass-panel">
          <div className="enroll-icon">
            {status === 'success' ? <UserCheck size={48} className="text-success" /> : <Fingerprint size={48} className="text-blue" />}
          </div>
          
          <h2>Identity Registration</h2>
          <p className="enroll-desc">
            To enable Active Defense, we need to map your voice. 
            Enter your ID and read the phrase: <strong>"My voice is my password, verify my identity."</strong>
          </p>
          
          <input 
            type="text" 
            className="enroll-input" 
            placeholder="e.g. CEO_John_Doe" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={status === 'recording' || status === 'processing'}
          />
          
          <button 
            className={`btn-enroll ${isRecording ? 'recording' : ''}`}
            onClick={startEnrollment}
            disabled={isRecording || status === 'processing'}
          >
            {isRecording ? '● Recording...' : status === 'processing' ? <Loader className="spin" size={20} /> : 'Begin Voice Capture'}
          </button>
          
          {message && (
            <div className={`enroll-message status-${status}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Enrollment;

