'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Mode = 'tech' | 'art' | 'science' | 'commercial';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot({ currentMode }: { currentMode: Mode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm your AI assistant in ${currentMode} mode. How can I help you?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // API call
    try {
      const botResponse = await generateBotResponse(input, currentMode);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = async (userInput: string, mode: Mode): Promise<string> => {
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const modePrompts = {
        tech: 'You are a hacker-style AI assistant. Respond in a technical, coding-focused manner with hacker slang and references.',
        art: 'You are a creative AI artist. Respond poetically and artistically, focusing on visual and creative concepts.',
        science: 'You are a futuristic scientist. Respond scientifically with references to advanced technology and cosmic concepts.',
        commercial: 'You are a business guru AI. Respond with financial insights, market analysis, and entrepreneurial advice.'
      };

      const prompt = `${modePrompts[mode]} User query: ${userInput}. Keep response under 100 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock responses
      const responses = {
        tech: [
          `As a tech expert, I see ${userInput} as an opportunity for innovation. Let's code something amazing!`,
          `In the world of technology, ${userInput} could be optimized with the right algorithms.`,
          `Tech mode activated: ${userInput} requires a systematic approach.`
        ],
        art: [
          `Creatively speaking, ${userInput} inspires a masterpiece. What colors come to mind?`,
          `Art flows through everything. ${userInput} is your canvas - paint it boldly!`,
          `In artistic mode: ${userInput} evokes surreal visions and neon dreams.`
        ],
        science: [
          `Scientifically analyzing ${userInput}: The data suggests fascinating possibilities.`,
          `Science mode: ${userInput} involves quantum leaps in understanding.`,
          `Futuristic research shows ${userInput} could revolutionize our knowledge.`
        ],
        commercial: [
          `Business opportunity detected: ${userInput} has high ROI potential.`,
          `Commercial mode: ${userInput} is a market disruptor waiting to happen.`,
          `Financial guru says: ${userInput} could yield exponential returns.`
        ]
      };

      const modeResponses = responses[mode] || responses.tech;
      return modeResponses[Math.floor(Math.random() * modeResponses.length)];
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">AI Assistant ({currentMode})</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.sender === 'user'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}