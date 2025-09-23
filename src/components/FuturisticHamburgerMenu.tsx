'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
}

interface FuturisticHamburgerMenuProps {
  items?: MenuItem[];
  onSelect?: (mode: string) => void;
  onAbout?: () => void;
  placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  overlayStyle?: 'fullscreen' | 'modal';
}

const defaultItems: MenuItem[] = [
  {
    id: 'science',
    label: 'Science',
    subtitle: 'Interactive labs & solar system sims',
    icon: '🪐'
  },
  {
    id: 'art',
    label: 'Art',
    subtitle: 'Creative studio & gallery',
    icon: '🎨'
  },
  {
    id: 'commercial',
    label: 'Commercial',
    subtitle: 'Accounting tools & simulations',
    icon: '💼'
  },
  {
    id: 'about',
    label: 'About Me',
    subtitle: 'Creator: PLUTO — ASCII silhouette + bio',
    icon: '👤'
  }
];

export default function FuturisticHamburgerMenu({
  items = defaultItems,
  onSelect,
  onAbout,
  placement = 'top-right',
  overlayStyle = 'fullscreen'
}: FuturisticHamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle menu selection
  const handleSelect = useCallback((mode: string) => {
    setIsOpen(false);
    setCommand('');

    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigating to ${mode} mode`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);

    if (mode === 'about' && onAbout) {
      onAbout();
    } else if (onSelect) {
      onSelect(mode);
    } else {
      // Default navigation
      if (mode === 'science') router.push('/science');
      else if (mode === 'art') router.push('/art');
      else if (mode === 'commercial') router.push('/commercial');
      else if (mode === 'about') {
        // Handle about modal or page
        console.log('About selected');
      }
    }
  }, [onSelect, onAbout, router]);

  // Handle command input
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.toLowerCase().trim();

    if (cmd === 'cd science' || cmd === 'science') handleSelect('science');
    else if (cmd === 'cd art' || cmd === 'art') handleSelect('art');
    else if (cmd === 'cd commercial' || cmd === 'commercial') handleSelect('commercial');
    else if (cmd === 'cd about' || cmd === 'about') handleSelect('about');
    else if (cmd === 'help') {
      alert('Available commands:\n• cd science\n• cd art\n• cd commercial\n• cd about\n• help');
    } else if (cmd) {
      alert(`Command "${cmd}" not recognized. Type "help" for available commands.`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          setIsOpen(false);
          setCommand('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
          if (focusedIndex >= 0) {
            handleSelect(items[focusedIndex].id);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, items, handleSelect]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      const focusableElements = menuRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0] as HTMLElement;
      const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Close on outside click
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setCommand('');
    }
  };

  // Get placement classes
  const getPlacementClasses = () => {
    switch (placement) {
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      default:
        return 'top-6 right-6';
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        className={`fixed ${getPlacementClasses()} z-50 w-14 h-14 rounded-full bg-black/20 backdrop-blur-md border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/25 flex items-center justify-center group`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-controls="futuristic-menu"
      >
        <motion.div
          className="w-6 h-5 flex flex-col justify-center items-center"
          animate={isOpen ? 'open' : 'closed'}
        >
          <motion.span
            className="w-6 h-0.5 bg-cyan-400 block mb-1"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-6 h-0.5 bg-cyan-400 block mb-1"
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="w-6 h-0.5 bg-cyan-400 block"
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </motion.button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-40 flex items-center justify-center ${
              overlayStyle === 'fullscreen'
                ? 'bg-black/80 backdrop-blur-sm'
                : 'bg-black/60 backdrop-blur-md'
            }`}
            onClick={handleOutsideClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-title"
            id="futuristic-menu"
          >
            {/* Nebula Background */}
            <NebulaBackground />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative ${
                overlayStyle === 'fullscreen'
                  ? 'w-full h-full p-6'
                  : 'max-w-2xl w-full mx-4 max-h-[80vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Content */}
              <div className={`bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-400/30 shadow-2xl overflow-hidden ${
                overlayStyle === 'fullscreen' ? 'h-full' : ''
              }`}>
                {/* Header */}
                <div className="p-6 border-b border-cyan-400/20">
                  <h2 id="menu-title" className="text-2xl font-bold text-white text-center font-mono">
                    NAVIGATION MATRIX
                  </h2>
                  <p className="text-cyan-300 text-center text-sm mt-2">
                    Choose your destination in the digital realm
                  </p>
                </div>

                {/* Menu Items */}
                <div className={`p-6 ${overlayStyle === 'fullscreen' ? 'flex-1 overflow-y-auto' : ''}`}>
                  <div className={`grid gap-4 ${
                    overlayStyle === 'fullscreen'
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2'
                  }`}>
                    {items.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                          focusedIndex === index
                            ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/25'
                            : 'border-cyan-400/30 bg-white/5 hover:border-cyan-400/60 hover:bg-cyan-400/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        role="menuitem"
                        tabIndex={focusedIndex === index ? 0 : -1}
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-4xl group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 font-mono">
                              {item.label}
                            </h3>
                            <p className="text-cyan-300 text-sm leading-relaxed">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Command Input */}
                <div className="p-6 border-t border-cyan-400/20">
                  <form onSubmit={handleCommandSubmit} className="flex gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-mono text-sm">
                        $
                      </span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Type command (e.g., cd science) or use arrow keys..."
                        className="w-full pl-8 pr-4 py-3 bg-black/50 border border-cyan-400/30 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:border-cyan-400 focus:bg-black/70 font-mono"
                        autoFocus
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 font-mono"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      EXECUTE
                    </motion.button>
                  </form>
                  <p className="text-cyan-400/60 text-xs mt-2 text-center">
                    Try: cd science • cd art • cd commercial • cd about • help
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Nebula Background Component
function NebulaBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated nebula particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Glowing orbs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute w-32 h-32 bg-cyan-400/5 rounded-full blur-xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3
          }}
        />
      ))}
    </div>
  );
}