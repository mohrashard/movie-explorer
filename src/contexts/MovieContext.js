import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTrending, searchMovies, getMoviesByGenre, discoverMovies } from '../services/api';
import {
  saveFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
  saveLastSearch,
  getLastSearch,
  clearLastSearch,
  saveFilters,
  getFilters
} from '../utils/localStorage'; // We'll update this util later

// Create Movie Context
const MovieContext = createContext();

// Custom hook to use the Movie context
export const useMovie = () => useContext(MovieContext);

// Cache for storing movie results
const searchCache = new Map();
const trendingCache = new Map();
const filterCache = new Map();

export const MovieProvider = ({ children }) => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearch, setLastSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Load favorites and filters from localStorage on mount
  useEffect(() => {
    // Get favorites from localStorage via the utility
    setFavorites(getFavorites());
    
    // Get saved filters from localStorage
    const savedFilters = getFilters();
    if (savedFilters) {
      setActiveFilters(savedFilters);
      
      // If we have active filters, set isFiltering to true
      const isAnyFilterActive = 
        savedFilters.genre !== "" || 
        savedFilters.yearFrom !== 2000 || 
        savedFilters.yearTo !== new Date().getFullYear() || 
        savedFilters.rating[0] !== 0 || 
        savedFilters.rating[1] !== 10;
        
      setIsFiltering(isAnyFilterActive);
      
      // If filters are active, we'll apply them once data is loaded
    }

    // Get last search and load results if needed
    const savedLastSearch = getLastSearch();
    if (savedLastSearch) {
      setLastSearch(savedLastSearch);
      // We'll handle loading search results with filters below
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to load initial data with filters if needed
  useEffect(() => {
    const loadInitialData = async () => {
      if (lastSearch) {
        // If there's a last search, apply it with any filters
        await applyFiltersToSearch(lastSearch, activeFilters);
      } else if (isFiltering && activeFilters) {
        // If we're filtering without a search, apply filters to discover
        await applyFilters(activeFilters);
      } else {
        // Otherwise, just load trending
        await fetchTrending(1);
      }
    };

    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch trending movies with caching
  const fetchTrending = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first for this page
      const cacheKey = `trending_page_${page}`;
      if (trendingCache.has(cacheKey)) {
        const cachedData = trendingCache.get(cacheKey);
        
        if (page === 1) {
          setTrendingMovies(cachedData.results);
        } else {
          setTrendingMovies(prev => [...prev, ...cachedData.results]);
        }
        
        setLoading(false);
        return cachedData;
      }
      
      const response = await getTrending(page);
      
      // Cache the response
      trendingCache.set(cacheKey, response.data);
      
      if (page === 1) {
        setTrendingMovies(response.data.results);
      } else {
        setTrendingMovies(prev => [...prev, ...response.data.results]);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Failed to fetch trending movies. Please try again.');
      setLoading(false);
      console.error(err);
      return null;
    }
  }, []);

  // Search for movies with caching
  const searchForMovies = useCallback(async (query, page = 1) => {
    if (!query?.trim()) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      // Store the last search in localStorage via the utility
      saveLastSearch(query);
      setLastSearch(query);
      
      // Check cache first for this search and page
      const cacheKey = `${query.toLowerCase()}_page_${page}`;
      if (searchCache.has(cacheKey)) {
        const cachedData = searchCache.get(cacheKey);
        
        if (page === 1) {
          setSearchResults(cachedData.results);
          
          // If we have active filters, apply them to the search results
          if (isFiltering && activeFilters) {
            const filtered = filterMoviesByUserCriteria(cachedData.results, activeFilters);
            setFilteredMovies(filtered);
          } else {
            setFilteredMovies([]);
          }
        } else {
          setSearchResults(prev => [...prev, ...cachedData.results]);
          
          // If filtering, also update filtered results
          if (isFiltering && activeFilters) {
            const filtered = filterMoviesByUserCriteria(cachedData.results, activeFilters);
            setFilteredMovies(prev => [...prev, ...filtered]);
          }
        }
        
        setLoading(false);
        return cachedData;
      }
      
      const response = await searchMovies(query, page);
      
      // Cache the response
      searchCache.set(cacheKey, response.data);
      
      if (page === 1) {
        setSearchResults(response.data.results);
        
        // If we have active filters, apply them to the search results
        if (isFiltering && activeFilters) {
          const filtered = filterMoviesByUserCriteria(response.data.results, activeFilters);
          setFilteredMovies(filtered);
        } else {
          setFilteredMovies([]);
        }
      } else {
        setSearchResults(prev => [...prev, ...response.data.results]);
        
        // If filtering, also update filtered results
        if (isFiltering && activeFilters) {
          const filtered = filterMoviesByUserCriteria(response.data.results, activeFilters);
          setFilteredMovies(prev => [...prev, ...filtered]);
        }
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      setLoading(false);
      console.error(err);
      return null;
    }
  }, [isFiltering, activeFilters]);

  // Helper function to filter movies by year and rating
  const filterMoviesByUserCriteria = useCallback((movies, filters) => {
    return movies.filter(movie => {
      // Filter by year
      const releaseYear = movie.release_date 
        ? new Date(movie.release_date).getFullYear() 
        : null;
      
      const yearMatch = releaseYear 
        ? releaseYear >= filters.yearFrom && releaseYear <= filters.yearTo 
        : true; // If no release date, don't filter by year
      
      // Filter by rating
      const ratingMatch = movie.vote_average >= filters.rating[0] && 
                          movie.vote_average <= filters.rating[1];
      
      return yearMatch && ratingMatch;
    });
  }, []);

  // Apply filters to search results
  const applyFiltersToSearch = useCallback(async (query, filters, page = 1) => {
    if (!query?.trim()) return null;
    
    try {
      setLoading(true);
      
      // If genre filter is applied, we need a different approach
      if (filters?.genre) {
        // For genre + search, we need to use discover API with search parameter
        const response = await discoverMovies({
          with_genres: filters.genre,
          page,
          'primary_release_date.gte': `${filters.yearFrom}-01-01`,
          'primary_release_date.lte': `${filters.yearTo}-12-31`,
          'vote_average.gte': filters.rating[0],
          'vote_average.lte': filters.rating[1],
          with_text_query: query // This adds search functionality
        });
        
        if (page === 1) {
          setFilteredMovies(response.data.results);
        } else {
          setFilteredMovies(prev => [...prev, ...response.data.results]);
        }
        
        setLoading(false);
        return response.data;
      } else {
        // Otherwise, get search results first then filter locally
        const searchResponse = await searchMovies(query, page);
        const filteredResults = filterMoviesByUserCriteria(searchResponse.data.results, filters);
        
        if (page === 1) {
          setSearchResults(searchResponse.data.results);
          setFilteredMovies(filteredResults);
        } else {
          setSearchResults(prev => [...prev, ...searchResponse.data.results]);
          setFilteredMovies(prev => [...prev, ...filteredResults]);
        }
        
        setLoading(false);
        return {
          ...searchResponse.data,
          filtered_results: filteredResults
        };
      }
    } catch (err) {
      setError('Failed to apply filters to search. Please try again.');
      setLoading(false);
      console.error(err);
      return null;
    }
  }, [filterMoviesByUserCriteria]);

  // Apply filters to discover movies (when no search is active)
  const applyFilters = useCallback(async (filters, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Save filters to localStorage
      saveFilters(filters);
      setActiveFilters(filters);
      
      // Check if filters should be active
      const isAnyFilterActive = 
        filters.genre !== "" || 
        filters.yearFrom !== 2000 || 
        filters.yearTo !== new Date().getFullYear() || 
        filters.rating[0] !== 0 || 
        filters.rating[1] !== 10;
      
      setIsFiltering(isAnyFilterActive);
      
      if (!isAnyFilterActive) {
        // If no filters are active, reset to trending
        if (lastSearch) {
          return searchForMovies(lastSearch, page);
        } else {
          return fetchTrending(page);
        }
      }
      
      // Generate cache key based on all filters
      const cacheKey = `filter_${filters.genre}_${filters.yearFrom}_${filters.yearTo}_${filters.rating[0]}_${filters.rating[1]}_page_${page}`;
      
      // Check cache first
      if (filterCache.has(cacheKey)) {
        const cachedData = filterCache.get(cacheKey);
        
        if (page === 1) {
          setFilteredMovies(cachedData.results);
        } else {
          setFilteredMovies(prev => [...prev, ...cachedData.results]);
        }
        
        setLoading(false);
        return cachedData;
      }
      
      // If we have an active search, apply filters to it
      if (lastSearch) {
        return applyFiltersToSearch(lastSearch, filters, page);
      }
      
      // Otherwise, use discover API with all filters
      const response = await discoverMovies({
        with_genres: filters.genre || undefined,
        page,
        'primary_release_date.gte': `${filters.yearFrom}-01-01`,
        'primary_release_date.lte': `${filters.yearTo}-12-31`,
        'vote_average.gte': filters.rating[0],
        'vote_average.lte': filters.rating[1],
      });
      
      // Cache the response
      filterCache.set(cacheKey, response.data);
      
      if (page === 1) {
        setFilteredMovies(response.data.results);
      } else {
        setFilteredMovies(prev => [...prev, ...response.data.results]);
      }
      
      setLoading(false);
      return response.data;
    } catch (err) {
      setError('Failed to filter movies. Please try again.');
      setLoading(false);
      console.error(err);
      return null;
    }
  }, [fetchTrending, lastSearch, applyFiltersToSearch, searchForMovies]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const defaultFilters = {
      genre: "",
      yearFrom: 2000,
      yearTo: new Date().getFullYear(),
      rating: [0, 10]
    };
    
    saveFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setIsFiltering(false);
    setFilteredMovies([]);
    
    // Return to search results or trending
    if (lastSearch) {
      searchForMovies(lastSearch, 1);
    } else {
      fetchTrending(1);
    }
  }, [fetchTrending, lastSearch, searchForMovies]);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setLastSearch('');
    clearLastSearch();
    
    // If we have active filters, apply them without search
    if (isFiltering && activeFilters) {
      applyFilters(activeFilters, 1);
    } else {
      fetchTrending(1);
    }
  }, [fetchTrending, isFiltering, activeFilters, applyFilters]);

  // Add movie to favorites
  const addToFavorites = useCallback((movie) => {
    // Use the storage utility to save to localStorage
    if (saveFavorite(movie)) {
      // If successfully saved, update the state
      setFavorites(getFavorites());
    }
  }, []);

  // Remove movie from favorites
  const removeFromFavorites = useCallback((movieId) => {
    // Use the storage utility to remove from localStorage
    if (removeFavorite(movieId)) {
      // If successfully removed, update the state
      setFavorites(getFavorites());
    }
  }, []);

  // Check if a movie is in favorites
  const checkIsFavorite = useCallback((movieId) => {
    return isFavorite(movieId);
  }, []);

  // Determine which movies to display
  const getMoviesToDisplay = useCallback(() => {
    if (isFiltering) {
      return filteredMovies;
    } else if (searchResults.length > 0) {
      return searchResults;
    } else {
      return trendingMovies;
    }
  }, [isFiltering, filteredMovies, searchResults, trendingMovies]);

  // Get display title based on current view
  const getDisplayTitle = useCallback(() => {
    if (isFiltering) {
      if (lastSearch) {
        return `Filtered Results for "${lastSearch}"`;
      }
      return 'Filtered Movies';
    } else if (searchResults.length > 0) {
      return `Search Results for "${lastSearch}"`;
    } else {
      return 'Trending Movies';
    }
  }, [isFiltering, lastSearch, searchResults.length]);

  // Context value
  const value = {
    trendingMovies,
    searchResults,
    filteredMovies,
    loading,
    error,
    lastSearch,
    favorites,
    activeFilters,
    isFiltering,
    fetchTrending,
    searchForMovies,
    clearSearchResults,
    addToFavorites,
    removeFromFavorites,
    checkIsFavorite,
    applyFilters,
    clearFilters,
    getMoviesToDisplay,
    getDisplayTitle
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

export default MovieContext;