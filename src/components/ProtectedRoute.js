import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  
  // If user is not logged in, redirect to login page
  // Otherwise, render the child components (Outlet for nested routes)
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;