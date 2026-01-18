import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import Assessment from './pages/Assessment';
import Recommendations from './pages/Recommendations';
import SetupProfile from './pages/SetupProfile';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route element={<MainLayout />}>
        {/* Protected Routes (MainLayout contains Navbar) */}
        <Route path="setup-profile" element={<SetupProfile />} />
        {/* Redirect /dashboard to Dashboard if accessed directly via layout parent ?? No, path="dashboard" is child. */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="goals" element={<Goals />} />
        <Route path="assessment" element={<Assessment />} />
        <Route path="recommendations" element={<Recommendations />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
