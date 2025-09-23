'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AboutModal from '@/components/AboutModal';
import FuturisticHamburgerMenu from '@/components/FuturisticHamburgerMenu';

type Section = 'planets' | 'lab' | 'chat';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Planet {
  id: string;
  name: string;
  size: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  facts: {
    diameter: string;
    distance: string;
    orbitTime: string;
    atmosphere: string;
    moons: number;
    temperature: string;
    uniqueTrait: string;
  };
}

export default function SciencePage() {
  const [activeSection, setActiveSection] = useState<Section>('planets');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Welcome to the Advanced Research Laboratory. I am your AI research assistant, ready to explore the mysteries of science with you. What scientific inquiry shall we pursue today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const planets: Planet[] = [
    {
      id: 'mercury',
      name: 'Mercury',
      size: 8,
      color: '#8C7853',
      orbitRadius: 60,
      orbitSpeed: 8,
      facts: {
        diameter: '4,879 km',
        distance: '57.9 million km',
        orbitTime: '88 Earth days',
        atmosphere: 'Minimal (helium, sodium)',
        moons: 0,
        temperature: '-173°C to 427°C',
        uniqueTrait: 'Closest planet to the Sun with extreme temperature variations.'
      }
    },
    {
      id: 'venus',
      name: 'Venus',
      size: 12,
      color: '#FFC649',
      orbitRadius: 80,
      orbitSpeed: 12,
      facts: {
        diameter: '12,104 km',
        distance: '108.2 million km',
        orbitTime: '225 Earth days',
        atmosphere: 'Carbon dioxide (96%)',
        moons: 0,
        temperature: '462°C (hottest planet)',
        uniqueTrait: 'Rotates backwards (retrograde rotation) compared to most planets.'
      }
    },
    {
      id: 'earth',
      name: 'Earth',
      size: 14,
      color: '#6B93D6',
      orbitRadius: 100,
      orbitSpeed: 16,
      facts: {
        diameter: '12,756 km',
        distance: '149.6 million km',
        orbitTime: '365.25 days',
        atmosphere: 'Nitrogen (78%), Oxygen (21%)',
        moons: 1,
        temperature: '-89°C to 58°C',
        uniqueTrait: 'Only known planet with liquid water and life.'
      }
    },
    {
      id: 'mars',
      name: 'Mars',
      size: 10,
      color: '#CD5C5C',
      orbitRadius: 120,
      orbitSpeed: 20,
      facts: {
        diameter: '6,792 km',
        distance: '227.9 million km',
        orbitTime: '687 Earth days',
        atmosphere: 'Carbon dioxide (95%)',
        moons: 2,
        temperature: '-87°C to -5°C',
        uniqueTrait: 'Has the largest volcano in the solar system (Olympus Mons).'
      }
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      size: 24,
      color: '#D8CA9D',
      orbitRadius: 160,
      orbitSpeed: 30,
      facts: {
        diameter: '142,984 km',
        distance: '778.5 million km',
        orbitTime: '11.86 Earth years',
        atmosphere: 'Hydrogen (89%), Helium (10%)',
        moons: 95,
        temperature: '-108°C',
        uniqueTrait: 'Has a Great Red Spot - a giant storm larger than Earth.'
      }
    },
    {
      id: 'saturn',
      name: 'Saturn',
      size: 20,
      color: '#FAD5A5',
      orbitRadius: 200,
      orbitSpeed: 40,
      facts: {
        diameter: '120,536 km',
        distance: '1.43 billion km',
        orbitTime: '29.46 Earth years',
        atmosphere: 'Hydrogen (96%), Helium (3%)',
        moons: 146,
        temperature: '-139°C',
        uniqueTrait: 'Has spectacular ring system made of ice and rock particles.'
      }
    }
  ];

  const askQuestion = async () => {
    if (!currentQuestion.trim() || isTyping) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an advanced AI research assistant at a prestigious university science laboratory. Provide a comprehensive, academically rigorous answer to this scientific question. Structure your response with clear explanations, relevant formulas where applicable, and real-world applications. Keep responses educational and inspiring for advanced learners. Question: ${question}`;

      const result = await model.generateContent(prompt);
      const aiResponse = await result.response;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text().trim(),
        sender: 'ai',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Science chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error processing your academic inquiry. Please rephrase your question or try a different scientific topic.',
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      askQuestion();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Galaxy Background */}
      <GalaxyBackground />

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
            className="text-4xl md:text-6xl font-bold text-white mb-2 font-mono tracking-wider"
            animate={{
              textShadow: [
                '0 0 20px rgba(0,255,255,0.5)',
                '0 0 40px rgba(0,255,255,0.8)',
                '0 0 20px rgba(0,255,255,0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ADVANCED RESEARCH LABORATORY
          </motion.h1>
          <p className="text-cyan-300 text-lg font-light">
            University-Level Scientific Exploration • Neural Network v4.2
          </p>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          <AnimatePresence mode="wait">
            {/* Planetary System Simulation */}
            {activeSection === 'planets' && (
              <motion.div
                key="planets"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">SOLAR SYSTEM SIMULATION</h2>
                  <p className="text-cyan-300">Advanced Planetary Analysis & Orbital Dynamics</p>
                </div>

                {/* Solar System Visualization */}
                <div className="relative h-96 bg-black/20 rounded-lg border border-cyan-500/30 mb-8 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Sun */}
                    <motion.div
                      className="absolute w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-yellow-300 shadow-lg shadow-yellow-400/50"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse"></div>
                    </motion.div>

                    {/* Planets */}
                    {planets.map((planet, index) => (
                      <motion.div
                        key={planet.id}
                        className="absolute rounded-full border-2 border-cyan-400/30 cursor-pointer"
                        style={{
                          width: planet.orbitRadius * 2,
                          height: planet.orbitRadius * 2,
                          left: '50%',
                          top: '50%',
                          marginLeft: -planet.orbitRadius,
                          marginTop: -planet.orbitRadius
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: planet.orbitSpeed,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <motion.div
                          className="absolute rounded-full border-2 border-white/50"
                          style={{
                            width: planet.size,
                            height: planet.size,
                            backgroundColor: planet.color,
                            left: planet.orbitRadius - planet.size/2,
                            top: 2
                          }}
                          whileHover={{ scale: 1.2 }}
                          onClick={() => setSelectedPlanet(planet)}
                        >
                          <div
                            className="absolute inset-0 rounded-full opacity-50"
                            style={{
                              backgroundColor: planet.color,
                              filter: 'blur(4px)',
                              transform: 'scale(1.5)'
                            }}
                          ></div>
                        </motion.div>
                      </motion.div>
                    ))}

                    {/* Orbital Trails */}
                    {planets.map((planet) => (
                      <motion.div
                        key={`trail-${planet.id}`}
                        className="absolute border border-cyan-400/20 rounded-full"
                        style={{
                          width: planet.orbitRadius * 2,
                          height: planet.orbitRadius * 2,
                          left: '50%',
                          top: '50%',
                          marginLeft: -planet.orbitRadius,
                          marginTop: -planet.orbitRadius
                        }}
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(0,255,255,0.3)',
                            '0 0 20px rgba(0,255,255,0.6)',
                            '0 0 10px rgba(0,255,255,0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </div>

                {/* Planet Info Cards */}
                <AnimatePresence>
                  {selectedPlanet && (
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50, scale: 0.9 }}
                      className="bg-black/40 backdrop-blur-md rounded-lg border border-cyan-500/30 p-6 mb-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full border-2 border-white/50"
                            style={{ backgroundColor: selectedPlanet.color }}
                          ></div>
                          <div>
                            <h3 className="text-2xl font-bold text-white font-mono">{selectedPlanet.name.toUpperCase()}</h3>
                            <p className="text-cyan-300">Planetary Analysis Data</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPlanet(null)}
                          className="text-cyan-300 hover:text-white text-xl"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="bg-cyan-500/10 rounded p-3">
                          <div className="text-cyan-300 text-sm font-mono">DIAMETER</div>
                          <div className="text-white font-bold">{selectedPlanet.facts.diameter}</div>
                        </div>
                        <div className="bg-cyan-500/10 rounded p-3">
                          <div className="text-cyan-300 text-sm font-mono">DISTANCE FROM SUN</div>
                          <div className="text-white font-bold">{selectedPlanet.facts.distance}</div>
                        </div>
                        <div className="bg-cyan-500/10 rounded p-3">
                          <div className="text-cyan-300 text-sm font-mono">ORBIT TIME</div>
                          <div className="text-white font-bold">{selectedPlanet.facts.orbitTime}</div>
                        </div>
                        <div className="bg-cyan-500/10 rounded p-3">
                          <div className="text-cyan-300 text-sm font-mono">ATMOSPHERE</div>
                          <div className="text-white font-bold text-sm">{selectedPlanet.facts.atmosphere}</div>
                        </div>
                        <div className="bg-cyan-500/10 rounded p-3">
                          <div className="text-cyan-300 text-sm font-mono">MOONS</div>
                          <div className="text-white font-bold">{selectedPlanet.facts.moons}</div>
                        </div>
                        <div className="bg-cyan-500/10 rounded p-3">
                          <div className="text-cyan-300 text-sm font-mono">TEMPERATURE</div>
                          <div className="text-white font-bold text-sm">{selectedPlanet.facts.temperature}</div>
                        </div>
                      </div>

                      <div className="bg-purple-500/10 rounded p-4">
                        <div className="text-purple-300 text-sm font-mono mb-2">UNIQUE TRAIT</div>
                        <div className="text-white italic">{selectedPlanet.facts.uniqueTrait}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Virtual Lab Experiments */}
            {activeSection === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">VIRTUAL LABORATORY</h2>
                  <p className="text-cyan-300">Interactive Scientific Experiments</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gravity Experiment */}
                  <motion.div
                    className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4 font-mono">GRAVITY SIMULATION</h3>
                    <div className="h-48 bg-gradient-to-b from-blue-900/50 to-black rounded-lg relative overflow-hidden mb-4">
                      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-40 bg-gray-400"></div>
                      <motion.div
                        className="absolute top-4 left-1/2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        style={{
                          transformOrigin: 'top center',
                          transform: `translateX(-50%) rotate(${-Math.sin(Date.now() * 0.001) * 30}deg)`
                        }}
                        animate={{
                          rotate: [-30, 30, -30]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    <div className="text-center text-cyan-300 font-mono">
                      Pendulum motion demonstrating gravitational acceleration
                    </div>
                  </motion.div>

                  {/* Chemical Reaction */}
                  <motion.div
                    className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4 font-mono">CHEMICAL REACTION</h3>
                    <div className="h-48 bg-gradient-to-b from-purple-900/50 to-black rounded-lg relative overflow-hidden mb-4">
                      <motion.div
                        className="absolute bottom-4 left-8 w-16 h-16 bg-gradient-to-t from-blue-400 to-blue-600 rounded-b-full border-2 border-blue-300"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute bottom-4 right-8 w-16 h-16 bg-gradient-to-t from-red-400 to-red-600 rounded-b-full border-2 border-red-300"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                      <motion.div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded border-2 border-purple-300"
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(147,51,234,0.5)',
                            '0 0 20px rgba(147,51,234,1)',
                            '0 0 10px rgba(147,51,234,0.5)'
                          ]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                    <div className="text-center text-cyan-300 font-mono text-sm">
                      Acid-base neutralization reaction with color change indicator
                    </div>
                  </motion.div>

                  {/* Circuit Board */}
                  <motion.div
                    className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-cyan-500/30 lg:col-span-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4 font-mono">ELECTRICAL CIRCUIT</h3>
                    <div className="h-48 bg-gradient-to-b from-green-900/50 to-black rounded-lg relative overflow-hidden mb-4">
                      <div className="absolute inset-4 bg-gradient-to-br from-green-800 to-green-900 rounded border-2 border-green-600">
                        {/* Battery */}
                        <div className="absolute top-4 left-4 w-8 h-12 bg-gradient-to-b from-red-600 to-red-800 rounded border-2 border-red-400 flex flex-col items-center justify-center">
                          <div className="w-1 h-2 bg-red-300 rounded-full mb-1"></div>
                          <div className="w-1 h-2 bg-red-300 rounded-full"></div>
                        </div>

                        {/* Wires */}
                        <div className="absolute top-10 left-12 w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                        <div className="absolute top-10 left-28 w-1 h-12 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                        <div className="absolute top-22 left-20 w-16 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

                        {/* Resistor */}
                        <div className="absolute top-20 left-12 w-8 h-2 bg-gradient-to-r from-brown-600 via-black to-brown-600 border border-brown-400"></div>

                        {/* LED */}
                        <motion.div
                          className="absolute top-20 right-4 w-4 h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full border-2 border-gray-400"
                          animate={{
                            boxShadow: [
                              '0 0 5px rgba(0,255,0,0.5)',
                              '0 0 15px rgba(0,255,0,1)',
                              '0 0 5px rgba(0,255,0,0.5)'
                            ]
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>
                    <div className="text-center text-cyan-300 font-mono text-sm">
                      Series circuit • Ohm's Law: V = IR • Electrical current flow
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Inline Q&A Chat */}
            {activeSection === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">ACADEMIC RESEARCH AI</h2>
                  <p className="text-cyan-300">Advanced Scientific Inquiry & Analysis</p>
                </div>

                {/* Chat Messages */}
                <div className="bg-black/40 backdrop-blur-md rounded-lg border border-cyan-500/30 mb-6">
                  <div className="h-96 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-100'
                                : 'bg-purple-500/20 border border-purple-400/50 text-purple-100'
                            }`}
                          >
                            <div className="text-xs text-cyan-300 mb-2 font-mono">
                              {message.sender === 'user' ? 'RESEARCHER' : 'AI ASSISTANT'} • {message.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="leading-relaxed">{message.text}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-purple-500/20 border border-purple-400/50 text-purple-100 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">AI_PROCESSING</div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-cyan-500/30 p-4">
                    <form onSubmit={handleFormSubmit} className="flex gap-3">
                      <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="Ask a scientific question..."
                        className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:border-cyan-400"
                      />
                      <motion.button
                        type="submit"
                        disabled={!currentQuestion.trim() || isTyping}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ANALYZE
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex gap-4 bg-black/60 backdrop-blur-md rounded-full p-2 border border-cyan-500/30">
            {[
              { id: 'planets', label: 'Planets', icon: '🪐' },
              { id: 'lab', label: 'Lab', icon: '🔬' },
              { id: 'chat', label: 'Chat', icon: '💬' }
            ].map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`px-6 py-3 rounded-full font-mono text-sm transition-all ${
                  activeSection === section.id
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/25'
                    : 'text-cyan-400 hover:bg-cyan-500/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {section.icon} {section.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Galaxy Background Component
function GalaxyBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Stars */}
      {Array.from({ length: 150 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}

      {/* Nebula */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(147,51,234,0.1), transparent)',
            'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.1), transparent)',
            'radial-gradient(circle at 40% 80%, rgba(16,185,129,0.1), transparent)',
            'radial-gradient(circle at 20% 50%, rgba(147,51,234,0.1), transparent)'
          ]
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* Constellations */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <motion.path
          d="M 100,200 L 150,180 L 200,220 L 250,190 L 300,230"
          stroke="rgba(0,255,255,0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.path
          d="M 800,150 L 850,130 L 900,170 L 950,140 L 1000,180"
          stroke="rgba(147,51,234,0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
        />
        <motion.path
          d="M 400,500 L 450,480 L 500,520 L 550,490 L 600,530"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
        />
      </svg>
    </div>
  );
}