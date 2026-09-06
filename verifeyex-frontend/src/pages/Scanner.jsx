import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import '../App.css';

const SOCKET_URL = 'http://localhost:3001';

function Scanner({ onDeduct }) {
  const [isRecording, setIsRecording] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  
  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const heatmapCanvasRef = useRef(null); // Ref for XAI Heatmap
  const animationRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('prediction_result', (data) => {
      setPrediction(data);
      if (!data.error && !data.is_silence) {
        setHistory(prev => {
          const newHist = [...prev, data];
          return newHist.slice(-5);
        });
      }
      
      // Draw Heatmap if available
      if (data.mfcc_heatmap && data.mfcc_heatmap.length > 0) {
        drawHeatmap(data.mfcc_heatmap);
      }
    });

    return () => {
      socketRef.current.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const drawHeatmap = (mfccMatrix) => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rows = mfccMatrix.length;
    const cols = mfccMatrix[0].length;
    
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Find min and max for color scaling
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (mfccMatrix[i][j] < min) min = mfccMatrix[i][j];
        if (mfccMatrix[i][j] > max) max = mfccMatrix[i][j];
      }
    }
    
    // Draw cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = mfccMatrix[i][j];
        // Normalize 0 to 1
        const norm = (val - min) / (max - min);
        // Cool color scale (blue to pink/red)
        const r = Math.floor(norm * 255);
        const g = Math.floor((1 - Math.abs(norm - 0.5) * 2) * 150);
        const b = Math.floor((1 - norm) * 255);
        
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        // Draw bottom up (higher frequencies at top)
        ctx.fillRect(j * cellWidth, canvas.height - ((i + 1) * cellHeight), Math.ceil(cellWidth), Math.ceil(cellHeight));
      }
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const analyser = analyserRef.current;
    
    const bufferLength = analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecording) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (width / bufferLength) * 2.5;
      let barX = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (freqData[i] / 255) * height;
        const r = barHeight + (25 * (i/bufferLength));
        const g = 250 * (i/bufferLength);
        const b = 250;
        
        ctx.fillStyle = `rgba(${r},${g},${b}, 0.6)`;
        ctx.fillRect(barX, height - barHeight, barWidth, barHeight);
        
        barX += barWidth + 1;
      }
      
      ctx.lineWidth = 3;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');
      ctx.strokeStyle = gradient;
      
      ctx.beginPath();
      
      const sliceWidth = width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = v * height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  useEffect(() => {
    drawVisualizer();
  }, []);

  const startRecording = async () => {
    // 1. DEDUCT BALANCE FOR SAAS TRIAL
    if (onDeduct && !onDeduct(25)) {
      return; // Stop if not enough balance!
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: StereoAudioRecorder,
        timeSlice: 2000,
        ondataavailable: (blob) => {
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('audio_chunk', blob);
          }
        },
      });

      recorderRef.current.startRecording();
      setIsRecording(true);
      setPrediction(null);
      setHistory([]);
      
      if (heatmapCanvasRef.current) {
        const ctx = heatmapCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, heatmapCanvasRef.current.width, heatmapCanvasRef.current.height);
      }
      
      setTimeout(drawVisualizer, 50);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        setIsRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setTimeout(drawVisualizer, 50);
      });
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>Live Audio Intelligence</h1>
        <p>Stream microphone data via WebSockets for real-time inference.</p>
      </div>

      <main className="main-content">
        <section className="scanner-section">
          <div className="scanner-card glass-panel">
            <div className="card-header">
              <h2>Scanner Terminal</h2>
              <div className={`status-badge ${isRecording ? 'active' : 'idle'}`}>
                {isRecording ? '● Live Recording' : 'System Idle'}
              </div>
            </div>

            <div className="visualizer-container">
               <canvas ref={canvasRef} width="600" height="120" className="visualizer" />
            </div>

            <div className="controls">
              {!isRecording ? (
                <button className="btn start-btn" onClick={startRecording}>
                  Initialize Scanner
                </button>
              ) : (
                <button className="btn stop-btn" onClick={stopRecording}>
                  Terminate Connection
                </button>
              )}
            </div>

            <div className="results-grid">
              <div className="results-panel">
                <h3 className="section-title">Network Output</h3>
                {prediction ? (
                  prediction.is_silence ? (
                    <div className="prediction-alert safe">
                      <div className="pred-icon">💤</div>
                      <div className="pred-details">
                        <div className="pred-title">Silence Detected</div>
                        <div className="pred-conf">Skipping AI inference to save compute.</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`prediction-alert ${prediction.prediction === 'AI Deepfake' ? 'danger' : 'safe'}`}>
                      <div className="pred-icon">
                        {prediction.prediction === 'AI Deepfake' ? '⚠️' : '✅'}
                      </div>
                      <div className="pred-details">
                        <div className="pred-title">{prediction.prediction}</div>
                        {prediction.confidence && (
                          <div className="pred-conf">Network Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
                        )}
                        {prediction.identity && prediction.identity !== 'Unknown' ? (
                          <div className="pred-identity" style={{color: '#10b981', marginTop: '4px', fontSize: '0.9rem', fontWeight: 'bold'}}>
                            👤 Verified Identity: {prediction.identity} ({(prediction.identity_confidence * 100).toFixed(0)}% Match)
                          </div>
                        ) : prediction.prediction !== 'AI Deepfake' && (
                          <div className="pred-identity" style={{color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem'}}>
                            👤 Identity: Unknown Caller
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="waiting-placeholder">
                    {isRecording ? (
                      <div className="loading-pulse">Analyzing MFCCs against ResNet database...</div>
                    ) : (
                      "Awaiting audio input stream."
                    )}
                  </div>
                )}
              </div>

              {/* XAI Heatmap Display */}
              <div className="xai-panel">
                <h3 className="section-title">Acoustic Fingerprint (XAI)</h3>
                <div className="heatmap-container">
                  <canvas ref={heatmapCanvasRef} width="300" height="100" className="heatmap-canvas" />
                </div>
                <p className="xai-caption">Normalized MFCC matrix fed to the ResNet</p>
              </div>
            </div>

            {/* Active Threat Investigation Dashboard */}
            {prediction && prediction.investigation && (
              <div className="investigation-dashboard glass-panel">
                <div className="dashboard-header">
                  <h3>🚨 Autonomous Threat Investigation Swarm</h3>
                  <div className="pulse-indicator">Active</div>
                </div>
                <div className="agent-logs">
                  <div className="agent-log">
                    <span className="agent-name">Transcriber Agent:</span> 
                    <span className="agent-msg">{prediction.investigation.transcription}</span>
                  </div>
                  <div className="agent-log">
                    <span className="agent-name">Fusion Profiler:</span> 
                    <span className="agent-msg">{prediction.investigation.profiler}</span>
                  </div>
                  <div className="agent-log action-log">
                    <span className="agent-name">Active Responder:</span> 
                    <span className="agent-msg">{prediction.investigation.action}</span>
                  </div>
                </div>
              </div>
            )}
            
            {history.length > 0 && (
              <div className="history-panel">
                <h4 className="section-title">Timeline History (Last 10s)</h4>
                <div className="timeline">
                  {history.map((h, i) => (
                    <div 
                      key={i} 
                      className={`timeline-dot ${h.prediction === 'AI Deepfake' ? 'danger-dot' : 'safe-dot'}`} 
                      title={`${h.prediction} (${(h.confidence*100).toFixed(1)}%)`}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Scanner;
