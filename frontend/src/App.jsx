import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

// Placeholder components for our next phases
const Login = () => <div className="p-10 text-2xl font-bold">Login Page (Coming Soon)</div>;
const Register = () => <div className="p-10 text-2xl font-bold">Register Page (Coming Soon)</div>;
const Dashboard = () => <div className="p-10 text-2xl font-bold">Dashboard (Protected)</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;