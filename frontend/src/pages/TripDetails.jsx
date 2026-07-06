import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Wallet, Sparkles, Receipt, Loader2, Key } from 'lucide-react';
import api from '../services/api';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, itinerary, expenses
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setIsLoading(true);
      // Fetches the specific trip data based on the URL parameter
      const response = await api.get(`/trips/${id}/`);
      setTrip(response.data);
    } catch (err) {
      setError('Failed to load trip details.');
    } finally {
      setIsLoading(false);
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
        <button onClick={() => navigate('/dashboard')} className="text-purple-600 font-medium hover:underline">
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-xl font-bold text-slate-900 truncate">{trip.name}</div>
        </div>
      </nav>

      {/* Trip Header Banner */}
      <header className="max-w-5xl mx-auto px-6 py-8">
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
      </header>

      {/* Tabs Navigation */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Users />} label="Overview & Members" />
          <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} icon={<Sparkles />} label="AI Itinerary" />
          <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt />} label="Expenses & Balances" />
        </div>
      </div>

      {/* Tab Content Areas (We will build these fully in the next steps) */}
      <main className="max-w-5xl mx-auto px-6">
        {activeTab === 'overview' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Trip Members</h2>
              <p className="text-slate-500">
                Share your invite code <strong className="text-purple-600">{trip.invite_code}</strong> with friends so they can join this trip.
              </p>
            </div>

            {/* Check if we have members to show */}
            {trip.members && trip.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {trip.members.map((member, index) => {
                  const username = member.user?.username || member.username || (typeof member === 'string' ? member : 'Unknown');
                  const firstLetter = username.charAt(0).toUpperCase();
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100/50 hover:bg-purple-50 transition-all duration-200">
                      <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                        {firstLetter}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{username}</span>
                        {member.user?.email && (
                          <span className="text-xs text-slate-400 truncate">{member.user.email}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-6">
                No members have joined this trip yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">AI Travel Planner</h2>
            <p className="text-slate-500">Your day-by-day schedule will appear here. We will integrate the AI planner next!</p>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <Wallet className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Expense Tracker</h2>
            <p className="text-slate-500">We will add the form to log costs and calculate who owes who right here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// Simple reusable tab button component
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
      active 
        ? 'bg-purple-100 text-purple-700 shadow-sm' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
    {label}
  </button>
);

export default TripDetails;