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
} from '../utils/localStorage';


const MovieContext = createContext();


export const useMovie = () => useContext(MovieContext);


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


  useEffect(() => {
  
    setFavorites(getFavorites());
    

    const savedFilters = getFilters();
    if (savedFilters) {
      setActiveFilters(savedFilters);
      
      
      const isAnyFilterActive = 
        savedFilters.genre !== "" || 
        savedFilters.yearFrom !== 2000 || 
        savedFilters.yearTo !== new Date().getFullYear() || 
        savedFilters.rating[0] !== 0 || 
        savedFilters.rating[1] !== 10;
        
      setIsFiltering(isAnyFilterActive);
      
    }

    const savedLastSearch = getLastSearch();
    if (savedLastSearch) {
      setLastSearch(savedLastSearch);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      if (lastSearch) {
        await applyFiltersToSearch(lastSearch, activeFilters);
      } else if (isFiltering && activeFilters) {
        await applyFilters(activeFilters);
      } else {
        await fetchTrending(1);
      }
    };

    loadInitialData();
  }, []);

  const fetchTrending = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
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

  const searchForMovies = useCallback(async (query, page = 1) => {
    if (!query?.trim()) return null;
    
    try {
      setLoading(true);
      setError(null);
      
      saveLastSearch(query);
      setLastSearch(query);
      
      const cacheKey = `${query.toLowerCase()}_page_${page}`;
      if (searchCache.has(cacheKey)) {
        const cachedData = searchCache.get(cacheKey);
        
        if (page === 1) {
          setSearchResults(cachedData.results);
          
          if (isFiltering && activeFilters) {
            const filtered = filterMoviesByUserCriteria(cachedData.results, activeFilters);
            setFilteredMovies(filtered);
          } else {
            setFilteredMovies([]);
          }
        } else {
          setSearchResults(prev => [...prev, ...cachedData.results]);
          
          if (isFiltering && activeFilters) {
            const filtered = filterMoviesByUserCriteria(cachedData.results, activeFilters);
            setFilteredMovies(prev => [...prev, ...filtered]);
          }
        }
        
        setLoading(false);
        return cachedData;
      }
      
      const response = await searchMovies(query, page);
      
      searchCache.set(cacheKey, response.data);
      
      if (page === 1) {
        setSearchResults(response.data.results);
        
        if (isFiltering && activeFilters) {
          const filtered = filterMoviesByUserCriteria(response.data.results, activeFilters);
          setFilteredMovies(filtered);
        } else {
          setFilteredMovies([]);
        }
      } else {
        setSearchResults(prev => [...prev, ...response.data.results]);
        
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

  const filterMoviesByUserCriteria = useCallback((movies, filters) => {
    return movies.filter(movie => {
      const releaseYear = movie.release_date 
        ? new Date(movie.release_date).getFullYear() 
        : null;
      
      const yearMatch = releaseYear 
        ? releaseYear >= filters.yearFrom && releaseYear <= filters.yearTo 
        : true;
      
      const ratingMatch = movie.vote_average >= filters.rating[0] && 
                          movie.vote_average <= filters.rating[1];
      
      return yearMatch && ratingMatch;
    });
  }, []);

  const applyFiltersToSearch = useCallback(async (query, filters, page = 1) => {
    if (!query?.trim()) return null;
    
    try {
      setLoading(true);
      
      if (filters?.genre) {
        const response = await discoverMovies({
          with_genres: filters.genre,
          page,
          'primary_release_date.gte': `${filters.yearFrom}-01-01`,
          'primary_release_date.lte': `${filters.yearTo}-12-31`,
          'vote_average.gte': filters.rating[0],
          'vote_average.lte': filters.rating[1],
          with_text_query: query
        });
        
        if (page === 1) {
          setFilteredMovies(response.data.results);
        } else {
          setFilteredMovies(prev => [...prev, ...response.data.results]);
        }
        
        setLoading(false);
        return response.data;
      } else {
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

  const applyFilters = useCallback(async (filters, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      saveFilters(filters);
      setActiveFilters(filters);
      
      const isAnyFilterActive = 
        filters.genre !== "" || 
        filters.yearFrom !== 2000 || 
        filters.yearTo !== new Date().getFullYear() || 
        filters.rating[0] !== 0 || 
        filters.rating[1] !== 10;
      
      setIsFiltering(isAnyFilterActive);
      
      if (!isAnyFilterActive) {
        if (lastSearch) {
          return searchForMovies(lastSearch, page);
        } else {
          return fetchTrending(page);
        }
      }
      
      const cacheKey = `filter_${filters.genre}_${filters.yearFrom}_${filters.yearTo}_${filters.rating[0]}_${filters.rating[1]}_page_${page}`;
      
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
      
      if (lastSearch) {
        return applyFiltersToSearch(lastSearch, filters, page);
      }
      
      const response = await discoverMovies({
        with_genres: filters.genre || undefined,
        page,
        'primary_release_date.gte': `${filters.yearFrom}-01-01`,
        'primary_release_date.lte': `${filters.yearTo}-12-31`,
        'vote_average.gte': filters.rating[0],
        'vote_average.lte': filters.rating[1],
      });
      
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
    
    if (lastSearch) {
      searchForMovies(lastSearch, 1);
    } else {
      fetchTrending(1);
    }
  }, [fetchTrending, lastSearch, searchForMovies]);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setLastSearch('');
    clearLastSearch();
    
    if (isFiltering && activeFilters) {
      applyFilters(activeFilters, 1);
    } else {
      fetchTrending(1);
    }
  }, [fetchTrending, isFiltering, activeFilters, applyFilters]);

  const addToFavorites = useCallback((movie) => {
    if (saveFavorite(movie)) {
      setFavorites(getFavorites());
    }
  }, []);

  const removeFromFavorites = useCallback((movieId) => {
    if (removeFavorite(movieId)) {
      setFavorites(getFavorites());
    }
  }, []);


  const checkIsFavorite = useCallback((movieId) => {
    return isFavorite(movieId);
  }, []);

  
  const getMoviesToDisplay = useCallback(() => {
    if (isFiltering) {
      return filteredMovies;
    } else if (searchResults.length > 0) {
      return searchResults;
    } else {
      return trendingMovies;
    }
  }, [isFiltering, filteredMovies, searchResults, trendingMovies]);

 
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