import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Calendar, MapPin, DollarSign, Key, Loader2, LogOut, Sparkles, FolderTravel } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals visibility state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form states
  const [createData, setCreateData] = useState({ name: '', destination: '', total_budget: '', start_date: '', end_date: '' });
  const [joinCode, setJoinCode] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all user trips on component mount
  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/trips/user'); // GET /trips/user
      setTrips(response.data);
    } catch (err) {
      setError('Failed to load trips. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // POST /trips/create
      await api.post('/trips/create', createData);
      setShowCreateModal(false);
      setCreateData({ name: '', destination: '', total_budget: '', start_date: '', end_date: '' });
      fetchTrips(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create trip.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // POST /trips/join
      await api.post('/trips/join', { invite_code: joinCode });
      setShowJoinModal(false);
      setJoinCode('');
      fetchTrips(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.detail || 'Invalid invite code or already joined.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Upper Top Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold text-purple-700 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="w-6 h-6" />
            TripNest
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:text-red-600 hover:border-red-200 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome Dashboard Header */}
        <div className="md:flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Adventures</h1>
            <p className="text-slate-500 mt-1">Manage your shared schedules and group expenses perfectly.</p>
          </div>
          {/* Quick Actions Panel */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <button 
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 bg-white border border-purple-200 text-purple-700 px-5 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-sm"
            >
              <UserPlus className="w-5 h-5" /> Join Trip
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200"
            >
              <Plus className="w-5 h-5" /> New Trip
            </button>
          </div>
        </div>

        {/* Dynamic Content States */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-center">{error}</div>
        ) : trips.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 p-16 text-center rounded-2xl max-w-xl mx-auto mt-10">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No trips planned yet</h3>
            <p className="text-slate-500 mb-6">Create a brand-new itinerary or ask your travel buddies for their invite code to dive in.</p>
          </div>
        ) : (
          /* Cards Grid Wrapper */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip) => (
              <div 
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <h3 className="text-xl font-bold group-hover:text-purple-700 transition-colors">{trip.name}</h3>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider px-2.5 py-1 bg-slate-100 rounded-md text-slate-600 flex items-center gap-1">
                      <Key className="w-3 h-3" /> {trip.invite_code}
                    </span>
                  </div>
                  
                  <div className="space-y-2.5 text-sm text-slate-500 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" /> {trip.destination}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" /> {trip.start_date} to {trip.end_date}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center text-slate-700 font-bold">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> {parseFloat(trip.total_budget).toLocaleString()}
                  </div>
                  <span className="text-xs font-medium text-purple-600 group-hover:translate-x-1 transition-transform inline-block">
                    Open Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CREATE TRIP MODAL OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-4">Create New Adventure</h2>
            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Trip Name</label>
                <input required type="text" placeholder="e.g. Summer Vacation in Kyoto" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600" value={createData.name} onChange={e => setCreateData({...createData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Destination</label>
                <input required type="text" placeholder="e.g. Kyoto, Japan" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600" value={createData.destination} onChange={e => setCreateData({...createData, destination: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Budget ($)</label>
                <input required type="number" placeholder="e.g. 2000" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600" value={createData.total_budget} onChange={e => setCreateData({...createData, total_budget: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                  <input required type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600" value={createData.start_date} onChange={e => setCreateData({...createData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">End Date</label>
                  <input required type="date" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600" value={createData.end_date} onChange={e => setCreateData({...createData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN TRIP MODAL OVERLAY */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-2">Join a Group Trip</h2>
            <p className="text-slate-500 text-sm mb-4">Paste the unique alphanumeric code shared by the trip organizer.</p>
            <form onSubmit={handleJoinTrip} className="space-y-4">
              <div>
                <input required type="text" placeholder="e.g. ABC123XYZ" className="w-full px-4 py-3 border border-slate-200 rounded-xl uppercase tracking-wider text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-600" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2 justify-end">
                <button type="button" onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-semibold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;