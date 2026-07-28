import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Wallet, Users, Calendar, Map, Bell, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const featuredTrips = [
  {
    id: 'taj-mahal',
    destination: 'Taj Mahal, Agra',
    dates: 'Aug 10 - Aug 15, 2026',
    budget: '₹45,000',
    spent: '₹18,500',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
    itineraryHighlight: 'Sunrise at Taj Mahal & Agra Fort Heritage Walk',
    inviteCode: 'TRPTAJ26',
    membersCount: 4
  },
  {
    id: 'goa',
    destination: 'Goa Beaches',
    dates: 'Sep 01 - Sep 07, 2026',
    budget: '₹35,000',
    spent: '₹12,200',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    itineraryHighlight: 'Sunset Cruise & Water Sports at Baga',
    inviteCode: 'TRPGOA26',
    membersCount: 6
  },
  {
    id: 'jaipur',
    destination: 'Jaipur, Rajasthan',
    dates: 'Oct 05 - Oct 12, 2026',
    budget: '₹55,000',
    spent: '₹24,000',
    image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=80',
    itineraryHighlight: 'Amber Fort Light Show & Hawa Mahal Tour',
    inviteCode: 'TRPJAIPUR',
    membersCount: 5
  },
  {
    id: 'kerala',
    destination: 'Kerala Backwaters',
    dates: 'Nov 15 - Nov 22, 2026',
    budget: '₹48,000',
    spent: '₹19,000',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
    itineraryHighlight: 'Alleppey Houseboat Cruise & Tea Gardens',
    inviteCode: 'TRPKERALA',
    membersCount: 4
  }
];

const LandingPage = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % featuredTrips.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentTrip = featuredTrips[activeIdx];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold text-purple-700">
          <Sparkles className="w-6 h-6" />
          TripNest
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-slate-600 hover:text-purple-700 font-medium transition-colors">Log In</Link>
          <Link to="/register" className="px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all shadow-md">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6 border border-purple-200">
            <Sparkles className="w-4 h-4 fill-purple-200" />
            AI-Powered Travel Planning
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Design Your <br/>Dream Trip with <br/><span className="text-purple-600">TripNest</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
            Experience seamless travel planning across India & beyond with AI itineraries, PDF exports, and group expense splitting.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="px-7 py-3.5 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              Start Planning Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="px-7 py-3.5 border border-slate-300 rounded-full font-bold hover:border-purple-600 hover:text-purple-600 transition-all bg-white">
              Log In to Dashboard
            </Link>
          </div>
        </div>

        {/* Live Interactive Mockup Window */}
        <div className="bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> TripNest Dashboard Preview
            </div>
            <div className="w-12"></div>
          </div>

          {/* Featured Trip Card Display */}
          <div className="relative h-72 rounded-2xl overflow-hidden mb-4 shadow-md bg-slate-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTrip.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <img 
                  src={currentTrip.image} 
                  alt={currentTrip.destination} 
                  className="w-full h-full object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>

                {/* Top Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-purple-700 border border-white/40 shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> AI Itinerary Ready
                </div>

                {/* Card Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black drop-shadow-md flex items-center gap-2">
                      <span>{currentTrip.destination}</span>
                    </h3>
                    <span className="bg-purple-600/90 text-white text-xs font-bold px-3 py-1 rounded-lg backdrop-blur-sm">
                      Code: {currentTrip.inviteCode}
                    </span>
                  </div>

                  <p className="text-xs text-purple-200 font-semibold mb-3 flex items-center gap-2">
                    <span>{currentTrip.dates}</span>
                    <span>•</span>
                    <span>{currentTrip.membersCount} Explorers</span>
                  </p>

                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-300 block font-medium">Highlight</span>
                      <span className="font-bold text-white truncate max-w-[200px] block">{currentTrip.itineraryHighlight}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-300 block font-medium">Total Budget</span>
                      <span className="font-black text-emerald-400">{currentTrip.budget}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Mini Cards Carousel */}
          <div className="grid grid-cols-4 gap-2.5">
            {featuredTrips.map((trip, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={trip.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative rounded-xl overflow-hidden h-16 text-left transition-all cursor-pointer border-2 ${
                    isActive ? 'border-purple-600 ring-2 ring-purple-200 scale-[1.02]' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent"></div>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-[11px] font-bold truncate">
                    <span>{trip.destination.split(',')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for the <span className="text-purple-600">perfect trip</span></h2>
            <p className="text-slate-600 max-w-2xl mx-auto">TripNest combines powerful AI with intuitive design to handle all the complex logistics of travel planning.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Calendar />} title="AI Itinerary Planner" desc="Generate personalized, day-by-day travel itineraries based on your interests and budget in seconds." />
            <FeatureCard icon={<Wallet />} title="Smart Expense Tracker" desc="Keep track of all your trip costs, split bills with friends, and stay perfectly within budget." />
            <FeatureCard icon={<Users />} title="Collaborative Planning" desc="Invite friends to view, edit, and vote on activities in real-time. Travel planning made social." />
            <FeatureCard icon={<Calendar />} title="Unified Calendar" desc="Sync your flights, hotels, and activities into one beautifully organized visual timeline." />
            <FeatureCard icon={<Map />} title="Interactive Maps" desc="Visualize your daily routes and discover nearby attractions automatically suggested by AI." />
            <FeatureCard icon={<Bell />} title="Smart Alerts" desc="Receive real-time notifications about flight changes, upcoming reservations, and budget limits." />
          </div>
        </div>
      </section>
    </div>
  );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;