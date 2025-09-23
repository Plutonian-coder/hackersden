'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import FuturisticHamburgerMenu from '@/components/FuturisticHamburgerMenu';

export default function DemoPage() {
  const [currentMode, setCurrentMode] = useState<string>('home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['home']);

  const handleModeSelect = (mode: string) => {
    setCurrentMode(mode);
    setNavigationHistory(prev => [...prev, mode]);
  };

  const getModeContent = () => {
    switch (currentMode) {
      case 'science':
        return {
          title: '🪐 Science Mode',
          description: 'Interactive labs & solar system simulations',
          bgColor: 'from-blue-900 to-purple-900'
        };
      case 'art':
        return {
          title: '🎨 Art Mode',
          description: 'Creative studio & gallery',
          bgColor: 'from-purple-900 to-pink-900'
        };
      case 'commercial':
        return {
          title: '💼 Commercial Mode',
          description: 'Accounting tools & simulations',
          bgColor: 'from-gray-900 to-black'
        };
      case 'about':
        return {
          title: '👤 About Me',
          description: 'Creator: PLUTO — ASCII silhouette + bio',
          bgColor: 'from-green-900 to-black'
        };
      default:
        return {
          title: '🏠 Demo Home',
          description: 'Futuristic Hamburger Menu Demo',
          bgColor: 'from-cyan-900 to-blue-900'
        };
    }
  };

  const modeContent = getModeContent();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${modeContent.bgColor} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.05),transparent)]" />
      </div>

      {/* Futuristic Hamburger Menu */}
      <FuturisticHamburgerMenu onSelect={handleModeSelect} />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl"
        >
          {/* Mode Display */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 font-mono tracking-wider">
              {modeContent.title}
            </h1>
            <p className="text-xl md:text-2xl text-cyan-300 font-light">
              {modeContent.description}
            </p>
          </motion.div>

          {/* Navigation History */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg text-cyan-400 mb-4 font-mono">Navigation History:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {navigationHistory.map((mode, index) => (
                <motion.span
                  key={`${mode}-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`px-3 py-1 rounded-full text-sm font-mono ${
                    mode === currentMode
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                      : 'bg-white/10 border border-white/20 text-white/60'
                  }`}
                >
                  {mode}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-black/20 backdrop-blur-md rounded-lg p-6 border border-cyan-400/20 max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4 font-mono">How to Use:</h3>
            <div className="text-left space-y-2 text-cyan-200">
              <p>• <strong>Click the hamburger button</strong> (top-right) to open the menu</p>
              <p>• <strong>Click menu items</strong> or use <strong>arrow keys</strong> to navigate</p>
              <p>• <strong>Type commands</strong> like &ldquo;cd science&rdquo;, &ldquo;cd art&rdquo;, etc.</p>
              <p>• <strong>Press ESC</strong> or click outside to close</p>
              <p>• <strong>Mobile-friendly</strong> with touch gestures</p>
            </div>
          </motion.div>

          {/* ASCII Art for About Mode */}
          {currentMode === 'about' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-400/30"
            >
              <pre className="text-green-400 font-mono text-xs md:text-sm leading-none text-center">
{`██████╗ ██╗     ██╗   ██╗████████╗ ██████╗
██╔══██╗██║     ██║   ██║╚══██╔══╝██╔═══██╗
██████╔╝██║     ██║   ██║   ██║   ██║   ██║
██╔═══╝ ██║     ██║   ██║   ██║   ██║   ██║
██║     ███████╗╚██████╔╝   ██║   ╚██████╔╝
╚═╝     ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝

Creator: Khalid Yekini (PLUTO)
Origin: CS Student @ Yabatech University
Mission: Redefining Learning through AI
Motto: "Tomorrow's Skills, Today"`}
              </pre>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center"
      >
        <p className="text-cyan-400/60 text-sm font-mono">
          Futuristic Hamburger Menu Demo • Built with React, TailwindCSS & Framer Motion
        </p>
      </motion.footer>
    </div>
  );
}