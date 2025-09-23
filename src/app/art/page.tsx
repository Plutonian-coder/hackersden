'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AboutModal from '@/components/AboutModal';
import FuturisticHamburgerMenu from '@/components/FuturisticHamburgerMenu';

type Mode = 'studio' | 'gallery';

interface QA {
  id: string;
  question: string;
  answer: string;
  image?: string;
  timestamp: Date;
}

export default function ArtPage() {
  const [mode, setMode] = useState<Mode>('studio');
  const [qaHistory, setQaHistory] = useState<QA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [brushMode, setBrushMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [gestureBuffer, setGestureBuffer] = useState('');
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Gesture recognition
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setGestureBuffer(prev => {
        const newBuffer = prev + key;

        // Check for gestures
        if (newBuffer.includes('g')) {
          setMode('gallery');
          return '';
        } else if (newBuffer.includes('a')) {
          setMode('studio');
          return '';
        }

        return newBuffer;
      });

      // Clear buffer after 2 seconds
      setTimeout(() => setGestureBuffer(''), 2000);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Canvas drawing
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!brushMode) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [brushMode]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !brushMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = typeof ctx.strokeStyle === 'string' ? ctx.strokeStyle : '#ffffff';
    ctx.shadowBlur = 10;
  }, [isDrawing, brushMode]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!brushMode) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [brushMode]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !brushMode) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, brushMode]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const askQuestion = async () => {
    if (!currentQuestion.trim()) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsTyping(true);

    try {
      const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an art curator and creative mentor. Respond to this art-related question in an artistic, inspirational, and poetic manner. Keep responses under 150 words. Make it feel like a conversation with a wise art teacher. Question: ${question}`;

      const result = await model.generateContent(prompt);
      const aiResponse = await result.response;

      const newQA: QA = {
        id: Date.now().toString(),
        question,
        answer: aiResponse.text().trim(),
        timestamp: new Date()
      };

      setQaHistory(prev => [...prev, newQA]);
    } catch (error) {
      console.error('Art Q&A Error:', error);
      const newQA: QA = {
        id: Date.now().toString(),
        question,
        answer: 'Ah, the canvas of creativity sometimes needs a moment to breathe. Let me share this thought: Art is the bridge between what we see and what we feel. What aspect of art intrigues you most?',
        timestamp: new Date()
      };
      setQaHistory(prev => [...prev, newQA]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <ArtisticBackground />

      {/* Floating Art Symbols */}
      <FloatingArtSymbols />

      {/* About Modal */}
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

      {/* Hamburger Menu */}
      <FuturisticHamburgerMenu onAbout={() => setShowAboutModal(true)} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center py-8 px-4"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-2"
            style={{ fontFamily: 'serif' }}
            animate={{
              textShadow: [
                '0 0 20px rgba(255,255,255,0.5)',
                '0 0 40px rgba(255,255,255,0.8)',
                '0 0 20px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Art: The Dimension of Imagination
          </motion.h1>
        </motion.header>

        {/* Mode Content */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {mode === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col"
              >
                {/* Canvas Area */}
                <div className="flex-1 relative mx-4 mb-4">
                  <CanvasWithSafeWindow
                    canvasRef={canvasRef}
                    brushMode={brushMode}
                    startDrawing={startDrawing}
                    draw={draw}
                    stopDrawing={stopDrawing}
                    handleTouchStart={handleTouchStart}
                    handleTouchMove={handleTouchMove}
                  />

                  {/* Welcome Message */}
                  {qaHistory.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center max-w-md">
                        <div className="text-4xl mb-4">🌸</div>
                        <p className="text-white text-lg mb-4" style={{ fontFamily: 'serif' }}>
                          Welcome to the world of Art
                        </p>
                        <p className="text-pink-200">
                          Do you want to ask art-related questions, or create something beautiful?
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Q&A History */}
                <div className="mx-4 mb-4 max-h-40 overflow-y-auto">
                  <AnimatePresence>
                    {qaHistory.map((qa) => (
                      <motion.div
                        key={qa.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-2"
                      >
                        <p className="text-purple-200 font-semibold mb-2" style={{ fontFamily: 'serif' }}>
                          {qa.question}
                        </p>
                        <p className="text-white leading-relaxed" style={{ fontFamily: 'serif' }}>
                          {qa.answer}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/10 backdrop-blur-md rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="text-purple-200" style={{ fontFamily: 'serif' }}>
                          Thinking artistically...
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {mode === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex-1 p-4"
              >
                <ArtGallery />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 bg-black/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Q&A Input */}
            <div className="flex-1 flex gap-2 max-w-md">
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
                placeholder="Ask about art..."
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-pink-300 focus:outline-none focus:border-pink-400"
                style={{ fontFamily: 'serif' }}
              />
              <motion.button
                onClick={askQuestion}
                disabled={!currentQuestion.trim() || isTyping}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ask
              </motion.button>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <motion.button
                onClick={() => setBrushMode(!brushMode)}
                className={`px-4 py-2 rounded-full border-2 transition-colors ${
                  brushMode
                    ? 'bg-pink-500 border-pink-500 text-white'
                    : 'border-white/30 text-white hover:border-white/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🖌️ {brushMode ? 'Brush ON' : 'Brush OFF'}
              </motion.button>

              <motion.button
                onClick={clearCanvas}
                className="px-4 py-2 border-2 border-white/30 text-white rounded-full hover:border-white/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Reset Canvas
              </motion.button>

              <motion.button
                onClick={() => setMode(mode === 'studio' ? 'gallery' : 'studio')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode === 'studio' ? '🖼️ Gallery' : '🎨 Studio'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated Background Component
function ArtisticBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Flowing Gradients */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-indigo-600/20"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(147,51,234,0.2), rgba(219,39,119,0.2), rgba(79,70,229,0.2))',
            'linear-gradient(135deg, rgba(219,39,119,0.2), rgba(79,70,229,0.2), rgba(147,51,234,0.2))',
            'linear-gradient(225deg, rgba(79,70,229,0.2), rgba(147,51,234,0.2), rgba(219,39,119,0.2))',
            'linear-gradient(315deg, rgba(147,51,234,0.2), rgba(219,39,119,0.2), rgba(79,70,229,0.2))'
          ]
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      {/* Animated Brush Strokes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <motion.path
          d="M100,200 Q300,150 500,200 T900,250"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.path
          d="M200,400 Q400,350 600,400 T1000,450"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
        />
        <motion.path
          d="M50,600 Q250,550 450,600 T850,650"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', delay: 4 }}
        />
      </svg>
    </div>
  );
}

// Floating Art Symbols (client-safe)
function FloatingArtSymbols() {
  const symbols = ['🎨', '🖌️', '✨', '🎭', '🖼️', '🎨', '🖌️', '✨'];
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {symbols.map((symbol, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl opacity-20"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            rotate: 0
          }}
          animate={{
            x: [null, Math.random() * dimensions.width],
            y: [null, Math.random() * dimensions.height],
            rotate: [0, 360]
          }}
          transition={{
            duration: 20 + Math.random() * 15,
            repeat: Infinity,
            delay: index * 2
          }}
        >
          {symbol}
        </motion.div>
      ))}
    </div>
  );
}

// Canvas component with SSR-safe window usage
function CanvasWithSafeWindow({
  canvasRef,
  brushMode,
  startDrawing,
  draw,
  stopDrawing,
  handleTouchStart,
  handleTouchMove
}: {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  brushMode: boolean;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  handleTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
}) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight * 0.6 });
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`w-full h-full border-2 border-white/20 rounded-lg ${
        brushMode ? 'cursor-crosshair' : 'cursor-default'
      }`}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopDrawing}
    />
  );
}

// Gallery Component
function ArtGallery() {
  const artworks = [
    {
      id: '1',
      title: 'Whispers of Time',
      artist: 'Elena Voss',
      description: 'A surreal landscape where clocks melt into rivers of consciousness.',
      caption: 'Time flows not in straight lines, but in the curves of our dreams.',
      image: '🎨'
    },
    {
      id: '2',
      title: 'Digital Reverie',
      artist: 'Marcus Chen',
      description: 'Abstract forms dancing in the space between pixels and reality.',
      caption: 'In the digital ether, we find the poetry of pure form.',
      image: '🖼️'
    },
    {
      id: '3',
      title: 'Urban Symphony',
      artist: 'Sofia Ramirez',
      description: 'City lights refracted through prisms of human emotion.',
      caption: 'Every street corner holds a story waiting to be painted.',
      image: '🏙️'
    },
    {
      id: '4',
      title: 'Nature\'s Code',
      artist: 'Dr. Liam Foster',
      description: 'The mathematical beauty hidden within natural patterns.',
      caption: 'Mathematics is the brush with which God paints the universe.',
      image: '🌿'
    },
    {
      id: '5',
      title: 'Emotional Spectrum',
      artist: 'Aria Patel',
      description: 'Colors that transcend language, speaking directly to the soul.',
      caption: 'Art is the universal language that needs no translation.',
      image: '🌈'
    },
    {
      id: '6',
      title: 'Cosmic Dance',
      artist: 'Dr. Nova Black',
      description: 'Galaxies swirling in the eternal ballet of creation.',
      caption: 'We are all made of stardust, painting with the light of ancient suns.',
      image: '🌌'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork, index) => (
        <motion.div
          key={artwork.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden"
          whileHover={{ scale: 1.05 }}
        >
          <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-6xl">
            {artwork.image}
          </div>
          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'serif' }}>
              {artwork.title}
            </h3>
            <p className="text-purple-300 text-sm mb-2">by {artwork.artist}</p>
            <p className="text-pink-200 text-sm italic leading-relaxed" style={{ fontFamily: 'serif' }}>
              {artwork.caption}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}