import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Tooltip,
  Box,
  Chip,
  Paper,
  Fade,
  useTheme,
  Rating,
  Divider,
  ButtonBase
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useMovie } from '../contexts/MovieContext';
import { Link } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'; // Import custom theme hook

const MovieCard = ({ movie, onRemove }) => {
  const { addToFavorites, removeFromFavorites, checkIsFavorite } = useMovie();
  const theme = useTheme();
  const { mode } = useCustomTheme(); // Access the theme mode (light or dark)
  
  const isFavorite = checkIsFavorite(movie.id);
  
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-poster.jpg';
    
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      if (onRemove) {
        onRemove();
      } else {
        removeFromFavorites(movie.id);
      }
    } else {
      addToFavorites(movie);
    }
  };

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average / 2 : 0;

  return (
    <Card 
      elevation={3}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[10],
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <ButtonBase
          component={Link}
          to={`/movie/${movie.id}`}
          sx={{ 
            display: 'block', 
            width: '100%',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '30%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
              zIndex: 1
            }
          }}
        >
          <CardMedia
            component="img"
            height="350"
            image={posterUrl}
            alt={movie.title}
            sx={{ 
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </ButtonBase>

        {/* Favorite Button Overlay */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            zIndex: 2,
            boxShadow: 2
          }}
          size="small"
          onClick={handleFavoriteToggle}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? 
            <FavoriteIcon 
              sx={{ 
                color: mode === 'light' ? '#f44336' : '#e57373' 
              }} 
            /> : 
            <FavoriteBorderIcon 
              sx={{ 
                color: mode === 'light' ? 'dark blue' : '#0a192f' 
              }} 
            />
          }
        </IconButton>

        {/* Year tag */}
        <Chip
          icon={<CalendarTodayIcon />}
          label={releaseYear}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 2
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Typography 
          gutterBottom 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            lineHeight: 1.2,
            height: '2.4em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {movie.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Rating
            value={rating}
            precision={0.5}
            readOnly
            size="small"
            emptyIcon={<StarBorderIcon fontSize="inherit" />}
            icon={<StarIcon fontSize="inherit" />}
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: 0.5, fontWeight: 'medium' }}
          >
            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 1.5 }} />
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            mb: 1,
            height: '4.5em'
          }}
        >
          {movie.overview || 'No description available.'}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <ButtonBase
          component={Link}
          to={`/movie/${movie.id}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            borderRadius: 1,
            py: 1,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            }
          }}
        >
          <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="button">
            View Details
          </Typography>
        </ButtonBase>
      </CardActions>
    </Card>
  );
};

export default MovieCard;