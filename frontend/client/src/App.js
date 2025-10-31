import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DataProvider } from './context/DataContext.jsx';

// Import Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import TaxFilingPage from './pages/TaxFilingPage.jsx';
import TaxCalculator from './pages/TaxCalculator.jsx';
import Documents from './pages/Documents.jsx';
import FindCA from './pages/FindCA.jsx';
import HelpGuide from './pages/HelpGuide.jsx';
import CADashboard from './pages/CADashboard.jsx';
import CAReview from './pages/CAReview.jsx';
import CAClients from './pages/CAClients.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// Import Protected Routes
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CAProtectedRoute from './components/CAProtectedRoute.jsx';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* User Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tax-filing" 
              element={
                <ProtectedRoute>
                  <TaxFilingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tax-calculator" 
              element={
                <ProtectedRoute>
                  <TaxCalculator />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-ca" 
              element={
                <ProtectedRoute>
                  <FindCA />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/help-guide" 
              element={
                <ProtectedRoute>
                  <HelpGuide />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />

            {/* CA Protected Routes */}
            <Route 
              path="/ca/dashboard" 
              element={
                <CAProtectedRoute>
                  <CADashboard />
                </CAProtectedRoute>
              } 
            />
            <Route 
              path="/ca/review/:filingId" 
              element={
                <CAProtectedRoute>
                  <CAReview />
                </CAProtectedRoute>
              } 
            />
            <Route 
              path="/ca/clients" 
              element={
                <CAProtectedRoute>
                  <CAClients />
                </CAProtectedRoute>
              } 
            />
            
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </DataProvider>
    </GoogleOAuthProvider>
  );
}

export default App;