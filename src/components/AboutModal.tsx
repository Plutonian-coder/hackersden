'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [currentInfoIndex, setCurrentInfoIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const asciiLogo = `
██████╗ ██╗     ██╗   ██╗████████╗ ██████╗
██╔══██╗██║     ██║   ██║╚══██╔══╝██╔═══██╗
██████╔╝██║     ██║   ██║   ██║   ██║   ██║
██╔═══╝ ██║     ██║   ██║   ██║   ██║   ██║
██║     ███████╗╚██████╔╝   ██║   ╚██████╔╝
╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝
  `;

  const infoLines = [
    'Creator: Pluto (Khalid Yekini)',
    'Origin: CS Student @ Yabatech',
    'Mission: Redefining Learning through AI',
    'Motto: "Tomorrow\'s Skills, Today"'
  ];

  useEffect(() => {
    if (isOpen) {
      // Show ASCII first, then info after delay
      const timer = setTimeout(() => setShowInfo(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowInfo(false);
      setCurrentInfoIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showInfo && currentInfoIndex < infoLines.length) {
      const timer = setTimeout(() => {
        setCurrentInfoIndex(prev => prev + 1);
      }, 2000); // Delay between lines
      return () => clearTimeout(timer);
    }
  }, [showInfo, currentInfoIndex]);

  // Matrix Rain Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(33 + Math.random() * 94);
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Matrix Rain Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-30"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative z-10 max-w-4xl mx-4 p-8 bg-black/90 border border-green-500/50 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ASCII Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-8"
        >
          <pre className="text-green-400 font-mono text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-none
                         drop-shadow-[0_0_10px_rgba(0,255,0,0.8)] animate-pulse
                         filter drop-shadow-[0_0_20px_rgba(0,255,0,0.5)]">
            {asciiLogo}
          </pre>
        </motion.div>

        {/* Info Lines with Typewriter Effect */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {infoLines.slice(0, currentInfoIndex).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
                className="text-green-300 font-mono text-sm sm:text-base md:text-lg"
              >
                <TypewriterText text={line} delay={50} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-400 hover:text-green-300 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ✕
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Typewriter Text Component
function TypewriterText({ text, delay = 50 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      {currentIndex < text.length && (
        <span className="animate-pulse text-green-400">█</span>
      )}
    </span>
  );
}
