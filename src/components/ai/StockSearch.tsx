'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  InputAdornment,
  Fade,
  Popper,
  alpha,
} from '@mui/material';
import type { PopperProps } from '@mui/material/Popper';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface StockQuoteOHLC {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  time: string;
}

export interface StockOption {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

// Top 50 Nifty stocks only (NSE)
export const nifty50Stocks: StockOption[] = [
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'CIPLA', name: 'Cipla Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd", price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Ltd", price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'ITC', name: 'ITC Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'NTPC', name: 'NTPC Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'TITAN', name: 'Titan Company Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'UPL', name: 'UPL Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Ltd', price: 0, change: 0, changePercent: 0, volume: 0, marketCap: '' },
];

interface StockSearchProps {
  onStockSelect: (stock: StockOption | null) => void;
  selectedStock: StockOption | null;
  isLoading?: boolean;
  quoteOHLC?: StockQuoteOHLC | null;
  quoteLoading?: boolean;
}

export const StockSearch: React.FC<StockSearchProps> = ({
  onStockSelect,
  selectedStock,
  isLoading: _isLoading = false,
  quoteOHLC = null,
  quoteLoading = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate API search delay
  useEffect(() => {
    if (inputValue.length > 0) {
      setSearching(true);
      const timer = setTimeout(() => {
        setSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inputValue]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleStockSelect = (event: React.SyntheticEvent, newValue: StockOption | null) => {
    onStockSelect(newValue);
    setOpen(false);
  };

  const _formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            color: isPositive ? 'success.main' : 'error.main',
            fontWeight: 600,
          }}
        >
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </Typography>
      </Box>
    );
  };

  const CustomPopper = (props: PopperProps) => {
    const el = props.anchorEl != null && typeof props.anchorEl === 'object' && 'offsetWidth' in props.anchorEl
      ? (props.anchorEl as HTMLElement)
      : null;
    const width = el?.offsetWidth ?? '100%';
    return (
    <Popper
      {...props}
      placement="bottom"
      style={{ 
        width,
        zIndex: 9999,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      modifiers={[
        {
          name: 'flip',
          enabled: true,
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            boundary: 'viewport',
          },
        },
        {
          name: 'offset',
          enabled: true,
          options: {
            offset: [0, 8],
          },
        },
        {
          name: 'computeStyles',
          enabled: true,
          options: {
            adaptive: true,
            roundOffsets: true,
          },
        },
      ]}
    />
  );
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0, position: 'relative' }}>
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={selectedStock}
        onChange={handleStockSelect}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        options={nifty50Stocks}
        getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
        filterOptions={(options, { inputValue }) => {
          if (!inputValue) return options;
          return options.filter(
            (option) =>
              option.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
              option.name.toLowerCase().includes(inputValue.toLowerCase())
          );
        }}
        loading={searching}
        loadingText="Searching stocks..."
        noOptionsText="No stocks found"
        PopperComponent={CustomPopper}
        ListboxProps={{
          style: {
            maxHeight: '200px',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 0,
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            ref={inputRef}
            placeholder="Search Nifty 50 (e.g. RELIANCE, TCS)"
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, md: 3 },
                minHeight: { xs: 48, md: 56 },
                backgroundColor: theme.palette.mode === 'light' 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
                '&.Mui-focused': {
                  border: `1px solid ${theme.palette.primary.main}`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: '1.5rem',
                    }} 
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searching ? (
                    <CircularProgress size={20} thickness={4} />
                  ) : (
                    params.InputProps.endAdornment
                  )}
                </InputAdornment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box
              component="li"
              key={key}
              {...otherProps}
              sx={{
                py: 1,
                px: 1.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, width: '100%' }}>
                <Chip
                  label={option.symbol}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    height: 16,
                    minWidth: 30,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {option.name}
                </Typography>
              </Box>
            </Box>
          );
        }}
        PaperComponent={({ children, ...other }) => (
          <Paper
            {...other}
            sx={{
              mt: 0.5,
              borderRadius: 1.5,
              background: theme.palette.mode === 'light' 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
              overflow: 'hidden',
              zIndex: 9999,
              position: 'relative',
              maxHeight: 200,
              width: '100%',
              transform: 'none !important',
              left: '50% !important',
              marginLeft: '-50% !important',
              minWidth: '100%',
              '& .MuiAutocomplete-listbox': {
                padding: 0,
                maxHeight: '200px',
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.divider,
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: theme.palette.primary.main,
                },
              },
              '& .MuiAutocomplete-option': {
                padding: 0,
              }
            }}
          >
            {children}
          </Paper>
        )}
      />
      
      {/* Selected Stock Display - Compact with OHLC + Time */}
      {selectedStock && (
        <Fade in={!!selectedStock}>
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              borderRadius: 2,
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <BusinessIcon sx={{ color: theme.palette.primary.main, fontSize: '1.25rem' }} />
              <Typography variant="body1" fontWeight={700} color="text.primary">
                Selected Stock
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: quoteOHLC || quoteLoading ? 1.5 : 0 }}>
              <Chip
                label={selectedStock.symbol}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
              <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontSize: '0.875rem' }}>
                {selectedStock.name}
              </Typography>
              {quoteLoading && (
                <CircularProgress size={18} thickness={4} sx={{ ml: 0.5 }} />
              )}
              {quoteOHLC && !quoteLoading && (
                <>
                  <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ fontSize: '0.9rem' }}>
                    ₹{quoteOHLC.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: (quoteOHLC.change ?? quoteOHLC.close - quoteOHLC.open) >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    >
                      {(() => {
                        const ch = quoteOHLC.change ?? quoteOHLC.close - quoteOHLC.open;
                        const chPct = quoteOHLC.changePercent != null
                          ? quoteOHLC.changePercent
                          : (quoteOHLC.open > 0 ? (quoteOHLC.close - quoteOHLC.open) / quoteOHLC.open * 100 : 0);
                        return (
                          <>
                            {(ch >= 0 ? '+' : '')}{ch.toFixed(2)} (
                            {chPct !== 0 ? (chPct >= 0 ? '+' : '') : ''}{chPct.toFixed(2)}%)
                          </>
                        );
                      })()}
                    </Typography>
                  </Box>
                </>
              )}
              {!quoteOHLC && !quoteLoading && (
                <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ fontSize: '0.9rem' }}>
                  ₹{selectedStock.price.toFixed(2)}
                </Typography>
              )}
              {!quoteOHLC && !quoteLoading && selectedStock && (
                <Typography variant="caption" color="text.secondary">Quote unavailable</Typography>
              )}
            </Box>
            {quoteOHLC && (
              <Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Open</Typography>
                    <Typography variant="body2" fontWeight={600} display="block">
                      ₹{quoteOHLC.open.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">High</Typography>
                    <Typography variant="body2" fontWeight={600} color="success.main" display="block">
                      ₹{quoteOHLC.high.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Low</Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main" display="block">
                      ₹{quoteOHLC.low.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Close</Typography>
                    <Typography variant="body2" fontWeight={600} display="block">
                      ₹{quoteOHLC.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {quoteOHLC.time
                      ? (() => {
                          try {
                            const d = new Date(quoteOHLC.time);
                            return isNaN(d.getTime()) ? quoteOHLC.time : d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
                          } catch {
                            return quoteOHLC.time;
                          }
                        })()
                      : '—'}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
};
