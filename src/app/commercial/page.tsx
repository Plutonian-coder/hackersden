'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import AboutModal from '@/components/AboutModal';
import FuturisticHamburgerMenu from '@/components/FuturisticHamburgerMenu';

type Section = 'accounting' | 'budgeting' | 'stocks' | 'business' | 'quiz' | 'chat';

interface Transaction {
  id: string;
  description: string;
  account: string;
  amount: number;
  type: 'debit' | 'credit';
  date: Date;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function CommercialPage() {
  const [activeSection, setActiveSection] = useState<Section>('accounting');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([
    { symbol: 'MTN', name: 'MTN Nigeria', price: 250.50, change: 5.25, changePercent: 2.14 },
    { symbol: 'ZENITH', name: 'Zenith Bank', price: 45.80, change: -1.20, changePercent: -2.55 },
    { symbol: 'DANGCEM', name: 'Dangote Cement', price: 380.00, change: 12.50, changePercent: 3.40 },
    { symbol: 'AIRTEL', name: 'Airtel Africa', price: 1200.00, change: -25.00, changePercent: -2.04 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.30, change: 45.20, changePercent: 1.67 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 335.80, change: 8.90, changePercent: 2.72 }
  ]);
  const [portfolio, setPortfolio] = useState<{[key: string]: number}>({});
  const [balance, setBalance] = useState(100000);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState<{text: string, sender: 'user' | 'ai', timestamp: Date}[]>([
    {
      text: 'Welcome to the Corporate AI Assistant. I specialize in business, finance, and commercial analysis. How may I help you with your commercial endeavors today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [gestureBuffer, setGestureBuffer] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Mock stock price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 5
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Gesture recognition
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setGestureBuffer(prev => {
        const newBuffer = prev + key;

        if (newBuffer.includes('s')) {
          setActiveSection('stocks');
          return '';
        } else if (newBuffer.includes('b')) {
          setActiveSection('budgeting');
          return '';
        }

        return newBuffer;
      });

      setTimeout(() => setGestureBuffer(''), 2000);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Canvas drawing for gestures
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Add transaction
  const addTransaction = (description: string, account: string, amount: number, type: 'debit' | 'credit') => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      account,
      amount,
      type,
      date: new Date()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  // Buy stock
  const buyStock = (symbol: string, quantity: number) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const cost = stock.price * quantity;
    if (cost > balance) {
      alert('Insufficient funds!');
      return;
    }

    setBalance(prev => prev - cost);
    setPortfolio(prev => ({
      ...prev,
      [symbol]: (prev[symbol] || 0) + quantity
    }));
  };

  // Sell stock
  const sellStock = (symbol: string, quantity: number) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock || (portfolio[symbol] || 0) < quantity) return;

    const revenue = stock.price * quantity;
    setBalance(prev => prev + revenue);
    setPortfolio(prev => ({
      ...prev,
      [symbol]: prev[symbol] - quantity
    }));
  };

  // Ask AI question
  const askQuestion = async () => {
    if (!currentQuestion.trim() || isTyping) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsTyping(true);

    const userMessage = {
      text: question,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a corporate AI assistant specializing in business, finance, accounting, and commercial analysis. Provide professional, practical advice for entrepreneurs and business professionals. Keep responses focused on commercial and financial topics. Question: ${question}`;

      const result = await model.generateContent(prompt);
      const aiResponse = await result.response;

      const aiMessage = {
        text: aiResponse.text().trim(),
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Commercial chat error:', error);
      const errorMessage = {
        text: 'I apologize, but I encountered an error processing your commercial inquiry. Please rephrase your business question.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Calculate financial statements
  const calculateLedger = () => {
    const ledger: {[key: string]: {debits: number, credits: number}} = {};

    transactions.forEach(transaction => {
      if (!ledger[transaction.account]) {
        ledger[transaction.account] = { debits: 0, credits: 0 };
      }
      if (transaction.type === 'debit') {
        ledger[transaction.account].debits += transaction.amount;
      } else {
        ledger[transaction.account].credits += transaction.amount;
      }
    });

    return ledger;
  };

  const ledger = calculateLedger();

  // Calculate trial balance
  const trialBalance = Object.entries(ledger).map(([account, balances]) => ({
    account,
    debit: balances.debits,
    credit: balances.credits,
    balance: balances.debits - balances.credits
  }));

  // Calculate portfolio value
  const portfolioValue = Object.entries(portfolio).reduce((total, [symbol, quantity]) => {
    const stock = stocks.find(s => s.symbol === symbol);
    return total + (stock ? stock.price * quantity : 0);
  }, 0);

  const totalValue = balance + portfolioValue;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Corporate Background */}
      <CorporateBackground />

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
                '0 0 20px rgba(255,215,0,0.5)',
                '0 0 40px rgba(255,215,0,0.8)',
                '0 0 20px rgba(255,215,0,0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            CORPORATE AI SUITE
          </motion.h1>
          <p className="text-green-300 text-lg font-light">
            Advanced Business Intelligence • Financial Analytics v2.1
          </p>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          <AnimatePresence mode="wait">
            {/* AI Accounting Assistant */}
            {activeSection === 'accounting' && (
              <motion.div
                key="accounting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">AI ACCOUNTING ASSISTANT</h2>
                  <p className="text-green-300">Automated Financial Record Keeping & Analysis</p>
                </div>

                {/* Transaction Input */}
                <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Add Transaction</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const description = formData.get('description') as string;
                    const account = formData.get('account') as string;
                    const amount = parseFloat(formData.get('amount') as string);
                    const type = formData.get('type') as 'debit' | 'credit';
                    if (description && account && amount) {
                      addTransaction(description, account, amount, type);
                      e.currentTarget.reset();
                    }
                  }} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <input
                      name="description"
                      placeholder="Description"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white placeholder-green-400"
                      required
                    />
                    <input
                      name="account"
                      placeholder="Account"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white placeholder-green-400"
                      required
                    />
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white placeholder-green-400"
                      required
                    />
                    <select
                      name="type"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white"
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded px-4 py-2 hover:from-green-600 hover:to-emerald-600"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Financial Statements */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ledger */}
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-white mb-4">General Ledger</h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {Object.entries(ledger).map(([account, balances]) => (
                        <div key={account} className="bg-white/5 rounded p-3">
                          <h4 className="text-green-300 font-bold mb-2">{account}</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-green-400">Debit: ₦{balances.debits.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-red-400">Credit: ₦{balances.credits.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trial Balance */}
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-white mb-4">Trial Balance</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {trialBalance.map((item) => (
                        <div key={item.account} className="grid grid-cols-3 gap-4 text-sm bg-white/5 rounded p-2">
                          <div className="text-white">{item.account}</div>
                          <div className="text-green-400">₦{item.debit.toFixed(2)}</div>
                          <div className="text-red-400">₦{item.credit.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Financial Statements Summary */}
                <div className="mt-6 bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-500/10 rounded p-4">
                      <div className="text-green-300 text-sm font-mono">TOTAL ASSETS</div>
                      <div className="text-white text-2xl font-bold">
                        ₦{trialBalance.filter(item => item.balance > 0).reduce((sum, item) => sum + item.balance, 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-red-500/10 rounded p-4">
                      <div className="text-red-300 text-sm font-mono">TOTAL LIABILITIES</div>
                      <div className="text-white text-2xl font-bold">
                        ₦{Math.abs(trialBalance.filter(item => item.balance < 0).reduce((sum, item) => sum + item.balance, 0)).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-yellow-500/10 rounded p-4">
                      <div className="text-yellow-300 text-sm font-mono">NET PROFIT</div>
                      <div className="text-white text-2xl font-bold">
                        ₦{(trialBalance.filter(item => item.balance > 0).reduce((sum, item) => sum + item.balance, 0) +
                           trialBalance.filter(item => item.balance < 0).reduce((sum, item) => sum + item.balance, 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Budgeting & Expense Tracker */}
            {activeSection === 'budgeting' && (
              <motion.div
                key="budgeting"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">BUDGET ANALYTICS</h2>
                  <p className="text-green-300">Financial Planning & Expense Management</p>
                </div>

                {/* Budget Input */}
                <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4">Add Budget Item</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const category = formData.get('category') as string;
                    const amount = parseFloat(formData.get('amount') as string);
                    const type = formData.get('type') as 'income' | 'expense';
                    if (category && amount) {
                      setBudgetItems(prev => [...prev, {
                        id: Date.now().toString(),
                        category,
                        amount,
                        type
                      }]);
                      e.currentTarget.reset();
                    }
                  }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      name="category"
                      placeholder="Category"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white placeholder-green-400"
                      required
                    />
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white placeholder-green-400"
                      required
                    />
                    <select
                      name="type"
                      className="bg-white/10 border border-green-500/30 rounded px-3 py-2 text-white"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded px-4 py-2 hover:from-green-600 hover:to-emerald-600"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Budget Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(() => {
                    const totalIncome = budgetItems.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
                    const totalExpenses = budgetItems.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
                    const netSavings = totalIncome - totalExpenses;

                    return (
                      <>
                        <div className="bg-green-500/10 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                          <div className="text-green-300 text-sm font-mono mb-2">TOTAL INCOME</div>
                          <div className="text-white text-3xl font-bold">₦{totalIncome.toFixed(2)}</div>
                        </div>
                        <div className="bg-red-500/10 backdrop-blur-md rounded-lg p-6 border border-red-500/30">
                          <div className="text-red-300 text-sm font-mono mb-2">TOTAL EXPENSES</div>
                          <div className="text-white text-3xl font-bold">₦{totalExpenses.toFixed(2)}</div>
                        </div>
                        <div className={`backdrop-blur-md rounded-lg p-6 border ${netSavings >= 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <div className={`${netSavings >= 0 ? 'text-yellow-300' : 'text-red-300'} text-sm font-mono mb-2`}>NET SAVINGS</div>
                          <div className="text-white text-3xl font-bold">₦{netSavings.toFixed(2)}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Budget Breakdown */}
                <div className="mt-6 bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4">Budget Breakdown</h3>
                  <div className="space-y-4">
                    {budgetItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white/5 rounded p-3">
                        <div>
                          <div className="text-white font-semibold">{item.category}</div>
                          <div className={`text-sm ${item.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {item.type.toUpperCase()}
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${item.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          ₦{item.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stock Market Simulator */}
            {activeSection === 'stocks' && (
              <motion.div
                key="stocks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">STOCK MARKET SIMULATOR</h2>
                  <p className="text-green-300">Virtual Trading Platform • Real-time Market Data</p>
                </div>

                {/* Portfolio Summary */}
                <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-green-300 text-sm font-mono">CASH BALANCE</div>
                      <div className="text-white text-2xl font-bold">₦{balance.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-300 text-sm font-mono">PORTFOLIO VALUE</div>
                      <div className="text-white text-2xl font-bold">₦{portfolioValue.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-mono ${totalValue >= 100000 ? 'text-green-300' : 'text-red-300'}`}>TOTAL VALUE</div>
                      <div className={`text-2xl font-bold ${totalValue >= 100000 ? 'text-green-400' : 'text-red-400'}`}>
                        ₦{totalValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Market */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Stock List */}
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-white mb-4">Market Overview</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {stocks.map((stock) => (
                        <div key={stock.symbol} className="bg-white/5 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="text-white font-bold">{stock.symbol}</div>
                              <div className="text-green-300 text-sm">{stock.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold">₦{stock.price.toFixed(2)}</div>
                              <div className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => buyStock(stock.symbol, 1)}
                              className="flex-1 bg-green-500/20 border border-green-500/50 text-green-300 rounded px-3 py-1 hover:bg-green-500/40 text-sm"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => sellStock(stock.symbol, 1)}
                              className="flex-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded px-3 py-1 hover:bg-red-500/40 text-sm"
                              disabled={(portfolio[stock.symbol] || 0) === 0}
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-white mb-4">Your Portfolio</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(portfolio).filter(([, quantity]) => quantity > 0).map(([symbol, quantity]) => {
                        const stock = stocks.find(s => s.symbol === symbol);
                        if (!stock) return null;
                        const value = stock.price * quantity;
                        const cost = 100000 - balance;
                        const gain = value - (cost * quantity / Object.values(portfolio).reduce((a, b) => a + b, 0));

                        return (
                          <div key={symbol} className="bg-white/5 rounded p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-white font-bold">{symbol}</div>
                                <div className="text-green-300 text-sm">{quantity} shares</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">₦{value.toFixed(2)}</div>
                                <div className={`text-sm ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {gain >= 0 ? '+' : ''}₦{gain.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(portfolio).length === 0 && (
                        <div className="text-center text-green-300 py-8">
                          No holdings yet. Start trading to build your portfolio!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Business Plan Generator */}
            {activeSection === 'business' && (
              <motion.div
                key="business"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">BUSINESS PLAN GENERATOR</h2>
                  <p className="text-green-300">AI-Powered Business Strategy & Planning</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                  <div className="text-center text-green-300 mb-6">
                    Describe your business idea and I'll generate a comprehensive business plan!
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded p-4">
                      <h4 className="text-white font-bold mb-2">Example Business Ideas:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-300">
                        <div>• "I want to start a bakery with ₦100,000 capital"</div>
                        <div>• "Tech startup for mobile app development"</div>
                        <div>• "Online retail store for fashion"</div>
                        <div>• "Food delivery service in Lagos"</div>
                      </div>
                    </div>

                    <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const idea = formData.get('idea') as string;
                      if (!idea.trim()) return;

                      setIsTyping(true);
                      try {
                        const genAI = new GoogleGenerativeAI('AIzaSyAMQJd9248W4eB_uw8p7BNLC3wq73RINp8');
                        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                        const prompt = `Generate a comprehensive business plan for: ${idea}. Include: executive summary, market analysis, startup costs, revenue projections, marketing strategy, and financial projections for the first year. Keep it practical and realistic for a Nigerian entrepreneur.`;

                        const result = await model.generateContent(prompt);
                        const plan = await result.response;

                        alert(`Business Plan Generated!\n\n${plan.text().substring(0, 500)}...\n\n(This is a preview. Full plan would be much more detailed.)`);
                      } catch (error) {
                        console.error('Business plan error:', error);
                        alert('Error generating business plan. Please try again.');
                      } finally {
                        setIsTyping(false);
                      }
                    }}>
                      <textarea
                        name="idea"
                        placeholder="Describe your business idea..."
                        className="w-full bg-white/10 border border-green-500/30 rounded px-4 py-3 text-white placeholder-green-400 h-24 resize-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isTyping}
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded px-6 py-3 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                      >
                        {isTyping ? 'Generating Plan...' : 'Generate Business Plan'}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz Mode */}
            {activeSection === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">COMMERCIAL QUIZ</h2>
                  <p className="text-green-300">Test Your Business & Financial Knowledge</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-lg p-6 border border-green-500/30">
                  <div className="text-center text-green-300 mb-6">
                    Quiz feature coming soon! Test your knowledge in Accounting, Business Studies, Economics, and Commerce.
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Accounting', 'Business Studies', 'Economics', 'Commerce'].map((subject) => (
                      <div key={subject} className="bg-white/10 rounded p-4 text-center">
                        <div className="text-white font-bold mb-2">{subject}</div>
                        <div className="text-green-300 text-sm">Coming Soon</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Chat */}
            {activeSection === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4 font-mono">CORPORATE AI ASSISTANT</h2>
                  <p className="text-green-300">Business Intelligence & Financial Analysis</p>
                </div>

                {/* Chat Messages */}
                <div className="bg-black/40 backdrop-blur-md rounded-lg border border-green-500/30 mb-6">
                  <div className="h-96 overflow-y-auto p-6 space-y-4">
                    <AnimatePresence>
                      {chatMessages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-green-500/20 border border-green-400/50 text-green-100'
                                : 'bg-yellow-500/20 border border-yellow-400/50 text-yellow-100'
                            }`}
                          >
                            <div className="text-xs text-green-300 mb-2 font-mono">
                              {message.sender === 'user' ? 'ENTREPRENEUR' : 'AI CONSULTANT'} • {message.timestamp.toLocaleTimeString()}
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
                        <div className="bg-yellow-500/20 border border-yellow-400/50 text-yellow-100 p-4 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm">Analyzing business strategy...</div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-green-500/30 p-4">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      askQuestion();
                    }} className="flex gap-3">
                      <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="Ask about business, finance, or accounting..."
                        className="flex-1 bg-black/50 border border-green-500/30 rounded-lg px-4 py-3 text-green-100 placeholder-green-400/50 focus:outline-none focus:border-green-400"
                      />
                      <motion.button
                        type="submit"
                        disabled={!currentQuestion.trim() || isTyping}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-yellow-500 text-white rounded-lg hover:from-green-600 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
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
          <div className="flex gap-2 bg-black/60 backdrop-blur-md rounded-full p-2 border border-green-500/30">
            {[
              { id: 'accounting', label: '📊 Accounting', short: 'A' },
              { id: 'budgeting', label: '💰 Budgeting', short: 'B' },
              { id: 'stocks', label: '📈 Stocks', short: 'S' },
              { id: 'business', label: '💼 Business', short: 'P' },
              { id: 'quiz', label: '🎯 Quiz', short: 'Q' },
              { id: 'chat', label: '🤖 AI Chat', short: 'C' }
            ].map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`px-4 py-2 rounded-full font-mono text-xs transition-all ${
                  activeSection === section.id
                    ? 'bg-green-500/20 border border-green-400 text-green-300 shadow-lg shadow-green-500/25'
                    : 'text-green-400 hover:bg-green-500/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`${section.label} (${section.short})`}
              >
                {section.short}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Gesture Canvas */}
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-0 opacity-30"
          width={typeof window !== 'undefined' ? window.innerWidth : 1200}
          height={typeof window !== 'undefined' ? window.innerHeight : 800}
        />
      </div>
    </div>
  );
}

// Corporate Background Component
function CorporateBackground() {
  const icons = ['💰', '₦', '$', '%', '📊', '💼', '🏢', '💡'];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(0,0,0,0.9), rgba(16,185,129,0.1), rgba(255,215,0,0.1))',
            'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(255,215,0,0.1), rgba(0,0,0,0.9))',
            'linear-gradient(225deg, rgba(255,215,0,0.1), rgba(0,0,0,0.9), rgba(16,185,129,0.1))',
            'linear-gradient(315deg, rgba(0,0,0,0.9), rgba(16,185,129,0.1), rgba(255,215,0,0.1))'
          ]
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />

      {/* Stock Ticker Animation */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/50 border-b border-green-500/30 overflow-hidden">
        <motion.div
          className="flex items-center h-full text-green-400 font-mono text-sm whitespace-nowrap"
          animate={{ x: [-1000, typeof window !== 'undefined' ? window.innerWidth : 1200] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="mx-8">
              ₦{Math.floor(Math.random() * 10000)} • ${Math.floor(Math.random() * 500)} • {Math.floor(Math.random() * 100)}% • 📈
            </span>
          ))}
        </motion.div>
      </div>

      {/* Floating Finance Icons */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        >
          {icons[Math.floor(Math.random() * icons.length)]}
        </motion.div>
      ))}
    </div>
  );
}