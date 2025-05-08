import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Box, 
  Divider,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useMovie } from '../contexts/MovieContext';

const SearchBar = () => {
  const { searchForMovies, lastSearch, clearSearchResults, loading } = useMovie();
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Initialize search query from lastSearch if it exists
  useEffect(() => {
    if (lastSearch) {
      setSearchQuery(lastSearch);
      // Don't auto-search on component mount, as this causes infinite loading issues
    }
  }, [lastSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocalLoading(true);
      try {
        await searchForMovies(searchQuery);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    clearSearchResults();
  };

  // Use localLoading state to prevent UI issues
  const isLoading = localLoading || loading;

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Paper
        component="form"
        onSubmit={handleSearch}
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          boxShadow: 3
        }}
      >
        <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : <SearchIcon />}
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search for movies..."
          inputProps={{ 'aria-label': 'search movies' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
        {searchQuery && (
          <>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton 
              aria-label="clear search" 
              onClick={handleClear}
              sx={{ p: '10px' }}
              disabled={isLoading}
            >
              <ClearIcon />
            </IconButton>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SearchBar;