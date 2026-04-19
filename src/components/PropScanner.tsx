import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCcw, Check, Sparkles, Scale, Box, AlertTriangle } from 'lucide-react';
import { analyzeProp } from '../lib/gemini';
import { cn } from '../lib/utils';
import { PropItem } from '../types';

interface PropScannerProps {
  onClose: () => void;
  onPropAdded: (prop: PropItem) => void;
}

const PropScanner = ({ onClose, onPropAdded }: PropScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'IDLE' | 'SCANNING' | 'DETECTED'>('IDLE');
  const [detectedObj, setDetectedObj] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const startCamera = async () => {
      try {
        const constraints: MediaStreamConstraints = { 
          video: { facingMode: 'environment' },
          audio: false 
        };
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (initialErr) {
          console.warn("Retrying PropScanner with minimal constraints...", initialErr);
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Scanner play error:", e));
        }
      } catch (err: any) {
        console.error("PropScanner camera access denied:", err);
        if (isMounted) {
          if (err.name === "NotAllowedError") {
            setError("Permission denied. AuraGym needs scanner access to identify your gym equipment.");
          } else if (err.name === "NotFoundError") {
            setError("No camera found. Scanner requires a functional camera feed.");
          } else {
            setError(`Scanner Error: ${err.message || 'Permission denied'}`);
          }
        }
      }
    };
    startCamera();
    return () => {
      isMounted = false;
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    setScanStep('SCANNING');
    
    // Simulate thinking delay
    setTimeout(async () => {
      const result = await analyzeProp(userInput || "Heavy Water Bottle");
      setDetectedObj(result);
      setScanStep('DETECTED');
      setIsScanning(false);
    }, 2500);
  };

  const confirmProp = () => {
    onPropAdded({
      id: Math.random().toString(36).substr(2, 9),
      name: userInput || "Household Object",
      category: "Resistance",
      estimatedWeight: detectedObj?.weight || 5,
      bestFor: ['Curls', 'Rows', 'Overhead Press']
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-bg z-[100] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#18181B_0%,_#09090B_100%)]">
      <div className="max-w-2xl w-full space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold font-display tracking-tighter uppercase">Prop-Lift <span className="text-accent">Scanner</span></h2>
            <button onClick={onClose} className="text-text-dim hover:text-white transition-colors">Close</button>
        </div>

        <div className="relative aspect-square w-full bg-black rounded-3xl overflow-hidden border border-surface-bright shadow-2xl">
          {!error ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className="w-64 h-64 border-2 border-accent/20 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-accent rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-accent rounded-br-lg" />
                    
                    {isScanning && (
                       <motion.div 
                         initial={{ top: 0 }}
                         animate={{ top: '100%' }}
                         transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                         className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_15px_#D9FF00]"
                       />
                    )}
                 </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-bg gap-5">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center">
                 <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-text-main text-lg uppercase tracking-tight">Camera Feed Required</p>
                <p className="text-xs text-text-dim max-w-[240px] mx-auto leading-relaxed">Please enable camera access in your browser settings to calibrate household objects.</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-8 py-3 bg-accent text-black text-sm font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-transform"
              >
                Refresh & Retry
              </button>
            </div>
          )}

          <AnimatePresence>
            {scanStep === 'DETECTED' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-x-6 bottom-6 bg-accent p-6 rounded-2xl shadow-xl border border-white/20 text-black"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <Sparkles className="text-black" />
                     <span className="font-extrabold text-lg uppercase tracking-tight">AI Calibration Complete</span>
                  </div>
                  <div className="bg-black/10 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-tighter">
                     95% confidence
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-black/10 p-4 rounded-xl flex-1">
                     <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Estimated Weight</p>
                     <p className="text-3xl font-mono font-black">{detectedObj.weight} <span className="text-lg opacity-50 font-sans">kg</span></p>
                  </div>
                  <div className="bg-black/10 p-4 rounded-xl flex-1">
                     <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Target Intensity</p>
                     <p className="text-xl font-bold mt-1">Medium-Heavy</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium italic">"{detectedObj.reasoning}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {scanStep === 'IDLE' && (
           <div className="space-y-6">
              <div className="polish-card p-8 space-y-4">
                <p className="stat-label text-center">Step 1: Identify Target Object</p>
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g. 5L BISLERI BOTTLE"
                  className="w-full bg-surface-bright border border-surface-bright text-white rounded-xl px-5 py-4 focus:outline-none focus:border-accent transition-colors font-mono uppercase text-sm tracking-widest placeholder:text-text-dim/30"
                />
              </div>
              <button 
                onClick={handleScan}
                disabled={!userInput}
                className="w-full py-5 bg-accent text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-accent/90 transition-all disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-accent/20"
              >
                <Camera size={24} />
                CALIBRATE OBJECT
              </button>
           </div>
        )}

        {scanStep === 'SCANNING' && (
           <div className="text-center py-8">
              <p className="text-accent font-mono text-lg animate-pulse tracking-[0.4em] uppercase font-bold">VOLUMETRIC ANALYSIS_</p>
           </div>
        )}

        {scanStep === 'DETECTED' && (
           <div className="flex gap-4">
              <button 
                onClick={() => setScanStep('IDLE')}
                className="flex-1 py-5 bg-surface text-white font-bold rounded-2xl flex items-center justify-center gap-3 border border-surface-bright"
              >
                <RefreshCcw size={20} />
                RESYNC
              </button>
              <button 
                onClick={confirmProp}
                className="flex-[2] py-5 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg"
              >
                <Check size={20} />
                ADD TO REPERTOIRE
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default PropScanner;
