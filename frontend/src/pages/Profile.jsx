import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Calendar, Plus, Compass, Sparkles, LogOut, 
  Settings, CheckCircle, AlertCircle, Loader2, DollarSign, 
  MapPin, X, ArrowRight, Shield
} from 'lucide-react';
import api from '../services/api';

function Profile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('trips'); // 'trips' or 'settings'
    
    // Profile states
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileUpdating, setProfileUpdating] = useState(false);
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '' });
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Trips states
    const [trips, setTrips] = useState([]);
    const [tripsLoading, setTripsLoading] = useState(true);
    
    // Join & Create Modals
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);
    const [joinError, setJoinError] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createForm, setCreateForm] = useState({
        name: '',
        origin: '',
        destination: '',
        start_date: '',
        end_date: '',
        total_budget: ''
    });

    useEffect(() => {
        fetchProfile();
        fetchTrips();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile/');
            setProfile(response.data);
            setEditForm({
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                email: response.data.email || ''
            });
            setProfileLoading(false);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setProfileLoading(false);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips/');
            setTrips(response.data);
            setTripsLoading(false);
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            setTripsLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileUpdating(true);
        setProfileSuccess('');
        setProfileError('');
        try {
            const response = await api.put('/profile/', editForm);
            setProfile(response.data);
            setProfileSuccess('Profile updated successfully!');
            setTimeout(() => setProfileSuccess(''), 4000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            const errData = error.response?.data;
            if (errData && typeof errData === 'object') {
                const messages = Object.entries(errData)
                    .map(([field, msgs]) => {
                        const cleanField = field.charAt(0).toUpperCase() + field.slice(1);
                        const cleanMsgs = Array.isArray(msgs) ? msgs.join(' ') : msgs;
                        return `${cleanField}: ${cleanMsgs}`;
                    })
                    .join(' | ');
                setProfileError(messages || 'Failed to update profile.');
            } else {
                setProfileError('Failed to update profile. Please try again.');
            }
        } finally {
            setProfileUpdating(false);
        }
    };

    const handleJoinTrip = async (e) => {
        e.preventDefault();
        setJoinLoading(true);
        setJoinError('');
        try {
            await api.post('/trips/join/', { invite_code: joinCode });
            setIsJoinOpen(false);
            setJoinCode('');
            fetchTrips();
        } catch (error) {
            console.error("Failed to join trip:", error);
            setJoinError(error.response?.data?.error || 'Invalid invite code or already joined.');
        } finally {
            setJoinLoading(false);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            await api.post('/trips/', createForm);
            setIsCreateOpen(false);
            setCreateForm({
                name: '',
                origin: '',
                destination: '',
                start_date: '',
                end_date: '',
                total_budget: ''
            });
            fetchTrips();
        } catch (error) {
            console.error("Failed to create trip:", error);
            const errData = error.response?.data;
            if (errData && typeof errData === 'object') {
                const messages = Object.entries(errData)
                    .map(([field, msgs]) => {
                        const cleanField = field.charAt(0).toUpperCase() + field.slice(1);
                        const cleanMsgs = Array.isArray(msgs) ? msgs.join(' ') : msgs;
                        return `${cleanField}: ${cleanMsgs}`;
                    })
                    .join(' | ');
                setCreateError(messages);
            } else {
                setCreateError('Failed to create trip. Please check your inputs.');
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getInitials = () => {
        if (!profile) return 'U';
        if (profile.first_name || profile.last_name) {
            return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
        }
        return profile.username.substring(0, 2).toUpperCase();
    };

    const totalBudget = trips.reduce((acc, curr) => acc + parseFloat(curr.budget || curr.total_budget || 0), 0);

    if (profileLoading || tripsLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-16">
            {/* Gradient Header Banner */}
            <div className="h-64 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-800 relative shadow-inner">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent"></div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg border-4 border-white ring-4 ring-purple-100">
                                {getInitials()}
                            </div>
                            
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                    {profile.first_name || profile.last_name 
                                        ? `${profile.first_name} ${profile.last_name}` 
                                        : profile.username}
                                    <Sparkles className="w-5 h-5 text-purple-600 fill-purple-100" />
                                </h1>
                                <p className="text-slate-500 flex items-center justify-center md:justify-start gap-1 mt-1 font-medium">
                                    <Mail className="w-4 h-4" /> {profile.email || 'No email set'}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-purple-100">
                                        <Shield className="w-3.5 h-3.5" /> ID: {profile.id}
                                    </span>
                                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-indigo-100">
                                        @{profile.username}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-slate-100 pt-6 md:pt-0">
                            <div className="bg-slate-50 rounded-2xl p-4 text-center min-w-[110px] border border-slate-100">
                                <span className="block text-2xl font-black text-purple-600">{trips.length}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Trips</span>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 text-center min-w-[130px] border border-slate-100">
                                <span className="block text-2xl font-black text-indigo-600">${totalBudget.toLocaleString()}</span>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Budget Spent</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 mb-8 gap-6">
                    <button
                        onClick={() => setActiveTab('trips')}
                        className={`pb-4 text-lg font-bold transition-all border-b-2 flex items-center gap-2 ${
                            activeTab === 'trips'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Compass className="w-5 h-5" />
                        My Trips
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-lg font-bold transition-all border-b-2 flex items-center gap-2 ${
                            activeTab === 'settings'
                                ? 'border-purple-600 text-purple-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        Profile Settings
                    </button>
                </div>

                {/* Tabs Content */}
                {activeTab === 'trips' ? (
                    <div>
                        {/* Trips Header Section */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Your Adventures</h2>
                                <p className="text-slate-500 mt-1">Manage and view your upcoming and past trips.</p>
                            </div>
                            
                            {/* Create & Join Buttons */}
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button 
                                    onClick={() => setIsJoinOpen(true)}
                                    className="flex-1 sm:flex-none bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 font-semibold py-2.5 px-6 rounded-xl shadow-sm transition-all"
                                >
                                    Join a Trip
                                </button>
                                <button 
                                    onClick={() => setIsCreateOpen(true)}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all"
                                >
                                    + New Trip
                                </button>
                            </div>
                        </div>

                        {/* Trips Grid */}
                        {trips.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {trips.map((trip) => (
                                    <Link 
                                        to={`/trips/${trip.id}`} 
                                        key={trip.id}
                                        className="block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all transform hover:-translate-y-1"
                                    >
                                        <div className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 relative p-6 flex flex-col justify-end">
                                            <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm truncate">
                                                {trip.destination}
                                            </h3>
                                            <div className="flex gap-2">
                                                <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm font-semibold">
                                                    {new Date(trip.start_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                                                <span className="font-semibold text-slate-600">Budget: ${parseFloat(trip.budget || trip.total_budget || 0).toLocaleString()}</span>
                                                <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-purple-200">
                                                    Code: {trip.invite_code}
                                                </span>
                                            </div>
                                            <div className="text-purple-600 font-bold text-sm hover:text-purple-800 flex items-center gap-1 transition-colors">
                                                View Trip Details <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
                                <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                                    <span className="text-4xl">✈️</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No trips yet!</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                    You haven't joined or created any trips yet. Start planning your next adventure.
                                </p>
                                <button 
                                    onClick={() => setIsCreateOpen(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md"
                                >
                                    Create Your First Trip
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Settings Tab Content */
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Profile edit card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 md:col-span-2">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-600" />
                                Personal Information
                            </h3>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                {profileSuccess && (
                                    <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl border border-emerald-100 flex items-center gap-2 font-medium">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                        {profileSuccess}
                                    </div>
                                )}
                                {profileError && (
                                    <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-xl border border-rose-100 flex items-center gap-2 font-medium">
                                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                                        {profileError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-slate-800 font-medium"
                                            placeholder="Your first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                            className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-slate-800 font-medium"
                                            placeholder="Your last name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-slate-800 font-medium"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Username (Read-Only)</label>
                                    <input
                                        type="text"
                                        value={profile.username}
                                        disabled
                                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed font-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={profileUpdating}
                                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                                >
                                    {profileUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                </button>
                            </form>
                        </div>

                        {/* Account Actions sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Account Control</h3>
                                <p className="text-sm text-slate-500 mb-6">Manage your session or log out of TripNest.</p>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 hover:border-rose-100 transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ================= MODAL: JOIN TRIP ================= */}
            {isJoinOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-250">
                        <button 
                            onClick={() => { setIsJoinOpen(false); setJoinError(''); setJoinCode(''); }}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Compass className="w-5 h-5 text-purple-600" />
                            Join a Trip
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">Enter the invite code shared by your friend to join their adventure.</p>

                        <form onSubmit={handleJoinTrip} className="space-y-4">
                            {joinError && (
                                <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-100 font-medium">
                                    {joinError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Invite Code</label>
                                <input
                                    type="text"
                                    required
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="e.g. TN12345"
                                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all uppercase font-mono font-bold tracking-widest text-center text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={joinLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75"
                            >
                                {joinLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Adventure'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL: CREATE TRIP ================= */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 md:p-8 relative animate-in fade-in zoom-in-95 duration-250">
                        <button 
                            onClick={() => { setIsCreateOpen(false); setCreateError(''); }}
                            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-purple-600" />
                            Create a New Trip
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">Plan a new itinerary and track expenses together with your group.</p>

                        <form onSubmit={handleCreateTrip} className="space-y-4">
                            {createError && (
                                <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-100 font-medium">
                                    {createError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Trip Name</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder="e.g. Europe Backpacking 2026"
                                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Origin</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={createForm.origin}
                                            onChange={(e) => setCreateForm({ ...createForm, origin: e.target.value })}
                                            placeholder="e.g. New York"
                                            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium text-slate-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Destination</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={createForm.destination}
                                            onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
                                            placeholder="e.g. Paris"
                                            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium text-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.start_date}
                                        onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium text-slate-800"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.end_date}
                                        onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                                        className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Total Budget ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={createForm.total_budget}
                                        onChange={(e) => setCreateForm({ ...createForm, total_budget: e.target.value })}
                                        placeholder="e.g. 2500"
                                        className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createLoading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 mt-2"
                            >
                                {createLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Itinerary'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
