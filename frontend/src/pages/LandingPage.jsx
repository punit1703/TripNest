import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Wallet, Users, Calendar, Map, Bell, ArrowRight } from 'lucide-react';

const LandingPage = () => {
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
          <Link to="/register" className="px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Travel Planning
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Design Your <br/>Dream Trip with <br/><span className="text-purple-600">TripNest</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-md">
            Experience seamless travel planning, smart itineraries, and effortless expense tracking. All in one beautiful place.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-all hover:shadow-lg flex items-center gap-2">
              Start Planning <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-6 py-3 border border-slate-300 rounded-full font-medium hover:border-purple-600 hover:text-purple-600 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
        {/* Decorative Mockup Window */}
        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="h-64 bg-slate-50 rounded-lg border border-dashed border-slate-200 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-purple-50 rounded-lg"></div>
            <div className="h-24 bg-purple-50 rounded-lg"></div>
            <div className="h-24 bg-purple-50 rounded-lg"></div>
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