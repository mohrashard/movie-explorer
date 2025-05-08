import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.REACT_APP_TMDB_API_KEY,
    language: 'en-US'
  },
  timeout: 10000 // Set timeout to 10 seconds
});

// Configure request interceptor for error handling
api.interceptors.request.use(
  config => {
    // If API key is not in environment variables, try to get it from localStorage
    if (!config.params.api_key) {
      const apiKey = process.env.REACT_APP_TMDB_API_KEY || localStorage.getItem('tmdb_api_key');
      if (apiKey) {
        config.params.api_key = apiKey;
      } else {
        console.error('API key not found. Please set REACT_APP_TMDB_API_KEY environment variable');
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for common error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle common errors
    console.error('API Error:', error.response?.data || error.message);
    
    // Retry logic for network errors (could be expanded)
    if (!error.response && error.request) {
      console.log('Network error. Retrying...');
      // Could implement retry logic here
    }
    
    return Promise.reject(error);
  }
);

// Search movies
export const searchMovies = (query, page = 1) => {
  return api.get('/search/movie', {
    params: {
      query,
      page,
      include_adult: false
    }
  });
};

// Get trending movies
export const getTrending = (page = 1) => {
  return api.get('/trending/movie/week', {
    params: {
      page
    }
  });
};

// Get movie details
export const getMovieDetails = (movieId) => {
  return api.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'videos'
    }
  });
};

// Get movie credits
export const getMovieCredits = (movieId) => {
  return api.get(`/movie/${movieId}/credits`);
};

// Get movie videos
export const getMovieVideos = (movieId) => {
  return api.get(`/movie/${movieId}/videos`);
};

// Get movies by genre
export const getMoviesByGenre = (genreId, page = 1) => {
  return api.get('/discover/movie', {
    params: {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc'
    }
  });
};

// Get movie genres list
export const getGenres = () => {
  return api.get('/genre/movie/list');
};

// Advanced discover - filter by year, rating, etc.
export const discoverMovies = (params = {}) => {
  return api.get('/discover/movie', {
    params: {
      sort_by: 'popularity.desc',
      include_adult: false,
      ...params
    }
  });
};

export default api;