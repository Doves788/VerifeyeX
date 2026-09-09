import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';

const SOCKET_URL = import.meta.env.VITE_RELAY_URL || 'http://localhost:3001';

function Scanner({ onDeduct, onRequestUpgrade }) {
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
    if (rows === 0) return;
    const cols = mfccMatrix[0].length;
    if (cols === 0) return;
    
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;
    
    // Clear canvas
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }
      
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);
      
      ctx.fillStyle = 'rgba(2, 6, 23, 1)';
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
      gradient.addColorStop(0, '#f59e0b');
      gradient.addColorStop(0.5, '#ef4444');
      gradient.addColorStop(1, '#b91c1c');
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
      if (onRequestUpgrade) onRequestUpgrade();
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
    <div className="w-full max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Live Audio Intelligence</h1>
        <p className="text-lg text-slate-400">Stream microphone data via WebSockets for real-time inference.</p>
        <div className="h-1 w-16 bg-amber-600 mx-auto rounded-full mt-4"></div>
      </div>

      <main className="w-full">
        <section className="w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <h2 className="text-2xl font-bold text-white">Scanner Terminal</h2>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2 ${isRecording ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {isRecording ? <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live Recording</> : 'System Idle'}
              </div>
            </div>

            <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 mb-8">
               <canvas ref={canvasRef} width="600" height="120" className="w-full h-[120px] rounded" />
            </div>

            <div className="flex justify-center mb-10">
              {!isRecording ? (
                <button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow-lg shadow-emerald-500/20 transition-all duration-200 active:scale-95" onClick={startRecording}>
                  Initialize Scanner
                </button>
              ) : (
                <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md shadow-lg shadow-red-500/20 transition-all duration-200 active:scale-95" onClick={stopRecording}>
                  Terminate Connection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Network Output */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Network Output</h3>
                {prediction ? (
                  prediction.error ? (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="text-2xl mt-1">❌</div>
                      <div>
                        <div className="text-red-400 font-bold text-xl mb-1">Server Error</div>
                        <div className="text-red-300/80 text-sm">{prediction.error}</div>
                      </div>
                    </div>
                  ) : prediction.is_silence ? (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="text-2xl">💤</div>
                      <div>
                        <div className="text-white font-bold text-lg mb-1">Silence Detected</div>
                        <div className="text-slate-400 text-sm">Skipping AI inference to save compute.</div>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex items-start gap-4 p-4 rounded-lg border ${prediction.prediction === 'AI Deepfake' ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                      <div className="text-2xl mt-1">
                        {prediction.prediction === 'AI Deepfake' ? '🚨' : '✅'}
                      </div>
                      <div>
                        <div className={`font-bold text-xl mb-1 ${prediction.prediction === 'AI Deepfake' ? 'text-red-400' : 'text-emerald-400'}`}>{prediction.prediction}</div>
                        {prediction.confidence && (
                          <div className="text-slate-300 text-sm mb-2">Network Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
                        )}
                        {prediction.identity && prediction.identity !== 'Unknown' ? (
                          <div className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-2 py-1 rounded inline-block">
                            👤 Verified Identity: {prediction.identity} ({(prediction.identity_confidence * 100).toFixed(0)}% Match)
                          </div>
                        ) : prediction.prediction !== 'AI Deepfake' && (
                          <div className="text-slate-400 text-sm bg-slate-800 px-2 py-1 rounded inline-block">
                            👤 Identity: Unknown Caller
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-32 border border-dashed border-slate-700 rounded-lg bg-slate-900/50">
                    {isRecording ? (
                      <div className="text-amber-400 animate-pulse text-sm font-medium">Analyzing MFCCs against ResNet database...</div>
                    ) : (
                      <span className="text-slate-500 text-sm">Awaiting audio input stream.</span>
                    )}
                  </div>
                )}
              </div>

              {/* XAI Heatmap Display */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Acoustic Fingerprint (XAI)</h3>
                <div className="w-full bg-slate-900 border border-slate-800 rounded overflow-hidden mb-2">
                  <canvas ref={heatmapCanvasRef} width="300" height="100" className="w-full h-auto block" />
                </div>
                <p className="text-xs text-slate-500 text-center">Normalized MFCC matrix fed to the ResNet</p>
              </div>
            </div>

            {/* Active Threat Investigation Dashboard */}
            {prediction && prediction.investigation && (
              <div className="mt-8 bg-purple-900/10 border border-purple-500/30 rounded-lg overflow-hidden">
                <div className="bg-purple-900/40 px-6 py-3 border-b border-purple-500/30 flex items-center justify-between">
                  <h3 className="text-purple-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <span>⚡</span> Autonomous Threat Investigation Swarm
                  </h3>
                  <div className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full animate-pulse border border-purple-500/50">Active</div>
                </div>
                <div className="p-6 space-y-3 font-mono text-sm">
                  <div className="flex flex-col sm:flex-row gap-2 pb-3 border-b border-purple-900/30">
                    <span className="text-purple-400 font-bold min-w-[150px]">Transcriber Agent:</span> 
                    <span className="text-slate-300">{prediction.investigation.transcription}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pb-3 border-b border-purple-900/30">
                    <span className="text-purple-400 font-bold min-w-[150px]">Fusion Profiler:</span> 
                    <span className="text-slate-300">{prediction.investigation.profiler}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <span className="text-red-400 font-bold min-w-[150px]">Active Responder:</span> 
                    <span className="text-red-300 font-bold">{prediction.investigation.action}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Timeline */}
            {history.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Timeline History (Last 10s)</h4>
                <div className="flex items-center gap-2">
                  {history.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full ${h.prediction === 'AI Deepfake' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`} 
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

