import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
//import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Landing from './components/Landing/Landing';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Unauthorized from './components/Auth/Unauthorized';
import OnePiece from './components/EasterEgg/OnePiece';
import DashboardV2 from './components/Dashboard/DashboardV2';
import RecycleBin from './components/Dashboard/RecycleBin';
import SharedFolder from './components/Dashboard/SharedFolder';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard/*" 
              element={
                <PrivateRoute>
                  <DashboardV2 />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute adminOnly={true}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard-v2" 
              element={
                <PrivateRoute>
                  <DashboardV2 />
                </PrivateRoute>
              } 
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/one-piece" element={<OnePiece />} />
            <Route 
              path="/recycle-bin" 
              element={
                <PrivateRoute>
                  <RecycleBin />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard-v2/shared" 
              element={
                <PrivateRoute>
                  <SharedFolder />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard-v2/shared/:folderId" 
              element={
                <PrivateRoute>
                  <DashboardV2 />
                </PrivateRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
