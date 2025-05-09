// Favorites storage functions
export const saveFavorite = (movie) => {
  try {
    const favorites = getFavorites();
    
    // Check if movie already exists in favorites
    if (!favorites.some(fav => fav.id === movie.id)) {
      // Ensure we store all necessary movie properties
      const movieToStore = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        // Ensure overview is never null or undefined
        overview: movie.overview || 'No description available.',
        // Include genres if available (might be needed for grouping in favorites)
        genres: movie.genres || []
      };
      
      favorites.push(movieToStore);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving favorite:', error);
    return false;
  }
};

// Remove a movie from favorites
export const removeFavorite = (movieId) => {
  try {
    const favorites = getFavorites();
    const updatedFavorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

// Get all favorites
export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem('favorites');
    const parsedFavorites = favorites ? JSON.parse(favorites) : [];
    
    // Normalize data - ensure all movies have required properties
    return parsedFavorites.map(movie => ({
      ...movie,
      // Make sure overview is always a string
      overview: movie.overview || 'No description available.',
      // Ensure genres exist
      genres: movie.genres || []
    }));
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

// Check if a movie is in favorites
export const isFavorite = (movieId) => {
  try {
    const favorites = getFavorites();
    return favorites.some(movie => movie.id === movieId);
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Save last search query
export const saveLastSearch = (query) => {
  try {
    localStorage.setItem('lastSearch', query);
    return true;
  } catch (error) {
    console.error('Error saving last search:', error);
    return false;
  }
};

// Get last search query
export const getLastSearch = () => {
  try {
    return localStorage.getItem('lastSearch') || '';
  } catch (error) {
    console.error('Error getting last search:', error);
    return '';
  }
};

// Clear last search query
export const clearLastSearch = () => {
  try {
    localStorage.removeItem('lastSearch');
    return true;
  } catch (error) {
    console.error('Error clearing last search:', error);
    return false;
  }
};

// Filter storage functions
export const saveFilters = (filters) => {
  try {
    localStorage.setItem('movieFilters', JSON.stringify(filters));
    return true;
  } catch (error) {
    console.error('Error saving filters:', error);
    return false;
  }
};

export const getFilters = () => {
  try {
    const filters = localStorage.getItem('movieFilters');
    if (!filters) {
      // Return default filter values if none are saved
      return {
        genre: "",
        yearFrom: 2000,
        yearTo: new Date().getFullYear(),
        rating: [0, 10]
      };
    }
    return JSON.parse(filters);
  } catch (error) {
    console.error('Error getting filters:', error);
    // Return default filter values on error
    return {
      genre: "",
      yearFrom: 2000,
      yearTo: new Date().getFullYear(), 
      rating: [0, 10]
    };
  }
};

export const clearFilters = () => {
  try {
    localStorage.removeItem('movieFilters');
    return true;
  } catch (error) {
    console.error('Error clearing filters:', error);
    return false;
  }
};