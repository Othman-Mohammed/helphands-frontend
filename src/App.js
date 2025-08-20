import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';

// Components
import NavigationBar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import VolunteerDashboard from './pages/dashboard/VolunteerDashboard';

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" />;
};

// Dashboard Route - Shows different dashboards based on user role
const DashboardRoute = () => {
  const { user, isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <VolunteerDashboard />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationBar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;