import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMovie } from '../contexts/MovieContext';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { getMoviesByGenre } from '../services/api';
import '../styles/home.css';

const Home = () => {
  const { currentUser } = useAuth();
  const { 
    trendingMovies, 
    searchResults, 
    loading, 
    error, 
    fetchTrending,
    searchForMovies,
    lastSearch
  } = useMovie();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  

  const [activeFilters, setActiveFilters] = useState(null);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);


  useEffect(() => {
    const loadInitialData = async () => {
  
      if (!lastSearch) {
        const response = await fetchTrending(1);
        if (response) {
          setHasMore(page < response.total_pages);
        }
      } else {

        const response = await searchForMovies(lastSearch, 1);
        if (response) {
          setHasMore(page < response.total_pages);
        }
      }
      setInitialLoad(false);
    };

    loadInitialData();
  }, [fetchTrending, lastSearch]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    
    let response;
    if (isFiltering && activeFilters?.genre) {

      response = await getMoviesByGenre(activeFilters.genre, nextPage);
      if (response && response.data) {
        const newMovies = filterMoviesByUserCriteria(response.data.results, activeFilters);
        setFilteredMovies(prev => [...prev, ...newMovies]);
        setHasMore(nextPage < response.data.total_pages && newMovies.length > 0);
      }
    } else if (searchResults.length > 0 && lastSearch) {

      response = await searchForMovies(lastSearch, nextPage);
    } else {

      response = await fetchTrending(nextPage);
    }
    
    if (response) {
      setHasMore(nextPage < response.total_pages);
      setPage(nextPage);
    }
  };


  const handleApplyFilters = async (filters) => {
 
    const isAnyFilterActive = 
      filters.genre !== "" || 
      filters.yearFrom !== 2000 || 
      filters.yearTo !== new Date().getFullYear() || 
      filters.rating[0] !== 0 || 
      filters.rating[1] !== 10;

    if (!isAnyFilterActive) {
    
      setIsFiltering(false);
      setActiveFilters(null);
      return;
    }

    setActiveFilters(filters);
    setIsFiltering(true);
    setPage(1); // Reset page when applying new filters

    let moviesToFilter = [];
    
    // If genre filter is applied, we need to fetch movies by genre first
    if (filters.genre) {
      try {
        const response = await getMoviesByGenre(filters.genre, 1);
        if (response && response.data) {
          moviesToFilter = response.data.results;
          // Apply other filters to these results
          const filtered = filterMoviesByUserCriteria(moviesToFilter, filters);
          setFilteredMovies(filtered);
          setHasMore(filtered.length > 0 && response.data.total_pages > 1);
        }
      } catch (error) {
        console.error("Error fetching movies by genre:", error);
      }
    } else {
      // If no genre filter, apply filters to current movie list
      moviesToFilter = searchResults.length > 0 ? searchResults : trendingMovies;
      const filtered = filterMoviesByUserCriteria(moviesToFilter, filters);
      setFilteredMovies(filtered);
      setHasMore(false); // No more loading when filtering existing results
    }
  };

  // Helper function to filter movies by year and rating
  const filterMoviesByUserCriteria = (movies, filters) => {
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
  };

  // Determine which movies to display
  let moviesToDisplay = [];
  let title = '';

  if (isFiltering) {
    moviesToDisplay = filteredMovies;
    title = 'Filtered Movies';
  } else if (searchResults.length > 0) {
    moviesToDisplay = searchResults;
    title = `Search Results for "${lastSearch}"`;
  } else {
    moviesToDisplay = trendingMovies;
    title = 'Trending Movies';
  }

  if (initialLoad) {
    return (
      <div className="loading-container">
        <div className="ocean-loader">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="ocean-bg">
        <div className="wave-1"></div>
        <div className="wave-2"></div>
        <div className="wave-3"></div>
      </div>
      
      <div className="content">
        <header className="header fade-in">
          <h1 className="welcome-title">
            Welcome to OceansFlixx
            {currentUser?.name && (
              <span className="user-name">, {currentUser.name}!</span>
            )}
          </h1>
          
          {/* Search Bar */}
          <div className="search-wrapper">
            <SearchBar />
          </div>
        </header>
        
        {error && (
          <div className="error-alert slide-in">
            {error}
          </div>
        )}

        {/* Filter Panel */}
        <FilterPanel onApplyFilters={handleApplyFilters} />

        <div className="movies-section fade-in">
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <div className="section-divider"></div>
          </div>
          
          {/* Active Filters Display */}
          {isFiltering && activeFilters && (
            <div className="active-filters">
              {activeFilters.genre && (
                <span>Genre Filter Active • </span>
              )}
              <span>Year: {activeFilters.yearFrom}-{activeFilters.yearTo} • </span>
              <span>Rating: {activeFilters.rating[0]}-{activeFilters.rating[1]}</span>
            </div>
          )}
          
          {/* Movie Grid */}
          {moviesToDisplay.length > 0 ? (
            <>
              <div className="movie-grid">
                {moviesToDisplay.map(movie => (
                  <div className="movie-item fade-in" key={movie.id}>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="load-more-container">
                  <button 
                    className={`load-more-button ${loading ? 'loading' : ''}`}
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="button-loader">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    ) : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results fade-in">
              {isFiltering ? 
                'No movies match your filter criteria. Try adjusting your filters.' : 
                searchResults.length === 0 && lastSearch ? 
                'No results found. Try a different search term.' : 
                'No movies available at the moment. Please try again later.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;