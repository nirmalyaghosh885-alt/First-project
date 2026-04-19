import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, Activity, Volume2, Maximize2, CheckCircle2, AlertTriangle, Box, Settings } from 'lucide-react';
import { initPoseDetection, checkSquatForm } from '../lib/poseDetection';
import { getCoachingCue } from '../lib/gemini';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface TrainerLiveProps {
  onClose: () => void;
  userName: string;
}

const TrainerLive = ({ onClose, userName }: TrainerLiveProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formStatus, setFormStatus] = useState<'PERFECT' | 'POOR_FORM' | 'DETECTING'>('DETECTING');
  const [feedback, setFeedback] = useState('Position yourself in view');
  const [aiCue, setAiCue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cueFrequency, setCueFrequency] = useState(5);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Rep tracking state
  const lastState = useRef<'UP' | 'DOWN'>('UP');

  // Tracking refs to avoid useEffect re-runs
  const formStatusRef = useRef<'PERFECT' | 'POOR_FORM' | 'DETECTING'>('DETECTING');
  const repCountRef = useRef(0);

  // Track if camera is already initialized to avoid restart-flicker on settings change
  const cameraInitializedRef = useRef(false);

  useEffect(() => {
    let poseDetector: any = null;
    let requestRef: number;
    let isMounted = true;

    const startCamera = async () => {
      if (cameraInitializedRef.current) return;
      
      try {
        // User-preferred resilient constraints
        const primaryConstraints: MediaStreamConstraints = { 
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          },
          audio: false
        };
        
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(primaryConstraints);
        } catch (initialErr) {
          console.warn("Retrying with minimal user-preferred constraints...", initialErr);
          // Simplified fallback as requested
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        }
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => {
              console.error("Video play error (interaction might be required):", e);
            });
            setIsLoaded(true);
            cameraInitializedRef.current = true;
          };
        }
      } catch (err: any) {
        console.error("Camera access totally denied:", err);
        if (isMounted) {
          if (err.name === "NotAllowedError") {
            setError("Camera access was denied. Please click the lock icon in your address bar to enable permissions for AuraGym.");
          } else if (err.name === "NotFoundError") {
            setError("No camera detected on this device. Please connect a webcam to continue.");
          } else {
            setError(`Camera Error: ${err.message || 'Permission denied'}`);
          }
        }
      }
    };

    const drawSkeleton = (landmarks: any[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      
      const statusObj = checkSquatForm(landmarks);
      const color = statusObj.isCorrect ? '#D9FF00' : '#FF4B4B';
      
      formStatusRef.current = statusObj.isCorrect ? 'PERFECT' : 'POOR_FORM';
      setFormStatus(formStatusRef.current);
      setFeedback(statusObj.feedback);

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';

      const connections = [
        [11, 12], [11, 23], [12, 24], [23, 24], 
        [23, 25], [25, 27], [24, 26], [26, 28]
      ];

      connections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (p1.visibility > 0.5 && p2.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      });

      landmarks.forEach((point: any, i: number) => {
        if (point.visibility > 0.5 && [11, 12, 23, 24, 25, 26, 27, 28].includes(i)) {
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fill();
        }
      });
    };

    const analyzeMovement = (landmarks: any[]) => {
      const hip = landmarks[23];
      const knee = landmarks[25];
      const dist = knee.y - hip.y;

      if (dist < 0.05 && lastState.current === 'UP') {
        lastState.current = 'DOWN';
      } else if (dist > 0.15 && lastState.current === 'DOWN') {
        lastState.current = 'UP';
        setRepCount(prev => {
          const next = prev + 1;
          repCountRef.current = next;
          if (next >= 10 && !isCompleted) {
            handleComplete();
          }
          if (next % cueFrequency === 0) triggerAiCue(next);
          return next;
        });
      }
    };

    const triggerAiCue = async (count: number) => {
      const cue = await getCoachingCue(userName, 'Squats', formStatusRef.current, count);
      setAiCue(cue);
      const utterance = new SpeechSynthesisUtterance(cue);
      window.speechSynthesis.speak(utterance);
      setTimeout(() => setAiCue(''), 4000);
    };

    const handleComplete = () => {
      setIsCompleted(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D9FF00', '#ffffff']
      });
    };

    const runDetection = async () => {
      // Detection setup
      poseDetector = await initPoseDetection();
      
      const detect = () => {
        if (!isMounted) return;
        if (videoRef.current && canvasRef.current && poseDetector) {
          const startTimeMs = performance.now();
          const results = poseDetector.detectForVideo(videoRef.current, startTimeMs);
          
          if (results.landmarks && results.landmarks.length > 0) {
            drawSkeleton(results.landmarks[0]);
            analyzeMovement(results.landmarks[0]);
          } else {
            formStatusRef.current = 'DETECTING';
            setFormStatus('DETECTING');
            setFeedback('No user detected');
          }
        }
        requestRef = requestAnimationFrame(detect);
      };

      detect();
    };

    const init = async () => {
      await startCamera();
      if (cameraInitializedRef.current) {
        await runDetection();
      }
    };

    init();

    return () => {
      isMounted = false;
      cancelAnimationFrame(requestRef);
      // We don't stop the tracks here if we want persistent camera during settings changes,
      // but in this case, on component unmount (when closing trainer), we MUST stop.
    };
  }, [userName]); // Only restart on user change, not on cueFrequency changes

  // Stop camera only when the whole TrainerLive is unmounted (e.g. onClose)
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        cameraInitializedRef.current = false;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-bg z-50 flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-surface-bright flex items-center justify-between px-6 z-[100]">
        <div className="flex items-center gap-3">
          <div className="logo-pill">AURA</div>
          <span className="font-bold text-sm tracking-tight text-text-main">GYM AI / SESSION_{Math.floor(Math.random() * 100)}</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <div className="stat-item">
            <span className="stat-label">Exercise</span>
            <span className="stat-value">Weighted Squats</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Intensity</span>
            <span className="stat-value">High</span>
          </div>
          <div className="stat-item text-error">
            <span className="stat-label">Heart Rate</span>
            <span className="stat-value">134 BPM</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            className="p-2 hover:bg-surface-bright rounded-lg transition-colors text-text-dim hover:text-accent"
          >
            <Settings size={20} />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-surface-bright rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-5 p-5 overflow-hidden">
        {/* Live Feed Container */}
        <div className="relative polish-card bg-black overflow-hidden flex items-center justify-center">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover scale-x-[-1]" 
            playsInline 
            muted 
          />
          <canvas 
            ref={canvasRef} 
            width={1280} 
            height={720} 
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
          />

          {/* HUD Overlays */}
          <div className="absolute top-6 left-6 right-6 flex justify-between pointer-events-none">
            <div className="form-status-pill">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {feedback}
            </div>

            <div className="bg-black/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center">
              <span className="stat-label mb-1">Current Reps</span>
              <span className="text-5xl font-mono font-black text-white leading-none">{repCount}</span>
              <span className="stat-label mt-2 opacity-50">Target: 10</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 text-white/10 font-black text-2xl uppercase tracking-widest">
            Live Camera Feed
          </div>
        </div>

        {/* Side Panel */}
        <aside className="hidden md:flex flex-col gap-5 overflow-y-auto">
          <div className="polish-card p-4 flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-text-dim">
              <span className="uppercase tracking-widest">PRO REFERENCE</span>
              <span className="uppercase tracking-widest text-accent">AI GHOST MODE</span>
            </div>
            
            <div className="flex-1 bg-surface-bright rounded-lg border border-white/5 flex items-center justify-center text-white/20 italic text-sm">
               [ AR_Trainer_Overlay ]
            </div>

            <p className="text-[11px] text-text-dim leading-relaxed">
              Match the digital shadow's pace to maximize muscle activation. Keep your heels planted and your chest upright during the entire movement range.
            </p>
          </div>

          <div className="polish-card p-4">
            <div className="stat-label mb-3">Active Prop</div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-surface-bright border border-accent rounded-lg flex items-center justify-center">
                <Box size={24} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">Bisleri 5L Bottle</p>
                <p className="text-[11px] text-accent font-mono">Est. 5.15 kg Resistance</p>
              </div>
            </div>
          </div>

          <div className="polish-card p-4">
            <div className="stat-label mb-3">Virtual Arena (4)</div>
            <div className="space-y-3">
               {[
                 { name: 'Sandeep R.', reps: 14, active: true },
                 { name: 'Ananya K.', reps: 11, active: false },
                 { name: 'Ishaan (Me)', reps: repCount, active: true },
               ].map((f, i) => (
                 <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                       <div className={cn("w-6 h-6 rounded-full border border-white/10", f.active ? "bg-surface-bright border-accent" : "bg-neutral-800")} />
                       <span className={cn(f.active ? "text-text-main" : "text-text-dim")}>{f.name}</span>
                    </div>
                    <span className="font-mono text-accent">{f.reps} REPS</span>
                 </div>
               ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Coaching Bar Footer */}
      <footer className="h-24 bg-surface border-t border-surface-bright flex items-center gap-8 px-10 relative">
        {/* Set Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-surface-bright overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((repCount / 10) * 100, 100)}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 60 }}
            className="h-full bg-accent shadow-[0_0_15px_rgba(217,255,0,0.5)]"
          />
        </div>

        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shrink-0">
          <Activity size={24} className="text-black" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <p className="text-xl font-medium italic text-text-main truncate">
            {aiCue ? `"${aiCue}"` : `"Great depth, Ishaan! Keep your chest up as you rise. Three more for a new record!"`}
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-surface-bright hover:bg-white/10 rounded-lg text-sm font-bold transition-colors">
            Pause
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-error hover:bg-error/80 rounded-lg text-sm font-bold transition-colors"
          >
            End Set
          </button>
        </div>
      </footer>

      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-bg flex flex-col items-center justify-center z-[110] gap-4">
           <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
           <p className="font-mono text-[10px] tracking-[0.3em] text-text-dim uppercase">Calibrating AR Layer...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-bg flex flex-col items-center justify-center z-[110] p-10 text-center gap-6">
           <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={48} />
           </div>
           <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-text-main">Camera Access Required</h2>
                <p className="text-text-dim max-w-md mx-auto">{error}</p>
              </div>

              <div className="bg-surface-bright/50 border border-white/5 rounded-2xl p-6 text-left max-w-md mx-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">How to enable access:</p>
                <ul className="text-sm text-text-dim space-y-3">
                  <li className="flex gap-3">
                    <span className="w-5 h-5 bg-accent text-black rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    <span>Click the <b>lock icon</b> or <b>camera icon</b> in your browser's address bar.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 bg-accent text-black rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    <span>Toggle <b>Camera</b> to "Allow" or "On".</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-5 h-5 bg-accent text-black rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    <span>Refresh this page to initialize the AI trainer.</span>
                  </li>
                </ul>
              </div>
           </div>
           
           <div className="flex gap-4 mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-accent text-black font-bold rounded-xl transition-all hover:scale-105"
              >
                Refresh & Retry
              </button>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-surface-bright text-text-main font-bold rounded-xl transition-all hover:bg-white/10"
              >
                Return to Home
              </button>
           </div>
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="absolute inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-surface border border-surface-bright rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                    <Settings size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-text-main">AI Coach Configuration</h3>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-surface-bright rounded-lg text-text-dim">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold uppercase tracking-widest text-text-dim">Cue Frequency</label>
                    <span className="px-3 py-1 bg-accent text-black font-mono font-black rounded-lg text-sm">Every {cueFrequency} Reps</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1" 
                    value={cueFrequency}
                    onChange={(e) => setCueFrequency(parseInt(e.target.value))}
                    className="w-full accent-accent h-2 bg-surface-bright rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-text-dim uppercase tracking-tighter">
                    <span>Intense</span>
                    <span>Moderate</span>
                    <span>Minimal</span>
                  </div>
                </div>

                <div className="bg-accent/5 border border-accent/10 p-5 rounded-2xl">
                   <p className="text-xs text-text-dim flex gap-3">
                      <Volume2 className="text-accent shrink-0" size={16} />
                      <span>The AI Coach will analyze your form and provide real-time verbal feedback every <b>{cueFrequency} repetitions</b>.</span>
                   </p>
                </div>

                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 bg-accent text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.02] transition-transform"
                >
                  Save & Return
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainerLive;
