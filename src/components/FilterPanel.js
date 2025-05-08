import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Divider,
  Grid,
  Collapse,
  useTheme,
  Chip,
  Tooltip,
  IconButton,
  Rating,
  OutlinedInput
} from '@mui/material';
import {
  FilterList,
  ExpandMore,
  ExpandLess,
  Info
} from '@mui/icons-material';
import { getGenres } from '../services/api';
import { alpha } from '@mui/material/styles';

const FilterPanel = ({ onApplyFilters }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({
    genre: "",
    yearFrom: 2000,
    yearTo: new Date().getFullYear(),
    rating: [0, 10]
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        setGenres(response.data.genres);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const handleExpandClick = () => setExpanded(!expanded);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      genre: "",
      yearFrom: 2000,
      yearTo: new Date().getFullYear(),
      rating: [0, 10]
    });
  };

  const handleApplyFilters = () => onApplyFilters(filters);

  // Format rating for display
  const formatRating = (value) => {
    return value.toFixed(1);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.paper} 100%)`,
        backdropFilter: 'blur(12px)',
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          cursor: 'pointer',
          background: expanded ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          transition: 'background 0.3s ease',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.05)
          }
        }}
        onClick={handleExpandClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FilterList
            sx={{
              color: theme.palette.primary.main,
              fontSize: 28,
              filter: `drop-shadow(0 0 6px ${alpha(theme.palette.primary.main, 0.4)})`
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Filter & Sort
          </Typography>
        </Box>
        {expanded ? (
          <ExpandLess sx={{ color: theme.palette.primary.light }} />
        ) : (
          <ExpandMore sx={{ color: theme.palette.text.secondary }} />
        )}
      </Box>

      <Collapse in={expanded} timeout={300}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Genre Filter - Improved with Tooltip */}
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>Genre</Typography>
                <Tooltip title="Select a movie genre to filter results">
                  <IconButton size="small">
                    <Info fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <FormControl fullWidth variant="outlined" size="small">
                <Select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <Typography sx={{ color: 'text.secondary' }}>All Genres</Typography>;
                    }
                    const selectedGenre = genres.find(g => g.id === selected);
                    return selectedGenre ? (
                      <Chip 
                        label={selectedGenre.name} 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 500
                        }} 
                      />
                    ) : "All Genres";
                  }}
                  input={
                    <OutlinedInput
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                    />
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Genres</em>
                  </MenuItem>
                  {genres.map((genre) => (
                    <MenuItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Year Range Filter - Improved with better validation */}
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Release Year</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="From"
                  variant="outlined"
                  size="small"
                  value={filters.yearFrom}
                  onChange={(e) => {
                    // Allow direct typing of any value
                    const inputValue = e.target.value;
                    setFilters(prev => ({ ...prev, yearFrom: inputValue }));
                  }}
                  onBlur={() => {
                    // Validate and correct on blur
                    let value = parseInt(filters.yearFrom);
                    if (isNaN(value) || value < 1900) {
                      value = 1900;
                    } else if (value > filters.yearTo) {
                      value = filters.yearTo;
                    }
                    handleFilterChange('yearFrom', value);
                  }}
                  sx={{
                    width: '50%',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      }
                    }
                  }}
                />
                <TextField
                  label="To"
                  variant="outlined"
                  size="small"
                  value={filters.yearTo}
                  onChange={(e) => {
                    // Allow direct typing of any value
                    const inputValue = e.target.value;
                    setFilters(prev => ({ ...prev, yearTo: inputValue }));
                  }}
                  onBlur={() => {
                    // Validate and correct on blur
                    let value = parseInt(filters.yearTo);
                    if (isNaN(value) || value > new Date().getFullYear()) {
                      value = new Date().getFullYear();
                    } else if (value < filters.yearFrom) {
                      value = filters.yearFrom;
                    }
                    handleFilterChange('yearTo', value);
                  }}
                  sx={{
                    width: '50%',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      }
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Rating Slider - Improved with visual rating indicator */}
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mr: 1 }}>Rating</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, mr: 1 }}>
                    {formatRating(filters.rating[0])}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mr: 1 }}>to</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {formatRating(filters.rating[1])}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ px: 1 }}>
                <Slider
                  value={filters.rating}
                  onChange={(e, newValue) => handleFilterChange('rating', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10}
                  step={0.5}
                  valueLabelFormat={formatRating}
                  sx={{
                    color: theme.palette.primary.main,
                    height: 8,
                    '& .MuiSlider-thumb': {
                      width: 20,
                      height: 20,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                      boxShadow: `0 3px 8px ${alpha(theme.palette.primary.main, 0.3)} !important`,
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)} !important`
                      }
                    },
                    '& .MuiSlider-valueLabel': {
                      background: theme.palette.primary.main,
                      borderRadius: 1,
                      fontSize: 12,
                      padding: '2px 4px',
                      top: -6,
                      fontWeight: 700
                    },
                    '& .MuiSlider-track': {
                      height: 8,
                      borderRadius: 4
                    },
                    '& .MuiSlider-rail': {
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    },
                    '& .MuiSlider-mark': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.3),
                      height: 8,
                      width: 2,
                      marginTop: 0
                    },
                    '& .MuiSlider-markLabel': {
                      fontSize: 12,
                      fontWeight: 600,
                      marginTop: 5,
                      color: theme.palette.text.secondary
                    }
                  }}
                />
              </Box>
              
              {/* Improved visual representation of ratings with custom indicators */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, px: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mr: 0.5 
                    }}
                  >
                    Min: 
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5
                  }}>
                    {[...Array(5)].map((_, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 16, 
                          height: 16,
                          borderRadius: '50%',
                          mx: 0.25,
                          backgroundColor: index < filters.rating[0]/2 
                            ? theme.palette.primary.main 
                            : alpha(theme.palette.primary.main, 0.2)
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mr: 0.5 
                    }}
                  >
                    Max: 
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5
                  }}>
                    {[...Array(5)].map((_, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 16, 
                          height: 16,
                          borderRadius: '50%',
                          mx: 0.25,
                          backgroundColor: index < filters.rating[1]/2 
                            ? theme.palette.primary.main 
                            : alpha(theme.palette.primary.main, 0.2)
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5), my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;