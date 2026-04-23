import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <TextField
    variant="outlined"
    size="small"
    value={value}
    onChange={onChange}
    placeholder={placeholder || 'Search...'}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
    }}
    sx={{ minWidth: 220, background: 'white', borderRadius: 2 }}
  />
);

export default SearchBar; 