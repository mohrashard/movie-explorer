import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Paper,
  Divider,
  Fade,
  useTheme,
  useMediaQuery,
  alpha,
  styled
} from '@mui/material';
import { useMovie } from '../contexts/MovieContext';
import MovieCard from '../components/MovieCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';

const GradientText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}));

const Favorites = () => {
  const { favorites, removeFromFavorites } = useMovie();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleRemoveConfirmation = (movieId, movieTitle) => {
    setSelectedMovie({ id: movieId, title: movieTitle });
    setOpenDialog(true);
  };

  const handleRemove = () => {
    if (selectedMovie) {
      removeFromFavorites(selectedMovie.id);
    }
    setOpenDialog(false);
    setSelectedMovie(null);
  };

  const handleClose = () => setOpenDialog(false);

  const handleExploreMovies = () => {
    navigate('/home');
  };


  const normalizedFavorites = favorites.map(movie => ({
    ...movie,
    overview: movie.overview || 'No description available.'
  }));

  const groupMoviesByGenre = () => {
    const allGenres = [
      'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Horror',
      'Romance', 'Thriller', 'Fantasy', 'Mystery',
      'Adventure', 'Crime', 'Animation', 'Family'
    ];
  
    const groupedMovies = {};
  
    normalizedFavorites.forEach(movie => {
    
      const movieGenres = Array.isArray(movie.genres) 
        ? movie.genres.map(g => typeof g === 'object' ? g.name : g).map(g => g.trim())
        : [];
  
      if (movieGenres.length === 0) {
        if (!groupedMovies.General) groupedMovies.General = [];
        groupedMovies.General.push(movie);
        return;
      }
  
      movieGenres.forEach(genre => {
        const normalizedGenre = allGenres.includes(genre) 
          ? genre 
          : 'Other';
  
        if (!groupedMovies[normalizedGenre]) {
          groupedMovies[normalizedGenre] = [];
        }
        
        if (!groupedMovies[normalizedGenre].some(m => m.id === movie.id)) {
          groupedMovies[normalizedGenre].push(movie);
        }
      });
    });
  
    return Object.entries(groupedMovies)
      .sort((a, b) => b[1].length - a[1].length)
      .sort((a, b) => a[0] === 'Other' ? 1 : b[0] === 'Other' ? -1 : 0);
  };

  const groupedFavorites = groupMoviesByGenre();

  // For debugging purposes
  console.log("Normalized favorites:", normalizedFavorites);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: theme.palette.background.default,
      pt: 8,
      pb: 10,
    }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FavoriteIcon sx={{ 
              fontSize: 40,
              mr: 2,
              color: theme.palette.primary.main,
              filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.2))'
            }} />
            <GradientText variant="h3" component="h1">
              My Favorites
            </GradientText>
          </Box>

          <Divider sx={{ 
            borderColor: alpha(theme.palette.text.primary, 0.1),
            mb: 6,
          }} />

          {normalizedFavorites.length === 0 ? (
            <Paper sx={{ 
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: theme.palette.background.paper,
              boxShadow: theme.shadows[4],
            }}>
              <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Your Personal Cinema Awaits
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                  Start building your curated collection of favorite movies. 
                  Your selections will appear here for quick access and enjoyment.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                  onClick={handleExploreMovies} 
                >
                  Explore Movies
                </Button>
              </Box>
            </Paper>
          ) : (
            <Fade in timeout={800}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Your Collection • {normalizedFavorites.length} Titles
                  </Typography>
                </Box>

                {groupedFavorites.map(([genre, movies]) => (
                  <Box key={genre} sx={{ mb: 8 }}>
                    <Typography variant="h5" sx={{ 
                      mb: 3, 
                      pl: 2,
                      position: 'relative',
                      color: 'text.primary',
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        height: '60%',
                        width: '4px',
                        bgcolor: 'primary.main',
                        transform: 'translateY(-50%)',
                        borderRadius: '2px',
                      }
                    }}>
                      {genre}
                    </Typography>
                    
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '160px' : '220px'}, 1fr))`,
                      gap: 3,
                      pb: 2,
                    }}>
                      {movies.map(movie => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onRemove={() => handleRemoveConfirmation(movie.id, movie.title)}
                          sx={{
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: theme.shadows[8],
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Fade>
          )}
        </Box>
      </Container>

      {/* Removal Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleClose}
        PaperProps={{
          sx: {
            background: theme.palette.background.paper,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 600, color: 'text.primary' }}>
          Confirm Removal
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '1.1rem', color: 'text.secondary' }}>
            Remove <strong style={{ color: theme.palette.text.primary }}>"{selectedMovie?.title}"</strong> from your favorites?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button 
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRemove}
            variant="contained"
            color="primary"
            sx={{
              ml: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Favorites;