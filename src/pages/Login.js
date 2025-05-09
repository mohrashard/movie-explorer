import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Link, 
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screens

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={isMobile ? 'xs' : 'sm'}> {/* Adjust maxWidth for mobile */}
      <Box sx={{ 
        mt: isMobile ? 4 : 8, // Reduce top margin on mobile
        mb: isMobile ? 2 : 4, // Reduce bottom margin on mobile
        display: 'flex',
        justifyContent: 'center',
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: isMobile ? 2 : 4, // Reduce padding on mobile
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2, // Slightly rounded corners for better aesthetics
            width: '100%',
          }}
        >
          <Typography 
            component="h1" 
            variant={isMobile ? 'h6' : 'h5'} // Smaller heading on mobile
            sx={{ 
              mb: isMobile ? 2 : 3, // Adjust margin below heading
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Sign In to Movie Explorer
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                fontSize: isMobile ? '0.85rem' : '0.875rem', // Smaller font on mobile
              }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size={isMobile ? 'small' : 'medium'} // Smaller input fields on mobile
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem', // Adjust font size
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem', // Adjust label font size
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.9rem' : '1rem',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: isMobile ? 2 : 3, // Adjust margin-top
                mb: isMobile ? 1 : 2, // Adjust margin-bottom
                py: isMobile ? 1 : 1.5, // Smaller button height on mobile
                fontSize: isMobile ? '0.9rem' : '1rem', // Smaller font on mobile
                borderRadius: 1,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={isMobile ? 20 : 24} /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{
                  fontSize: isMobile ? '0.85rem' : '0.875rem', // Smaller font on mobile
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;