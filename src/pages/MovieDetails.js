import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Chip, 
  Button, 
  IconButton, 
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import { 
  ArrowBack, 
  Favorite, 
  FavoriteBorder, 
  Star,
  PlayArrow
} from '@mui/icons-material';
import { getMovieDetails, getMovieCredits, getMovieVideos } from '../services/api';
import { useMovie } from '../contexts/MovieContext';

const detailsCache = new Map();

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { addToFavorites, removeFromFavorites, checkIsFavorite } = useMovie();
  
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const checkFavoriteStatus = useCallback(() => {
    setIsFavorite(checkIsFavorite(parseInt(id)));
  }, [id, checkIsFavorite]);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        
        const cacheKey = `movie_${id}`;
        if (detailsCache.has(cacheKey)) {
          const cachedData = detailsCache.get(cacheKey);
          setMovie(cachedData.movie);
          setCredits(cachedData.credits);
          setVideos(cachedData.videos);
          checkFavoriteStatus();
          setLoading(false);
          return;
        }
        
        const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
          getMovieDetails(id),
          getMovieCredits(id),
          getMovieVideos(id)
        ]);
        
        const movieData = movieResponse.data;
        const creditsData = creditsResponse.data;
        const videosData = videosResponse.data.results;
        
        detailsCache.set(cacheKey, {
          movie: movieData,
          credits: creditsData,
          videos: videosData
        });
        
        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData);
        checkFavoriteStatus();
      } catch (err) {
        setError('Failed to fetch movie details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovieData();
  }, [id, checkFavoriteStatus]);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date
      });
    }
    setIsFavorite(!isFavorite);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const toggleTrailer = () => {
    setTrailerOpen(!trailerOpen);
  };

  const trailer = videos.find(video => 
    video.site === 'YouTube' && 
    video.type === 'Trailer' && 
    video.official === true
  ) || videos.find(video => 
    video.site === 'YouTube' && 
    video.type === 'Trailer'
  ) || videos.find(video => 
    video.site === 'YouTube' && 
    video.type === 'Teaser'
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />} 
            onClick={handleBack}
            sx={{ 
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>Movie not found.</Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBack />} 
            onClick={handleBack}
            sx={{ 
              mt: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'Unknown';
    
  const backdropPath = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : 'https://via.placeholder.com/1280x720?text=No+Image+Available';

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      pb: 8
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative',
        minHeight: { xs: '50vh', md: '80vh' }, // Changed from height to minHeight
        overflow: 'visible', // Allow content to overflow naturally
      }}>
        <img
          src={backdropPath}
          alt={movie.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
          loading="lazy"
        />
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: `linear-gradient(
            to bottom,
            ${alpha(theme.palette.background.default, 0.2)} 0%,
            ${alpha(theme.palette.background.default, 0.6)} 50%,
            ${theme.palette.background.default} 100%
          )`,
          zIndex: 1
        }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: 2 }}>
          <IconButton 
            onClick={handleBack}
            sx={{ 
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: alpha(theme.palette.background.paper, 0.7),
              },
              mt: 2,
              color: theme.palette.text.primary
            }}
          >
            <ArrowBack />
          </IconButton>
        </Container>
        
        <Container maxWidth="lg" sx={{ 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pb: { xs: 8, md: 10 }, // Increased padding-bottom for longer content
          pt: 4 // Added padding-top to balance spacing
        }}>
          <Grid container spacing={4} alignItems="flex-end">
            <Grid item xs={12}>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 700,
                color: theme.palette.getContrastText(theme.palette.background.default),
                textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
              }}>
                {movie.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                {releaseYear && (
                  <Typography variant="subtitle1" sx={{ 
                    color: theme.palette.text.primary,
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    mr: 2
                  }}>
                    {releaseYear}
                  </Typography>
                )}
                
                {movie.runtime && (
                  <Typography variant="subtitle1" sx={{ 
                    color: theme.palette.text.primary,
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    mr: 2
                  }}>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Star sx={{ color: '#f5c518', mr: 0.5 }} />
                  <Typography variant="subtitle1" sx={{ 
                    color: theme.palette.text.primary,
                    textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                  }}>
                    {movie.vote_average?.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                {trailer && (
                  <Button 
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={toggleTrailer}
                    sx={{
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : '#fff',
                      color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#000',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.main, 0.9) : alpha('#fff', 0.9),
                      },
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      py: 1
                    }}
                  >
                    Play Trailer
                  </Button>
                )}
                
                <IconButton 
                  onClick={handleFavoriteToggle}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    },
                    color: theme.palette.text.primary
                  }}
                >
                  {isFavorite ? 
                    <Favorite sx={{ color: theme.palette.error.main }} /> : 
                    <FavoriteBorder />
                  }
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {movie.genres?.map(genre => (
                  <Chip 
                    key={genre.id} 
                    label={genre.name} 
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(theme.palette.background.paper, 0.6),
                      backdropFilter: 'blur(10px)',
                      color: theme.palette.text.primary,
                      fontWeight: 500
                    }} 
                  />
                ))}
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme.palette.text.primary,
                  textShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(255,255,255,0.1)' : '0 1px 2px rgba(0,0,0,0.4)',
                  maxWidth: { xs: '100%', md: '70%' },
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  whiteSpace: 'pre-wrap', // Ensure text wraps naturally
                }}
              >
                {movie.overview || 'No overview available.'}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {trailer && trailerOpen && (
          <Box sx={{ mb: 6, position: 'relative', zIndex: 1 }}>
            <Paper elevation={6} sx={{ 
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: theme.palette.background.paper,
            }}>
              <Box sx={{ 
                position: 'relative', 
                paddingBottom: { xs: '56.25%', md: '56.25%' }, // Responsive aspect ratio
                height: 0,
                overflow: 'hidden',
              }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={`${movie.title} Trailer`}
                  allowFullScreen
                ></iframe>
              </Box>
            </Paper>
          </Box>
        )}
        
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 700,
            mb: 3,
            color: theme.palette.text.primary
          }}>
            Cast
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: 6,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.text.primary, 0.05),
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.text.primary, 0.2),
              borderRadius: 3,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.primary, 0.3),
              }
            }
          }}>
            {credits?.cast?.slice(0, 12).map(person => (
              <Card 
                key={person.id} 
                sx={{ 
                  minWidth: 140,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  boxShadow: theme.shadows[2],
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <CardMedia
                  component="img"
                  height="210"
                  image={
                    person.profile_path 
                      ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                      : 'https://via.placeholder.com/200x300?text=No+Image'
                  }
                  alt={person.name}
                  sx={{
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}>
                    {person.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
                    {person.character || 'Unknown'}
                  </Typography>
                </Box>
              </Card>
            ))}
            
            {(!credits?.cast || credits.cast.length === 0) && (
              <Alert severity="info" sx={{ borderRadius: 2, width: '100%' }}>
                No cast information available
              </Alert>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MovieDetails;