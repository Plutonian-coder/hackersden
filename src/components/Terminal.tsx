'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AboutModal from './AboutModal';
import FuturisticHamburgerMenu from './FuturisticHamburgerMenu';

interface OutputLine {
  id: string;
  text: string;
  type: 'input' | 'output' | 'ai';
  isTyping?: boolean;
}

export default function Terminal() {
  const router = useRouter();
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [input, setInput] = useState('');
  const [matrixEnabled, setMatrixEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message with typewriter effect
    const welcomeMessages = [
      'INITIALIZING NEURAL MATRIX...',
      'CONNECTING TO HOLOGRAPHIC INTERFACE...',
      'AI HOLOGRAM TERMINAL v3.0 ONLINE',
      'Type "help" for available commands.',
      'SYSTEM READY.'
    ];

    let delay = 0;
    welcomeMessages.forEach((msg, index) => {
      setTimeout(() => {
        addOutput(msg, 'output');
      }, delay);
      delay += 800 + Math.random() * 400;
    });
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (text: string, type: 'input' | 'output' | 'ai' = 'output') => {
    const newLine: OutputLine = {
      id: Date.now().toString() + Math.random(),
      text,
      type,
      isTyping: false
    };
    setOutput(prev => [...prev, newLine]);
  };

  const processCommand = async (cmd: string) => {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    addOutput(`pluto@hologram:~$ ${cmd}`, 'input');

    let response = '';

    switch (command) {
      case 'help':
        response = `AVAILABLE COMMANDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
help        → Display this help menu
cd art      → Switch to Art Mode
cd science  → Switch to Science Mode
cd commercial → Switch to Commercial Mode
clear       → Clear terminal screen
about       → Display creator hologram
matrix      → Toggle matrix rain effect
status      → System diagnostic scan
fortune     → Generate futuristic fortune
motivate    → AI motivational message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        break;
      case 'cd':
        const mode = args[0]?.toLowerCase();
        if (['art', 'science', 'commercial'].includes(mode)) {
          response = `INITIATING MODE TRANSITION...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Switching to ${mode.toUpperCase()} MODE...
Neural pathways recalibrating...
Interface adapting...
MODE CHANGE COMPLETE.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
          // Navigate to the mode page
          setTimeout(() => {
            if (mode === 'art') {
              router.push('/art');
            } else if (mode === 'science') {
              router.push('/science');
            } else if (mode === 'commercial') {
              router.push('/commercial');
            }
          }, 2000);
        } else {
          response = `ERROR: Invalid mode "${args[0]}"
Available modes: art, science, commercial`;
        }
        break;
      case 'clear':
        setOutput([]);
        return;
      case 'about':
        setShowAboutModal(true);
        response = 'ACCESSING HOLOGRAPHIC DATABASE...';
        break;
      case 'matrix':
        setMatrixEnabled(!matrixEnabled);
        response = matrixEnabled ? 'MATRIX RAIN DEACTIVATED' : 'MATRIX RAIN ACTIVATED';
        break;
      case 'status':
        response = `SYSTEM DIAGNOSTIC SCAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CPU Usage: ${Math.floor(Math.random() * 30 + 20)}%
Memory: ${Math.floor(Math.random() * 40 + 60)}% available
Neural Network: ONLINE
Holographic Interface: ACTIVE
Matrix Rain: ${matrixEnabled ? 'ENABLED' : 'DISABLED'}
Uptime: ${Math.floor(Math.random() * 1000 + 100)} hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        break;
      case 'fortune':
        const fortunes = [
          'A quantum leap in your future awaits.',
          'The matrix will reveal hidden opportunities.',
          'Neural pathways will lead to breakthrough innovation.',
          'Your code will echo through the digital void.',
          'Holographic success patterns detected.'
        ];
        response = `FORTUNE TELLER v2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${fortunes[Math.floor(Math.random() * fortunes.length)]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        break;
      case 'motivate':
        setIsTyping(true);
        try {
          const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = 'Generate a short, futuristic, cyberpunk-style motivational message for a hacker/developer. Keep it under 50 words. Make it inspiring and tech-themed.';

          const result = await model.generateContent(prompt);
          const aiResponse = await result.response;
          response = `AI MOTIVATIONAL ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${aiResponse.text().trim()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        } catch (error) {
          console.error('AI Error:', error);
          response = `AI MOTIVATIONAL ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code is the weapon of the future. Debug your doubts, compile your dreams, and deploy your destiny. The matrix needs your innovation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        } finally {
          setIsTyping(false);
        }
        break;
      default:
        // AI Chatbot response
        setIsTyping(true);
        try {
          const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `You are a cyberpunk AI assistant in a holographic terminal. Respond in a futuristic, hacker-style manner with tech slang and references. Keep responses under 100 words. User input: ${cmd}`;

          const result = await model.generateContent(prompt);
          const aiResponse = await result.response;
          response = aiResponse.text().trim();
        } catch (error) {
          console.error('AI Error:', error);
          response = `NEURAL NETWORK ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Command "${cmd}" not recognized. I'm a cyberpunk AI, not a search engine. Try something more... digital. Type "help" for guidance.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        } finally {
          setIsTyping(false);
        }
    }

    if (response) {
      // Add typewriter effect for responses
      const lines = response.split('\n');
      let delay = 0;
      lines.forEach((line, index) => {
        if (line.trim()) {
          setTimeout(() => {
            addOutput(line, command === 'motivate' || !['help', 'cd', 'clear', 'about', 'matrix', 'status', 'fortune'].includes(command) ? 'ai' : 'output');
          }, delay);
          delay += 50 + Math.random() * 100; // Variable typing speed
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      processCommand(input.trim());
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden font-mono">
      {/* Matrix Rain Background */}
      {matrixEnabled && <MatrixRain />}

      {/* Scanlines Overlay */}
      <Scanlines />

      {/* About Modal */}
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

      {/* Hamburger Menu */}
      <FuturisticHamburgerMenu onAbout={() => setShowAboutModal(true)} />

      {/* Corner Decorations */}
      <div className="fixed top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-green-400 opacity-50"></div>
      <div className="fixed top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-green-400 opacity-50"></div>
      <div className="fixed bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-green-400 opacity-50"></div>
      <div className="fixed bottom-20 right-4 w-16 h-16 border-r-2 border-b-2 border-green-400 opacity-50"></div>

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-green-500/5 via-transparent to-transparent"></div>
      </div>

      {/* Main Terminal */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Output Area */}
        <div
          ref={outputRef}
          className="flex-1 p-6 overflow-y-auto scrollbar-hide"
        >
          <div className="max-w-4xl mx-auto space-y-2">
            <AnimatePresence>
              {output.map((line) => (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    line.type === 'input'
                      ? 'text-green-400 font-bold'
                      : line.type === 'ai'
                      ? 'text-cyan-400'
                      : 'text-green-300'
                  } ${line.type === 'ai' ? 'border-l-2 border-cyan-400 pl-4' : ''}`}
                >
                  <TypewriterText text={line.text} delay={line.type === 'ai' ? 30 : 10} />
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-cyan-400 flex items-center"
              >
                <span className="mr-2">AI_PROCESSING</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-green-500/30 bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-green-400 mr-3 font-bold cyberpunk-text">
                pluto@hologram:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-green-300 caret-green-400 placeholder-green-600/50 focus:cyberpunk-glitch"
                placeholder="Enter command or ask AI..."
                autoFocus
                disabled={isTyping}
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="ml-4 px-6 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold tracking-wider"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                [EXECUTE]
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Matrix Rain Component
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff00'; // Cyberpunk green
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(33 + Math.random() * 94); // Printable ASCII
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-20"
    />
  );
}

// Scanlines Overlay Component
function Scanlines() {
  // Pre-calculate animation values to avoid hydration mismatch
  const scanlineAnimations = Array.from({ length: 50 }).map((_, i) => ({
    duration: 2 + (i * 0.1) % 4, // Deterministic based on index
    delay: (i * 0.04) % 2
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 opacity-10">
        {scanlineAnimations.map((anim, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-green-500/20"
            style={{
              top: `${i * 2}%`,
              animation: `scanline ${anim.duration}s linear infinite`,
              animationDelay: `${anim.delay}s`
            }}
          />
        ))}
      </div>
    </div>
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