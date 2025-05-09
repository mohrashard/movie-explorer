import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { MovieProvider } from './contexts/MovieContext';


import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MovieProvider>
          <Router>
            <Navbar />
            <Routes>
         
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
     
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>
           
              <Route path="/" element={<Navigate to="/home" replace />} />
              
        
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </MovieProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;