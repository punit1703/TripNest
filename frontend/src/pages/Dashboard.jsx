import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api'; // Your Axios interceptor

function Dashboard() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get('/trips/');
            setTrips(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            setLoading(false);
            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage all your upcoming adventures.</p>
                    </div>
                    
                    {/* Create & Join Buttons */}
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={() => {/* TODO: Open Join Modal */}}
                            className="flex-1 sm:flex-none bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 font-semibold py-2 px-6 rounded-xl shadow-sm transition-colors"
                        >
                            Join a Trip
                        </button>
                        <button 
                            onClick={() => {/* TODO: Open Create Modal */}}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-colors"
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
                                className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all transform hover:-translate-y-1"
                            >
                                <div className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 relative p-6 flex flex-col justify-end">
                                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
                                        {trip.destination}
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                                            {new Date(trip.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                        <span className="font-medium">Budget: ${trip.budget}</span>
                                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                                            Code: {trip.invite_code}
                                        </span>
                                    </div>
                                    <div className="text-indigo-600 font-semibold text-sm hover:text-indigo-800 flex items-center gap-1">
                                        View Details &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">✈️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet!</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            You haven't joined or created any trips yet. Start planning your next adventure now.
                        </p>
                        <button 
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                            Create Your First Trip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;