import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.REACT_APP_TMDB_API_KEY,
    language: 'en-US'
  },
  timeout: 10000
});

api.interceptors.request.use(
  config => {
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

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (!error.response && error.request) {
      console.log('Network error. Retrying...');
    }
    
    return Promise.reject(error);
  }
);

export const searchMovies = (query, page = 1) => {
  return api.get('/search/movie', {
    params: {
      query,
      page,
      include_adult: false
    }
  });
};

export const getTrending = (page = 1) => {
  return api.get('/trending/movie/week', {
    params: {
      page
    }
  });
};

export const getMovieDetails = (movieId) => {
  return api.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'videos'
    }
  });
};

export const getMovieCredits = (movieId) => {
  return api.get(`/movie/${movieId}/credits`);
};

export const getMovieVideos = (movieId) => {
  return api.get(`/movie/${movieId}/videos`);
};

export const getMoviesByGenre = (genreId, page = 1) => {
  return api.get('/discover/movie', {
    params: {
      with_genres: genreId,
      page,
      sort_by: 'popularity.desc'
    }
  });
};

export const getGenres = () => {
  return api.get('/genre/movie/list');
};

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