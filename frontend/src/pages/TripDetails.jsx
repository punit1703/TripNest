import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Wallet, Sparkles, Receipt, Loader2, Key, ArrowLeftRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, itinerary, expenses
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  // Settle Up States
  const [currentUser, setCurrentUser] = useState(null);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleError, setSettleError] = useState('');
  const [settleForm, setSettleForm] = useState({ recipient: '', amount: '' });

  useEffect(() => {
    fetchTripDetails();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/profile/');
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'expenses') {
      fetchExpenses();
    }
  }, [id, activeTab]);

  const fetchTripDetails = async () => {
    try {
      setIsLoading(true);
      // Fetches the specific trip data based on the URL parameter
      const response = await api.get(`/trips/${id}/`);
      setTrip(response.data);
      if (response.data.itinerary_days && response.data.itinerary_days.length > 0) {
        setItinerary(response.data.itinerary_days.map(day => ({
          day: day.day_number,
          activity: day.activity_description
        })));
      }
    } catch (err) {
      setError('Failed to load trip details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/trips/${id}/expenses/`);
      setExpenses(response.data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  };

  const calculateBalances = () => {
    if (!trip || !trip.members || trip.members.length === 0) return {};
    
    const memberCount = trip.members.length;
    const balances = {};
    
    // Initialize balances for all members to 0
    trip.members.forEach(member => {
      const username = member.user?.username || member.username || (typeof member === 'string' ? member : 'Unknown');
      balances[username] = 0;
    });
    
    // Calculate balances from expenses
    expenses.forEach(exp => {
      const payerName = exp.payer_username || (exp.payer && exp.payer.username) || 'Unknown';
      const amount = parseFloat(exp.amount) || 0;
      
      if (exp.is_settlement) {
        const recipientName = exp.recipient_username || (exp.recipient && exp.recipient.username) || 'Unknown';
        
        // Payer gets credited the full amount they paid
        if (balances[payerName] !== undefined) {
          balances[payerName] += amount;
        }
        // Recipient gets debited the amount they received
        if (balances[recipientName] !== undefined) {
          balances[recipientName] -= amount;
        }
      } else {
        const share = amount / memberCount;
        
        // Each member owes their share
        trip.members.forEach(member => {
          const username = member.user?.username || member.username || (typeof member === 'string' ? member : 'Unknown');
          balances[username] -= share;
        });
        
        // The payer gets credited the full amount they paid
        if (balances[payerName] !== undefined) {
          balances[payerName] += amount;
        } else {
          balances[payerName] = amount - share;
        }
      }
    });
    
    return balances;
  };



  const handleAddExpense = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    
    try {
        // Send the data to Django
        await api.post(`/trips/${id}/expenses/`, {
            description: expenseDesc,
            amount: expenseAmount
        });
        
        alert("Expense sent to Django!"); // Temporary success message
        
        // Clear the form for the next expense
        setExpenseDesc('');
        setExpenseAmount('');
        
        // Refresh the page data
        fetchExpenses();
    } catch (error) {
        console.error("Error sending expense:", error);
        alert("Backend not ready yet!");
    }
  };

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    setSettleLoading(true);
    setSettleError('');
    try {
      await api.post(`/trips/${id}/expenses/`, {
        description: 'Settle Up Payment',
        amount: settleForm.amount,
        is_settlement: true,
        recipient: settleForm.recipient
      });
      setIsSettleOpen(false);
      setSettleForm({ recipient: '', amount: '' });
      fetchExpenses();
    } catch (err) {
      console.error("Failed to submit settlement:", err);
      setSettleError(err.response?.data?.error || err.response?.data?.detail || "Failed to log payment.");
    } finally {
      setSettleLoading(false);
    }
  };

  const handleGenerateItinerary = async () => {
    try {
        setIsGenerating(true);
        setGenerationError('');
        const response = await api.post(`/trips/${id}/generate-itinerary/`);
        setItinerary(response.data.itinerary); 
    } catch (err) {
        console.error("Generation failed:", err);
        setGenerationError(err.response?.data?.error || err.message || "Failed to generate schedule. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-4">{error}</div>
        <button onClick={() => navigate('/')} className="text-purple-600 font-medium hover:underline">
          &larr; Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-xl font-bold text-slate-900 truncate">{trip.name}</div>
        </div>
      </nav>

      {/* Trip Header Banner */}
      <motion.header 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto px-6 py-8"
      >
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <Sparkles className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Key className="w-3 h-3" /> Code: {trip.invite_code}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold mb-4">{trip.name}</h1>
            <div className="flex flex-wrap gap-6 text-purple-100 font-medium text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-300" /> {trip.destination}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-300" /> {trip.start_date} to {trip.end_date}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-300" /> Budget: ${parseFloat(trip.total_budget).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tabs Navigation */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm relative">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Users />} label="Overview & Members" />
          <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} icon={<Sparkles />} label="AI Itinerary" />
          <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt />} label="Expenses & Balances" />
        </div>
      </div>

      {/* Tab Content Areas */}
      <main className="max-w-5xl mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-center mb-6">
                  <Users className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Trip Members</h2>
                  <p className="text-slate-500">
                    Share your invite code <strong className="text-purple-600">{trip.invite_code}</strong> with friends so they can join this trip.
                  </p>
                </div>

                {/* Check if we have members to show */}
                {trip.members && trip.members.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
                  >
                    {trip.members.map((member, index) => {
                      const username = member.user?.username || member.username || (typeof member === 'string' ? member : 'Unknown');
                      const firstLetter = username.charAt(0).toUpperCase();
                      return (
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          key={index} 
                          className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 hover:bg-purple-50 transition-colors duration-200"
                        >
                          <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                            {firstLetter}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{username}</span>
                            {member.user?.email && (
                              <span className="text-xs text-slate-400 truncate">{member.user.email}</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-6">
                    No members have joined this trip yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="mt-8">
                  {/* If we DON'T have an itinerary yet, show the generator button */}
                  {!itinerary ? (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center"
                      >
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              {isGenerating ? (
                                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                              ) : (
                                  <span className="text-3xl animate-bounce">✨</span>
                              )}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Magic Itinerary Generator</h3>
                          <p className="text-gray-600 mb-8 max-w-md mx-auto">
                              Let our intelligent system build a custom schedule for <strong className="text-purple-600">{trip.destination}</strong> based on your ${parseFloat(trip.total_budget).toLocaleString()} budget.
                          </p>
                          
                          {generationError && (
                              <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-6 max-w-md mx-auto">
                                  {generationError}
                              </div>
                          )}

                          <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleGenerateItinerary}
                              disabled={isGenerating}
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md mx-auto flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                          >
                              {isGenerating ? (
                                  <>
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      Creating your plan...
                                  </>
                              ) : (
                                  "Generate My Schedule"
                              )}
                          </motion.button>
                      </motion.div>
                  ) : (
                      /* If we DO have an itinerary, display the day-by-day plan! */
                      <div className="space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 px-2">Your AI-Generated Schedule</h3>
                          
                          <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-4"
                          >
                            {itinerary.map((dayPlan, index) => (
                                <motion.div 
                                  variants={itemVariants}
                                  whileHover={{ scale: 1.01, x: 2 }}
                                  key={index} 
                                  className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 flex items-center gap-6 transition-all hover:shadow-md"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 bg-purple-50 text-purple-700 rounded-xl flex flex-col items-center justify-center font-bold border border-purple-200">
                                        <span className="text-xs uppercase tracking-wider text-purple-500">Day</span>
                                        <span className="text-2xl">{dayPlan.day}</span>
                                    </div>
                                    <p className="text-gray-800 text-lg leading-relaxed">
                                        {dayPlan.activity}
                                    </p>
                                </motion.div>
                            ))}
                          </motion.div>
                          
                          <motion.button 
                              whileHover={{ scale: 1.02 }}
                              onClick={() => setItinerary(null)}
                              className="mt-6 text-gray-500 hover:text-purple-600 font-medium text-sm text-center w-full transition-colors cursor-pointer"
                          >
                              Start Over
                          </motion.button>
                      </div>
                  )}
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Left Side: Form and Expenses List */}
                <div className="flex flex-col gap-6">
                  {/* Add Expense Form */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Add an Expense</h3>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsSettleOpen(true);
                          // Prefill recipient with the first non-current member
                          const otherMember = trip.members.find(m => {
                            const uname = m.user?.username || m.username || m;
                            return uname !== currentUser?.username;
                          });
                          const otherId = otherMember?.user?.id || otherMember?.id || '';
                          setSettleForm({ recipient: otherId, amount: '' });
                        }}
                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/50 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" /> Settle Up
                      </motion.button>
                    </div>
                    <form className="flex flex-col gap-4" onSubmit={handleAddExpense}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input 
                          type="text" 
                          value={expenseDesc}
                          onChange={(e) => setExpenseDesc(e.target.value)}
                          placeholder="e.g., Dinner at cafe" 
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50" 
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input 
                          type="number" 
                          value={expenseAmount}
                          onChange={(e) => setExpenseAmount(e.target.value)}
                          placeholder="0.00" 
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50" 
                          required
                        />
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors mt-2 cursor-pointer"
                      >
                        Log Expense
                      </motion.button>
                    </form>
                  </div>

                  {/* Recent Expenses List */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Expenses</h3>
                    {expenses.length === 0 ? (
                      <div className="text-slate-400 text-sm text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        No expenses logged yet.
                      </div>
                    ) : (
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1"
                      >
                        {expenses.map((exp) => (
                          <motion.div 
                            variants={itemVariants}
                            whileHover={{ scale: 1.01 }}
                            key={exp.id} 
                            className={`flex justify-between items-center p-3 rounded-xl border transition-colors duration-150 ${
                              exp.is_settlement 
                                ? 'bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-50' 
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {exp.is_settlement ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <ArrowLeftRight className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                  <Receipt className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">
                                  {exp.is_settlement 
                                    ? `${exp.payer_username} settled up` 
                                    : exp.description}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {exp.is_settlement 
                                    ? `Paid ${exp.recipient_username}` 
                                    : `Paid by ${exp.payer_username}`}
                                </p>
                              </div>
                            </div>
                            <span className={`font-bold ${exp.is_settlement ? 'text-emerald-600' : 'text-slate-700'}`}>
                              ${parseFloat(exp.amount).toFixed(2)}
                            </span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Right Side: Balances Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 self-start w-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Current Balances</h3>
                  {expenses.length === 0 ? (
                    <div className="text-gray-500 text-center flex flex-col justify-center h-[200px] bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <p>No expenses logged yet.</p>
                      <p className="text-sm mt-1">Add a cost to see the math!</p>
                    </div>
                  ) : (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col gap-3"
                    >
                      {Object.entries(calculateBalances()).map(([username, balance]) => (
                        <motion.div 
                          variants={itemVariants}
                          key={username} 
                          className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100"
                        >
                          <span className="font-semibold text-slate-800 text-sm">{username}</span>
                          <span className={`font-bold text-sm ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {balance >= 0 ? `Owed $${balance.toFixed(2)}` : `Owes $${Math.abs(balance).toFixed(2)}`}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ================= MODAL: SETTLE UP ================= */}
      <AnimatePresence>
        {isSettleOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 relative"
            >
              <button 
                onClick={() => { setIsSettleOpen(false); setSettleError(''); }}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-500" />
                Settle Up
              </h3>
              <p className="text-slate-500 text-sm mb-6">Record a direct cash or online payment to settle balance.</p>

              <form onSubmit={handleSettleSubmit} className="space-y-4">
                {settleError && (
                  <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-100 font-medium">
                    {settleError}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">From (Payer)</label>
                  <input
                    type="text"
                    disabled
                    value={`Me (@${currentUser?.username || 'loading...'})`}
                    className="block w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">To (Recipient)</label>
                  <select
                    required
                    value={settleForm.recipient}
                    onChange={(e) => setSettleForm({ ...settleForm, recipient: e.target.value })}
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800 bg-slate-50 bg-white/50"
                  >
                    <option value="">Select Recipient</option>
                    {trip.members.map(member => {
                      const uname = member.user?.username || member.username || member;
                      const uid = member.user?.id || member.id;
                      if (uname === currentUser?.username) return null;
                      return <option key={uid} value={uid}>{uname}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={settleForm.amount}
                    onChange={(e) => setSettleForm({ ...settleForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-slate-800 bg-slate-50"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={settleLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer mt-2"
                >
                  {settleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log Payment'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Reusable tab button component with sliding pill indicator
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 relative cursor-pointer ${
      active 
        ? 'text-purple-700 z-10 font-bold' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
    }`}
  >
    {active && (
      <motion.div 
        layoutId="activeTabPill" 
        className="absolute inset-0 bg-purple-100 rounded-xl -z-10 shadow-sm border border-purple-200/50" 
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    )}
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    {label}
  </button>
);

export default TripDetails;